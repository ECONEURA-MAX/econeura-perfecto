/**
 * ECONEURA - NEURA Agents API
 * Endpoints para gestionar y ejecutar agentes desde el chat de NEURAs
 */

const express = require('express');
const router = express.Router();
const NeuraAgentExecutor = require('../services/neuraAgentExecutor');
const logger = require('../services/logger');

const executor = new NeuraAgentExecutor();

/**
 * GET /api/neura-agents/:neuraKey
 * Obtener agentes disponibles para una NEURA
 */
router.get('/:neuraKey', (req, res) => {
  const { neuraKey } = req.params;
  
  try {
    const agents = executor.getAvailableAgents(neuraKey);
    const insights = executor.getInsights(neuraKey);
    
    res.json({
      neuraKey,
      agents,
      insights,
      totalAgents: agents.length
    });
  } catch (error) {
    logger.error('[NEURA Agents API] Error obteniendo agentes', {
      neuraKey,
      error: error.message
    });
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/neura-agents/execute/:agentId
 * Ejecutar un agente específico
 */
router.post('/execute/:agentId', async (req, res) => {
  const { agentId } = req.params;
  const { input = {}, userId = null } = req.body;
  
  try {
    const result = await executor.executeAgent(agentId, input, userId);
    
    res.json(result);
  } catch (error) {
    logger.error('[NEURA Agents API] Error ejecutando agente', {
      agentId,
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/neura-agents/detect-intent
 * Detectar si un mensaje del chat quiere ejecutar un agente
 */
router.post('/detect-intent', (req, res) => {
  const { message, neuraKey } = req.body;
  
  if (!message || !neuraKey) {
    return res.status(400).json({
      error: 'Missing message or neuraKey'
    });
  }
  
  try {
    const intent = executor.detectAgentIntent(message, neuraKey);
    
    res.json({
      hasIntent: !!intent,
      intent
    });
  } catch (error) {
    logger.error('[NEURA Agents API] Error detectando intent', {
      error: error.message
    });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

