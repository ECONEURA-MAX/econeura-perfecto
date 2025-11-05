/**
 * ECONEURA - Database Configuration
 * PostgreSQL + Redis + Connection Pooling
 * Build trigger: Force Oryx Build with dependencies
 */

const { Pool } = require('pg');
const logger = require('../services/logger');

// Redis opcional - no matar si no está instalado
let Redis = null;
try {
  Redis = require('ioredis');
} catch (error) {
  logger.warn('ioredis no instalado - Redis deshabilitado');
}

// ============================================
// POSTGRESQL CONFIGURATION
// ============================================

const isProduction = process.env.NODE_ENV === 'production';
const useSQLite = false; // ALWAYS use PostgreSQL - SQLite removed

let pgPool = null;

/**
 * Inicializar PostgreSQL Pool
 */
function initializePostgreSQL() {
  if (useSQLite) {
    logger.info('Usando SQLite (desarrollo)');
    return null;
  }

  const config = {
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    // Connection pool settings
    max: 20, // Maximum number of clients
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 5000, // Return error after 5 seconds if no connection available
    // Statement timeout
    statement_timeout: 10000, // 10 seconds
    // Query timeout
    query_timeout: 10000
  };

  pgPool = new Pool(config);

  // Event handlers
  pgPool.on('connect', () => {
    logger.info('PostgreSQL client connected');
  });

  pgPool.on('error', (err) => {
    logger.error('PostgreSQL pool error', { error: err.message, stack: err.stack });
  });

  pgPool.on('remove', () => {
    logger.info('PostgreSQL client removed from pool');
  });

  logger.info('PostgreSQL Pool inicializado');
  return pgPool;
}

/**
 * Obtener cliente PostgreSQL del pool
 */
async function getPostgreSQLClient() {
  if (!pgPool) {
    throw new Error('PostgreSQL pool no inicializado');
  }
  return await pgPool.connect();
}

/**
 * Ejecutar query con retry
 */
async function queryPostgreSQL(text, params, retries = 3) {
  if (useSQLite) {
    throw new Error('PostgreSQL no disponible, usando SQLite');
  }

  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      const result = await pgPool.query(text, params);
      return result;
    } catch (error) {
      lastError = error;
      // Log error pero no usar console - logging estructurado se maneja en el servicio
      
      // Si es error de conexión, reintentar
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      
      // Otros errores, lanzar inmediatamente
      throw error;
    }
  }
  
  throw lastError;
}

/**
 * Cerrar pool PostgreSQL
 */
async function closePostgreSQL() {
  if (pgPool) {
    await pgPool.end();
    logger.info('PostgreSQL pool closed');
  }
}

// ============================================
// REDIS CONFIGURATION
// ============================================

let redisClient = null;

/**
 * Inicializar Redis
 */
function initializeRedis() {
  // Si ioredis no está instalado, retornar null
  if (!Redis) {
    logger.warn('Redis no disponible (ioredis no instalado)');
    return null;
  }
  
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    logger.warn('Redis no configurado (REDIS_URL no definido)');
    return null;
  }

  const config = {
    // Connection
    retryStrategy: (times) => {
      // ✅ LIMITAR REINTENTOS A 10 VECES
      if (times > 10) {
        logger.error('Redis: Máximo de reintentos alcanzado');
        return null; // Detener reintentos
      }
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    // TLS for Azure Redis
    tls: isProduction ? { rejectUnauthorized: false } : undefined,
    // Timeouts
    connectTimeout: 10000,
    commandTimeout: 5000,
    // Keepalive
    keepAlive: 30000,
    // ✅ NO BLOQUEAR SI REDIS NO ESTÁ DISPONIBLE
    lazyConnect: true,
    enableOfflineQueue: false
  };

  try {
    redisClient = new Redis(redisUrl, config);

    redisClient.on('connect', () => {
      logger.info('Redis conectado');
    });

    redisClient.on('ready', () => {
      logger.info('Redis listo para recibir comandos');
    });

    redisClient.on('error', (err) => {
      // ✅ NO LOGGEAR INFINITAMENTE - Solo primera vez
      if (!redisClient._hasLoggedError) {
        logger.error('Redis error (cache deshabilitado)', { error: err.message });
        redisClient._hasLoggedError = true;
      }
    });

    redisClient.on('close', () => {
      if (!redisClient._hasLoggedClose) {
        logger.info('Redis conexión cerrada (funcionando sin cache)');
        redisClient._hasLoggedClose = true;
      }
    });

    redisClient.on('reconnecting', () => {
      // ✅ NO LOGGEAR INFINITAMENTE
      if (!redisClient._hasLoggedReconnect) {
        logger.info('Redis reconectando (1 intento)...');
        redisClient._hasLoggedReconnect = true;
      }
    });

    // ✅ CONECTAR CON TIMEOUT - No bloquear
    redisClient.connect().catch((err) => {
      logger.warn('Redis no disponible - continuando sin cache', { error: err.message });
    });

    return redisClient;
  } catch (error) {
    logger.error('Error al inicializar Redis - continuando sin cache', { error: error.message });
    return null;
  }
}

/**
 * Obtener cliente Redis
 */
function getRedisClient() {
  return redisClient;
}

/**
 * Cache helper con TTL
 */
async function cacheGet(key) {
  if (!redisClient || redisClient.status !== 'ready') {
    return null;
  }
  
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Redis get error', { key, error: error.message });
    return null;
  }
}

/**
 * Cache set con TTL (segundos)
 */
async function cacheSet(key, value, ttl = 300) {
  if (!redisClient || redisClient.status !== 'ready') {
    return false;
  }
  
  try {
    await redisClient.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error('Redis set error', { key, ttl, error: error.message });
    return false;
  }
}

/**
 * Cache delete
 */
async function cacheDelete(key) {
  if (!redisClient || redisClient.status !== 'ready') {
    return false;
  }
  
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error('Redis delete error', { key, error: error.message });
    return false;
  }
}

/**
 * Cerrar Redis
 */
async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis closed');
  }
}

// ============================================
// HEALTH CHECKS
// ============================================

/**
 * Health check PostgreSQL
 */
async function checkPostgreSQLHealth() {
  if (useSQLite) {
    return { status: 'ok', message: 'Using SQLite' };
  }
  
  if (!pgPool) {
    return { status: 'error', message: 'Pool not initialized' };
  }
  
  try {
    const result = await pgPool.query('SELECT NOW()');
    return { 
      status: 'ok', 
      message: 'Connected',
      timestamp: result.rows[0].now,
      pool: {
        total: pgPool.totalCount,
        idle: pgPool.idleCount,
        waiting: pgPool.waitingCount
      }
    };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

/**
 * Health check Redis
 */
async function checkRedisHealth() {
  if (!redisClient) {
    return { status: 'not_configured', message: 'Redis not configured' };
  }
  
  try {
    const pong = await redisClient.ping();
    return {
      status: 'ok',
      message: 'Connected',
      response: pong,
      mode: redisClient.mode
    };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

/**
 * Cerrar todas las conexiones
 */
async function closeAllConnections() {
  logger.info('Cerrando todas las conexiones de base de datos...');
  await Promise.all([
    closePostgreSQL(),
    closeRedis()
  ]);
  logger.info('Todas las conexiones cerradas');
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM recibido, cerrando conexiones...');
  await closeAllConnections();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT recibido, cerrando conexiones...');
  await closeAllConnections();
  process.exit(0);
});

module.exports = {
  // PostgreSQL
  initializePostgreSQL,
  getPostgreSQLClient,
  queryPostgreSQL,
  closePostgreSQL,
  checkPostgreSQLHealth,
  // Redis
  initializeRedis,
  getRedisClient,
  cacheGet,
  cacheSet,
  cacheDelete,
  closeRedis,
  checkRedisHealth,
  // Shutdown
  closeAllConnections,
  // Utils
  usingSQLite: useSQLite
};

