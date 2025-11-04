# Variables de Entorno - ECONEURA Backend

## ✅ OBLIGATORIAS (Producción)

```bash
NODE_ENV=production
PORT=8080
OPENAI_API_KEY=sk-xxx  # API key de Mammouth AI
```

## 🎯 RECOMENDADAS (Producción)

```bash
OPENAI_API_BASE_URL=https://api.mammouth.ai/v1
OPENAI_MODEL=mistral-medium-3.1
CORS_ORIGIN=https://tudominio.com
```

## 🔧 OPCIONALES (Servicios Avanzados)

```bash
# Database (PostgreSQL Azure)
DATABASE_URL=postgresql://user:password@host:5432/db

# Redis Cache
REDIS_URL=redis://host:6379

# Azure Key Vault
KEY_VAULT_NAME=econeura-vault

# Application Insights
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxx

# Autenticación OAuth
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Secrets
JWT_SECRET=min-32-caracteres-random
SESSION_SECRET=min-32-caracteres-random
```

## 📌 Configuración en Azure

### Opción 1: Azure Portal
1. Ir a App Service → Configuration
2. Añadir Application settings
3. Guardar y reiniciar

### Opción 2: Azure CLI
```bash
az webapp config appsettings set \
  --name econeura-backend-prod \
  --resource-group tu-resource-group \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    OPENAI_API_KEY="sk-xxx"
```

### Opción 3: GitHub Actions (Automático)
Las variables se configuran automáticamente en el workflow.
Requiere GitHub Secrets:
- `AZURE_CREDENTIALS`
- `OPENAI_API_KEY`
- `AZURE_WEBAPP_PUBLISH_PROFILE_PROD`

## 🚨 Troubleshooting

### El servidor no arranca
- Verificar que `OPENAI_API_KEY` esté configurado
- Verificar que `PORT` sea 8080
- Verificar logs: `az webapp log tail --name APP_NAME`

### 503 Service Unavailable
- Esperar 2-3 minutos (warm-up inicial)
- Verificar que Azure hizo `npm install`
- Verificar logs de startup

### CORS errors
- Asegurar que `CORS_ORIGIN` incluya el dominio del frontend
- En desarrollo, permitir `http://localhost:5173`

## 📋 Valores por Defecto

Si no se configuran, el backend usa:
- `NODE_ENV=development`
- `PORT=8080`
- `USE_MOCK_DB=true` (base de datos simulada)
- CORS permite localhost en desarrollo

