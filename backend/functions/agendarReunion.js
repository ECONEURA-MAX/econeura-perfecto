/**
 * ECONEURA - Agendar Reunión (CEO)
 * Función para crear eventos de calendario
 */

const logger = require('../services/logger');

async function agendarReunion({ fecha, hora, duracion_minutos, titulo, participantes }) {
  try {
    logger.info('Agendando reunión', { fecha, hora, titulo });
    
    // En producción: Integración con Google Calendar API
    // Por ahora: Mock que retorna confirmación
    
    const reunion = {
      id: `reunion-${Date.now()}`,
      fecha,
      hora,
      duracion_minutos,
      titulo,
      participantes: participantes || [],
      link_meet: `https://meet.google.com/mock-${Date.now().toString(36)}`,
      estado: 'pendiente_confirmacion',
      requiere_hitl: true
    };
    
    return {
      success: true,
      reunion,
      message: `Reunión "${titulo}" programada para ${fecha} a las ${hora}. Requiere confirmación humana.`,
      hitl_required: true
    };
  } catch (error) {
    logger.error('Error agendando reunión', { error: error.message });
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { agendarReunion };

