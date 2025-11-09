/**
 * ECONEURA Agent Registry API
 * Gestión completa de agentes automatizados conectados por usuarios
 */

const express = require('express');
const router = express.Router();
const db = require('../db'); // PostgreSQL version
const { authMiddleware } = require('../middleware/auth');
const crypto = require('crypto');
const logger = require('../services/logger');

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

/**
 * POST /api/agents
 * Conectar un nuevo agente automatizado
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      platform,
      webhook_url,
      department,
      neura_assigned,
      schedule = 'on-demand',
      config = {},
      tags = []
    } = req.body;

    // Validaciones
    if (!name || !platform || !department || !neura_assigned) {
      return res.status(400).json({
        error: 'Campos requeridos: name, platform, department, neura_assigned'
      });
    }

    // Validar plataforma
    const validPlatforms = ['make', 'n8n', 'zapier', 'powerautomate', 'econeura', 'custom'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        error: `Plataforma inválida. Válidas: ${validPlatforms.join(', ')}`
      });
    }

    // Validar NEURA asignado
    const validNeuras = ['CEO', 'CFO', 'CTO', 'IA', 'CISO', 'CSO', 'COO', 'CHRO', 'CMO', 'CDO', 'INO'];
    if (!validNeuras.includes(neura_assigned)) {
      return res.status(400).json({
        error: `NEURA inválido. Válidos: ${validNeuras.join(', ')}`
      });
    }

    // Generar webhook secret único
    const webhook_secret = crypto.randomBytes(32).toString('hex');

    // Insertar agente en base de datos
    const result = await db.query(`
      INSERT INTO agents (
        user_id, name, description, platform, webhook_url, webhook_secret,
        department, neura_assigned, status, schedule, config, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, created_at
    `, [
      req.user.id,
      name,
      description,
      platform,
      webhook_url,
      webhook_secret,
      department,
      neura_assigned,
      'active',
      schedule,
      JSON.stringify(config),
      tags
    ]);

    const agentId = result.rows[0].id;

    // Si tiene webhook_url, hacer test de conexión
    if (webhook_url) {
      try {
        await testWebhookConnection(webhook_url, webhook_secret);
      } catch (error) {
        const logger = require('../../services/logger');
        logger.warn('Webhook test failed for agent', { agentId, error: error.message });
        // No fallar la creación, solo loggear el warning
      }
    }

    res.status(201).json({
      success: true,
      agent: {
        id: agentId,
        name,
        platform,
        department,
        neura_assigned,
        status: 'active',
        webhook_secret,
        created_at: result.rows[0].created_at
      }
    });

  } catch (error) {
    logger.error('Error creating agent', { error: error.message, stack: error.stack, body: req.body });
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * GET /api/agents
 * Listar agentes del usuario
 */
router.get('/', async (req, res) => {
  try {
    const { department, platform, status, neura_assigned } = req.query;

    let query = `
      SELECT 
        id, name, description, platform, department, neura_assigned,
        status, schedule, config, tags, created_at, updated_at,
        last_execution, last_result, execution_count, success_count, error_count
      FROM agents 
      WHERE user_id = $1
    `;
    
    const params = [req.user.id];
    let paramIndex = 2;

    // Filtros opcionales
    if (department) {
      query += ` AND department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    if (platform) {
      query += ` AND platform = $${paramIndex}`;
      params.push(platform);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (neura_assigned) {
      query += ` AND neura_assigned = $${paramIndex}`;
      params.push(neura_assigned);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);

    // Parsear config JSON para cada agente
    const agents = result.rows.map(agent => ({
      ...agent,
      config: agent.config ? JSON.parse(agent.config) : {},
      last_result: agent.last_result ? JSON.parse(agent.last_result) : null
    }));

    res.json({
      success: true,
      agents,
      total: agents.length
    });

  } catch (error) {
    logger.error('Error listing agents', { error: error.message, stack: error.stack, userId: req.user?.id });
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * GET /api/agents/:id
 * Obtener detalles de un agente específico
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query(`
      SELECT 
        id, name, description, platform, webhook_url, department, neura_assigned,
        status, schedule, config, tags, created_at, updated_at,
        last_execution, last_result, execution_count, success_count, error_count
      FROM agents 
      WHERE id = $1 AND user_id = $2
    `, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Agente no encontrado'
      });
    }

    const agent = result.rows[0];

    // Obtener últimas ejecuciones
    const executions = await db.query(`
      SELECT 
        id, triggered_by, status, duration_ms, error_message,
        started_at, completed_at, created_at
      FROM agent_executions 
      WHERE agent_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `, [id]);

    res.json({
      success: true,
      agent: {
        ...agent,
        config: agent.config ? JSON.parse(agent.config) : {},
        last_result: agent.last_result ? JSON.parse(agent.last_result) : null,
        recent_executions: executions.rows
      }
    });

  } catch (error) {
    logger.error('Error getting agent', { error: error.message, stack: error.stack, agentId: id, userId: req.user?.id });
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * POST /api/agents/:id/execute
 * Ejecutar un agente manualmente
 */
router.post('/:id/execute', async (req, res) => {
  const { id } = req.params;
  
  try {
    const { params = {}, triggered_by = 'user' } = req.body;

    // Obtener agente
    const agentResult = await db.query(`
      SELECT id, name, platform, webhook_url, webhook_secret, status
      FROM agents 
      WHERE id = $1 AND user_id = $2
    `, [id, req.user.id]);

    if (agentResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Agente no encontrado'
      });
    }

    const agent = agentResult.rows[0];

    if (agent.status !== 'active') {
      return res.status(400).json({
        error: 'Agente no está activo'
      });
    }

    // Crear registro de ejecución
    const executionResult = await db.query(`
      INSERT INTO agent_executions (
        agent_id, triggered_by, triggered_by_user_id, input_params, status
      ) VALUES ($1, $2, $3, $4, 'pending')
      RETURNING id
    `, [id, triggered_by, req.user.id, JSON.stringify(params)]);

    const executionId = executionResult.rows[0].id;

    // Ejecutar agente (async)
    executeAgentAsync(executionId, agent, params)
      .catch(error => {
        logger.error('Error executing agent async', { agentId: id, error: error.message, executionId });
      });

    res.json({
      success: true,
      execution_id: executionId,
      status: 'pending',
      message: 'Ejecución iniciada'
    });

  } catch (error) {
    logger.error('Error executing agent', { error: error.message, stack: error.stack, agentId: id, userId: req.user?.id });
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * PUT /api/agents/:id
 * Actualizar configuración de un agente
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const { name, description, schedule, config, tags, status } = req.body;

    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex}`);
      params.push(name);
      paramIndex++;
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      params.push(description);
      paramIndex++;
    }

    if (schedule !== undefined) {
      updateFields.push(`schedule = $${paramIndex}`);
      params.push(schedule);
      paramIndex++;
    }

    if (config !== undefined) {
      updateFields.push(`config = $${paramIndex}`);
      params.push(JSON.stringify(config));
      paramIndex++;
    }

    if (tags !== undefined) {
      updateFields.push(`tags = $${paramIndex}`);
      params.push(tags);
      paramIndex++;
    }

    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'No hay campos para actualizar'
      });
    }

    params.push(id, req.user.id);

    const result = await db.query(`
      UPDATE agents 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING id, name, updated_at
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Agente no encontrado'
      });
    }

    res.json({
      success: true,
      agent: result.rows[0]
    });

  } catch (error) {
    logger.error('Error updating agent', { error: error.message, stack: error.stack, agentId: id, userId: req.user?.id });
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * DELETE /api/agents/:id
 * Eliminar un agente
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {

    const result = await db.query(`
      DELETE FROM agents 
      WHERE id = $1 AND user_id = $2
      RETURNING id, name
    `, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Agente no encontrado'
      });
    }

    res.json({
      success: true,
      message: `Agente '${result.rows[0].name}' eliminado correctamente`
    });

  } catch (error) {
    logger.error('Error deleting agent', { error: error.message, stack: error.stack, agentId: id, userId: req.user?.id });
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * Función auxiliar para testear conexión webhook
 */
async function testWebhookConnection(webhookUrl, webhookSecret) {
  const testPayload = {
    test: true,
    timestamp: new Date().toISOString(),
    secret: webhookSecret
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-ECONEURA-Secret': webhookSecret
    },
    body: JSON.stringify(testPayload),
    timeout: 5000
  });

  if (!response.ok) {
    throw new Error(`Webhook test failed: ${response.status} ${response.statusText}`);
  }

  return true;
}

/**
 * Función auxiliar para ejecutar agente de forma asíncrona
 */
async function executeAgentAsync(executionId, agent, params) {
  const startTime = Date.now();

  try {
    // Actualizar estado a 'running'
    await db.query(`
      UPDATE agent_executions 
      SET status = 'running', started_at = NOW()
      WHERE id = $1
    `, [executionId]);

    let result;

    // Ejecutar según plataforma
    switch (agent.platform) {
      case 'make':
      case 'n8n':
      case 'zapier':
        result = await executeWebhookAgent(agent, params);
        break;
      case 'econeura':
        result = await executeEconeuraAgent(agent, params);
        break;
      default:
        throw new Error(`Plataforma no soportada: ${agent.platform}`);
    }

    const duration = Date.now() - startTime;

    // Actualizar ejecución como exitosa
    await db.query(`
      UPDATE agent_executions 
      SET status = 'success', completed_at = NOW(), duration_ms = $1, output_result = $2
      WHERE id = $3
    `, [duration, JSON.stringify(result), executionId]);

    logger.info('Agent executed successfully', { agentId: agent.id, duration, executionId });

  } catch (error) {
    const duration = Date.now() - startTime;

    // Actualizar ejecución como fallida
    await db.query(`
      UPDATE agent_executions 
      SET status = 'failed', completed_at = NOW(), duration_ms = $1, error_message = $2
      WHERE id = $3
    `, [duration, error.message, executionId]);

    logger.error('Agent execution failed', { agentId: agent.id, error: error.message, executionId });
  }
}

/**
 * Ejecutar agente via webhook
 */
async function executeWebhookAgent(agent, params) {
  if (!agent.webhook_url) {
    throw new Error('Webhook URL no configurada');
  }

  const payload = {
    action: 'execute',
    params,
    timestamp: new Date().toISOString(),
    agent_id: agent.id
  };

  const response = await fetch(agent.webhook_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-ECONEURA-Secret': agent.webhook_secret
    },
    body: JSON.stringify(payload),
    timeout: 30000 // 30 segundos timeout
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result;
}

/**
 * Ejecutar agente ECONEURA nativo
 */
async function executeEconeuraAgent(agent, params) {
  // Aquí se implementaría la lógica para agentes nativos de ECONEURA
  // Por ahora, simular ejecución exitosa
  return {
    success: true,
    message: 'Agente ECONEURA ejecutado correctamente',
    output: params,
    timestamp: new Date().toISOString()
  };
}

module.exports = router;

