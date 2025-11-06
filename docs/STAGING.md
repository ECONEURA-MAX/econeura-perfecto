# Staging Environment - ECONEURA

Documentación completa para crear y gestionar el entorno de staging.

## 📋 Overview

El entorno de staging replica la producción con recursos más económicos para testing pre-producción.

### Recursos Azure Requeridos

| Recurso | Producción | Staging | Coste Staging |
|---------|-----------|---------|---------------|
| App Service | B1 (€50/mes) | B1 (€50/mes) | €50/mes |
| Static Web App | Free | Free | €0/mes |
| PostgreSQL | B1ms (€28/mes) | B1ms (€18/mes) | €18/mes |
| Redis | C0 (€16/mes) | C0 (€16/mes) | €16/mes |
| **Total** | **€94/mes** | **€84/mes** | **€84/mes** |

## 🚀 Creación Rápida

### Opción 1: Script Automatizado (Recomendado)

```powershell
# Ejecutar desde la raíz del proyecto
.\scripts\create-staging.ps1
```

### Opción 2: Manual (Azure Portal)

1. **App Service para Backend:**
   - Nombre: `econeura-backend-staging`
   - Runtime: Node 20 LTS
   - Región: North Europe
   - Plan: B1

2. **Static Web App para Frontend:**
   - Nombre: `econeura-web-staging`
   - Región: West Europe
   - Plan: Free

3. **PostgreSQL:**
   - Nombre: `econeura-db-staging`
   - Versión: 16
   - SKU: B1ms
   - Storage: 32 GB

4. **Redis:**
   - Nombre: `econeura-redis-staging`
   - Versión: 7
   - SKU: C0

## 🔧 Configuración

### 1. App Service Settings

```powershell
az webapp config appsettings set \
  --name econeura-backend-staging \
  --resource-group appsvc_linux_northeurope_basic \
  --settings \
    NODE_ENV=staging \
    DATABASE_URL="postgresql://user:pass@econeura-db-staging.postgres.database.azure.com:5432/econeura?sslmode=require" \
    REDIS_URL="rediss://econeura-redis-staging.redis.cache.windows.net:6380,password=...,ssl=true" \
    JWT_ACCESS_SECRET="staging-access-secret" \
    JWT_REFRESH_SECRET="staging-refresh-secret" \
    OPENAI_API_KEY="..." \
    CORS_ORIGIN="https://econeura-web-staging.azurestaticapps.net"
```

### 2. GitHub Secrets

Añadir en: `Settings > Secrets and variables > Actions`

```bash
# Backend Staging
AZURE_WEBAPP_PUBLISH_PROFILE_STAGING
# (Descargar desde Azure Portal > App Service > Get publish profile)

# Frontend Staging
AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING
# (Obtener con: az staticwebapp secrets list --name econeura-web-staging)
```

### 3. PostgreSQL Firewall

```powershell
# Permitir Azure services
az postgres flexible-server firewall-rule create \
  --name econeura-db-staging \
  --resource-group appsvc_linux_northeurope_basic \
  --rule-name AllowAzure \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

## 🔄 Workflow de Deployment

### Automático

1. **Push a `develop`:**
   ```bash
   git checkout develop
   git merge feature/nueva-funcionalidad
   git push origin develop
   ```
   → Deploy automático a staging

2. **PR con label `deploy-staging`:**
   - Crear PR a `main`
   - Añadir label `deploy-staging`
   → Deploy automático para testing

### Manual

```bash
# Desde GitHub Actions
Actions > Deploy to Staging > Run workflow
```

## 🧪 Testing en Staging

### Health Check

```powershell
Invoke-RestMethod https://econeura-backend-staging.azurewebsites.net/api/health
```

### Test NEURAs

```powershell
$headers = @{
    "Content-Type" = "application/json"
}
$body = @{
    input = "Test desde staging"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "https://econeura-backend-staging.azurewebsites.net/api/invoke/a-ceo-01" `
  -Method Post `
  -Headers $headers `
  -Body $body
```

### Test Frontend

```
https://econeura-web-staging.azurestaticapps.net
```

## 🔵🟢 Blue-Green Deployment

### Concepto

- **Blue (Actual):** Producción actual
- **Green (Nueva):** Nueva versión en staging
- **Switch:** Cambio instantáneo de tráfico

### Implementación

1. **Deploy a Staging (Green):**
   ```bash
   git push origin develop
   ```

2. **Validar Green:**
   ```bash
   npm run test:e2e -- --baseUrl https://econeura-web-staging.azurestaticapps.net
   ```

3. **Smoke Tests:**
   ```bash
   ./scripts/smoke-tests-staging.ps1
   ```

4. **Promover a Producción (Blue):**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

### Rollback Rápido

Si hay problemas en producción:

```powershell
# Opción 1: Revert último commit
git revert HEAD
git push origin main

# Opción 2: Swap slots (si configurado)
az webapp deployment slot swap \
  --name econeura-backend-prod \
  --resource-group appsvc_linux_northeurope_basic \
  --slot staging \
  --target-slot production
```

## 📊 Monitoreo Staging

### Logs en Tiempo Real

```powershell
az webapp log tail \
  --name econeura-backend-staging \
  --resource-group appsvc_linux_northeurope_basic
```

### Métricas

```powershell
az monitor metrics list \
  --resource "/subscriptions/.../providers/Microsoft.Web/sites/econeura-backend-staging" \
  --metric "Http2xx,Http5xx,ResponseTime" \
  --start-time 2025-11-06T00:00:00Z \
  --end-time 2025-11-06T23:59:59Z
```

### Application Insights

- Portal: https://portal.azure.com
- Buscar: `econeura-backend-staging`
- Ver: Logs, Failures, Performance

## 🧹 Limpieza (Opcional)

Si necesitas eliminar staging para ahorrar costos:

```powershell
# Eliminar todos los recursos de staging
az group delete \
  --name rg-econeura-staging \
  --yes \
  --no-wait
```

## 🔐 Seguridad Staging

### Restricciones

- **No usar datos de producción reales**
- **Datos de testing/mock únicamente**
- **Acceso limitado por IP (opcional)**

```powershell
# Limitar acceso por IP
az webapp config access-restriction add \
  --name econeura-backend-staging \
  --resource-group appsvc_linux_northeurope_basic \
  --rule-name "OfficeIP" \
  --action Allow \
  --ip-address "203.0.113.0/24" \
  --priority 100
```

### Variables de Entorno Staging

- JWT secrets **diferentes** a producción
- OPENAI_API_KEY con límites más bajos
- DATABASE con datos de testing
- CORS solo permite staging frontend

## 📋 Checklist Pre-Deployment

Antes de promover staging → producción:

- [ ] Health checks passing
- [ ] Tests E2E passing
- [ ] Performance tests OK (< 3s latency)
- [ ] Security scan passing (Snyk)
- [ ] Manual QA completado
- [ ] Changelog actualizado
- [ ] Release notes preparadas
- [ ] Stakeholders notificados

## 🆘 Troubleshooting

### Staging 503

```powershell
# Ver logs
az webapp log download \
  --name econeura-backend-staging \
  --log-file staging-logs.zip

# Verificar App Settings
az webapp config appsettings list \
  --name econeura-backend-staging
```

### Database Connection Failed

```powershell
# Test conexión
psql "postgresql://user:pass@econeura-db-staging.postgres.database.azure.com:5432/econeura?sslmode=require"

# Verificar firewall
az postgres flexible-server firewall-rule list \
  --name econeura-db-staging
```

### Frontend no conecta al Backend

```bash
# Verificar CORS en staging
curl -I https://econeura-backend-staging.azurewebsites.net/api/health \
  -H "Origin: https://econeura-web-staging.azurestaticapps.net"

# Debe incluir: Access-Control-Allow-Origin
```

---

## 📞 Contacto

- **Issues:** GitHub Issues
- **Email:** devops@econeura.com
- **Slack:** #staging-deployments

---

**Última actualización:** 6 Noviembre 2025

