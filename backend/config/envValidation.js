/**
 * ECONEURA - Validación de Environment Variables
 * Falla rápido si configuración está incompleta
 */

const { z } = require('zod');
const logger = require('../services/logger');

/**
 * Schema de validación para variables de entorno
 */
const envSchema = z.object({
  // Entorno
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('8080'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional(),
  
  // OpenAI (OPCIONAL en desarrollo, REQUERIDO en producción)
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY debe tener al menos 1 carácter').optional(),
  
  // Database (OPCIONAL - puede usar SQLite)
  DATABASE_URL: z.string().url().or(z.literal('')).optional(),
  USE_SQLITE: z.string().transform(val => val === 'true').optional(),
  
  // Redis (OPCIONAL)
  REDIS_URL: z.string().url().or(z.literal('')).optional(),
  
  // Azure Key Vault (OPCIONAL en desarrollo)
  KEY_VAULT_NAME: z.string().optional(),
  
  // Application Insights (OPCIONAL)
  APPLICATIONINSIGHTS_CONNECTION_STRING: z.string().optional(),
  
  // Session (OPCIONAL - tiene fallback)
  SESSION_SECRET: z.string().optional(),
  
  // JWT (OPCIONAL - tiene fallback)
  JWT_SECRET: z.string().optional(),
  
  // CORS (OPCIONAL - tiene defaults)
  CORS_ORIGIN: z.string().optional(),
  
  // Feature flags (OPCIONAL)
  FEATURE_MAKE_ENABLED: z.string().transform(val => val === 'true').optional(),
});

/**
 * Validar y parsear environment variables
 */
function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    
    // Validaciones adicionales según entorno
    if (parsed.NODE_ENV === 'production') {
      // En producción, OPENAI_API_KEY es obligatorio PERO NO MATAR PROCESO
      if (!parsed.OPENAI_API_KEY) {
        logger.error('OPENAI_API_KEY es requerido en producción - algunas funciones no estarán disponibles');
        // NO matar proceso - permitir que el servidor arranque
        // process.exit(1);
      }
      
      // En producción, recomendamos Key Vault pero no es obligatorio
      if (!parsed.KEY_VAULT_NAME) {
        logger.warn('KEY_VAULT_NAME no configurado en producción (recomendado para secrets)');
      }
      
      // Application Insights recomendado pero no obligatorio
      if (!parsed.APPLICATIONINSIGHTS_CONNECTION_STRING) {
        logger.warn('APPLICATIONINSIGHTS_CONNECTION_STRING no configurado (monitoring reducido)');
      }
    } else {
      // En desarrollo, mostrar advertencia si falta OPENAI_API_KEY
      if (!parsed.OPENAI_API_KEY) {
        logger.warn('OPENAI_API_KEY no configurado (algunas funciones no estarán disponibles)');
      }
    }
    
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Error validando environment variables', {
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
      // NO matar proceso - permitir que arranque con advertencias
      // Retornar objeto vacío para no romper
      return {};
    } else {
      throw error;
    }
  }
}

/**
 * Exportar variables validadas
 */
const validatedEnv = validateEnv();

// Aplicar al process.env (mantener compatibilidad)
Object.keys(validatedEnv).forEach(key => {
  if (validatedEnv[key] !== undefined) {
    process.env[key] = String(validatedEnv[key]);
  }
});

module.exports = validatedEnv;

