# 🏗️ PROPUESTA: ESTRUCTURA MONOREPO IDEAL

**Para tu aprobación antes de reorganizar**

---

## 📊 COMPARATIVA: ACTUAL vs IDEAL

### ESTRUCTURA ACTUAL (ECONEURA-PERFECTO)
```
ECONEURA-PERFECTO/
├── backend/
│   ├── api/                    ⚠️  Mezclado con routes/
│   ├── routes/                 ⚠️  Duplicado con api/
│   ├── services/               ✅ OK
│   ├── middleware/             ✅ OK
│   ├── config/                 ✅ OK
│   ├── prompts/                ⚠️  10 archivos .js (mejor JSON)
│   ├── db.js                   ⚠️  Confuso (2 archivos)
│   ├── db-mock.js              ⚠️  Separado
│   ├── server.js               ⚠️  542 líneas (200+ comentadas)
│   └── 76 archivos JS total
│
├── frontend/                   ✅ Estructura OK
│   └── src/
│
├── .github/workflows/          ✅ OK
│
└── (falta docs/, scripts/)     ❌ No documentación centralizada
```

**Problemas detectados**:
1. ❌ `api/` y `routes/` hacen lo mismo (confuso)
2. ❌ `server.js` tiene 200+ líneas comentadas (legacy)
3. ❌ `db.js` y `db-mock.js` separados (debería ser módulo único)
4. ❌ Prompts como código JS (difícil editar para no-devs)
5. ❌ Sin `docs/` centralizado
6. ❌ Sin `scripts/` de automatización

---

## ✨ ESTRUCTURA IDEAL PROPUESTA

```
ECONEURA/                                    ✨ Nuevo repo limpio
│
├── README.md                                ✨ README mejorado
├── LICENSE                                  ✨ Apache 2.0
├── .gitignore                               ✨ Optimizado Azure
├── .env.example                             ✨ Template env vars
│
├── backend/                                 🎯 API Node.js 20
│   │
│   ├── src/                                 ✨ NUEVO: Todo código aquí
│   │   │
│   │   ├── api/                            → Endpoints HTTP (health, metrics, etc.)
│   │   │   ├── health.js                   → /api/health
│   │   │   ├── agents.js                   → /api/agents
│   │   │   ├── library.js                  → /api/library
│   │   │   ├── metrics.js                  → /api/metrics
│   │   │   └── proposals.js                → /api/proposals
│   │   │
│   │   ├── routes/                         → Business logic routes
│   │   │   ├── auth.js                     → /api/auth (OAuth + JWT)
│   │   │   ├── chat.js                     → /api/chats
│   │   │   ├── invoke.js                   → /api/invoke/:neuraId
│   │   │   ├── ai-gateway.js               → /api/ai-gateway
│   │   │   ├── neura-agents.js             → /api/neura-agents
│   │   │   ├── neura-chat.js               → /api/neura-chat
│   │   │   ├── integration.js              → /api/integration
│   │   │   └── agent.js                    → /api/agent
│   │   │
│   │   ├── services/                       → Core business services
│   │   │   │
│   │   │   ├── database/                   ✨ NUEVO: DB abstraction
│   │   │   │   ├── index.js               → Auto-selector (Cosmos/Postgres/Mock)
│   │   │   │   ├── cosmosdb.js            → Azure Cosmos DB client
│   │   │   │   ├── postgresql.js          → Azure PostgreSQL client
│   │   │   │   └── mock.js                → Mock DB (desarrollo)
│   │   │   │
│   │   │   ├── ai/                         ✨ NUEVO: AI services
│   │   │   │   ├── gateway.js             → ResilientAIGateway (circuit breaker)
│   │   │   │   ├── mammouth.js            → Mammouth AI client (Mistral)
│   │   │   │   ├── analysis.js            → NeuraAnalysisService
│   │   │   │   └── executor.js            → NeuraAgentExecutor
│   │   │   │
│   │   │   ├── auth/                       ✨ NUEVO: Auth services
│   │   │   │   ├── jwt.js                 → JWT generation/validation
│   │   │   │   ├── tokenStore.js          → Redis token storage
│   │   │   │   └── oauth.js               → OAuth strategies
│   │   │   │
│   │   │   ├── azure/                      ✨ NUEVO: Azure integrations
│   │   │   │   ├── keyvault.js            → Key Vault service
│   │   │   │   ├── storage.js             → Blob Storage service
│   │   │   │   └── monitoring.js          → Application Insights
│   │   │   │
│   │   │   ├── logger.js                   → Winston structured logging
│   │   │   └── makeService.js              → Make.com integration
│   │   │
│   │   ├── middleware/                     → Express middleware
│   │   │   ├── auth.js                     → JWT authentication
│   │   │   ├── rateLimiter.js              → Redis rate limiting
│   │   │   ├── validation.js               → Joi input validation
│   │   │   ├── errorHandler.js             ✨ NUEVO: Global error handler
│   │   │   ├── securityHeaders.js          → Security headers
│   │   │   ├── requestId.js                → Request tracing
│   │   │   └── cors.js                     ✨ NUEVO: CORS config
│   │   │
│   │   ├── config/                         → Configuration modules
│   │   │   ├── index.js                    ✨ NUEVO: Config loader
│   │   │   ├── azure.js                    ✨ NUEVO: Azure config
│   │   │   ├── database.js                 → DB connection config
│   │   │   ├── redis.js                    → Redis config
│   │   │   ├── auth.js                     → Passport strategies
│   │   │   └── envValidation.js            → Zod env validation
│   │   │
│   │   ├── utils/                          → Shared utilities
│   │   │   ├── retry.js                    → Retry logic
│   │   │   ├── errorHandler.js             → Error formatting
│   │   │   └── constants.js                ✨ NUEVO: App constants
│   │   │
│   │   ├── startup-safe.js                 → Module validation
│   │   └── server.js                       → Entry point (LIMPIO: 300 líneas)
│   │
│   ├── config/                             ✨ Config files (JSON/YAML)
│   │   ├── agents.json                     → Agent configurations
│   │   ├── neura-prompts.json              ✨ NUEVO: Prompts como JSON
│   │   └── neura-agents-map.json           → NEURA mappings
│   │
│   ├── tests/                              → Unit & integration tests
│   │   ├── api/
│   │   ├── services/
│   │   └── middleware/
│   │
│   ├── .env.example                        ✨ Template
│   ├── .env.development                    ✨ NUEVO: Dev env
│   ├── package.json
│   ├── tsconfig.json                       ✨ NUEVO: Para TypeScript futuro
│   └── README.md                           → Backend docs
│
├── frontend/                                🎯 React App
│   │
│   ├── src/
│   │   │
│   │   ├── features/                       ✨ NUEVO: Organizado por features
│   │   │   ├── auth/                       → Login, Register, OAuth
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   └── useAuth.ts
│   │   │   │
│   │   │   ├── chat/                       → Chat con NEURAs
│   │   │   │   ├── ChatInterface.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   ├── NeuraSelector.tsx
│   │   │   │   └── useChat.ts
│   │   │   │
│   │   │   ├── library/                    → Biblioteca documentos
│   │   │   │   ├── DocumentUpload.tsx
│   │   │   │   ├── DocumentList.tsx
│   │   │   │   └── useLibrary.ts
│   │   │   │
│   │   │   └── agents/                     → Gestión agentes
│   │   │       ├── AgentList.tsx
│   │   │       ├── AgentCreate.tsx
│   │   │       └── useAgents.ts
│   │   │
│   │   ├── components/                     → Shared components
│   │   │   ├── ui/                         → UI primitives
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   └── Loading.tsx
│   │   │   │
│   │   │   └── layout/                     → Layout components
│   │   │       ├── Header.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       └── Footer.tsx
│   │   │
│   │   ├── services/                       → API clients
│   │   │   ├── api.ts                      → Axios instance
│   │   │   ├── auth.ts                     → Auth API
│   │   │   ├── chat.ts                     → Chat API
│   │   │   └── agents.ts                   → Agents API
│   │   │
│   │   ├── hooks/                          → Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useChat.ts
│   │   │   └── useLocalStorage.ts
│   │   │
│   │   ├── contexts/                       → React contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   │
│   │   ├── utils/                          → Utilities
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts
│   │   │
│   │   ├── styles/                         → Global styles
│   │   │   └── globals.css
│   │   │
│   │   ├── App.tsx                         → Main app
│   │   └── main.tsx                        → Entry point
│   │
│   ├── public/                             → Static assets
│   │   ├── econeura-logo.png
│   │   └── favicon.ico
│   │
│   ├── .env.example
│   ├── .env.development                    ✨ NUEVO
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── package.json
│   └── README.md
│
├── .github/                                 🎯 CI/CD & Automation
│   │
│   ├── workflows/
│   │   ├── backend-deploy.yml              → Deploy backend a Azure
│   │   ├── frontend-deploy.yml             → Deploy frontend a Azure
│   │   ├── tests.yml                       ✨ NUEVO: Run all tests
│   │   ├── security-scan.yml               ✨ NUEVO: Security checks
│   │   └── cost-monitoring.yml             ✨ NUEVO: Monitor Azure costs
│   │
│   ├── ISSUE_TEMPLATE.md                   ✨ NUEVO
│   └── PULL_REQUEST_TEMPLATE.md            ✨ NUEVO
│
├── docs/                                    ✨ NUEVO: Documentación completa
│   │
│   ├── architecture/
│   │   ├── OVERVIEW.md                     → Arquitectura general
│   │   ├── AZURE-SERVICES.md               → Servicios Azure usados
│   │   ├── DATABASE.md                     → Database schema
│   │   └── SECURITY.md                     → Security architecture
│   │
│   ├── api/
│   │   ├── README.md                       → API overview
│   │   ├── AUTHENTICATION.md               → Auth endpoints
│   │   ├── CHAT.md                         → Chat endpoints
│   │   ├── AGENTS.md                       → Agents endpoints
│   │   └── OPENAPI.yaml                    ✨ NUEVO: OpenAPI spec
│   │
│   ├── deployment/
│   │   ├── LOCAL.md                        → Setup local
│   │   ├── AZURE-SETUP.md                  → Setup Azure inicial
│   │   ├── CI-CD.md                        → GitHub Actions setup
│   │   └── TROUBLESHOOTING.md              → Problemas comunes
│   │
│   ├── guides/
│   │   ├── GETTING-STARTED.md              → Para nuevos devs
│   │   ├── CONTRIBUTING.md                 → Cómo contribuir
│   │   └── AZURE-COSTS.md                  → Optimizar costos Azure
│   │
│   └── compliance/
│       ├── GDPR.md                         → Cumplimiento GDPR
│       ├── AI-ACT.md                       → EU AI Act
│       └── SECURITY.md                     → Políticas seguridad
│
├── scripts/                                 ✨ NUEVO: Scripts útiles
│   ├── setup-local.ps1                     → Setup desarrollo local
│   ├── deploy-azure.ps1                    → Deploy manual Azure
│   ├── test-all.ps1                        → Run all tests
│   ├── cleanup.ps1                         → Limpiar temporales
│   └── monitor-costs.ps1                   → Ver costos Azure
│
├── azure/                                   ✨ NUEVO: Infrastructure as Code
│   ├── bicep/                              → Azure Bicep (IaC)
│   │   ├── main.bicep                      → Definición completa
│   │   ├── backend.bicep                   → App Service
│   │   ├── frontend.bicep                  → Static Web App
│   │   ├── database.bicep                  → Cosmos DB
│   │   └── monitoring.bicep                → Application Insights
│   │
│   └── parameters/
│       ├── dev.parameters.json             → Parámetros desarrollo
│       └── prod.parameters.json            → Parámetros producción
│
└── .vscode/                                 ✨ NUEVO: VS Code config
    ├── settings.json                       → Configuración proyecto
    ├── extensions.json                     → Extensiones recomendadas
    └── launch.json                         → Debug configs
```

---

## 🔄 CAMBIOS ESPECÍFICOS PROPUESTOS

### 1. BACKEND: Consolidar api/ y routes/
**ANTES**:
```
backend/api/health.js       → /api/health
backend/routes/chat.js      → /api/chats
```

**DESPUÉS**:
```
backend/src/api/health.js   → Endpoints simples (health, metrics)
backend/src/routes/chat.js  → Endpoints complejos (chat, auth)
```

**Regla**: 
- `api/` = endpoints simples sin lógica (health, metrics)
- `routes/` = endpoints con lógica de negocio (chat, auth, agents)

### 2. BACKEND: Consolidar database
**ANTES**:
```javascript
// db.js (PostgreSQL)
// db-mock.js (Mock)
// Usar: require('./db') o require('./db-mock')
```

**DESPUÉS**:
```javascript
// src/services/database/index.js
const env = process.env;

if (env.USE_COSMOS_DB === 'true') {
  module.exports = require('./cosmosdb');
} else if (env.USE_MOCK_DB === 'true') {
  module.exports = require('./mock');
} else {
  module.exports = require('./postgresql');
}

// Usar siempre: const db = require('./services/database');
```

### 3. BACKEND: Limpiar server.js
**ANTES**: 542 líneas (200+ comentadas)
```javascript
// const AdvancedVoiceService = ... // COMENTADO
// const RealTimeStreamingService = ... // COMENTADO
// app.use('/api/old-route', ...) // COMENTADO
```

**DESPUÉS**: ~300 líneas (sin comentados)
```javascript
// Solo código activo
// Sin legacy comentado
// Imports organizados
```

### 4. BACKEND: Prompts como JSON
**ANTES**: 10 archivos `prompts/neura-ceo.js`
```javascript
module.exports = {
  systemPrompt: "Eres CEO...",
  name: "NEURA CEO"
};
```

**DESPUÉS**: 1 archivo `config/neura-prompts.json`
```json
{
  "a-ceo-01": {
    "name": "NEURA CEO",
    "systemPrompt": "Eres CEO...",
    "model": "mistral-medium-3.1",
    "temperature": 0.7
  }
}
```

**Ventaja**: Fácil editar prompts sin tocar código

### 5. FRONTEND: Organizar por features
**ANTES**:
```
src/components/Login.tsx
src/components/ChatInterface.tsx
src/components/DocumentUpload.tsx
```

**DESPUÉS**:
```
src/features/auth/Login.tsx
src/features/chat/ChatInterface.tsx
src/features/library/DocumentUpload.tsx
```

**Ventaja**: Cada feature es autocontenida

### 6. NUEVO: Documentación completa
**Crear**:
- `docs/architecture/` - Arquitectura técnica
- `docs/api/` - API documentation
- `docs/deployment/` - Guías deployment
- `docs/guides/` - Tutoriales
- `docs/compliance/` - GDPR, AI Act

### 7. NUEVO: Scripts automatización
**Crear**:
- `scripts/setup-local.ps1` - Setup 1-click local
- `scripts/deploy-azure.ps1` - Deploy manual
- `scripts/test-all.ps1` - Run todos los tests
- `scripts/monitor-costs.ps1` - Ver costos Azure real-time

### 8. NUEVO: Azure IaC (Infrastructure as Code)
**Crear**:
- `azure/bicep/main.bicep` - Definir TODA la infra Azure
- Beneficio: Recrear entorno completo con 1 comando

---

## 📊 COMPARATIVA TAMAÑO

| Aspecto | Actual | Ideal | Diferencia |
|---------|--------|-------|------------|
| Archivos backend | 76 | ~50 | -26 (eliminamos legacy) |
| Líneas server.js | 542 | ~300 | -242 (limpiamos comentados) |
| Archivos prompts | 10 .js | 1 .json | -9 (consolidamos) |
| Documentación | 0 docs/ | ~20 archivos | +20 (profesional) |
| Scripts | 3 dispersos | 5 en scripts/ | +2 (organizados) |
| Azure IaC | 0 | 5 .bicep | +5 (reproducible) |

---

## 🎯 VENTAJAS ESTRUCTURA IDEAL

### Para Desarrollo
✅ Código organizado por responsabilidad
✅ Fácil encontrar archivos (por feature)
✅ Database selector automático
✅ Sin código legacy confuso

### Para Mantenimiento
✅ Prompts editables sin tocar código
✅ Scripts automatizados (no manual)
✅ Documentación completa
✅ IaC (recrear Azure en 1 comando)

### Para Azure
✅ Optimizado para App Service
✅ Cosmos DB como opción (FREE tier)
✅ Bicep files para reproducir infra
✅ Monitoring integrado

### Para Nuevos Devs
✅ README claro
✅ docs/ completo
✅ Setup local 1-click
✅ Estructura lógica

---

## ⏱️ ESFUERZO DE REORGANIZACIÓN

### Opción 1: Reorganización COMPLETA
- **Tiempo**: 4-6 horas
- **Riesgo**: Medio (hay que re-testear TODO)
- **Resultado**: Monorepo 10/10 perfecto

### Opción 2: Reorganización BÁSICA
- **Tiempo**: 1-2 horas
- **Riesgo**: Bajo
- **Resultado**: Monorepo 7/10 (limpio pero no perfecto)
- **Cambios**:
  1. Limpiar server.js (quitar comentados)
  2. Crear docs/ básico
  3. Crear scripts/ básico
  4. Actualizar README
  5. **NO** reorganizar carpetas (dejar como está)

### Opción 3: Solo MIGRACIÓN (Más rápido)
- **Tiempo**: 30 minutos
- **Riesgo**: Muy bajo
- **Resultado**: Monorepo 5/10 (funcional pero legacy)
- **Cambios**:
  1. Copiar todo tal cual
  2. Limpiar temporales
  3. Actualizar README
  4. **NO** reorganizar nada

---

## ❓ TU DECISIÓN

**¿Qué opción prefieres?**
- [ ] **Opción 1**: Reorganización COMPLETA (4-6h) → Monorepo 10/10
- [ ] **Opción 2**: Reorganización BÁSICA (1-2h) → Monorepo 7/10 ⭐ RECOMIENDO
- [ ] **Opción 3**: Solo MIGRACIÓN (30min) → Monorepo 5/10

**¿Qué cambios específicos quieres?**
- [ ] Consolidar database (index.js selector automático)
- [ ] Limpiar server.js (quitar 200+ líneas comentadas)
- [ ] Prompts como JSON (fácil editar)
- [ ] Crear docs/ completo
- [ ] Crear scripts/ automatización
- [ ] Reorganizar frontend por features
- [ ] Azure Bicep (IaC)
- [ ] Todos los anteriores

**Cuando me des el OK, creo el plan de tareas paso a paso.**

