/**
 * ECONEURA - Chat NEURA Endpoint (Serverless)
 * /api/invoke/:id - OpenAI API directo con modelos 2025
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Modelos Mammouth AI 2025
const NEURA_MODELS = {
  'ceo': { model: 'mistral-medium-3.1', name: 'Mistral Medium 3.1' },
  'ia': { model: 'mistral-medium-3.1', name: 'Mistral Medium 3.1' },
  'cso': { model: 'mistral-medium-3.1', name: 'Mistral Medium 3.1' },
  'cto': { model: 'mistral-medium-3.1', name: 'Mistral Medium 3.1' },
  'ciso': { model: 'mistral-medium-3.1', name: 'Mistral Medium 3.1' },
  'coo': { model: 'mistral-medium-3.1', name: 'Mistral Medium 3.1' },
  'chro': { model: 'mistral-medium-3.1', name: 'Mistral Medium 3.1' },
  'mkt': { model: 'mistral-medium-3.1', name: 'Mistral Medium 3.1' },
  'cfo': { model: 'mistral-medium-3.1', name: 'Mistral Medium 3.1' },
  'cdo': { model: 'mistral-medium-3.1', name: 'Mistral Medium 3.1' },
  'cino': { model: 'mistral-medium-3.1', name: 'Mistral Medium 3.1' }
};

/**
 * Serverless function handler
 */
module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Correlation-Id, X-Department');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id: agentId } = req.query;
    const { input, messages, image } = req.body;

    if (!input && !messages) {
      return res.status(400).json({ error: 'Input o messages requerido' });
    }

    // Detectar departamento (ej: a-ceo-01 → ceo)
    let dept = 'ia';
    if (agentId && agentId.includes('-')) {
      dept = agentId.split('-')[1] || 'ia';
    }
    const modelConfig = NEURA_MODELS[dept] || NEURA_MODELS['ia'];

    // Prompts profesionales por departamento (ECONEURA v1.2 - Prompt Maestro)
    const SYSTEM_PROMPTS = {
      'ceo': `Eres NEURA-CEO de ECONEURA (plataforma de gestión de agentes IA). Asesor ejecutivo digital.

CONTEXTO ECONEURA: Gestionamos 10 NEURAs (CEO, CTO IA, CFO, CDO, CHRO, COO, CSO, CMO, CISO, CTO M&A) + 44 agentes automatizados (Make/n8n). Tu rol: priorizar decisiones ejecutivas.

IDENTIDAD: Conciso, directo, basado en datos. Respuestas ≤300 palabras.

RESPONDE:
• Resumen (≤5 líneas)
• 3 acciones máximo
• 2 riesgos principales
• Pregunta: "¿Ejecuto, HITL o refino?"

GUARDRAILS: Comunicados, pagos, personal → HITL obligatorio.

LÍMITES: Sin PII. Respuestas ≤300 palabras. Directo al punto.`,

      'ia': `Eres NEURA-IA de ECONEURA. Director de plataforma IA. Conciso y cuantitativo.

MANDATO: Optimización FinOps, latencia, fallbacks. Cambios de proveedor → HITL.

RESPONDE:
• Estado: coste, latencia, errores
• 2-3 acciones
• Pregunta HITL

LÍMITES: ≤200 palabras. Directo.`,

      'cso': `Eres NEURA-CSO de ECONEURA. Estrategia y riesgos emergentes. Analítico.

RESPONDE:
• Top 3 riesgos
• 2 acciones
• Pregunta HITL

LÍMITES: ≤200 palabras.`,

      'cto': `Eres NEURA-CTO de ECONEURA. Tecnología, SLO e incidentes.

RESPONDE:
• Estado SLO/incidentes
• 2-3 acciones
• Pregunta HITL

LÍMITES: ≤200 palabras. Despliegues → HITL.`,

      'ciso': `Eres NEURA-CISO de ECONEURA. Seguridad, CVE, compliance.

RESPONDE:
• CVE críticos + estado
• 2 acciones
• Pregunta HITL

LÍMITES: ≤200 palabras. Bloqueos → HITL.`,

      'coo': `Eres NEURA-COO de ECONEURA. Operaciones, SLA, backlog.

RESPONDE:
• Estado SLA y backlog
• 2 acciones
• Pregunta HITL

LÍMITES: ≤200 palabras. Replanificaciones → HITL.`,

      'chro': `Eres NEURA-CHRO de ECONEURA. RRHH, clima, vacantes.

RESPONDE:
• eNPS y vacantes
• 2 acciones
• Pregunta HITL

LÍMITES: ≤200 palabras. PII protegida. Contrataciones → HITL.`,

      'mkt': `Eres NEURA-CMO de ECONEURA. Marketing, ventas, ROI.

RESPONDE:
• Embudo y ROI
• 2 acciones
• Pregunta HITL

LÍMITES: ≤200 palabras. Campañas masivas → HITL.`,

      'cfo': `Eres NEURA-CFO de ECONEURA. Finanzas, runway, variance.

RESPONDE:
• Runway y variance
• 2 acciones
• Pregunta HITL

LÍMITES: ≤200 palabras. Pagos → HITL.`,

      'cdo': `Eres NEURA-CDO de ECONEURA. Datos, calidad, pipelines.

RESPONDE:
• Calidad datos y SLAs
• 2 acciones
• Pregunta HITL

LÍMITES: ≤200 palabras. Cambios schema → HITL.`,

      'cino': `Eres NEURA-CINO de ECONEURA. Innovación, POCs, tech radar.

RESPONDE:
• Estado POCs activos
• Tecnología recomendada
• Pregunta HITL

LÍMITES: ≤200 palabras. Inversiones >10k€ → HITL.`
    };

    const systemPrompt = SYSTEM_PROMPTS[dept] || SYSTEM_PROMPTS['ia'];

    // Construir mensajes
    // Construir mensajes con soporte de imágenes
    let chatMessages;
    if (messages) {
      chatMessages = messages;
    } else {
      chatMessages = [
        { role: 'system', content: systemPrompt }
      ];
      
      if (image) {
        // Mensaje multimodal con imagen
        chatMessages.push({
          role: 'user',
          content: [
            { type: 'text', text: input },
            { type: 'image_url', image_url: { url: image } }
          ]
        });
      } else {
        // Mensaje solo texto
        chatMessages.push({ role: 'user', content: input });
      }
    }

    // Function calling: obtener tools disponibles
    const functionRegistry = require('../../services/functionRegistry');
    const tools = functionRegistry.getTools(0);
    
    // Llamar a Mammouth AI con function calling
    const apiBaseUrl = process.env.OPENAI_API_BASE_URL || 'https://api.openai.com';
    const response = await fetch(`${apiBaseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelConfig.model,
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 500,
        tools: tools,
        tool_choice: "auto"
      })
    });
    
    // Timeout más corto para respuestas rápidas
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout after 30s')), 30000)
    );
    
    const responsePromise = response;
    const timedResponse = await Promise.race([responsePromise, timeoutPromise]);

    if (!timedResponse.ok) {
      const errorData = await timedResponse.json().catch(() => ({ message: timedResponse.statusText }));
      throw new Error(errorData.message || 'Mammouth API error');
    }

    const data = await timedResponse.json();
    const message = data.choices[0]?.message;
    
    // Verificar si NEURA quiere ejecutar una función
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);
      
      const logger = require('../../services/logger');
      logger.info('NEURA solicita ejecutar función', { 
        functionName, 
        args: functionArgs,
        agentId 
      });
      
      // Ejecutar función
      const functionResult = await functionRegistry.executeFunction(
        functionName,
        functionArgs,
        0
      );
      
      // Verificar si requiere HITL
      const requiresHITL = functionRegistry.requiresHITL(functionName, functionResult);
      
      // ⚡ MULTI-TURNO: NEURA analiza resultado del agente
      // Agregar resultado de función a los mensajes y volver a llamar al modelo
      chatMessages.push({
        role: 'assistant',
        content: null,
        tool_calls: [{
          id: toolCall.id,
          type: 'function',
          function: {
            name: functionName,
            arguments: JSON.stringify(functionArgs)
          }
        }]
      });
      
      chatMessages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        name: functionName,
        content: JSON.stringify(functionResult)
      });
      
      // Segunda llamada al modelo para que ANALICE los datos del agente
      const analysisResponse = await fetch(`${apiBaseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelConfig.model,
          messages: chatMessages,
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      if (!analysisResponse.ok) {
        throw new Error('Error en análisis de resultado del agente');
      }
      
      const analysisData = await analysisResponse.json();
      const analysisMessage = analysisData.choices[0]?.message;
      
      // Respuesta con ANÁLISIS del NEURA sobre datos del agente
      return res.json({
        output: analysisMessage.content || `✅ Agente ejecutado y analizado`,
        function_call: {
          name: functionName,
          arguments: functionArgs,
          result: functionResult,
          hitl_required: requiresHITL,
          status: functionResult.success ? 'executed' : 'failed',
          analyzed: true // Indica que NEURA ya analizó los datos
        },
        provider: 'mammouth',
        model: data.model || 'mistral-medium-3.1',
        tokens: (data.usage?.total_tokens || 0) + (analysisData.usage?.total_tokens || 0),
        cost: ((data.usage?.total_tokens || 0) + (analysisData.usage?.total_tokens || 0)) * 0.001,
        agentId,
        usage: {
          function_call: data.usage,
          analysis: analysisData.usage,
          total_tokens: (data.usage?.total_tokens || 0) + (analysisData.usage?.total_tokens || 0)
        }
      });
    }
    
    // Respuesta normal (sin función)
    const output = message?.content || 'Sin respuesta';

    res.json({
      output,
      provider: 'mammouth',
      model: data.model || 'mistral-medium-3.1',
      tokens: data.usage?.total_tokens || 0,
      cost: (data.usage?.total_tokens || 0) * 0.001,
      agentId,
      usage: data.usage
    });

  } catch (error) {
    const logger = require('../../services/logger');
    logger.error('Chat error in serverless function', {
      agentId: req.query.id,
      error: error.message,
      stack: error.stack
    });

    const errorDetails = process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message;

    res.status(500).json({
      output: `Lo siento, estoy teniendo problemas técnicos. ${errorDetails}`,
      provider: 'error',
      model: 'Fallback',
      agentId: req.query.id,
      error: errorDetails
    });
  }
};

