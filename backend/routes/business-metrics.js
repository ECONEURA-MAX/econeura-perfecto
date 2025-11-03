const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Sistema de métricas de negocio
class BusinessMetricsService {
  constructor() {
    this.metrics = {
      revenue: 0,
      costSavings: 0,
      automationCount: 0,
      userSatisfaction: 0,
      uptime: 0,
      errorRate: 0,
      responseTime: 0,
      activeUsers: 0,
      totalExecutions: 0,
      successRate: 0
    };
    this.historicalData = [];
    this.startMetricsCollection();
  }

  startMetricsCollection() {
    // Recolectar métricas cada 5 minutos
    setInterval(() => {
      this.collectMetrics();
    }, 5 * 60 * 1000);
  }

  collectMetrics() {
    const timestamp = new Date().toISOString();
    
    // Simular recolección de métricas reales
    const newMetrics = {
      timestamp,
      revenue: this.calculateRevenue(),
      costSavings: this.calculateCostSavings(),
      automationCount: this.getAutomationCount(),
      userSatisfaction: this.getUserSatisfaction(),
      uptime: this.getUptime(),
      errorRate: this.getErrorRate(),
      responseTime: this.getResponseTime(),
      activeUsers: this.getActiveUsers(),
      totalExecutions: this.getTotalExecutions(),
      successRate: this.getSuccessRate()
    };

    this.historicalData.unshift(newMetrics);
    
    // Mantener solo las últimas 1000 entradas
    if (this.historicalData.length > 1000) {
      this.historicalData = this.historicalData.slice(0, 1000);
    }

    // Actualizar métricas actuales
    this.metrics = newMetrics;
  }

  calculateRevenue() {
    // Simular cálculo de ingresos basado en ejecuciones
    const baseRevenue = 1000;
    const executionMultiplier = this.getTotalExecutions() * 0.1;
    return baseRevenue + executionMultiplier;
  }

  calculateCostSavings() {
    // Simular ahorro de costos por automatización
    const baseSavings = 5000;
    const automationMultiplier = this.getAutomationCount() * 50;
    return baseSavings + automationMultiplier;
  }

  getAutomationCount() {
    // Contar agentes activos
    const makeConfig = this.loadConfig('agents.json');
    const n8nConfig = this.loadConfig('n8n-agents.json');
    const chatgptConfig = this.loadConfig('chatgpt-agents.json');
    
    const makeCount = Object.keys(makeConfig).length;
    const n8nCount = Object.keys(n8nConfig).length;
    const chatgptCount = Object.keys(chatgptConfig).length;
    
    return makeCount + n8nCount + chatgptCount;
  }

  getUserSatisfaction() {
    // Simular satisfacción del usuario basada en éxito y tiempo de respuesta
    const successRate = this.getSuccessRate();
    const responseTime = this.getResponseTime();
    const uptime = this.getUptime();
    
    return Math.min(100, (successRate * 0.4 + (100 - responseTime / 10) * 0.3 + uptime * 0.3));
  }

  getUptime() {
    // Simular uptime basado en health checks
    return Math.random() * 10 + 90; // 90-100%
  }

  getErrorRate() {
    // Simular tasa de error
    return Math.random() * 5; // 0-5%
  }

  getResponseTime() {
    // Simular tiempo de respuesta promedio
    return Math.random() * 2000 + 500; // 500-2500ms
  }

  getActiveUsers() {
    // Simular usuarios activos
    return Math.floor(Math.random() * 50) + 10; // 10-60 usuarios
  }

  getTotalExecutions() {
    // Simular total de ejecuciones
    return Math.floor(Math.random() * 1000) + 500; // 500-1500 ejecuciones
  }

  getSuccessRate() {
    // Simular tasa de éxito
    return Math.random() * 20 + 80; // 80-100%
  }

  loadConfig(filename) {
    try {
      const configPath = path.join(__dirname, '../config', filename);
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
      return {};
    } catch (error) {
      return {};
    }
  }

  getCurrentMetrics() {
    return this.metrics;
  }

  getHistoricalData(limit = 100) {
    return this.historicalData.slice(0, limit);
  }

  getKPIs() {
    const current = this.metrics;
    const previous = this.historicalData[1] || current;
    
    return {
      revenue: {
        current: current.revenue,
        previous: previous.revenue,
        change: ((current.revenue - previous.revenue) / previous.revenue * 100).toFixed(1)
      },
      costSavings: {
        current: current.costSavings,
        previous: previous.costSavings,
        change: ((current.costSavings - previous.costSavings) / previous.costSavings * 100).toFixed(1)
      },
      userSatisfaction: {
        current: current.userSatisfaction,
        previous: previous.userSatisfaction,
        change: ((current.userSatisfaction - previous.userSatisfaction) / previous.userSatisfaction * 100).toFixed(1)
      },
      uptime: {
        current: current.uptime,
        previous: previous.uptime,
        change: ((current.uptime - previous.uptime) / previous.uptime * 100).toFixed(1)
      }
    };
  }

  getROI() {
    const revenue = this.metrics.revenue;
    const costSavings = this.metrics.costSavings;
    const totalValue = revenue + costSavings;
    const investment = 10000; // Simular inversión inicial
    
    return {
      totalValue,
      investment,
      roi: ((totalValue - investment) / investment * 100).toFixed(1),
      paybackPeriod: (investment / (totalValue / 12)).toFixed(1) // meses
    };
  }
}

const businessMetricsService = new BusinessMetricsService();

// Endpoint para métricas actuales
router.get('/current', (req, res) => {
  res.json({
    metrics: businessMetricsService.getCurrentMetrics(),
    timestamp: new Date().toISOString()
  });
});

// Endpoint para datos históricos
router.get('/historical', (req, res) => {
  const { limit } = req.query;
  const data = businessMetricsService.getHistoricalData(parseInt(limit) || 100);
  
  res.json({
    data,
    count: data.length,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para KPIs
router.get('/kpis', (req, res) => {
  const kpis = businessMetricsService.getKPIs();
  
  res.json({
    kpis,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para ROI
router.get('/roi', (req, res) => {
  const roi = businessMetricsService.getROI();
  
  res.json({
    roi,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para dashboard completo
router.get('/dashboard', (req, res) => {
  const metrics = businessMetricsService.getCurrentMetrics();
  const kpis = businessMetricsService.getKPIs();
  const roi = businessMetricsService.getROI();
  const historical = businessMetricsService.getHistoricalData(24); // Últimas 24 horas
  
  res.json({
    current: metrics,
    kpis,
    roi,
    historical,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
