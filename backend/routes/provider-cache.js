const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Cache de respuestas de proveedores
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

class ProviderCacheService {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
  }

  generateCacheKey(provider, agentId, input) {
    return `${provider}:${agentId}:${Buffer.from(input).toString('base64')}`;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.data;
  }

  set(key, data, ttl = CACHE_TTL) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }

  clear() {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? (this.stats.hits / total * 100).toFixed(2) + '%' : '0%',
      size: this.cache.size
    };
  }
}

const cacheService = new ProviderCacheService();

// Middleware de cache
const cacheMiddleware = (req, res, next) => {
  const { agentId } = req.params;
  const { input } = req.body;
  const provider = req.headers['x-provider'] || 'make';
  
  const cacheKey = cacheService.generateCacheKey(provider, agentId, input);
  const cached = cacheService.get(cacheKey);
  
  if (cached) {
    return res.json({
      success: true,
      agent_id: agentId,
      provider,
      response: cached,
      cached: true,
      timestamp: new Date().toISOString()
    });
  }
  
  req.cacheKey = cacheKey;
  req.provider = provider;
  next();
};

// Endpoint con cache
router.post('/execute/:agentId', cacheMiddleware, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { input, context } = req.body;
    const provider = req.provider;
    
    // Simular ejecución de proveedor
    const response = await executeProvider(provider, agentId, input, context);
    
    // Guardar en cache
    cacheService.set(req.cacheKey, response);
    
    res.json({
      success: true,
      agent_id: agentId,
      provider,
      response,
      cached: false,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

async function executeProvider(provider, agentId, input, context) {
  // Simular diferentes proveedores
  if (provider === 'make') {
    return `Make.com response for ${agentId}: ${input}`;
  } else if (provider === 'n8n') {
    return `n8n response for ${agentId}: ${input}`;
  } else if (provider === 'chatgpt') {
    return `ChatGPT response for ${agentId}: ${input}`;
  }
  
  throw new Error(`Unknown provider: ${provider}`);
}

// Endpoint para estadísticas de cache
router.get('/cache/stats', (req, res) => {
  res.json({
    cache: cacheService.getStats(),
    timestamp: new Date().toISOString()
  });
});

// Endpoint para limpiar cache
router.post('/cache/clear', (req, res) => {
  cacheService.clear();
  res.json({
    success: true,
    message: 'Cache cleared',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
