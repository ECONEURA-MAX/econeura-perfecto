# 📘 ECONEURA - Proceso Completo de Deployment

## 🎯 OPCIÓN 1: GitHub Actions (Automático)

### Paso 1: Commit y Push
```powershell
git add .
git commit -m "descripción del cambio"
git push origin main
```

### Paso 2: Monitorear Workflow
1. Ir a: https://github.com/ECONEURA-MAX/econeura-perfecto/actions
2. Ver el workflow "Deploy Backend to Azure App Service"
3. Esperar 3-5 minutos
4. Si health check falla pero workflow completa: **ES NORMAL**
   - Espera 2-3 min adicionales
   - Verifica manualmente: `.\MONITOREO-POST-DEPLOY.ps1`

### Paso 3: Verificar
```powershell
Invoke-WebRequest -Uri "https://econeura-backend-prod.azurewebsites.net/api/health/simple" -UseBasicParsing
```

---

## 🎯 OPCIÓN 2: Deploy Manual (Bypass GitHub)

### Paso 1: Pre-Check
```powershell
.\PRE-DEPLOY-CHECK.ps1
```

### Paso 2: Deploy
```powershell
.\DEPLOY-LOCAL-AZURE.ps1
```

### Paso 3: Monitoreo
```powershell
.\MONITOREO-POST-DEPLOY.ps1
```

---

## 🔄 ROLLBACK si algo falla

```powershell
.\ROLLBACK-RAPIDO.ps1
```

---

## 📋 CHECKLIST PRE-DEPLOY

- [ ] `backend/package.json` tiene `"start": "node server.js"`
- [ ] `backend/deploy.sh` ejecutable y con `npm ci`
- [ ] Variables de entorno configuradas en Azure Portal
- [ ] Git working directory limpio (o cambios commiteados)
- [ ] Azure CLI autenticado (`az account show`)

---

## 🚨 Solución de Problemas

Ver: `TROUBLESHOOTING.md`

---

## 📊 Tiempos Esperados

- **GitHub Actions:** 3-5 minutos total
- **Deploy manual:** 2-3 minutos
- **Backend startup:** 1-2 minutos adicionales
- **Health check response:** Hasta 3 minutos después de deploy

---

## 🔗 URLs Importantes

- **Backend:** https://econeura-backend-prod.azurewebsites.net
- **Health:** https://econeura-backend-prod.azurewebsites.net/api/health/simple
- **Frontend:** https://delightful-sand-04fd53203.3.azurestaticapps.net
- **Azure Portal:** https://portal.azure.com
- **GitHub Actions:** https://github.com/ECONEURA-MAX/econeura-perfecto/actions


