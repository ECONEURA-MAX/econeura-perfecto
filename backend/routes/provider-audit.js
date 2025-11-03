const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Sistema de auditoría de proveedores
class ProviderAuditService {
  constructor() {
    this.auditLogs = [];
    this.logFile = path.join(__dirname, '../logs/provider-audit.log');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(action, provider, agentId, details = {}) {
    const auditEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      action,
      provider,
      agentId,
      details,
      userAgent: details.userAgent || 'system',
      ip: details.ip || '127.0.0.1'
    };
    
    this.auditLogs.unshift(auditEntry);
    
    // Mantener solo las últimas 1000 entradas en memoria
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(0, 1000);
    }
    
    // Escribir a archivo de log
    this.writeToLogFile(auditEntry);
    
    return auditEntry;
  }

  writeToLogFile(entry) {
    const logLine = JSON.stringify(entry) + '\n';
    fs.appendFileSync(this.logFile, logLine);
  }

  getAuditLogs(filters = {}) {
    let filtered = this.auditLogs;
    
    if (filters.provider) {
      filtered = filtered.filter(log => log.provider === filters.provider);
    }
    
    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }
    
    if (filters.agentId) {
      filtered = filtered.filter(log => log.agentId === filters.agentId);
    }
    
    if (filters.startDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }
    
    if (filters.endDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    }
    
    const limit = parseInt(filters.limit) || 100;
    return filtered.slice(0, limit);
  }

  getAuditStats() {
    const total = this.auditLogs.length;
    const byProvider = {};
    const byAction = {};
    const byDay = {};
    
    this.auditLogs.forEach(log => {
      byProvider[log.provider] = (byProvider[log.provider] || 0) + 1;
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      
      const day = log.timestamp.split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });
    
    return {
      total,
      byProvider,
      byAction,
      byDay,
      last24Hours: Object.values(byDay).reduce((sum, count) => sum + count, 0)
    };
  }

  exportAuditLogs(format = 'json') {
    const logs = this.auditLogs;
    
    if (format === 'csv') {
      const headers = ['timestamp', 'action', 'provider', 'agentId', 'details'];
      const csv = [
        headers.join(','),
        ...logs.map(log => [
          log.timestamp,
          log.action,
          log.provider,
          log.agentId,
          JSON.stringify(log.details)
        ].join(','))
      ].join('\n');
      
      return csv;
    }
    
    return logs;
  }
}

const auditService = new ProviderAuditService();

// Middleware de auditoría
const auditMiddleware = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log después de la respuesta
      auditService.log(
        action,
        req.headers['x-provider'] || 'unknown',
        req.params.agentId || 'unknown',
        {
          method: req.method,
          url: req.url,
          userAgent: req.headers['user-agent'],
          ip: req.ip || req.connection.remoteAddress,
          statusCode: res.statusCode,
          responseSize: data ? data.length : 0
        }
      );
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Endpoint para obtener logs de auditoría
router.get('/audit', (req, res) => {
  const filters = {
    provider: req.query.provider,
    action: req.query.action,
    agentId: req.query.agentId,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    limit: req.query.limit
  };
  
  const logs = auditService.getAuditLogs(filters);
  
  res.json({
    logs,
    stats: auditService.getAuditStats(),
    timestamp: new Date().toISOString()
  });
});

// Endpoint para estadísticas de auditoría
router.get('/audit/stats', (req, res) => {
  res.json({
    stats: auditService.getAuditStats(),
    timestamp: new Date().toISOString()
  });
});

// Endpoint para exportar logs
router.get('/audit/export', (req, res) => {
  const format = req.query.format || 'json';
  const data = auditService.exportAuditLogs(format);
  
  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=provider-audit.csv');
    res.send(data);
  } else {
    res.json({
      logs: data,
      count: data.length,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para crear log de auditoría (para testing)
router.post('/audit', (req, res) => {
  const { action, provider, agentId, details } = req.body;
  
  const auditEntry = auditService.log(
    action || 'test',
    provider || 'system',
    agentId || 'test-agent',
    details || {}
  );
  
  res.json({
    success: true,
    auditEntry,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
