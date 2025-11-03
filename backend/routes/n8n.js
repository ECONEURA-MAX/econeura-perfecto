const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Cargar configuración n8n
const n8nConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/n8n-agents.json'), 'utf8'));

// Endpoint para conectar agente a n8n
router.post('/connect/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { webhookUrl } = req.body;
    
    if (!n8nConfig[agentId]) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }
    
    // Actualizar webhook URL
    n8nConfig[agentId].webhookUrl = webhookUrl;
    n8nConfig[agentId].status = 'active';
    
    // Guardar configuración
    fs.writeFileSync(
      path.join(__dirname, '../config/n8n-agents.json'), 
      JSON.stringify(n8nConfig, null, 2)
    );
    
    res.json({ 
      success: true, 
      message: `Agente ${agentId} conectado a n8n`,
      webhookUrl 
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para ejecutar agente n8n
router.post('/execute/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { input, context } = req.body;
    
    const agent = n8nConfig[agentId];
    if (!agent || agent.status !== 'active') {
      return res.status(404).json({ error: 'Agente no disponible' });
    }
    
    // Simular ejecución n8n
    const response = await fetch(agent.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent_id: agentId,
        input,
        context,
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error(`n8n error: ${response.status}`);
    }
    
    const result = await response.json();
    
    res.json({
      success: true,
      agent_id: agentId,
      provider: 'n8n',
      status: 200,
      response: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para obtener estado de agentes n8n
router.get('/status', (req, res) => {
  res.json({
    provider: 'n8n',
    agents: Object.keys(n8nConfig).length,
    active: Object.values(n8nConfig).filter(a => a.status === 'active').length,
    config: n8nConfig
  });
});

module.exports = router;
