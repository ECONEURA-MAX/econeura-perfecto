# 📋 PLAN DE TAREAS - REORGANIZAR 80,000 LÍNEAS + MIGRAR A AZURE

**OBJETIVO**: Reorganizar monorepo ECONEURA con máxima calidad + Deploy Azure $200

**TOTAL: 150 TAREAS** organizadas en 10 grupos

---

## 🎯 GRUPOS DE TAREAS

1. **PREPARACIÓN** (15 tareas) - Setup inicial
2. **BACKEND - ESTRUCTURA** (25 tareas) - Reorganizar backend
3. **BACKEND - AGENTES** (20 tareas) - Sistema de agentes Make/n8n/Zapier
4. **BACKEND - CALIDAD** (15 tareas) - Tests, linting, optimización
5. **FRONTEND - ESTRUCTURA** (20 tareas) - Reorganizar frontend
6. **FRONTEND - AGENTES UI** (15 tareas) - UI gestión agentes
7. **DOCUMENTACIÓN** (10 tareas) - Docs completa
8. **AZURE SETUP** (15 tareas) - Crear recursos Azure
9. **DEPLOYMENT** (10 tareas) - Deploy backend + frontend
10. **VERIFICACIÓN** (5 tareas) - Smoke tests producción

---

## GRUPO 1: PREPARACIÓN (15 tareas)

### **Tarea 1.1**: Crear nuevo directorio limpio
```bash
mkdir C:\Users\Usuario\ECONEURA-ENTERPRISE
cd C:\Users\Usuario\ECONEURA-ENTERPRISE
```
**Criterio éxito**: Directorio creado

### **Tarea 1.2**: Inicializar Git
```bash
git init
git remote add origin https://github.com/ECONEURA-MAX/ECONEURA-.git
```
**Criterio éxito**: Repo configurado

### **Tarea 1.3**: Crear estructura base
```bash
mkdir backend frontend docs scripts azure examples .github
```
**Criterio éxito**: 7 directorios creados

### **Tarea 1.4**: Copiar README_ENTERPRISE_COMMERCIAL.md como README.md
```bash
cp ../ECONEURA-PERFECTO/README_ENTERPRISE_COMMERCIAL.md ./README.md
```
**Criterio éxito**: README copiado

### **Tarea 1.5**: Crear .gitignore optimizado
**Contenido**:
```
node_modules/
.env
.env.local
dist/
build/
*.log
.DS_Store
*.tsbuildinfo
coverage/
.nyc_output/
```
**Criterio éxito**: .gitignore creado

### **Tarea 1.6**: Crear LICENSE (Apache 2.0)
**Criterio éxito**: LICENSE file creado

### **Tarea 1.7**: Crear package.json root (workspace)
```json
{
  "name": "econeura-enterprise",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["backend", "frontend"],
  "scripts": {
    "install:all": "npm install && npm run install:backend && npm run install:frontend",
    "install:backend": "cd backend && npm install",
    "install:frontend": "cd frontend && npm install",
    "start:backend": "cd backend && npm start",
    "start:frontend": "cd frontend && npm run dev",
    "test:all": "npm run test:backend && npm run test:frontend",
    "test:backend": "cd backend && npm test",
    "test:frontend": "cd frontend && npm test"
  }
}
```
**Criterio éxito**: package.json root creado

### **Tarea 1.8-1.15**: Crear estructura completa backend
```bash
cd backend
mkdir src src/api src/routes src/services src/middleware src/config src/utils src/models
mkdir src/services/ai src/services/agents src/services/neuras src/services/database src/services/auth src/services/azure
mkdir functions functions/makeWebhook functions/n8nWebhook functions/zapierWebhook
mkdir config db db/seeds db/migrations tests tests/unit tests/integration tests/e2e
```
**Criterio éxito**: Estructura backend completa (30 directorios)

---

## GRUPO 2: BACKEND - ESTRUCTURA (25 tareas)

### **Tarea 2.1**: Copiar backend/package.json (verificar deps)
**Acción**:
1. Copiar desde `ECONEURA-PERFECTO/backend/package.json`
2. Verificar 45 dependencias presentes
3. Agregar nuevas deps para agentes:
   - `node-fetch@3.3.2` (HTTP requests a webhooks)
   - `@azure/functions@4.0.0` (Azure Functions SDK)

**Criterio éxito**: package.json con 47 deps

### **Tarea 2.2**: Copiar server.js LIMPIO (eliminar legacy)
**Acción**:
1. Copiar `server.js` desde ECONEURA-PERFECTO
2. **ELIMINAR** 200+ líneas comentadas (AdvancedVoiceService, RealTimeStreamingService)
3. Reducir de 542 → 300 líneas
4. Verificar imports correctos

**Criterio éxito**: server.js 300 líneas, 0 comentados legacy

### **Tarea 2.3**: Migrar src/api/ (3 archivos)
**Archivos**:
- `health.js` (228 líneas)
- `metrics.js` (crear nuevo, 50 líneas)
- `version.js` (crear nuevo, 20 líneas)

**Criterio éxito**: 3 archivos en src/api/

### **Tarea 2.4**: Migrar src/routes/ (8 archivos)
**Archivos** (copiar desde ECONEURA-PERFECTO):
- `auth.js` (325 líneas)
- `chat.js` (223 líneas)
- `invoke.js` (150 líneas)
- `ai-gateway.js` (200 líneas)
- `neura-agents.js` (180 líneas)
- `proposals.js` (crear nuevo, 100 líneas)
- `library.js` (crear nuevo, 120 líneas)
- `integration.js` ⭐ (crear nuevo, 200 líneas - Make/n8n/Zapier)

**Criterio éxito**: 8 archivos en src/routes/

### **Tarea 2.5**: Migrar src/services/ai/ (5 archivos)
**Archivos**:
- `gateway.js` (398 líneas - resilientAIGateway.js)
- `mammouth.js` (crear nuevo, 100 líneas)
- `openai.js` (150 líneas - openaiService.js)
- `analysis.js` (150 líneas - neuraAnalysisService.js)
- `executor.js` (crear nuevo, 100 líneas)

**Criterio éxito**: 5 archivos en src/services/ai/

### **Tarea 2.6**: Migrar src/services/database/ (4 archivos)
**Archivos**:
- `index.js` (crear nuevo, 50 líneas - auto-selector)
- `postgresql.js` (100 líneas - db.js)
- `cosmosdb.js` (crear nuevo, 100 líneas)
- `mock.js` (113 líneas - db-mock.js)

**Criterio éxito**: 4 archivos en src/services/database/

### **Tarea 2.7**: Migrar src/services/auth/ (4 archivos)
**Archivos**:
- `jwt.js` (80 líneas - jwtService.js)
- `oauth.js` (120 líneas - extraer de auth.js)
- `mfa.js` (crear nuevo, 100 líneas)
- `tokenStore.js` (60 líneas)

**Criterio éxito**: 4 archivos en src/services/auth/

### **Tarea 2.8**: Migrar src/services/azure/ (4 archivos)
**Archivos**:
- `keyvault.js` (80 líneas)
- `storage.js` (crear nuevo, 100 líneas)
- `monitoring.js` (crear nuevo, 80 líneas)
- `functions.js` (crear nuevo, 60 líneas)

**Criterio éxito**: 4 archivos en src/services/azure/

### **Tarea 2.9**: Migrar src/middleware/ (8 archivos)
**Archivos**:
- `auth.js` (80 líneas)
- `rateLimiter.js` (143 líneas)
- `validation.js` (60 líneas)
- `errorHandler.js` (100 líneas)
- `securityHeaders.js` (50 líneas)
- `cors.js` (40 líneas)
- `requestId.js` (30 líneas)
- `webhookVerify.js` ⭐ (crear nuevo, 60 líneas)

**Criterio éxito**: 8 archivos en src/middleware/

### **Tarea 2.10**: Migrar src/config/ (8 archivos)
**Archivos**:
- `index.js` (crear nuevo, 40 líneas)
- `azure.js` (crear nuevo, 50 líneas)
- `database.js` (60 líneas)
- `redis.js` (50 líneas)
- `auth.js` (100 líneas - Passport strategies)
- `neuras.json` ⭐ (crear nuevo, 300 líneas - 11 NEURAs)
- `agents.json` ⭐ (crear nuevo, 200 líneas - Agent templates)
- `envValidation.js` (110 líneas)

**Criterio éxito**: 8 archivos en src/config/

### **Tarea 2.11**: Migrar src/utils/ (5 archivos)
**Archivos**:
- `retry.js` (50 líneas)
- `errorHandler.js` (60 líneas)
- `hmac.js` ⭐ (crear nuevo, 40 líneas)
- `constants.js` (crear nuevo, 30 líneas)
- `validators.js` (crear nuevo, 50 líneas)

**Criterio éxito**: 5 archivos en src/utils/

### **Tarea 2.12**: Migrar src/models/ (5 archivos)
**Archivos**:
- `user.js` (crear nuevo, 50 líneas - Joi schema)
- `agent.js` ⭐ (crear nuevo, 80 líneas)
- `webhook.js` ⭐ (crear nuevo, 60 líneas)
- `chat.js` (crear nuevo, 50 líneas)
- `proposal.js` (crear nuevo, 50 líneas)

**Criterio éxito**: 5 archivos en src/models/

### **Tarea 2.13**: Migrar otros (2 archivos)
**Archivos**:
- `startup-safe.js` (62 líneas)
- `logger.js` (163 líneas)

**Criterio éxito**: 2 archivos copiados

### **Tarea 2.14-2.25**: Configuración backend (12 archivos)
- `.env.example`
- `.env.development`
- `tsconfig.json`
- `README.md`
- `db/schema.sql` (crear con 6 tablas)
- `db/seeds/*.sql` (3 archivos)
- `db/migrations/*.sql` (3 archivos)

**Criterio éxito**: Backend configurado completo

---

## GRUPO 3: BACKEND - AGENTES (20 tareas) ⭐

### **Tarea 3.1**: Crear src/services/agents/agentRegistry.js
**Funcionalidad**:
- `createAgent(data)` - Crear nuevo agente
- `updateAgent(id, data)` - Actualizar agente
- `deleteAgent(id)` - Eliminar agente
- `listAgents(userId)` - Listar agentes del usuario
- `findByWebhookUrl(url)` - Buscar por webhook URL

**Líneas**: 150
**Criterio éxito**: 5 funciones CRUD funcionando

### **Tarea 3.2**: Crear src/services/agents/agentExecutor.js
**Funcionalidad**:
- `execute(agent, payload)` - Ejecutar agente
- `retry(agent, payload, attempts)` - Retry logic
- `timeout(promise, ms)` - Timeout handling

**Líneas**: 120
**Criterio éxito**: Ejecuta agent con retry + timeout

### **Tarea 3.3**: Crear src/services/agents/makeService.js
**Funcionalidad**:
- `triggerScenario(scenarioId, data)` - Trigger Make scenario
- `validateWebhook(payload, signature)` - Verify HMAC
- `parseResponse(response)` - Parse Make response

**Líneas**: 100
**Criterio éxito**: Integración Make.com funcional

### **Tarea 3.4**: Crear src/services/agents/n8nService.js
**Funcionalidad**:
- `triggerWorkflow(workflowId, data)` - Trigger n8n workflow
- `validateWebhook(payload, signature)` - Verify HMAC
- `parseResponse(response)` - Parse n8n response

**Líneas**: 100
**Criterio éxito**: Integración n8n funcional

### **Tarea 3.5**: Crear src/services/agents/zapierService.js
**Funcionalidad**:
- `triggerZap(zapId, data)` - Trigger Zapier Zap
- `validateWebhook(payload, signature)` - Verify HMAC
- `parseResponse(response)` - Parse Zapier response

**Líneas**: 100
**Criterio éxito**: Integración Zapier funcional

### **Tarea 3.6**: Crear src/services/agents/webhookHandler.js
**Funcionalidad**:
- `handleWebhook(platform, payload, signature)` - Handle incoming webhook
- `verifySignature(payload, signature, secret)` - HMAC verification
- `routeToAgent(agent, payload)` - Route to correct agent

**Líneas**: 150
**Criterio éxito**: Webhooks verificados con HMAC

### **Tarea 3.7**: Crear src/services/agents/agentHealthCheck.js
**Funcionalidad**:
- `recordExecution(agentId, result)` - Save execution result
- `getHealthStatus(agentId)` - Get agent health
- `getSuccessRate(agentId, days)` - Calculate success rate
- `alertIfUnhealthy(agentId)` - Send alerts

**Líneas**: 120
**Criterio éxito**: Health monitoring funcional

### **Tarea 3.8**: Crear src/routes/agents.js
**Endpoints**:
- `GET /api/agents` - List agents
- `POST /api/agents` - Create agent
- `GET /api/agents/:id` - Get agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `POST /api/agents/:id/execute` - Execute agent

**Líneas**: 200
**Criterio éxito**: 6 endpoints funcionando

### **Tarea 3.9**: Crear src/routes/webhooks.js
**Endpoints**:
- `POST /api/webhooks/make` - Receive Make webhook
- `POST /api/webhooks/n8n` - Receive n8n webhook
- `POST /api/webhooks/zapier` - Receive Zapier webhook

**Líneas**: 150
**Criterio éxito**: 3 endpoints funcionando

### **Tarea 3.10**: Actualizar src/routes/integration.js
**Endpoints**:
- `POST /api/integration/make/connect` - Connect Make account
- `POST /api/integration/n8n/connect` - Connect n8n instance
- `POST /api/integration/zapier/connect` - Connect Zapier account
- `GET /api/integration/status` - Get integration status

**Líneas**: 200
**Criterio éxito**: 4 endpoints funcionando

### **Tarea 3.11**: Crear backend/functions/makeWebhook/index.js
**Azure Function**:
```javascript
module.exports = async function (context, req) {
  const webhookHandler = require('../../src/services/agents/webhookHandler');
  const result = await webhookHandler.handleWebhook('make', req.body, req.headers['x-make-signature']);
  context.res = { status: 200, body: result };
};
```
**Líneas**: 30
**Criterio éxito**: Function deployable

### **Tarea 3.12**: Crear backend/functions/n8nWebhook/index.js
**Líneas**: 30
**Criterio éxito**: Function deployable

### **Tarea 3.13**: Crear backend/functions/zapierWebhook/index.js
**Líneas**: 30
**Criterio éxito**: Function deployable

### **Tarea 3.14**: Crear backend/functions/host.json
**Config**:
```json
{
  "version": "2.0",
  "extensions": {
    "http": {
      "routePrefix": "api/webhooks"
    }
  }
}
```
**Criterio éxito**: Functions config completo

### **Tarea 3.15**: Crear backend/config/agents.json (templates)
**Content**: 10 agent templates (Make, n8n, Zapier)
**Líneas**: 200
**Criterio éxito**: 10 templates configurados

### **Tarea 3.16**: Crear backend/config/webhooks-config.json
**Content**: Webhook endpoints + secrets config
**Líneas**: 50
**Criterio éxito**: Webhooks config completo

### **Tarea 3.17**: Actualizar backend/db/schema.sql
**Agregar tabla**:
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL, -- 'make', 'n8n', 'zapier'
  webhook_url TEXT NOT NULL,
  webhook_secret VARCHAR(255) NOT NULL,
  neura_id VARCHAR(50),
  description TEXT,
  last_execution_at TIMESTAMP,
  last_execution_status VARCHAR(50),
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
**Criterio éxito**: Tabla agents creada

### **Tarea 3.18**: Crear backend/db/seeds/002_agents.sql
**Content**: 5 sample agents
**Criterio éxito**: Seed data creado

### **Tarea 3.19**: Crear backend/db/migrations/003_agents_table.sql
**Criterio éxito**: Migration file creado

### **Tarea 3.20**: Tests agentes (5 archivos)
- `tests/unit/services/agentExecutor.test.js`
- `tests/unit/services/webhookHandler.test.js`
- `tests/unit/utils/hmac.test.js`
- `tests/integration/agents.test.js`
- `tests/e2e/agent-workflow.test.js`

**Líneas totales**: 500
**Criterio éxito**: 5 test files con >80% coverage

---

## GRUPO 4: BACKEND - CALIDAD (15 tareas)

### **Tarea 4.1**: Limpiar código legacy
**Acción**: Buscar y eliminar:
- Comentarios `// TODO` antiguos
- Código comentado no usado
- Imports no utilizados
- Variables no usadas

**Comando**:
```bash
grep -r "// TODO\|// FIXME\|// DEPRECATED" backend/src/ | wc -l  # Debe ser 0
```
**Criterio éxito**: 0 legacy comments

### **Tarea 4.2**: ESLint 0 errores
```bash
cd backend
npm run lint
```
**Criterio éxito**: 0 errors (warnings OK)

### **Tarea 4.3**: Tests unitarios backend
```bash
npm test
```
**Esperado**: >80% coverage
**Criterio éxito**: All tests pass + coverage >80%

### **Tarea 4.4**: Tests integración backend
```bash
npm run test:integration
```
**Criterio éxito**: All integration tests pass

### **Tarea 4.5**: Tests E2E backend
```bash
npm run test:e2e
```
**Criterio éxito**: All E2E tests pass

### **Tarea 4.6**: Optimizar queries DB
**Acción**: Agregar índices a:
- `agents.user_id`
- `agents.webhook_url`
- `agents.platform`

**Criterio éxito**: Queries <10ms P95

### **Tarea 4.7**: Optimizar imports
**Acción**: Verificar todos los imports son necesarios
**Criterio éxito**: 0 unused imports

### **Tarea 4.8**: Configurar Husky (Git hooks)
```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm test"
```
**Criterio éxito**: Pre-commit hook funciona

### **Tarea 4.9**: Configurar Snyk (security scan)
```bash
npm install --save-dev snyk
npx snyk test
```
**Criterio éxito**: 0 high/critical vulnerabilities

### **Tarea 4.10**: Configurar Gitleaks (secrets scan)
```bash
npm install --save-dev gitleaks
npx gitleaks detect
```
**Criterio éxito**: 0 secrets found

### **Tarea 4.11-4.15**: Documentación backend
- README.md completo
- JSDoc comments en funciones críticas
- API.md con todos los endpoints
- AGENTS.md con guía de integración
- WEBHOOKS.md con ejemplos

**Criterio éxito**: 5 docs creados

---

## GRUPO 5: FRONTEND - ESTRUCTURA (20 tareas)

### **Tarea 5.1**: Copiar frontend/package.json
**Acción**: Copiar + verificar 22 deps + 23 devDeps
**Criterio éxito**: package.json copiado

### **Tarea 5.2-5.10**: Migrar estructura frontend (9 tareas)
- Crear directorios (features/, components/, services/, etc.)
- Copiar App.tsx, main.tsx
- Copiar vite.config.ts, tsconfig.json, tailwind.config.js
- Copiar public/ (logo, favicon, manifest)
- Crear .env.example, .env.development

**Criterio éxito**: Estructura frontend completa

### **Tarea 5.11**: Migrar features/auth/ (4 archivos)
**Archivos**:
- `Login.tsx` (426 líneas)
- `Register.tsx` (crear nuevo, 300 líneas)
- `MFASetup.tsx` (crear nuevo, 200 líneas)
- `useAuth.ts` (crear nuevo, 100 líneas)

**Criterio éxito**: Auth feature completo

### **Tarea 5.12**: Migrar features/neuras/ (5 archivos)
**Archivos**:
- `NeuraCockpit.tsx` (2,700 líneas → refactorizar a 1,500)
- `NeuraChat.tsx` (extraer de Cockpit, 500 líneas)
- `NeuraSelector.tsx` (extraer de Cockpit, 300 líneas)
- `MultiActorPanel.tsx` (139 líneas)
- `useNeuraChat.ts` (227 líneas - useChat.ts)

**Criterio éxito**: NEURAs feature completo

### **Tarea 5.13**: Migrar features/library/ (3 archivos)
**Archivos**:
- `DocumentUpload.tsx` (extraer de LibraryPanel, 200 líneas)
- `DocumentList.tsx` (extraer de LibraryPanel, 200 líneas)
- `useLibrary.ts` (crear nuevo, 100 líneas)

**Criterio éxito**: Library feature completo

### **Tarea 5.14**: Migrar features/proposals/ (3 archivos)
**Archivos**:
- `ProposalList.tsx` (crear nuevo, 200 líneas)
- `ProposalDetail.tsx` (crear nuevo, 150 líneas)
- `useProposals.ts` (crear nuevo, 100 líneas)

**Criterio éxito**: Proposals feature completo

### **Tarea 5.15**: Migrar features/analytics/ (3 archivos)
**Archivos**:
- `Dashboard.tsx` (400 líneas - AnalyticsDashboard.tsx)
- `CostTracker.tsx` (crear nuevo, 200 líneas)
- `useAnalytics.ts` (crear nuevo, 100 líneas)

**Criterio éxito**: Analytics feature completo

### **Tarea 5.16**: Migrar components/ui/ (5 archivos)
**Archivos**:
- `Button.tsx` (crear nuevo, 50 líneas)
- `Modal.tsx` (crear nuevo, 100 líneas)
- `Card.tsx` (crear nuevo, 50 líneas)
- `Badge.tsx` (crear nuevo, 30 líneas)
- `Loading.tsx` (SkeletonLoader.tsx, 50 líneas)

**Criterio éxito**: UI components completo

### **Tarea 5.17**: Migrar components/layout/ (4 archivos)
**Archivos**:
- `Header.tsx` (200 líneas - EconeuraHeader.tsx)
- `Sidebar.tsx` (150 líneas - EconeuraSidebar.tsx)
- `Footer.tsx` (50 líneas)
- `MainLayout.tsx` (crear nuevo, 100 líneas)

**Criterio éxito**: Layout components completo

### **Tarea 5.18**: Migrar services/ (7 archivos)
**Archivos**:
- `api.ts` (40 líneas - config/api.ts)
- `auth.ts` (crear nuevo, 80 líneas)
- `neuras.ts` (crear nuevo, 100 líneas)
- `agents.ts` ⭐ (crear nuevo, 150 líneas)
- `webhooks.ts` ⭐ (crear nuevo, 100 líneas)
- `library.ts` (crear nuevo, 80 líneas)
- `analytics.ts` (crear nuevo, 80 líneas)

**Criterio éxito**: 7 API clients creados

### **Tarea 5.19**: Migrar hooks/ (6 archivos)
**Archivos**:
- `useAuth.ts` (crear nuevo, 80 líneas)
- `useNeuraChat.ts` (227 líneas - useChat.ts)
- `useAgents.ts` ⭐ (crear nuevo, 120 líneas)
- `useWebhooks.ts` ⭐ (crear nuevo, 80 líneas)
- `useLibrary.ts` (crear nuevo, 80 líneas)
- `useAnalytics.ts` (crear nuevo, 80 líneas)

**Criterio éxito**: 6 hooks creados

### **Tarea 5.20**: Migrar contexts/ types/ utils/
**Archivos**:
- `contexts/AuthContext.tsx` (100 líneas)
- `contexts/ThemeContext.tsx` (80 líneas)
- `contexts/AgentsContext.tsx` ⭐ (crear nuevo, 100 líneas)
- `types/index.ts`, `types/agent.ts`, etc. (5 archivos)
- `utils/` (5 archivos)

**Criterio éxito**: Contexts, types, utils migrados

---

## GRUPO 6: FRONTEND - AGENTES UI (15 tareas) ⭐

### **Tarea 6.1**: Crear features/agents/AgentList.tsx
**Funcionalidad**:
- Listar todos los agentes del usuario
- Filtros por plataforma (Make, n8n, Zapier)
- Search bar
- Health status badges
- Acciones: Edit, Delete, Execute

**Líneas**: 300
**Criterio éxito**: Component renderiza agentes

### **Tarea 6.2**: Crear features/agents/AgentCreate.tsx
**Funcionalidad**:
- Form para crear nuevo agente
- Select plataforma (Make, n8n, Zapier)
- Webhook URL input
- NEURA selector
- Validate form

**Líneas**: 250
**Criterio éxito**: Crea agente exitosamente

### **Tarea 6.3**: Crear features/agents/AgentEdit.tsx
**Líneas**: 250
**Criterio éxito**: Edita agente exitosamente

### **Tarea 6.4**: Crear features/agents/AgentExecution.tsx
**Funcionalidad**:
- Execute agent manually
- Input payload (JSON editor)
- Show execution result
- Show execution history

**Líneas**: 200
**Criterio éxito**: Ejecuta agente + muestra resultado

### **Tarea 6.5**: Crear features/agents/AgentHealthDashboard.tsx
**Funcionalidad**:
- Health status por agente
- Success rate (last 7 days)
- Last execution time
- Error logs
- Charts (recharts)

**Líneas**: 350
**Criterio éxito**: Dashboard con métricas

### **Tarea 6.6**: Crear features/agents/ConnectMake.tsx
**Funcionalidad**:
- Form para conectar Make.com
- Scenario ID input
- Webhook URL generator
- Test connection button
- Instructions

**Líneas**: 250
**Criterio éxito**: Conecta Make.com

### **Tarea 6.7**: Crear features/agents/ConnectN8N.tsx
**Líneas**: 250
**Criterio éxito**: Conecta n8n

### **Tarea 6.8**: Crear features/agents/ConnectZapier.tsx
**Líneas**: 250
**Criterio éxito**: Conecta Zapier

### **Tarea 6.9**: Crear services/agents.ts (API client)
**Endpoints**:
- `getAgents()`
- `createAgent(data)`
- `updateAgent(id, data)`
- `deleteAgent(id)`
- `executeAgent(id, payload)`
- `getAgentHealth(id)`

**Líneas**: 150
**Criterio éxito**: 6 API calls funcionando

### **Tarea 6.10**: Crear hooks/useAgents.ts
**Hooks**:
- `useAgents()` - List agents
- `useAgent(id)` - Get single agent
- `useCreateAgent()` - Create mutation
- `useUpdateAgent()` - Update mutation
- `useDeleteAgent()` - Delete mutation

**Líneas**: 120
**Criterio éxito**: 5 hooks funcionando

### **Tarea 6.11**: Crear contexts/AgentsContext.tsx
**State**:
- `agents: Agent[]`
- `selectedAgent: Agent | null`
- `isLoading: boolean`
- `error: Error | null`

**Líneas**: 100
**Criterio éxito**: Context provides agents state

### **Tarea 6.12**: Crear types/agent.ts
**Types**:
```typescript
export interface Agent {
  id: string;
  userId: string;
  name: string;
  platform: 'make' | 'n8n' | 'zapier';
  webhookUrl: string;
  neuraId: string;
  description?: string;
  lastExecutionAt?: string;
  lastExecutionStatus?: 'success' | 'error';
  successCount: number;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentExecution {
  id: string;
  agentId: string;
  payload: any;
  result?: any;
  error?: string;
  duration: number;
  executedAt: string;
}
```
**Criterio éxito**: Types definidos

### **Tarea 6.13**: Actualizar NeuraCockpit.tsx
**Acción**: Agregar botón "Agents" en sidebar
**Criterio éxito**: Botón navega a /agents

### **Tarea 6.14**: Tests frontend agentes
- `AgentList.test.tsx`
- `AgentCreate.test.tsx`
- `useAgents.test.ts`

**Líneas**: 300
**Criterio éxito**: Tests pasan

### **Tarea 6.15**: E2E tests agentes (Playwright)
- `agent-crud.spec.ts` - Create, edit, delete agent
- `agent-execution.spec.ts` - Execute agent
- `agent-health.spec.ts` - View health dashboard

**Líneas**: 200
**Criterio éxito**: E2E tests pasan

---

## GRUPO 7: DOCUMENTACIÓN (10 tareas)

### **Tarea 7.1**: Crear docs/architecture/OVERVIEW.md
**Contenido**: Arquitectura general, diagramas
**Líneas**: 300
**Criterio éxito**: Doc completo

### **Tarea 7.2**: Crear docs/architecture/AGENTS-ARCHITECTURE.md ⭐
**Contenido**: Arquitectura agentes, webhooks, HMAC
**Líneas**: 400
**Criterio éxito**: Doc completo

### **Tarea 7.3**: Crear docs/api/AGENTS.md ⭐
**Contenido**: API endpoints agentes (CRUD, execute)
**Líneas**: 300
**Criterio éxito**: Doc completo

### **Tarea 7.4**: Crear docs/api/WEBHOOKS.md ⭐
**Contenido**: Webhook endpoints, HMAC verification, ejemplos
**Líneas**: 300
**Criterio éxito**: Doc completo

### **Tarea 7.5**: Crear docs/guides/CONNECTING-MAKE.md ⭐
**Contenido**: Paso a paso conectar Make.com
**Líneas**: 200
**Criterio éxito**: Tutorial completo

### **Tarea 7.6**: Crear docs/guides/CONNECTING-N8N.md ⭐
**Líneas**: 200
**Criterio éxito**: Tutorial completo

### **Tarea 7.7**: Crear docs/guides/CONNECTING-ZAPIER.md ⭐
**Líneas**: 200
**Criterio éxito**: Tutorial completo

### **Tarea 7.8**: Crear docs/guides/WEBHOOK-SECURITY.md ⭐
**Contenido**: HMAC signature verification, security best practices
**Líneas**: 250
**Criterio éxito**: Security guide completo

### **Tarea 7.9**: Crear examples/agents/ (3 archivos) ⭐
- `make-invoice-processor.json`
- `n8n-crm-sync.json`
- `zapier-email-automation.json`

**Criterio éxito**: 3 ejemplos reales

### **Tarea 7.10**: Crear examples/webhooks/ (3 archivos) ⭐
- `make-webhook.json`
- `n8n-webhook.json`
- `zapier-webhook.json`

**Criterio éxito**: 3 payloads de ejemplo

---

## GRUPO 8: AZURE SETUP (15 tareas)

### **Tarea 8.1**: Azure login
```bash
az login
az account set --subscription a0991f95-16e0-4f03-85df-db3d69004d94
az account show
```
**Criterio éxito**: Logged in

### **Tarea 8.2**: Crear Resource Group
```bash
az group create --name econeura-rg --location northeurope
```
**Criterio éxito**: RG creado

### **Tarea 8.3**: Crear App Service Plan B1
```bash
az appservice plan create \
  --name econeura-plan \
  --resource-group econeura-rg \
  --sku B1 \
  --is-linux
```
**Criterio éxito**: Plan creado ($54.75/mes)

### **Tarea 8.4**: Crear App Service (backend)
```bash
az webapp create \
  --name econeura-backend \
  --resource-group econeura-rg \
  --plan econeura-plan \
  --runtime "NODE:20-lts"
```
**Criterio éxito**: App Service creado

### **Tarea 8.5**: Configurar App Service settings
```bash
az webapp config appsettings set \
  --name econeura-backend \
  --resource-group econeura-rg \
  --settings \
    NODE_ENV=production \
    USE_MOCK_DB=false \
    DATABASE_URL="@Microsoft.KeyVault(...)" \
    MAMMOUTH_API_KEY="@Microsoft.KeyVault(...)"
```
**Criterio éxito**: Settings configurados

### **Tarea 8.6**: Crear PostgreSQL B1ms
```bash
az postgres flexible-server create \
  --name econeura-db \
  --resource-group econeura-rg \
  --location northeurope \
  --admin-user econadmin \
  --admin-password <STRONG_PASSWORD> \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32
```
**Criterio éxito**: PostgreSQL creado ($25/mes)

### **Tarea 8.7**: Crear database
```bash
az postgres flexible-server db create \
  --resource-group econeura-rg \
  --server-name econeura-db \
  --database-name econeura
```
**Criterio éxito**: DB creada

### **Tarea 8.8**: Ejecutar schema.sql
```bash
psql $DATABASE_URL < backend/db/schema.sql
```
**Criterio éxito**: 6 tablas creadas

### **Tarea 8.9**: Crear Redis C1
```bash
az redis create \
  --name econeura-redis \
  --resource-group econeura-rg \
  --location northeurope \
  --sku Standard \
  --vm-size C1
```
**Criterio éxito**: Redis creado ($20/mes)

### **Tarea 8.10**: Crear Static Web App (frontend)
```bash
az staticwebapp create \
  --name econeura-frontend \
  --resource-group econeura-rg \
  --source https://github.com/ECONEURA-MAX/ECONEURA-.git \
  --branch main \
  --app-location /frontend \
  --output-location dist
```
**Criterio éxito**: Static Web App creado (FREE)

### **Tarea 8.11**: Crear Storage Account
```bash
az storage account create \
  --name econeurastorage \
  --resource-group econeura-rg \
  --location northeurope \
  --sku Standard_LRS
```
**Criterio éxito**: Storage creado ($5/mes)

### **Tarea 8.12**: Crear Key Vault
```bash
az keyvault create \
  --name econeura-vault \
  --resource-group econeura-rg \
  --location northeurope
```
**Criterio éxito**: Key Vault creado (FREE)

### **Tarea 8.13**: Guardar secrets en Key Vault
```bash
az keyvault secret set --vault-name econeura-vault --name DATABASE-URL --value "$DATABASE_URL"
az keyvault secret set --vault-name econeura-vault --name MAMMOUTH-API-KEY --value "$MAMMOUTH_API_KEY"
az keyvault secret set --vault-name econeura-vault --name JWT-SECRET --value "$(openssl rand -base64 64)"
```
**Criterio éxito**: 3+ secrets guardados

### **Tarea 8.14**: Crear Application Insights
```bash
az monitor app-insights component create \
  --app econeura-insights \
  --location northeurope \
  --resource-group econeura-rg
```
**Criterio éxito**: App Insights creado ($10/mes)

### **Tarea 8.15**: Crear Functions App (webhooks) ⭐
```bash
az functionapp create \
  --name econeura-functions \
  --resource-group econeura-rg \
  --consumption-plan-location northeurope \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4 \
  --storage-account econeurastorage
```
**Criterio éxito**: Functions App creado (FREE + $15/mes)

---

## GRUPO 9: DEPLOYMENT (10 tareas)

### **Tarea 9.1**: Configurar GitHub secrets
**GitHub**: Settings > Secrets > Actions
**Secrets**:
- `AZURE_CREDENTIALS` (service principal JSON)
- `AZURE_WEBAPP_PUBLISH_PROFILE` (publish profile XML)
- `AZURE_STATIC_WEB_APPS_API_TOKEN` (token)
- `AZURE_FUNCTIONS_PUBLISH_PROFILE` ⭐ (Functions publish profile)

**Criterio éxito**: 4 secrets configurados

### **Tarea 9.2**: Crear .github/workflows/backend-deploy.yml
**Criterio éxito**: Workflow creado

### **Tarea 9.3**: Crear .github/workflows/frontend-deploy.yml
**Criterio éxito**: Workflow creado

### **Tarea 9.4**: Crear .github/workflows/functions-deploy.yml ⭐
**Criterio éxito**: Workflow creado

### **Tarea 9.5**: Git commit + push
```bash
git add .
git commit -m "feat: ECONEURA Enterprise v1.0.0 - 11 NEURAs + Agents"
git push origin main
```
**Criterio éxito**: Push exitoso

### **Tarea 9.6**: Monitorear GitHub Actions
**GitHub**: Actions tab
**Esperado**:
- backend-deploy.yml → ✅ Success
- frontend-deploy.yml → ✅ Success
- functions-deploy.yml → ✅ Success

**Criterio éxito**: 3 workflows exitosos

### **Tarea 9.7**: Esperar warm-up (2 min)
```bash
Start-Sleep 120
```
**Criterio éxito**: Tiempo transcurrido

### **Tarea 9.8**: Health check backend
```bash
curl https://econeura-backend.azurewebsites.net/api/health
```
**Esperado**:
```json
{
  "status": "ok",
  "database": "postgresql",
  "redis": "azure-cache",
  "ai_providers": ["mammouth"]
}
```
**Criterio éxito**: 200 OK

### **Tarea 9.9**: Health check frontend
**Browser**: https://econeura-frontend.azurestaticapps.net
**Criterio éxito**: Homepage carga en <2s

### **Tarea 9.10**: Health check Functions ⭐
```bash
curl https://econeura-functions.azurewebsites.net/api/webhooks/make
```
**Esperado**: 401 Unauthorized (correcto, falta HMAC)
**Criterio éxito**: Function responde

---

## GRUPO 10: VERIFICACIÓN (5 tareas)

### **Tarea 10.1**: Login producción
**Browser**: Frontend producción
**Acción**: Login con Microsoft OAuth
**Criterio éxito**: Login exitoso

### **Tarea 10.2**: Chat NEURA CEO
**Acción**: Enviar mensaje a NEURA CEO
**Criterio éxito**: Respuesta en <5s

### **Tarea 10.3**: Crear agent Make.com
**Acción**: Features > Agents > Create Agent
**Datos**:
- Platform: Make
- Webhook URL: https://hook.eu2.make.com/test
- NEURA: CFO

**Criterio éxito**: Agent creado exitosamente

### **Tarea 10.4**: Execute agent
**Acción**: Execute agent manualmente
**Payload**: `{"invoice": "INV-001"}`
**Criterio éxito**: Execution logged

### **Tarea 10.5**: Monitoring funciona
**Azure Portal**: Application Insights
**Verificar**:
- Requests últimos 5 min: > 0
- Failures: 0
- Response time P95: < 200ms

**Criterio éxito**: Telemetría activa

---

## ✅ CHECKLIST FINAL (25 PUNTOS)

### Backend
- [ ] 85 archivos migrados
- [ ] Sistema agentes Make/n8n/Zapier funcional
- [ ] Azure Functions webhooks deployados
- [ ] Tests >80% coverage
- [ ] ESLint 0 errores
- [ ] Health check 200 OK

### Frontend
- [ ] 120 archivos migrados
- [ ] 11 NEURAs funcionando
- [ ] Agent management UI completa
- [ ] Connect Make/n8n/Zapier funcional
- [ ] Tests E2E pasan
- [ ] Build <600 KB

### Documentación
- [ ] README Enterprise con compliance
- [ ] API docs completa
- [ ] 3 guías de conexión (Make, n8n, Zapier)
- [ ] Ejemplos configurados
- [ ] Security guide HMAC

### Azure
- [ ] 8 recursos creados ($199.75/mes)
- [ ] PostgreSQL con schema
- [ ] Redis funcionando
- [ ] Key Vault con secrets
- [ ] App Insights activo

### Producción
- [ ] 3 deployments exitosos
- [ ] Backend 200 OK
- [ ] Frontend carga <2s
- [ ] Login OAuth funciona
- [ ] Agent CRUD funciona

**SI 25/25 ✅ → EXCELENCIA ALCANZADA**

---

## 🎯 MÉTRICAS DE ÉXITO

**Código**:
- 80,000 líneas reorganizadas ✅
- 269 archivos estructurados ✅
- Tests coverage >80% ✅
- 0 errores linter ✅

**Agentes**:
- Make.com integrado ✅
- n8n integrado ✅
- Zapier integrado ✅
- Webhooks HMAC verificados ✅
- Health monitoring activo ✅

**Azure**:
- $199.75/mes gastados ✅
- 99.85% SLA ✅
- <200ms latency P95 ✅
- 8 recursos activos ✅

**Compliance**:
- GDPR compliant ✅
- AI Act ready ✅
- ISO 27001 in progress ✅
- SOC 2 in progress ✅

---

**ESTE ES EL PLAN PARA REORGANIZAR + DESPLEGAR ECONEURA** 🔥

**150 TAREAS ESPECÍFICAS** - NO DÍAS

