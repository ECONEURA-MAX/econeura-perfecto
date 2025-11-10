/**
 * Database Connection Pool - Optimized
 * Configuración optimizada PostgreSQL
 */

const { Pool } = require('pg');
const logger = require('../services/logger');

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  
  // Connection Pool Optimization
  max: process.env.NODE_ENV === 'production' ? 20 : 10,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  
  // SSL for Azure PostgreSQL
  ssl: process.env.DATABASE_URL?.includes('azure') 
    ? { rejectUnauthorized: false }
    : false,
  
  // Query timeout
  statement_timeout: 30000,
  
  // Retry logic
  max_client_conn_tries: 3
};

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  logger.info('[DB] Client connected to pool');
});

pool.on('error', (err) => {
  logger.error('[DB] Pool error', { error: err.message });
});

pool.on('remove', () => {
  logger.debug('[DB] Client removed from pool');
});

module.exports = pool;

