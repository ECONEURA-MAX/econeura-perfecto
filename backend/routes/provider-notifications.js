const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Sistema de notificaciones de proveedores
class ProviderNotificationService {
  constructor() {
    this.notifications = [];
    this.subscribers = new Map();
  }

  addNotification(type, provider, message, severity = 'info') {
    const notification = {
      id: Date.now() + Math.random(),
      type,
      provider,
      message,
      severity,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    this.notifications.unshift(notification);
    
    // Mantener solo las últimas 100 notificaciones
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }
    
    // Notificar a suscriptores
    this.notifySubscribers(notification);
    
    return notification;
  }

  subscribe(provider, callback) {
    if (!this.subscribers.has(provider)) {
      this.subscribers.set(provider, []);
    }
    this.subscribers.get(provider).push(callback);
  }

  notifySubscribers(notification) {
    const callbacks = this.subscribers.get(notification.provider) || [];
    callbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  getNotifications(provider = null, limit = 50) {
    let filtered = this.notifications;
    
    if (provider) {
      filtered = filtered.filter(n => n.provider === provider);
    }
    
    return filtered.slice(0, limit);
  }

  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  getStats() {
    const total = this.notifications.length;
    const unread = this.notifications.filter(n => !n.read).length;
    const byProvider = {};
    const bySeverity = {};
    
    this.notifications.forEach(n => {
      byProvider[n.provider] = (byProvider[n.provider] || 0) + 1;
      bySeverity[n.severity] = (bySeverity[n.severity] || 0) + 1;
    });
    
    return {
      total,
      unread,
      byProvider,
      bySeverity
    };
  }
}

const notificationService = new ProviderNotificationService();

// Endpoint para obtener notificaciones
router.get('/notifications', (req, res) => {
  const { provider, limit } = req.query;
  const notifications = notificationService.getNotifications(provider, parseInt(limit) || 50);
  
  res.json({
    notifications,
    stats: notificationService.getStats(),
    timestamp: new Date().toISOString()
  });
});

// Endpoint para marcar notificación como leída
router.post('/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  notificationService.markAsRead(parseInt(id));
  
  res.json({
    success: true,
    message: 'Notification marked as read',
    timestamp: new Date().toISOString()
  });
});

// Endpoint para crear notificación (para testing)
router.post('/notifications', (req, res) => {
  const { type, provider, message, severity } = req.body;
  
  const notification = notificationService.addNotification(
    type || 'test',
    provider || 'system',
    message || 'Test notification',
    severity || 'info'
  );
  
  res.json({
    success: true,
    notification,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para estadísticas de notificaciones
router.get('/notifications/stats', (req, res) => {
  res.json({
    stats: notificationService.getStats(),
    timestamp: new Date().toISOString()
  });
});

// Simular notificaciones automáticas
setInterval(() => {
  const providers = ['make', 'n8n', 'chatgpt'];
  const types = ['connection', 'execution', 'error', 'success'];
  const severities = ['info', 'warning', 'error', 'success'];
  
  const provider = providers[Math.floor(Math.random() * providers.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  const severity = severities[Math.floor(Math.random() * severities.length)];
  
  const messages = {
    connection: `${provider} connection established`,
    execution: `${provider} agent executed successfully`,
    error: `${provider} execution failed`,
    success: `${provider} operation completed`
  };
  
  notificationService.addNotification(
    type,
    provider,
    messages[type],
    severity
  );
}, 30000); // Cada 30 segundos

module.exports = router;
