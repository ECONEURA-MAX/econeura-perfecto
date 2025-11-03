/**
 * ECONEURA Proposals API
 * Sistema de propuestas con Human-in-the-Loop obligatorio
 */

const express = require('express');
const router = express.Router();
const db = require('../db'); // PostgreSQL version
const { authMiddleware } = require('../middleware/auth');
const logger = require('../services/logger');

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

/**
 * POST /api/proposals
 * Crear una nueva propuesta
 */
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      action_type,
      impact_level,
      required_approvers,
      estimated_cost = 0,
      currency = 'EUR',
      risk_assessment,
      rollback_plan,
      priority = 'medium',
      comments,
      evidence = []
    } = req.body;

    // Validaciones
    if (!title || !description || !action_type || !impact_level || !required_approvers) {
      return res.status(400).json({
        error: 'Campos requeridos: title, description, action_type, impact_level, required_approvers'
      });
    }

    // Validar action_type
    const validActionTypes = ['financial', 'operational', 'strategic', 'technical'];
    if (!validActionTypes.includes(action_type)) {
      return res.status(400).json({
        error: `action_type inválido. Válidos: ${validActionTypes.join(', ')}`
      });
    }

    // Validar impact_level
    const validImpactLevels = ['low', 'medium', 'high', 'critical'];
    if (!validImpactLevels.includes(impact_level)) {
      return res.status(400).json({
        error: `impact_level inválido. Válidos: ${validImpactLevels.join(', ')}`
      });
    }

    // Validar required_approvers
    if (!Array.isArray(required_approvers) || required_approvers.length === 0) {
      return res.status(400).json({
        error: 'required_approvers debe ser un array no vacío'
      });
    }

    // Validar roles de aprobadores
    const validApproverRoles = ['CEO', 'CFO', 'CTO', 'CISO', 'CSO', 'COO', 'CHRO', 'CMO', 'CDO'];
    const invalidRoles = required_approvers.filter(role => !validApproverRoles.includes(role));
    if (invalidRoles.length > 0) {
      return res.status(400).json({
        error: `Roles de aprobadores inválidos: ${invalidRoles.join(', ')}. Válidos: ${validApproverRoles.join(', ')}`
      });
    }

    // Obtener NEURA que creó la propuesta (del header o body)
    const created_by = req.body.created_by || req.headers['x-neura-id'] || 'unknown';

    // Insertar propuesta en base de datos
    const result = await db.query(`
      INSERT INTO proposals (
        user_id, title, description, action_type, impact_level, required_approvers,
        estimated_cost, currency, risk_assessment, rollback_plan, priority,
        comments, evidence, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, created_at, status
    `, [
      req.user.id,
      title,
      description,
      action_type,
      impact_level,
      required_approvers,
      estimated_cost,
      currency,
      risk_assessment,
      rollback_plan,
      priority,
      comments,
      JSON.stringify(evidence),
      created_by
    ]);

    const proposalId = result.rows[0].id;

    // Crear notificaciones para los aprobadores requeridos
    await createApprovalNotifications(proposalId, required_approvers, title);

    res.status(201).json({
      success: true,
      proposal: {
        id: proposalId,
        title,
        action_type,
        impact_level,
        required_approvers,
        estimated_cost,
        status: result.rows[0].status,
        created_at: result.rows[0].created_at
      }
    });

  } catch (error) {
    logger.error('Error creating proposal', { error: error.message, stack: error.stack, body: req.body });
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * GET /api/proposals
 * Listar propuestas del usuario
 */
router.get('/', async (req, res) => {
  try {
    const { status, action_type, impact_level, priority } = req.query;

    let query = `
      SELECT 
        p.id, p.title, p.description, p.action_type, p.impact_level,
        p.required_approvers, p.estimated_cost, p.currency, p.status, p.priority,
        p.created_by, p.created_at, p.updated_at, p.approved_at,
        p.risk_assessment, p.rollback_plan, p.comments, p.evidence,
        COUNT(pa.id) as approval_count,
        COUNT(CASE WHEN pa.decision = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN pa.decision = 'rejected' THEN 1 END) as rejected_count
      FROM proposals p
      LEFT JOIN proposal_approvals pa ON p.id = pa.proposal_id
      WHERE p.user_id = $1
    `;
    
    const params = [req.user.id];
    let paramIndex = 2;

    // Filtros opcionales
    if (status) {
      query += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (action_type) {
      query += ` AND p.action_type = $${paramIndex}`;
      params.push(action_type);
      paramIndex++;
    }

    if (impact_level) {
      query += ` AND p.impact_level = $${paramIndex}`;
      params.push(impact_level);
      paramIndex++;
    }

    if (priority) {
      query += ` AND p.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    query += `
      GROUP BY p.id, p.title, p.description, p.action_type, p.impact_level,
               p.required_approvers, p.estimated_cost, p.currency, p.status, p.priority,
               p.created_by, p.created_at, p.updated_at, p.approved_at,
               p.risk_assessment, p.rollback_plan, p.comments, p.evidence
      ORDER BY p.created_at DESC
    `;

    const result = await db.query(query, params);

    // Parsear JSON fields y calcular progreso de aprobación
    const proposals = result.rows.map(proposal => {
      const requiredCount = proposal.required_approvers.length;
      const approvedCount = parseInt(proposal.approved_count);
      const approvalProgress = requiredCount > 0 ? Math.round((approvedCount / requiredCount) * 100) : 0;

      return {
        ...proposal,
        required_approvers: proposal.required_approvers,
        evidence: proposal.evidence ? JSON.parse(proposal.evidence) : [],
        approval_count: parseInt(proposal.approval_count),
        approved_count: approvedCount,
        rejected_count: parseInt(proposal.rejected_count),
        approval_progress: approvalProgress,
        can_approve: proposal.status === 'pending_approval' && approvedCount < requiredCount
      };
    });

    res.json({
      success: true,
      proposals,
      total: proposals.length
    });

  } catch (error) {
    logger.error('Error listing proposals', { error: error.message, stack: error.stack, userId: req.user?.id });
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * GET /api/proposals/:id
 * Obtener detalles de una propuesta específica
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {

    // Obtener propuesta
    const proposalResult = await db.query(`
      SELECT 
        id, title, description, action_type, impact_level,
        required_approvers, estimated_cost, currency, status, priority,
        created_by, created_at, updated_at, approved_at,
        risk_assessment, rollback_plan, comments, evidence, audit_trail
      FROM proposals 
      WHERE id = $1 AND user_id = $2
    `, [id, req.user.id]);

    if (proposalResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Propuesta no encontrada'
      });
    }

    const proposal = proposalResult.rows[0];

    // Obtener aprobaciones
    const approvalsResult = await db.query(`
      SELECT 
        id, approver_role, approver_user_id, approver_name,
        decision, comment, created_at
      FROM proposal_approvals 
      WHERE proposal_id = $1
      ORDER BY created_at ASC
    `, [id]);

    // Obtener ejecuciones
    const executionsResult = await db.query(`
      SELECT 
        id, execution_type, target_agent_id, execution_params,
        status, result, error_message, started_at, completed_at,
        duration_ms, executed_by, executed_by_user_id
      FROM proposal_executions 
      WHERE proposal_id = $1
      ORDER BY started_at DESC
    `, [id]);

    // Obtener notificaciones
    const notificationsResult = await db.query(`
      SELECT 
        id, recipient_role, recipient_user_id, recipient_email,
        notification_type, title, message, sent_at, read_at, status
      FROM proposal_notifications 
      WHERE proposal_id = $1
      ORDER BY sent_at DESC
    `, [id]);

    res.json({
      success: true,
      proposal: {
        ...proposal,
        required_approvers: proposal.required_approvers,
        evidence: proposal.evidence ? JSON.parse(proposal.evidence) : [],
        audit_trail: proposal.audit_trail ? JSON.parse(proposal.audit_trail) : [],
        approvals: approvalsResult.rows,
        executions: executionsResult.rows.map(exec => ({
          ...exec,
          execution_params: exec.execution_params ? JSON.parse(exec.execution_params) : {},
          result: exec.result ? JSON.parse(exec.result) : null
        })),
        notifications: notificationsResult.rows
      }
    });

  } catch (error) {
    logger.error('Error getting proposal', { error: error.message, stack: error.stack, proposalId: id, userId: req.user?.id });
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * POST /api/proposals/:id/approve
 * Aprobar una propuesta
 */
router.post('/:id/approve', async (req, res) => {
  const { id } = req.params;
  
  try {
    const { approver_role, comment } = req.body;

    if (!approver_role) {
      return res.status(400).json({
        error: 'approver_role es requerido'
      });
    }

    // Verificar que la propuesta existe y pertenece al usuario
    const proposalResult = await db.query(`
      SELECT id, title, required_approvers, status
      FROM proposals 
      WHERE id = $1 AND user_id = $2
    `, [id, req.user.id]);

    if (proposalResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Propuesta no encontrada'
      });
    }

    const proposal = proposalResult.rows[0];

    if (proposal.status !== 'pending_approval') {
      return res.status(400).json({
        error: 'La propuesta no está pendiente de aprobación'
      });
    }

    // Verificar que el rol está en los aprobadores requeridos
    if (!proposal.required_approvers.includes(approver_role)) {
      return res.status(400).json({
        error: `El rol ${approver_role} no está autorizado para aprobar esta propuesta`
      });
    }

    // Verificar que no hay una aprobación previa de este rol
    const existingApproval = await db.query(`
      SELECT id FROM proposal_approvals 
      WHERE proposal_id = $1 AND approver_role = $2
    `, [id, approver_role]);

    if (existingApproval.rows.length > 0) {
      return res.status(400).json({
        error: `Ya existe una aprobación de ${approver_role} para esta propuesta`
      });
    }

    // Crear aprobación
    const approvalResult = await db.query(`
      INSERT INTO proposal_approvals (
        proposal_id, approver_role, approver_user_id, approver_name,
        decision, comment
      ) VALUES ($1, $2, $3, $4, 'approved', $5)
      RETURNING id, created_at
    `, [id, approver_role, req.user.id, req.user.name || req.user.email, comment]);

    res.json({
      success: true,
      approval: {
        id: approvalResult.rows[0].id,
        approver_role,
        decision: 'approved',
        comment,
        created_at: approvalResult.rows[0].created_at
      },
      message: `Propuesta "${proposal.title}" aprobada por ${approver_role}`
    });

  } catch (error) {
    logger.error('Error approving proposal', { error: error.message, stack: error.stack, proposalId: id, userId: req.user?.id });
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * POST /api/proposals/:id/reject
 * Rechazar una propuesta
 */
router.post('/:id/reject', async (req, res) => {
  const { id } = req.params;
  
  try {
    const { approver_role, reason } = req.body;

    if (!approver_role) {
      return res.status(400).json({
        error: 'approver_role es requerido'
      });
    }

    // Verificar que la propuesta existe y pertenece al usuario
    const proposalResult = await db.query(`
      SELECT id, title, required_approvers, status
      FROM proposals 
      WHERE id = $1 AND user_id = $2
    `, [id, req.user.id]);

    if (proposalResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Propuesta no encontrada'
      });
    }

    const proposal = proposalResult.rows[0];

    if (proposal.status !== 'pending_approval') {
      return res.status(400).json({
        error: 'La propuesta no está pendiente de aprobación'
      });
    }

    // Verificar que el rol está en los aprobadores requeridos
    if (!proposal.required_approvers.includes(approver_role)) {
      return res.status(400).json({
        error: `El rol ${approver_role} no está autorizado para rechazar esta propuesta`
      });
    }

    // Crear rechazo
    const rejectionResult = await db.query(`
      INSERT INTO proposal_approvals (
        proposal_id, approver_role, approver_user_id, approver_name,
        decision, comment
      ) VALUES ($1, $2, $3, $4, 'rejected', $5)
      RETURNING id, created_at
    `, [id, approver_role, req.user.id, req.user.name || req.user.email, reason]);

    // Marcar propuesta como rechazada
    await db.query(`
      UPDATE proposals 
      SET status = 'rejected', updated_at = NOW()
      WHERE id = $1
    `, [id]);

    res.json({
      success: true,
      rejection: {
        id: rejectionResult.rows[0].id,
        approver_role,
        decision: 'rejected',
        comment: reason,
        created_at: rejectionResult.rows[0].created_at
      },
      message: `Propuesta "${proposal.title}" rechazada por ${approver_role}`
    });

  } catch (error) {
    logger.error('Error rejecting proposal', { error: error.message, stack: error.stack, proposalId: id, userId: req.user?.id });
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * POST /api/proposals/:id/execute
 * Ejecutar una propuesta aprobada
 */
router.post('/:id/execute', async (req, res) => {
  const { id } = req.params;
  
  try {
    const { execution_type = 'manual_action', execution_params = {} } = req.body;

    // Verificar que la propuesta existe y está aprobada
    const proposalResult = await db.query(`
      SELECT id, title, status, action_type, created_by
      FROM proposals 
      WHERE id = $1 AND user_id = $2
    `, [id, req.user.id]);

    if (proposalResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Propuesta no encontrada'
      });
    }

    const proposal = proposalResult.rows[0];

    if (proposal.status !== 'approved') {
      return res.status(400).json({
        error: 'La propuesta debe estar aprobada para poder ejecutarse'
      });
    }

    // Crear ejecución
    const executionResult = await db.query(`
      INSERT INTO proposal_executions (
        proposal_id, execution_type, execution_params, status, executed_by, executed_by_user_id
      ) VALUES ($1, $2, $3, 'running', $4, $5)
      RETURNING id, started_at
    `, [id, execution_type, JSON.stringify(execution_params), proposal.created_by, req.user.id]);

    const executionId = executionResult.rows[0].id;

    // Simular ejecución (en implementación real, ejecutar la acción correspondiente)
    setTimeout(async () => {
      try {
        // Simular ejecución exitosa
        await db.query(`
          UPDATE proposal_executions 
          SET status = 'success', completed_at = NOW(), duration_ms = 5000,
              result = $1
          WHERE id = $2
        `, [JSON.stringify({ success: true, message: 'Propuesta ejecutada correctamente' }), executionId]);

        // Marcar propuesta como ejecutada
        await db.query(`
          UPDATE proposals 
          SET status = 'executed', executed_at = NOW(), updated_at = NOW()
          WHERE id = $1
        `, [id]);

      } catch (error) {
        logger.error('Error in execution simulation', { error: error.message, stack: error.stack, proposalId: id, executionId });
        
        // Marcar ejecución como fallida
        await db.query(`
          UPDATE proposal_executions 
          SET status = 'failed', completed_at = NOW(), duration_ms = 5000,
              error_message = $1
          WHERE id = $2
        `, [error.message, executionId]);
      }
    }, 5000);

    res.json({
      success: true,
      execution: {
        id: executionId,
        execution_type,
        execution_params,
        status: 'running',
        started_at: executionResult.rows[0].started_at
      },
      message: `Propuesta "${proposal.title}" ejecutándose`
    });

  } catch (error) {
    logger.error('Error executing proposal', { error: error.message, stack: error.stack, proposalId: id, userId: req.user?.id });
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * Función auxiliar para crear notificaciones de aprobación
 */
async function createApprovalNotifications(proposalId, requiredApprovers, proposalTitle) {
  try {
    for (const approverRole of requiredApprovers) {
      await db.query(`
        INSERT INTO proposal_notifications (
          proposal_id, recipient_role, notification_type, title, message
        ) VALUES ($1, $2, 'approval_request', $3, $4)
      `, [
        proposalId,
        approverRole,
        `Aprobación requerida: ${proposalTitle}`,
        `Se requiere su aprobación para la propuesta "${proposalTitle}". Por favor, revise los detalles y apruebe o rechace según corresponda.`
      ]);
    }
  } catch (error) {
    logger.error('Error creating approval notifications', { error: error.message, stack: error.stack, proposalId });
    // No fallar la creación de la propuesta por errores en notificaciones
  }
}

module.exports = router;
