# 🔥 PLAN DE REORGANIZACIÓN TOTAL - MONOREPO ECONEURA

**Objetivo**: Estructura perfecta para Azure + GitHub Actions
**Nuevo repo**: https://github.com/ECONEURA-MAX/ECONEURA-.git
**Principio**: Azure-first, clean code, zero bloat

---

## 📊 ESTRUCTURA ACTUAL (PROBLEMAS DETECTADOS)

```
ECONEURA-PERFECTO/
├── backend/                           ❌ Mezclado con código legacy
│   ├── api/                          ⚠️  Mezcla de routes y api
│   ├── routes/                       ⚠️  Duplicado con api/
│   ├── services/                     ✅ OK
│   ├── middleware/                   ✅ OK
│   ├── config/                       ✅ OK
│   ├── db.js + db-mock.js           ⚠️  Confuso (dos archivos)
│   └── prompts/                      ⚠️  Debería ser JSON/config
├── frontend/                          ⚠️  Estructura OK pero puede mejorar
├── .github/workflows/                ✅ OK
└── docs/                             ❌ Falta documentación centralizada
```

**Problemas**:
1. ❌ `api/` y `routes/` mezclados (confuso)
2. ❌ `db.js` y `db-mock.js` separados (debería ser un módulo)
3. ❌ Prompts como `.js` (deberían ser configuración)
4. ❌ Código legacy comentado en `server.js`
5. ❌ Falta documentación de arquitectura
6. ❌ Scripts de deploy dispersos

---

## ✅ ESTRUCTURA IDEAL (AZURE-FIRST)

```
ECONEURA/
├── README.md                          ✨ Principal del proyecto
├── .gitignore                         ✨ Actualizado
├── azure-pipelines.yml                ✨ CI/CD Azure DevOps (opcional)
│
├── backend/                           🎯 API Node.js
│   ├── src/                          ✨ NUEVO: Todo el código fuente aquí
│   │   ├── api/                      → Endpoints HTTP (Express routes)
│   │   │   ├── health.js
│   │   │   ├── agents.js
│   │   │   ├── library.js
│   │   │   ├── metrics.js
│   │   │   └── proposals.js
│   │   │
│   │   ├── routes/                   → Business logic routes
│   │   │   ├── auth.js
│   │   │   ├── chat.js
│   │   │   ├── invoke.js
│   │   │   ├── ai-gateway.js
│   │   │   ├── neura-agents.js
│   │   │   ├── neura-chat-enhanced.js
│   │   │   ├── integration.js
│   │   │   └── agent.js
│   │   │
│   │   ├── services/                 → Business services
│   │   │   ├── database/             ✨ NUEVO: DB abstraction
│   │   │   │   ├── index.js         → Selector (Cosmos/Postgres/Mock)
│   │   │   │   ├── cosmosdb.js      → Azure Cosmos DB
│   │   │   │   ├── postgresql.js    → Azure PostgreSQL
│   │   │   │   └── mock.js          → Mock para desarrollo
│   │   │   │
│   │   │   ├── ai/                   ✨ NUEVO: AI services
│   │   │   │   ├── gateway.js       → ResilientAIGateway
│   │   │   │   ├── openai.js
│   │   │   │   └── analysis.js      → NeuraAnalysisService
│   │   │   │
│   │   │   ├── auth/                 ✨ NUEVO: Auth services
│   │   │   │   ├── jwt.js
│   │   │   │   ├── tokenStore.js
│   │   │   │   └── oauth.js
│   │   │   │
│   │   │   ├── azure/                ✨ NUEVO: Azure services
│   │   │   │   ├── keyvault.js
│   │   │   │   ├── storage.js
│   │   │   │   └── monitoring.js
│   │   │   │
│   │   │   ├── logger.js
│   │   │   ├── neuraAgentExecutor.js
│   │   │   └── makeService.js
│   │   │
│   │   ├── middleware/               → Express middleware
│   │   │   ├── auth.js
│   │   │   ├── rateLimiter.js
│   │   │   ├── validation.js
│   │   │   ├── errorHandler.js      ✨ NUEVO
│   │   │   ├── securityHeaders.js
│   │   │   ├── requestId.js
│   │   │   └── cacheHeaders.js
│   │   │
│   │   ├── config/                   → Configuration
│   │   │   ├── index.js             ✨ NUEVO: Config centralizado
│   │   │   ├── azure.js             ✨ NUEVO: Azure config
│   │   │   ├── database.js
│   │   │   ├── redis.js
│   │   │   ├── auth.js
│   │   │   └── envValidation.js
│   │   │
│   │   ├── utils/                    → Utilities
│   │   │   ├── retry.js
│   │   │   ├── errorHandler.js
│   │   │   └── constants.js         ✨ NUEVO
│   │   │
│   │   └── server.js                 → Entry point
│   │
│   ├── config/                        ✨ NUEVO: Config files (JSON)
│   │   ├── agents.json               → Agent configs
│   │   ├── neura-agents-map.json
│   │   └── prompts.json              ✨ NUEVO: Prompts como JSON
│   │
│   ├── tests/                         → Unit tests
│   │   ├── api/
│   │   ├── services/
│   │   └── middleware/
│   │
│   ├── .env.example                   → Template env vars
│   ├── .env.development               ✨ NUEVO: Dev env
│   ├── package.json
│   ├── package-lock.json
│   └── README.md                      → Backend docs
│
├── frontend/                          🎯 React App
│   ├── src/
│   │   ├── components/               → React components
│   │   ├── pages/                    → React pages
│   │   ├── services/                 → API clients
│   │   ├── hooks/                    → Custom hooks
│   │   ├── contexts/                 → React contexts
│   │   ├── utils/                    → Utilities
│   │   ├── assets/                   → Images, fonts
│   │   ├── styles/                   → CSS/SCSS
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── public/                       → Static assets
│   ├── .env.example
│   ├── .env.development              ✨ NUEVO
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── README.md
│
├── .github/                           🎯 CI/CD
│   ├── workflows/
│   │   ├── backend-deploy.yml       → Deploy backend a Azure
│   │   ├── frontend-deploy.yml      → Deploy frontend a Azure
│   │   ├── tests.yml                ✨ NUEVO: Run tests
│   │   └── security-scan.yml        ✨ NUEVO: Security
│   │
│   └── PULL_REQUEST_TEMPLATE.md     ✨ NUEVO
│
├── docs/                              ✨ NUEVO: Documentación
│   ├── ARCHITECTURE.md               → Arquitectura Azure
│   ├── API.md                        → API documentation
│   ├── DEPLOYMENT.md                 → Deployment guide
│   ├── DEVELOPMENT.md                → Setup local
│   └── VARIABLES.md                  → Env vars explicadas
│
├── scripts/                           ✨ NUEVO: Scripts útiles
│   ├── setup-local.ps1               → Setup desarrollo local
│   ├── deploy-azure.ps1              → Deploy manual a Azure
│   ├── test-all.ps1                  → Run all tests
│   └── cleanup.ps1                   → Limpiar archivos temp
│
└── azure/                             ✨ NUEVO: IaC Azure
    ├── bicep/                        → Infrastructure as Code
    │   ├── main.bicep                → Definición completa
    │   ├── backend.bicep             → App Service
    │   ├── frontend.bicep            → Static Web App
    │   └── database.bicep            → Cosmos DB
    │
    └── arm-templates/                → ARM templates (alternativa)
```

---

## 🔧 CAMBIOS ESPECÍFICOS A REALIZAR

### 1. BACKEND: Reorganizar código

```powershell
# Crear estructura src/
mkdir backend/src
mkdir backend/src/services/database
mkdir backend/src/services/ai
mkdir backend/src/services/auth
mkdir backend/src/services/azure

# Mover archivos a src/
Move-Item backend/*.js backend/src/
Move-Item backend/api backend/src/
Move-Item backend/routes backend/src/
Move-Item backend/services backend/src/
Move-Item backend/middleware backend/src/
Move-Item backend/config backend/src/
Move-Item backend/utils backend/src/

# Mover server.js a raíz backend/
Move-Item backend/src/server.js backend/

# Consolidar DB en un módulo
# Crear backend/src/services/database/index.js que selecciona Cosmos/Postgres/Mock
```

### 2. BACKEND: Consolidar database

**Crear**: `backend/src/services/database/index.js`
```javascript
// Selector automático de base de datos
const env = process.env;

let db;
if (env.USE_COSMOS_DB === 'true') {
  db = require('./cosmosdb');
} else if (env.USE_MOCK_DB === 'true') {
  db = require('./mock');
} else if (env.DATABASE_URL) {
  db = require('./postgresql');
} else {
  db = require('./mock'); // Fallback
}

module.exports = db;
```

### 3. BACKEND: Limpiar server.js

**Eliminar**:
- ❌ Código legacy comentado (200+ líneas)
- ❌ Routers no usados
- ❌ Servicios comentados

**Resultado**: server.js de 300 líneas (vs 542 actual)

### 4. BACKEND: Convertir prompts a JSON

**Crear**: `backend/config/prompts.json`
```json
{
  "a-ceo-01": {
    "name": "NEURA CEO",
    "systemPrompt": "Eres el CEO de ECONEURA...",
    "temperature": 0.7,
    "maxTokens": 1500
  },
  ...
}
```

**Eliminar**: 10 archivos `prompts/*.js`

### 5. FRONTEND: Organizar por features

```
frontend/src/
├── features/                ✨ NUEVO
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── useAuth.ts
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageList.tsx
│   │   └── useChat.ts
│   ├── library/
│   │   ├── DocumentUpload.tsx
│   │   └── DocumentList.tsx
│   └── neura/
│       ├── NeuraSelector.tsx
│       └── useNeura.ts
│
├── shared/                  ✨ NUEVO: Componentes reutilizables
│   ├── Button.tsx
│   ├── Modal.tsx
│   └── Loading.tsx
│
└── config/
    └── api.ts               ✨ NUEVO: API configuration
```

### 6. DOCS: Documentación completa

**Crear**:
- `docs/ARCHITECTURE.md` - Arquitectura Azure
- `docs/API.md` - Endpoints documentados
- `docs/DEPLOYMENT.md` - Guía deployment
- `docs/DEVELOPMENT.md` - Setup local
- `docs/VARIABLES.md` - Todas las env vars

### 7. SCRIPTS: Automatización

**Crear**:
- `scripts/setup-local.ps1` - Setup completo local
- `scripts/deploy-azure.ps1` - Deploy manual
- `scripts/test-all.ps1` - Run tests
- `scripts/cleanup.ps1` - Limpiar temporales

---

## 🎯 BENEFICIOS DE LA REORGANIZACIÓN

### Antes (ECONEURA-PERFECTO)
❌ Código mezclado (api/ y routes/ duplicados)
❌ 542 líneas server.js (200+ comentadas)
❌ DB confuso (db.js vs db-mock.js)
❌ Prompts como código JS (difícil mantener)
❌ Sin documentación centralizada
❌ Scripts dispersos

### Después (ECONEURA-)
✅ Código organizado por features
✅ 300 líneas server.js (limpio)
✅ DB como módulo (selector automático)
✅ Prompts como JSON (fácil editar)
✅ Documentación completa en docs/
✅ Scripts centralizados en scripts/

---

## 📋 TAREAS DE REORGANIZACIÓN (30 tareas)

### GRUPO A: ESTRUCTURA (10 tareas)
1. [ ] Crear estructura nueva ECONEURA/
2. [ ] Crear backend/src/ y subdirectorios
3. [ ] Crear frontend features/
4. [ ] Crear docs/
5. [ ] Crear scripts/
6. [ ] Crear azure/bicep/
7. [ ] Actualizar README.md principal
8. [ ] Crear .gitignore optimizado
9. [ ] Crear .env.example (backend + frontend)
10. [ ] Estructura completa creada ✅

### GRUPO B: BACKEND REFACTOR (10 tareas)
11. [ ] Consolidar database module
12. [ ] Limpiar server.js (eliminar legacy)
13. [ ] Convertir prompts a JSON
14. [ ] Reorganizar services/ en subdirectorios
15. [ ] Crear errorHandler centralizado
16. [ ] Actualizar imports en todos los archivos
17. [ ] Optimizar para Azure App Service
18. [ ] Agregar web.config para Azure
19. [ ] Tests actualizados
20. [ ] Backend refactorizado ✅

### GRUPO C: FRONTEND REFACTOR (5 tareas)
21. [ ] Reorganizar por features
22. [ ] Crear shared components
23. [ ] Centralizar API config
24. [ ] Optimizar para Static Web Apps
25. [ ] Frontend refactorizado ✅

### GRUPO D: DOCUMENTACIÓN (5 tareas)
26. [ ] Crear docs/ARCHITECTURE.md
27. [ ] Crear docs/API.md
28. [ ] Crear docs/DEPLOYMENT.md
29. [ ] Crear docs/DEVELOPMENT.md
30. [ ] Documentación completa ✅

---

## ⏱️ TIEMPO ESTIMADO

- Reorganización: 2-3 horas
- Refactoring backend: 2-3 horas
- Refactoring frontend: 1-2 horas
- Documentación: 1 hora
- Testing: 1 hora

**TOTAL: 7-10 horas**

---

**PLAN DE REORGANIZACIÓN CREADO**
**Resultado**: Monorepo Azure-first, clean, documentado
**Siguiente**: Ejecutar reorganización

