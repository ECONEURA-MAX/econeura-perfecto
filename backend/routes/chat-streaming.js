/**
 * ECONEURA - Chat Streaming Routes (SSE)
 * Placeholder para compatibilidad
 */

const express = require('express');
const router = express.Router();
const aiGateway = require('../services/aiGatewayService');

router.get('/stream', (req, res) => {
  res.json({ message: 'Streaming endpoint placeholder' });
});

module.exports = router;

