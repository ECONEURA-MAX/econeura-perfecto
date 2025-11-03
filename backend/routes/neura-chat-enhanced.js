/**
 * ECONEURA - NEURA Chat Enhanced con Ejecución de Agentes
 * Las NEURAs pueden ejecutar agentes automatizados desde el chat
 */

const express = require('express');
const router = express.Router();
const logger = require('../services/logger');
const NeuraAgentExecutor = require('../services/neuraAgentExecutor');

const executor = new NeuraAgentExecutor();

/**
 * POST /api/neura-chat/:neuraKey
 * Chat con NEURA que puede ejecutar agentes automáticamente
 */
router.post('/:neuraKey', async (req, res) => {
  const { neuraKey } = req.params;
  const { message, userId = null } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }
  
  try {
    const aiGateway = req.app.locals.aiGateway;
    if (!aiGateway) {
      return res.status(503).json({ error: 'AI Gateway not available' });
    }
    
    // 1. Detectar si el mensaje quiere ejecutar un agente
    const intent = executor.detectAgentIntent(message, neuraKey);
    
    // 2. Si detecta intent, ejecutar agente primero
    let agentResult = null;
    if (intent && intent.detected) {
      logger.info('[NEURA Chat] Intent detectado', {
        neuraKey,
        agentId: intent.agentId,
        agentName: intent.agentName
      });
      
      agentResult = await executor.executeAgent(intent.agentId, { message }, userId);
    }
    
    // 3. Construir contexto para la NEURA con resultado del agente
    const agentContext = agentResult ? 
      `\n\n[AGENTE EJECUTADO: ${agentResult.agentName}]\n` +
      `Resultado: ${executor.formatAgentResponse(agentResult)}\n\n` +
      `Basándote en este resultado, responde al usuario.` : '';
    
    // 4. Obtener respuesta de la NEURA
    const neuraIdMap = {
      'ceo': 0, 'ia': 1, 'cfo': 2, 'cdo': 3, 'chro': 4,
      'coo': 5, 'cso': 6, 'cmo': 7, 'ciso': 8, 'cto': 9, 'cino': 10
    };
    
    const neuraId = neuraIdMap[neuraKey] || 0;
    const fullPrompt = message + agentContext;
    
    const aiResponse = await aiGateway.getChatCompletion(fullPrompt, {
      neuraId,
      temperature: 0.7,
      maxTokens: 1500,
      context: { 
        neuraKey,
        agentExecuted: !!agentResult,
        agentId: agentResult?.agentId
      }
    });
    
    // 5. Listar agentes disponibles para esta NEURA
    const availableAgents = executor.getAvailableAgents(neuraKey);
    const insights = executor.getInsights(neuraKey);
    
    // 6. Retornar respuesta completa
    res.json({
      neuraKey,
      neuraId,
      message: aiResponse.output || aiResponse.message,
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      agentExecuted: !!agentResult,
      agentResult: agentResult ? {
        agentId: agentResult.agentId,
        agentName: agentResult.agentName,
        success: agentResult.success,
        mode: agentResult.mode
      } : null,
      availableAgents: availableAgents.map(a => ({
        id: a.id,
        name: a.name,
        trigger: a.trigger
      })),
      insights,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('[NEURA Chat] Error procesando mensaje', {
      neuraKey,
      error: error.message
    });
    
    res.status(500).json({
      error: 'Error procesando mensaje',
      message: error.message
    });
  }
});

module.exports = router;

