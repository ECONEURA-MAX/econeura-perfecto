const express = require("express");
const router = express.Router();
const { invokeOpenAIAgent } = require("../services/openaiService");
const logger = require("../services/logger");

// Feature flag para Make.com (default: deshabilitado)
const MAKE_ENABLED = process.env.FEATURE_MAKE_ENABLED === 'true';

let makeService = null;
if (MAKE_ENABLED) {
  try {
    makeService = require("../services/makeService.js");
    // Make.com integration enabled (silent)
  } catch (err) {
    // Make.com service not available (silent, not critical)
    makeService = null;
  }
} else {
  // Make.com integration disabled (silent)
}

// Mounted at /api/invoke in server/tests
router.post("/:agentId", async (req, res) => {
  const { agentId } = req.params;
  const idempotencyKey = req.header("Idempotency-Key") || req.header("idempotency-key") || undefined;
  const correlationId = req.headers["x-correlation-id"] || "";
  const input = req.body?.input ?? "";

  const isMakeAgent = /^a-/.test(agentId);

  // Solo intentar Make.com si está habilitado Y es un agente Make
  if (MAKE_ENABLED && isMakeAgent && makeService?.invokeMakeAgent) {
    try {
      const result = await makeService.invokeMakeAgent(agentId, { input, correlationId, idempotencyKey });
      return res.status(200).json({
        result: result?.result,
        idempotencyKey,
        attempts: result?._meta?.attempts ?? 1,
        breakerState: result?._meta?.breakerState || "closed",
        toolDiagnostics: result?._meta?.diagnostics || [],
      });
    } catch (e) {
      logger.warn("Make.com agent failed, falling back to OpenAI", {
        agentId,
        correlationId,
        error: e?.message
      });
      // Fallback a OpenAI si Make falla (silent, expected behavior)
    }
  }

  // Default to OpenAI (también fallback de Make)
  try {
    logger.info("Invoking OpenAI agent", { agentId, correlationId, inputLength: input.length });
    const out = await invokeOpenAIAgent({ text: input, correlationId, stream: false });
    logger.info("OpenAI agent response successful", { agentId, correlationId, hasOutput: !!out.output });
    return res.status(200).json({
      output: out.output || out.result || '',
      provider: out.provider || 'openai',
      model: out.model || 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      agentId,
      simulated: out.simulated || false
    });
  } catch (e) {
    logger.error("Error invoking OpenAI agent", {
      agentId,
      correlationId,
      error: e?.message || String(e),
      stack: e?.stack
    });
    return res.status(500).json({ error: String(e?.message || e) });
  }
});

module.exports = router;
