const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const logger = require("../services/logger");

// Cargar configuración de agentes
const agentsConfigPath = path.join(__dirname, "../config/agents.json");
let agentsConfig = { makeAgents: {}, openaiAgents: {} };

try {
  if (fs.existsSync(agentsConfigPath)) {
    agentsConfig = JSON.parse(fs.readFileSync(agentsConfigPath, "utf8"));
  }
  } catch (error) {
    logger.warn("Error cargando agents.json", { error: error.message });
  }

/**
 * POST /execute
 * Ejecuta un agente enviando datos a su webhook de Make.com
 */
router.post("/execute", async (req, res) => {
  try {
    const { agent_id, department, action = "execute", parameters = {} } = req.body;

    if (!agent_id) {
      return res.status(400).json({ error: "agent_id es requerido" });
    }

    // Buscar webhook del agente
    const agentConfig = agentsConfig.makeAgents[agent_id];

    if (!agentConfig || !agentConfig.webhookUrl) {
      return res.status(404).json({
        error: `Agente ${agent_id} no encontrado o sin webhook configurado`
      });
    }

    if (agentConfig.webhookUrl.includes("REEMPLAZA")) {
      return res.status(503).json({
        error: `Webhook del agente ${agent_id} no configurado. Edita config/agents.json`
      });
    }

    // Preparar payload para Make.com
    const payload = {
      agent_id,
      department: department || agent_id.split("-")[1]?.toUpperCase(),
      action,
      timestamp: new Date().toISOString(),
      correlation_id: req.headers["x-correlation-id"] || `exec-${Date.now()}`,
      parameters
    };

    logger.info("Ejecutando agente en Make.com", { agent_id, department, action });

    // Llamar al webhook de Make.com
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(agentConfig.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "ECONEURA-Agent/1.0"
      },
      body: JSON.stringify(payload),
      timeout: 30000
    });

    const responseData = await response.text();
    logger.info('Respuesta de Make.com recibida', { 
      agent_id, 
      status: response.status, 
      responseLength: responseData.length 
    });

    res.json({
      success: true,
      agent_id,
      status: response.status,
      response: responseData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error("Error ejecutando agente", { 
      error: error.message, 
      stack: error.stack,
      agent_id: req.body.agent_id 
    });
    res.status(500).json({
      error: error.message,
      agent_id: req.body.agent_id
    });
  }
});

module.exports = router;