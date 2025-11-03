/**
 * ECONEURA MAX PREMIUM - Automation API Endpoints
 * Endpoints para gestión de servicios automáticos
 */

const express = require('express');
const router = express.Router();

// Middleware para verificar que los servicios automáticos estén disponibles
const requireAutomation = (req, res, next) => {
  if (!global.automationService) {
    return res.status(503).json({
      error: 'Automation services not available',
      message: 'ECONEURA MAX PREMIUM automation services are not initialized'
    });
  }
  next();
};

// GET /api/automation/status - Estado del sistema automático
router.get('/status', requireAutomation, (req, res) => {
  try {
    const status = global.automationService.getSystemStatus();
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get automation status',
      message: error.message
    });
  }
});

// GET /api/automation/stats - Estadísticas de automatización
router.get('/stats', requireAutomation, (req, res) => {
  try {
    const stats = global.automationService.getAutomationStats();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get automation stats',
      message: error.message
    });
  }
});

// POST /api/automation/workflow/execute - Ejecutar workflow automático
router.post('/workflow/execute', requireAutomation, async (req, res) => {
  try {
    const { workflowId, context = {} } = req.body;
    
    if (!workflowId) {
      return res.status(400).json({
        error: 'Workflow ID required',
        message: 'Please provide a workflowId in the request body'
      });
    }

    const workflowService = global.automationService.services.get('workflow');
    const execution = await workflowService.executeWorkflow(workflowId, context);
    
    res.json({
      success: true,
      data: execution,
      message: 'Workflow executed successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to execute workflow',
      message: error.message
    });
  }
});

// POST /api/automation/collaboration/trigger - Activar colaboración automática
router.post('/collaboration/trigger', requireAutomation, async (req, res) => {
  try {
    const { message, context, neuraId } = req.body;
    
    if (!message || !neuraId) {
      return res.status(400).json({
        error: 'Message and neuraId required',
        message: 'Please provide message and neuraId in the request body'
      });
    }

    const collaborationService = global.automationService.services.get('collaboration');
    const triggered = await collaborationService.detectTrigger(message, context || '', neuraId);
    
    res.json({
      success: true,
      data: { triggered },
      message: triggered ? 'Collaboration triggered successfully' : 'No collaboration triggered'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to trigger collaboration',
      message: error.message
    });
  }
});

// POST /api/automation/analytics/collect - Recopilar métricas automáticas
router.post('/analytics/collect', requireAutomation, async (req, res) => {
  try {
    const { metricId, data } = req.body;
    
    if (!metricId || !data) {
      return res.status(400).json({
        error: 'Metric ID and data required',
        message: 'Please provide metricId and data in the request body'
      });
    }

    const analyticsService = global.automationService.services.get('analytics');
    const dataPoint = await analyticsService.collectMetrics(metricId, data);
    
    res.json({
      success: true,
      data: dataPoint,
      message: 'Metrics collected successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to collect metrics',
      message: error.message
    });
  }
});

// GET /api/automation/analytics/report - Generar reporte automático
router.get('/analytics/report', requireAutomation, async (req, res) => {
  try {
    const { metricId, period = 'daily' } = req.query;
    
    if (!metricId) {
      return res.status(400).json({
        error: 'Metric ID required',
        message: 'Please provide metricId as query parameter'
      });
    }

    const analyticsService = global.automationService.services.get('analytics');
    const report = await analyticsService.generateReport(metricId, period);
    
    res.json({
      success: true,
      data: report,
      message: 'Report generated successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate report',
      message: error.message
    });
  }
});

// GET /api/automation/security/alerts - Obtener alertas de seguridad activas
router.get('/security/alerts', requireAutomation, (req, res) => {
  try {
    const securityService = global.automationService.services.get('security');
    const alerts = securityService.getActiveSecurityAlerts();
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
      message: 'Security alerts retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get security alerts',
      message: error.message
    });
  }
});

// POST /api/automation/security/compliance - Generar reporte de compliance
router.post('/security/compliance', requireAutomation, async (req, res) => {
  try {
    const { type = 'gdpr' } = req.body;
    
    const securityService = global.automationService.services.get('security');
    const report = await securityService.generateComplianceReport(type);
    
    res.json({
      success: true,
      data: report,
      message: `${type.toUpperCase()} compliance report generated successfully`
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate compliance report',
      message: error.message
    });
  }
});

// POST /api/automation/event - Procesar evento automático
router.post('/event', requireAutomation, async (req, res) => {
  try {
    const { eventType, eventData } = req.body;
    
    if (!eventType || !eventData) {
      return res.status(400).json({
        error: 'Event type and data required',
        message: 'Please provide eventType and eventData in the request body'
      });
    }

    await global.automationService.processAutomatedEvent(eventType, eventData);
    
    res.json({
      success: true,
      message: 'Automated event processed successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to process automated event',
      message: error.message
    });
  }
});

// GET /api/automation/workflows - Listar workflows disponibles
router.get('/workflows', requireAutomation, (req, res) => {
  try {
    const workflowService = global.automationService.services.get('workflow');
    const workflows = Array.from(workflowService.workflows.values());
    
    res.json({
      success: true,
      data: workflows,
      count: workflows.length,
      message: 'Workflows retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get workflows',
      message: error.message
    });
  }
});

// GET /api/automation/collaborations - Listar colaboraciones disponibles
router.get('/collaborations', requireAutomation, (req, res) => {
  try {
    const collaborationService = global.automationService.services.get('collaboration');
    const collaborations = Array.from(collaborationService.collaborations.values());
    
    res.json({
      success: true,
      data: collaborations,
      count: collaborations.length,
      message: 'Collaborations retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get collaborations',
      message: error.message
    });
  }
});

// GET /api/automation/metrics - Listar métricas disponibles
router.get('/metrics', requireAutomation, (req, res) => {
  try {
    const analyticsService = global.automationService.services.get('analytics');
    const metrics = Array.from(analyticsService.metrics.values());
    
    res.json({
      success: true,
      data: metrics,
      count: metrics.length,
      message: 'Metrics retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get metrics',
      message: error.message
    });
  }
});

// GET /api/automation/health - Health check específico para automatización
router.get('/health', (req, res) => {
  const automationAvailable = !!global.automationService;
  const status = automationAvailable ? 'healthy' : 'unavailable';
  
  res.json({
    status,
    automation: automationAvailable,
    timestamp: new Date().toISOString(),
    services: automationAvailable ? {
      workflow: !!global.automationService.services.get('workflow'),
      collaboration: !!global.automationService.services.get('collaboration'),
      analytics: !!global.automationService.services.get('analytics'),
      security: !!global.automationService.services.get('security')
    } : null
  });
});

module.exports = router;

