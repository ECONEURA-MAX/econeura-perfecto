const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } }); // 500MB - Libros grandes para 10 NEURAs
const db = require('../db'); // PostgreSQL version
const logger = require('../services/logger');
const { authMiddleware } = require('../middleware/auth');
const { uploadBuffer, downloadToBuffer } = require('../services/azureBlob');
const { extractPdfText, chunkPages } = require('../services/pdfIngest');
const { libraryUploadLimiter } = require('../middleware/rateLimiter');

// Auth para toda la biblioteca
router.use(authMiddleware);

// Sanitizar nombres de archivo (seguridad)
function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 255);
}

// POST /api/library/upload
router.post('/upload', libraryUploadLimiter, upload.single('file'), async (req, res) => {
  const correlationId = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuario no autenticado', correlationId });
    }
    
    if (!req.file) return res.status(400).json({ error: 'Archivo requerido en campo file', correlationId });
    
    logger.info('Library upload started', { correlationId, userId: req.user.id, filename: req.file.originalname, size: req.file.size });
    const { department = 'GENERAL', neura = 'GENERAL' } = req.body;
    
    // Sanitizar nombre original
    const sanitizedOriginal = sanitizeFilename(req.file.originalname);
    const storedName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${sanitizedOriginal}`;
    
    // Validar MIME type (seguridad)
    if (!req.file.mimetype.includes('pdf')) {
      return res.status(400).json({ error: 'Solo archivos PDF permitidos' });
    }
    
    const { provider, path } = await uploadBuffer(req.file.buffer, storedName, req.file.mimetype);

    const result = await db.query(
      `INSERT INTO documents (user_id, department, neura, original_name, stored_name, mime_type, size_bytes, storage_provider, storage_path)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, created_at`,
      [req.user.id, department, neura, sanitizedOriginal, storedName, req.file.mimetype, req.file.size, provider, path]
    );

    logger.info('Library upload success', { correlationId, documentId: result.rows[0].id, filename: sanitizedOriginal });
    
    res.status(201).json({
      success: true,
      correlationId, // Incluir en respuesta para debugging
      document: { id: result.rows[0].id, original_name: sanitizedOriginal, department, neura, created_at: result.rows[0].created_at }
    });
  } catch (error) {
    logger.error('Library upload error', { correlationId, userId: req.user.id, error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Error subiendo documento', correlationId });
  }
});

// GET /api/library
router.get('/', async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const { department, neura, q } = req.query;
    let sql = `SELECT id, original_name, mime_type, size_bytes, department, neura, created_at FROM documents WHERE user_id = $1`;
    const params = [req.user.id];
    let i = 2;
    if (department) { sql += ` AND department = $${i++}`; params.push(department); }
    if (neura) { sql += ` AND neura = $${i++}`; params.push(neura); }
    // SQLite no tiene ILIKE, usar LOWER() para case-insensitive search
    if (q) { 
      if (process.env.DATABASE_URL) {
        // PostgreSQL
        sql += ` AND original_name ILIKE $${i++}`; 
      } else {
        // SQLite
        sql += ` AND LOWER(original_name) LIKE LOWER($${i++})`; 
      }
      params.push(`%${q}%`); 
    }
    sql += ' ORDER BY created_at DESC';

    const r = await db.query(sql, params);
    res.json({ success: true, total: r.rows.length, documents: r.rows });
  } catch (error) {
    logger.error('Library list error', { error: error.message, stack: error.stack, userId: req.user?.id });
    res.status(500).json({ error: 'Error listando documentos', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

// GET /api/library/:id/download
router.get('/:id/download', async (req, res) => {
  try {
    const r = await db.query(`SELECT original_name, mime_type, storage_provider, storage_path FROM documents WHERE id=$1 AND user_id=$2`, [req.params.id, req.user.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Documento no encontrado' });
    const doc = r.rows[0];
    const buf = await downloadToBuffer(doc.storage_provider, doc.storage_path);
    res.setHeader('Content-Type', doc.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${doc.original_name}"`);
    res.send(buf);
  } catch (error) {
    logger.error('Library download error', { error: error.message });
    res.status(500).json({ error: 'Error descargando documento' });
  }
});

// DELETE /api/library/:id
router.delete('/:id', async (req, res) => {
  try {
    const r = await db.query(`DELETE FROM documents WHERE id=$1 AND user_id=$2 RETURNING id`, [req.params.id, req.user.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Documento no encontrado' });
    res.json({ success: true });
  } catch (error) {
    logger.error('Library delete error', { error: error.message });
    res.status(500).json({ error: 'Error eliminando documento' });
  }
});

module.exports = router;

// === Ingesta y búsqueda ===
router.post('/ingest/:id', async (req, res) => {
  const correlationId = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  try {
    const { id } = req.params;
    logger.info('Library ingest started', { correlationId, documentId: id, userId: req.user.id });
    
    const r = await db.query(`SELECT id, department, neura, storage_provider, storage_path, mime_type, original_name FROM documents WHERE id=$1 AND user_id=$2`, [id, req.user.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Documento no encontrado' });
    const doc = r.rows[0];
    if (!doc.mime_type.includes('pdf')) return res.status(400).json({ error: 'Solo PDF soportado en esta versión' });
    const buf = await downloadToBuffer(doc.storage_provider, doc.storage_path);
    const pages = await extractPdfText(buf);
    const chunks = chunkPages(pages);
    // borrar chunks anteriores
    await db.query('DELETE FROM document_chunks WHERE document_id=$1', [doc.id]);
    // insertar chunks
    for (const c of chunks) {
      await db.query(
        `INSERT INTO document_chunks (document_id, department, neura, page_from, page_to, text)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [doc.id, doc.department, doc.neura, c.page_from, c.page_to, c.text]
      );
    }
    
    logger.info('Library ingest success', { correlationId, documentId: doc.id, chunks: chunks.length, pages: pages.length });
    
    res.json({ success: true, correlationId, chunks: chunks.length, pages: pages.length, document: { id: doc.id, name: doc.original_name } });
  } catch (error) {
    logger.error('Library ingest error', { correlationId, error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Error ingiriendo documento', correlationId });
  }
});

router.get('/search', async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const { q, department, neura, topK = 5 } = req.query;
    if (!q || q.trim().length < 2) return res.status(400).json({ error: 'Parámetro q requerido' });
    
    let sql, params;
    if (process.env.DATABASE_URL) {
      // PostgreSQL con búsqueda full-text
      sql = `SELECT c.id, c.document_id, c.page_from, c.page_to, LEFT(c.text, 500) as preview, d.original_name
             FROM document_chunks c JOIN documents d ON d.id=c.document_id
             WHERE d.user_id=$1 AND to_tsvector('spanish', c.text) @@ plainto_tsquery('spanish', $2)`;
      params = [req.user.id, q];
      let i = 3;
      if (department) { sql += ` AND c.department = $${i++}`; params.push(department); }
      if (neura) { sql += ` AND c.neura = $${i++}`; params.push(neura); }
      sql += ' ORDER BY c.created_at DESC LIMIT ' + Number(topK);
    } else {
      // SQLite con búsqueda simple (FTS no disponible por defecto)
      sql = `SELECT c.id, c.document_id, c.page_from, c.page_to, SUBSTR(c.text, 1, 500) as preview, d.original_name
             FROM document_chunks c JOIN documents d ON d.id=c.document_id
             WHERE d.user_id=$1 AND LOWER(c.text) LIKE LOWER($2)`;
      params = [req.user.id, `%${q}%`];
      let i = 3;
      if (department) { sql += ` AND c.department = $${i++}`; params.push(department); }
      if (neura) { sql += ` AND c.neura = $${i++}`; params.push(neura); }
      sql += ' ORDER BY c.created_at DESC LIMIT ' + Number(topK);
    }
    
    const r = await db.query(sql, params);
    res.json({ success: true, total: r.rows.length, snippets: r.rows.map((row, idx) => ({
      index: idx + 1,
      docId: row.document_id,
      title: row.original_name,
      pages: `${row.page_from}-${row.page_to}`,
      preview: row.preview
    })) });
  } catch (error) {
    logger.error('Library search error', { error: error.message, stack: error.stack, userId: req.user?.id });
    res.status(500).json({ error: 'Error buscando en biblioteca', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});


