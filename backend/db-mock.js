const logger = require('./services/logger');

// Mock users storage (memoria)
const mockUsers = new Map();
const mockTokens = new Map();

// Usuario de prueba
mockUsers.set('test@econeura.com', {
  id: 1,
  email: 'test@econeura.com',
  password: 'mock',
  name: 'Test User',
  role: 'admin',
  created_at: new Date()
});

// query() compatible con PostgreSQL
async function query(text, params = []) {
  logger.info('[DB Mock] Query:', { text, params });
  
  // SELECT user by ID (para OAuth callback)
  if (text.includes('SELECT') && text.includes('users WHERE id')) {
    const userId = params[0];
    for (const user of mockUsers.values()) {
      if (user.id === userId || user.id === String(userId)) {
        return { rows: [user] };
      }
    }
    return { rows: [] };
  }
  
  // SELECT user by email
  if (text.includes('SELECT') && text.includes('users WHERE email')) {
    const email = params[0];
    const user = mockUsers.get(email);
    return { rows: user ? [user] : [] };
  }
  
  // INSERT user (para OAuth nuevo usuario)
  if (text.includes('INSERT INTO users')) {
    const [email, name, provider] = params;
    const userId = `oauth-${provider}-${Date.now()}`;
    const user = {
      id: userId,
      email: email || 'oauth@econeura.com',
      name: name || 'Usuario OAuth',
      role: 'user',
      provider,
      created_at: new Date()
    };
    mockUsers.set(userId, user);
    mockUsers.set(email, user); // Por email también
    logger.info('[DB Mock] User created:', { userId, email });
    return { rows: [{ id: userId }] };
  }
  
  // INSERT refresh token
  if (text.includes('INSERT INTO refresh_tokens')) {
    const [userId, jti, expiresAt] = params;
    mockTokens.set(jti, { userId, jti, expiresAt, created_at: new Date() });
    logger.info('[DB Mock] Token stored:', { userId, jti });
    return { rows: [] };
  }
  
  // DELETE refresh token
  if (text.includes('DELETE FROM refresh_tokens')) {
    const [userId, jti] = params;
    mockTokens.delete(jti);
    logger.info('[DB Mock] Token deleted:', { userId, jti });
    return { rows: [] };
  }
  
  // Default: empty result
  return { rows: [] };
}

async function get(text, params) {
  const result = await query(text, params);
  return result.rows[0] || null;
}

async function all(text, params) {
  const result = await query(text, params);
  return result.rows;
}

async function run(text, params) {
  const result = await query(text, params);
  return { lastID: result.rows[0]?.id || 1, changes: result.rows.length };
}

async function getUserByEmail(email) {
  return mockUsers.get(email) || null;
}

async function createUser(email, pass, name, role) {
  const userId = `user-${Date.now()}`;
  const user = { id: userId, email, password: pass, name, role, created_at: new Date() };
  mockUsers.set(email, user);
  mockUsers.set(userId, user);
  return user;
}

async function getUserById(id) {
  for (const user of mockUsers.values()) {
    if (user.id === id || user.id === String(id)) return user;
  }
  return null;
}

async function close() {}

module.exports = { query, get, all, run, getUserByEmail, createUser, getUserById, close };
