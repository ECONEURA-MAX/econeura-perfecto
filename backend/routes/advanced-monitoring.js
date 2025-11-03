const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Sistema de monitoreo avanzado y alertas inteligentes
class AdvancedMonitoringService {
  constructor() {
    this.monitoringData = {
      systemHealth: {
        overall: 'healthy',
        score: 95,
        components: {
          database: { status: 'healthy', latency: 50, uptime: 99.9 },
          cache: { status: 'healthy', hitRate: 85, memory: 60 },
          apis: { status: 'healthy', responseTime: 800, errorRate: 0.5 },
          ai: { status: 'healthy', latency: 1200, successRate: 98 }
        }
      },
      performance: {
        cpu: 45,
        memory: 65,
        disk: 30,
        network: 25,
        responseTime: 800,
        throughput: 120
      },
      business: {
        activeUsers: 45,
        revenue: 12500,
        costSavings: 18000,
        automationExecutions: 250,
        successRate: 96
      },
      security: {
        threats: 0,
        vulnerabilities: 2,
        failedLogins: 3,
        blockedIPs: 1,
        securityScore: 92
      }
    };
    
    this.alerts = [];
    this.metrics = [];
    this.startAdvancedMonitoring();
  }

  startAdvancedMonitoring() {
    // Monitoreo cada 30 segundos
    setInterval(() => {
      this.collectMetrics();
      this.checkAlerts();
      this.updateSystemHealth();
    }, 30000);
  }

  collectMetrics() {
    const timestamp = new Date().toISOString();
    
    // Simular recolección de métricas reales
    const metrics = {
      timestamp,
      system: {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        network: Math.random() * 100
      },
      performance: {
        responseTime: Math.random() * 2000 + 500,
        throughput: Math.random() * 200 + 50,
        errorRate: Math.random() * 5,
        uptime: 99.5 + Math.random() * 0.5
      },
      business: {
        activeUsers: Math.floor(Math.random() * 100) + 20,
        revenue: Math.random() * 20000 + 10000,
        costSavings: Math.random() * 30000 + 15000,
        automationExecutions: Math.floor(Math.random() * 500) + 100
      },
      security: {
        threats: Math.floor(Math.random() * 5),
        vulnerabilities: Math.floor(Math.random() * 10),
        failedLogins: Math.floor(Math.random() * 20),
        blockedIPs: Math.floor(Math.random() * 5)
      }
    };

    this.metrics.unshift(metrics);
    
    // Mantener solo las últimas 1000 entradas
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(0, 1000);
    }
  }

  checkAlerts() {
    const current = this.metrics[0];
    if (!current) return;

    // Alerta de CPU alta
    if (current.system.cpu > 80) {
      this.createAlert({
        type: 'warning',
        category: 'performance',
        title: 'CPU Usage High',
        message: `CPU usage is at ${current.system.cpu.toFixed(1)}%`,
        severity: 'medium',
        component: 'system'
      });
    }

    // Alerta de memoria alta
    if (current.system.memory > 85) {
      this.createAlert({
        type: 'warning',
        category: 'performance',
        title: 'Memory Usage High',
        message: `Memory usage is at ${current.system.memory.toFixed(1)}%`,
        severity: 'high',
        component: 'system'
      });
    }

    // Alerta de tiempo de respuesta alto
    if (current.performance.responseTime > 3000) {
      this.createAlert({
        type: 'error',
        category: 'performance',
        title: 'High Response Time',
        message: `Response time is ${current.performance.responseTime.toFixed(0)}ms`,
        severity: 'high',
        component: 'api'
      });
    }

    // Alerta de tasa de error alta
    if (current.performance.errorRate > 5) {
      this.createAlert({
        type: 'error',
        category: 'reliability',
        title: 'High Error Rate',
        message: `Error rate is ${current.performance.errorRate.toFixed(1)}%`,
        severity: 'critical',
        component: 'api'
      });
    }

    // Alerta de amenazas de seguridad
    if (current.security.threats > 0) {
      this.createAlert({
        type: 'security',
        category: 'security',
        title: 'Security Threat Detected',
        message: `${current.security.threats} security threats detected`,
        severity: 'critical',
        component: 'security'
      });
    }

    // Alerta de vulnerabilidades
    if (current.security.vulnerabilities > 5) {
      this.createAlert({
        type: 'warning',
        category: 'security',
        title: 'Multiple Vulnerabilities',
        message: `${current.security.vulnerabilities} vulnerabilities detected`,
        severity: 'medium',
        component: 'security'
      });
    }
  }

  createAlert(alertData) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...alertData,
      timestamp: new Date().toISOString(),
      status: 'active',
      acknowledged: false
    };

    // Evitar duplicados
    const existingAlert = this.alerts.find(a => 
      a.title === alert.title && 
      a.status === 'active' && 
      (Date.now() - new Date(a.timestamp).getTime()) < 300000 // 5 minutos
    );

    if (!existingAlert) {
      this.alerts.unshift(alert);
      
      // Mantener solo las últimas 500 alertas
      if (this.alerts.length > 500) {
        this.alerts = this.alerts.slice(0, 500);
      }
    }
  }

  updateSystemHealth() {
    const current = this.metrics[0];
    if (!current) return;

    let healthScore = 100;
    const components = {};

    // Evaluar CPU
    if (current.system.cpu > 90) {
      healthScore -= 20;
      components.cpu = { status: 'critical', score: 20 };
    } else if (current.system.cpu > 80) {
      healthScore -= 10;
      components.cpu = { status: 'warning', score: 40 };
    } else {
      components.cpu = { status: 'healthy', score: 100 };
    }

    // Evaluar memoria
    if (current.system.memory > 90) {
      healthScore -= 20;
      components.memory = { status: 'critical', score: 20 };
    } else if (current.system.memory > 80) {
      healthScore -= 10;
      components.memory = { status: 'warning', score: 40 };
    } else {
      components.memory = { status: 'healthy', score: 100 };
    }

    // Evaluar tiempo de respuesta
    if (current.performance.responseTime > 5000) {
      healthScore -= 25;
      components.responseTime = { status: 'critical', score: 15 };
    } else if (current.performance.responseTime > 2000) {
      healthScore -= 15;
      components.responseTime = { status: 'warning', score: 50 };
    } else {
      components.responseTime = { status: 'healthy', score: 100 };
    }

    // Evaluar tasa de error
    if (current.performance.errorRate > 10) {
      healthScore -= 30;
      components.errorRate = { status: 'critical', score: 10 };
    } else if (current.performance.errorRate > 5) {
      healthScore -= 20;
      components.errorRate = { status: 'warning', score: 30 };
    } else {
      components.errorRate = { status: 'healthy', score: 100 };
    }

    // Evaluar seguridad
    if (current.security.threats > 0) {
      healthScore -= 25;
      components.security = { status: 'critical', score: 25 };
    } else if (current.security.vulnerabilities > 5) {
      healthScore -= 10;
      components.security = { status: 'warning', score: 60 };
    } else {
      components.security = { status: 'healthy', score: 100 };
    }

    this.monitoringData.systemHealth = {
      overall: healthScore > 80 ? 'healthy' : healthScore > 60 ? 'warning' : 'critical',
      score: Math.max(0, healthScore),
      components,
      lastUpdate: new Date().toISOString()
    };
  }

  getMonitoringDashboard() {
    const current = this.metrics[0] || this.monitoringData;
    const activeAlerts = this.alerts.filter(a => a.status === 'active');
    const recentAlerts = this.alerts.slice(0, 10);
    
    return {
      systemHealth: this.monitoringData.systemHealth,
      currentMetrics: current,
      activeAlerts: activeAlerts.length,
      recentAlerts,
      trends: this.calculateTrends(),
      recommendations: this.generateRecommendations(),
      timestamp: new Date().toISOString()
    };
  }

  calculateTrends() {
    if (this.metrics.length < 2) return {};
    
    const latest = this.metrics[0];
    const previous = this.metrics[1];
    
    return {
      cpu: this.calculateTrend(latest.system.cpu, previous.system.cpu),
      memory: this.calculateTrend(latest.system.memory, previous.system.memory),
      responseTime: this.calculateTrend(latest.performance.responseTime, previous.performance.responseTime),
      errorRate: this.calculateTrend(latest.performance.errorRate, previous.performance.errorRate),
      activeUsers: this.calculateTrend(latest.business.activeUsers, previous.business.activeUsers),
      revenue: this.calculateTrend(latest.business.revenue, previous.business.revenue)
    };
  }

  calculateTrend(current, previous) {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  }

  generateRecommendations() {
    const recommendations = [];
    const current = this.metrics[0];
    if (!current) return recommendations;

    // Recomendación de CPU
    if (current.system.cpu > 70) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        title: 'Optimize CPU Usage',
        description: 'Consider scaling up or optimizing CPU-intensive operations',
        action: 'scale_cpu'
      });
    }

    // Recomendación de memoria
    if (current.system.memory > 75) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'Optimize Memory Usage',
        description: 'Consider memory optimization or scaling up',
        action: 'optimize_memory'
      });
    }

    // Recomendación de tiempo de respuesta
    if (current.performance.responseTime > 2000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'Optimize Response Time',
        description: 'Consider caching, database optimization, or CDN',
        action: 'optimize_response_time'
      });
    }

    // Recomendación de seguridad
    if (current.security.vulnerabilities > 3) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        title: 'Address Security Vulnerabilities',
        description: 'Update dependencies and patch vulnerabilities',
        action: 'patch_vulnerabilities'
      });
    }

    return recommendations;
  }

  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
    }
    return alert;
  }

  resolveAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'resolved';
      alert.resolvedAt = new Date().toISOString();
    }
    return alert;
  }

  getAlerts(filters = {}) {
    let filteredAlerts = [...this.alerts];
    
    if (filters.status) {
      filteredAlerts = filteredAlerts.filter(a => a.status === filters.status);
    }
    
    if (filters.severity) {
      filteredAlerts = filteredAlerts.filter(a => a.severity === filters.severity);
    }
    
    if (filters.category) {
      filteredAlerts = filteredAlerts.filter(a => a.category === filters.category);
    }
    
    if (filters.limit) {
      filteredAlerts = filteredAlerts.slice(0, filters.limit);
    }
    
    return filteredAlerts;
  }
}

const monitoringService = new AdvancedMonitoringService();

// Endpoint para dashboard de monitoreo
router.get('/dashboard', (req, res) => {
  const dashboard = monitoringService.getMonitoringDashboard();
  res.json(dashboard);
});

// Endpoint para alertas
router.get('/alerts', (req, res) => {
  const { status, severity, category, limit } = req.query;
  const alerts = monitoringService.getAlerts({
    status,
    severity,
    category,
    limit: limit ? parseInt(limit) : undefined
  });
  
  res.json({
    alerts,
    count: alerts.length,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para reconocer alerta
router.post('/alerts/:id/acknowledge', (req, res) => {
  const { id } = req.params;
  const alert = monitoringService.acknowledgeAlert(id);
  
  if (!alert) {
    return res.status(404).json({
      error: 'Alert not found',
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    alert,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para resolver alerta
router.post('/alerts/:id/resolve', (req, res) => {
  const { id } = req.params;
  const alert = monitoringService.resolveAlert(id);
  
  if (!alert) {
    return res.status(404).json({
      error: 'Alert not found',
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    alert,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para métricas históricas
router.get('/metrics', (req, res) => {
  const { limit, component } = req.query;
  let metrics = monitoringService.metrics;
  
  if (component) {
    metrics = metrics.map(m => ({
      timestamp: m.timestamp,
      [component]: m[component]
    }));
  }
  
  if (limit) {
    metrics = metrics.slice(0, parseInt(limit));
  }
  
  res.json({
    metrics,
    count: metrics.length,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para salud del sistema
router.get('/health', (req, res) => {
  const health = monitoringService.monitoringData.systemHealth;
  res.json(health);
});

module.exports = router;
