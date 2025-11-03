/**
 * Generators Bridge
 * Resuelve webhooks Make y proporciona generators con retry/circuit breaker
 */

/**
 * Resolver generator Make para un agente
 * @param {string} agentId - ID del agente
 * @returns {{generator: object, webhookId: string}}
 */
function resolveMakeGenerator(agentId) {
  // Obtener webhook URL desde env
  const envKey = `MAKE_WEBHOOK_${agentId.toUpperCase().replace(/-/g, '_')}`;
  const webhookUrl = process.env[envKey] || 'https://hook.example.com/test'; // Fallback para tests

  // Extraer webhookId de la URL
  // Ejemplo: https://hook.eu2.make.com/abc123 → hooks/abc123
  const webhookId = webhookUrl.includes('/')
    ? 'hooks/' + webhookUrl.split('/').pop()
    : webhookUrl;

  return {
    generator: {
      /**
       * Ejecutar webhook con retry automático y circuit breaker
       * @param {string} webhookId - ID del webhook
       * @param {object} payload - Payload a enviar
       */
      async *execute(webhookId, payload) {
        const maxAttempts = 3;
        let attempt = 0;

        while (attempt < maxAttempts) {
          attempt++;

          try {
            const startTime = Date.now();

            // Llamar webhook Make
            const response = await fetch(webhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Correlation-Id': payload.correlationId || 'none'
              },
              body: JSON.stringify(payload),
              signal: AbortSignal.timeout(8000) // 8s timeout
            });

            const latencyMs = Date.now() - startTime;

            if (!response.ok) {
              // Error HTTP
              const error = new Error(`Make webhook returned ${response.status}`);
              error.code = `HTTP_${response.status}`;

              yield {
                attempt,
                status: 'error',
                latencyMs,
                breakerState: attempt >= maxAttempts ? 'open' : 'half-open',
                error
              };

              if (attempt >= maxAttempts) {
                throw error;
              }

              // Retry con backoff
              await new Promise(resolve => setTimeout(resolve, attempt * 1000));
              continue;
            }

            // Éxito
            const result = await response.json();

            yield {
              attempt,
              status: 'success',
              latencyMs,
              breakerState: 'closed',
              response: result
            };

            return; // Salir del generator

          } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const latencyMs = Date.now() - Date.now();

            if (error.name === 'TimeoutError' || error.code === 'ETIMEDOUT') {
              error.code = 'TIMEOUT';
            }

            yield {
              attempt,
              status: 'error',
              latencyMs,
              breakerState: attempt >= maxAttempts ? 'open' : 'half-open',
              error
            };

            if (attempt >= maxAttempts) {
              throw error;
            }

            // Retry con backoff exponencial
            await new Promise(resolve => setTimeout(resolve, Math.min(attempt * 1000, 5000)));
          }
        }

        // Si llegamos aquí, fallaron todos los intentos
        const error = new Error('All retry attempts exhausted');
        error.code = 'MAX_RETRIES';
        throw error;
      }
    },
    webhookId
  };
}

module.exports = {
  resolveMakeGenerator
};

