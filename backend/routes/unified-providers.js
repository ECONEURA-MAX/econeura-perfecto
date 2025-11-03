const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Cargar configuraciones de todos los proveedores
const makeConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/agents.json'), 'utf8'));
const n8nConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/n8n-agents.json'), 'utf8'));
const chatgptConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/chatgpt-agents.json'), 'utf8'));

class UnifiedProviderService {
  constructor() {
    this.providers = {
      make: { config: makeConfig, priority: 1 },
      n8n: { config: n8nConfig, priority: 2 },
      chatgpt: { config: chatgptConfig, priority: 3 }
    };
    this.metrics = {
      make: { requests: 0, successes: 0, failures: 0, avgResponseTime: 0 },
      n8n: { requests: 0, successes: 0, failures: 0, avgResponseTime: 0 },
      chatgpt: { requests: 0, successes: 0, failures: 0, avgResponseTime: 0 }
    };
  }

  async executeAgent(agentId, input, context) {
    const agentProviders = this.getAgentProviders(agentId);
    
    for (const provider of agentProviders) {
      try {
        const startTime = Date.now();
        const result = await this.executeWithProvider(provider.name, agentId, input, context);
        const responseTime = Date.now() - startTime;
        
        this.updateMetrics(provider.name, true, responseTime);
        return { ...result, provider: provider.name, responseTime };
        
      } catch (error) {
        this.updateMetrics(provider.name, false, 0);
        const logger = require('../services/logger');
        logger.warn('Provider failed, trying next', {
          provider: provider.name,
          agentId,
          error: error.message
        });
        continue; // Try next provider
      }
    }
    
    throw new Error('All providers failed');
  }

  getAgentProviders(agentId) {
    const providers = [];
    
    if (this.providers.make.config[agentId]) {
      providers.push({ name: 'make', priority: this.providers.make.priority });
    }
    if (this.providers.n8n.config[agentId]) {
      providers.push({ name: 'n8n', priority: this.providers.n8n.priority });
    }
    if (this.providers.chatgpt.config[agentId]) {
      providers.push({ name: 'chatgpt', priority: this.providers.chatgpt.priority });
    }
    
    return providers.sort((a, b) => a.priority - b.priority);
  }

  async executeWithProvider(providerName, agentId, input, context) {
    const provider = this.providers[providerName];
    const agent = provider.config[agentId];
    
    if (!agent || agent.status !== 'active') {
      throw new Error(`Agent ${agentId} not available on ${providerName}`);
    }

    const payload = {
      agent_id: agentId,
      input,
      context,
      timestamp: new Date().toISOString()
    };

    let response;
    if (providerName === 'make') {
      response = await fetch(agent.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else if (providerName === 'n8n') {
      response = await fetch(agent.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else if (providerName === 'chatgpt') {
      response = await fetch(agent.webhookUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${agent.apiKey || process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: `Eres ${agent.description}` },
            { role: 'user', content: `${input}\n\nContexto: ${context}` }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });
    }

    if (!response.ok) {
      throw new Error(`${providerName} error: ${response.status}`);
    }

    const result = await response.json();
    return providerName === 'chatgpt' ? result.choices[0].message.content : result;
  }

  updateMetrics(providerName, success, responseTime) {
    const metrics = this.metrics[providerName];
    metrics.requests++;
    
    if (success) {
      metrics.successes++;
      metrics.avgResponseTime = (metrics.avgResponseTime + responseTime) / 2;
    } else {
      metrics.failures++;
    }
  }

  getMetrics() {
    return this.metrics;
  }

  getProviderStatus() {
    const status = {};
    for (const [name, provider] of Object.entries(this.providers)) {
      const agents = Object.keys(provider.config);
      const activeAgents = Object.values(provider.config).filter(a => a.status === 'active').length;
      
      status[name] = {
        totalAgents: agents.length,
        activeAgents,
        metrics: this.metrics[name],
        health: activeAgents > 0 ? 'healthy' : 'unhealthy'
      };
    }
    return status;
  }
}

const unifiedService = new UnifiedProviderService();

// Endpoint unificado para ejecutar agentes
router.post('/execute/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { input, context } = req.body;
    
    const result = await unifiedService.executeAgent(agentId, input, context);
    
    res.json({
      success: true,
      agent_id: agentId,
      provider: result.provider,
      response: result.response || result,
      responseTime: result.responseTime,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para métricas de proveedores
router.get('/metrics', (req, res) => {
  res.json({
    providers: unifiedService.getMetrics(),
    status: unifiedService.getProviderStatus(),
    timestamp: new Date().toISOString()
  });
});

// Endpoint para estado de proveedores
router.get('/status', (req, res) => {
  res.json({
    status: unifiedService.getProviderStatus(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
