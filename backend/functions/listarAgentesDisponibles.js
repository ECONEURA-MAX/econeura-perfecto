/**
 * ECONEURA - Listar Agentes Disponibles
 * Muestra agentes automatizados disponibles para cada NEURA
 */

const logger = require('../services/logger');

async function listarAgentesDisponibles({ neura_id }) {
  try {
    const agentesMap = require('../config/neura-agents-map.json');
    
    // Obtener agentes de esta NEURA
    const neuraData = agentesMap[neura_id];
    
    if (!neuraData) {
      return {
        success: false,
        message: 'NEURA no encontrada'
      };
    }
    
    const agentesDisponibles = neuraData.agents.map(a => ({
      nombre: a.name,
      descripcion: a.description,
      plataforma: a.platform,
      conectado: !!a.config?.webhook_url,
      webhook_disponible: !!a.config?.webhook_url
    }));
    
    const conectados = agentesDisponibles.filter(a => a.conectado).length;
    
    return {
      success: true,
      neura: neuraData.neura_name,
      total_agentes: agentesDisponibles.length,
      agentes_conectados: conectados,
      agentes: agentesDisponibles,
      message: `Tienes ${conectados} de ${agentesDisponibles.length} agentes conectados y listos para ejecutar.`
    };
  } catch (error) {
    logger.error('Error listando agentes', { error: error.message });
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { listarAgentesDisponibles };

