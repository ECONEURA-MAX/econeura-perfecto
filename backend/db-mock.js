const logger = require('./services/logger');
const mockUsers = new Map();
mockUsers.set('test@econeura.com', {
  id: 1,
  email: 'test@econeura.com',
  password: 'mock',
  name: 'Test User',
  role: 'admin',
  created_at: new Date()
});
async function query() { return []; }
async function get(text, params) {
  if (text.includes('users WHERE email')) return mockUsers.get(params[0]) || null;
  return null;
}
async function all() { return []; }
async function run() { return { lastID: 1, changes: 1 }; }
async function getUserByEmail(email) { return mockUsers.get(email) || null; }
async function createUser(email, pass, name, role) {
  const user = { id: 2, email, password: pass, name, role, created_at: new Date() };
  mockUsers.set(email, user);
  return user;
}
async function getUserById(id) {
  for (const user of mockUsers.values()) {
    if (user.id === id) return user;
  }
  return null;
}
async function close() {}
module.exports = { query, get, all, run, getUserByEmail, createUser, getUserById, close };
