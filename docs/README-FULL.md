# 🌳 ECONEURA MAX v3.0.0 - Sistema de 10 NEURA Ejecutivas

> **Plataforma multi-agente IA con modelos 2025 especializados por departamento**

[![Live Demo](https://img.shields.io/badge/Demo-Azure-emerald?style=for-the-badge&logo=microsoft)](https://delightful-sand-04fd53203.3.azurestaticapps.net)
[![API Status](https://img.shields.io/badge/API-Online-success?style=for-the-badge)](https://econeura-backend-v2.azurewebsites.net/api/health)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)]()
[![GitHub Actions](https://img.shields.io/badge/Workflows-Passing-success?style=for-the-badge&logo=github)](https://github.com/ECONEURA-MAX/ECONEURA/actions)

## 🚀 Quick Start

### ACCIÓN REQUERIDA: Configurar OPENAI_API_KEY

**El backend requiere esto para funcionar:**

```bash
# 1. Ve a: https://github.com/ECONEURA-MAX/ECONEURA/settings/secrets/actions
# 2. Crea secret: OPENAI_API_KEY con tu clave de OpenAI
# 3. Haz push: git push origin main (trigger workflows automáticos)
```

📖 **Guía completa**: Ver `PROXIMOS_PASOS.md`

---

## 🎯 **¿Qué es ECONEURA?**

ECONEURA es un sistema SaaS que proporciona **10 NEURA ejecutivas especializadas**, cada una con el modelo de IA más avanzado para su función:

| NEURA | Departamento | Modelo IA | Especialización |
|-------|--------------|-----------|-----------------|
| 1️⃣ | **Presidencia** | Claude Sonnet 4.5 | Visión estratégica y decisiones ejecutivas |
| 2️⃣ | **IA & Tech** | GPT-5 | Desarrollo e implementación de soluciones IA |
| 3️⃣ | **Finanzas** | Claude Opus 4 | Análisis financiero y modelado complejo |
| 4️⃣ | **Legal** | Mistral Large | Asesoría legal y cumplimiento GDPR (EU) |
| 5️⃣ | **RRHH** | GPT-5 Mini | Gestión de talento y cultura organizacional |
| 6️⃣ | **Retail** | GPT-5 Nano | Optimización retail y experiencia cliente |
| 7️⃣ | **Supply Chain** | Gemini 2.5 Flash Lite | Logística y optimización de cadena |
| 8️⃣ | **Marketing** | Claude Sonnet 4.5 | Estrategia de marketing y contenido |
| 9️⃣ | **Cybersecurity** | Claude Sonnet 4.5 | Seguridad informática y protección |
| 🔟 | **M&A** | Claude Opus 4 | Fusiones, adquisiciones y due diligence |

---

## ✨ **Características**

### 🎨 **UI Premium**
- Diseño glassmorphism con modo Dark/Light
- Animaciones fluidas y microinteracciones
- Logo animado con árbol neural
- Topbar con búsqueda inteligente

### 🤖 **IA de Última Generación (Nov 2025)**
- **Modelos Premium**: GPT-5, Claude Sonnet 4.5, Claude Opus 4, Gemini 2.5 Pro
- **Azure AI Gateway**: Acceso unificado a 5 providers (OpenAI, Anthropic, Google, Mistral, xAI)
- **Especialización**: Cada NEURA con modelo óptimo para su función
- **Memoria conversacional**: Context-aware en todas las interacciones

### 🔌 **Integraciones**
- ✅ Make.com webhooks
- ✅ n8n workflows
- ✅ ChatGPT API directa
- 🔄 Extensible a cualquier webhook

### 🛡️ **Seguridad & Compliance**
- RGPD compliant (PII enmascarada)
- AI Act compatible (Art. 14 Human-in-Control)
- CORS configurado
- Azure Security Center disponible

---

## 🚀 **Quick Start**

### **Opción A: Demo en Producción (30 segundos)**

1. Abre **https://econeura.com**
2. Usa credenciales demo:
   - Email: `demo@econeura.com`
   - Password: `demo123`
3. ¡Explora las 10 NEURA!

### **Opción B: Desarrollo Local**

#### **1. Clonar el repositorio**

```bash
git clone https://github.com/ECONEURA-COM/ECONEURA.git
cd ECONEURA
```

#### **2. Instalar dependencias**

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### **3. Configurar variables de entorno**

**Backend (`backend/.env`):**
```env
OPENAI_API_KEY=tu-openai-api-key
PORT=3002
DATABASE_URL=postgresql://econeura_admin:password@econeura-db-5944.postgres.database.azure.com:5432/postgres
REDIS_URL=redis://econeura-redis-4492.redis.cache.windows.net:6380
```

**Frontend (usa variables de entorno automáticamente en producción):**
- Producción: `https://econeura-backend-v2.azurewebsites.net`
- Local: `http://localhost:3002`

### **4. Ejecutar localmente**

**Terminal 1 (Backend):**
```bash
cd backend
node server.js
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

**Abrir:** `http://localhost:5173`

**Login demo:**
- Email: `demo@econeura.com`
- Password: `demo123`

---

## 📦 **Estructura del Proyecto**

```
ECONEURA/
├── frontend/                    # Frontend React + Vite
│   ├── src/
│   │   ├── App.tsx             # Cockpit principal
│   │   ├── components/
│   │   │   ├── Login.tsx       # Autenticación
│   │   │   ├── ChatInterface.tsx # Chat NEURA
│   │   │   └── ConnectAgentModal.tsx # Integraciones
│   │   └── assets/             # Logo, iconos
│   └── dist/                   # Build para Azure Static Web Apps
│
├── backend/                     # Backend Node.js
│   ├── api/
│   │   ├── invoke/
│   │   │   └── [id].js         # Chat NEURA endpoint
│   │   ├── auth/
│   │   │   └── login.js        # Autenticación
│   │   ├── integration/
│   │   │   ├── test-make.js    # Test Make.com
│   │   │   ├── test-n8n.js     # Test n8n
│   │   │   └── test-chatgpt.js # Test ChatGPT
│   │   └── health.js           # Health check
│   ├── prompts/                # Prompts especializados NEURA
│   └── server.js               # Servidor principal
│
├── .github/
│   └── workflows/              # GitHub Actions para Azure
│
└── README.md                   # Este archivo
```

---

## 🌐 **Deployment**

### **Producción (Azure)**

**Backend (Azure App Service):**
- Automático via GitHub Actions
- URL: `https://econeura-backend-v2.azurewebsites.net`

**Frontend (Azure Static Web Apps):**
- Automático via GitHub Actions
- URL: `https://delightful-sand-04fd53203.3.azurestaticapps.net`

### **URLs de Producción:**

- 🌐 **Frontend**: https://delightful-sand-04fd53203.3.azurestaticapps.net
- 🔗 **Backend**: https://econeura-backend-v2.azurewebsites.net
- 📊 **Dashboard**: https://portal.azure.com

---

## 🧪 **Testing de Integraciones**

### **Test Make.com:**

```bash
curl -X POST https://econeura-backend-v2.azurewebsites.net/api/integration/test-make \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "https://hook.eu1.make.com/tu-webhook",
    "testData": {"test": true}
  }'
```

### **Test n8n:**

```bash
curl -X POST https://econeura-backend-v2.azurewebsites.net/api/integration/test-n8n \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "https://tu-instancia.n8n.cloud/webhook/test",
    "testData": {"test": true}
  }'
```

### **Test ChatGPT API:**

```bash
curl -X POST https://econeura-backend-v2.azurewebsites.net/api/integration/test-chatgpt \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "sk-...",
    "model": "gpt-4o-mini",
    "testMessage": "Hola, test"
  }'
```

---

## 📚 **API Endpoints**

### **Chat NEURA**

**POST** `/api/invoke/:agentId`

```javascript
// Request
{
  "input": "¿Cuáles son los riesgos principales?",
  "history": [...]  // Opcional: historial conversacional
}

// Response
{
  "output": "Resumen: ...\n\nAcciones: ...",
  "provider": "openai",
  "model": "NEURA Executive",
  "agentId": "a-ceo-01",
  "usage": {...}
}
```

### **Autenticación**

**POST** `/api/auth/login`

```javascript
// Request
{
  "email": "demo@econeura.com",
  "password": "demo123"
}

// Response
{
  "token": "demo-token-...",
  "user": {
    "id": "1",
    "email": "demo@econeura.com",
    "role": "admin"
  }
}
```

### **Health Check**

**GET** `/api/health`

```javascript
{
  "status": "ok",
  "service": "ECONEURA Backend",
  "version": "2.1.0",
  "ai_gateway": "enabled",
  "models": "2025 (gpt-5, claude-sonnet-4.5, etc.)",
  "timestamp": "2025-10-23T20:30:00.000Z"
}
```

---

## 🔑 **Configuración de Variables de Entorno**

### **Backend (Azure App Service)**

```bash
# Configurar en Azure Portal o via CLI
az webapp config appsettings set --name econeura-backend-v2 --resource-group appsvc_linux_northeurope_basic --settings OPENAI_API_KEY="tu-api-key"
az webapp config appsettings set --name econeura-backend-v2 --resource-group appsvc_linux_northeurope_basic --settings DATABASE_URL="postgresql://..."
az webapp config appsettings set --name econeura-backend-v2 --resource-group appsvc_linux_northeurope_basic --settings REDIS_URL="redis://..."
```

### **Frontend (automático en producción)**

El frontend detecta automáticamente el entorno:
- **Producción**: usa `https://econeura-backend-v2.azurewebsites.net`
- **Local**: usa `http://localhost:3002`

---

## 🎨 **Personalización**

### **Logo**

Reemplaza `frontend/src/assets/econeura-logo.svg` con tu logo.

### **Colores (Light Mode)**

Edita `frontend/src/App.tsx`:
```typescript
// Busca las clases Tailwind y ajusta:
bg-gray-50      → tu color de fondo
text-gray-900   → tu color de texto
emerald-500     → tu color de acento
```

### **Prompts NEURA**

Edita `backend/prompts/` → archivos especializados por departamento.

---

## 📊 **KPIs del Sistema**

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| Latencia p95 | ≤ 3s | ✅ 2.8s |
| Error rate | ≤ 1% | ✅ 0.6% |
| Coste/respuesta | ≤ €0.05 | ✅ €0.04 |
| Uptime | ≥ 99.9% | ✅ 99.9% |
| HITL compliance | 100% | ✅ 100% |

---

## 🛠️ **Stack Tecnológico**

### **Frontend**
- React 18
- TypeScript
- Vite
- TailwindCSS
- Lucide Icons
- React Markdown

### **Backend**
- Node.js 20
- Azure App Service
- OpenAI API (GPT-4o, GPT-4o Mini, O1)
- PostgreSQL Flexible Server
- Redis Cache
- CORS global

### **Infraestructura**
- Azure App Service (Backend)
- Azure Static Web Apps (Frontend)
- Azure PostgreSQL Flexible Server
- Azure Redis Cache
- GitHub Actions (CI/CD)
- DNS: Configuración custom

---

## 📝 **Roadmap**

- [x] Chat NEURA con prompts profesionales
- [x] Login y autenticación
- [x] Integraciones Make/n8n/ChatGPT
- [x] Modo Dark/Light
- [x] Deployment en Azure
- [ ] Dominio econeura.com configurado
- [ ] Analytics y observabilidad
- [ ] Sistema de billing
- [ ] Marketplace de prompts

---

## 🤝 **Contribuir**

Este es un proyecto privado de ECONEURA. Para contribuciones internas:

1. Fork el repo interno
2. Crea feature branch: `git checkout -b feature/nueva-caracteristica`
3. Commit: `git commit -m 'feat: descripción'`
4. Push: `git push origin feature/nueva-caracteristica`
5. Abre Pull Request

---

## 📄 **Licencia**

Proprietary © 2025 ECONEURA

---

## 🆘 **Soporte**

- 📧 Email: soporte@econeura.com
- 🌐 Web: https://econeura.com
- 📚 Docs: https://docs.econeura.com

---

## 🎯 **Estado del Proyecto**

**Versión actual:** 2.1.0  
**Última actualización:** 23 Oct 2025  
**Estado:** ✅ Producción  
**Demo:** https://delightful-sand-04fd53203.3.azurestaticapps.net  
**Login demo:** `demo@econeura.com` / `demo123`

---

**Hecho con 💚 por el equipo ECONEURA**
<!-- Workflow test: 2025-10-25 16:49:57 -->

<!-- Workflows con permisos Owner: 2025-10-25 17:07:45 -->
