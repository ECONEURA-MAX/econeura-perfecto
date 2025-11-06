const express = require('express');
const router = express.Router();
const logger = require('../services/logger');

const startTime = Date.now();

/**
 * Enterprise-Grade Health Check System
 * Soporta Kubernetes liveness/readiness probes
 */

// GET /api/health/live - Kubernetes Liveness Probe
// Indica si el servidor está vivo (responde, no colgado)
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    service: 'econeura-backend',
    version: process.env.npm_package_version || '3.0.0'
  });
});

// GET /api/health/ready - Kubernetes Readiness Probe
// Indica si el servidor está listo para recibir tráfico (dependencies OK)
router.get('/ready', async (req, res) => {
  const checks = {
    status: 'ready',
    timestamp: new Date().toISOString(),
    service: 'econeura-backend',
    checks: {}
  };

  let isReady = true;

  // Check PostgreSQL con timeout
  try {
    const { checkPostgreSQLHealth } = require('../config/database');
    const dbCheck = await Promise.race([
      checkPostgreSQLHealth(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);
    checks.checks.database = dbCheck;
    if (dbCheck.status === 'error') {
      isReady = false;
    }
  } catch (error) {
    checks.checks.database = { status: 'error', message: error.message };
    isReady = false;
  }

  // Check Redis con timeout (non-critical)
  try {
    const { checkRedisHealth } = require('../config/database');
    const redisCheck = await Promise.race([
      checkRedisHealth(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
    ]);
    checks.checks.redis = redisCheck;
    // Redis failure no impide readiness
  } catch (error) {
    checks.checks.redis = { status: 'error', message: error.message };
  }

  checks.status = isReady ? 'ready' : 'not_ready';
  const statusCode = isReady ? 200 : 503;
  
  res.status(statusCode).json(checks);
});

// GET /api/health - Health check completo y detallado
router.get('/', async (req, res) => {
  const startCheck = Date.now();
  
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    service: 'econeura-backend',
    version: process.env.npm_package_version || '3.0.0',
    environment: process.env.NODE_ENV || 'development',
    node_version: process.version,
    port: process.env.PORT || 8080,
    checks: {},
    metrics: {}
  };

  // Check PostgreSQL con timeout y retry
  try {
    const { checkPostgreSQLHealth } = require('../config/database');
    const dbCheck = await Promise.race([
      checkPostgreSQLHealth(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 5s')), 5000))
    ]);
    checks.checks.database = dbCheck;
    if (dbCheck.status === 'error') {
      checks.status = 'degraded';
      logger.warn('[HEALTH] Database check failed', dbCheck);
    }
  } catch (error) {
    checks.checks.database = { status: 'error', message: error.message };
    checks.status = 'degraded';
    logger.error('[HEALTH] Database check error', { error: error.message });
  }

  // Check Redis con timeout
  try {
    const { checkRedisHealth } = require('../config/database');
    const redisCheck = await Promise.race([
      checkRedisHealth(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 3s')), 3000))
    ]);
    checks.checks.redis = redisCheck;
  } catch (error) {
    checks.checks.redis = { status: 'error', message: error.message };
    logger.warn('[HEALTH] Redis check failed', { error: error.message });
  }

  // Check Key Vault con timeout
  try {
    const keyVaultService = require('../services/keyVaultService');
    const kvCheck = await Promise.race([
      keyVaultService.healthCheck(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 3s')), 3000))
    ]);
    checks.checks.keyVault = kvCheck;
  } catch (error) {
    checks.checks.keyVault = { status: 'error', message: error.message };
    logger.warn('[HEALTH] Key Vault check failed', { error: error.message });
  }

  // Check Application Insights
  try {
    const appInsights = require('../monitoring/applicationInsights');
    checks.checks.monitoring = {
      status: appInsights.isInitialized() ? 'ok' : 'not_configured',
      service: 'Application Insights'
    };
  } catch (error) {
    checks.checks.monitoring = { status: 'error', message: error.message };
  }

  // Check AI Gateway
  try {
    const aiGateway = require('../services/resilientAIGateway');
    if (aiGateway && typeof aiGateway.getMetrics === 'function') {
      const metrics = aiGateway.getMetrics();
      checks.checks.aiGateway = {
        status: 'ok',
        healthyProviders: metrics.providers?.filter(p => p.state === 'CLOSED').length || 0,
        totalProviders: metrics.providers?.length || 0
      };
    } else {
      checks.checks.aiGateway = { status: 'ok', note: 'metrics_not_available' };
    }
  } catch (error) {
    checks.checks.aiGateway = { status: 'error', message: error.message };
  }

  // Check OpenAI API Key
  checks.checks.openai = {
    status: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured'
  };

  // Memory usage con alertas
  const memUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const heapUsedPercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
  
  checks.metrics.memory = {
    rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
    heapUsed: heapUsedMB + ' MB',
    heapTotal: heapTotalMB + ' MB',
    heapUsedPercent: heapUsedPercent + '%',
    external: Math.round(memUsage.external / 1024 / 1024) + ' MB',
    status: heapUsedPercent > 90 ? 'critical' : heapUsedPercent > 70 ? 'warning' : 'ok'
  };

  // CPU usage
  const cpuUsage = process.cpuUsage();
  checks.metrics.cpu = {
    user: Math.round(cpuUsage.user / 1000) + ' ms',
    system: Math.round(cpuUsage.system / 1000) + ' ms'
  };

  // Event Loop Lag (importante para Node.js)
  const eventLoopDelay = process.hrtime();
  setTimeout(() => {
    const lag = process.hrtime(eventLoopDelay);
    const lagMs = (lag[0] * 1000 + lag[1] / 1000000).toFixed(2);
    checks.metrics.eventLoop = {
      lag: lagMs + ' ms',
      status: lagMs > 100 ? 'slow' : 'ok'
    };
  }, 0);

  // Response time total del health check
  const healthCheckDuration = Date.now() - startCheck;
  checks.metrics.performance = {
    healthCheckDuration: healthCheckDuration + ' ms',
    status: healthCheckDuration < 1000 ? 'ok' : healthCheckDuration < 3000 ? 'slow' : 'critical'
  };

  const statusCode = checks.status === 'healthy' ? 200 : 503;
  
  logger.debug('[HEALTH] Health check complete', { 
    status: checks.status, 
    duration: healthCheckDuration,
    memoryUsedPercent: heapUsedPercent 
  });
  
  res.status(statusCode).json(checks);
});

// GET /api/health/simple - Ultra simple health check (no dependencies)
router.get('/simple', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    service: 'econeura-backend',
    version: '3.0.0'
  });
});

module.exports = router;
