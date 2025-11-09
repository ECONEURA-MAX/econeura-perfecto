const passport = require('passport');
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const logger = require('../services/logger');
// const db = require('../db'); // SQLite removed - OAuth usa PostgreSQL
const jwt = require('jsonwebtoken');
const keyVaultService = require('../services/keyVaultService');

// Obtener JWT Secret
async function getJWTSecret() {
  try {
    return await keyVaultService.getJWTSecret();
  } catch (error) {
    return process.env.JWT_SECRET || 'econeura-dev-secret-change-in-production';
  }
}

// Configuración de estrategias OAuth
const configurePassport = () => {
  // Serialización de usuario
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    // id es el provider ID (ej: "google-123456" o "123456789")
    // Extraer provider del id si está en formato "provider-id"
    const parts = id.split('-');
    const provider = parts.length > 1 ? parts[0] : 'unknown';
    
    // Datos mínimos para que el callback funcione
    done(null, { 
      id: id, 
      email: `user@econeura.com`, 
      name: `Usuario ${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
      provider: provider
    });
  });

  // Microsoft OAuth Strategy
  passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: process.env.MICROSOFT_CALLBACK_URL || "http://localhost:8080/api/auth/microsoft/callback",
    scope: ['user.read']
  },
  (accessToken, refreshToken, profile, done) => {
    logger.info('Microsoft OAuth login', {
      displayName: profile.displayName,
      email: profile.emails?.[0]?.value,
      provider: 'microsoft'
    });
    return done(null, {
      id: profile.id,
      email: profile.emails?.[0]?.value || 'no-email@econeura.com',
      name: profile.displayName || 'Usuario Microsoft',
      provider: 'microsoft',
      avatar: profile.photos?.[0]?.value
    });
  }));

  // GitHub OAuth Strategy
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'demo-github-client-id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'demo-github-client-secret',
    callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:8080/api/auth/github/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    logger.info('GitHub OAuth login', {
      displayName: profile.displayName,
      email: profile.emails?.[0]?.value,
      provider: 'github'
    });
    return done(null, {
      id: profile.id,
      email: profile.emails?.[0]?.value || 'no-email@econeura.com',
      name: profile.displayName || 'Usuario GitHub',
      provider: 'github',
      avatar: profile.photos?.[0]?.value
    });
  }));
};

module.exports = { configurePassport };
