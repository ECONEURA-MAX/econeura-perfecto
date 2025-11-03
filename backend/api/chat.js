/**
 * ECONEURA - Serverless Chat Endpoint
 * Vercel AI Gateway con modelos 2025
 */

const AI_GATEWAY_TOKEN = process.env.VERCEL_AI_GATEWAY_TOKEN || process.env.VERCEL_TOKEN;

// Modelos por departamento (Nov 2025)
const NEURA_MODELS = {
  'ceo': 'anthropic/claude-sonnet-4.5',
  'ia': 'openai/gpt-4o',
  'cso': 'anthropic/claude-sonnet-4.5',
  'cto': 'openai/gpt-4o',
  'ciso': 'anthropic/claude-sonnet-4.5',
  'coo': 'openai/gpt-4o',
  'chro': 'openai/gpt-4o',
  'mkt': 'anthropic/claude-sonnet-4.5',
  'cfo': 'anthropic/claude-opus-4',
  'cdo': 'openai/gpt-4o'
};

/**
 * Serverless function handler
 */
module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { input, agentId } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input requerido' });
    }

    // Detectar departamento del agentId (ej: a-ceo-01 → ceo)
    const dept = agentId ? agentId.split('-')[1] : 'ia';
    const model = NEURA_MODELS[dept] || 'openai/gpt-4o';

    // Prompt simple (en producción cargarías desde archivo)
    const systemPrompt = `Eres NEURA-${dept.toUpperCase()}, asistente ejecutivo de ECONEURA. Responde de forma profesional, concisa y en español.`;

    // Llamar a AIMLAPI
    const apiBaseUrl = process.env.OPENAI_API_BASE_URL || 'https://api.openai.com';
    const response = await fetch(`${apiBaseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_GATEWAY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'AI Gateway error');
    }

    const data = await response.json();
    const output = data.choices[0].message.content;

    // Respuesta compatible con frontend actual
    res.json({
      output,
      provider: model.split('/')[0],
      model: model.split('/')[1],
      agentId
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Error al conectar con NEURA',
      details: error.message
    });
  }
};

