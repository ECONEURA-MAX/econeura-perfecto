# 🧪 TEST NEURA AGENTS - Guía de Pruebas

**Fecha:** 3 Noviembre 2025

---

## 🚀 REINICIAR BACKEND PRIMERO

```powershell
# Ve a la ventana del backend
Ctrl+C

# Reiniciar
node server.js
```

**Espera a ver:** `ECONEURA MAX PREMIUM Backend Ready v2.0`

---

## 🧪 TEST 1: Listar Agentes de CEO

```powershell
Invoke-RestMethod http://localhost:8080/api/neura-agents/ceo | ConvertTo-Json -Depth 5
```

**Resultado esperado:**
```json
{
  "neuraKey": "ceo",
  "totalAgents": 4,
  "agents": [
    {
      "id": "ceo-agenda-consejo",
      "name": "Agenda Consejo",
      "platform": "make"
    },
    ...
  ]
}
```

---

## 🧪 TEST 2: Ejecutar Agente (Modo Mock)

```powershell
$body = '{"input":{"date":"2025-11-05"}}'
Invoke-RestMethod http://localhost:8080/api/neura-agents/execute/ceo-agenda-consejo -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 5
```

**Resultado esperado:**
```json
{
  "success": true,
  "mode": "mock",
  "agentId": "ceo-agenda-consejo",
  "agentName": "Agenda Consejo",
  "result": {
    "status": "completed",
    "message": "[MOCK] Agenda Consejo ejecutado",
    "data": {
      "executionId": "mock-1730...",
      "duration": 3421,
      "platform": "make"
    }
  }
}
```

---

## 🧪 TEST 3: Detectar Intent

```powershell
$body = '{"message":"Ejecuta Agenda Consejo","neuraKey":"ceo"}'
Invoke-RestMethod http://localhost:8080/api/neura-agents/detect-intent -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json
```

**Resultado esperado:**
```json
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

## ✅ ÉXITO SI VES:

- ✅ Sin errores 404
- ✅ JSON válido en respuestas
- ✅ mode: "mock" (normal sin webhooks configurados)
- ✅ success: true

---

**¡Ejecuta los tests después de reiniciar el backend!**

