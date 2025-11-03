/**
 * ECONEURA - Function Registry
 * Registro central de funciones disponibles para NEURAs
 */

const { ejecutarWebhook } = require('../functions/ejecutarWebhook');
const { agendarReunion } = require('../functions/agendarReunion');
const { consultarDatos } = require('../functions/consultarDatos');
const { enviarAlerta } = require('../functions/enviarAlerta');
const { generarReporte } = require('../functions/generarReporte');
const { listarAgentesDisponibles } = require('../functions/listarAgentesDisponibles');

const logger = require('./logger');

class FunctionRegistry {
  constructor() {
    this.functions = {
      ejecutar_webhook: ejecutarWebhook,
      agendar_reunion: agendarReunion,
      consultar_datos: consultarDatos,
      enviar_alerta: enviarAlerta,
      generar_reporte: generarReporte,
      listar_agentes_disponibles: listarAgentesDisponibles
    };
    
    // Definiciones de tools para Mistral
    this.tools = [
      {
        type: "function",
        function: {
          name: "ejecutar_webhook",
          description: "Ejecuta un agente automatizado de Make.com o n8n. Agentes disponibles: 'Agenda Consejo', 'Tesorería', 'Variance', 'Onboarding', 'Phishing Triage'. Usa cuando el usuario pida ejecutar una automatización.",
          parameters: {
            type: "object",
            properties: {
              agente_nombre: {
                type: "string",
                description: "Nombre del agente a ejecutar (ej: 'Agenda Consejo', 'Tesorería', 'Variance')"
              },
              datos: {
                type: "object",
                description: "Datos de entrada para el agente (ej: {fecha, monto, etc})"
              },
              neura_id: {
                type: "string",
                description: "ID de la NEURA que ejecuta (ej: a-ceo-01)"
              }
            },
            required: ["agente_nombre", "neura_id"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "agendar_reunion",
          description: "Agenda una reunión en el calendario corporativo (solo CEO)",
          parameters: {
            type: "object",
            properties: {
              fecha: {
                type: "string",
                description: "Fecha en formato YYYY-MM-DD"
              },
              hora: {
                type: "string",
                description: "Hora en formato HH:MM (24h)"
              },
              duracion_minutos: {
                type: "number",
                description: "Duración en minutos"
              },
              titulo: {
                type: "string",
                description: "Título de la reunión"
              },
              participantes: {
                type: "array",
                items: { type: "string" },
                description: "Lista de emails de participantes"
              }
            },
            required: ["fecha", "hora", "titulo"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "consultar_datos",
          description: "Consulta datos de tesorería, ventas u operaciones en tiempo real",
          parameters: {
            type: "object",
            properties: {
              tipo: {
                type: "string",
                enum: ["tesoreria", "ventas", "operaciones"],
                description: "Tipo de datos a consultar"
              },
              periodo: {
                type: "string",
                description: "Periodo: hoy, semana, mes, trimestre, año"
              },
              filtros: {
                type: "object",
                description: "Filtros adicionales"
              }
            },
            required: ["tipo"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "enviar_alerta",
          description: "Envía alerta crítica a Slack/Teams/Email (solo para issues de severidad alta)",
          parameters: {
            type: "object",
            properties: {
              severidad: {
                type: "number",
                minimum: 1,
                maximum: 5,
                description: "1=Info, 2=Low, 3=Medium, 4=High, 5=Critical"
              },
              categoria: {
                type: "string",
                enum: ["seguridad", "financiero", "operacional", "legal", "reputacional"],
                description: "Categoría de la alerta"
              },
              mensaje: {
                type: "string",
                description: "Mensaje de la alerta"
              },
              destinatarios: {
                type: "array",
                items: { type: "string" },
                description: "Emails de destinatarios"
              }
            },
            required: ["severidad", "categoria", "mensaje"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "generar_reporte",
          description: "Genera reporte ejecutivo/financiero/operacional en PDF o Excel",
          parameters: {
            type: "object",
            properties: {
              tipo: {
                type: "string",
                enum: ["ejecutivo", "financiero", "seguridad", "operacional", "marketing"],
                description: "Tipo de reporte"
              },
              formato: {
                type: "string",
                enum: ["pdf", "excel", "markdown"],
                description: "Formato del reporte"
              },
              periodo: {
                type: "string",
                description: "Periodo del reporte"
              },
              incluir_metricas: {
                type: "boolean",
                description: "Incluir gráficos y KPIs"
              }
            },
            required: ["tipo", "formato"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "listar_agentes_disponibles",
          description: "SOLO usa esta función si el usuario EXPLÍCITAMENTE pide 'lista agentes' o 'qué agentes tengo'. NO la uses para preguntas generales sobre capacidades del modelo.",
          parameters: {
            type: "object",
            properties: {
              neura_id: {
                type: "string",
                description: "ID de la NEURA (ej: a-ceo-01)"
              }
            },
            required: ["neura_id"]
          }
        }
      }
    ];
  }
  
  getTools(neuraId) {
    // Todas las NEURAs pueden usar todas las funciones
    // HITL decidirá qué requiere aprobación
    return this.tools;
  }
  
  async executeFunction(name, parameters, neuraId) {
    const func = this.functions[name];
    
    if (!func) {
      logger.error('Función no encontrada', { name, neuraId });
      throw new Error(`Función ${name} no existe`);
    }
    
    logger.info('Ejecutando función', { name, parameters, neuraId });
    
    try {
      const result = await func(parameters);
      
      logger.info('Función ejecutada', { name, success: result.success, neuraId });
      
      return result;
    } catch (error) {
      logger.error('Error ejecutando función', { name, error: error.message, neuraId });
      throw error;
    }
  }
  
  requiresHITL(functionName, result) {
    // Determinar si requiere aprobación humana
    const alwaysHITL = ['agendar_reunion', 'enviar_alerta'];
    
    if (alwaysHITL.includes(functionName)) {
      return true;
    }
    
    if (result.hitl_required) {
      return true;
    }
    
    if (functionName === 'enviar_alerta' && result.alerta?.severidad >= 4) {
      return true;
    }
    
    return false;
  }
}

module.exports = new FunctionRegistry();

