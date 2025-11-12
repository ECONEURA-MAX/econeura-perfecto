const passport = require('passport');
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const logger = require('../services/logger');

passport.serializeUser((user, done) => { done(null, user); });
passport.deserializeUser((user, done) => { done(null, user); });

function configurePassport() {
  if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    passport.use(new MicrosoftStrategy({
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: process.env.MICROSOFT_CALLBACK_URL || "http://localhost:8080/api/auth/microsoft/callback",
      scope: ['user.read']
    }, (accessToken, refreshToken, profile, done) => {
      logger.info('Microsoft OAuth', { user: profile.displayName });
      return done(null, { id: profile.id, email: profile.emails?.[0]?.value, displayName: profile.displayName, provider: 'microsoft' });
    }));
    logger.info('Microsoft OAuth OK');
  } else { logger.warn('Microsoft OAuth SKIP'); }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_REDIRECT_URI || "http://localhost:8080/api/auth/github/callback"
    }, (accessToken, refreshToken, profile, done) => {
      logger.info('GitHub OAuth', { user: profile.username });
      return done(null, { id: profile.id, username: profile.username, displayName: profile.displayName, provider: 'github' });
    }));
    logger.info('GitHub OAuth OK');
  } else { logger.warn('GitHub OAuth SKIP'); }
}

module.exports = { configurePassport };
