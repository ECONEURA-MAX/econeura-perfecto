/**
 * Test Make.com webhook integration
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
    const { webhookUrl, testData } = req.body;

    if (!webhookUrl) {
      return res.status(400).json({
        success: false,
        message: 'URL de webhook Make.com requerida'
      });
    }

    // Test webhook Make.com
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        test: true,
        timestamp: new Date().toISOString(),
        source: 'ECONEURA-Backend',
        data: testData || { message: 'Test desde ECONEURA' }
      })
    });

    const responseText = await response.text();

    res.json({
      success: response.ok,
      status: response.status,
      message: response.ok ? 'Webhook Make.com conectado exitosamente' : 'Error al conectar webhook',
      response: responseText,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Make webhook test error:', { error: error.message });
    res.status(500).json({
      success: false,
      message: `Error: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
};

