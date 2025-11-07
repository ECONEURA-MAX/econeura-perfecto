/**
 * ECONEURA - Authentication Routes
 * Enterprise-grade OAuth 2.0 + JWT authentication
 */

const express = require('express');
const passport = require('passport');
const router = express.Router();
const logger = require('../services/logger');
const { generateTokenPair, verifyRefreshToken } = require('../services/jwtService');
const { storeRefreshToken, revokeRefreshToken, revokeAllUserTokens } = require('../services/tokenStore');
const { authMiddleware } = require('../middleware/auth');

// Database
const db = process.env.USE_MOCK_DB === 'true'  ? require('../db-mock')  : require('../db');

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token required',
        code: 'NO_REFRESH_TOKEN'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      logger.warn('[Auth] Refresh token verification failed', {
        error: error.message
      });
      return res.status(401).json({
        error: error.message,
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Get user from database
    const user = await db.query(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!user || user.rows.length === 0) {
      logger.warn('[Auth] User not found for refresh token', {
        userId: decoded.userId
      });
      return res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const userData = user.rows[0];

    // Revoke old refresh token
    if (decoded.jti) {
      await revokeRefreshToken(decoded.userId, decoded.jti);
    }

    // Generate new token pair
    const tokens = generateTokenPair(userData.id, {
      email: userData.email,
      name: userData.name,
      role: userData.role
    });

    // Store new refresh token
    const newDecoded = verifyRefreshToken(tokens.refreshToken);
    await storeRefreshToken(userData.id, newDecoded.jti, tokens.expiresIn * 7); // 7 días

    logger.info('[Auth] Tokens refreshed', {
      userId: userData.id,
      email: userData.email
    });

    res.json({
      ...tokens,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role
      }
    });
  } catch (error) {
    logger.error('[Auth] Token refresh error', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Token refresh failed',
      code: 'REFRESH_FAILED'
    });
  }
});

/**
 * POST /api/auth/logout
 * Revoke refresh token
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded && decoded.jti) {
        await revokeRefreshToken(req.user.id, decoded.jti);
      }
    }

    logger.info('[Auth] User logged out', {
      userId: req.user.id,
      email: req.user.email
    });

    res.json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('[Auth] Logout error', {
      userId: req.user.id,
      error: error.message
    });
    res.status(500).json({
      error: 'Logout failed',
      code: 'LOGOUT_FAILED'
    });
  }
});

/**
 * POST /api/auth/logout-all
 * Revoke all user tokens (logout from all devices)
 */
router.post('/logout-all', authMiddleware, async (req, res) => {
  try {
    await revokeAllUserTokens(req.user.id);

    logger.info('[Auth] User logged out from all devices', {
      userId: req.user.id,
      email: req.user.email
    });

    res.json({
      message: 'Logged out from all devices'
    });
  } catch (error) {
    logger.error('[Auth] Logout all error', {
      userId: req.user.id,
      error: error.message
    });
    res.status(500).json({
      error: 'Logout all failed',
      code: 'LOGOUT_ALL_FAILED'
    });
  }
});

/**
 * GET /api/auth/user
 * Get current user info
 */
router.get('/user', authMiddleware, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role
  });
});

// ============================================================================
// OAuth 2.0 Routes (Microsoft, GitHub)
// ============================================================================

/**
 * GET /api/auth/microsoft
 * Initiate Microsoft OAuth flow
 */
router.get('/microsoft', passport.authenticate('microsoft', {
  scope: ['user.read'],
  session: false
}));

/**
 * GET /api/auth/microsoft/callback
 * Microsoft OAuth callback
 */
router.get('/microsoft/callback',
  passport.authenticate('microsoft', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?auth=error&provider=microsoft`,
    session: false 
  }),
  async (req, res) => {
    try {
      logger.info('[Auth] Microsoft OAuth callback initiated', {
        hasUser: !!req.user,
        userId: req.user?.id,
        email: req.user?.email
      });

      // Validar que tenemos usuario
      if (!req.user || !req.user.id || !req.user.email) {
        throw new Error('Usuario no válido desde Microsoft OAuth');
      }

      // Generate token pair
      const tokens = generateTokenPair(req.user.id, {
        email: req.user.email,
        name: req.user.name,
        role: req.user.role || 'user',
        provider: 'microsoft'
      });

      logger.info('[Auth] Tokens generated', { userId: req.user.id });

      // Store refresh token (try, no fail)
      try {
        const decoded = verifyRefreshToken(tokens.refreshToken);
        await storeRefreshToken(req.user.id, decoded.jti, 604800);
        logger.info('[Auth] Refresh token stored');
      } catch (tokenError) {
        logger.warn('[Auth] Could not store refresh token (non-critical)', {
          error: tokenError.message
        });
      }

      logger.info('[Auth] Microsoft OAuth successful', {
        userId: req.user.id,
        email: req.user.email
      });

      // Redirect to frontend with tokens (formato esperado por Login.tsx)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const redirectUrl = `${frontendUrl}/?` +
        `auth=success&` +
        `provider=microsoft&` +
        `token=${tokens.accessToken}&` +
        `email=${encodeURIComponent(req.user.email)}&` +
        `name=${encodeURIComponent(req.user.name)}`;
      
      logger.info('[Auth] Redirecting to frontend', { frontendUrl });
      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('[Auth] Microsoft OAuth callback error', {
        error: error.message,
        stack: error.stack,
        hasUser: !!req.user,
        userDetails: req.user ? { id: req.user.id, email: req.user.email } : null
      });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/?auth=error&provider=microsoft&reason=${encodeURIComponent(error.message)}`);
    }
  }
);

/**
 * GET /api/auth/github
 * Initiate GitHub OAuth flow
 */
router.get('/github', passport.authenticate('github', {
  scope: ['user:email'],
  session: false
}));

/**
 * GET /api/auth/github/callback
 * GitHub OAuth callback
 */
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  async (req, res) => {
    try {
      // Generate token pair
      const tokens = generateTokenPair(req.user.id, {
        email: req.user.email,
        name: req.user.name,
        role: req.user.role || 'user',
        provider: 'github'
      });

      // Store refresh token
      const decoded = verifyRefreshToken(tokens.refreshToken);
      await storeRefreshToken(req.user.id, decoded.jti, 604800); // 7 días

      logger.info('[Auth] GitHub OAuth successful', {
        userId: req.user.id,
        email: req.user.email
      });

      // Redirect to frontend with tokens (formato esperado por Login.tsx)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const redirectUrl = `${frontendUrl}/?` +
        `auth=success&` +
        `provider=github&` +
        `token=${tokens.accessToken}&` +
        `email=${encodeURIComponent(req.user.email)}&` +
        `name=${encodeURIComponent(req.user.name)}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('[Auth] GitHub OAuth callback error', {
        error: error.message,
        stack: error.stack
      });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/?auth=error&provider=github`);
    }
  }
);

module.exports = router;
