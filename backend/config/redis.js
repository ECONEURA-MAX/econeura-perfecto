/**
 * Redis configuration - Mock para desarrollo, real para producción
 * Usado por middleware/rateLimiter.js
 */

const logger = require('../services/logger');

let client;
let isReady = false;
let isMock = true;

// Si USE_MOCK_DB=true o no hay REDIS_URL, usar mock (sin retry)
if (process.env.USE_MOCK_DB === 'true' || !process.env.REDIS_URL) {
  // Mock client compatible con ioredis interface (SIN eventos que loguean)
  client = {
    on() { return this; }, // No-op events (evita logs spam)
    off() { return this; },
    removeAllListeners() { return this; },
    async get(key) {
      return null;
    },
    
    async set(key, value, ...args) {
      return 'OK';
    },
    
    async del(key) {
      return 1;
    },
    
    async incr(key) {
      return 1;
    },
    
    async expire(key, seconds) {
      return 1;
    },
    
    async ttl(key) {
      return -1;
    },
    
    async exists(key) {
      return 0;
    },
    
    async setex(key, seconds, value) {
      return 'OK';
    },
    
    async hget(key, field) {
      return null;
    },
    
    async hset(key, field, value) {
      return 1;
    },
    
    async hdel(key, ...fields) {
      return fields.length;
    }
  };
  
  isReady = true;
  isMock = true;
  logger.info('[Redis] Using mock client (USE_MOCK_DB=true or no REDIS_URL)');
} else {
  // Redis real para producción
  try {
    const Redis = require('ioredis');
    
    client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      }
    });
    
    client.on('connect', () => {
      isReady = true;
      isMock = false;
      logger.info('[Redis] Connected to real Redis instance');
    });
    
    client.on('error', (err) => {
      logger.error('[Redis] Error', { error: err.message });
    });
    
    client.on('close', () => {
      isReady = false;
      logger.warn('[Redis] Connection closed');
    });
  } catch (error) {
    logger.error('[Redis] Failed to initialize, falling back to mock', { error: error.message });
    
    // Fallback a mock si falla
    client = {
      async get() { return null; },
      async set() { return 'OK'; },
      async del() { return 1; },
      async incr() { return 1; },
      async expire() { return 1; },
      async ttl() { return -1; },
      async exists() { return 0; },
      async setex() { return 'OK'; },
      async hget() { return null; },
      async hset() { return 1; },
      async hdel() { return 1; }
    };
    
    isReady = true;
    isMock = true;
  }
}

module.exports = {
  client,
  isReady,
  isMock
};

