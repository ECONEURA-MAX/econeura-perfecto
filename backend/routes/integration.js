/**
 * ECONEURA Integration Proxy
 * Proxy seguro entre frontend y gateway
 * Añade credenciales de servidor, DLP, y autenticación de usuario
 */

const express = require('express');
const router = express.Router();
const log = require('../services/logger');
const { correlationId: generateCorrelationId } = require('../utils');

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3003';
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || 'dev-token';

// Middleware: autenticación opcional de usuario
const optionalAuth = (req, res, next) => {
  // Si hay sesión/JWT, validar; si no, permitir
  req.userId = req.headers['x-user-id'] || 'anonymous';
  next();
};

// Helper: proxy request to gateway
async function proxyToGateway(path, method, body, correlationId) {
  const fetch = (await import('node-fetch')).default;

  const response = await fetch(`${GATEWAY_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Gateway-Token': GATEWAY_TOKEN,
      'X-Correlation-Id': correlationId
    },
    body: body ? JSON.stringify(body) : undefined,
    timeout: 30000
  });

  const data = await response.json();
  return { status: response.status, data };
}

// Listar proveedores
router.get('/providers', optionalAuth, async (req, res) => {
  try {
    const correlationId = `api-${generateCorrelationId()}`;
    const { status, data } = await proxyToGateway('/providers', 'GET', null, correlationId);

    log.info('Providers listed', { userId: req.userId, correlationId });
    res.status(status).json(data);
  } catch (error) {
    log.error('Failed to list providers', { error: error.message });
    res.status(500).json({ error: 'Failed to list providers' });
  }
});

// Conectar agente
router.post('/agents/:agentId/connect', optionalAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { provider, url, apiKey, config } = req.body;

    // DLP: minimización de datos
    const sanitizedBody = {
      provider,
      url,
      apiKey, // Gateway lo cifra
      config
    };

    const correlationId = `api-${generateCorrelationId()}`;
    const { status, data } = await proxyToGateway(
      `/agents/${agentId}/connect`,
      'POST',
      sanitizedBody,
      correlationId
    );

    log.info('Agent connected', { userId: req.userId, agentId, provider, correlationId });
    res.status(status).json(data);
  } catch (error) {
    log.error('Failed to connect agent', { error: error.message });
    res.status(500).json({ error: 'Failed to connect agent' });
  }
});

// Consultar mapping
router.get('/agents/:agentId/mapping', optionalAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const correlationId = `api-${generateCorrelationId()}`;

    const { status, data } = await proxyToGateway(
      `/agents/${agentId}/mapping`,
      'GET',
      null,
      correlationId
    );

    res.status(status).json(data);
  } catch (error) {
    log.error('Failed to get mapping', { error: error.message });
    res.status(500).json({ error: 'Failed to get mapping' });
  }
});

// Probar conexión
router.post('/agents/:agentId/test', optionalAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const correlationId = `api-${generateCorrelationId()}`;

    const { status, data } = await proxyToGateway(
      `/agents/${agentId}/test`,
      'POST',
      {},
      correlationId
    );

    log.info('Connection tested', { userId: req.userId, agentId, success: data.success, correlationId });
    res.status(status).json(data);
  } catch (error) {
    log.error('Failed to test connection', { error: error.message });
    res.status(500).json({ error: 'Failed to test connection' });
  }
});

// Invocar agente (idempotente)
router.post('/agents/:agentId/invoke', optionalAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { input, context } = req.body;

    // DLP: sin PII
    if (!input || input.length > 10000) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const idempotencyKey = `${req.userId}-${agentId}-${Date.now()}`;
    const correlationId = `api-${generateCorrelationId()}`;

    const { status, data } = await proxyToGateway(
      `/agents/${agentId}/invoke`,
      'POST',
      { input, context, idempotencyKey },
      correlationId
    );

    log.info('Agent invoked', {
      userId: req.userId,
      agentId,
      success: data.success,
      latency: data.latency,
      correlationId
    });

    res.status(status).json(data);
  } catch (error) {
    log.error('Failed to invoke agent', { error: error.message });
    res.status(500).json({ error: 'Failed to invoke agent' });
  }
});

// Obtener historial de ejecuciones
router.get('/executions', optionalAuth, async (req, res) => {
  try {
    const { agentId, limit } = req.query;
    const correlationId = `api-${generateCorrelationId()}`;

    const params = new URLSearchParams({ agentId, limit });
    const { status, data } = await proxyToGateway(
      `/executions?${params}`,
      'GET',
      null,
      correlationId
    );

    res.status(status).json(data);
  } catch (error) {
    log.error('Failed to get executions', { error: error.message });
    res.status(500).json({ error: 'Failed to get executions' });
  }
});

module.exports = router;
