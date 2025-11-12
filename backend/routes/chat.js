/**
 * ECONEURA - Chat Routes Optimizadas
 * Sistema de chat mejorado con análisis avanzado y métricas
 */

const express = require('express');
const router = express.Router();
const logger = require('../services/logger');
const { analyzeNeuraRequest } = require('../services/neuraAnalysisService');

// Middleware para logging de chat
const chatLogger = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - startTime;
    logger.info('Chat request processed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration
    });
    originalSend.call(this, data);
  };
  
  next();
};

router.use(chatLogger);

// Endpoint principal de chat optimizado
router.post('/send', async (req, res) => {
  try {
    const { message, agentId, context, userId, timestamp } = req.body;
    
    // Validación mejorada
    if (!message || !agentId) {
      return res.status(400).json({
        error: 'Mensaje y agentId son requeridos',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }
    
    // Análisis NEURA avanzado
    const neuraAnalysis = await analyzeNeuraRequest(agentId, message);
    
    // Preparar contexto para IA
    const enhancedContext = {
      message,
      agentId,
      context: context || neuraAnalysis.context,
      userId: userId || 'local-user',
      timestamp: timestamp || new Date().toISOString(),
      analysis: neuraAnalysis,
      metadata: {
        confidence: neuraAnalysis.confidence,
        priority: neuraAnalysis.priority,
        suggestedAgents: neuraAnalysis.suggestedAgents
      }
    };
    
    // Usar ResilientAIGateway desde app.locals (si está disponible)
    // Si no está disponible, redirigir a /api/ai-gateway/test
    let response;
    try {
      // Intentar usar ResilientAIGateway directamente
      const aiGateway = req.app?.locals?.aiGateway;
      if (aiGateway && typeof aiGateway.getChatCompletion === 'function') {
        const result = await aiGateway.getChatCompletion(enhancedContext.message, {
          neuraId: parseInt(enhancedContext.agentId?.split('-')[2] || '01') || 0,
          temperature: 0.7,
          maxTokens: 500,
          context: enhancedContext.context
        });
        // result es un objeto con {output, provider, tokens, cost, duration, timestamp}
        response = {
          content: result.output || result.message || 'Sin respuesta',
          tokens: result.tokens || 0,
          cost: result.cost || 0,
          model: result.provider || 'ai-gateway'
        };
      } else {
        // Fallback: retornar error indicando que debe usar /api/ai-gateway/test
        return res.status(503).json({
          error: 'AI Gateway no inicializado',
          message: 'Por favor usa /api/ai-gateway/test',
          code: 'AI_GATEWAY_NOT_INITIALIZED'
        });
      }
    } catch (error) {
      // Si falla, retornar error
      throw error;
    }
    
    // Respuesta optimizada
    // response es un objeto {content, tokens, cost, model} o un string
    const responseContent = typeof response === 'string' ? response : (response?.content || response?.message || 'Lo siento, no pude procesar tu mensaje.');
    const responseTokens = typeof response === 'object' ? (response.tokens || 0) : 0;
    const responseCost = typeof response === 'object' ? (response.cost || 0) : 0;
    const responseModel = typeof response === 'object' ? (response.model || 'ai-gateway') : 'ai-gateway';
    
    const optimizedResponse = {
      response: responseContent,
      agentId,
      confidence: neuraAnalysis.confidence,
      priority: neuraAnalysis.priority,
      suggestedAgents: neuraAnalysis.suggestedAgents,
      shouldExecuteAgents: neuraAnalysis.shouldExecute,
      metadata: {
        processingTime: Date.now() - new Date(timestamp).getTime(),
        tokens: responseTokens,
        cost: responseCost,
        model: responseModel,
        timestamp: new Date().toISOString()
      },
      analysis: {
        context: neuraAnalysis.context,
        reasoning: neuraAnalysis.reasoning,
        confidence: neuraAnalysis.confidence
      }
    };
    
    res.json(optimizedResponse);
    
  } catch (error) {
    logger.error('Error en chat /send', {
      error: error.message,
      stack: error.stack,
      agentId: req.body?.agentId
    });
    
    const errorDetails = process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message;
    
    const errorResponse = {
      error: 'Error interno del servidor',
      message: errorDetails,
      code: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString(),
      retryable: error.code === 'TIMEOUT' || error.code === 'NETWORK_ERROR'
    };
    
    res.status(500).json(errorResponse);
  }
});

// Endpoint para obtener historial de chat
router.get('/history/:userId', async (req, res) => {
  try {
    // Placeholder para historial - implementar con base de datos
    const history = {
      messages: [],
      total: 0,
      hasMore: false
    };
    
    res.json(history);
    
  } catch (error) {
    logger.error('[CHAT] Error en /history:', { error: error.message });
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// Endpoint para limpiar historial
router.delete('/history/:userId', async (req, res) => {
  try {
    // TODO: Implementar DELETE historial real con DB
    res.json({ 
      success: true, 
      message: 'Historial cleared (mock - implementar con PostgreSQL)',
      userId: req.params.userId
    });
    
  } catch (error) {
    logger.error('[CHAT] Error en limpiar historial:', { error: error.message });
    res.status(500).json({ error: 'Error al limpiar historial' });
  }
});

// Endpoint para feedback de mensajes
router.post('/feedback', async (req, res) => {
  try {
    const { messageId, rating, feedback } = req.body;
    
    if (!messageId || !rating) {
      return res.status(400).json({ error: 'messageId y rating son requeridos' });
    }
    
    // TODO: Guardar feedback en DB
    logger.info(`[CHAT] Feedback recibido`, { messageId, rating, feedback });
    
    res.json({ success: true, message: 'Feedback guardado' });
    
  } catch (error) {
    logger.error('[CHAT] Error en feedback:', { error: error.message });
    res.status(500).json({ error: 'Error al guardar feedback' });
  }
});

// Endpoint para métricas de chat
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      totalMessages: 0,
      averageResponseTime: 0,
      successRate: 0,
      topAgents: [],
      recentActivity: []
    };
    
    res.json(metrics);
    
  } catch (error) {
    logger.error('[CHAT] Error en métricas:', { error: error.message });
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
});

module.exports = router;
