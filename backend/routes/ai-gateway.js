const express = require('express');
const router = express.Router();

// Middleware para obtener AI Gateway desde app.locals
const getAIGateway = (req, res, next) => {
  req.aiGateway = req.app.locals.aiGateway;
  next();
};

// GET /api/ai-gateway/metrics - Métricas del AI Gateway
router.get('/metrics', getAIGateway, (req, res) => {
  try {
    const metrics = req.aiGateway.getMetrics();
    
    res.status(200).json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const logger = require('../services/logger');
    logger.error('Error obteniendo métricas AI Gateway', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Error obteniendo métricas del AI Gateway',
      details: error.message
    });
  }
});

// GET /api/ai-gateway/health - Health check específico del AI Gateway
router.get('/health', getAIGateway, (req, res) => {
  try {
    const metrics = req.aiGateway.getMetrics();
    const healthyProviders = metrics.providers.filter(p => p.state === 'CLOSED').length;
    const totalProviders = metrics.providers.length;
    
    const healthStatus = healthyProviders > 0 ? 'healthy' : 'degraded';
    
    res.status(200).json({
      status: healthStatus,
      healthyProviders,
      totalProviders,
      providers: metrics.providers.map(p => ({
        name: p.name,
        state: p.state,
        failures: p.failures
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const logger = require('../services/logger');
    logger.error('Error en health check AI Gateway', { error: error.message, stack: error.stack });
    res.status(500).json({
      status: 'error',
      error: 'Error en health check del AI Gateway',
      details: error.message
    });
  }
});

// POST /api/ai-gateway/reset-circuit-breaker - Reset manual de circuit breaker
router.post('/reset-circuit-breaker/:provider', getAIGateway, (req, res) => {
  try {
    const { provider } = req.params;
    
    if (!req.aiGateway.circuitBreakers[provider]) {
      return res.status(404).json({
        success: false,
        error: `Provider ${provider} no encontrado`
      });
    }
    
    req.aiGateway.resetCircuitBreaker(provider);
    
    res.status(200).json({
      success: true,
      message: `Circuit breaker reseteado para ${provider}`,
      provider,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error reseteando circuit breaker:', error);
    res.status(500).json({
      success: false,
      error: 'Error reseteando circuit breaker',
      details: error.message
    });
  }
});

// POST /api/ai-gateway - Chat principal (alias de /test)
router.post('/', getAIGateway, async (req, res) => {
  const logger = require('../services/logger');
  try {
    const { prompt, neuraId = 0, context = {} } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      logger.error('AI Gateway - Invalid prompt', { prompt, body: req.body });
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid prompt: must be a non-empty string' 
      });
    }
    
    logger.info('AI Gateway - Chat request', { 
      neuraId, 
      promptLength: prompt.length,
      contextKeys: Object.keys(context)
    });
    
    const result = await req.aiGateway.getChatCompletion(prompt, {
      neuraId: parseInt(neuraId),
      temperature: 0.7,
      maxTokens: 1500,
      context
    });
    
    logger.info('AI Gateway - Success', { 
      tokens: result.tokens,
      provider: result.provider
    });
    
    res.json({
      success: true,
      data: {
        output: result.output,
        provider: result.provider,
        model: result.model || 'mistral-medium-3.1',
        tokens: result.tokens,
        cost: result.cost
      }
    });
  } catch (error) {
    logger.error('AI Gateway error', { 
      error: error.message, 
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error'
    });
  }
});

// POST /api/ai-gateway/test - Test de AI Gateway (version completa)
// Autenticación opcional - solo necesaria si useLibrary es true
router.post('/test', getAIGateway, async (req, res, next) => {
  // Intentar autenticar si hay token, pero no bloquear si no hay
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const { authMiddleware } = require('../middleware/auth');
      await new Promise((resolve, reject) => {
        authMiddleware(req, res, (err) => {
          if (err) reject(err);
          else resolve(null);
        });
      });
    } catch (error) {
      // Si falla auth, continuar sin usuario (solo biblioteca no funcionará)
      req.user = null;
    }
  }
  next();
}, async (req, res) => {
  try {
    const {
      prompt = 'Hola, ¿cómo estás?',
      neuraId = 0,
      context = {},
      useLibrary = true,
      library = {}, // { department, neura, topK }
      useInternet = false
    } = req.body;
    
    // Logger estructurado
    const logger = require('../services/logger');
    
    // Log del contexto recibido para debugging
    logger.info('AI Gateway Test - Request recibido', {
      neuraId,
      contextKeys: Object.keys(context),
      promptLength: prompt.length,
      hasImage: !!context.image
    });
    
    // RAG: buscar en NEURA Library y enriquecer contexto con citas
    let references = [];
    if (useLibrary && req.user) {
      try {
        // const db = require('../db'); // SQLite removed - usar pgPool
        const { department, neura, topK = 5 } = library || {};

        const q = (prompt || '').trim().slice(0, 256);
        if (q && q.length >= 2) {
          const userId = req.user?.id || req.user?.userId;
          if (userId) {
            let sql, params;
            
            if (process.env.DATABASE_URL) {
              // PostgreSQL
              sql = `SELECT c.id, c.document_id, c.page_from, c.page_to, LEFT(c.text, 800) as preview, d.original_name
                     FROM document_chunks c JOIN documents d ON d.id=c.document_id
                     WHERE d.user_id=$1 AND to_tsvector('spanish', c.text) @@ plainto_tsquery('spanish', $2)`;
              params = [userId, q];
            } else {
              // SQLite
              sql = `SELECT c.id, c.document_id, c.page_from, c.page_to, SUBSTR(c.text, 1, 800) as preview, d.original_name
                     FROM document_chunks c JOIN documents d ON d.id=c.document_id
                     WHERE d.user_id=$1 AND LOWER(c.text) LIKE LOWER($2)`;
              params = [userId, `%${q}%`];
            }
            
            let i = params.length + 1;
            if (department) { sql += ` AND c.department = $${i++}`; params.push(department); }
            if (neura) { sql += ` AND c.neura = $${i++}`; params.push(neura); }
            sql += ' ORDER BY c.created_at DESC LIMIT ' + Number(topK);

            const r = await db.query(sql, params);
            references = (r.rows || []).map((row, idx) => ({
              index: idx + 1,
              docId: row.document_id,
              title: row.original_name,
              pages: `${row.page_from}-${row.page_to}`,
              preview: row.preview
            }));

            if (references.length > 0) {
              const joined = references
                .map(ref => `(${ref.index}) ${ref.title} [p. ${ref.pages}]\n${ref.preview}`)
                .join('\n\n');
              context.systemNotes = `${context.systemNotes || ''}\n\nUtiliza las siguientes fuentes del usuario. Cita como [n] al final de cada párrafo relevante y devuelve un bloque Referencias con (n) Título (páginas).`;
              context.conversationHistory = `${context.conversationHistory || ''}\n\n[Fuentes de la biblioteca del usuario]\n${joined}`.trim();
            }
          } else {
            logger.warn('Usuario no autenticado, saltando búsqueda en biblioteca');
          }
        } else {
          logger.warn('Query demasiado corto para búsqueda en biblioteca');
        }
      } catch (e) {
        logger.warn('RAG library enrichment failed', { error: e.message });
        // Continuar sin RAG
      }
    }

    // Búsqueda en internet si está habilitada (rápida, no bloquea)
    let internetResults = null;
    if (useInternet === true) {
      try {
        const axios = require('axios');
        const searchQuery = encodeURIComponent(prompt.slice(0, 100));
        const searchUrl = `https://api.duckduckgo.com/?q=${searchQuery}&format=json&no_html=1&skip_disambig=1`;
        
        // Timeout corto para no bloquear
        const searchResponse = await Promise.race([
          axios.get(searchUrl),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
        ]);
        
        if (searchResponse.data && searchResponse.data.AbstractText) {
          internetResults = {
            abstract: searchResponse.data.AbstractText,
            source: searchResponse.data.AbstractURL || 'DuckDuckGo',
            title: searchResponse.data.Heading || 'Resultado de búsqueda'
          };
          context.systemNotes = `${context.systemNotes || ''}\n\nInformación de internet disponible: ${internetResults.abstract.substring(0, 200)}`;
          logger.info('Internet search successful', { query: prompt.slice(0, 50) });
        }
      } catch (internetError) {
        logger.warn('Internet search failed (continuing without it)', { error: internetError.message });
        // Continuar sin internet - no es crítico
      }
    }

    const result = await req.aiGateway.getChatCompletion(prompt, {
      neuraId: parseInt(neuraId),
      temperature: 0.7,
      maxTokens: 500, // Aumentar tokens para respuestas más completas
      context: context // Pasar contexto al AI Gateway
    });
    
    res.status(200).json({
      success: true,
      data: {
        output: result.output,
        provider: result.provider,
        tokens: result.tokens,
        cost: result.cost,
        duration: result.duration,
        references, // citas RAG devueltas al frontend
        internetResults, // resultados de búsqueda en internet
        timestamp: result.timestamp
      }
    });
  } catch (error) {
    const logger = require('../services/logger');
    logger.error('Error en test AI Gateway', {
      error: error.message,
      stack: error.stack,
      neuraId: req.body?.neuraId
    });
    
    // Sanitizar mensaje de error en producción
    const errorDetails = process.env.NODE_ENV === 'production' 
      ? 'Internal server error. Please check logs.' 
      : error.message;
    
    res.status(500).json({
      success: false,
      error: 'Error en test del AI Gateway',
      details: errorDetails,
      code: 'AI_GATEWAY_ERROR'
    });
  }
});

module.exports = router;
