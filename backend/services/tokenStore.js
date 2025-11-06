/**
 * ECONEURA - Token Store Service
 * Redis-backed token storage for refresh tokens and blacklist
 */

const logger = require('./logger');

// Redis client (lazy import para evitar circular dependency)
let redisClient = null;
function getRedisClient() {
  if (!redisClient) {
    const { redisClient: client } = require('../config/redis');
    redisClient = client;
  }
  return redisClient;
}

/**
 * Store Refresh Token
 * @param {string} userId - User ID
 * @param {string} jti - JWT ID (from refresh token)
 * @param {number} ttl - Time to live in seconds
 */
async function storeRefreshToken(userId, jti, ttl = 604800) { // 7 días default
  try {
    const client = getRedisClient();
    
    if (!client || !client.isReady) {
      logger.warn('[TokenStore] Redis not available, token not stored (auth still works)');
      return false;
    }

    const key = `refresh_token:${userId}:${jti}`;
    await client.setEx(key, ttl, JSON.stringify({
      userId,
      jti,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ttl * 1000).toISOString()
    }));

    logger.info('[TokenStore] Refresh token stored', {
      userId,
      jti,
      ttl
    });

    return true;
  } catch (error) {
    logger.error('[TokenStore] Error storing refresh token', {
      userId,
      jti,
      error: error.message
    });
    // No lanzar error, auth funciona sin Redis
    return false;
  }
}

/**
 * Verify Refresh Token Exists
 * @param {string} userId - User ID
 * @param {string} jti - JWT ID
 * @returns {boolean} True if token exists
 */
async function verifyRefreshTokenExists(userId, jti) {
  try {
    const client = getRedisClient();
    
    if (!client || !client.isReady) {
      // Si Redis no está disponible, permitir (fail-open para availability)
      logger.warn('[TokenStore] Redis not available, allowing token (fail-open)');
      return true;
    }

    const key = `refresh_token:${userId}:${jti}`;
    const exists = await client.exists(key);

    logger.debug('[TokenStore] Refresh token verification', {
      userId,
      jti,
      exists: exists === 1
    });

    return exists === 1;
  } catch (error) {
    logger.error('[TokenStore] Error verifying refresh token', {
      userId,
      jti,
      error: error.message
    });
    // Fail-open para availability
    return true;
  }
}

/**
 * Revoke Refresh Token
 * @param {string} userId - User ID
 * @param {string} jti - JWT ID
 */
async function revokeRefreshToken(userId, jti) {
  try {
    const client = getRedisClient();
    
    if (!client || !client.isReady) {
      logger.warn('[TokenStore] Redis not available, token not revoked');
      return false;
    }

    const key = `refresh_token:${userId}:${jti}`;
    await client.del(key);

    logger.info('[TokenStore] Refresh token revoked', {
      userId,
      jti
    });

    return true;
  } catch (error) {
    logger.error('[TokenStore] Error revoking refresh token', {
      userId,
      jti,
      error: error.message
    });
    return false;
  }
}

/**
 * Revoke All User Tokens (logout all devices)
 * @param {string} userId - User ID
 */
async function revokeAllUserTokens(userId) {
  try {
    const client = getRedisClient();
    
    if (!client || !client.isReady) {
      logger.warn('[TokenStore] Redis not available, tokens not revoked');
      return false;
    }

    const pattern = `refresh_token:${userId}:*`;
    const keys = await client.keys(pattern);

    if (keys.length === 0) {
      logger.info('[TokenStore] No tokens to revoke', { userId });
      return true;
    }

    await client.del(keys);

    logger.info('[TokenStore] All user tokens revoked', {
      userId,
      count: keys.length
    });

    return true;
  } catch (error) {
    logger.error('[TokenStore] Error revoking all user tokens', {
      userId,
      error: error.message
    });
    return false;
  }
}

/**
 * Blacklist Access Token (for immediate revocation)
 * @param {string} jti - JWT ID
 * @param {number} ttl - Time to live (until token would expire naturally)
 */
async function blacklistToken(jti, ttl) {
  try {
    const client = getRedisClient();
    
    if (!client || !client.isReady) {
      logger.warn('[TokenStore] Redis not available, token not blacklisted');
      return false;
    }

    const key = `blacklist:${jti}`;
    await client.setEx(key, ttl, 'revoked');

    logger.info('[TokenStore] Token blacklisted', {
      jti,
      ttl
    });

    return true;
  } catch (error) {
    logger.error('[TokenStore] Error blacklisting token', {
      jti,
      error: error.message
    });
    return false;
  }
}

/**
 * Check if Token is Blacklisted
 * @param {string} jti - JWT ID
 * @returns {boolean} True if blacklisted
 */
async function isTokenBlacklisted(jti) {
  try {
    const client = getRedisClient();
    
    if (!client || !client.isReady) {
      // Fail-open para availability
      return false;
    }

    const key = `blacklist:${jti}`;
    const exists = await client.exists(key);

    return exists === 1;
  } catch (error) {
    logger.error('[TokenStore] Error checking blacklist', {
      jti,
      error: error.message
    });
    // Fail-open
    return false;
  }
}

/**
 * Cleanup Expired Tokens (maintenance job)
 * Redis lo hace automáticamente con TTL, esto es solo para logging
 */
async function cleanupExpiredTokens() {
  try {
    const client = getRedisClient();
    
    if (!client || !client.isReady) {
      return;
    }

    // Redis TTL maneja esto automáticamente
    logger.info('[TokenStore] Expired tokens cleanup (handled by Redis TTL)');
  } catch (error) {
    logger.error('[TokenStore] Error in cleanup', {
      error: error.message
    });
  }
}

/**
 * Get Token Statistics
 * @returns {object} Stats
 */
async function getTokenStats() {
  try {
    const client = getRedisClient();
    
    if (!client || !client.isReady) {
      return {
        available: false,
        refreshTokens: 0,
        blacklistedTokens: 0
      };
    }

    const refreshKeys = await client.keys('refresh_token:*');
    const blacklistKeys = await client.keys('blacklist:*');

    return {
      available: true,
      refreshTokens: refreshKeys.length,
      blacklistedTokens: blacklistKeys.length
    };
  } catch (error) {
    logger.error('[TokenStore] Error getting stats', {
      error: error.message
    });
    return {
      available: false,
      error: error.message
    };
  }
}

module.exports = {
  storeRefreshToken,
  verifyRefreshTokenExists,
  revokeRefreshToken,
  revokeAllUserTokens,
  blacklistToken,
  isTokenBlacklisted,
  cleanupExpiredTokens,
  getTokenStats
};

