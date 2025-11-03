# ⚡ COMANDOS RÁPIDOS - ECONEURA-PERFECTO

**Última Actualización:** 3 Noviembre 2025

---

## 🚀 EJECUCIÓN LOCAL

### Setup Inicial (Primera Vez)
```powershell
cd C:\Users\Usuario\ECONEURA-PERFECTO
.\fix-local.ps1
.\run-local.ps1
```

### Arranque Rápido (Después de Setup)
```powershell
# Terminal 1: Backend
cd C:\Users\Usuario\ECONEURA-PERFECTO\backend
node server.js

# Terminal 2: Frontend
cd C:\Users\Usuario\ECONEURA-PERFECTO\frontend
npm run dev

# Navegador
http://localhost:5173
```

---

## 🧪 TESTING

### Backend Health Check
```powershell
curl http://localhost:8080/api/health
```

### Test NEURA CEO
```powershell
$body = '{"input":"Hola"}'
Invoke-RestMethod http://localhost:8080/api/invoke/a-ceo-01 -Method Post -Body $body -ContentType "application/json"
```

### Test Modelos AIMLAPI
```powershell
$headers = @{ "Authorization" = "Bearer 948aefd22ac24ef1b02e9cf50dcd1b16" }
Invoke-RestMethod "https://api.aimlapi.com/v1/models" -Headers $headers
```

---

## 🔧 TROUBLESHOOTING

### Backend No Arranca
```powershell
cd backend
Remove-Item node_modules -Recurse -Force
npm install
node server.js
```

### Frontend No Conecta
```powershell
# Verificar backend corriendo
curl http://localhost:8080/api/health

# Reiniciar frontend
cd frontend
npm run dev
```

### Error 404 en NEURAs
```powershell
# Después de obtener modelos AIMLAPI
.\fix-models.ps1
# Reiniciar backend
```

---

## 📁 ARCHIVOS IMPORTANTES

### Documentación
- `HITO_SESION_3NOV2025_COMPLETO.md` - Reporte completo
- `HITO_RESUMEN_EJECUTIVO.md` - Resumen 1 página
- `AUDITORIA_BRUTAL_HALLAZGOS.md` - Problemas encontrados

### Scripts
- `fix-local.ps1` - Setup inicial
- `run-local.ps1` - Ejecutar local
- `fix-models.ps1` - Ajustar modelos

---

**Guardado como hito:** 3 Noviembre 2025 ✅

