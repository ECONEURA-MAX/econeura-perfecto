const authMiddleware = (req, res, next) => {
  // Middleware simple para desarrollo local
  req.user = { id: 'local-user', email: 'local@econeura.com' };
  next();
};

module.exports = { authMiddleware };
