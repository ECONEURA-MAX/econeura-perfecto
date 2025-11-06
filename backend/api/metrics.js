/**
 * ECONEURA - Metrics Endpoint (Prometheus-compatible)
 * Enterprise-grade metrics for monitoring and alerting
 */

const express = require('express');
const router = express.Router();
const os = require('os');

const startTime = Date.now();
let requestCount = 0;
let errorCount = 0;
let totalResponseTime = 0;

// Middleware para contar requests (debe ser aplicado globalmente)
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  requestCount++;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    totalResponseTime += duration;
    
    if (res.statusCode >= 400) {
      errorCount++;
    }
  });
  
  next();
};

/**
 * GET /api/metrics - Prometheus-compatible metrics
 * Formato: # HELP metric_name description
 *          # TYPE metric_name type
 *          metric_name{label="value"} value
 */
router.get('/', async (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  // Calcular memoria del sistema
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  
  // Calcular CPU load
  const cpus = os.cpus();
  const cpuCount = cpus.length;
  const loadAvg = os.loadavg();
  
  // Métricas de la aplicación
  const avgResponseTime = requestCount > 0 ? (totalResponseTime / requestCount).toFixed(2) : 0;
  const errorRate = requestCount > 0 ? ((errorCount / requestCount) * 100).toFixed(2) : 0;
  
  // Obtener métricas de dependencies
  let dbConnections = 0;
  let redisConnected = 0;
  
  try {
    const { checkPostgreSQLHealth } = require('../config/database');
    const dbCheck = await checkPostgreSQLHealth();
    if (dbCheck.status === 'ok') {
      dbConnections = 1;
    }
  } catch (error) {
    // Database no disponible
  }
  
  try {
    const { checkRedisHealth } = require('../config/database');
    const redisCheck = await checkRedisHealth();
    if (redisCheck.status === 'ok') {
      redisConnected = 1;
    }
  } catch (error) {
    // Redis no disponible
  }
  
  // Formato Prometheus
  const metrics = `
# HELP econeura_uptime_seconds Time since application started
# TYPE econeura_uptime_seconds counter
econeura_uptime_seconds ${uptime}

# HELP econeura_requests_total Total number of HTTP requests
# TYPE econeura_requests_total counter
econeura_requests_total ${requestCount}

# HELP econeura_errors_total Total number of HTTP errors (4xx, 5xx)
# TYPE econeura_errors_total counter
econeura_errors_total ${errorCount}

# HELP econeura_error_rate_percent Percentage of requests that resulted in errors
# TYPE econeura_error_rate_percent gauge
econeura_error_rate_percent ${errorRate}

# HELP econeura_response_time_avg_ms Average response time in milliseconds
# TYPE econeura_response_time_avg_ms gauge
econeura_response_time_avg_ms ${avgResponseTime}

# HELP econeura_memory_heap_used_bytes Node.js heap memory used
# TYPE econeura_memory_heap_used_bytes gauge
econeura_memory_heap_used_bytes ${memUsage.heapUsed}

# HELP econeura_memory_heap_total_bytes Node.js heap memory total
# TYPE econeura_memory_heap_total_bytes gauge
econeura_memory_heap_total_bytes ${memUsage.heapTotal}

# HELP econeura_memory_rss_bytes Node.js RSS memory
# TYPE econeura_memory_rss_bytes gauge
econeura_memory_rss_bytes ${memUsage.rss}

# HELP econeura_memory_external_bytes Node.js external memory
# TYPE econeura_memory_external_bytes gauge
econeura_memory_external_bytes ${memUsage.external}

# HELP econeura_cpu_user_microseconds CPU user time
# TYPE econeura_cpu_user_microseconds counter
econeura_cpu_user_microseconds ${cpuUsage.user}

# HELP econeura_cpu_system_microseconds CPU system time
# TYPE econeura_cpu_system_microseconds counter
econeura_cpu_system_microseconds ${cpuUsage.system}

# HELP econeura_system_memory_total_bytes System total memory
# TYPE econeura_system_memory_total_bytes gauge
econeura_system_memory_total_bytes ${totalMemory}

# HELP econeura_system_memory_free_bytes System free memory
# TYPE econeura_system_memory_free_bytes gauge
econeura_system_memory_free_bytes ${freeMemory}

# HELP econeura_system_memory_used_bytes System used memory
# TYPE econeura_system_memory_used_bytes gauge
econeura_system_memory_used_bytes ${usedMemory}

# HELP econeura_system_cpu_count Number of CPU cores
# TYPE econeura_system_cpu_count gauge
econeura_system_cpu_count ${cpuCount}

# HELP econeura_system_load_avg_1m System load average (1 minute)
# TYPE econeura_system_load_avg_1m gauge
econeura_system_load_avg_1m ${loadAvg[0]}

# HELP econeura_system_load_avg_5m System load average (5 minutes)
# TYPE econeura_system_load_avg_5m gauge
econeura_system_load_avg_5m ${loadAvg[1]}

# HELP econeura_system_load_avg_15m System load average (15 minutes)
# TYPE econeura_system_load_avg_15m gauge
econeura_system_load_avg_15m ${loadAvg[2]}

# HELP econeura_database_connected Database connection status (1=connected, 0=disconnected)
# TYPE econeura_database_connected gauge
econeura_database_connected ${dbConnections}

# HELP econeura_redis_connected Redis connection status (1=connected, 0=disconnected)
# TYPE econeura_redis_connected gauge
econeura_redis_connected ${redisConnected}

# HELP econeura_info Application info
# TYPE econeura_info gauge
econeura_info{version="${process.env.npm_package_version || '3.0.0'}",node_version="${process.version}",environment="${process.env.NODE_ENV || 'development'}"} 1
`.trim();

  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(metrics);
});

/**
 * GET /api/metrics/json - JSON format metrics
 */
router.get('/json', async (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  const avgResponseTime = requestCount > 0 ? (totalResponseTime / requestCount).toFixed(2) : 0;
  const errorRate = requestCount > 0 ? ((errorCount / requestCount) * 100).toFixed(2) : 0;
  
  res.json({
    timestamp: new Date().toISOString(),
    uptime,
    requests: {
      total: requestCount,
      errors: errorCount,
      errorRate: parseFloat(errorRate),
      avgResponseTime: parseFloat(avgResponseTime)
    },
    memory: {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      rss: memUsage.rss,
      external: memUsage.external
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    system: {
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpuCount: os.cpus().length,
      loadAvg: os.loadavg(),
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version
    }
  });
});

module.exports = {
  router,
  metricsMiddleware
};


