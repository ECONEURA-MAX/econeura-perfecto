const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Cargar configuración ChatGPT
const chatgptConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/chatgpt-agents.json'), 'utf8'));

// Endpoint para conectar agente a ChatGPT
router.post('/connect/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { apiKey } = req.body;
    
    if (!chatgptConfig[agentId]) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }
    
    // Actualizar API key
    chatgptConfig[agentId].apiKey = apiKey;
    chatgptConfig[agentId].status = 'active';
    
    // Guardar configuración
    fs.writeFileSync(
      path.join(__dirname, '../config/chatgpt-agents.json'), 
      JSON.stringify(chatgptConfig, null, 2)
    );
    
    res.json({ 
      success: true, 
      message: `Agente ${agentId} conectado a ChatGPT`,
      provider: 'chatgpt'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para ejecutar agente ChatGPT
router.post('/execute/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { input, context } = req.body;
    
    const agent = chatgptConfig[agentId];
    if (!agent || agent.status !== 'active') {
      return res.status(404).json({ error: 'Agente no disponible' });
    }
    
    // Ejecutar ChatGPT
    const response = await fetch(agent.webhookUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${agent.apiKey || process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres ${agent.description}. Responde como especialista en tu área.`
          },
          {
            role: 'user',
            content: `${input}\n\nContexto: ${context}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`ChatGPT error: ${response.status}`);
    }
    
    const result = await response.json();
    
    res.json({
      success: true,
      agent_id: agentId,
      provider: 'chatgpt',
      status: 200,
      response: result.choices[0].message.content,
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

// Endpoint para obtener estado de agentes ChatGPT
router.get('/status', (req, res) => {
  res.json({
    provider: 'chatgpt',
    agents: Object.keys(chatgptConfig).length,
    active: Object.values(chatgptConfig).filter(a => a.status === 'active').length,
    config: chatgptConfig
  });
});

module.exports = router;
