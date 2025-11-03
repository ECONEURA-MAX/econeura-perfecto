/**
 * ECONEURA - Enviar Alerta (CISO, CEO, CFO)
 * Función para notificaciones críticas
 */

const logger = require('../services/logger');

async function enviarAlerta({ severidad, categoria, mensaje, destinatarios }) {
  try {
    logger.info('Enviando alerta', { severidad, categoria });
    
    // En producción: Integración con Slack/Teams/Email
    // Por ahora: Log + confirmación
    
    const alerta = {
      id: `alerta-${Date.now()}`,
      severidad, // 1-5
      categoria, // 'seguridad', 'financiero', 'operacional'
      mensaje,
      destinatarios: destinatarios || ['ceo@econeura.com'],
      timestamp: new Date().toISOString(),
      estado: 'enviada',
      requiere_hitl: severidad >= 4 // Severidad alta requiere aprobación
    };
    
    logger.warn('Alerta generada', alerta);
    
    return {
      success: true,
      alerta,
      message: `Alerta ${categoria} (severidad ${severidad}) generada.`,
      hitl_required: severidad >= 4
    };
  } catch (error) {
    logger.error('Error enviando alerta', { error: error.message });
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { enviarAlerta };

