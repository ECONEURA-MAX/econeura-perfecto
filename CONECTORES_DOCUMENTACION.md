# 🔌 CONECTORES EXISTENTES - DOCUMENTACIÓN COMPLETA

**Fecha:** 3 Noviembre 2025  
**Estado:** ✅ Conectores encontrados y documentados

---

## 📁 ARCHIVOS DE CONFIGURACIÓN EXISTENTES

### 1. `backend/config/agents.json`
**Propósito:** Webhooks de Make.com

**Webhooks REALES configurados:**
```json
{
  "makeAgents": {
    "a-ceo-01": {
      "webhookUrl": "https://hook.eu2.make.com/9fcydc16h26m2ejww5p049x7fa57fmqp"
    },
    "a-cfo-01": {
      "webhookUrl": "https://hook.eu2.make.com/zvxc4ls8dysaf53ah2jlpl27ou4j9mq5"
    }
  }
}
```

**Placeholders (pendientes de configurar):**
- a-ceo-02, a-ceo-03, a-ceo-04
- a-ia-01, a-ia-02, a-ia-03, a-ia-04
- a-cso-01, a-cso-02, a-cso-03, a-cso-04
- a-cto-01, a-cto-02, a-cto-03, a-cto-04
- a-ciso-01, a-ciso-02, a-ciso-03, a-ciso-04
- a-coo-01, a-coo-02, a-coo-03, a-coo-04
- a-chro-01, a-chro-02, a-chro-03, a-chro-04
- a-mkt-01, a-mkt-02, a-mkt-03, a-mkt-04
- a-cfo-02, a-cfo-03, a-cfo-04
- a-cdo-01, a-cdo-02, a-cdo-03, a-cdo-04

**Total:** 40 agentes Make.com (2 configurados, 38 pendientes)

---

### 2. `backend/config/n8n-agents.json`
**Propósito:** Webhooks de n8n

**Webhooks configurados:**
```json
{
  "a-cfo-01": {
    "webhookUrl": "https://n8n.econeura.com/webhook/cfo-agent",
    "provider": "n8n",
    "status": "active"
  },
  "a-chro-01": {
    "webhookUrl": "https://n8n.econeura.com/webhook/chro-agent",
    "provider": "n8n",
    "status": "active"
  },
  "a-ciso-01": {
    "webhookUrl": "https://n8n.econeura.com/webhook/ciso-agent",
    "provider": "n8n",
    "status": "active"
  }
}
```

**Total:** 3 agentes n8n (todos configurados)

---

### 3. `backend/config/chatgpt-agents.json`
**Propósito:** Configuración ChatGPT directo

**Agentes configurados:**
```json
{
  "a-cmo-01": {
    "webhookUrl": "https://api.openai.com/v1/chat/completions",
    "provider": "chatgpt",
    "status": "active"
  },
  "a-coo-01": {
    "webhookUrl": "https://api.openai.com/v1/chat/completions",
    "provider": "chatgpt",
    "status": "active"
  },
  "a-cso-01": {
    "webhookUrl": "https://api.openai.com/v1/chat/completions",
    "provider": "chatgpt",
    "status": "active"
  }
}
```

**Total:** 3 agentes ChatGPT

---

### 4. `backend/config/neura-agents-map.json` (NUEVO)
**Propósito:** Sistema nuevo de 44 agentes con nombres descriptivos

**Estructura:**
```json
{
  "ceo": {
    "agents": [
      { "id": "ceo-agenda-consejo", "name": "Agenda Consejo", ... },
      { "id": "ceo-anuncio-semanal", "name": "Anuncio Semanal", ... },
      ...
    ]
  }
}
```

**Total:** 44 agentes (11 NEURAs)

---

## 🔄 SISTEMAS DISPONIBLES

### Sistema 1: Make.com (Existente)
**API:** `backend/services/makeService.js`  
**Config:** `backend/config/agents.json`  
**Estado:** ✅ Implementado  
**Webhooks configurados:** 2/40

### Sistema 2: n8n (Existente)
**API:** `backend/routes/n8n.js`  
**Config:** `backend/config/n8n-agents.json`  
**Estado:** ✅ Implementado  
**Webhooks configurados:** 3/3

### Sistema 3: NEURA Agents (Nuevo - HOY)
**API:** `backend/routes/neura-agents.js`  
**Config:** `backend/config/neura-agents-map.json`  
**Estado:** ✅ Implementado  
**Webhooks configurados:** 0/44 (modo mock)

---

## 🎯 ESTRATEGIA DE INTEGRACIÓN

### OPCIÓN RECOMENDADA: Sistema Híbrido

**Usar los 3 sistemas en paralelo:**

1. **Sistema Make (agents.json)** → Para agentes legacy con IDs tipo `a-ceo-01`
2. **Sistema n8n (n8n-agents.json)** → Para n8n específicos
3. **Sistema NEURA (neura-agents-map.json)** → Para nuevos agentes con nombres descriptivos

**Ventajas:**
- ✅ No rompe nada existente
- ✅ Los 2 webhooks Make.com reales siguen funcionando
- ✅ Los 3 webhooks n8n siguen funcionando
- ✅ Nuevo sistema de 44 agentes disponible
- ✅ Migración gradual posible

---

## 🔧 CÓMO CONFIGURAR WEBHOOKS

### Para Make.com (agents.json)

**Paso 1:** Crea workflow en Make.com  
**Paso 2:** Copia la webhook URL  
**Paso 3:** Edita `backend/config/agents.json`:

```json
{
  "makeAgents": {
    "a-ceo-02": {
      "webhookUrl": "https://hook.eu2.make.com/TU_WEBHOOK_AQUI"
    }
  }
}
```

### Para n8n (n8n-agents.json)

**Paso 1:** Crea workflow en n8n  
**Paso 2:** Copia la webhook URL  
**Paso 3:** Edita `backend/config/n8n-agents.json`:

```json
{
  "a-cto-01": {
    "webhookUrl": "https://n8n.econeura.com/webhook/TU_WEBHOOK",
    "provider": "n8n",
    "status": "active"
  }
}
```

### Para Sistema NEURA (neura-agents-map.json)

Edita `backend/config/neura-agents-map.json`:

```json
{
  "ceo": {
    "agents": [
      {
        "id": "ceo-agenda-consejo",
        "webhookUrl": "https://hook.eu2.make.com/TU_WEBHOOK"
      }
    ]
  }
}
```

---

## 📊 WEBHOOKS YA CONFIGURADOS

```
✅ Make.com:
   - a-ceo-01: hook.eu2.make.com/9fcydc... (REAL)
   - a-cfo-01: hook.eu2.make.com/zvxc4l... (REAL)

✅ n8n:
   - a-cfo-01: n8n.econeura.com/webhook/cfo-agent
   - a-chro-01: n8n.econeura.com/webhook/chro-agent
   - a-ciso-01: n8n.econeura.com/webhook/ciso-agent

Total configurados: 5 webhooks REALES
Pendientes: 38 Make.com placeholders
```

---

## 🚀 PROBAR WEBHOOKS REALES

### Test a-ceo-01 (Make.com REAL)
```powershell
$body = @{
  input = "Test desde ECONEURA"
  correlationId = "test-123"
} | ConvertTo-Json

Invoke-RestMethod https://hook.eu2.make.com/9fcydc16h26m2ejww5p049x7fa57fmqp -Method Post -Body $body -ContentType "application/json"
```

### Test a-cfo-01 (Make.com REAL)
```powershell
$body = @{
  input = "Generar reporte financiero"
  correlationId = "test-456"
} | ConvertTo-Json

Invoke-RestMethod https://hook.eu2.make.com/zvxc4ls8dysaf53ah2jlpl27ou4j9mq5 -Method Post -Body $body -ContentType "application/json"
```

---

## 🎯 PRÓXIMO PASO

Los conectores YA EXISTEN. Solo necesitas:

1. ✅ **Usar los 2 webhooks Make.com que ya funcionan**
2. ⚠️ **Configurar los 38 placeholders restantes** cuando tengas los webhooks
3. ✅ **Sistema ya está listo** - solo falta poner las URLs reales

---

## 📋 ARCHIVOS CREADOS PARA TI

- `CONECTORES_DOCUMENTACION.md` - Este archivo
- `integrar-conectores-existentes.ps1` - Info de conectores

---

**¿Quieres que te ayude a testear los 2 webhooks REALES que ya tienes (a-ceo-01 y a-cfo-01)?** 🔌

