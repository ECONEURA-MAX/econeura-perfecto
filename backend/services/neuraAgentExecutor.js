/**
 * ECONEURA - NEURA Agent Executor
 * Permite ejecutar agentes Make/n8n desde el chat de cada NEURA
 */

const axios = require('axios');
const logger = require('./logger');

// Cargar mapeo de agentes por NEURA
const neuraAgentsMap = require('../config/neura-agents-map.json');

class NeuraAgentExecutor {
  constructor() {
    this.agentsMap = neuraAgentsMap;
  }

  /**
   * Obtener agentes disponibles para una NEURA
   */
  getAvailableAgents(neuraKey) {
    const neuraConfig = this.agentsMap[neuraKey];
    if (!neuraConfig) {
      return [];
    }
    
    return neuraConfig.agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      platform: agent.platform,
      trigger: agent.trigger
    }));
  }

  /**
   * Obtener insights disponibles para una NEURA
   */
  getInsights(neuraKey) {
    const neuraConfig = this.agentsMap[neuraKey];
    return neuraConfig?.insights || [];
  }

  /**
   * Ejecutar un agente específico
   */
  async executeAgent(agentId, input = {}, userId = null) {
    // Buscar el agente en todas las NEURAs
    let agentConfig = null;
    let neuraKey = null;

    for (const [key, config] of Object.entries(this.agentsMap)) {
      const agent = config.agents.find(a => a.id === agentId);
      if (agent) {
        agentConfig = agent;
        neuraKey = key;
        break;
      }
    }

    if (!agentConfig) {
      throw new Error(`Agente ${agentId} no encontrado`);
    }

    logger.info('[NEURA Agent] Ejecutando agente', {
      agentId,
      neura: neuraKey,
      platform: agentConfig.platform,
      userId
    });

    // Si no tiene webhook configurado, retornar mock
    if (!agentConfig.webhookUrl || agentConfig.webhookUrl === '') {
      logger.warn('[NEURA Agent] Webhook no configurado, usando mock', { agentId });
      
      return {
        success: true,
        mode: 'mock',
        agentId,
        agentName: agentConfig.name,
        result: {
          status: 'completed',
          message: `[MOCK] ${agentConfig.name} ejecutado correctamente`,
          data: {
            executionId: `mock-${Date.now()}`,
            duration: Math.floor(Math.random() * 5000) + 1000,
            platform: agentConfig.platform
          }
        }
      };
    }

    // Ejecutar webhook real
    try {
      const startTime = Date.now();
      
      const response = await axios.post(agentConfig.webhookUrl, {
        agentId,
        input,
        userId,
        timestamp: new Date().toISOString(),
        source: 'econeura-neura-chat'
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'X-ECONEURA-Source': 'neura-chat',
          'X-ECONEURA-Agent-Id': agentId
        }
      });

      const duration = Date.now() - startTime;

      logger.info('[NEURA Agent] Agente ejecutado exitosamente', {
        agentId,
        duration,
        platform: agentConfig.platform,
        statusCode: response.status
      });

      return {
        success: true,
        mode: 'real',
        agentId,
        agentName: agentConfig.name,
        result: {
          status: 'completed',
          data: response.data,
          duration,
          platform: agentConfig.platform
        }
      };

    } catch (error) {
      logger.error('[NEURA Agent] Error ejecutando agente', {
        agentId,
        error: error.message,
        platform: agentConfig.platform
      });

      return {
        success: false,
        agentId,
        agentName: agentConfig.name,
        error: error.message,
        platform: agentConfig.platform
      };
    }
  }

  /**
   * Detectar si el usuario quiere ejecutar un agente desde el chat
   * Ejemplos: "ejecuta agenda consejo", "run tesorería", "lanza phishing triage"
   */
  detectAgentIntent(message, neuraKey) {
    const lowerMessage = message.toLowerCase();
    
    // Palabras clave que indican ejecución
    const executeKeywords = ['ejecuta', 'run', 'lanza', 'corre', 'inicia', 'dispara', 'activa'];
    
    const hasExecuteIntent = executeKeywords.some(keyword => 
      lowerMessage.includes(keyword)
    );

    if (!hasExecuteIntent) {
      return null;
    }

    // Buscar qué agente quiere ejecutar
    const neuraConfig = this.agentsMap[neuraKey];
    if (!neuraConfig) {
      return null;
    }

    for (const agent of neuraConfig.agents) {
      const agentNameLower = agent.name.toLowerCase();
      if (lowerMessage.includes(agentNameLower)) {
        return {
          detected: true,
          agentId: agent.id,
          agentName: agent.name,
          platform: agent.platform
        };
      }
    }

    return null;
  }

  /**
   * Formatear respuesta de agente para el chat
   */
  formatAgentResponse(executionResult) {
    if (!executionResult.success) {
      return `❌ Error ejecutando ${executionResult.agentName}: ${executionResult.error}`;
    }

    if (executionResult.mode === 'mock') {
      return `✅ [MODO DEMO] ${executionResult.agentName} ejecutado.\n\n` +
             `⚠️ Webhook no configurado. Para ejecutar realmente, configura el webhook en backend/config/neura-agents-map.json\n\n` +
             `Platform: ${executionResult.result.data.platform}\n` +
             `Execution ID: ${executionResult.result.data.executionId}\n` +
             `Duration: ${executionResult.result.data.duration}ms`;
    }

    return `✅ ${executionResult.agentName} ejecutado exitosamente.\n\n` +
           `Platform: ${executionResult.result.platform}\n` +
           `Duration: ${executionResult.result.duration}ms\n` +
           `Status: ${executionResult.result.status}\n\n` +
           `Resultado:\n${JSON.stringify(executionResult.result.data, null, 2)}`;
  }
}

module.exports = NeuraAgentExecutor;

