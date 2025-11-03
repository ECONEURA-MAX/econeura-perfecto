/**
 * ECONEURA - Azure Key Vault Service
 * Gestión segura de secrets usando Managed Identity
 */

const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

class KeyVaultService {
  constructor() {
    this.client = null;
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutos
    this.lastCacheTime = new Map();
    
    // Auto-inicializar si KEY_VAULT_URL está disponible
    if (process.env.KEY_VAULT_URL) {
      this.initialize();
    }
  }

  /**
   * Inicializar cliente de Key Vault
   */
  initialize() {
    try {
      const keyVaultUrl = process.env.KEY_VAULT_URL;
      
      if (!keyVaultUrl) {
        const logger = require('./logger');
        logger.warn('KEY_VAULT_URL no configurado, usando variables de entorno locales');
        return false;
      }

      // Usar Managed Identity (automático en Azure App Service)
      const credential = new DefaultAzureCredential();
      this.client = new SecretClient(keyVaultUrl, credential);
      
      const logger = require('./logger');
      logger.info('Cliente Key Vault inicializado correctamente', { keyVaultUrl });
      
      return true;
    } catch (error) {
      const logger = require('./logger');
      logger.error('Error inicializando Key Vault', { error: error.message, stack: error.stack });
      return false;
    }
  }

  /**
   * Obtener secret de Key Vault (con caché)
   */
  async getSecret(secretName) {
    // Si no hay cliente, usar variable de entorno
    if (!this.client) {
      const envValue = process.env[secretName.replace(/-/g, '_').toUpperCase()];
      if (envValue) {
        return envValue;
      }
      throw new Error(`Secret ${secretName} no encontrado en env variables`);
    }

    // Verificar caché
    const now = Date.now();
    const lastCache = this.lastCacheTime.get(secretName);
    
    if (this.cache.has(secretName) && lastCache && (now - lastCache < this.cacheExpiry)) {
      return this.cache.get(secretName);
    }

    // Obtener de Key Vault
    try {
      const secret = await this.client.getSecret(secretName);
      
      // Guardar en caché
      this.cache.set(secretName, secret.value);
      this.lastCacheTime.set(secretName, now);
      
      return secret.value;
    } catch (error) {
      const logger = require('./logger');
      logger.error('Error obteniendo secret de Key Vault', { 
        secretName, 
        error: error.message 
      });
      
      // Fallback a variable de entorno
      const envValue = process.env[secretName.replace(/-/g, '_').toUpperCase()];
      if (envValue) {
        logger.info('Usando fallback de env variable para secret', { secretName });
        return envValue;
      }
      
      throw error;
    }
  }

  /**
   * Obtener JWT Secret
   */
  async getJWTSecret() {
    return this.getSecret('JWT-SECRET');
  }

  /**
   * Obtener Session Secret
   */
  async getSessionSecret() {
    return this.getSecret('SESSION-SECRET');
  }

  /**
   * Obtener OpenAI API Key
   */
  async getOpenAIKey() {
    return this.getSecret('OPENAI-API-KEY');
  }

  /**
   * Limpiar caché (útil para testing o rotación de secrets)
   */
  clearCache() {
    this.cache.clear();
    this.lastCacheTime.clear();
  }

  /**
   * Verificar salud de conexión con Key Vault
   */
  async healthCheck() {
    if (!this.client) {
      return {
        status: 'not_configured',
        message: 'Key Vault no configurado, usando env variables'
      };
    }

    try {
      // Intentar obtener un secret para verificar conectividad
      await this.getSecret('JWT-SECRET');
      
      return {
        status: 'ok',
        cached_secrets: this.cache.size,
        vault_url: process.env.KEY_VAULT_URL
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }
}

// Singleton
const keyVaultService = new KeyVaultService();

module.exports = keyVaultService;


