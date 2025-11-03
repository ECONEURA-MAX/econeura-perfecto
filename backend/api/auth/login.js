const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const logger = require('../../services/logger');

// POST /api/auth/login - Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    // Try database first
    let user = null;
    let token = null;

    if (process.env.DATABASE_URL) {
      try {
        const db = require('../../db');
        const dbUser = await db.getUserByEmail(email);

        if (dbUser) {
          const validPassword = await bcrypt.compare(password, dbUser.password);
          if (validPassword) {
            token = 'token-' + Date.now() + '-' + dbUser.id;
            user = {
              id: dbUser.id.toString(),
              email: dbUser.email,
              name: dbUser.name
            };
          }
        }
      } catch (dbError) {
        logger.warn('DB not available, using demo mode', { error: dbError.message });
      }
    }

    // Fallback: Demo mode (si DB falla o usuario no existe)
    if (!user) {
      token = 'demo-token-' + Date.now();
      user = {
        id: '1',
        email: email,
        name: email.split('@')[0],
        role: 'admin'
      };
    }

    res.json({ token, user });

  } catch (error) {
    logger.error('Login error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Error en login' });
  }
});

// POST /api/auth/register - Register endpoint (demo mode)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    // Demo mode registration
    const token = 'demo-token-' + Date.now();
    const user = {
      id: Date.now().toString(),
      email: email,
      name: name || email.split('@')[0],
      role: 'user'
    };

    res.json({ token, user });

  } catch (error) {
    logger.error('Register error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Error en registro' });
  }
});

module.exports = router;
