/**
 * ECONEURA - Database Wrapper (PostgreSQL)
 * Reemplaza SQLite con PostgreSQL manteniendo compatibilidad de API
 */

const { Pool } = require('pg');
const logger = require('./services/logger');

let pool = null;

/**
 * Inicializar pool PostgreSQL
 */
function initializePool() {
  if (pool) return pool;
  
  if (!process.env.DATABASE_URL) {
    logger.warn('DATABASE_URL not configured - database operations will fail');
    return null;
  }
  
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: process.env.USE_MOCK_DB === 'true' ? 1 : 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  });
  
  pool.on('error', (err) => {
    logger.error('PostgreSQL pool error', { error: err.message });
  });
  
  return pool;
}

/**
 * Query genérico (compatible con SQLite API)
 */
async function query(text, params = []) {
  const client = initializePool();
  if (!client) throw new Error('Database not configured');
  
  try {
    const result = await client.query(text, params);
    return result.rows;
  } catch (error) {
    logger.error('Database query error', { error: error.message, query: text });
    throw error;
  }
}

/**
 * Get single row (compatible con db.get de SQLite)
 */
async function get(text, params = []) {
  const rows = await query(text, params);
  return rows[0] || null;
}

/**
 * Get all rows (compatible con db.all de SQLite)
 */
async function all(text, params = []) {
  return await query(text, params);
}

/**
 * Run query (compatible con db.run de SQLite)
 * Retorna { lastID, changes }
 */
async function run(text, params = []) {
  const client = initializePool();
  if (!client) throw new Error('Database not configured');
  
  try {
    const result = await client.query(text + ' RETURNING id', params);
    return {
      lastID: result.rows[0]?.id || null,
      changes: result.rowCount || 0
    };
  } catch (error) {
    // Si no tiene RETURNING, ejecutar sin él
    try {
      const result = await client.query(text, params);
      return {
        lastID: null,
        changes: result.rowCount || 0
      };
    } catch (err) {
      logger.error('Database run error', { error: err.message, query: text });
      throw err;
    }
  }
}

/**
 * Funciones específicas de auth (de auth-simple.js)
 */
async function getUserByEmail(email) {
  return await get('SELECT * FROM users WHERE email = $1', [email]);
}

async function createUser(email, hashedPassword, name = '', role = 'user') {
  const result = await pool.query(
    'INSERT INTO users (email, password, name, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
    [email, hashedPassword, name, role]
  );
  return result.rows[0];
}

async function getUserById(id) {
  return await get('SELECT * FROM users WHERE id = $1', [id]);
}

/**
 * Cerrar pool
 */
async function close() {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('PostgreSQL pool closed');
  }
}

module.exports = {
  query,
  get,
  all,
  run,
  getUserByEmail,
  createUser,
  getUserById,
  close
};

