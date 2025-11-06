/**
 * ECONEURA - JWT Authentication Service
 * Enterprise-grade JWT token management
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('./logger');

// JWT Configuration (read at runtime for testability)
function getAccessTokenSecret() {
  return process.env.JWT_ACCESS_SECRET || crypto.randomBytes(64).toString('hex');
}

function getRefreshTokenSecret() {
  return process.env.JWT_REFRESH_SECRET || crypto.randomBytes(64).toString('hex');
}

function getAccessTokenExpiry() {
  return process.env.JWT_ACCESS_EXPIRY || '15m';
}

function getRefreshTokenExpiry() {
  return process.env.JWT_REFRESH_EXPIRY || '7d';
}

/**
 * Generate Access Token
 * @param {string} userId - User ID
 * @param {object} claims - Additional claims (email, name, roles, etc)
 * @returns {string} JWT access token
 */
function generateAccessToken(userId, claims = {}) {
  try {
    const payload = {
      userId,
      type: 'access',
      ...claims
    };

    const token = jwt.sign(payload, getAccessTokenSecret(), {
      expiresIn: getAccessTokenExpiry(),
      issuer: 'econeura',
      audience: 'econeura-api'
    });

    logger.info('[JWT] Access token generated', {
      userId,
      expiresIn: getAccessTokenExpiry()
    });

    return token;
  } catch (error) {
    logger.error('[JWT] Error generating access token', {
      userId,
      error: error.message
    });
    throw new Error('Failed to generate access token');
  }
}

/**
 * Generate Refresh Token
 * @param {string} userId - User ID
 * @returns {string} JWT refresh token
 */
function generateRefreshToken(userId) {
  try {
    const payload = {
      userId,
      type: 'refresh',
      jti: crypto.randomBytes(16).toString('hex') // JWT ID para revocación
    };

    const token = jwt.sign(payload, getRefreshTokenSecret(), {
      expiresIn: getRefreshTokenExpiry(),
      issuer: 'econeura',
      audience: 'econeura-api'
    });

    logger.info('[JWT] Refresh token generated', {
      userId,
      jti: payload.jti,
      expiresIn: getRefreshTokenExpiry()
    });

    return token;
  } catch (error) {
    logger.error('[JWT] Error generating refresh token', {
      userId,
      error: error.message
    });
    throw new Error('Failed to generate refresh token');
  }
}

/**
 * Generate Token Pair (Access + Refresh)
 * @param {string} userId - User ID
 * @param {object} claims - Additional claims
 * @returns {object} { accessToken, refreshToken, expiresIn }
 */
function generateTokenPair(userId, claims = {}) {
  const accessToken = generateAccessToken(userId, claims);
  const refreshToken = generateRefreshToken(userId);

  // Calcular expiry en segundos
  const expiresIn = parseExpiry(getAccessTokenExpiry());

  return {
    accessToken,
    refreshToken,
    expiresIn,
    tokenType: 'Bearer'
  };
}

/**
 * Verify Access Token
 * @param {string} token - JWT token
 * @returns {object} Decoded payload
 * @throws {Error} If token is invalid
 */
function verifyAccessToken(token) {
  try {
    // First decode without verification to check type
    const decoded = jwt.decode(token);
    if (decoded && decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    // Now verify with proper secret
    const verified = jwt.verify(token, getAccessTokenSecret(), {
      issuer: 'econeura',
      audience: 'econeura-api'
    });

    return verified;
  } catch (error) {
    logger.warn('[JWT] Access token verification failed', {
      error: error.message
    });

    // Re-throw custom errors (like "Invalid token type")
    if (error.message === 'Invalid token type') {
      throw error;
    }

    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
}

/**
 * Verify Refresh Token
 * @param {string} token - JWT refresh token
 * @returns {object} Decoded payload
 * @throws {Error} If token is invalid
 */
function verifyRefreshToken(token) {
  try {
    // First decode without verification to check type
    const decoded = jwt.decode(token);
    if (decoded && decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Now verify with proper secret
    const verified = jwt.verify(token, getRefreshTokenSecret(), {
      issuer: 'econeura',
      audience: 'econeura-api'
    });

    return verified;
  } catch (error) {
    logger.warn('[JWT] Refresh token verification failed', {
      error: error.message
    });

    // Re-throw custom errors (like "Invalid token type")
    if (error.message === 'Invalid token type') {
      throw error;
    }

    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Refresh token verification failed');
    }
  }
}

/**
 * Decode Token (without verification)
 * @param {string} token - JWT token
 * @returns {object} Decoded payload
 */
function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.warn('[JWT] Token decode failed', { error: error.message });
    return null;
  }
}

/**
 * Extract Token from Authorization Header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null
 */
function extractToken(authHeader) {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Parse expiry string to seconds
 * @param {string} expiry - Expiry string (e.g., '15m', '7d', '1h')
 * @returns {number} Seconds
 */
function parseExpiry(expiry) {
  const units = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400
  };

  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 900; // Default 15 minutes
  }

  const [, value, unit] = match;
  return parseInt(value) * units[unit];
}

/**
 * Get Token Expiration Date
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date or null
 */
function getTokenExpiration(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }
  return new Date(decoded.exp * 1000);
}

/**
 * Check if Token is Expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired
 */
function isTokenExpired(token) {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return true;
  }
  return expiration < new Date();
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  extractToken,
  getTokenExpiration,
  isTokenExpired,
  
  // Constants for testing
  ACCESS_TOKEN_EXPIRY: getAccessTokenExpiry(),
  REFRESH_TOKEN_EXPIRY: getRefreshTokenExpiry()
};

