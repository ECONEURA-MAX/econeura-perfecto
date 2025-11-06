/**
 * ECONEURA - Enterprise Rate Limiting
 * Redis-backed distributed rate limiting
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const logger = require('../services/logger');

// Obtener Redis client si está disponible
let redisStore = null;
try {
  const { redisClient } = require('../config/redis');
  if (redisClient && redisClient.isReady) {
    redisStore = new RedisStore({
      client: redisClient,
      prefix: 'rl:',
      sendCommand: (...args) => redisClient.sendCommand(args)
    });
    logger.info('[RateLimit] Using Redis store for distributed rate limiting');
  } else {
    logger.warn('[RateLimit] Redis not available, using memory store (not recommended for production)');
  }
} catch (error) {
  logger.warn('[RateLimit] Redis store initialization failed, using memory store', { error: error.message });
}

// Rate limiter global - 1000 requests per 15 minutes (enterprise tier)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for enterprise usage
  store: redisStore,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('[RateLimit] Global rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      user: req.user?.email
    });
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes'
    });
  }
});

// Rate limiter para chat - 100 requests per minute (enterprise tier)
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  store: redisStore,
  message: {
    error: 'Too many chat requests, please try again later.',
    code: 'CHAT_RATE_LIMIT_EXCEEDED',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('[RateLimit] Chat rate limit exceeded', {
      ip: req.ip,
      user: req.user?.email
    });
    res.status(429).json({
      error: 'Too many chat requests, please try again later.',
      code: 'CHAT_RATE_LIMIT_EXCEEDED',
      retryAfter: '1 minute'
    });
  }
});

// Rate limiter para auth - 10 requests per minute (protección brute force)
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  store: redisStore,
  message: {
    error: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('[RateLimit] Auth rate limit exceeded - possible brute force', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      error: 'Too many authentication attempts, please try again later.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: '1 minute'
    });
  }
});

// Rate limiter para library upload - 20 uploads per hour por usuario (enterprise tier)
const libraryUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  store: redisStore,
  message: {
    error: 'Too many file uploads, please try again later.',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit por usuario autenticado
    return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
  },
  skip: (req) => {
    // Skip rate limit si no hay usuario (ya está bloqueado por auth)
    return !req.user;
  },
  handler: (req, res) => {
    logger.warn('[RateLimit] Upload rate limit exceeded', {
      ip: req.ip,
      user: req.user?.email
    });
    res.status(429).json({
      error: 'Too many file uploads, please try again later.',
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      retryAfter: '1 hour'
    });
  }
});

module.exports = {
  globalLimiter,
  chatLimiter,
  authLimiter,
  libraryUploadLimiter
};
