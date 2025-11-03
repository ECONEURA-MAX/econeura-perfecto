/**
 * Make.com Webhook Service
 * Maneja invocación de agentes vía webhooks de Make.com con:
 * - Cache idempotente con idempotencyKey
 * - Retry automático con circuit breaker
 * - Metadata de diagnóstico (_meta)
 */

// Import simple - los tests lo mockean con vi.doMock
const generatorsBridge = require('./generatorsBridge.js');

// Cache en memoria (Map) con TTL de 5 minutos
const CACHE = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Invocar agente Make via webhook con retry y circuit breaker
 * @param {string} agentId - ID del agente (ej: 'a-ceo-01')
 * @param {object} payload - Payload de invocación
 * @param {string} payload.input - Input del usuario
 * @param {string} payload.correlationId - ID de correlación
 * @param {string} payload.idempotencyKey - Clave para cache idempotente
 * @param {object} [payload.metadata] - Metadata adicional
 * @returns {Promise<object>} Respuesta con _meta
 */
async function invokeMakeAgent(agentId, payload) {
  const { input, correlationId, idempotencyKey, metadata = {} } = payload;

  // Validación de parámetros
  if (!agentId || typeof agentId !== 'string') {
    throw new Error('agentId es requerido y debe ser string');
  }
  if (!input) {
    throw new Error('input es requerido');
  }

  // Cache idempotente: si existe idempotencyKey y está en cache, retornar
  if (idempotencyKey) {
    const cached = CACHE.get(idempotencyKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      // Retornar respuesta cacheada con flag replayed
      return {
        ...cached.response,
        _meta: {
          ...cached.response._meta,
          replayed: true
        }
      };
    }
  }

  // Resolver generator desde bridge
  const { generator, webhookId } = generatorsBridge.resolveMakeGenerator(agentId);

  // Ejecutar generator con retry/circuit breaker
  let lastResult = null;
  let attempts = 0;

  try {
    for await (const result of generator.execute(webhookId, {
      input,
      correlationId,
      metadata
    })) {
      attempts = result.attempt || attempts + 1;
      lastResult = result;

      if (result.status === 'success') {
        // Éxito: construir respuesta con metadata
        const response = {
          ...(result.response || {}),
          _meta: {
            replayed: false,
            attempts,
            idempotencyKey: idempotencyKey || null,
            latencyMs: result.latencyMs || 0,
            breakerState: result.breakerState || 'closed'
          }
        };

        // Guardar en cache si hay idempotencyKey
        if (idempotencyKey) {
          CACHE.set(idempotencyKey, {
            response,
            timestamp: Date.now()
          });
        }

        return response;
      } else if (result.status === 'error') {
        // Error: continuar al throw del generator
        continue;
      }
    }

    // Si llegamos aquí sin success, falló
    throw new Error('Execution plan exhausted without success');

  } catch (error) {
    // Propagar error original con diagnósticos
    if (lastResult?.error) {
      throw lastResult.error;
    }
    throw error;
  }
}

/**
 * Limpiar cache expirado (llamar periódicamente)
 */
function clearExpiredCache() {
  const now = Date.now();
  for (const [key, value] of CACHE.entries()) {
    if ((now - value.timestamp) > CACHE_TTL) {
      CACHE.delete(key);
    }
  }
}

// Limpiar cache cada 5 minutos
const cleanupInterval = setInterval(clearExpiredCache, 5 * 60 * 1000);

// Permitir cleanup del interval en tests
if (typeof afterEach !== 'undefined') {
  afterEach(() => clearInterval(cleanupInterval));
}

module.exports = {
  invokeMakeAgent,
  clearExpiredCache
};

