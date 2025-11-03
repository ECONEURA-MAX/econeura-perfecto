const express = require('express');
const router = express.Router();

// Health checks de proveedores
class ProviderHealthService {
  constructor() {
    this.healthChecks = new Map();
    this.healthStatus = new Map();
    this.checkInterval = 30000; // 30 segundos
    this.startHealthChecks();
  }

  startHealthChecks() {
    setInterval(() => {
      this.performHealthChecks();
    }, this.checkInterval);
  }

  async performHealthChecks() {
    const providers = ['make', 'n8n', 'chatgpt'];
    
    for (const provider of providers) {
      try {
        const health = await this.checkProviderHealth(provider);
        this.healthStatus.set(provider, {
          ...health,
          lastCheck: new Date().toISOString(),
          status: health.healthy ? 'healthy' : 'unhealthy'
        });
      } catch (error) {
        this.healthStatus.set(provider, {
          healthy: false,
          error: error.message,
          lastCheck: new Date().toISOString(),
          status: 'error'
        });
      }
    }
  }

  async checkProviderHealth(provider) {
    const startTime = Date.now();
    
    try {
      let response;
      
      if (provider === 'make') {
        response = await fetch('https://hook.eu2.make.com/9fcydc16h26m2ejww5p049x7fa57fmqp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true, timestamp: new Date().toISOString() })
        });
      } else if (provider === 'n8n') {
        // Simular check de n8n
        response = { ok: true, status: 200 };
      } else if (provider === 'chatgpt') {
        // Simular check de ChatGPT
        response = { ok: true, status: 200 };
      }
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: response.ok,
        responseTime,
        statusCode: response.status,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  getHealthStatus(provider = null) {
    if (provider) {
      return this.healthStatus.get(provider) || {
        healthy: false,
        status: 'unknown',
        lastCheck: null
      };
    }
    
    const status = {};
    for (const [prov, health] of this.healthStatus.entries()) {
      status[prov] = health;
    }
    
    return status;
  }

  getOverallHealth() {
    const statuses = Array.from(this.healthStatus.values());
    const healthy = statuses.filter(s => s.healthy).length;
    const total = statuses.length;
    
    return {
      overall: total > 0 ? (healthy / total * 100).toFixed(1) + '%' : '0%',
      healthy,
      total,
      status: healthy === total ? 'all_healthy' : 
              healthy > 0 ? 'partial' : 'all_unhealthy'
    };
  }

  async forceHealthCheck(provider) {
    const health = await this.checkProviderHealth(provider);
    this.healthStatus.set(provider, {
      ...health,
      lastCheck: new Date().toISOString(),
      status: health.healthy ? 'healthy' : 'unhealthy'
    });
    
    return health;
  }
}

const healthService = new ProviderHealthService();

// Endpoint para obtener estado de salud
router.get('/health', (req, res) => {
  const { provider } = req.query;
  const status = healthService.getHealthStatus(provider);
  const overall = healthService.getOverallHealth();
  
  res.json({
    status,
    overall,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para forzar health check
router.post('/health/check', async (req, res) => {
  const { provider } = req.body;
  
  if (provider) {
    const health = await healthService.forceHealthCheck(provider);
    res.json({
      provider,
      health,
      timestamp: new Date().toISOString()
    });
  } else {
    // Check all providers
    const providers = ['make', 'n8n', 'chatgpt'];
    const results = {};
    
    for (const prov of providers) {
      results[prov] = await healthService.forceHealthCheck(prov);
    }
    
    res.json({
      providers: results,
      overall: healthService.getOverallHealth(),
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para obtener métricas de salud
router.get('/health/metrics', (req, res) => {
  const status = healthService.getHealthStatus();
  const overall = healthService.getOverallHealth();
  
  const metrics = {
    overall,
    providers: {},
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  };
  
  for (const [provider, health] of Object.entries(status)) {
    metrics.providers[provider] = {
      status: health.status,
      responseTime: health.responseTime || 0,
      lastCheck: health.lastCheck,
      healthy: health.healthy
    };
  }
  
  res.json(metrics);
});

module.exports = router;
