# 🚀 DEPLOY FINAL - ECONEURA

## ✅ Pre-requisitos

### 1. Variables de entorno en GitHub Secrets
```
AZURE_CREDENTIALS
OPENAI_API_KEY
AZURE_WEBAPP_PUBLISH_PROFILE_PROD
AZURE_STATICWEBAPP_API_TOKEN_PROD
```

### 2. Verificación local
```bash
cd backend
node verificar-antes-deploy.js
```

## 📦 Proceso de Deploy

### Opción 1: Automático (GitHub Actions)
```bash
git add .
git commit -m "chore: deploy to production"
git push origin main
```

### Opción 2: Manual (Azure CLI)
```bash
# Desde el directorio backend
cd backend

# Verificar
node verificar-antes-deploy.js

# Deploy con az webapp up
az webapp up \
  --name econeura-backend-prod \
  --resource-group appsvc_linux_northeurope_basic \
  --runtime "NODE:20-lts" \
  --sku B1

# Configurar variables
az webapp config appsettings set \
  --name econeura-backend-prod \
  --resource-group appsvc_linux_northeurope_basic \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    OPENAI_API_KEY="sk-xxx" \
    OPENAI_API_BASE_URL="https://api.mammouth.ai/v1" \
    OPENAI_MODEL="mistral-medium-3.1"

# Verificar health
curl https://econeura-backend-prod.azurewebsites.net/api/health/simple
```

## 🔍 Verificación Post-Deploy

### 1. Health Check
```bash
# Simple
curl https://econeura-backend-prod.azurewebsites.net/api/health/simple

# Completo
curl https://econeura-backend-prod.azurewebsites.net/api/health
```

### 2. Logs en vivo
```bash
az webapp log tail --name econeura-backend-prod --resource-group appsvc_linux_northeurope_basic
```

### 3. Ver configuración
```bash
az webapp config appsettings list \
  --name econeura-backend-prod \
  --resource-group appsvc_linux_northeurope_basic
```

## 🚨 Troubleshooting

### 503 Service Unavailable
```bash
# 1. Ver logs
az webapp log tail --name econeura-backend-prod

# 2. Verificar variables de entorno
az webapp config appsettings list --name econeura-backend-prod

# 3. Reiniciar app
az webapp restart --name econeura-backend-prod --resource-group appsvc_linux_northeurope_basic

# 4. Esperar 2-3 minutos (warm-up)
```

### MODULE_NOT_FOUND
```bash
# Azure debe hacer npm install automáticamente
# Verificar que existan:
# - backend/.deployment
# - backend/deploy.sh
# - backend/package.json en el ZIP
```

### CORS Errors
```bash
# Configurar CORS_ORIGIN
az webapp config appsettings set \
  --name econeura-backend-prod \
  --resource-group appsvc_linux_northeurope_basic \
  --settings CORS_ORIGIN="https://tudominio.com"
```

## 📊 Monitoreo

### Application Insights (Opcional)
```bash
az webapp config appsettings set \
  --name econeura-backend-prod \
  --resource-group appsvc_linux_northeurope_basic \
  --settings APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=xxx"
```

### Logs de consola
```bash
# Habilitar logging
az webapp log config \
  --name econeura-backend-prod \
  --resource-group appsvc_linux_northeurope_basic \
  --application-logging filesystem \
  --detailed-error-messages true \
  --failed-request-tracing true \
  --web-server-logging filesystem
```

## ✅ Checklist Final

- [ ] Verificación local OK (`node verificar-antes-deploy.js`)
- [ ] GitHub Secrets configurados (3/3)
- [ ] Workflows actualizados
- [ ] Variables de entorno en Azure
- [ ] Health check responde 200
- [ ] NEURAs funcionan correctamente
- [ ] Frontend se conecta al backend
- [ ] CORS configurado correctamente
- [ ] Logs monitoreados en Azure
- [ ] Dominio www.econeura.com apunta a Static Web Apps

## 🎯 Próximos Pasos

1. Configurar dominio personalizado (www.econeura.com)
2. Configurar SSL/TLS
3. Configurar CDN (Azure Front Door)
4. Configurar backup automático
5. Configurar alertas de monitoring

