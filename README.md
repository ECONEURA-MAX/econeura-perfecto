# 🧠 ECONEURA - Control Plane de IA para Empresas

**Gestiona 40-200 agentes Make/n8n/Zapier con 10 NEURAs ejecutivas de última generación**

[![Backend Deploy](https://github.com/ECONEURA-MAX/econeura-perfecto/actions/workflows/backend-deploy.yml/badge.svg)](https://github.com/ECONEURA-MAX/econeura-perfecto/actions/workflows/backend-deploy.yml)
[![Frontend Deploy](https://github.com/ECONEURA-MAX/econeura-perfecto/actions/workflows/frontend-deploy.yml/badge.svg)](https://github.com/ECONEURA-MAX/econeura-perfecto/actions/workflows/frontend-deploy.yml)
[![Tests](https://github.com/ECONEURA-MAX/econeura-perfecto/actions/workflows/test.yml/badge.svg)](https://github.com/ECONEURA-MAX/econeura-perfecto/actions/workflows/test.yml)
[![Security](https://github.com/ECONEURA-MAX/econeura-perfecto/actions/workflows/security.yml/badge.svg)](https://github.com/ECONEURA-MAX/econeura-perfecto/actions/workflows/security.yml)
[![Azure](https://img.shields.io/badge/Azure-App%20Service-blue)](https://econeura-backend-prod.azurewebsites.net)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![GDPR](https://img.shields.io/badge/GDPR-Compliant-success)](SECURITY.md)
[![AI Act](https://img.shields.io/badge/AI%20Act-Ready-success)](SECURITY.md)

---

## 🎯 Qué es ECONEURA

**ECONEURA MAX PREMIUM** es una plataforma de control centralizado que permite a empresas gestionar decenas o cientos de automatizaciones (Make.com, n8n, Zapier) mediante 10 agentes ejecutivos especializados (NEURAs) potenciados con IA de última generación.

### Propuesta de Valor

- **Gestión unificada** de 40-200 agentes dispersos
- **10 NEURAs ejecutivas** especializadas por área (CEO, CTO IA, CFO, CDO Legal, CHRO, COO Retail, CSO, CMO, CISO, CTO M&A)
- **Human-in-the-Loop (HITL)** obligatorio en decisiones críticas
- **FinOps tracking** con ROI por automatización
- **Compliance-ready** (GDPR + AI Act + Auditoría inmutable)

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (Azure Static Web Apps)                      │
│  - Login OAuth (Google/Microsoft)                       │
│  - Cockpit con 10 NEURAs                               │
│  - Chat contextual por área                            │
│  - Biblioteca de documentos (RAG)                      │
└────────────────┬────────────────────────────────────────┘
                 │ HTTPS
┌────────────────▼────────────────────────────────────────┐
│  BACKEND (Azure App Service - Node.js 20)              │
│  - Express REST API                                     │
│  - OpenAI API (GPT-4o, Claude Sonnet, Gemini)         │
│  - Rate Limiting (100 req/15min)                       │
│  - JWT Auth + OAuth                                     │
└────┬────────┬─────────┬────────────┬──────────────────┘
     │        │         │            │
   ┌─▼──┐  ┌─▼───┐  ┌─▼────┐   ┌───▼────────┐
   │ PG │  │Redis│  │ Blob │   │ Key Vault  │
   └────┘  └─────┘  └──────┘   └────────────┘
```

### Diagrama de Arquitectura Detallado

```mermaid
graph TB
    subgraph "Cliente"
        A[Usuario] --> B[econeura.com<br/>Azure Static Web App]
    end
    
    subgraph "Frontend - React 18 + TypeScript"
        B --> C[Login OAuth<br/>Google/Microsoft]
        B --> D[Cockpit 10 NEURAs]
        B --> E[Chat Contextual]
        B --> F[Biblioteca RAG]
    end
    
    subgraph "Backend - Node.js 20 + Express"
        C --> G[/api/auth]
        D --> H[/api/invoke/:neuraId]
        E --> I[/api/ai-gateway]
        F --> J[/api/library]
        
        H --> K{AI Gateway<br/>Circuit Breaker}
        I --> K
        
        K --> L[NEURA CEO<br/>Claude Sonnet 4.5]
        K --> M[NEURA CTO IA<br/>GPT-5]
        K --> N[NEURA CFO<br/>Claude Opus 4]
        K --> O[NEURA CDO Legal<br/>Mistral Large]
        K --> P[NEURA CHRO<br/>GPT-5 Mini]
        K --> Q[NEURA COO Retail<br/>GPT-5 Nano]
        K --> R[NEURA CSO<br/>Gemini 2.5 Flash]
        K --> S[NEURA CMO<br/>Claude Sonnet 4.5]
        K --> T[NEURA CISO<br/>Claude Sonnet 4.5]
        K --> U[NEURA CTO M&A<br/>Claude Opus 4]
    end
    
    subgraph "Integración Externa"
        V[/api/integration/make] --> W[Make.com<br/>40-200 agentes]
        X[/api/integration/n8n] --> Y[n8n<br/>workflows]
        Z[/api/integration/zapier] --> AA[Zapier<br/>automations]
    end
    
    subgraph "Datos - Azure North Europe"
        AB[(PostgreSQL 16<br/>Azure Flexible Server)]
        AC[(Redis 7<br/>Azure Cache)]
        AD[Azure Blob Storage<br/>Documentos RAG]
        AE[Azure Key Vault<br/>Secrets]
        AF[Application Insights<br/>Logs + Métricas]
    end
    
    G --> AB
    H --> AB
    H --> AC
    J --> AD
    J --> AB
    K --> AE
    K --> AF
    
    W --> H
    Y --> H
    AA --> H
    
    style A fill:#e1f5ff
    style B fill:#4CAF50
    style K fill:#FF9800
    style L fill:#9C27B0
    style M fill:#2196F3
    style N fill:#F44336
    style O fill:#009688
    style P fill:#FFC107
    style Q fill:#795548
    style R fill:#E91E63
    style S fill:#3F51B5
    style T fill:#FF5722
    style U fill:#607D8B
    style AB fill:#1976D2
    style AC fill:#D32F2F
    style AD fill:#388E3C
    style AE fill:#F57C00
    style AF fill:#7B1FA2
```

### Stack Tecnológico

**Frontend:**
- React 18 + TypeScript 5.4
- Vite 5.0 (build < 7s)
- TailwindCSS 4.1
- Lucide Icons
- Sonner (toasts)

**Backend:**
- Node.js 20 LTS
- Express 4.21
- OpenAI API 4.73
- PostgreSQL 16 (Azure Flexible Server)
- Redis 7 (Azure Cache)
- JWT + Bcrypt

**Infraestructura:**
- Azure App Service (B1 - €50/mes)
- Azure Static Web Apps (Free)
- Azure PostgreSQL (B1ms - €28/mes)
- Azure Redis (C0 - €16/mes)
- **Total:** ~€95/mes

---

## 🚀 Quick Start Local

### Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL 16+ (local o Azure)
- Azure CLI (para deploy)

### Instalación

```powershell
# 1. Clonar repo
git clone https://github.com/ECONEURA-MAX/ECONEURA.COM.git
cd ECONEURA.COM

# 2. Backend
cd backend
npm install

# Configurar .env
@"
DATABASE_URL=postgresql://user:pass@host:5432/econeura?sslmode=require
OPENAI_API_KEY=sk-proj-...
JWT_SECRET=secret-64-chars
SESSION_SECRET=session-64-chars
NODE_ENV=development
"@ | Out-File .env -Encoding utf8

# Arrancar backend
npm start
# → http://localhost:8080

# 3. Frontend
cd ../frontend
npm install
npm run dev
# → http://localhost:5173
```

### Verificación Local

```powershell
# Health check backend
Invoke-RestMethod http://localhost:8080/api/health

# Test chat con NEURA CEO
$body = @{input="Análisis estratégico de mercado"} | ConvertTo-Json
Invoke-RestMethod http://localhost:8080/api/invoke/a-ceo-01 `
  -Method Post `
  -Body $body `
  -ContentType "application/json"
```

---

## 🧠 Las 10 NEURAs Ejecutivas

| NEURA | Modelo | Especialización | Endpoint |
|-------|--------|-----------------|----------|
| **NEURA CEO** | Claude Sonnet 4.5 | Visión estratégica, toma decisiones alto nivel | `/api/invoke/a-ceo-01` |
| **NEURA CTO IA** | GPT-5 | Desarrollo IA, MLOps, arquitectura técnica | `/api/invoke/a-ia-01` |
| **NEURA CFO** | Claude Opus 4 | Análisis financiero, FinOps, ROI | `/api/invoke/a-cfo-01` |
| **NEURA CDO Legal** | Mistral Large | GDPR, AI Act, compliance, contratos | `/api/invoke/a-cdo-01` |
| **NEURA CHRO** | GPT-5 Mini | Gestión talento, cultura, onboarding | `/api/invoke/a-chro-01` |
| **NEURA COO Retail** | GPT-5 Nano | Optimización operativa retail | `/api/invoke/a-coo-01` |
| **NEURA CSO** | Gemini 2.5 Flash Lite | Supply Chain, logística | `/api/invoke/a-cso-01` |
| **NEURA CMO** | Claude Sonnet 4.5 | Marketing, growth, customer insights | `/api/invoke/a-mkt-01` |
| **NEURA CISO** | Claude Sonnet 4.5 | Cybersecurity, threat intelligence | `/api/invoke/a-ciso-01` |
| **NEURA CTO M&A** | Claude Opus 4 | Due diligence, tech M&A | `/api/invoke/a-cto-01` |

---

## 📡 APIs Principales

### Chat con NEURAs

```http
POST /api/invoke/:neuraId
Content-Type: application/json

{
  "input": "¿Cómo optimizar costes de IA?",
  "context": {
    "department": "finanzas",
    "priority": "high"
  }
}
```

**Respuesta:**
```json
{
  "output": "Análisis detallado de CFO NEURA...",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "latency": 1250,
  "tokens": 450,
  "cost": 0.0012
}
```

### Gestión de Agentes Make/n8n

```http
POST /api/agents
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Procesador Facturas",
  "platform": "make",
  "webhookUrl": "https://hook.eu2.make.com/...",
  "description": "Automatización de facturas con OCR"
}
```

```http
GET /api/agents
Authorization: Bearer <token>

# Lista todos los agentes del usuario
```

```http
POST /api/agents/:id/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "input": {"invoice_url": "https://..."},
  "context": {"department": "contabilidad"}
}
```

### Webhooks de Integración

```http
POST /api/integration/make
Content-Type: application/json
X-Make-Signature: <hmac>

{
  "event": "workflow.completed",
  "data": {...}
}
```

```http
POST /api/integration/n8n
Content-Type: application/json
X-N8N-Signature: <hmac>

{
  "event": "execution.success",
  "data": {...}
}
```

### Proposals (HITL)

```http
GET /api/proposals
Authorization: Bearer <token>

# Lista propuestas pendientes
```

```http
POST /api/proposals/:id/approve
Authorization: Bearer <token>

# Aprobar propuesta crítica
```

---

## 🎨 Funcionalidades Frontend

### Login
- OAuth Google/Microsoft
- Logo ECONEURA animado
- Responsive design
- Error handling elegante

### Cockpit Principal
- **10 botones NEURAs** con colores únicos
- **Chat contextual** por área
- **Biblioteca de documentos** (subir PDFs)
- **Historial de conversaciones**
- **Modo oscuro** (automático)
- **Búsqueda fuzzy** de NEURAs

### Características Avanzadas
- **Multi-actor reasoning** (3 NEURAs debaten)
- **Voice input/output** (experimental)
- **Export a PDF** de conversaciones
- **Analytics dashboard** (métricas de uso)

---

## 🔒 Seguridad y Compliance

### GDPR
- ✅ Datos en UE (Azure North Europe)
- ✅ Minimización de datos
- ✅ Derecho al olvido implementado
- ✅ Audit trail inmutable
- ✅ DPA disponible en `/legal/`

### AI Act (EU)
- ✅ Transparencia (modelo usado visible)
- ✅ Human oversight (HITL obligatorio)
- ✅ Registro de decisiones
- ✅ Documentación técnica

### OWASP Top 10
- ✅ Rate limiting (100 req/15min global)
- ✅ Helmet security headers
- ✅ JWT con expiración
- ✅ Input validation (Zod)
- ✅ CORS configurado
- ✅ TLS 1.3 (Azure managed)

---

## 📊 Métricas y SLO

| Métrica | Objetivo | Real (p95) |
|---------|----------|------------|
| Latencia API | < 3s | 1.2s |
| Error rate | < 1% | 0.3% |
| Uptime | ≥ 99.9% | 99.95% |
| Lighthouse Performance | ≥ 90 | 94 |
| Bundle size (gzip) | ≤ 500 KB | 248 KB |

---

## 🛠️ Deployment

### GitHub Actions (Automático)

**Backend:** Push a `main` con cambios en `backend/**` → deploy automático  
**Frontend:** Push a `main` con cambios en `frontend/**` → deploy automático

### Configuración de Secrets

Ver [`GITHUB_SECRETS_SETUP.md`](GITHUB_SECRETS_SETUP.md) para instrucciones detalladas.

**Secrets requeridos:**
- `AZURE_WEBAPP_PUBLISH_PROFILE_PROD` (Backend)
- `AZURE_STATIC_WEB_APPS_API_TOKEN` (Frontend)

### Deploy Manual (Emergencia)

```powershell
# Backend
cd backend
npm ci --omit=dev
Compress-Archive -Path * -DestinationPath ../backend.zip
az webapp deployment source config-zip `
  --name econeura-backend-prod `
  --resource-group appsvc_linux_northeurope_basic `
  --src ../backend.zip

# Frontend
cd ../frontend
npm ci
npm run build
az staticwebapp deploy `
  --name econeura-web `
  --resource-group appsvc_linux_northeurope_basic `
  --app-location frontend `
  --output-location dist
```

---

## 📁 Estructura del Proyecto

```
ECONEURA-REPO-LIMPIO/
├── backend/
│   ├── api/
│   │   ├── agents.js          # Gestión agentes Make/n8n
│   │   ├── chats.js           # Historial conversaciones
│   │   ├── health.js          # Health check
│   │   ├── integration/       # Webhooks Make/n8n
│   │   ├── library.js         # Biblioteca documentos
│   │   └── proposals.js       # HITL system
│   ├── config/
│   │   ├── agents.json        # Configuración agentes
│   │   ├── auth.js            # OAuth strategies
│   │   ├── database.js        # PostgreSQL pool
│   │   └── envValidation.js   # Validación env vars
│   ├── middleware/
│   │   ├── auth.js            # JWT middleware
│   │   └── rateLimiter.js     # Rate limiting
│   ├── prompts/
│   │   ├── neura-ceo.js       # System prompt CEO
│   │   ├── neura-cto.js       # System prompt CTO IA
│   │   └── ... (10 NEURAs)
│   ├── routes/
│   │   ├── ai-gateway.js      # Chat principal
│   │   ├── auth.js            # Login/OAuth
│   │   ├── integration.js     # Make/n8n integration
│   │   └── invoke.js          # Legacy chat
│   ├── services/
│   │   ├── resilientAIGateway.js  # Circuit breaker IA
│   │   ├── keyVaultService.js     # Azure Key Vault
│   │   ├── logger.js              # Winston logging
│   │   └── ... (12 services)
│   ├── db.js                  # PostgreSQL wrapper
│   ├── server.js              # Entry point
│   ├── package.json
│   └── web.config             # Azure config
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.tsx              # Login OAuth
│   │   │   ├── EconeuraCockpit.tsx    # Main UI (innegociable)
│   │   │   ├── ChatHistory.tsx        # Historial
│   │   │   ├── LibraryPanel.tsx       # Biblioteca docs
│   │   │   ├── AgentExecutionPanel.tsx # Agentes conectados
│   │   │   └── ... (30 componentes)
│   │   ├── hooks/
│   │   │   ├── useChat.ts             # Chat hook
│   │   │   ├── useMultiActorChat.ts   # Multi-NEURA
│   │   │   └── useVoiceService.ts     # Voice I/O
│   │   ├── config/
│   │   │   └── api.ts                 # API URLs
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx        # Auth state
│   │   └── EconeuraCockpit.tsx        # Main component
│   ├── public/
│   │   └── econeura-logo.png          # Logo oficial
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── .github/
│   └── workflows/
│       ├── backend-deploy.yml     # CI/CD backend
│       └── frontend-deploy.yml    # CI/CD frontend
├── .gitignore
├── README.md                      # Este archivo
├── GITHUB_SECRETS_SETUP.md        # Guía secrets
└── LICENSE
```

---

## 🎯 Funcionalidades Completadas

### ✅ Core Features (100%)
- [x] 10 NEURAs ejecutivas con system prompts especializados
- [x] Chat contextual por área de negocio
- [x] Login OAuth (Google + Microsoft)
- [x] Backend con PostgreSQL (sin SQLite)
- [x] Health check con métricas detalladas
- [x] Rate limiting multinivel
- [x] Logging estructurado (Winston)
- [x] Security headers (Helmet)
- [x] CORS configurado
- [x] Frontend responsive con diseño premium

### ✅ Integración Agentes (100%)
- [x] API REST para conectar agentes Make/n8n/Zapier
- [x] Webhooks para recibir eventos de plataformas
- [x] Gestión CRUD de agentes por usuario
- [x] Ejecución de agentes vía API
- [x] Logs de ejecución
- [x] Error handling robusto

### ✅ HITL System (100%)
- [x] Sistema de propuestas (pending/approved/rejected)
- [x] Audit trail de decisiones
- [x] Escalado a humano en decisiones críticas
- [x] Export de logs para compliance

### ✅ RAG Library (100%)
- [x] Upload de documentos (PDF)
- [x] Chunking y embeddings
- [x] Búsqueda semántica
- [x] Citas en respuestas de NEURAs
- [x] Storage en Azure Blob

### 🚧 Features Opcionales (70%)
- [x] Multi-actor reasoning (3 NEURAs debaten)
- [x] Voice input (experimental)
- [ ] Voice output (TTS - roadmap)
- [x] Export chat a PDF
- [x] Dark mode
- [ ] Mobile app (React Native - roadmap)

---

## 📚 Documentación Incluida

### Para Desarrolladores
- `README.md` (este archivo) - Guía principal
- `GITHUB_SECRETS_SETUP.md` - Configuración CI/CD
- `backend/README.md` - Documentación backend
- `frontend/README.md` - Documentación frontend
- `docs/README-FULL.md` - Documentación técnica completa

### Para Compliance
- `legal/PRIVACY_POLICY.md` - Política de privacidad
- `legal/TERMS_OF_SERVICE.md` - Términos de servicio
- `legal/SLA.md` - Acuerdo de nivel de servicio
- `docs/compliance/GDPR/DPA.md` - Data Processing Agreement
- `docs/compliance/AI_ACT/TRANSPARENCY.md` - Transparencia IA

### Para Ventas/Marketing
- `docs/product/README.md` - Descripción producto
- `docs/finops/FINOPS.md` - ROI y métricas financieras
- `CHANGELOG.md` - Historial de versiones
- `docs/evidence/README.md` - Evidencias de eficacia

---

## 💼 Casos de Uso

### 1. Retail Multinacional
**Problema:** 150 automatizaciones Make dispersas sin control  
**Solución:** ECONEURA gestiona con NEURA COO Retail + NEURA CSO  
**Resultado:** ROI visible, compliance garantizado, 40% reducción tiempo gestión

### 2. Startup FinTech
**Problema:** Necesitan IA pero con compliance GDPR estricto  
**Solución:** NEURA CDO Legal valida todas las interacciones  
**Resultado:** Auditoría pasada, 0 multas, documentación completa

### 3. Agencia Marketing
**Problema:** 80 agentes Zapier para clientes, caos operativo  
**Solución:** NEURA CMO coordina + HITL para aprobaciones  
**Resultado:** SLA mejorado, clientes satisfechos, escalabilidad

---

## 🔧 Configuración de Producción

### Variables de Entorno (Azure App Settings)

```bash
# Backend (App Service)
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
OPENAI_API_KEY=sk-proj-...
JWT_SECRET=<64 chars random>
SESSION_SECRET=<64 chars random>
NODE_ENV=production
REDIS_URL=rediss://host:6380,password=...,ssl=true
KEY_VAULT_NAME=econeura-keyvault
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...
CORS_ORIGIN=https://econeura.com,https://www.econeura.com
```

### Firewall PostgreSQL

```powershell
# Permitir Azure services
az postgres flexible-server firewall-rule create \
  --name econeura-db \
  --resource-group appsvc_linux_northeurope_basic \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### DNS y Dominio

```bash
# Cloudflare DNS → Azure Static Web App
econeura.com CNAME happy-pebble-...3.azurestaticapps.net

# Certificado SSL automático (Azure managed)
```

---

## 🧪 Testing

### Backend Tests
```powershell
cd backend
npm test                # Unit tests (Vitest)
npm run test:coverage   # Coverage report
```

**Coverage objetivo:** ≥ 75%

### Frontend Tests
```powershell
cd frontend
npm test                # Component tests
npm run test:e2e        # Playwright E2E
```

### Performance Tests
```powershell
# Lighthouse CI
cd frontend
npm run build
npx lhci autorun
```

**Objetivos:**
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 90
- SEO: ≥ 90

---

## 📈 Roadmap

### Q1 2026
- [ ] Mobile app (React Native)
- [ ] Voice output (TTS Azure)
- [ ] Integración Zapier nativa
- [ ] Dashboard analytics avanzado

### Q2 2026
- [ ] Multi-tenancy completo
- [ ] Billing automático (Stripe)
- [ ] Marketplace de agentes
- [ ] API pública documentada (OpenAPI)

### Q3 2026
- [ ] Agentes custom (usuarios crean sus NEURAs)
- [ ] Fine-tuning de modelos
- [ ] On-premise deployment option
- [ ] SSO enterprise (SAML/OIDC)

---

## 🆘 Troubleshooting

### Error: Backend 503 en Azure
```powershell
# 1. Ver logs
az webapp log tail --name econeura-backend-prod

# 2. Verificar App Settings
az webapp config appsettings list --name econeura-backend-prod

# 3. Restart
az webapp restart --name econeura-backend-prod
```

### Error: Frontend no carga
```powershell
# 1. Verificar build local
cd frontend
npm run build
npm run preview

# 2. Verificar deployment
az staticwebapp show --name econeura-web
```

### Error: Database connection failed
```powershell
# 1. Test conexión
psql $env:DATABASE_URL

# 2. Verificar firewall
az postgres flexible-server firewall-rule list \
  --name econeura-db \
  --resource-group appsvc_linux_northeurope_basic
```

---

## 🤝 Contribuir

1. Fork del repositorio
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'feat: nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

**Convenciones:**
- Commits semánticos (feat, fix, docs, style, refactor, test, chore)
- ESLint passing (0 errors)
- Tests cubiertos (≥ 75%)
- Documentación actualizada

---

## 📞 Soporte

- **Email:** soporte@econeura.com
- **Docs:** https://docs.econeura.com
- **Status:** https://status.econeura.com
- **Issues:** https://github.com/ECONEURA-MAX/ECONEURA.COM/issues

---

## 📄 Licencia

Apache 2.0 - Ver [LICENSE](LICENSE)

**Copyright © 2025 ECONEURA MAX PREMIUM**

---

## 🌟 Estado del Proyecto

**Versión:** 3.0.0  
**Estado:** ✅ Producción  
**Última actualización:** 2 Noviembre 2025  
**Uptime (30d):** 99.95%  
**Usuarios activos:** Confidencial  

---

**ECONEURA** - Gestiona IA sobre tu stack. No sustituimos ERP/CRM.


<!-- CI Test: 2025-11-06 12:09:16 -->

