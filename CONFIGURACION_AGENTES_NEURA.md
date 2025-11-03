# 🤖 CONFIGURACIÓN DE AGENTES AUTOMATIZADOS POR NEURA

**Fecha:** 3 Noviembre 2025  
**Estado:** ✅ Sistema implementado - Configuración pendiente

---

## 📊 SISTEMA IMPLEMENTADO

### ✅ Backend
- `backend/config/neura-agents-map.json` - Mapeo de 44 agentes
- `backend/services/neuraAgentExecutor.js` - Motor de ejecución
- `backend/routes/neura-agents.js` - API REST
- `backend/server.js` - Ruta registrada

### 🎯 Funcionalidades
- ✅ Detectar intent de ejecución en chat ("ejecuta agenda consejo")
- ✅ Listar agentes disponibles por NEURA
- ✅ Ejecutar agentes Make/n8n via webhook
- ✅ Modo mock si webhook no configurado
- ✅ Logging estructurado de ejecuciones

---

## 🧠 AGENTES POR NEURA (44 TOTALES)

### CEO - 4 agentes
1. **Agenda Consejo** (Make) - Manual
2. **Anuncio Semanal** (n8n) - Manual
3. **Resumen Ejecutivo** (Make) - Auto
4. **Seguimiento OKR** (n8n) - Manual

### CTO IA - 4 agentes
1. **Salud y Failover** (Make) - Auto
2. **Cost Tracker** (n8n) - Auto
3. **Revisión Prompts** (Make) - Manual
4. **Vigilancia Cuotas** (n8n) - Auto

### CSO - 4 agentes
1. **Gestor de Riesgos** (Make) - Manual
2. **Vigilancia Competitiva** (n8n) - Auto
3. **Radar de Tendencias** (Make) - Auto
4. **M&A Sync** (n8n) - Manual

### CTO - 4 agentes
1. **FinOps Cloud** (Make) - Auto
2. **Seguridad CI/CD** (n8n) - Auto
3. **Observabilidad SLO** (Make) - Auto
4. **Gestión Incidencias** (n8n) - Manual

### CISO - 4 agentes
1. **Vulnerabilidades** (Make) - Auto
2. **Phishing Triage** (n8n) - Auto
3. **Backup/Restore DR** (Make) - Manual
4. **Recertificación** (n8n) - Manual

### COO - 4 agentes
1. **Atrasos y Excepciones** (Make) - Auto
2. **Centro NPS/CSAT** (n8n) - Auto
3. **Latido de SLA** (Make) - Auto
4. **Torre de Control** (n8n) - Manual

### CHRO - 4 agentes
1. **Encuesta de Pulso** (Make) - Manual
2. **Offboarding Seguro** (n8n) - Manual
3. **Onboarding Orquestado** (Make) - Manual
4. **Pipeline Contratación** (n8n) - Auto

### CMO/CRO - 4 agentes
1. **Embudo Comercial** (Make) - Auto
2. **Salud de Pipeline** (n8n) - Auto
3. **Calidad de Leads** (Make) - Auto
4. **Post-Campaña** (n8n) - Manual

### CFO - 4 agentes
1. **Tesorería** (Make) - Auto
2. **Variance** (n8n) - Auto
3. **Facturación** (Make) - Auto
4. **Compras** (n8n) - Manual

### CDO - 4 agentes
1. **Linaje** (Make) - Auto
2. **Calidad de Datos** (n8n) - Auto
3. **Catálogo** (Make) - Manual
4. **Coste DWH** (n8n) - Auto

### CINO - 5 agentes
1. **Explorador de Patentes y Papers** (Make) - Manual
2. **Radar de Startups** (n8n) - Auto
3. **Generador de Prototipos** (Make) - Manual
4. **Tendencias de Usuario** (n8n) - Auto
5. **Innovation Lab** (Make) - Manual

---

## 🔧 CONFIGURAR WEBHOOKS

### Paso 1: Crear Workflow en Make.com o n8n

**Ejemplo Make.com:**
1. Ir a https://make.com
2. Crear nuevo scenario
3. Agregar trigger "Webhook"
4. Copiar URL del webhook
5. Agregar módulos de tu automatización

**Ejemplo n8n:**
1. Ir a tu instancia n8n
2. Crear nuevo workflow
3. Agregar nodo "Webhook"
4. Copiar URL del webhook
5. Agregar nodos de tu automatización

### Paso 2: Configurar en ECONEURA

Edita `backend/config/neura-agents-map.json`:

```json
{
  "ceo": {
    "agents": [
      {
        "id": "ceo-agenda-consejo",
        "name": "Agenda Consejo",
        "webhookUrl": "https://hook.eu2.make.com/xxxxx" // <- PEGAR AQUÍ
      }
    ]
  }
}
```

---

## 🎯 USO DESDE EL CHAT

### Opción 1: Intent Natural
Usuario escribe en chat de NEURA CEO:
```
"Ejecuta Agenda Consejo"
```

Backend detecta intent automáticamente y ejecuta el agente.

### Opción 2: API Directa
```powershell
# Ejecutar agente específico
$body = @{
  input = @{ date = "2025-11-05" }
  userId = "user-123"
} | ConvertTo-Json

Invoke-RestMethod http://localhost:8080/api/neura-agents/execute/ceo-agenda-consejo -Method Post -Body $body -ContentType "application/json"
```

### Opción 3: Listar Agentes Disponibles
```powershell
# Ver agentes de CEO
Invoke-RestMethod http://localhost:8080/api/neura-agents/ceo
```

---

## 📋 APIs DISPONIBLES

### GET /api/neura-agents/:neuraKey
Retorna agentes disponibles para una NEURA.

**Ejemplo:**
```http
GET /api/neura-agents/ceo

Response:
{
  "neuraKey": "ceo",
  "agents": [
    {
      "id": "ceo-agenda-consejo",
      "name": "Agenda Consejo",
      "description": "Preparación de agenda del consejo ejecutivo",
      "platform": "make",
      "trigger": "manual"
    }
  ],
  "insights": ["Resumen del día", "Top riesgos", "OKR en alerta"],
  "totalAgents": 4
}
```

### POST /api/neura-agents/execute/:agentId
Ejecuta un agente específico.

**Ejemplo:**
```http
POST /api/neura-agents/execute/ceo-agenda-consejo
Content-Type: application/json

{
  "input": {
    "date": "2025-11-05",
    "attendees": ["CEO", "CFO", "CTO"]
  },
  "userId": "user-123"
}

Response:
{
  "success": true,
  "mode": "real",
  "agentId": "ceo-agenda-consejo",
  "agentName": "Agenda Consejo",
  "result": {
    "status": "completed",
    "duration": 2345,
    "platform": "make",
    "data": { ... }
  }
}
```

### POST /api/neura-agents/detect-intent
Detecta si un mensaje quiere ejecutar un agente.

**Ejemplo:**
```http
POST /api/neura-agents/detect-intent
Content-Type: application/json

{
  "message": "Ejecuta Agenda Consejo",
  "neuraKey": "ceo"
}

Response:
{
  "hasIntent": true,
  "intent": {
    "detected": true,
    "agentId": "ceo-agenda-consejo",
    "agentName": "Agenda Consejo",
    "platform": "make"
  }
}
```

---

## 🔄 FLUJO DE EJECUCIÓN

```
Usuario en Chat NEURA CEO
│
├─> Escribe: "Ejecuta Agenda Consejo"
│
├─> Frontend detecta mensaje
│
├─> POST /api/neura-agents/detect-intent
│   └─> Backend: Intent detectado ✅
│
├─> POST /api/neura-agents/execute/ceo-agenda-consejo
│   │
│   ├─> Si webhook configurado:
│   │   └─> Llama Make.com/n8n webhook
│   │       └─> Retorna resultado real
│   │
│   └─> Si webhook NO configurado:
│       └─> Retorna mock (demo mode)
│
└─> Frontend muestra resultado en chat
```

---

## ✅ ESTADO ACTUAL

```
✅ Backend: Sistema implementado 100%
✅ Agentes: 44 mapeados en JSON
✅ APIs: 3 endpoints funcionales
✅ Detección: Intent natural soportado
⚠️  Webhooks: Ninguno configurado (modo mock)
⚠️  Frontend: Pendiente de integración UI
```

---

## 🚀 PRÓXIMOS PASOS

### Inmediato (30 min)
1. ✅ Reiniciar backend (incluye nuevas rutas)
2. ✅ Test API de agentes
3. ⚠️  Configurar 1-2 webhooks de prueba

### Corto Plazo (2-3 horas)
1. Integrar en frontend (botones de agentes por NEURA)
2. UI para mostrar resultados de ejecución
3. Historial de ejecuciones

### Medio Plazo (1 semana)
1. Configurar todos los webhooks Make/n8n
2. Dashboard de agentes ejecutados
3. Métricas de ROI por agente

---

**REINICIA EL BACKEND para cargar las nuevas rutas:**
```powershell
# En ventana backend: Ctrl+C
node server.js
```

**PRUEBA:**
```powershell
# Ver agentes de CEO
Invoke-RestMethod http://localhost:8080/api/neura-agents/ceo

# Ejecutar agente (modo mock)
Invoke-RestMethod http://localhost:8080/api/neura-agents/execute/ceo-agenda-consejo -Method Post -Body '{}' -ContentType "application/json"
```

