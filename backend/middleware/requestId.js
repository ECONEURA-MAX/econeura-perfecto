/**
 * Request ID Middleware
 * Añade X-Request-ID único a cada request para tracing
 */

const crypto = require('crypto');
const logger = require('../services/logger');

function requestIdMiddleware(req, res, next) {
  // Usar X-Request-ID del cliente si existe, sino generar
  const requestId = req.headers['x-request-id'] || 
                   `req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  
  // Añadir a request object
  req.id = requestId;
  
  // Añadir a response headers
  res.setHeader('X-Request-ID', requestId);
  
  // Log request
  logger.info('Request received', {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  
  next();
}

module.exports = { requestIdMiddleware };

