/**
 * Test ChatGPT API direct integration
 */
const logger = require('../../services/logger');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { apiKey, model, testMessage } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'API Key de OpenAI requerida'
      });
    }

    const testModel = model || 'gpt-4o-mini';
    const message = testMessage || 'Hola, esto es una prueba';

    // Test AIMLAPI
    const apiBaseUrl = process.env.OPENAI_API_BASE_URL || 'https://api.openai.com';
    const response = await fetch(`${apiBaseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: testModel,
        messages: [
          { role: 'system', content: 'Eres un asistente de prueba de ECONEURA.' },
          { role: 'user', content: message }
        ],
        max_tokens: 100
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API call failed');
    }

    const data = await response.json();
    const output = data.choices[0]?.message?.content || 'Sin respuesta';

    res.json({
      success: true,
      message: 'API ChatGPT conectada exitosamente',
      model: testModel,
      response: output,
      usage: data.usage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('ChatGPT API test error:', { error: error.message });
    res.status(500).json({
      success: false,
      message: `Error: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
};

