const axios = require('axios');
// Usar logger estructurado centralizado
const logger = require('./logger');

class ResilientAIGateway {
  constructor() {
    this.providers = {
      openai: {
        name: 'Mammouth AI',
        models: ['mistral-medium-3.1'],
        priority: 1,
        timeout: 60000,
        retryAttempts: 2
      }
    };
    
    this.circuitBreakers = {};
    this.initializeCircuitBreakers();
  }

  initializeCircuitBreakers() {
    Object.keys(this.providers).forEach(provider => {
      this.circuitBreakers[provider] = {
        failures: 0,
        lastFailure: null,
        state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
        threshold: 5,
        timeout: 60000 // 1 minuto
      };
    });
  }

  async getChatCompletion(prompt, options = {}) {
    const {
      model = null, // Si no se especifica, usar el modelo de la NEURA
      temperature = 0.7,
      maxTokens = 1000,
      neuraId = 0,
      context = {}
    } = options;
    
    // Si no se especifica modelo, usar el modelo preferido de la NEURA (Sonnet 4.5 para CEO)
    const neuraModelMap = {
      0: 'mistral-medium-3.1', // CEO
      1: 'mistral-medium-3.1', // CTO IA
      2: 'mistral-medium-3.1', // CFO
      3: 'mistral-medium-3.1', // CDO Legal
      4: 'mistral-medium-3.1', // CHRO
      5: 'mistral-medium-3.1', // COO Retail
      6: 'mistral-medium-3.1', // CSO
      7: 'mistral-medium-3.1', // CMO
      8: 'mistral-medium-3.1', // CISO
      9: 'mistral-medium-3.1'  // CTO M&A
    };
    
    const finalModel = model || neuraModelMap[neuraId] || 'mistral-medium-3.1';

    // Log del contexto para debugging
    logger.info('AI Gateway - Procesando prompt con contexto', {
      neuraId,
      model: finalModel,
      contextKeys: Object.keys(context),
      promptLength: prompt.length,
      hasImage: !!context.image
    });

    // Determinar provider basado en modelo y NEURA
    const provider = this.selectProvider(finalModel, neuraId);
    
    if (!provider) {
      throw new Error('No hay providers disponibles');
    }

    // Preparar mensajes para OpenAI (soporte multimodal)
    const messages = this.prepareMessages(prompt, context);

    // Intentar con fallback automÃ¡tico
    return await this.executeWithFallback(provider, messages, {
      model: finalModel,
      temperature,
      maxTokens,
      neuraId,
      context
    });
  }

  // Preparar mensajes para OpenAI (soporte multimodal)
  prepareMessages(prompt, context) {
    const messages = [];
    
    // Agregar contexto del sistema si existe
    if (context && context.conversationHistory) {
      messages.push({
        role: 'system',
        content: `Eres un asistente especializado. Historial de conversaciÃ³n: ${context.conversationHistory}`
      });
    }
    
    // Mensaje simple (AIMLAPI compatible)
    messages.push({
      role: 'user',
      content: prompt
    });
    
    return messages;
  }

  selectProvider(requestedModel, neuraId) {
    // TODAS las NEURAs usan Mixtral 8x7B
    const neuraModelMap = {
      0: 'mistralai/Mixtral-8x7B-Instruct-v0.1', // CEO
      1: 'mistralai/Mixtral-8x7B-Instruct-v0.1', // CTO IA
      2: 'mistralai/Mixtral-8x7B-Instruct-v0.1', // CFO
      3: 'mistralai/Mixtral-8x7B-Instruct-v0.1', // CDO Legal
      4: 'mistralai/Mixtral-8x7B-Instruct-v0.1', // CHRO
      5: 'mistralai/Mixtral-8x7B-Instruct-v0.1', // COO
      6: 'mistralai/Mixtral-8x7B-Instruct-v0.1', // CSO
      7: 'mistralai/Mixtral-8x7B-Instruct-v0.1', // CMO
      8: 'mistralai/Mixtral-8x7B-Instruct-v0.1', // CISO
      9: 'mistralai/Mixtral-8x7B-Instruct-v0.1'  // CTO M&A
    };

    const preferredModel = neuraModelMap[neuraId] || requestedModel;
    
    // Encontrar provider para el modelo preferido
    for (const [providerName, config] of Object.entries(this.providers)) {
      if (config.models.includes(preferredModel) && 
          this.circuitBreakers[providerName].state !== 'OPEN') {
        return providerName;
      }
    }

    // Fallback: usar cualquier provider disponible
    const availableProviders = Object.keys(this.providers).filter(
      provider => this.circuitBreakers[provider].state !== 'OPEN'
    );

    if (availableProviders.length === 0) {
      return null;
    }

    // Ordenar por prioridad
    return availableProviders.sort((a, b) => 
      this.providers[a].priority - this.providers[b].priority
    )[0];
  }

  async executeWithFallback(primaryProvider, messages, options) {
    const providers = Object.keys(this.providers).sort(
      (a, b) => this.providers[a].priority - this.providers[b].priority
    );

    let lastError = null;

    for (const provider of providers) {
      if (this.circuitBreakers[provider].state === 'OPEN') {
        continue;
      }

      try {
        logger.info(`Intentando provider: ${provider}`, {
          provider,
          model: options.model,
          neuraId: options.neuraId
        });

        const result = await this.callProvider(provider, messages, options);
        
        // Resetear circuit breaker en Ã©xito
        this.resetCircuitBreaker(provider);
        
        logger.info(`Ã‰xito con provider: ${provider}`, {
          provider,
          tokens: result.tokens,
          cost: result.cost
        });

        return result;

      } catch (error) {
        lastError = error;
        logger.warn(`FallÃ³ provider: ${provider}`, {
          provider,
          error: error.message,
          neuraId: options.neuraId
        });

        // Registrar fallo en circuit breaker
        this.recordFailure(provider);
      }
    }

    // Si todos los providers fallaron
    logger.error('Todos los providers fallaron', {
      lastError: lastError?.message,
      neuraId: options.neuraId
    });

    throw new Error(`Todos los AI providers fallaron. Ãšltimo error: ${lastError?.message}`);
  }

  async callProvider(provider, messages, options) {
    const config = this.providers[provider];
    const startTime = Date.now();

    try {
      let result;

      switch (provider) {
        case 'openai':
          result = await this.callOpenAI(messages, options);
          break;
        case 'anthropic':
          result = await this.callAnthropic(messages, options);
          break;
        case 'google':
          // Google no implementado aÃºn, usar OpenAI como fallback
          result = await this.callOpenAI(messages, options);
          break;
        case 'mistral':
          // Mistral no implementado aÃºn, usar OpenAI como fallback
          result = await this.callOpenAI(messages, options);
          break;
        default:
          throw new Error(`Provider no soportado: ${provider}`);
      }

      const duration = Date.now() - startTime;
      
      return {
        ...result,
        provider,
        duration,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error(`Error en provider ${provider}`, {
        provider,
        error: error.message,
        duration,
        neuraId: options.neuraId
      });

      throw error;
    }
  }

  async callOpenAI(messages, options) {
    const response = await axios.post(`${process.env.OPENAI_API_BASE_URL || 'https://api.openai.com'}/v1/chat/completions`, {
      model: options.model,
      messages: messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: this.providers.openai.timeout
    });

    return {
      output: response.data.choices[0].message.content,
      tokens: response.data.usage?.total_tokens || 0,
      cost: this.calculateCost('openai', response.data.usage?.total_tokens || 0)
    };
  }

  async callAnthropic(messages, options) {
    // Convertir formato OpenAI a Anthropic
    const anthropicMessages = messages.map(msg => {
      if (msg.role === 'system') {
        return { role: 'user', content: `Sistema: ${msg.content}` };
      }
      
      if (msg.role === 'user') {
        // Manejar contenido multimodal
        if (Array.isArray(msg.content)) {
          const textParts = msg.content.filter(c => c.type === 'text');
          const imageParts = msg.content.filter(c => c.type === 'image_url');
          
          let content = textParts.map(t => t.text).join('\n');
          if (imageParts.length > 0) {
            content += '\n\n[ImÃ¡genes detectadas pero no procesables por Anthropic en este momento]';
          }
          return { role: 'user', content };
        }
        return { role: 'user', content: msg.content };
      }
      
      return msg;
    });

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: options.model,
      max_tokens: options.maxTokens,
      messages: anthropicMessages
    }, {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      timeout: this.providers.anthropic.timeout
    });

    return {
      output: response.data.content[0].text,
      tokens: response.data.usage?.input_tokens + response.data.usage?.output_tokens || 0,
      cost: this.calculateCost('anthropic', response.data.usage?.input_tokens + response.data.usage?.output_tokens || 0)
    };
  }

  async callGoogle(prompt, options) {
    // ImplementaciÃ³n simplificada - requerirÃ­a Google AI SDK
    throw new Error('Google provider no implementado aÃºn');
  }

  async callMistral(prompt, options) {
    // ImplementaciÃ³n simplificada - requerirÃ­a Mistral SDK
    throw new Error('Mistral provider no implementado aÃºn');
  }

  calculateCost(provider, tokens) {
    const costs = {
      openai: {
        'gpt-4o-mini': 0.00015 / 1000,
        'mistralai/Mixtral-8x7B-Instruct-v0.1': 0.005 / 1000,
        'gpt-5': 0.01 / 1000
      },
      anthropic: {
        'claude-3-5-sonnet-20241022': 0.003 / 1000,
        'claude-3-opus-20240229': 0.015 / 1000
      }
    };

    return (costs[provider]?.['default'] || 0.001) * tokens;
  }

  recordFailure(provider) {
    const breaker = this.circuitBreakers[provider];
    breaker.failures++;
    breaker.lastFailure = Date.now();

    if (breaker.failures >= breaker.threshold) {
      breaker.state = 'OPEN';
      logger.warn(`Circuit breaker abierto para ${provider}`, {
        provider,
        failures: breaker.failures
      });
    }
  }

  resetCircuitBreaker(provider) {
    const breaker = this.circuitBreakers[provider];
    breaker.failures = 0;
    breaker.state = 'CLOSED';
  }

  // Auto-healing: verificar circuit breakers periÃ³dicamente
  startHealthCheck() {
    setInterval(() => {
      Object.keys(this.circuitBreakers).forEach(provider => {
        const breaker = this.circuitBreakers[provider];
        
        if (breaker.state === 'OPEN' && 
            Date.now() - breaker.lastFailure > breaker.timeout) {
          
          breaker.state = 'HALF_OPEN';
          logger.info(`Circuit breaker en HALF_OPEN para ${provider}`, {
            provider
          });
        }
      });
    }, 30000); // Cada 30 segundos
  }

  // MÃ©tricas para monitoring
  getMetrics() {
    return {
      providers: Object.keys(this.providers).map(provider => ({
        name: provider,
        state: this.circuitBreakers[provider].state,
        failures: this.circuitBreakers[provider].failures,
        lastFailure: this.circuitBreakers[provider].lastFailure
      })),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = ResilientAIGateway;
