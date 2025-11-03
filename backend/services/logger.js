/**
 * ECONEURA - Logger Estructurado
 * Reemplaza console.log con logging enterprise-grade
 */

const winston = require('winston');

// Obtener Application Insights si está disponible
let appInsights = null;
try {
  appInsights = require('../monitoring/applicationInsights');
} catch (error) {
  // Application Insights no disponible todavía
}

/**
 * Formato personalizado para ECONEURA
 */
const customFormat = winston.format.printf(({ level, message, timestamp, correlationId, ...metadata }) => {
  let msg = `${timestamp} [${level.toUpperCase()}]`;
  
  if (correlationId) {
    msg += ` [${correlationId}]`;
  }
  
  msg += `: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

/**
 * Create logger instance
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
  ),
  defaultMeta: {
    service: 'econeura-backend',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console output (formateado)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      )
    })
  ],
  // No lanzar excepciones en producción
  exceptionHandlers: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ],
  rejectionHandlers: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

/**
 * Integrar con Application Insights cuando esté disponible
 */
if (appInsights && typeof appInsights.isInitialized === 'function' && appInsights.isInitialized()) {
  logger.on('data', (info) => {
    // Enviar logs críticos a Application Insights
    if (info.level === 'error') {
      appInsights.trackException(info.error || new Error(info.message), {
        level: info.level,
        metadata: info.metadata
      });
    } else if (info.level === 'warn') {
      appInsights.trackEvent('log', {
        level: info.level,
        message: info.message,
        ...info.metadata
      });
    }
  });
}

/**
 * Helper para mantener API compatible con console.log
 */
logger.logInfo = logger.info;
logger.logError = logger.error;
logger.logWarn = logger.warn;
logger.logDebug = logger.debug;

module.exports = logger;


