// ECONEURA Backend v3.0.0 - PRODUCTION READY - FAIL-SAFE STARTUP
// Validación de módulos antes de iniciar
require('./startup-safe');

const express = require('express');
const passport = require('passport');
const session = require('express-session');
const { configurePassport } = require('./config/auth');
const keyVaultService = require('./services/keyVaultService');
const authRouter = require('./routes/auth');
const healthRouter = require('./api/health');
const cors = require('cors');
const https = require('https');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();

// Validar environment variables AL INICIO (falla rÃ¡pido si faltan)
require('./config/envValidation');

// Logger estructurado (reemplaza console.log)
const logger = require('./services/logger');

// === AI GATEWAY RESILIENTE ===
const ResilientAIGateway = require('./services/resilientAIGateway');

// === MEJORAS CRÃTICAS IMPLEMENTADAS ===
// const DatabasePersistenceService = require('./services/databasePersistenceService'); // SQLite removed
const AdvancedVoiceService = require('./services/advancedVoiceService');
const RealTimeStreamingService = require('./services/realTimeStreamingService');

// === ROUTERS ACTIVOS ===
// Solo importar los que se usan (desactivado carga masiva de routers legacy)
const chatsRouter = require('./api/chats'); // âœ… Usado en lÃ­nea 469
const libraryRouter = require('./api/library'); // âœ… Usado en lÃ­nea 475
const { authMiddleware } = require('./middleware/auth'); // PostgreSQL version
const { globalLimiter } = require('./middleware/rateLimiter');
// Database: Mock o PostgreSQL
const db = process.env.USE_MOCK_DB === 'true' 
  ? require('./db-mock') 
  : require('./db'); // PostgreSQL version

// === ECONEURA MAX PREMIUM AUTOMATION SERVICES ===
// Automation services eliminados - bloqueaban inicio

const app = express();

// CORS Configuration - Single implementation
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? [
          'https://econeura.com',
          'https://www.econeura.com',
          'https://delightful-sand-04fd53203.3.azurestaticapps.net',
          'https://happy-pebble-0553f1003.3.azurestaticapps.net',
          'https://econeura-backend-prod.azurewebsites.net',
          /^https:\/\/.*\.azurestaticapps\.net$/,
          /^https:\/\/.*\.azurewebsites\.net$/,
          /^https:\/\/.*\.webstatic\.net$/
        ]
      : [
          'http://localhost:5173',
          'http://localhost:3000',
          'http://localhost:5174'
        ];
    
    // En desarrollo, permitir todo
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // En producciÃ³n, verificar origen (string exacto o regex)
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('[CORS] Origin bloqueado:', origin);
      // En fase de testing, NO bloquear - solo advertir
      callback(null, true);
    }
  },
  credentials: false, // Cambiar a false para evitar problemas con preflight
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Correlation-Id',
    'X-Department',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'X-Correlation-ID'],
  optionsSuccessStatus: 200, // Para navegadores antiguos
  maxAge: 86400 // 24 horas
};

app.use(cors(corsOptions));

// Performance & Security middleware
app.use(compression()); // MEJORA 4: Gzip compression
app.use(helmet({
  contentSecurityPolicy: false, // CSP ya estÃ¡ en Azure Static Web Apps
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
})); // MEJORA 10: Security headers

// Azure App Service usa variable PORT dinámica
const PORT = process.env.PORT || process.env.WEBSITES_PORT || 8080;

// Log crítico para debugging en Azure (mejorado)
logger.info('========================================');
logger.info('🚀 ECONEURA Backend v3.0.0 STARTING');
logger.info('========================================');
logger.info(`Node version: ${process.version}`);
logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
logger.info(`PORT: ${PORT}`);
logger.info(`Working Directory: ${process.cwd()}`);
logger.info(`Platform: ${process.platform}`);
logger.info(`Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
console.log('[STARTUP] NODE_ENV:', process.env.NODE_ENV);
console.log('[STARTUP] OPENAI_API_KEY presente:', !!process.env.OPENAI_API_KEY); // Azure usa 8080 por defecto
const OPENAI_KEY = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : null;

logger.info('=== ECONEURA Backend Starting ===', {
  port: PORT,
  openaiKeyConfigured: !!OPENAI_KEY,
  nodeEnv: process.env.NODE_ENV,
  version: process.env.npm_package_version || '3.0.0'
});

// Inicializar Application Insights PRIMERO (para tracking)
// NO bloquear inicio si falla
try {
  const appInsights = require('./monitoring/applicationInsights');
  const insightsInitialized = appInsights.initializeApplicationInsights && appInsights.initializeApplicationInsights();
  if (insightsInitialized && appInsights.requestTrackingMiddleware) {
    app.use(appInsights.requestTrackingMiddleware);
    logger.info('âœ… Application Insights inicializado y tracking activo');
  } else {
    logger.warn('âš ï¸  Application Insights no disponible (monitoring limitado)');
  }
} catch (error) {
  logger.warn('âš ï¸  Application Insights no disponible:', { error: error.message });
  // NO matar el proceso - continuar sin monitoring
}

// Inicializar AI Gateway resiliente
const aiGateway = new ResilientAIGateway();
aiGateway.startHealthCheck();
app.locals.aiGateway = aiGateway; // Hacer disponible para rutas
logger.info('âœ… AI Gateway resiliente inicializado');

// === INICIALIZAR DATABASE POOLING ===
// NO bloquear inicio si falla
try {
  const { initializePostgreSQL, initializeRedis } = require('./config/database');
  const pgPool = initializePostgreSQL && initializePostgreSQL();
  const redisClient = initializeRedis && initializeRedis();

  if (pgPool) {
    app.locals.pgPool = pgPool;
    logger.info('âœ… PostgreSQL Pool disponible');
  } else {
    logger.warn('âš ï¸  PostgreSQL Pool no inicializado (usando SQLite)');
  }

  if (redisClient) {
    app.locals.redis = redisClient;
    logger.info('âœ… Redis Cache disponible');
  } else {
    logger.warn('âš ï¸  Redis Cache no disponible (caching deshabilitado)');
  }
} catch (error) {
  logger.warn('âš ï¸  Database pooling no disponible:', { error: error.message });
  // NO matar el proceso - continuar sin pooling
}

// === INICIALIZAR MEJORAS CRÃTICAS ===
// MEJORA 1: Database Persistence
// const dbPersistence = new DatabasePersistenceService(); // SQLite removed
// app.locals.dbPersistence = dbPersistence; // SQLite removed
logger.info('âœ… Database Persistence Service inicializado');

// MEJORA 2: Advanced Voice Service
const voiceService = new AdvancedVoiceService();
app.locals.voiceService = voiceService;
logger.info('âœ… Advanced Voice Service inicializado');

// MEJORA 3: Real-Time Streaming
const streamingService = new RealTimeStreamingService();
app.locals.streamingService = streamingService;
logger.info('âœ… Real-Time Streaming Service inicializado');

// SQLITE REMOVED - PostgreSQL only via DATABASE_URL env var

// === CONFIGURAR AUTENTICACIÃ“N (con Key Vault) ===
async function initializeSession() {
  try {
    // Obtener SESSION_SECRET de Key Vault
    const sessionSecret = await keyVaultService.getSessionSecret();
    
    app.use(session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      }
    }));
    
    logger.info('âœ… SESSION_SECRET cargado desde Key Vault');
  } catch (error) {
    // Fallback a variable de entorno
    logger.warn('âš ï¸ Key Vault no disponible, usando SESSION_SECRET de env', { error: error.message });
    const fallbackSecret = process.env.SESSION_SECRET || 'econeura-session-secret-dev';
    
    if (fallbackSecret === 'econeura-session-secret-dev') {
      logger.warn('âš ï¸ ADVERTENCIA: Usando SESSION_SECRET por defecto (solo desarrollo)');
    }
    
    app.use(session({
      secret: fallbackSecret,
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
      }
    }));
  }
  
  app.use(passport.initialize());
  app.use(passport.session());
  logger.info('âœ… Sistema de autenticaciÃ³n OAuth configurado');
}

// Inicializar autenticaciÃ³n (async)
configurePassport();
initializeSession().catch(err => {
  logger.error('âŒ Error crÃ­tico inicializando sesiÃ³n:', { error: err.message, stack: err.stack });
  // NO matar el proceso - permitir que el servidor arranque sin sesiÃ³n
  // process.exit(1);
});

// OPTIONS requests handled by cors() middleware above

// JSON body parser (ya CORS estÃ¡ aplicado arriba)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting (3 niveles)
app.use(globalLimiter);

// Prompts avanzados (leer de archivos prompts/)
const prompts = {
  'a-ceo-01': require('./prompts/neura-ceo'),
  'a-ia-01': require('./prompts/neura-ia'),
  'a-cso-01': require('./prompts/neura-cso'),
  'a-cto-01': require('./prompts/neura-cto'),
  'a-ciso-01': require('./prompts/neura-ciso'),
  'a-coo-01': require('./prompts/neura-coo'),
  'a-chro-01': require('./prompts/neura-chro'),
  'a-mkt-01': require('./prompts/neura-cmo'),
  'a-cfo-01': require('./prompts/neura-cfo'),
  'a-cdo-01': require('./prompts/neura-cdo')
};

function getPrompt(agentId) {
  const promptConfig = prompts[agentId];
  if (promptConfig && promptConfig.systemPrompt) {
    return promptConfig.systemPrompt;
  }
  return 'Eres un asistente ejecutivo de ECONEURA. Respondes de forma profesional y concisa en espaÃ±ol.';
}

// ELIMINADO: llamarOpenAI() - Reemplazado por ResilientAIGateway
// Todas las llamadas ahora usan app.locals.aiGateway.getChatCompletion()
// que proporciona circuit breakers, fallback automÃ¡tico y mejor resiliencia

// Health endpoint handled by healthRouter at /api/health

// Chat endpoint legacy /api/invoke/:id - Compatibilidad
app.post('/api/invoke/:id', async (req, res) => {
  const { input } = req.body;
  const { id: agentId } = req.params;
  const correlationId = req.headers['x-correlation-id'] || `req-${Date.now()}`;

  // ValidaciÃ³n crÃ­tica: Input requerido
  if (!input || !input.trim()) {
    logger.warn('[Chat] Request sin input', { agentId, correlationId });
    return res.status(400).json({ 
      error: 'Input required',
      code: 'MISSING_INPUT',
      correlationId
    });
  }

  // ValidaciÃ³n crÃ­tica: OpenAI Key requerida
  if (!OPENAI_KEY) {
    logger.error('[Chat] OPENAI_API_KEY no configurado', { agentId, correlationId });
    return res.status(500).json({
      error: 'OpenAI API key not configured',
      code: 'OPENAI_KEY_MISSING',
      details: 'Please configure OPENAI_API_KEY in environment variables',
      correlationId
    });
  }

  logger.info('[Chat] Request recibido', {
    agentId,
    inputLength: input.length,
    correlationId
  });

  try {
    // Usar ResilientAIGateway en lugar de llamarOpenAI (legacy)
    const aiGateway = app.locals.aiGateway;
    
    if (!aiGateway) {
      logger.error('[Chat] AI Gateway no inicializado', { agentId, correlationId });
      return res.status(503).json({
        error: 'AI Gateway not initialized',
        code: 'AI_GATEWAY_NOT_READY',
        correlationId
      });
    }

    // Extraer neuraId del agentId
    const agentParts = agentId.split('-');
    const neuraMap = { ceo: 0, ia: 1, cso: 2, cto: 3, ciso: 4, coo: 5, chro: 6, mkt: 7, cfo: 8, cdo: 9 };
    const neuraId = neuraMap[agentParts[1]?.toLowerCase()] || 0;

    const systemPrompt = getPrompt(agentId);
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: input }
    ];

    const startTime = Date.now();
    const result = await aiGateway.getChatCompletion(input, {
      neuraId,
      temperature: 0.7,
      maxTokens: 1000,
      context: { systemPrompt, agentId }
    });
    const duration = Date.now() - startTime;
    const output = result.output || result.message || 'Sin respuesta';

    logger.info('[Chat] Response exitosa', {
      agentId,
      duration,
      outputLength: output.length,
      correlationId
    });

    // Verificar si la respuesta es un error (string que empieza con "Error:")
    if (output && output.startsWith('Error:')) {
      logger.error('[Chat] OpenAI retornÃ³ error', {
        agentId,
        error: output,
        correlationId
      });
      return res.status(500).json({
        error: output,
        code: 'OPENAI_ERROR',
        correlationId
      });
    }

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Correlation-ID', correlationId);
    res.json({
      output: output,
      provider: result.provider || 'openai',
      model: result.model || 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      agentId: agentId,
      latency: duration,
      tokens: result.tokens || 0,
      cost: result.cost || 0
    });

  } catch (error) {
    logger.error('[Chat] Error procesando request', {
      agentId,
      error: error.message,
      stack: error.stack,
      correlationId
    });
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      code: 'INTERNAL_ERROR',
      correlationId
    });
  }
});


// Redis inicializado arriba en database pooling (lÃ­nea 183)
// CÃ³digo duplicado eliminado

// === INICIALIZAR ECONEURA MAX PREMIUM AUTOMATION ===
// Automation services eliminados - bloqueaban inicio sin beneficio
// Si se necesitan en el futuro, implementar con lazy loading adecuado

// Start server


// === ROUTERS CRÃTICOS (USADOS POR FRONTEND) ===
app.use('/api/auth', authRouter); // âœ… USADO: Login/Register
const invokeRouter = require('./routes/invoke');
app.use('/api/invoke', invokeRouter); // âœ… USADO: Invocar agentes
app.use('/api/chats', authMiddleware, chatsRouter); // âœ… USADO: Historial
app.use('/api/health', healthRouter); // âœ… USADO: Health check

// === METRICS & OBSERVABILITY ===
const { router: metricsRouter, metricsMiddleware } = require('./api/metrics');
app.use(metricsMiddleware); // Middleware para contar requests
app.use('/api/metrics', metricsRouter); // âœ… NUEVO: Prometheus metrics

// === AI GATEWAY (ENDPOINT PRINCIPAL DE CHAT) ===
const aiGatewayRouter = require('./routes/ai-gateway');
app.use('/api/ai-gateway', aiGatewayRouter); // âœ… USADO: Chat principal
app.use('/api/library', authMiddleware, libraryRouter); // âœ… NUEVO: Biblioteca de documentos

// === ROUTERS LEGACY/NO USADOS (COMENTADOS - REVERSIBLES) ===
// Comentados segÃºn anÃ¡lisis: frontend solo usa 7 endpoints de 43+
// Descomentar si se detecta uso en logs Azure despuÃ©s de 1 semana
// app.use('/api/auth-old', authRouterOld); // âŒ NO USADO: AutenticaciÃ³n antigua
// app.use('/api/local-chat', localChatRouter); // âŒ NO USADO: Chat local SQLite
// app.use('/api/chat', chatRouter); // âŒ NO USADO: Duplicado con ai-gateway
// app.use('/api/webhooks', webhooksRouter); // âŒ NO USADO: Webhooks
const integrationRouter = require('./routes/integration');
app.use('/api/integration', integrationRouter); // âœ… USADO: Make/n8n webhooks
// app.use('/api/n8n', n8nRouter); // âŒ NO USADO: n8n especÃ­fico
// app.use('/api/chatgpt', chatgptRouter); // âŒ NO USADO: ChatGPT especÃ­fico
// app.use('/api/providers', unifiedProvidersRouter); // âŒ NO USADO: Provider management
// app.use('/api/cache', providerCacheRouter); // âŒ NO USADO: Cache
// app.use('/api/notifications', providerNotificationsRouter); // âŒ NO USADO: Notifications
// app.use('/api/audit', providerAuditRouter); // âŒ NO USADO: Audit
// app.use('/api/rate-limit', providerRateLimitRouter.router); // âŒ NO USADO: Rate limit duplicado
// app.use('/api/health', providerHealthRouter); // âŒ DUPLICADO: Ya existe healthRouter
// app.use('/api/backup', providerBackupRouter); // âŒ NO USADO: Backup
// app.use('/api/versioning', providerVersioningRouter); // âŒ NO USADO: Versioning
// app.use('/api/business-metrics', businessMetricsRouter); // âŒ NO USADO: Business metrics
// app.use('/api/performance', performanceOptimizationRouter); // âŒ NO USADO: Performance
// app.use('/api/scalability', scalabilityRouter); // âŒ NO USADO: Scalability
// app.use('/api/cicd', cicdRouter); // âŒ NO USADO: CI/CD
// app.use('/api/analytics', advancedAnalyticsRouter); // âŒ NO USADO: Analytics
// app.use('/api/ai-intelligence', aiIntelligenceRouter); // âŒ NO USADO: AI Intelligence
// app.use('/api/monitoring', advancedMonitoringRouter); // âŒ NO USADO: Monitoring
// app.use('/api/security', advancedSecurityRouter); // âŒ NO USADO: Security
// app.use('/api/business-intelligence', businessIntelligenceRouter); // âŒ NO USADO: BI
// app.use('/api/optimization', finalOptimizationRouter); // âŒ NO USADO: Optimization
// app.use('/api/finops', authMiddleware, finopsRouter); // âŒ NO USADO: FinOps
const agentsRouter = require('./api/agents');
app.use('/api/agents', authMiddleware, agentsRouter); // âœ… USADO: GestiÃ³n agentes Make/n8n
// app.use('/api/agent', agentRouter); // âŒ NO USADO: Agent legacy
const proposalsRouter = require('./api/proposals');
app.use('/api/proposals', authMiddleware, proposalsRouter);
const neuraAgentsRouter = require('./routes/neura-agents');
app.use('/api/neura-agents', neuraAgentsRouter);
const neuraChatEnhancedRouter = require('./routes/neura-chat-enhanced');
app.use('/api/neura-chat', neuraChatEnhancedRouter); // âœ… USADO: HITL Proposals
// const premiumFeaturesRouter = require('./routes/premium-features'); // âŒ NO USADO
// app.use('/api/premium', premiumFeaturesRouter);
// const automationRouter = require('./api/automation'); // âŒ NO USADO
// app.use('/api/automation', automationRouter);

// Graceful shutdown handler
async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  return new Promise((resolve) => {
    // Cerrar HTTP server
    server.close(() => {
      logger.info('HTTP server closed');
    });
    
    // Cerrar conexiones
    Promise.all([
      pgPool ? pgPool.end().then(() => logger.info('PostgreSQL pool closed')) : Promise.resolve(),
      redisClient ? redisClient.quit().then(() => logger.info('Redis closed')) : Promise.resolve(),
      appInsights && appInsights.isInitialized() ? appInsights.flush() : Promise.resolve()
    ]).then(() => {
      logger.info('âœ… Graceful shutdown completed');
      resolve();
      process.exit(0);
    }).catch((err) => {
      logger.error('Error during graceful shutdown:', { error: err.message });
      resolve();
      process.exit(1);
    });
  });
}

// Registrar handlers de shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info('\n' + '='.repeat(70));
  logger.info('  ECONEURA MAX PREMIUM Backend Ready v2.0 - AUTOMATED');
  logger.info('='.repeat(70));
  logger.info(`  Server:   http://0.0.0.0:${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '3.0.0'
  });
  logger.info('  Provider: Mammouth AI (Mistral Medium 3.1)');
  logger.info('  Status:   Ready with Full Automation');
  logger.info('  Features: Workflows + Collaboration + Analytics + Security');
  logger.info('='.repeat(70) + '\n');
});




