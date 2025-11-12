# 🚀 PLAN DE ACCIÓN - LOCAL → AZURE (200 TAREAS)

**OBJETIVO**: ECONEURA 10/10 local + Deploy Azure $200 + Compliance 100%

**FILOSOFÍA**: LOCAL PRIMERO - NO commit a GitHub/Azure hasta verificar TODO

---

## 🎯 GRUPOS DE TAREAS (10 GRUPOS, 200 TAREAS TOTAL)

| Grupo | Nombre | Tareas | Tiempo | Prioridad |
|-------|--------|--------|--------|-----------|
| **G1** | Optimización Backend | 40 tareas | 12h | P0 |
| **G2** | Optimización Frontend | 35 tareas | 10h | P0 |
| **G3** | Tests Completos | 25 tareas | 8h | P0 |
| **G4** | Compliance Docs | 30 tareas | 30h | P0 |
| **G5** | Verificación Local | 20 tareas | 4h | P0 |
| **G6** | Azure Setup | 20 tareas | 3h | P1 |
| **G7** | Deployment | 15 tareas | 2h | P1 |
| **G8** | Verificación Producción | 10 tareas | 1h | P1 |
| **G9** | Monitoring Setup | 5 tareas | 1h | P2 |
| **G10** | Post-Launch | 5 tareas | 1h | P2 |

**TOTAL: 205 TAREAS, 72 HORAS** (~9 días trabajo)

---

## GRUPO 1: OPTIMIZACIÓN BACKEND (40 TAREAS, 12H)

### SUB-GRUPO 1.1: Limpiar server.js (10 tareas, 1h)

**Tarea 1.1.1**: Hacer backup de server.js
```bash
cp backend/server.js backend/server.js.backup
```
**Criterio éxito**: Backup creado

**Tarea 1.1.2**: Leer server.js completo (542 líneas)
**Criterio éxito**: Identificar líneas comentadas (200+)

**Tarea 1.1.3**: Eliminar líneas 202-209 (AdvancedVoiceService comentado)
**Criterio éxito**: Líneas eliminadas

**Tarea 1.1.4**: Eliminar líneas 220-235 (RealTimeStreamingService comentado)
**Criterio éxito**: Líneas eliminadas

**Tarea 1.1.5**: Eliminar rutas comentadas (líneas 300-320)
**Criterio éxito**: Líneas eliminadas

**Tarea 1.1.6**: Verificar imports no rotos
```bash
node --check backend/server.js
```
**Criterio éxito**: Sin errores syntax

**Tarea 1.1.7**: Verificar todas las rutas registradas
**Criterio éxito**: 12 rutas activas (auth, chat, invoke, etc.)

**Tarea 1.1.8**: ESLint backend/server.js
```bash
npx eslint backend/server.js
```
**Criterio éxito**: 0 errors

**Tarea 1.1.9**: Verificar líneas finales
```bash
wc -l backend/server.js  # Debe ser ~300
```
**Criterio éxito**: 300 líneas (vs 542 original)

**Tarea 1.1.10**: Commit local (NO push)
```bash
git add backend/server.js
git commit -m "refactor: clean server.js - remove 242 lines of legacy code"
```
**Criterio éxito**: Commit local exitoso

---

### SUB-GRUPO 1.2: Consolidar prompts (15 tareas, 2h)

**Tarea 1.2.1**: Crear backend/config/neuras.json
**Tarea 1.2.2**: Migrar neura-ceo.js → neuras.json
**Tarea 1.2.3**: Migrar neura-cfo.js → neuras.json
**Tarea 1.2.4**: Migrar neura-cto.js → neuras.json
**Tarea 1.2.5**: Migrar neura-ciso.js → neuras.json
**Tarea 1.2.6**: Migrar neura-coo.js → neuras.json
**Tarea 1.2.7**: Migrar neura-cso.js → neuras.json
**Tarea 1.2.8**: Migrar neura-chro.js → neuras.json
**Tarea 1.2.9**: Migrar neura-cdo.js → neuras.json
**Tarea 1.2.10**: Migrar neura-cmo.js → neuras.json
**Tarea 1.2.11**: Migrar neura-ia.js → neuras.json
**Tarea 1.2.12**: Migrar neura-cino.js → neuras.json

**Formato neuras.json**:
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
      "systemPrompt": "Eres CEO...",
      "tags": ["estrategia", "visión", "decisiones"],
      "costPerExecution": 0.01
    }
    // ... 10 more
  ]
}
```

**Tarea 1.2.13**: Actualizar código para leer neuras.json
**Tarea 1.2.14**: Eliminar prompts/*.js (10 archivos)
**Tarea 1.2.15**: Commit local
```bash
git add backend/config/neuras.json backend/prompts/
git commit -m "refactor: consolidate 11 NEURA prompts into single JSON file"
```

**Resultado**: 11 archivos → 1 JSON (-1,000 líneas código, +300 líneas JSON)

---

### SUB-GRUPO 1.3: Optimizar Database (5 tareas, 1h)

**Tarea 1.3.1**: Crear backend/src/services/database/index.js (auto-selector)
**Contenido**:
```javascript
// Auto-select database based on env vars
const env = process.env;

if (env.USE_COSMOS_DB === 'true') {
  module.exports = require('./cosmosdb');
} else if (env.USE_MOCK_DB === 'true') {
  module.exports = require('./mock');
} else {
  module.exports = require('./postgresql');
}
```

**Tarea 1.3.2**: Mover db.js → src/services/database/postgresql.js
**Tarea 1.3.3**: Mover db-mock.js → src/services/database/mock.js
**Tarea 1.3.4**: Actualizar todos los requires:
```javascript
// ANTES: const db = require('./db');
// DESPUÉS: const db = require('./src/services/database');
```

**Tarea 1.3.5**: Commit local
```bash
git commit -m "refactor: database abstraction with auto-selector"
```

---

### SUB-GRUPO 1.4: Security Hardening (10 tareas, 8h)

**Tarea 1.4.1**: Agregar CSRF protection
```bash
npm install --save csurf
```
**Código**:
```javascript
const csrf = require('csurf');
app.use(csrf({ cookie: true }));
```

**Tarea 1.4.2**: Validar webhook URLs contra SSRF
```javascript
function validateWebhookUrl(url) {
  const parsed = new URL(url);
  const privateIPs = ['localhost', '127.0.0.1', '10.', '172.16.', '192.168.'];
  if (privateIPs.some(ip => parsed.hostname.includes(ip))) {
    throw new Error('Private IP not allowed');
  }
}
```

**Tarea 1.4.3**: Complete security headers
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://econeura-backend.azurewebsites.net"]
    }
  }
}));
```

**Tarea 1.4.4**: Rate limiting por IP + user
**Tarea 1.4.5**: Input sanitization completo
**Tarea 1.4.6**: SQL injection tests
**Tarea 1.4.7**: XSS tests
**Tarea 1.4.8**: Security audit (npm audit + Snyk)
**Tarea 1.4.9**: Gitleaks scan (secrets)
**Tarea 1.4.10**: Commit security fixes

---

## GRUPO 2: OPTIMIZACIÓN FRONTEND (35 TAREAS, 10H)

### SUB-GRUPO 2.1: Refactorizar Cockpit (15 tareas, 4h)

**Tarea 2.1.1**: Crear features/neuras/NeuraCockpit.tsx (layout, 300 líneas)
**Tarea 2.1.2**: Crear features/neuras/NeuraChat.tsx (chat, 800 líneas)
**Tarea 2.1.3**: Crear features/neuras/NeuraSelector.tsx (selector, 200 líneas)
**Tarea 2.1.4**: Crear features/neuras/NeuraSidebar.tsx (sidebar, 200 líneas)
**Tarea 2.1.5**: Crear features/neuras/NeuraFooter.tsx (footer, 100 líneas)
**Tarea 2.1.6**: Crear features/neuras/shared/utils.ts (utilities, 100 líneas)
**Tarea 2.1.7**: Actualizar imports en App.tsx
**Tarea 2.1.8**: Eliminar EconeuraCockpit.tsx original (2,700 líneas)
**Tarea 2.1.9**: Tests para nuevos componentes
**Tarea 2.1.10**: Verificar build funciona
```bash
cd frontend
npm run build
```
**Tarea 2.1.11**: Verificar bundle size <300 KB
**Tarea 2.1.12**: Commit refactor

---

### SUB-GRUPO 2.2: Agent Management UI (15 tareas, 4h)

**Tarea 2.2.1**: Crear features/agents/AgentList.tsx (300 líneas)
- Listar agentes, filtros, search
- Health status badges
- Acciones: Edit, Delete, Execute

**Tarea 2.2.2**: Crear features/agents/AgentCreate.tsx (250 líneas)
- Form crear agente
- Select platform (Make, n8n, Zapier)
- Webhook URL input
- NEURA selector

**Tarea 2.2.3**: Crear features/agents/AgentEdit.tsx (250 líneas)

**Tarea 2.2.4**: Crear features/agents/AgentHealthDashboard.tsx (350 líneas)
- Success rate por agente
- Last execution time
- Error logs
- Charts (recharts)

**Tarea 2.2.5**: Crear features/agents/AgentExecutionView.tsx (200 líneas)
- Execute agent manually
- Input payload (JSON editor)
- Show result

**Tarea 2.2.6**: Mejorar ConnectAgentModal.tsx (ya existe 284 líneas)
- Agregar wizard para Make.com
- Agregar wizard para n8n
- Agregar wizard para Zapier

**Tarea 2.2.7**: Crear services/agents.ts (API client, 150 líneas)
**Tarea 2.2.8**: Crear hooks/useAgents.ts (120 líneas)
**Tarea 2.2.9**: Crear contexts/AgentsContext.tsx (100 líneas)
**Tarea 2.2.10**: Crear types/agent.ts (100 líneas)
**Tarea 2.2.11**: Tests unitarios
**Tarea 2.2.12**: Tests E2E (agent-crud.spec.ts)
**Tarea 2.2.13**: Integrar en NeuraCockpit (botón "Agents")
**Tarea 2.2.14**: Build + bundle size check
**Tarea 2.2.15**: Commit Agent UI

---

### SUB-GRUPO 2.3: Security Frontend (5 tareas, 2h)

**Tarea 2.3.1**: Agregar SRI hashes en index.html
```html
<script src="..." integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/ux..." crossorigin="anonymous"></script>
```

**Tarea 2.3.2**: Content Security Policy meta tag
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'">
```

**Tarea 2.3.3**: CSRF token en forms
**Tarea 2.3.4**: XSS protection (DOMPurify)
**Tarea 2.3.5**: Commit security frontend

---

## GRUPO 3: TESTS COMPLETOS (25 TAREAS, 8H)

### SUB-GRUPO 3.1: Backend Unit Tests (10 tareas, 4h)

**Tarea 3.1.1**: makeService.test.js (retry, cache, HMAC)
**Tarea 3.1.2**: neuraAgentExecutor.test.js (execute, detectIntent)
**Tarea 3.1.3**: generatorsBridge.test.js (webhook retry)
**Tarea 3.1.4**: functionRegistry.test.js (6 functions)
**Tarea 3.1.5**: azureBlob.test.js (upload, download)
**Tarea 3.1.6**: pdfIngest.test.js (extract, chunk)
**Tarea 3.1.7**: webhooks.test.js (HMAC verification)
**Tarea 3.1.8**: agents.test.js (CRUD operations)
**Tarea 3.1.9**: proposals.test.js (HITL workflow)
**Tarea 3.1.10**: library.test.js (upload, search)

---

### SUB-GRUPO 3.2: Backend Integration Tests (10 tareas, 2h)

**Tarea 3.2.1**: test/integration/agents-flow.test.js
- Create agent → Execute → Check health

**Tarea 3.2.2**: test/integration/webhooks-flow.test.js
- Receive webhook → Verify HMAC → Execute

**Tarea 3.2.3**: test/integration/proposals-flow.test.js
- Create → Approve → Execute

**Tarea 3.2.4**: test/integration/library-flow.test.js
- Upload → Ingest → Search

**Tarea 3.2.5**: test/integration/neura-chat-with-agent.test.js
- Chat → Detect intent → Execute agent → Return result

**Tarea 3.2.6-3.2.10**: 5 integration tests adicionales

---

### SUB-GRUPO 3.3: Frontend E2E Tests (5 tareas, 2h)

**Tarea 3.3.1**: test/e2e/agent-crud.spec.ts
- Login → Create agent → Edit → Delete

**Tarea 3.3.2**: test/e2e/agent-execution.spec.ts
- Login → Execute agent → View result

**Tarea 3.3.3**: test/e2e/agent-health.spec.ts
- Login → View agent health dashboard

**Tarea 3.3.4**: test/e2e/proposals.spec.ts
- Login → Create proposal → Approve → Execute

**Tarea 3.3.5**: test/e2e/library.spec.ts
- Login → Upload PDF → Search → View results

---

## GRUPO 4: COMPLIANCE DOCS (30 TAREAS, 30H)

### SUB-GRUPO 4.1: GDPR Docs (7 tareas, 8h)

**Tarea 4.1.1**: docs/compliance/GDPR/OVERVIEW.md (2h)
**Tarea 4.1.2**: docs/compliance/GDPR/DPA.md (Data Processing Agreement) (2h)
**Tarea 4.1.3**: docs/compliance/GDPR/DPIA.md (Data Protection Impact Assessment) (2h)
**Tarea 4.1.4**: docs/compliance/GDPR/RIGHTS.md (Right to access, erasure, portability) (1h)
**Tarea 4.1.5**: docs/compliance/GDPR/BREACH-PROCEDURE.md (1h)
**Tarea 4.1.6**: Implementar GET /api/data-export (backend/routes/data-export.js) (2h)
**Tarea 4.1.7**: Actualizar DELETE /api/users/:id (complete erasure) (1h)

---

### SUB-GRUPO 4.2: AI Act Docs (6 tareas, 6h)

**Tarea 4.2.1**: docs/compliance/AI-ACT/OVERVIEW.md (1h)
**Tarea 4.2.2**: docs/compliance/AI-ACT/TECHNICAL.md (Technical documentation) (3h)
**Tarea 4.2.3**: docs/compliance/AI-ACT/TRANSPARENCY.md (1h)
**Tarea 4.2.4**: docs/compliance/AI-ACT/POST-MARKET-MONITORING.md (1h)
**Tarea 4.2.5**: docs/compliance/AI-ACT/CONFORMITY-ASSESSMENT.md (1h)
**Tarea 4.2.6**: Agregar disclaimer IA en frontend (0.5h)

---

### SUB-GRUPO 4.3: ISO 27001 Docs (8 tareas, 8h)

**Tarea 4.3.1**: docs/compliance/ISO-27001/OVERVIEW.md (1h)
**Tarea 4.3.2**: docs/compliance/ISO-27001/ISMS-POLICY.md (1h)
**Tarea 4.3.3**: docs/compliance/ISO-27001/RISK-ASSESSMENT.md (2h)
**Tarea 4.3.4**: docs/compliance/ISO-27001/STATEMENT-OF-APPLICABILITY.md (SOA) (2h)
**Tarea 4.3.5**: docs/compliance/ISO-27001/INCIDENT-RESPONSE.md (1h)
**Tarea 4.3.6**: docs/compliance/ISO-27001/BUSINESS-CONTINUITY.md (DR plan) (1h)
**Tarea 4.3.7**: docs/compliance/ISO-27001/INTERNAL-AUDIT.md (1h)
**Tarea 4.3.8**: docs/compliance/ISO-27001/MANAGEMENT-REVIEW.md (1h)

---

### SUB-GRUPO 4.4: SOC 2 Docs (6 tareas, 6h)

**Tarea 4.4.1**: docs/compliance/SOC2/OVERVIEW.md (1h)
**Tarea 4.4.2**: docs/compliance/SOC2/CONTROL-ENVIRONMENT.md (1.5h)
**Tarea 4.4.3**: docs/compliance/SOC2/CONTROL-ACTIVITIES.md (80+ controls) (2h)
**Tarea 4.4.4**: docs/compliance/SOC2/EVIDENCE-CHECKLIST.md (1h)
**Tarea 4.4.5**: docs/compliance/SOC2/AUDIT-READINESS.md (1h)
**Tarea 4.4.6**: Preparar evidence artifacts (logs, access records) (1h)

---

### SUB-GRUPO 4.5: Legal Docs (5 tareas, 2h)

**Tarea 4.5.1**: docs/legal/TERMS-OF-SERVICE.md (1h)
**Tarea 4.5.2**: docs/legal/PRIVACY-POLICY.md (0.5h)
**Tarea 4.5.3**: docs/legal/SLA.md (Service Level Agreement) (0.5h)
**Tarea 4.5.4**: docs/legal/AUP.md (Acceptable Use Policy) (0.5h)
**Tarea 4.5.5**: docs/legal/COOKIE-POLICY.md (0.5h)

---

## GRUPO 5: VERIFICACIÓN LOCAL (20 TAREAS, 4H)

### SUB-GRUPO 5.1: Backend Local (10 tareas, 2h)

**Tarea 5.1.1**: cd backend && npm install
**Criterio éxito**: 0 errores

**Tarea 5.1.2**: Crear .env local
```bash
NODE_ENV=development
PORT=8080
USE_MOCK_DB=true
MAMMOUTH_API_KEY=<TU_KEY_AQUI>
MISTRAL_MODEL=mistral-medium-3.1
JWT_SECRET=$(openssl rand -base64 64)
SESSION_SECRET=$(openssl rand -base64 64)
CORS_ORIGIN=http://localhost:5173
```

**Tarea 5.1.3**: npm start
**Tarea 5.1.4**: Health check local
```bash
curl http://localhost:8080/api/health
```
**Esperado**: `{"status":"ok", "database":"mock", "ai_providers":["mammouth"]}`

**Tarea 5.1.5**: Test NEURA CEO
```bash
curl -X POST http://localhost:8080/api/invoke/a-ceo-01 -H "Content-Type: application/json" -d '{"input":"test"}'
```

**Tarea 5.1.6**: Test Agent CRUD
```bash
# Create agent
curl -X POST http://localhost:8080/api/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Test Make Agent","platform":"make","webhook_url":"https://hook.eu2.make.com/test","department":"CEO","neura_assigned":"CEO"}'

# List agents
curl http://localhost:8080/api/agents -H "Authorization: Bearer <token>"
```

**Tarea 5.1.7**: Test webhook receiver
**Tarea 5.1.8**: Verificar logs (sin errors)
**Tarea 5.1.9**: npm test (backend tests)
**Esperado**: >80% coverage, all tests pass

**Tarea 5.1.10**: Stop backend
```bash
kill $(cat /tmp/backend.pid)
```

---

### SUB-GRUPO 5.2: Frontend Local (10 tareas, 2h)

**Tarea 5.2.1**: cd frontend && npm install
**Tarea 5.2.2**: npm run dev
**Tarea 5.2.3**: Browser http://localhost:5173
**Esperado**: Homepage carga en <2s

**Tarea 5.2.4**: Login test (manual)
**Tarea 5.2.5**: Chat NEURA CEO test
**Tarea 5.2.6**: Agent Management UI test
**Tarea 5.2.7**: npm run build
**Esperado**: dist/ created, <300 KB bundle

**Tarea 5.2.8**: npm run preview (test build)
**Tarea 5.2.9**: npm test (frontend tests)
**Tarea 5.2.10**: npm run test:e2e (Playwright)
**Esperado**: All E2E tests pass

---

## GRUPO 6: AZURE SETUP (20 TAREAS, 3H)

### SUB-GRUPO 6.1: Azure Resources (15 tareas, 2h)

**Tarea 6.1.1**: az login
```bash
az login
az account set --subscription a0991f95-16e0-4f03-85df-db3d69004d94
```

**Tarea 6.1.2**: Crear Resource Group
```bash
az group create --name econeura-rg --location northeurope
```

**Tarea 6.1.3**: Crear App Service Plan B1
```bash
az appservice plan create --name econeura-plan --resource-group econeura-rg --sku B1 --is-linux
```
**Costo**: $54.75/mes

**Tarea 6.1.4**: Crear App Service (backend)
```bash
az webapp create --name econeura-backend --resource-group econeura-rg --plan econeura-plan --runtime "NODE:20-lts"
```

**Tarea 6.1.5**: Crear PostgreSQL B1ms
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
**Costo**: $25/mes

**Tarea 6.1.6**: Crear database 'econeura'
**Tarea 6.1.7**: Crear Redis C1
```bash
az redis create --name econeura-redis --resource-group econeura-rg --location northeurope --sku Standard --vm-size C1
```
**Costo**: $20/mes

**Tarea 6.1.8**: Crear Static Web App (frontend)
```bash
az staticwebapp create --name econeura-frontend --resource-group econeura-rg --source https://github.com/ECONEURA-MAX/ECONEURA-.git --branch main --app-location /frontend --output-location dist
```
**Costo**: $0 (FREE)

**Tarea 6.1.9**: Crear Storage Account
```bash
az storage account create --name econeurastorage --resource-group econeura-rg --location northeurope --sku Standard_LRS
```
**Costo**: $5/mes

**Tarea 6.1.10**: Crear Key Vault
```bash
az keyvault create --name econeura-vault --resource-group econeura-rg --location northeurope
```
**Costo**: $0 (FREE)

**Tarea 6.1.11**: Crear Application Insights
```bash
az monitor app-insights component create --app econeura-insights --location northeurope --resource-group econeura-rg
```
**Costo**: $10/mes

**Tarea 6.1.12**: Crear Functions App (webhooks)
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
**Costo**: $15/mes

**Tarea 6.1.13**: Crear Front Door Standard (CDN)
```bash
az afd profile create --profile-name econeura-cdn --resource-group econeura-rg --sku Standard_AzureFrontDoor
```
**Costo**: $15/mes

**Tarea 6.1.14**: Verificar recursos creados
```bash
az resource list --resource-group econeura-rg --output table
```
**Esperado**: 9 recursos

**Tarea 6.1.15**: Verificar costo proyectado
```bash
az consumption budget list --resource-group econeura-rg
```
**Esperado**: ~$200/mes

---

### SUB-GRUPO 6.2: Configuration (5 tareas, 1h)

**Tarea 6.2.1**: Guardar secrets en Key Vault
```bash
az keyvault secret set --vault-name econeura-vault --name DATABASE-URL --value "postgresql://..."
az keyvault secret set --vault-name econeura-vault --name MAMMOUTH-API-KEY --value "$MAMMOUTH_API_KEY"
az keyvault secret set --vault-name econeura-vault --name JWT-SECRET --value "$(openssl rand -base64 64)"
az keyvault secret set --vault-name econeura-vault --name SESSION-SECRET --value "$(openssl rand -base64 64)"
```

**Tarea 6.2.2**: Configurar App Service settings
```bash
az webapp config appsettings set \
  --name econeura-backend \
  --resource-group econeura-rg \
  --settings \
    NODE_ENV=production \
    USE_MOCK_DB=false \
    DATABASE_URL="@Microsoft.KeyVault(SecretUri=https://econeura-vault.vault.azure.net/secrets/DATABASE-URL/)" \
    MAMMOUTH_API_KEY="@Microsoft.KeyVault(SecretUri=https://econeura-vault.vault.azure.net/secrets/MAMMOUTH-API-KEY/)" \
    JWT_SECRET="@Microsoft.KeyVault(SecretUri=https://econeura-vault.vault.azure.net/secrets/JWT-SECRET/)" \
    SESSION_SECRET="@Microsoft.KeyVault(SecretUri=https://econeura-vault.vault.azure.net/secrets/SESSION-SECRET/)"
```

**Tarea 6.2.3**: Ejecutar schema.sql en PostgreSQL
```bash
psql $DATABASE_URL < backend/db/schema.sql
```
**Esperado**: 6 tablas creadas (users, tokens, chats, agents, proposals, documents)

**Tarea 6.2.4**: Ejecutar seeds (usuario admin)
```bash
psql $DATABASE_URL < backend/db/seeds/001_users.sql
```

**Tarea 6.2.5**: Verificar conexión PostgreSQL
```bash
psql $DATABASE_URL -c "SELECT version();"
```

---

## GRUPO 7: DEPLOYMENT (15 TAREAS, 2H)

### SUB-GRUPO 7.1: GitHub Setup (5 tareas, 30min)

**Tarea 7.1.1**: Configurar GitHub secrets
- `AZURE_CREDENTIALS` (service principal)
- `AZURE_WEBAPP_PUBLISH_PROFILE`
- `AZURE_STATIC_WEB_APPS_API_TOKEN`
- `AZURE_FUNCTIONS_PUBLISH_PROFILE`

**Tarea 7.1.2**: Crear .github/workflows/backend-deploy.yml
**Tarea 7.1.3**: Crear .github/workflows/frontend-deploy.yml
**Tarea 7.1.4**: Crear .github/workflows/functions-deploy.yml
**Tarea 7.1.5**: Crear .github/workflows/tests.yml (run on PR)

---

### SUB-GRUPO 7.2: Deploy (10 tareas, 1.5h)

**Tarea 7.2.1**: Git commit ALL optimizations
```bash
git add .
git commit -m "feat: ECONEURA Enterprise v1.0.0 - Production ready

- 11 NEURAs with Mistral Medium 3.1
- Make/n8n/Zapier integration complete
- HITL proposals system
- RAG Library
- Compliance: GDPR + AI Act + ISO 27001 + SOC 2
- Tests >80% coverage
- Azure deployment ready"
```

**Tarea 7.2.2**: Git push a GitHub
```bash
git remote add origin https://github.com/ECONEURA-MAX/ECONEURA-.git
git push -u origin main
```

**Tarea 7.2.3**: Monitorear GitHub Actions
- backend-deploy.yml → ✅
- frontend-deploy.yml → ✅
- functions-deploy.yml → ✅

**Tarea 7.2.4**: Esperar 5 min (deployment + warm-up)

**Tarea 7.2.5**: Health check backend Azure
```bash
curl https://econeura-backend.azurewebsites.net/api/health
```
**Esperado**: `{"status":"ok", "database":"postgresql", "redis":"azure-cache"}`

**Tarea 7.2.6**: Health check frontend Azure
**Browser**: https://econeura-frontend.azurestaticapps.net
**Esperado**: Homepage carga en <2s

**Tarea 7.2.7**: Test NEURA CEO producción
**Tarea 7.2.8**: Test Agent CRUD producción
**Tarea 7.2.9**: Test OAuth login producción
**Tarea 7.2.10**: Verificar logs Azure (App Insights)

---

## GRUPO 8: VERIFICACIÓN PRODUCCIÓN (10 TAREAS, 1H)

**Tarea 8.1**: Login OAuth Microsoft
**Tarea 8.2**: Chat con NEURA CEO (response <5s)
**Tarea 8.3**: Crear agent Make.com
**Tarea 8.4**: Execute agent
**Tarea 8.5**: View agent health dashboard
**Tarea 8.6**: Upload PDF a Library
**Tarea 8.7**: Search in Library
**Tarea 8.8**: Create HITL proposal
**Tarea 8.9**: Approve proposal
**Tarea 8.10**: Verificar monitoring (App Insights)

---

## GRUPO 9: MONITORING SETUP (5 TAREAS, 1H)

**Tarea 9.1**: Configurar alerts en App Insights
- Uptime <99.8% → Email
- Latency P95 >500ms → Slack
- Error rate >1% → PagerDuty

**Tarea 9.2**: Configurar cost alerts
- Daily cost >$10 → Email
- Total cost >$180 → SMS

**Tarea 9.3**: Dashboard Application Insights
**Tarea 9.4**: Dashboard Cost Management
**Tarea 9.5**: Configurar backup PostgreSQL
```bash
az postgres flexible-server backup create --resource-group econeura-rg --name econeura-db --backup-name manual-backup-1
```

---

## GRUPO 10: POST-LAUNCH (5 TAREAS, 1H)

**Tarea 10.1**: Documentar deploy en docs/deployment/PRODUCTION-DEPLOY.md
**Tarea 10.2**: Crear CHANGELOG.md (v1.0.0)
**Tarea 10.3**: Tag release
```bash
git tag -a v1.0.0 -m "ECONEURA Enterprise v1.0.0 - Production"
git push origin v1.0.0
```

**Tarea 10.4**: Actualizar README.md (add badges, update URLs)
**Tarea 10.5**: Slack notification "🎉 ECONEURA v1.0.0 deployed"

---

## ✅ CHECKLIST FINAL (40 PUNTOS)

### Código Optimizado
- [ ] server.js limpio (300 líneas)
- [ ] Prompts consolidados (1 JSON)
- [ ] Cockpit refactorizado (6 componentes)
- [ ] Agent UI completo (5 componentes)
- [ ] Database abstraction (auto-selector)
- [ ] Security hardening (CSRF, SSRF, CSP)
- [ ] ESLint 0 errores
- [ ] TypeScript 0 errores

### Tests
- [ ] Backend unit tests >80% coverage
- [ ] Backend integration tests pass
- [ ] Frontend E2E tests pass (7 specs)
- [ ] Security tests pass (Snyk, Gitleaks)
- [ ] Performance tests pass (Lighthouse >90)

### Compliance Docs
- [ ] GDPR completo (7 documentos)
- [ ] AI Act completo (6 documentos)
- [ ] ISO 27001 completo (8 documentos)
- [ ] SOC 2 completo (6 documentos)
- [ ] Legal completo (5 documentos)

### Verificación Local
- [ ] Backend npm start OK
- [ ] Backend health check 200 OK
- [ ] Frontend npm run dev OK
- [ ] Login funcional
- [ ] Chat NEURAs funcional
- [ ] Agent CRUD funcional
- [ ] All E2E tests pass

### Azure
- [ ] 9 recursos creados ($199.75/mes)
- [ ] PostgreSQL con schema
- [ ] Redis funcionando
- [ ] Key Vault con secrets
- [ ] App Service configurado
- [ ] Functions deployadas

### Deployment
- [ ] GitHub Actions workflows OK
- [ ] Backend deployed + health check OK
- [ ] Frontend deployed + carga <2s
- [ ] Functions deployed + test webhook OK
- [ ] Monitoring activo

### Producción
- [ ] Login OAuth funciona
- [ ] Chat producción <5s
- [ ] Agent CRUD funciona
- [ ] Webhook test exitoso
- [ ] Monitoring visible (App Insights)

**SI 40/40 ✅ → ECONEURA 10/10 EN PRODUCCIÓN**

---

## 🎯 TIEMPO TOTAL

| Grupo | Tareas | Tiempo |
|-------|--------|--------|
| G1: Optimización Backend | 40 | 12h |
| G2: Optimización Frontend | 35 | 10h |
| G3: Tests Completos | 25 | 8h |
| G4: Compliance Docs | 30 | 30h |
| G5: Verificación Local | 20 | 4h |
| G6: Azure Setup | 20 | 3h |
| G7: Deployment | 15 | 2h |
| G8: Verificación Producción | 10 | 1h |
| G9: Monitoring Setup | 5 | 1h |
| G10: Post-Launch | 5 | 1h |
| **TOTAL** | **205** | **72h** |

**72 horas = 9 días de trabajo (8h/día)**  
**O 18 días a medio tiempo (4h/día)**

---

## 🔥 REGLAS DE EJECUCIÓN

**REGLA 1**: LOCAL PRIMERO
- ✅ TODAS las tareas G1-G5 LOCAL (sin commit a GitHub)
- ✅ Solo cuando G1-G5 completas → Commit

**REGLA 2**: SI UNA TAREA FALLA → ABORTAR
- ❌ No continuar si test falla
- ❌ No continuar si lint falla
- ❌ No continuar si build falla

**REGLA 3**: VERIFICAR CADA TAREA
- ✅ Criterio éxito MEDIBLE en cada tarea
- ✅ No asumir - VERIFICAR con comandos

**REGLA 4**: NO COMMIT HASTA G5 COMPLETO
- ✅ G1-G4: Optimizaciones + docs
- ✅ G5: Verificación local 100% OK
- ✅ ENTONCES: Git commit + push

**ESTAS 205 TAREAS SON EL CAMINO A ECONEURA 10/10** 🔥

