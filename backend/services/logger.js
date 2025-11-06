/**
 * ECONEURA - Logger Estructurado
 * Reemplaza console.log con logging enterprise-grade
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Crear directorio de logs si no existe
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch (err) {
    // En Azure App Service, puede no tener permisos, usar console
    console.warn('[Logger] No se pudo crear directorio de logs:', err.message);
  }
}

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
 * Configure transports based on environment
 */
const transports = [
  // Console output (siempre activo)
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      customFormat
    )
  })
];

// File transports solo en local o si hay permisos
if (process.env.NODE_ENV !== 'production' || fs.existsSync(logsDir)) {
  try {
    // Error logs - rotación diaria, mantener 14 días
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 14,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      })
    );

    // Combined logs - rotación diaria, mantener 7 días
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        maxsize: 10485760, // 10MB
        maxFiles: 7,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      })
    );
  } catch (err) {
    console.warn('[Logger] No se pudieron crear file transports:', err.message);
  }
}

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
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '3.0.0'
  },
  transports,
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
  ],
  exitOnError: false // No salir del proceso en errores
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


