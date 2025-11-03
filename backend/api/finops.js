const express = require('express');
const router = express.Router();

// Almacenamiento simple de costos (en producción usar DB)
const costs = [];

// Middleware para trackear costos en cada request a OpenAI
function trackCost(tokens, model = 'gpt-4o-mini') {
  const costPer1M = model.includes('gpt-4') ? 0.15 : 0.075;
  const cost = (tokens / 1000000) * costPer1M;
  
  costs.push({
    timestamp: new Date().toISOString(),
    model,
    tokens,
    cost,
    costUSD: cost.toFixed(4)
  });

  // Mantener solo últimos 1000 registros en memoria
  if (costs.length > 1000) {
    costs.shift();
  }

  return cost;
}

// GET /api/finops/costs - Obtener costos
router.get('/costs', (req, res) => {
  const { days = 30 } = req.query;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

  const filteredCosts = costs.filter(c => new Date(c.timestamp) >= cutoffDate);
  
  const totalCost = filteredCosts.reduce((sum, c) => sum + c.cost, 0);
  const totalTokens = filteredCosts.reduce((sum, c) => sum + c.tokens, 0);

  // Agrupar por día
  const costsByDay = {};
  filteredCosts.forEach(c => {
    const day = c.timestamp.split('T')[0];
    if (!costsByDay[day]) {
      costsByDay[day] = { tokens: 0, cost: 0, requests: 0 };
    }
    costsByDay[day].tokens += c.tokens;
    costsByDay[day].cost += c.cost;
    costsByDay[day].requests += 1;
  });

  res.json({
    period: `Last ${days} days`,
    summary: {
      totalCost: totalCost.toFixed(4),
      totalTokens,
      totalRequests: filteredCosts.length,
      avgCostPerRequest: (totalCost / filteredCosts.length || 0).toFixed(4)
    },
    costsByDay: Object.entries(costsByDay).map(([day, data]) => ({
      date: day,
      ...data,
      cost: data.cost.toFixed(4)
    }))
  });
});

// POST /api/finops/track - Trackear costo manualmente
router.post('/track', (req, res) => {
  const { tokens, model } = req.body;
  const cost = trackCost(tokens, model);
  
  res.json({
    success: true,
    tokens,
    cost: cost.toFixed(4),
    model
  });
});

module.exports = router;

// Export trackCost separately for middleware use
module.exports.trackCost = trackCost;
