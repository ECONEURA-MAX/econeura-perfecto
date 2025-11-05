# 🔧 ECONEURA - Troubleshooting Rápido

## 🚨 BACKEND NO RESPONDE

### 1. Verificar estado en Azure Portal
```powershell
az webapp show --name econeura-backend-prod --resource-group appsvc_linux_northeurope_basic --query "{state:state, url:defaultHostName}" -o table
```

### 2. Ver logs en tiempo real (Portal)
1. Ir a: https://portal.azure.com
2. Buscar `econeura-backend-prod`
3. **Monitoring** > **Log stream**
4. Ver errores en tiempo real

### 3. Descargar logs
```powershell
az webapp log download --name econeura-backend-prod --resource-group appsvc_linux_northeurope_basic --log-file logs.zip
```

### 4. Restart rápido
```powershell
az webapp restart --name econeura-backend-prod --resource-group appsvc_linux_northeurope_basic
```

---

## 🔥 DEPLOY FALLÓ EN GITHUB ACTIONS

### Cancelar workflow colgado
```powershell
# Autenticar
gh auth login

# Listar workflows activos
gh run list --repo ECONEURA-MAX/econeura-perfecto --limit 5

# Cancelar específico
gh run cancel <RUN_ID> --repo ECONEURA-MAX/econeura-perfecto
```

### Deploy manual (bypass GitHub)
```powershell
.\DEPLOY-LOCAL-AZURE.ps1
```

---

## ❌ ERROR: Cannot find module 'express'

**Causa:** `node_modules` no se instaló

**Solución:**
1. Verificar que `deploy.sh` tiene `npm ci`
2. Verificar en Azure Portal > Configuration > Startup Command: debe estar vacío o ser `pm2 start server.js --no-daemon`

---

## ⏱️ TIMEOUT EN HEALTH CHECK

**Causa:** Backend tarda >2 min en iniciar

**Solución:**
1. El workflow ahora es `continue-on-error: true`
2. Espera 2-3 min y verifica manualmente:
   ```powershell
   Invoke-WebRequest -Uri "https://econeura-backend-prod.azurewebsites.net/api/health/simple" -UseBasicParsing
   ```

---

## 🔄 NECESITO VOLVER ATRÁS

```powershell
.\ROLLBACK-RAPIDO.ps1
```

---

## 📋 ANTES DE HACER DEPLOY

```powershell
.\PRE-DEPLOY-CHECK.ps1
```

---

## 🆘 COMANDOS DE EMERGENCIA

### Backend status
```powershell
Invoke-WebRequest -Uri "https://econeura-backend-prod.azurewebsites.net/api/health/simple" -UseBasicParsing -TimeoutSec 10
```

### Variables de entorno
```powershell
az webapp config appsettings list --name econeura-backend-prod --resource-group appsvc_linux_northeurope_basic --query "[].{name:name, value:value}" -o table
```

### Restart + logs
```powershell
az webapp restart --name econeura-backend-prod --resource-group appsvc_linux_northeurope_basic
Start-Sleep -Seconds 30
az webapp log tail --name econeura-backend-prod --resource-group appsvc_linux_northeurope_basic
```

---

## 📞 CONTACTOS

- **Azure Portal:** https://portal.azure.com
- **GitHub Actions:** https://github.com/ECONEURA-MAX/econeura-perfecto/actions
- **Backend URL:** https://econeura-backend-prod.azurewebsites.net
- **Frontend URL:** https://delightful-sand-04fd53203.3.azurestaticapps.net


