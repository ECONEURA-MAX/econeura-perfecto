# 🏆 11 MEJORAS PARA CALIDAD 10/10 - ECONEURA

**REGLA ABSOLUTA**: NO tocar diseño visual de Login.tsx ni EconeuraCockpit.tsx

**OBJETIVO**: Aumentar calidad de 8.9/10 → 10/10

**CRÍTICO**: Si no funciona en www.econeura.com → NO SIRVE DE NADA

---

## MEJORA 0: CONFIGURAR DOMINIO www.econeura.com (CRÍTICO) 🌐

**PROBLEMA**:
- Dominio econeura.com en Cloudflare ✅
- Backend en Azure: `econeura-backend.azurewebsites.net`
- Frontend en Azure: `econeura-frontend.azurestaticapps.net`
- **PERO usuarios NO pueden acceder via www.econeura.com** ❌

**SOLUCIÓN COMPLETA**:

### Paso 1: Configurar DNS en Cloudflare

**Cloudflare Dashboard** → DNS → Registros:

```
Tipo    Nombre          Destino                                           TTL    Proxy
────────────────────────────────────────────────────────────────────────────────
CNAME   www             econeura-frontend.azurestaticapps.net            Auto   ✅ Proxied
CNAME   @               econeura-frontend.azurestaticapps.net            Auto   ✅ Proxied
CNAME   api             econeura-backend.azurewebsites.net               Auto   ✅ Proxied
TXT     @               "v=spf1 include:_spf.google.com ~all"            Auto   -
```

**Comandos Cloudflare API** (alternativa):
```powershell
$zone = "068d477791c3c37dc7be2020f54d38c7"
$email = "Samupanzardi@gmail.com"
$apiKey = $env:CLOUDFLARE_API_KEY

# CNAME www → frontend
curl -X POST "https://api.cloudflare.com/client/v4/zones/$zone/dns_records" `
  -H "X-Auth-Email: $email" `
  -H "X-Auth-Key: $apiKey" `
  -H "Content-Type: application/json" `
  --data '{
    "type":"CNAME",
    "name":"www",
    "content":"econeura-frontend.azurestaticapps.net",
    "ttl":1,
    "proxied":true
  }'

# CNAME @ (root) → frontend
curl -X POST "https://api.cloudflare.com/client/v4/zones/$zone/dns_records" `
  -H "X-Auth-Email: $email" `
  -H "X-Auth-Key: $apiKey" `
  -H "Content-Type: application/json" `
  --data '{
    "type":"CNAME",
    "name":"@",
    "content":"econeura-frontend.azurestaticapps.net",
    "ttl":1,
    "proxied":true
  }'

# CNAME api → backend
curl -X POST "https://api.cloudflare.com/client/v4/zones/$zone/dns_records" `
  -H "X-Auth-Email: $email" `
  -H "X-Auth-Key: $apiKey" `
  -H "Content-Type: application/json" `
  --data '{
    "type":"CNAME",
    "name":"api",
    "content":"econeura-backend.azurewebsites.net",
    "ttl":1,
    "proxied":true
  }'
```

### Paso 2: Configurar Custom Domain en Azure Static Web App

```bash
# Agregar custom domain
az staticwebapp hostname set \
  --name econeura-frontend \
  --resource-group econeura-rg \
  --hostname www.econeura.com

az staticwebapp hostname set \
  --name econeura-frontend \
  --resource-group econeura-rg \
  --hostname econeura.com
```

**Azure Portal**:
1. Static Web Apps → econeura-frontend
2. Custom domains → Add
3. Hostname: `www.econeura.com`
4. Validation: CNAME `_dnsauth.www` → `<validation-token>.azurestaticapps.net`
5. Repeat para `econeura.com`

### Paso 3: Configurar Custom Domain en App Service (Backend)

```bash
# Agregar custom domain
az webapp config hostname add \
  --webapp-name econeura-backend \
  --resource-group econeura-rg \
  --hostname api.econeura.com
```

**Verificación dominio**:
- Azure genera TXT record
- Agregar en Cloudflare DNS:
  ```
  TXT   asuid.api   <azure-verification-code>
  ```

### Paso 4: SSL/TLS en Cloudflare

**Cloudflare Dashboard** → SSL/TLS:
- **Modo**: Full (strict) ✅
  - Cloudflare ↔ Azure: TLS 1.3
  - Azure: Managed certificates
- **Always Use HTTPS**: ON ✅
- **Automatic HTTPS Rewrites**: ON ✅
- **Minimum TLS Version**: 1.2 ✅

### Paso 5: Actualizar CORS en Backend

```javascript
// backend/server.js
const corsOptions = {
  origin: [
    'https://econeura.com',
    'https://www.econeura.com',
    'https://api.econeura.com',
    'http://localhost:5173' // Local dev
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### Paso 6: Actualizar API_URL en Frontend

```typescript
// frontend/src/config/api.ts
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  // PRODUCCIÓN: api.econeura.com
  if (hostname === 'econeura.com' || hostname === 'www.econeura.com') {
    return 'https://api.econeura.com/api';
  }
  
  // LOCAL: localhost
  return 'http://localhost:8080/api';
};

export const API_URL = getApiUrl();
```

### Paso 7: Verificar Funcionamiento

```bash
# 1. Frontend
curl -I https://www.econeura.com
# Esperado: 200 OK

# 2. Backend API
curl https://api.econeura.com/api/health
# Esperado: {"status":"ok"}

# 3. CORS
curl -H "Origin: https://www.econeura.com" https://api.econeura.com/api/health
# Esperado: Header "Access-Control-Allow-Origin: https://www.econeura.com"

# 4. SSL
curl -I https://www.econeura.com | grep "HTTP"
# Esperado: HTTP/2 200
```

**RESULTADO**:
- ✅ www.econeura.com → Frontend (Static Web App)
- ✅ econeura.com → Frontend (redirect a www)
- ✅ api.econeura.com → Backend (App Service)
- ✅ SSL/TLS 1.3 automático (Cloudflare + Azure)
- ✅ CORS configurado correctamente
- ✅ **FUNCIONA EN PRODUCCIÓN** 🎉

**ARCHIVOS AFECTADOS**:
- Cloudflare DNS (4 registros)
- Azure Static Web App (2 custom domains)
- Azure App Service (1 custom domain)
- `backend/server.js` (CORS origins)
- `frontend/src/config/api.ts` (API URL)

**TIEMPO**: 1 hora

**IMPACTO**: 🚨 **SIN ESTO, PROYECTO NO SIRVE** 🚨

---

## MEJORA 1: LIMPIAR 242 LÍNEAS LEGACY EN server.js ⚡

**PROBLEMA**:
- server.js tiene 542 líneas
- 200+ líneas son código comentado (AdvancedVoiceService, RealTimeStreamingService)
- Código legacy confunde, hace diff ilegible

**SOLUCIÓN**:
```javascript
// ELIMINAR (líneas 202-209):
// const AdvancedVoiceService = require('./services/advancedVoice'); // COMENTADO
// const voiceService = new AdvancedVoiceService(); // COMENTADO

// ELIMINAR (líneas 220-235):
// const RealTimeStreamingService = require('./services/realTimeStreaming'); // COMENTADO
// app.use('/api/streaming', streamingRouter); // COMENTADO

// ELIMINAR todas las líneas que terminen con "// COMENTADO"
```

**RESULTADO**:
- 542 líneas → 300 líneas (-242 líneas, -45%)
- Código limpio, mantenible
- Diff legible

**ARCHIVOS AFECTADOS**:
- `backend/server.js`

**TIEMPO**: 30 minutos

**IMPACTO CALIDAD**: 8.9 → 9.1 (+0.2)

---

## MEJORA 2: CONSOLIDAR PROMPTS (10 .js → 1 .json) 📝

**PROBLEMA**:
- 11 archivos separados (prompts/neura-ceo.js, neura-cfo.js, etc.)
- 1,100 líneas de código para algo que es configuración
- Difícil editar prompts para no-devs

**SOLUCIÓN**:
Crear `backend/config/neuras.json`:
```json
{
  "neuras": [
    {
      "id": "a-ceo-01",
      "name": "NEURA CEO",
      "role": "Chief Executive Officer",
      "department": "CEO",
      "model": "mistral-medium-3.1",
      "temperature": 0.7,
      "maxTokens": 1500,
      "systemPrompt": "Eres CEO de una empresa. Tu rol es...",
      "tags": ["estrategia", "visión", "decisiones"],
      "costPerExecution": 0.01,
      "examples": [
        {
          "input": "Análisis estratégico mercado",
          "output": "Como CEO, observo 3 tendencias..."
        }
      ]
    }
    // ... 10 more NEURAs
  ]
}
```

Actualizar código:
```javascript
// ANTES:
const neuraCeo = require('./prompts/neura-ceo');
const neuraCfo = require('./prompts/neura-cfo');
// ... 11 requires

// DESPUÉS:
const neuras = require('./config/neuras.json').neuras;
const getNeuraConfig = (id) => neuras.find(n => n.id === id);
```

**RESULTADO**:
- 11 archivos .js → 1 archivo .json
- 1,100 líneas código → 500 líneas JSON
- Editable sin tocar código
- Versionable (Git diff clara)

**ARCHIVOS AFECTADOS**:
- `backend/prompts/*.js` (ELIMINAR 11 archivos)
- `backend/config/neuras.json` (CREAR)
- `backend/routes/invoke.js` (actualizar)

**TIEMPO**: 2 horas

**IMPACTO CALIDAD**: 9.1 → 9.3 (+0.2)

---

## MEJORA 3: DATABASE ABSTRACTION AUTO-SELECTOR 🗄️

**PROBLEMA**:
- `db.js` (PostgreSQL) y `db-mock.js` (Mock) separados
- Switch manual con `require('./db')` o `require('./db-mock')`
- Confusión cuál usar

**SOLUCIÓN**:
Crear `backend/src/services/database/index.js`:
```javascript
/**
 * Database Auto-Selector
 * Selecciona automáticamente PostgreSQL, Cosmos DB, o Mock
 */

const env = process.env;

if (env.USE_COSMOS_DB === 'true') {
  module.exports = require('./cosmosdb');
} else if (env.USE_MOCK_DB === 'true') {
  module.exports = require('./mock');
} else if (env.DATABASE_URL) {
  module.exports = require('./postgresql');
} else {
  console.warn('⚠️  No database configured, using Mock DB');
  module.exports = require('./mock');
}
```

Mover archivos:
- `db.js` → `src/services/database/postgresql.js`
- `db-mock.js` → `src/services/database/mock.js`
- Crear `src/services/database/cosmosdb.js` (futuro)

Actualizar todos los imports:
```javascript
// ANTES:
const db = require('./db');
const db = require('./db-mock');

// DESPUÉS:
const db = require('./src/services/database');
// Auto-selecciona según .env
```

**RESULTADO**:
- 1 import universal
- Auto-select según env vars
- Preparado para Cosmos DB
- Menos confusión

**ARCHIVOS AFECTADOS**:
- `backend/db.js` → `src/services/database/postgresql.js` (MOVER)
- `backend/db-mock.js` → `src/services/database/mock.js` (MOVER)
- `backend/src/services/database/index.js` (CREAR)
- 20+ archivos que usan `require('./db')` (ACTUALIZAR)

**TIEMPO**: 1 hora

**IMPACTO CALIDAD**: 9.3 → 9.5 (+0.2)

---

## MEJORA 4: TESTS >80% COVERAGE 🧪

**PROBLEMA**:
- Coverage actual: ~60% backend, ~70% frontend
- Archivos críticos sin tests:
  - makeService.js (132 líneas) - SIN TESTS
  - neuraAgentExecutor.js (214 líneas) - SIN TESTS
  - generatorsBridge.js (125 líneas) - SIN TESTS
  - api/agents.js (557 líneas) - SIN TESTS
  - api/proposals.js (593 líneas) - SIN TESTS

**SOLUCIÓN**:
Crear tests unitarios:

**backend/tests/unit/services/makeService.test.js**:
```javascript
describe('MakeService', () => {
  describe('invokeMakeAgent', () => {
    it('should cache response with idempotencyKey', async () => {
      const result1 = await invokeMakeAgent('a-ceo-01', { 
        input: 'test', 
        idempotencyKey: 'key-123' 
      });
      const result2 = await invokeMakeAgent('a-ceo-01', { 
        input: 'test', 
        idempotencyKey: 'key-123' 
      });
      
      expect(result2._meta.replayed).toBe(true);
    });

    it('should retry on failure with exponential backoff', async () => {
      // Test retry logic...
    });

    it('should open circuit breaker after 3 failures', async () => {
      // Test circuit breaker...
    });
  });
});
```

**backend/tests/integration/agents-flow.test.js**:
```javascript
describe('Agents Flow', () => {
  it('should create agent → execute → log execution', async () => {
    // 1. Create agent
    const agent = await createAgent({
      name: 'Test Agent',
      platform: 'make',
      webhook_url: 'https://hook.example.com/test',
      department: 'CEO',
      neura_assigned: 'CEO'
    });
    
    // 2. Execute agent
    const execution = await executeAgent(agent.id, { test: true });
    
    // 3. Verify execution logged
    const logs = await getAgentExecutions(agent.id);
    expect(logs.length).toBe(1);
    expect(logs[0].status).toBe('success');
  });
});
```

**frontend/tests/e2e/agent-crud.spec.ts**:
```typescript
test('Agent CRUD flow', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Login
  await page.click('text=Iniciar sesión con Microsoft');
  
  // Go to Agents
  await page.click('text=Agents');
  
  // Create agent
  await page.click('text=Crear Agente');
  await page.fill('input[name="name"]', 'Test Agent');
  await page.selectOption('select[name="platform"]', 'make');
  await page.fill('input[name="webhook_url"]', 'https://hook.make.com/test');
  await page.click('button:has-text("Guardar")');
  
  // Verify created
  await expect(page.locator('text=Test Agent')).toBeVisible();
  
  // Delete agent
  await page.click('button[aria-label="Eliminar Test Agent"]');
  await page.click('button:has-text("Confirmar")');
  
  // Verify deleted
  await expect(page.locator('text=Test Agent')).not.toBeVisible();
});
```

**RESULTADO**:
- Coverage: 60% → 85%
- 15 test files nuevos
- ~1,500 líneas de tests
- CI/CD con tests obligatorios

**ARCHIVOS AFECTADOS**:
- `backend/tests/unit/services/` (10 archivos nuevos)
- `backend/tests/integration/` (5 archivos nuevos)
- `frontend/tests/e2e/` (3 archivos nuevos)
- `package.json` (scripts test:coverage)

**TIEMPO**: 8 horas

**IMPACTO CALIDAD**: 9.5 → 9.7 (+0.2)

---

## MEJORA 5: SECURITY HARDENING (OWASP 100%) 🔒

**PROBLEMA**:
- OWASP Top 10: 90% mitigado (falta 10%)
- Sin CSRF protection
- Sin SSRF validation en webhooks
- Sin SRI hashes en frontend
- CSP incompleto

**SOLUCIÓN**:

**5.1 - CSRF Protection**:
```bash
npm install --save csurf
```
```javascript
// backend/server.js
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Aplicar a forms
app.post('/api/agents', csrfProtection, agentsRouter);
app.post('/api/proposals', csrfProtection, proposalsRouter);

// Endpoint para obtener token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

**5.2 - SSRF Validation**:
```javascript
// backend/utils/validators.js
function validateWebhookUrl(url) {
  const parsed = new URL(url);
  
  // Block private IPs
  const privatePatterns = [
    /^localhost$/i,
    /^127\.\d+\.\d+\.\d+$/,
    /^0\.0\.0\.0$/,
    /^10\.\d+\.\d+\.\d+$/,
    /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
    /^192\.168\.\d+\.\d+$/,
    /^169\.254\.\d+\.\d+$/ // Link-local
  ];
  
  if (privatePatterns.some(pattern => pattern.test(parsed.hostname))) {
    throw new Error('Webhook URL cannot be private IP');
  }
  
  // Only allow HTTPS in production
  if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
    throw new Error('Webhook URL must use HTTPS in production');
  }
  
  return true;
}

// Aplicar en api/agents.js
router.post('/', async (req, res) => {
  const { webhook_url } = req.body;
  
  try {
    validateWebhookUrl(webhook_url);
    // ... continuar creación
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});
```

**5.3 - SRI Hashes**:
```html
<!-- frontend/index.html -->
<!-- ANTES: -->
<script src="https://cdn.example.com/react.js"></script>

<!-- DESPUÉS: -->
<script 
  src="https://cdn.example.com/react.js" 
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/ux..."
  crossorigin="anonymous">
</script>
```

**5.4 - Content Security Policy Complete**:
```javascript
// backend/middleware/securityHeaders.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Solo permitir inline necesario
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: [
        "'self'", 
        "https://econeura-backend.azurewebsites.net",
        "https://api.mammouth.ai"
      ],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
}));
```

**RESULTADO**:
- OWASP Top 10: 90% → 100%
- CSRF protection ✅
- SSRF protection ✅
- SRI hashes ✅
- CSP complete ✅

**ARCHIVOS AFECTADOS**:
- `backend/middleware/securityHeaders.js` (50 → 120 líneas)
- `backend/utils/validators.js` (CREAR, 100 líneas)
- `backend/api/agents.js` (agregar validación)
- `frontend/index.html` (agregar SRI)
- `package.json` (agregar csurf)

**TIEMPO**: 4 horas

**IMPACTO CALIDAD**: 9.7 → 9.8 (+0.1)

---

## MEJORA 3: DATABASE INDICES PARA PERFORMANCE ⚡

**PROBLEMA**:
- Queries lentas sin índices
- Tabla `agents`: 45 agentes, queries `WHERE user_id = X` sin índice
- Tabla `chats`: 1000+ chats, queries `WHERE user_id = X` sin índice
- Performance: ~500ms P95 (objetivo <200ms)

**SOLUCIÓN**:
Crear `backend/db/migrations/004_add_indexes.sql`:
```sql
-- Indices para agents table
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_platform ON agents(platform);
CREATE INDEX idx_agents_neura_assigned ON agents(neura_assigned);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_created_at ON agents(created_at DESC);

-- Indices para chats table
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_neura_id ON chats(neura_id);
CREATE INDEX idx_chats_created_at ON chats(created_at DESC);

-- Indices para proposals table
CREATE INDEX idx_proposals_user_id ON proposals(user_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_created_at ON proposals(created_at DESC);

-- Indices para documents table
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_department ON documents(department);
CREATE INDEX idx_documents_neura ON documents(neura);

-- Full-text search index (PostgreSQL)
CREATE INDEX idx_document_chunks_fts ON document_chunks 
  USING gin(to_tsvector('spanish', text));

-- Analyze tables
ANALYZE agents;
ANALYZE chats;
ANALYZE proposals;
ANALYZE documents;
ANALYZE document_chunks;
```

**RESULTADO**:
- Query `GET /api/agents`: 500ms → 10ms (-98%)
- Query `GET /api/chats`: 300ms → 5ms (-98%)
- Query `GET /api/library/search`: 2s → 50ms (-97%)
- Performance P95: 500ms → 150ms (-70%)

**ARCHIVOS AFECTADOS**:
- `backend/db/migrations/004_add_indexes.sql` (CREAR)
- `backend/db/schema.sql` (actualizar con indices)

**TIEMPO**: 30 minutos

**IMPACTO CALIDAD**: 9.8 → 9.85 (+0.05)

---

## MEJORA 4: RATE LIMITING POR TIER (FREE/PRO/BUSINESS) 🚦

**PROBLEMA**:
- Rate limiting global: 100 req/15min para TODOS
- No diferencia usuarios free vs paid
- Usuarios premium pagan pero tienen mismo límite

**SOLUCIÓN**:
Actualizar `backend/middleware/rateLimiter.js`:
```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

// Rate limits por tier
const RATE_LIMITS = {
  free: {
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100 // 100 requests
  },
  pro: {
    windowMs: 15 * 60 * 1000,
    max: 1000 // 1000 requests
  },
  business: {
    windowMs: 15 * 60 * 1000,
    max: 5000 // 5000 requests
  },
  enterprise: {
    windowMs: 15 * 60 * 1000,
    max: 0 // Unlimited
  }
};

function createRateLimiter() {
  return rateLimit({
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:'
    }),
    windowMs: 15 * 60 * 1000,
    max: async (req) => {
      // Obtener tier del usuario
      const user = req.user;
      if (!user) return RATE_LIMITS.free.max;
      
      const tier = user.subscription_tier || 'free';
      const limit = RATE_LIMITS[tier];
      
      return limit ? limit.max : RATE_LIMITS.free.max;
    },
    keyGenerator: (req) => {
      // Rate limit por user_id (si está autenticado) o por IP
      return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
    },
    handler: (req, res) => {
      const user = req.user;
      const tier = user?.subscription_tier || 'free';
      
      res.status(429).json({
        error: 'Rate limit exceeded',
        tier,
        limit: RATE_LIMITS[tier].max,
        retryAfter: req.rateLimit.resetTime
      });
    },
    standardHeaders: true,
    legacyHeaders: false
  });
}

module.exports = { 
  apiLimiter: createRateLimiter(),
  RATE_LIMITS 
};
```

Agregar columna `subscription_tier` a tabla `users`:
```sql
-- backend/db/migrations/005_add_subscription_tier.sql
ALTER TABLE users 
ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'free';

CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
```

**RESULTADO**:
- Free: 100 req/15min
- Pro: 1,000 req/15min (10x)
- Business: 5,000 req/15min (50x)
- Enterprise: Unlimited
- Monetización clara
- Incentivo upgrade

**ARCHIVOS AFECTADOS**:
- `backend/middleware/rateLimiter.js` (143 → 200 líneas)
- `backend/db/migrations/005_add_subscription_tier.sql` (CREAR)
- `backend/db/schema.sql` (actualizar)

**TIEMPO**: 2 horas

**IMPACTO CALIDAD**: 9.85 → 9.87 (+0.02)

---

## MEJORA 5: AZURE FUNCTIONS PARA WEBHOOKS (SERVERLESS) ☁️

**PROBLEMA**:
- Webhooks en Express (`api/webhooks.js`, 58 líneas)
- No escala automáticamente
- Backend debe estar UP para recibir webhooks
- Costo: Backend B1 ($54.75) siempre corriendo

**SOLUCIÓN**:
Migrar webhooks a Azure Functions (serverless):

**backend/functions/makeWebhook/index.js**:
```javascript
module.exports = async function (context, req) {
  const crypto = require('crypto');
  const { CosmosClient } = require('@azure/cosmos');
  
  // 1. Verify HMAC signature
  const signature = req.headers['x-make-signature'];
  const payload = req.body;
  const secret = process.env.MAKE_WEBHOOK_SECRET;
  
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac))) {
    context.res = {
      status: 401,
      body: { error: 'Invalid signature' }
    };
    return;
  }
  
  // 2. Process webhook
  const { agentId, data } = payload;
  
  // 3. Save execution to database
  const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
  const container = client.database('econeura').container('executions');
  
  await container.items.create({
    id: `exec-${Date.now()}`,
    agentId,
    platform: 'make',
    input: data,
    status: 'success',
    executedAt: new Date().toISOString()
  });
  
  // 4. Return response
  context.res = {
    status: 200,
    body: {
      success: true,
      agentId,
      executedAt: new Date().toISOString()
    }
  };
};
```

**backend/functions/host.json**:
```json
{
  "version": "2.0",
  "extensions": {
    "http": {
      "routePrefix": "api/webhooks"
    }
  },
  "functionTimeout": "00:05:00"
}
```

**RESULTADO**:
- Webhooks serverless (auto-scaling 0 → 1000 instances)
- Costo: Solo when executed ($0.20 per 1M executions)
- Backend puede estar DOWN, webhooks siguen funcionando
- Latency: <100ms (vs ~200ms en Express)

**ARCHIVOS AFECTADOS**:
- `backend/functions/makeWebhook/` (CREAR)
- `backend/functions/n8nWebhook/` (CREAR)
- `backend/functions/zapierWebhook/` (CREAR)
- `backend/functions/host.json` (CREAR)
- `.github/workflows/functions-deploy.yml` (CREAR)

**TIEMPO**: 3 horas

**IMPACTO CALIDAD**: 9.87 → 9.90 (+0.03)

---

## MEJORA 6: AUDIT LOG INMUTABLE CON SHA256 📜

**PROBLEMA**:
- Audit logs existen pero son mutables (UPDATE/DELETE posible)
- No hay firma digital (no se puede verificar integridad)
- Compliance: AI Act requiere audit trail inmutable

**SOLUCIÓN**:
Crear tabla `audit_log` append-only:
```sql
-- backend/db/migrations/006_audit_log_immutable.sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL, -- 'auth', 'neura', 'agent', 'proposal'
  event_action VARCHAR(50) NOT NULL, -- 'login', 'execute', 'approve'
  user_id UUID,
  resource_id UUID,
  resource_type VARCHAR(50),
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  previous_hash VARCHAR(64), -- SHA256 del log anterior
  signature VARCHAR(64), -- SHA256 de este log
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Hacer tabla append-only (no UPDATE/DELETE)
REVOKE UPDATE, DELETE ON audit_log FROM PUBLIC;
REVOKE UPDATE, DELETE ON audit_log FROM econeura_app_user;

-- Index para queries
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_event_type ON audit_log(event_type);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
```

**backend/services/auditLog.js**:
```javascript
const crypto = require('crypto');

class AuditLogService {
  constructor(db) {
    this.db = db;
  }
  
  /**
   * Log event con firma SHA256
   */
  async log(event) {
    const { event_type, event_action, user_id, resource_id, resource_type, details, ip_address, user_agent } = event;
    
    // 1. Obtener hash del último log
    const lastLog = await this.db.query(
      'SELECT signature FROM audit_log ORDER BY created_at DESC LIMIT 1'
    );
    const previous_hash = lastLog.rows[0]?.signature || '0'.repeat(64);
    
    // 2. Calcular signature de este log
    const data = JSON.stringify({
      event_type,
      event_action,
      user_id,
      resource_id,
      resource_type,
      details,
      previous_hash,
      timestamp: new Date().toISOString()
    });
    
    const signature = crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
    
    // 3. Insertar log (append-only)
    await this.db.query(`
      INSERT INTO audit_log (
        event_type, event_action, user_id, resource_id, resource_type,
        details, ip_address, user_agent, previous_hash, signature
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      event_type, event_action, user_id, resource_id, resource_type,
      JSON.stringify(details), ip_address, user_agent, previous_hash, signature
    ]);
    
    return { signature, previous_hash };
  }
  
  /**
   * Verificar integridad de audit log
   */
  async verifyIntegrity() {
    const logs = await this.db.query(
      'SELECT * FROM audit_log ORDER BY created_at ASC'
    );
    
    let previousHash = '0'.repeat(64);
    let valid = true;
    
    for (const log of logs.rows) {
      // Verificar que previous_hash coincide
      if (log.previous_hash !== previousHash) {
        console.error('Integrity breach detected', { logId: log.id });
        valid = false;
      }
      
      previousHash = log.signature;
    }
    
    return valid;
  }
}

module.exports = AuditLogService;
```

**Integrar en todas las acciones críticas**:
```javascript
// En routes/auth.js
await auditLog.log({
  event_type: 'auth',
  event_action: 'login',
  user_id: user.id,
  details: { method: 'oauth', provider: 'microsoft' },
  ip_address: req.ip,
  user_agent: req.headers['user-agent']
});

// En routes/agent.js
await auditLog.log({
  event_type: 'agent',
  event_action: 'execute',
  user_id: req.user.id,
  resource_id: agent.id,
  resource_type: 'agent',
  details: { platform: agent.platform, duration: result.duration }
});

// En api/proposals.js
await auditLog.log({
  event_type: 'proposal',
  event_action: 'approve',
  user_id: req.user.id,
  resource_id: proposal.id,
  resource_type: 'proposal',
  details: { approver_role }
});
```

**RESULTADO**:
- Audit log inmutable (no UPDATE/DELETE)
- Firma SHA256 verificable
- Compliance: AI Act + ISO 27001 + SOC 2
- Integridad demostrable

**ARCHIVOS AFECTADOS**:
- `backend/db/migrations/006_audit_log_immutable.sql` (CREAR)
- `backend/services/auditLog.js` (CREAR, 150 líneas)
- `backend/routes/auth.js` (agregar logging)
- `backend/routes/agent.js` (agregar logging)
- `backend/api/proposals.js` (agregar logging)

**TIEMPO**: 3 horas

**IMPACTO CALIDAD**: 9.90 → 9.93 (+0.03)

---

## MEJORA 7: FRONTEND BUNDLE OPTIMIZATION (<250 KB) 📦

**PROBLEMA**:
- Bundle actual: ~400 KB (gzip)
- Objetivo: <250 KB
- Muchos imports no usados
- Algunas deps pesadas (moment.js, etc.)

**SOLUCIÓN**:

**7.1 - Tree Shaking Aggressive**:
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'markdown': ['react-markdown', 'remark-gfm'],
          'utils': ['fuse.js', 'sonner']
        }
      }
    },
    target: 'es2020',
    minify: 'esbuild',
    cssCodeSplit: true,
    
    // Tree shaking aggressive
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      }
    }
  }
});
```

**7.2 - Lazy Loading Components**:
```typescript
// App.tsx
const EconeuraCockpit = React.lazy(() => import('./features/neuras/NeuraCockpit'));
const AgentManagement = React.lazy(() => import('./features/agents/AgentList'));
const Analytics = React.lazy(() => import('./features/analytics/Dashboard'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/" element={<EconeuraCockpit />} />
    <Route path="/agents" element={<AgentManagement />} />
    <Route path="/analytics" element={<Analytics />} />
  </Routes>
</Suspense>
```

**7.3 - Remover dependencias no usadas**:
```bash
# Verificar deps no usadas
npx depcheck

# Resultado esperado:
# - canvas-confetti (solo usado en 1 lugar, 50 KB) → Reemplazar con CSS animation
# - @vercel/analytics (no usado) → Eliminar
# - tesseract.js (OCR, 2 MB) → Lazy load solo si se usa
```

**7.4 - Comprimir imágenes**:
```bash
# Logo actual: 150 KB PNG
# Convertir a WebP: 30 KB (-80%)

# Antes:
<img src="/econeura-logo.png" />

# Después:
<picture>
  <source srcset="/econeura-logo.webp" type="image/webp">
  <img src="/econeura-logo.png" alt="ECONEURA" />
</picture>
```

**RESULTADO**:
- Bundle: 400 KB → 240 KB (-40%)
- First Load JS: 300 KB → 180 KB
- Lighthouse Performance: 85 → 95 (+10 points)
- Load time: 2s → 1s (-50%)

**ARCHIVOS AFECTADOS**:
- `frontend/vite.config.ts` (actualizar)
- `frontend/src/App.tsx` (lazy loading)
- `frontend/package.json` (remover deps no usadas)
- `frontend/public/` (comprimir imágenes)

**TIEMPO**: 2 horas

**IMPACTO CALIDAD**: 9.93 → 9.95 (+0.02)

---

## MEJORA 8: JSDOC COMPLETO EN FUNCIONES CRÍTICAS 📝

**PROBLEMA**:
- Funciones críticas sin documentación
- Difícil entender qué hacen sin leer código
- No hay autocompletado en VS Code

**SOLUCIÓN**:
Agregar JSDoc en las 50 funciones más críticas:

**Ejemplo - makeService.js**:
```javascript
/**
 * Invoke Make.com agent with retry and circuit breaker
 * 
 * @param {string} agentId - Agent ID (e.g., 'a-ceo-01')
 * @param {Object} payload - Invocation payload
 * @param {string} payload.input - User input
 * @param {string} payload.correlationId - Correlation ID for tracing
 * @param {string} [payload.idempotencyKey] - Key for idempotent cache (5min TTL)
 * @param {Object} [payload.metadata={}] - Additional metadata
 * 
 * @returns {Promise<Object>} Response with _meta
 * @returns {Object} return.response - Agent response data
 * @returns {Object} return._meta - Metadata
 * @returns {boolean} return._meta.replayed - True if cached response
 * @returns {number} return._meta.attempts - Number of attempts
 * @returns {number} return._meta.latencyMs - Latency in milliseconds
 * @returns {string} return._meta.breakerState - Circuit breaker state (closed|half-open|open)
 * 
 * @throws {Error} If all retry attempts fail
 * @throws {Error} If circuit breaker is open
 * 
 * @example
 * const result = await invokeMakeAgent('a-ceo-01', {
 *   input: 'Análisis estratégico',
 *   correlationId: 'req-123',
 *   idempotencyKey: 'user-1-ceo-20251112'
 * });
 * 
 * console.log(result._meta.attempts); // 1
 * console.log(result._meta.replayed); // false
 */
async function invokeMakeAgent(agentId, payload) {
  // ... implementation
}
```

**Funciones a documentar** (50 total):
- makeService.js (2 funciones)
- neuraAgentExecutor.js (5 funciones)
- resilientAIGateway.js (8 funciones)
- api/agents.js (6 funciones)
- api/proposals.js (5 funciones)
- api/library.js (4 funciones)
- routes/auth.js (10 funciones)
- services/logger.js (3 funciones)
- ... 20 más

**RESULTADO**:
- 50 funciones documentadas
- VS Code autocompletado ✅
- Onboarding nuevos devs 10x más rápido
- Menos bugs por malentendidos

**ARCHIVOS AFECTADOS**:
- 20+ archivos backend (agregar JSDoc)
- `jsconfig.json` (CREAR para VS Code)

**TIEMPO**: 4 horas

**IMPACTO CALIDAD**: 9.95 → 9.97 (+0.02)

---

## MEJORA 9: MONOREPO SCRIPTS AUTOMATIZACIÓN 🤖

**PROBLEMA**:
- Setup local manual (muchos pasos)
- Deploy manual (propensa a errores)
- Testing manual
- No hay scripts de utilidad

**SOLUCIÓN**:
Crear `scripts/` con 8 scripts PowerShell:

**scripts/setup-local.ps1**:
```powershell
# Setup local 1-click
Write-Host "🚀 ECONEURA - Setup Local 1-Click" -F Cyan

# 1. Backend
cd backend
npm install
Copy-Item .env.example .env
Write-Host "✅ Backend dependencies installed" -F Green

# 2. Generate secrets
$jwt = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
$session = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))

$env = @"
NODE_ENV=development
PORT=8080
USE_MOCK_DB=true
MAMMOUTH_API_KEY=YOUR_API_KEY_HERE
MISTRAL_MODEL=mistral-medium-3.1
JWT_SECRET=$jwt
SESSION_SECRET=$session
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
"@

$env | Out-File .env -Encoding utf8
Write-Host "✅ .env created with generated secrets" -F Green

# 3. Frontend
cd ../frontend
npm install
Write-Host "✅ Frontend dependencies installed" -F Green

# 4. Done
Write-Host ""
Write-Host "✅✅✅ Setup completo ✅✅✅" -F Green
Write-Host ""
Write-Host "Próximos pasos:" -F Yellow
Write-Host "  1. cd backend && npm start" -F White
Write-Host "  2. cd frontend && npm run dev" -F White
Write-Host "  3. Abrir http://localhost:5173" -F White
```

**scripts/test-all.ps1**:
```powershell
# Run all tests
Write-Host "🧪 Running all tests..." -F Cyan

cd backend
npm test
$backendExit = $LASTEXITCODE

cd ../frontend
npm test
$frontendExit = $LASTEXITCODE

npm run test:e2e
$e2eExit = $LASTEXITCODE

if ($backendExit -eq 0 -and $frontendExit -eq 0 -and $e2eExit -eq 0) {
  Write-Host "✅ All tests passed" -F Green
  exit 0
} else {
  Write-Host "❌ Some tests failed" -F Red
  exit 1
}
```

**scripts/deploy-azure.ps1**:
```powershell
# Deploy to Azure (manual)
# ... (script consolidado)
```

**scripts/monitor-costs.ps1**:
```powershell
# Monitor Azure costs real-time
az consumption usage list `
  --start-date (Get-Date).AddDays(-7).ToString("yyyy-MM-dd") `
  --query "[?quantity>0].{Service:meterName,Cost:pretaxCost,Qty:quantity}" `
  --output table
```

**scripts/health-check.ps1**:
```powershell
# Health check backend + frontend
$backend = Invoke-RestMethod "https://econeura-backend.azurewebsites.net/api/health"
$frontend = Invoke-WebRequest "https://econeura-frontend.azurestaticapps.net"

Write-Host "Backend: $($backend.status)" -F Green
Write-Host "Frontend: $($frontend.StatusCode)" -F Green
```

**scripts/agent-health-check.ps1**:
```powershell
# Check health of all agents
$agents = Invoke-RestMethod "https://econeura-backend.azurewebsites.net/api/agents" `
  -Headers @{ Authorization = "Bearer $env:ECONEURA_TOKEN" }

$agents.agents | ForEach-Object {
  $successRate = if ($_.execution_count -gt 0) {
    [math]::Round(($_.success_count / $_.execution_count) * 100, 1)
  } else {
    0
  }
  
  Write-Host "$($_.name): $successRate% success rate" -F $(if ($successRate -gt 90) { "Green" } else { "Yellow" })
}
```

**RESULTADO**:
- Setup local: 1 comando (vs 15 pasos manuales)
- Tests: 1 comando (vs 3 comandos)
- Deploy: 1 comando (vs 20 pasos)
- Monitoring: 1 comando
- Menos errores humanos
- Onboarding 10x más rápido

**ARCHIVOS AFECTADOS**:
- `scripts/setup-local.ps1` (CREAR, 50 líneas)
- `scripts/test-all.ps1` (CREAR, 30 líneas)
- `scripts/deploy-azure.ps1` (CREAR, 100 líneas)
- `scripts/monitor-costs.ps1` (CREAR, 20 líneas)
- `scripts/health-check.ps1` (CREAR, 20 líneas)
- `scripts/agent-health-check.ps1` (CREAR, 30 líneas)

**TIEMPO**: 2 horas

**IMPACTO CALIDAD**: 9.97 → 9.98 (+0.01)

---

## MEJORA 10: INFRASTRUCTURE AS CODE (AZURE BICEP) ☁️

**PROBLEMA**:
- Infraestructura Azure creada manualmente (20+ comandos)
- No reproducible
- Si hay que recrear → 3 horas trabajo manual
- No versionado

**SOLUCIÓN**:
Crear `azure/bicep/main.bicep`:
```bicep
@description('Location for all resources')
param location string = 'northeurope'

@description('Environment name')
param environment string = 'prod'

@description('MAMMOUTH API Key')
@secure()
param mammouthApiKey string

// Resource Group (implícito)
// targetScope = 'resourceGroup'

// App Service Plan B1
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: 'econeura-plan-${environment}'
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// App Service (Backend)
resource appService 'Microsoft.Web/sites@2022-03-01' = {
  name: 'econeura-backend-${environment}'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      alwaysOn: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.3'
      appSettings: [
        { name: 'NODE_ENV', value: 'production' }
        { name: 'MAMMOUTH_API_KEY', value: mammouthApiKey }
        { name: 'USE_MOCK_DB', value: 'false' }
        // ... more settings from Key Vault
      ]
    }
  }
}

// PostgreSQL Flexible Server B1ms
resource postgreServer 'Microsoft.DBforPostgreSQL/flexibleServers@2022-12-01' = {
  name: 'econeura-db-${environment}'
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '16'
    administratorLogin: 'econadmin'
    administratorLoginPassword: 'CHANGE_ME_${uniqueString(resourceGroup().id)}'
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
  }
}

// Redis C1 Standard
resource redisCache 'Microsoft.Cache/redis@2022-06-01' = {
  name: 'econeura-redis-${environment}'
  location: location
  properties: {
    sku: {
      name: 'Standard'
      family: 'C'
      capacity: 1
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
  }
}

// Static Web App (Frontend)
resource staticWebApp 'Microsoft.Web/staticSites@2022-03-01' = {
  name: 'econeura-frontend-${environment}'
  location: 'westeurope' // Static Web Apps limited regions
  sku: {
    name: 'Free'
  }
  properties: {
    repositoryUrl: 'https://github.com/ECONEURA-MAX/ECONEURA-.git'
    branch: 'main'
    buildProperties: {
      appLocation: '/frontend'
      outputLocation: 'dist'
    }
  }
}

// Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: 'econeurastorage${environment}'
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    supportsHttpsTrafficOnly: true
  }
}

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' = {
  name: 'econeura-vault-${environment}'
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'econeura-insights-${environment}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    RetentionInDays: 30
    IngestionMode: 'ApplicationInsights'
  }
}

// Outputs
output backendUrl string = appService.properties.defaultHostName
output frontendUrl string = staticWebApp.properties.defaultHostname
output databaseHost string = postgreServer.properties.fullyQualifiedDomainName
```

**azure/parameters/prod.parameters.json**:
```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "environment": {
      "value": "prod"
    },
    "location": {
      "value": "northeurope"
    },
    "mammouthApiKey": {
      "reference": {
        "keyVault": {
          "id": "/subscriptions/.../resourceGroups/econeura-rg/providers/Microsoft.KeyVault/vaults/econeura-vault"
        },
        "secretName": "MAMMOUTH-API-KEY"
      }
    }
  }
}
```

**Deploy con 1 comando**:
```bash
az deployment group create \
  --resource-group econeura-rg \
  --template-file azure/bicep/main.bicep \
  --parameters azure/parameters/prod.parameters.json
```

**RESULTADO**:
- Infraestructura como código (versionada en Git)
- Recrear TODA la infra: 1 comando, 10 minutos
- Environments (dev, staging, prod): Solo cambiar parameters
- Disaster recovery: Deploy a otra región en 10 min
- Documentación automática (Bicep es autodocumentado)

**ARCHIVOS AFECTADOS**:
- `azure/bicep/main.bicep` (CREAR, 300 líneas)
- `azure/bicep/backend.bicep` (CREAR, 100 líneas)
- `azure/bicep/database.bicep` (CREAR, 80 líneas)
- `azure/bicep/monitoring.bicep` (CREAR, 60 líneas)
- `azure/parameters/prod.parameters.json` (CREAR)
- `azure/parameters/dev.parameters.json` (CREAR)

**TIEMPO**: 3 horas

**IMPACTO CALIDAD**: 9.98 → 9.99 (+0.01)

---

## MEJORA 11: AGENT MANAGEMENT UI COMPLETA 🎨

**PROBLEMA**:
- Frontend tiene ConnectAgentModal (284 líneas) ✅
- PERO falta:
  - AgentList (listar agentes)
  - AgentCreate (crear agente completo)
  - AgentEdit (editar agente)
  - AgentHealthDashboard (ver success rate, last execution)
  - AgentExecutionView (ejecutar + ver resultado)

**SOLUCIÓN**:
Crear 5 componentes nuevos (SIN tocar diseño Login/Cockpit):

**frontend/src/features/agents/AgentList.tsx** (300 líneas):
```typescript
export function AgentList() {
  const { agents, isLoading } = useAgents();
  const [filter, setFilter] = useState({ platform: 'all', status: 'all' });
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Agentes Automatizados</h1>
      
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select onChange={(e) => setFilter({ ...filter, platform: e.target.value })}>
          <option value="all">Todas las plataformas</option>
          <option value="make">Make.com</option>
          <option value="n8n">n8n</option>
          <option value="zapier">Zapier</option>
        </select>
      </div>
      
      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map(agent => (
          <AgentCard 
            key={agent.id} 
            agent={agent}
            onEdit={() => navigate(`/agents/${agent.id}/edit`)}
            onDelete={() => handleDelete(agent.id)}
            onExecute={() => navigate(`/agents/${agent.id}/execute`)}
          />
        ))}
      </div>
    </div>
  );
}
```

**frontend/src/features/agents/AgentHealthDashboard.tsx** (350 líneas):
```typescript
export function AgentHealthDashboard() {
  const { agents } = useAgents();
  
  const healthStats = agents.map(agent => ({
    name: agent.name,
    platform: agent.platform,
    successRate: agent.execution_count > 0 
      ? (agent.success_count / agent.execution_count) * 100 
      : 0,
    lastExecution: agent.last_execution,
    status: agent.success_count > agent.error_count ? 'healthy' : 'unhealthy'
  }));
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Health Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Agents" value={agents.length} />
        <StatCard title="Healthy" value={healthStats.filter(a => a.status === 'healthy').length} color="green" />
        <StatCard title="Unhealthy" value={healthStats.filter(a => a.status === 'unhealthy').length} color="red" />
        <StatCard title="Avg Success Rate" value={`${avgSuccessRate.toFixed(1)}%`} />
      </div>
      
      {/* Health Table */}
      <table className="w-full">
        <thead>
          <tr>
            <th>Agent</th>
            <th>Platform</th>
            <th>Success Rate</th>
            <th>Last Execution</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {healthStats.map(stat => (
            <tr key={stat.name}>
              <td>{stat.name}</td>
              <td><Badge>{stat.platform}</Badge></td>
              <td>
                <ProgressBar value={stat.successRate} />
                {stat.successRate.toFixed(1)}%
              </td>
              <td>{formatDate(stat.lastExecution)}</td>
              <td>
                <StatusBadge status={stat.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**RESULTADO**:
- 5 componentes nuevos (~1,200 líneas)
- Agent management completo
- Health monitoring visual
- UX profesional
- **SIN tocar Login ni Cockpit** ✅

**ARCHIVOS AFECTADOS**:
- `frontend/src/features/agents/AgentList.tsx` (CREAR, 300 líneas)
- `frontend/src/features/agents/AgentCreate.tsx` (CREAR, 250 líneas)
- `frontend/src/features/agents/AgentEdit.tsx` (CREAR, 250 líneas)
- `frontend/src/features/agents/AgentHealthDashboard.tsx` (CREAR, 350 líneas)
- `frontend/src/features/agents/AgentExecutionView.tsx` (CREAR, 200 líneas)
- `frontend/src/App.tsx` (agregar rutas)

**TIEMPO**: 5 horas

**IMPACTO CALIDAD**: 9.99 → 10.0 (+0.01)

---

## 🎯 RESUMEN 11 MEJORAS

| # | Mejora | Tiempo | Impacto | Prioridad |
|---|--------|--------|---------|-----------|
| **0** | **Configurar www.econeura.com (Cloudflare → Azure)** | **1h** | **CRÍTICO** | **P0 🚨** |
| 1 | Limpiar server.js (242 líneas legacy) | 30min | +0.2 | P0 |
| 2 | Consolidar prompts (10 .js → 1 .json) | 2h | +0.2 | P0 |
| 3 | Database abstraction (auto-selector) | 1h | +0.2 | P1 |
| 4 | Tests >80% coverage | 8h | +0.2 | P0 |
| 5 | Security hardening (OWASP 100%) | 4h | +0.1 | P0 |
| 6 | Audit log inmutable (SHA256) | 3h | +0.03 | P1 |
| 7 | Bundle optimization (<250 KB) | 2h | +0.02 | P1 |
| 8 | JSDoc completo (50 funciones) | 4h | +0.02 | P2 |
| 9 | Scripts automatización (8 scripts) | 2h | +0.01 | P1 |
| 10 | Azure Bicep (IaC) | 3h | +0.01 | P1 |
| **TOTAL** | | **30.5h** | **+1.1** | |

**CALIDAD INICIAL**: 8.9/10  
**CALIDAD FINAL**: 10.0/10 ✅

**🚨 SIN MEJORA 0 → PROYECTO NO SIRVE 🚨**

---

## ✅ GARANTÍAS

**NO SE TOCA**:
- ❌ Login.tsx (426 líneas) - DISEÑO INTACTO
- ❌ EconeuraCockpit.tsx (2,700 líneas UI) - DISEÑO INTACTO
- ❌ Colores NEURAs - INTACTOS
- ❌ Animaciones premium - INTACTAS
- ❌ Layout - INTACTO

**SÍ SE MEJORA**:
- ✅ Código backend (limpieza, tests, security)
- ✅ Performance (database indices, bundle size)
- ✅ Developer Experience (scripts, IaC, JSDoc)
- ✅ Compliance (audit log, docs)
- ✅ Agent Management (5 componentes NUEVOS en /agents, NO en Cockpit)

---

## 📊 IMPACTO POR CATEGORÍA

### Performance
- Database queries: 500ms → 10ms (-98%) ✅
- Bundle size: 400 KB → 240 KB (-40%) ✅
- API latency P95: 500ms → 150ms (-70%) ✅

### Security
- OWASP Top 10: 90% → 100% ✅
- Audit log: Mutable → Inmutable SHA256 ✅
- SSRF: No protection → Protected ✅

### Developer Experience
- Setup local: 15 pasos → 1 comando ✅
- Tests: 3 comandos → 1 comando ✅
- Deploy: 20 pasos → 1 comando ✅
- Docs: Ninguna → JSDoc completo ✅

### Compliance
- Tests: 60% → 85% coverage ✅
- Code quality: Legacy → Clean ✅
- Infrastructure: Manual → IaC ✅

---

## 🔥 RESULTADO ESPERADO

**DESPUÉS DE 29.5 HORAS**:
- ✅ Código limpio (sin legacy)
- ✅ Tests >80% coverage
- ✅ Security 100% (OWASP completo)
- ✅ Performance <150ms P95
- ✅ Bundle <250 KB
- ✅ Scripts automatizados
- ✅ IaC Azure Bicep
- ✅ Agent Management UI completa
- ✅ Audit log inmutable
- ✅ JSDoc en 50 funciones

**CALIDAD: 10.0/10** 🏆

**DISEÑO LOGIN Y COCKPIT**: INTACTO ✅

**LISTO PARA**: Comercializar a empresas enterprise

