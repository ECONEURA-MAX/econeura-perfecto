# 🚀 ECONEURA - Guía Rápida de Deployment

## ⚡ DEPLOY EN 1 COMANDO

```powershell
.\DEPLOY-COMPLETO-FINAL.ps1
```

Este script ejecuta automáticamente:
1. ✅ Validaciones pre-deploy
2. ✅ Backup automático
3. ✅ Commit y push (si hay cambios)
4. ✅ Deploy a Azure
5. ✅ Configuración de timeouts
6. ✅ Monitoreo post-deploy
7. ✅ Verificación de seguridad

---

## 📋 SCRIPTS DISPONIBLES

| Script | Descripción | Uso |
|--------|-------------|-----|
| `DEPLOY-COMPLETO-FINAL.ps1` | Deploy completo automatizado | Principal |
| `DEPLOY-LOCAL-AZURE.ps1` | Deploy manual sin GitHub | Alternativa |
| `PRE-DEPLOY-CHECK.ps1` | Validaciones antes de deploy | Antes de deploy |
| `MONITOREO-POST-DEPLOY.ps1` | Verificar estado post-deploy | Después de deploy |
| `ROLLBACK-RAPIDO.ps1` | Volver al deployment anterior | Emergencia |
| `BACKUP-PRE-DEPLOY.ps1` | Crear backup del código | Seguridad |
| `CONFIGURAR-AZURE-TIMEOUTS.ps1` | Optimizar configuración Azure | Una vez |
| `VERIFICAR-ENV-AZURE.ps1` | Ver variables de entorno | Diagnóstico |
| `VERIFICAR-CORS-SECURITY.ps1` | Verificar CORS y seguridad | Diagnóstico |

---

## 🆘 SOLUCIÓN RÁPIDA DE PROBLEMAS

### Backend no responde
```powershell
# 1. Verificar estado
az webapp show --name econeura-backend-prod --resource-group appsvc_linux_northeurope_basic

# 2. Restart
az webapp restart --name econeura-backend-prod --resource-group appsvc_linux_northeurope_basic

# 3. Ver logs
# Ir a Azure Portal > Log Stream
```

### Deploy falló
```powershell
# Rollback inmediato
.\ROLLBACK-RAPIDO.ps1
```

### Health check timeout
- **Es NORMAL** - El backend tarda 1-3 min en iniciar
- Espera y verifica manualmente:
```powershell
Invoke-WebRequest -Uri "https://econeura-backend-prod.azurewebsites.net/api/health/simple" -UseBasicParsing
```

---

## 📊 URLs IMPORTANTES

- **Backend:** https://econeura-backend-prod.azurewebsites.net
- **Health Check:** https://econeura-backend-prod.azurewebsites.net/api/health/simple
- **Frontend:** https://delightful-sand-04fd53203.3.azurestaticapps.net
- **Azure Portal:** https://portal.azure.com
- **GitHub Actions:** https://github.com/ECONEURA-MAX/econeura-perfecto/actions

---

## ✅ CHECKLIST RÁPIDO

Antes de cada deploy:
- [ ] Código funciona localmente
- [ ] Tests pasan
- [ ] Variables de entorno configuradas en Azure
- [ ] Backup existe (automático con script)

---

## 📖 DOCUMENTACIÓN DETALLADA

- **Proceso completo:** `PROCESO-DEPLOYMENT.md`
- **Troubleshooting:** `TROUBLESHOOTING.md`
- **Arquitectura:** Ver `/backend/README.md`

---

## 🎯 TIEMPOS ESPERADOS

- Deploy manual: **2-3 minutos**
- GitHub Actions: **3-5 minutos**
- Backend startup: **1-2 minutos**
- Health check response: **Hasta 3 minutos**

---

## 💡 TIPS

1. **Usa DEPLOY-COMPLETO-FINAL.ps1** para deploys normales
2. **Azure Portal > Log Stream** es tu mejor amigo para debug
3. **Health check timeout NO es error** - solo espera más tiempo
4. **Backup automático** siempre se crea antes de deploy
5. **Rollback** está disponible si algo sale mal

---

## 🔗 CONTACTO Y SOPORTE

- **Repository:** https://github.com/ECONEURA-MAX/econeura-perfecto
- **Azure Subscription:** Default Directory
- **Resource Group:** appsvc_linux_northeurope_basic

---

**Última actualización:** 4 Nov 2025
**Versión Backend:** 3.0.0
**Estado:** ✅ Production Ready


