const express = require('express');
const router = express.Router();

const startTime = Date.now();

// GET /api/health - Health check completo
router.get('/', async (req, res) => {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    service: 'econeura-backend',
    version: process.env.npm_package_version || '3.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {}
  };

  // Check PostgreSQL (usando pooling configurado)
  try {
    const { checkPostgreSQLHealth } = require('../config/database');
    checks.checks.database = await checkPostgreSQLHealth();
    if (checks.checks.database.status === 'error') {
      checks.status = 'degraded';
    }
  } catch (error) {
    checks.checks.database = { status: 'error', message: error.message };
    checks.status = 'degraded';
  }

  // Check Redis (usando cliente configurado)
  try {
    const { checkRedisHealth } = require('../config/database');
    checks.checks.redis = await checkRedisHealth();
    if (checks.checks.redis.status === 'error') {
      // Redis no es crítico, no cambiar status a degraded
    }
  } catch (error) {
    checks.checks.redis = { status: 'error', message: error.message };
  }

  // Check Key Vault
  try {
    const keyVaultService = require('../services/keyVaultService');
    checks.checks.keyVault = await keyVaultService.healthCheck();
  } catch (error) {
    checks.checks.keyVault = { status: 'error', message: error.message };
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

  // Check OpenAI
  checks.checks.openai = {
    status: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured'
  };

  // Memory usage
  const memUsage = process.memoryUsage();
  checks.memory = {
    rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
    external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
  };

  // CPU usage (opcional)
  const cpuUsage = process.cpuUsage();
  checks.cpu = {
    user: Math.round(cpuUsage.user / 1000) + ' ms',
    system: Math.round(cpuUsage.system / 1000) + ' ms'
  };

  // Disk space (si está disponible)
  try {
    const fs = require('fs');
    fs.statSync('.'); // Verificar acceso al directorio
    checks.disk = {
      available: 'check_disk_util' in require('os') ? 'N/A' : 'check available',
      status: 'ok'
    };
  } catch (error) {
    checks.disk = { status: 'not_available' };
  }

  // Active connections (aproximado)
  checks.connections = {
    active: process.listenerCount('connection') || 0,
    status: 'ok'
  };

  // Response time
  const responseTime = Date.now() - new Date(req.headers['x-request-start'] || Date.now()).getTime();
  checks.performance = {
    responseTime: responseTime + ' ms',
    status: responseTime < 1000 ? 'ok' : 'slow'
  };

  const statusCode = checks.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(checks);
});

module.exports = router;
