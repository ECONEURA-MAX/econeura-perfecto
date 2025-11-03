/**
 * ECONEURA - Ejecutar Webhook Make/n8n
 * Función universal para todas las NEURAs
 */

const axios = require('axios');
const logger = require('../services/logger');

async function ejecutarWebhook({ agente_nombre, datos, neura_id }) {
  try {
    // Cargar mapa de agentes para obtener webhook
    const agentesMap = require('../config/neura-agents-map.json');
    
    // Buscar agente por nombre en el mapa
    let webhook_url = null;
    let agente_config = null;
    
    for (const neura of Object.values(agentesMap)) {
      const agente = neura.agents.find(a => 
        a.name.toLowerCase().includes(agente_nombre.toLowerCase()) ||
        agente_nombre.toLowerCase().includes(a.name.toLowerCase())
      );
      if (agente && agente.config?.webhook_url) {
        webhook_url = agente.config.webhook_url;
        agente_config = agente;
        break;
      }
    }
    
    if (!webhook_url) {
      logger.warn('Webhook no encontrado para agente', { agente_nombre });
      return {
        success: false,
        message: `Agente "${agente_nombre}" no tiene webhook configurado. Disponibles: Agenda Consejo, Tesorería, Variance, Onboarding, Phishing Triage`
      };
    }
    
    logger.info('Ejecutando webhook', { agente_nombre, webhook_url, neura_id });
    
    const response = await axios.post(webhook_url, {
      neura_id,
      agente_nombre,
      timestamp: new Date().toISOString(),
      datos,
      source: 'econeura-function-calling'
    }, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    // CAPTURA COMPLETA de la respuesta del agente para análisis por NEURA
    return {
      success: true,
      status: response.status,
      execution_id: response.data?.execution_id || Date.now(),
      agente: agente_config.name,
      plataforma: agente_config.platform,
      message: `✅ ${agente_config.name} ejecutado en ${agente_config.platform}`,
      // ⚡ DATOS COMPLETOS del agente para que NEURA los analice
      datos_agente: response.data,
      resumen_agente: response.data?.resultado || response.data?.message || 'Procesado correctamente'
    };
  } catch (error) {
    logger.error('Error ejecutando webhook', { error: error.message, agente_nombre });
    return {
      success: false,
      error: error.message,
      message: `Error al ejecutar ${agente_nombre}: ${error.message}`
    };
  }
}

module.exports = { ejecutarWebhook };

