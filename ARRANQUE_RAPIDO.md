# ⚡ ARRANQUE RÁPIDO - 2 COMANDOS

## 🚀 TERMINAL 1 - BACKEND:
```powershell
cd C:\Users\Usuario\ECONEURA-PERFECTO\backend
node server.js
```

**Espera ver:**
```
✅ ECONEURA MAX PREMIUM Backend Ready
  Provider: AIMLAPI (Mixtral 8x7B PRO)
```

---

## 🌐 TERMINAL 2 - FRONTEND:
```powershell
cd C:\Users\Usuario\ECONEURA-PERFECTO\frontend
npm run dev
```

**Espera ver:**
```
VITE ready
Local: http://localhost:5173
```

---

## 🧪 TEST (TERMINAL 3):
```powershell
cd C:\Users\Usuario\ECONEURA-PERFECTO

$body = '{"prompt":"Hola","neuraId":0,"context":{"systemPrompt":"Eres CEO"}}'

Invoke-RestMethod http://localhost:8080/api/ai-gateway -Method Post -Body $body -ContentType "application/json"
```

**Debe retornar:**
```json
{
  "success": true,
  "data": {
    "output": "Hola, ...",
    "model": "mistralai/Mixtral-8x7B-Instruct-v0.1"
  }
}
```

---

## 💡 SI NO FUNCIONA:

1. Backend cerrado → Reinicia Terminal 1
2. Puerto ocupado → `Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process -Force`
3. Error 500 → Copia error de Terminal 1 (backend logs)

---

**AHORA:** Ejecuta Terminal 1 + Terminal 2 + Terminal 3

