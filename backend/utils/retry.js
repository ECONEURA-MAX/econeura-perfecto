/**
 * ECONEURA - Retry Utility
 * Enterprise-grade retry logic con exponential backoff
 */

const logger = require('../services/logger');

/**
 * Retry una función con exponential backoff
 * 
 * @param {Function} fn - Función a ejecutar
 * @param {Object} options - Opciones de retry
 * @param {number} options.maxRetries - Número máximo de reintentos (default: 3)
 * @param {number} options.initialDelay - Delay inicial en ms (default: 1000)
 * @param {number} options.maxDelay - Delay máximo en ms (default: 10000)
 * @param {number} options.backoffMultiplier - Multiplicador de backoff (default: 2)
 * @param {Function} options.shouldRetry - Función para determinar si reintentar (default: siempre)
 * @param {string} options.operationName - Nombre de la operación para logging
 * @returns {Promise} Resultado de la función
 */
async function retry(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
    operationName = 'operation'
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const result = await fn();
      
      if (attempt > 1) {
        logger.info(`[Retry] ${operationName} succeeded`, {
          attempt,
          totalAttempts: attempt
        });
      }
      
      return result;
    } catch (error) {
      lastError = error;

      // Si es el último intento, lanzar error
      if (attempt > maxRetries) {
        logger.error(`[Retry] ${operationName} failed after ${maxRetries} retries`, {
          error: error.message,
          stack: error.stack
        });
        throw error;
      }

      // Verificar si debemos reintentar
      if (!shouldRetry(error)) {
        logger.warn(`[Retry] ${operationName} not retryable`, {
          error: error.message,
          attempt
        });
        throw error;
      }

      // Log retry attempt
      logger.warn(`[Retry] ${operationName} failed, retrying...`, {
        attempt,
        maxRetries,
        delay,
        error: error.message
      });

      // Esperar antes de reintentar
      await sleep(delay);

      // Calcular siguiente delay con exponential backoff
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Retry para operaciones HTTP
 */
async function retryHttp(fn, options = {}) {
  return retry(fn, {
    maxRetries: options.maxRetries || 3,
    initialDelay: options.initialDelay || 500,
    maxDelay: options.maxDelay || 5000,
    shouldRetry: (error) => {
      // Solo reintentar en errores de red o 5xx
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        return true;
      }
      if (error.response && error.response.status >= 500) {
        return true;
      }
      // 429 Too Many Requests también es reintentar
      if (error.response && error.response.status === 429) {
        return true;
      }
      return false;
    },
    operationName: options.operationName || 'HTTP request'
  });
}

/**
 * Retry para operaciones de base de datos
 */
async function retryDatabase(fn, options = {}) {
  return retry(fn, {
    maxRetries: options.maxRetries || 5,
    initialDelay: options.initialDelay || 1000,
    maxDelay: options.maxDelay || 10000,
    shouldRetry: (error) => {
      // Reintentar en errores de conexión
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        return true;
      }
      // Reintentar en deadlocks
      if (error.code === '40P01' || error.message.includes('deadlock')) {
        return true;
      }
      // Reintentar en serialization failures
      if (error.code === '40001') {
        return true;
      }
      return false;
    },
    operationName: options.operationName || 'Database operation'
  });
}

/**
 * Circuit Breaker simple
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minuto
    this.monitoringPeriod = options.monitoringPeriod || 10000; // 10 segundos
    this.name = options.name || 'circuit';
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
    this.totalCount = 0;
  }

  async execute(fn) {
    // Si el circuito está abierto, verificar si debemos pasar a HALF_OPEN
    if (this.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure >= this.resetTimeout) {
        logger.info(`[CircuitBreaker] ${this.name} transitioning to HALF_OPEN`);
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
    }

    this.totalCount++;

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.successCount++;

    // Si estábamos en HALF_OPEN y tenemos éxitos, cerrar el circuito
    if (this.state === 'HALF_OPEN' && this.successCount >= 3) {
      logger.info(`[CircuitBreaker] ${this.name} transitioning to CLOSED`);
      this.state = 'CLOSED';
      this.successCount = 0;
    }
  }

  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    // Si estábamos en HALF_OPEN, volver a OPEN inmediatamente
    if (this.state === 'HALF_OPEN') {
      logger.warn(`[CircuitBreaker] ${this.name} transitioning to OPEN (failed in HALF_OPEN)`);
      this.state = 'OPEN';
      return;
    }

    // Si alcanzamos el umbral de fallos, abrir el circuito
    if (this.failures >= this.failureThreshold) {
      logger.warn(`[CircuitBreaker] ${this.name} transitioning to OPEN`, {
        failures: this.failures,
        threshold: this.failureThreshold
      });
      this.state = 'OPEN';
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      totalCount: this.totalCount,
      successRate: this.totalCount > 0 ? ((this.totalCount - this.failures) / this.totalCount * 100).toFixed(2) : 100
    };
  }
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  retry,
  retryHttp,
  retryDatabase,
  CircuitBreaker,
  sleep
};


