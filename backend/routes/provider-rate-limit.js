const express = require('express');
const router = express.Router();

// Rate limiting por proveedor
class ProviderRateLimitService {
  constructor() {
    this.limits = {
      make: { requests: 100, window: 15 * 60 * 1000 }, // 100 req/15min
      n8n: { requests: 50, window: 15 * 60 * 1000 },   // 50 req/15min
      chatgpt: { requests: 200, window: 15 * 60 * 1000 } // 200 req/15min
    };
    this.usage = new Map();
  }

  checkLimit(provider, identifier) {
    const limit = this.limits[provider];
    if (!limit) return { allowed: true, remaining: 0 };

    const key = `${provider}:${identifier}`;
    const now = Date.now();
    const windowStart = now - limit.window;

    if (!this.usage.has(key)) {
      this.usage.set(key, []);
    }

    const requests = this.usage.get(key);
    
    // Limpiar requests antiguos
    const validRequests = requests.filter(time => time > windowStart);
    this.usage.set(key, validRequests);

    const currentUsage = validRequests.length;
    const remaining = Math.max(0, limit.requests - currentUsage);
    const allowed = currentUsage < limit.requests;

    if (allowed) {
      validRequests.push(now);
      this.usage.set(key, validRequests);
    }

    return {
      allowed,
      remaining,
      resetTime: windowStart + limit.window,
      currentUsage
    };
  }

  getUsage(provider = null) {
    const result = {};
    const now = Date.now();

    for (const [key, requests] of this.usage.entries()) {
      const [prov, identifier] = key.split(':');
      
      if (provider && prov !== provider) continue;
      
      const limit = this.limits[prov];
      const windowStart = now - limit.window;
      const validRequests = requests.filter(time => time > windowStart);
      
      if (!result[prov]) {
        result[prov] = {
          total: 0,
          identifiers: {}
        };
      }
      
      result[prov].total += validRequests.length;
      result[prov].identifiers[identifier] = {
        requests: validRequests.length,
        limit: limit.requests,
        remaining: Math.max(0, limit.requests - validRequests.length)
      };
    }

    return result;
  }

  resetUsage(provider = null, identifier = null) {
    if (provider && identifier) {
      this.usage.delete(`${provider}:${identifier}`);
    } else if (provider) {
      for (const key of this.usage.keys()) {
        if (key.startsWith(`${provider}:`)) {
          this.usage.delete(key);
        }
      }
    } else {
      this.usage.clear();
    }
  }
}

const rateLimitService = new ProviderRateLimitService();

// Middleware de rate limiting
const rateLimitMiddleware = (req, res, next) => {
  const provider = req.headers['x-provider'] || 'make';
  const identifier = req.ip || 'unknown';
  
  const limitCheck = rateLimitService.checkLimit(provider, identifier);
  
  if (!limitCheck.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      provider,
      remaining: limitCheck.remaining,
      resetTime: limitCheck.resetTime,
      retryAfter: Math.ceil((limitCheck.resetTime - Date.now()) / 1000)
    });
  }
  
  res.set({
    'X-RateLimit-Limit': rateLimitService.limits[provider].requests,
    'X-RateLimit-Remaining': limitCheck.remaining,
    'X-RateLimit-Reset': limitCheck.resetTime
  });
  
  next();
};

// Endpoint para obtener uso de rate limiting
router.get('/usage', (req, res) => {
  const { provider } = req.query;
  const usage = rateLimitService.getUsage(provider);
  
  res.json({
    usage,
    limits: rateLimitService.limits,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para resetear uso
router.post('/reset', (req, res) => {
  const { provider, identifier } = req.body;
  rateLimitService.resetUsage(provider, identifier);
  
  res.json({
    success: true,
    message: 'Usage reset successfully',
    timestamp: new Date().toISOString()
  });
});

// Endpoint para actualizar límites
router.post('/limits', (req, res) => {
  const { provider, requests, window } = req.body;
  
  if (!rateLimitService.limits[provider]) {
    return res.status(404).json({ error: 'Provider not found' });
  }
  
  rateLimitService.limits[provider] = {
    requests: parseInt(requests) || rateLimitService.limits[provider].requests,
    window: parseInt(window) || rateLimitService.limits[provider].window
  };
  
  res.json({
    success: true,
    limits: rateLimitService.limits,
    timestamp: new Date().toISOString()
  });
});

module.exports = { router, rateLimitMiddleware };
