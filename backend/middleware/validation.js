/**
 * ECONEURA - Input Validation Middleware
 * Enterprise-grade validation con Joi
 */

const Joi = require('joi');
const logger = require('../services/logger');

/**
 * Middleware factory para validar request body
 */
function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Mostrar todos los errores
      stripUnknown: true  // Remover campos no definidos
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('[Validation] Request body validation failed', {
        path: req.path,
        errors
      });

      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }

    // Reemplazar body con valor validado y sanitizado
    req.body = value;
    next();
  };
}

/**
 * Middleware factory para validar query params
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('[Validation] Query params validation failed', {
        path: req.path,
        errors
      });

      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }

    req.query = value;
    next();
  };
}

/**
 * Middleware factory para validar params
 */
function validateParams(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('[Validation] Params validation failed', {
        path: req.path,
        errors
      });

      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }

    req.params = value;
    next();
  };
}

/**
 * Schemas comunes reutilizables
 */
const schemas = {
  // Chat input
  chatInput: Joi.object({
    input: Joi.string().required().min(1).max(10000).trim(),
    userId: Joi.string().uuid().optional(),
    conversationId: Joi.string().uuid().optional(),
    context: Joi.object().optional()
  }),

  // Agent ID
  agentId: Joi.object({
    id: Joi.string().pattern(/^a-[a-z]+-\d{2}$/).required()
  }),

  // UUID
  uuid: Joi.object({
    id: Joi.string().uuid().required()
  }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // File upload
  fileUpload: Joi.object({
    name: Joi.string().required().min(1).max(255),
    description: Joi.string().max(1000).optional(),
    type: Joi.string().valid('document', 'image', 'video', 'audio', 'other').default('document')
  }),

  // NEURA agent execution
  neuraExecution: Joi.object({
    agentId: Joi.string().required().min(1).max(100),
    input: Joi.object().optional(),
    userId: Joi.string().optional()
  }),

  // Auth register
  authRegister: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(100).required(),
    name: Joi.string().min(2).max(100).required()
  }),

  // Auth login
  authLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

/**
 * Middleware de sanitización general
 */
function sanitizeInput(req, res, next) {
  // Sanitizar strings en body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  // Sanitizar strings en query
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }

  next();
}

/**
 * Sanitizar objetos recursivamente
 */
function sanitizeObject(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Remover caracteres de control
      obj[key] = obj[key].replace(/[\x00-\x1F\x7F]/g, '');
      
      // Prevenir NoSQL injection básico
      obj[key] = obj[key].replace(/[${}]/g, '');
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
  sanitizeInput,
  schemas
};


