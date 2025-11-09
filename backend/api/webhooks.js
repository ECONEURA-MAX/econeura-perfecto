const express = require('express');
const router = express.Router();
const logger = require('../services/logger');

// POST /api/webhooks/:agentId - Recibir webhook de Make/n8n
router.post('/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const payload = req.body;

    logger.info(`Webhook received for agent: ${agentId}`, { payload });

    // Procesar el webhook según el agentId
    // En producción, aquí ejecutarías la lógica específica del agente
    
    // Simular ejecución exitosa
    const result = {
      success: true,
      agentId,
      executedAt: new Date().toISOString(),
      payload,
      response: {
        message: 'Webhook processed successfully',
        data: payload
      }
    };

    res.json(result);
  } catch (error) {
    logger.error('Error procesando webhook:', { error: error.message });
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/webhooks/:agentId/info - Obtener información del webhook
router.get('/:agentId/info', (req, res) => {
  const { agentId } = req.params;
  const webhookUrl = `https://econeura-backend-v2.azurewebsites.net/api/webhooks/${agentId}`;
  
  res.json({
    agentId,
    webhookUrl,
    method: 'POST',
    contentType: 'application/json',
    example: {
      action: 'execute',
      data: {
        input: 'Sample input data'
      }
    }
  });
});

module.exports = router;
