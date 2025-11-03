const express = require('express');
const passport = require('passport');
const router = express.Router();
const loginRouter = require('../api/auth/login');
const jwt = require('jsonwebtoken');
const keyVaultService = require('../services/keyVaultService');
const logger = require('../services/logger');

// Middleware para verificar autenticación
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'No autenticado' });
};

// Rutas de autenticación Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Generar JWT token
      const jwtSecret = await keyVaultService.getJWTSecret();
      const token = jwt.sign(
        { userId: req.user.id, email: req.user.email },
        jwtSecret,
        { expiresIn: '7d' }
      );
      
      // Redirigir con token en URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}?auth=success&provider=google&token=${token}&email=${encodeURIComponent(req.user.email)}&name=${encodeURIComponent(req.user.name)}`);
    } catch (error) {
      logger.error('Google OAuth callback error:', error);
      res.redirect((process.env.FRONTEND_URL || 'http://localhost:5173') + '?auth=error');
    }
  }
);

// Rutas de autenticación Microsoft
router.get('/microsoft', passport.authenticate('microsoft', { scope: ['user.read'] }));

router.get('/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Generar JWT token
      const jwtSecret = await keyVaultService.getJWTSecret();
      const token = jwt.sign(
        { userId: req.user.id, email: req.user.email },
        jwtSecret,
        { expiresIn: '7d' }
      );
      
      // Redirigir con token en URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}?auth=success&provider=microsoft&token=${token}&email=${encodeURIComponent(req.user.email)}&name=${encodeURIComponent(req.user.name)}`);
    } catch (error) {
      logger.error('Microsoft OAuth callback error:', error);
      res.redirect((process.env.FRONTEND_URL || 'http://localhost:5173') + '?auth=error');
    }
  }
);

// Rutas de autenticación GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Generar JWT token
      const jwtSecret = await keyVaultService.getJWTSecret();
      const token = jwt.sign(
        { userId: req.user.id, email: req.user.email },
        jwtSecret,
        { expiresIn: '7d' }
      );
      
      // Redirigir con token en URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}?auth=success&provider=github&token=${token}&email=${encodeURIComponent(req.user.email)}&name=${encodeURIComponent(req.user.name)}`);
    } catch (error) {
      logger.error('GitHub OAuth callback error:', error);
      res.redirect((process.env.FRONTEND_URL || 'http://localhost:5173') + '?auth=error');
    }
  }
);

// Obtener información del usuario autenticado
router.get('/user', isAuthenticated, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    provider: req.user.provider,
    avatar: req.user.avatar
  });
});

// Cerrar sesión
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al destruir sesión' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Sesión cerrada exitosamente' });
    });
  });
});

// Verificar estado de autenticación
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ 
      authenticated: true, 
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        provider: req.user.provider
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// POST /api/auth/login y /register - Delegados a loginRouter (api/auth/login.js)
router.use('/', loginRouter);

// MODO DESARROLLO: Login mock (bypass OAuth para desarrollo)
router.get('/dev-login', async (req, res) => {
  try {
    const jwtSecret = await keyVaultService.getJWTSecret();
    const mockUser = {
      id: 'dev-user-123',
      email: 'dev@econeura.com',
      name: 'Usuario Desarrollador'
    };
    
    const token = jwt.sign(
      { userId: mockUser.id, email: mockUser.email },
      jwtSecret,
      { expiresIn: '30d' }
    );
    
    logger.info('Dev login successful', { email: mockUser.email });
    
    // Redirigir con token en URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}?auth=success&provider=dev&token=${token}&email=${encodeURIComponent(mockUser.email)}&name=${encodeURIComponent(mockUser.name)}`);
  } catch (error) {
    logger.error('Dev login error:', error);
    res.redirect((process.env.FRONTEND_URL || 'http://localhost:5173') + '?auth=error');
  }
});

module.exports = router;
