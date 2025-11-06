/**
 * ECONEURA - Auth Middleware (JWT version)
 * Enterprise-grade authentication middleware with JWT
 */

const logger = require('../services/logger');
const { verifyAccessToken, extractToken } = require('../services/jwtService');
const { isTokenBlacklisted } = require('../services/tokenStore');

/**
 * Authentication Middleware (JWT)
 * Verifies JWT access token and attaches user to request
 */
async function authMiddleware(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      logger.warn('[Auth] No token provided', {
        path: req.path,
        ip: req.ip
      });
      return res.status(401).json({
        error: 'Authentication required',
        code: 'NO_TOKEN'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      logger.warn('[Auth] Token verification failed', {
        error: error.message,
        path: req.path,
        ip: req.ip
      });
      
      return res.status(401).json({
        error: error.message,
        code: error.message === 'Token expired' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
      });
    }

    // Check if token is blacklisted (revoked)
    if (decoded.jti) {
      const blacklisted = await isTokenBlacklisted(decoded.jti);
      if (blacklisted) {
        logger.warn('[Auth] Token is blacklisted', {
          jti: decoded.jti,
          userId: decoded.userId,
          path: req.path
        });
        return res.status(401).json({
          error: 'Token has been revoked',
          code: 'TOKEN_REVOKED'
        });
      }
    }

    // Attach user to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role || 'user'
    };

    logger.debug('[Auth] User authenticated', {
      userId: req.user.id,
      email: req.user.email,
      path: req.path
    });

    next();
  } catch (error) {
    logger.error('[Auth] Authentication error', {
      error: error.message,
      path: req.path,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Internal authentication error',
      code: 'AUTH_ERROR'
    });
  }
}

/**
 * Optional Authentication Middleware
 * Attaches user if token is valid, but doesn't fail if missing
 */
async function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      // No token, continue without user
      return next();
    }

    // Try to verify token
    try {
      const decoded = verifyAccessToken(token);
      
      // Check blacklist
      if (decoded.jti) {
        const blacklisted = await isTokenBlacklisted(decoded.jti);
        if (blacklisted) {
          return next();
        }
      }

      // Attach user
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role || 'user'
      };

      logger.debug('[Auth] Optional auth: User authenticated', {
        userId: req.user.id
      });
    } catch (error) {
      // Token invalid, continue without user
      logger.debug('[Auth] Optional auth: Token invalid, continuing without user');
    }

    next();
  } catch (error) {
    logger.error('[Auth] Optional auth error', {
      error: error.message
    });
    // Don't fail, continue without user
    next();
  }
}

/**
 * Role-based Authorization Middleware
 * @param {string[]} allowedRoles - Array of allowed roles
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('[Auth] Authorization failed: No user', {
        path: req.path
      });
      return res.status(401).json({
        error: 'Authentication required',
        code: 'NO_AUTH'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('[Auth] Authorization failed: Insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path
      });
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        requiredRoles: allowedRoles
      });
    }

    next();
  };
}

/**
 * Middleware para verificar rol de administrador
 */
function requireAdmin(req, res, next) {
  return requireRole('admin')(req, res, next);
}

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  requireRole,
  requireAdmin
};
