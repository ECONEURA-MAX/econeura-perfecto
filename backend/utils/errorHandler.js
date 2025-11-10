/**
 * Centralized Error Handler
 * Manejo consistente de errores en toda la API
 */

const logger = require('../services/logger');

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

function errorHandler(err, req, res, next) {
  let { statusCode, message, code } = err;
  
  // Defaults
  statusCode = statusCode || 500;
  code = code || 'INTERNAL_ERROR';
  
  // Log error
  logger.error('Error handled', {
    requestId: req.id,
    statusCode,
    code,
    message,
    path: req.path,
    method: req.method,
    stack: err.stack
  });
  
  // Response
  res.status(statusCode).json({
    error: message,
    code,
    requestId: req.id,
    timestamp: new Date().toISOString()
  });
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  AppError,
  errorHandler,
  asyncHandler
};

