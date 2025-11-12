# 📋 PLAN MIGRACIÓN EMPRESARIAL - 65 TAREAS

**FILOSOFÍA: LOCAL 100% PRIMERO, AZURE DESPUÉS**

**OBJETIVO**: Monorepo 10/10 + Azure Premium $200 + Migración sin fallos

---

## 🎯 RESUMEN EJECUTIVO

**FASES**:
1. **LOCAL BACKEND 10/10** (20 tareas) - Verificar TODO backend localmente
2. **LOCAL FRONTEND 10/10** (15 tareas) - Verificar TODO frontend localmente
3. **INTEGRACIÓN LOCAL** (10 tareas) - Backend + Frontend funcionando juntos
4. **PREPARACIÓN AZURE** (10 tareas) - Configurar infraestructura Azure Premium
5. **MIGRACIÓN** (5 tareas) - Desplegar a Azure sin downtime
6. **VERIFICACIÓN PRODUCCIÓN** (5 tareas) - Confirmar EXCELENCIA en producción

**TOTAL: 65 TAREAS**

**REGLAS**:
- ✅ SI una tarea falla → ABORTAR (no continuar)
- ✅ TODO debe ser 10/10 local ANTES de migrar
- ✅ Cada tarea tiene criterio de éxito MEDIBLE
- ✅ Sin suposiciones - VERIFICAR TODO

---

## 📊 FASE 1: LOCAL BACKEND 10/10 (20 tareas)

### GRUPO 1.1: INSTALACIÓN Y DEPENDENCIAS (5 tareas)

**Tarea 1.1.1**: `npm install` en backend  
**Comando**:
```bash
cd backend
npm install
```
**Criterio éxito**: 
- `node_modules/` creado
- 0 errores WARN/ERR en console
- Todas las 45 dependencias instaladas

**Tarea 1.1.2**: Verificar versiones críticas  
**Comando**:
```bash
node --version  # Debe ser >=20.0.0
npm --version   # Debe ser >=10.0.0
```
**Criterio éxito**: Versiones correctas

**Tarea 1.1.3**: Verificar integridad de `package-lock.json`  
**Comando**:
```bash
npm ci --dry-run
```
**Criterio éxito**: Sin conflictos de versiones

**Tarea 1.1.4**: Verificar scripts npm  
**Comando**:
```bash
npm run --silent 2>&1 | grep "start\|dev\|test"
```
**Criterio éxito**: Scripts `start`, `dev`, `test` existen

**Tarea 1.1.5**: Verificar binarios críticos  
**Comando**:
```bash
npx --version
node -e "console.log(require('express').version)"
```
**Criterio éxito**: Express 4.21+ instalado

---

### GRUPO 1.2: CONFIGURACIÓN ENTORNO (5 tareas)

**Tarea 1.2.1**: Crear `.env` local completo  
**Archivo**: `backend/.env`
```bash
NODE_ENV=development
PORT=8080
USE_MOCK_DB=true
MAMMOUTH_API_KEY=<TU_API_KEY_AQUI>
MISTRAL_MODEL=mistral-medium-3.1
JWT_SECRET=$(openssl rand -base64 64)
SESSION_SECRET=$(openssl rand -base64 64)
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```
**Criterio éxito**: Archivo existe, 9 variables configuradas

**Tarea 1.2.2**: Validar variables con Zod  
**Comando**:
```bash
node -e "require('./config/envValidation.js')"
```
**Criterio éxito**: Sin errores de validación

**Tarea 1.2.3**: Verificar Mammouth API key  
**Comando**:
```bash
curl -X POST https://api.mammouth.ai/v1/chat/completions \
  -H "Authorization: Bearer $MAMMOUTH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"mistral-medium-3.1","messages":[{"role":"user","content":"test"}],"max_tokens":5}'
```
**Criterio éxito**: Response 200 OK

**Tarea 1.2.4**: Crear `.env.example` documentado  
**Archivo**: `backend/.env.example`
```bash
# Copy to .env and fill with your values
NODE_ENV=development
PORT=8080
USE_MOCK_DB=true
MAMMOUTH_API_KEY=your_api_key_here
# ... resto documentado
```
**Criterio éxito**: Archivo existe, todas las vars documentadas

**Tarea 1.2.5**: Verificar NO hay secrets en Git  
**Comando**:
```bash
git log --all --full-history -- */.env | wc -l  # Debe ser 0
```
**Criterio éxito**: 0 secrets en historial Git

---

### GRUPO 1.3: VERIFICACIÓN CÓDIGO (5 tareas)

**Tarea 1.3.1**: Leer `server.js` COMPLETO (542 líneas)  
**Comando**: (Ya hecho en contexto actual)
**Criterio éxito**: 
- Entender TODAS las rutas
- Entender middleware
- Entender graceful shutdown

**Tarea 1.3.2**: Verificar imports NO rotos  
**Comando**:
```bash
node --check server.js
node --check config/envValidation.js
node --check services/logger.js
```
**Criterio éxito**: Sin errores syntax

**Tarea 1.3.3**: Linter 0 errores  
**Comando**:
```bash
npm run lint
```
**Criterio éxito**: 0 errors (warnings OK)

**Tarea 1.3.4**: TypeScript check (si aplica)  
**Comando**:
```bash
npm run typecheck 2>&1 || echo "No TypeScript"
```
**Criterio éxito**: Sin errores TS

**Tarea 1.3.5**: Verificar NO hay código comentado legacy  
**Comando**:
```bash
grep -r "// COMENTADO\|// OLD\|// DEPRECATED" backend/src/ backend/*.js | wc -l
```
**Criterio éxito**: < 10 líneas comentadas legacy

---

### GRUPO 1.4: START LOCAL BACKEND (5 tareas)

**Tarea 1.4.1**: `npm start` backend  
**Comando**:
```bash
cd backend
npm start > /tmp/backend.log 2>&1 &
echo $! > /tmp/backend.pid
```
**Criterio éxito**: 
- Proceso corriendo
- PID guardado en `/tmp/backend.pid`

**Tarea 1.4.2**: Esperar 10 segundos (warm-up)  
**Comando**:
```bash
sleep 10
```
**Criterio éxito**: Proceso sigue vivo

**Tarea 1.4.3**: Health check local  
**Comando**:
```bash
curl -s http://localhost:8080/api/health | jq .
```
**Esperado**:
```json
{
  "status": "ok",
  "uptime": 10,
  "version": "1.0.0",
  "database": "mock",
  "redis": "none",
  "ai_providers": ["mammouth"],
  "memory": { "used": 50, "total": 100 }
}
```
**Criterio éxito**: Response 200 OK, `status: "ok"`

**Tarea 1.4.4**: Verificar logs backend  
**Comando**:
```bash
tail -n 50 /tmp/backend.log | grep -i "error\|exception\|crash"
```
**Criterio éxito**: 0 errores críticos

**Tarea 1.4.5**: Test NEURA CEO endpoint  
**Comando**:
```bash
curl -X POST http://localhost:8080/api/invoke/a-ceo-01 \
  -H "Content-Type: application/json" \
  -d '{"input":"test"}' | jq .
```
**Esperado**:
```json
{
  "output": "...",
  "provider": "mammouth",
  "model": "mistral-medium-3.1",
  "tokens": { "input": 1, "output": 50, "total": 51 },
  "latency_ms": 1200
}
```
**Criterio éxito**: Response 200 OK, output contiene texto

---

## 📊 FASE 2: LOCAL FRONTEND 10/10 (15 tareas)

### GRUPO 2.1: INSTALACIÓN FRONTEND (5 tareas)

**Tarea 2.1.1**: `npm install` en frontend  
**Comando**:
```bash
cd frontend
npm install
```
**Criterio éxito**: 
- `node_modules/` creado
- 0 errores en console
- 22 deps + 23 devDeps instaladas

**Tarea 2.1.2**: Verificar Vite config  
**Comando**:
```bash
node -e "console.log(require('./vite.config.ts'))"
```
**Criterio éxito**: Config carga sin errores

**Tarea 2.1.3**: Verificar TailwindCSS config  
**Comando**:
```bash
npx tailwindcss --help > /dev/null && echo "OK"
```
**Criterio éxito**: Tailwind instalado

**Tarea 2.1.4**: Linter frontend 0 errores  
**Comando**:
```bash
npm run lint
```
**Criterio éxito**: 0 errors

**Tarea 2.1.5**: TypeScript check frontend  
**Comando**:
```bash
npm run typecheck
```
**Criterio éxito**: 0 errors TS

---

### GRUPO 2.2: START FRONTEND (5 tareas)

**Tarea 2.2.1**: `npm run dev` frontend  
**Comando**:
```bash
cd frontend
npm run dev > /tmp/frontend.log 2>&1 &
echo $! > /tmp/frontend.pid
```
**Criterio éxito**: Proceso corriendo

**Tarea 2.2.2**: Esperar 5 segundos (warm-up)  
**Comando**:
```bash
sleep 5
```
**Criterio éxito**: Proceso sigue vivo

**Tarea 2.2.3**: Health check frontend  
**Comando**:
```bash
curl -s http://localhost:5173 | grep -i "econeura" | head -n 1
```
**Esperado**: HTML con "ECONEURA" en el título
**Criterio éxito**: Response 200 OK, HTML carga

**Tarea 2.2.4**: Verificar logs frontend  
**Comando**:
```bash
tail -n 50 /tmp/frontend.log | grep -i "error\|failed\|crash"
```
**Criterio éxito**: 0 errores críticos

**Tarea 2.2.5**: Screenshot homepage (opcional)  
**Comando**:
```bash
npx playwright screenshot http://localhost:5173 frontend-local.png
```
**Criterio éxito**: Screenshot generado

---

### GRUPO 2.3: TESTS FRONTEND (5 tareas)

**Tarea 2.3.1**: Unit tests frontend  
**Comando**:
```bash
cd frontend
npm test
```
**Criterio éxito**: Todos los tests pasan

**Tarea 2.3.2**: E2E tests (Playwright)  
**Comando**:
```bash
npm run test:e2e
```
**Criterio éxito**: Login test + Chat test pasan

**Tarea 2.3.3**: Build frontend  
**Comando**:
```bash
npm run build
```
**Esperado**:
- `dist/` creado
- Bundle size < 600 KB
- Build time < 20s
**Criterio éxito**: Build exitoso

**Tarea 2.3.4**: Preview build  
**Comando**:
```bash
npm run preview > /tmp/preview.log 2>&1 &
sleep 5
curl -s http://localhost:4173 | grep -i "econeura"
```
**Criterio éxito**: Build funciona en preview

**Tarea 2.3.5**: Bundle analysis  
**Comando**:
```bash
npx vite-bundle-visualizer --open=false
```
**Criterio éxito**: Chunks correctos (react-vendor, ui-vendor)

---

## 📊 FASE 3: INTEGRACIÓN LOCAL (10 tareas)

### GRUPO 3.1: BACKEND ↔ FRONTEND (5 tareas)

**Tarea 3.1.1**: Frontend llama backend health  
**Browser**: `http://localhost:5173`  
**Acción**: Abrir DevTools > Network > Recargar página  
**Esperado**: Request a `http://localhost:8080/api/health` → 200 OK  
**Criterio éxito**: Health check funciona desde frontend

**Tarea 3.1.2**: Login funcional  
**Browser**: `http://localhost:5173`  
**Acción**: 
1. Click "Iniciar sesión con Microsoft"
2. (Mock) Ingresar `test@econeura.com` / `password123`
3. Click "Entrar"
**Esperado**: Redirect a cockpit  
**Criterio éxito**: Login exitoso

**Tarea 3.1.3**: Chat con NEURA CEO  
**Browser**: Cockpit (`http://localhost:5173`)  
**Acción**:
1. Click en botón "NEURA CEO"
2. Escribir "Test mensaje"
3. Enviar
**Esperado**: Respuesta de Mistral en < 5s  
**Criterio éxito**: Chat funciona

**Tarea 3.1.4**: Verificar CORS  
**DevTools**: Console  
**Esperado**: Sin errores CORS  
**Criterio éxito**: 0 errores CORS

**Tarea 3.1.5**: Verificar tokens JWT  
**DevTools**: Application > Local Storage  
**Esperado**: `econeura_token` presente  
**Criterio éxito**: Token guardado

---

### GRUPO 3.2: TESTS E2E (5 tareas)

**Tarea 3.2.1**: E2E Login test  
**Comando**:
```bash
cd frontend
npx playwright test tests/e2e/login.spec.ts
```
**Criterio éxito**: Test pasa

**Tarea 3.2.2**: E2E Chat test  
**Comando**:
```bash
npx playwright test tests/e2e/chat.spec.ts
```
**Criterio éxito**: Test pasa

**Tarea 3.2.3**: E2E NEURAs test  
**Comando**:
```bash
npx playwright test tests/e2e/neuras.spec.ts
```
**Criterio éxito**: Test pasa

**Tarea 3.2.4**: Performance test (Lighthouse)  
**Comando**:
```bash
npx lighthouse http://localhost:5173 --output=json --output-path=/tmp/lighthouse.json
cat /tmp/lighthouse.json | jq '.categories.performance.score'
```
**Esperado**: Score ≥ 0.90  
**Criterio éxito**: Performance ≥ 90

**Tarea 3.2.5**: Accessibility test  
**Comando**:
```bash
npx lighthouse http://localhost:5173 --only-categories=accessibility --output=json --output-path=/tmp/a11y.json
cat /tmp/a11y.json | jq '.categories.accessibility.score'
```
**Esperado**: Score ≥ 0.95  
**Criterio éxito**: Accessibility ≥ 95

---

## 📊 FASE 4: PREPARACIÓN AZURE (10 tareas)

### GRUPO 4.1: INFRAESTRUCTURA AZURE (5 tareas)

**Tarea 4.1.1**: Login Azure  
**Comando**:
```bash
az login
az account set --subscription a0991f95-16e0-4f03-85df-db3d69004d94
az account show
```
**Criterio éxito**: Subscription activa

**Tarea 4.1.2**: Crear Resource Group  
**Comando**:
```bash
az group create \
  --name econeura-premium-rg \
  --location northeurope
```
**Criterio éxito**: RG creado

**Tarea 4.1.3**: Deploy Bicep infrastructure  
**Comando**:
```bash
cd azure/bicep
az deployment group create \
  --resource-group econeura-premium-rg \
  --template-file main.bicep \
  --parameters @prod.parameters.json
```
**Esperado**:
- App Service P1V3 creado
- PostgreSQL B2s creado
- Redis P1 creado
- Front Door Premium creado
- Static Web App creado
- Key Vault creado
- App Insights creado
**Criterio éxito**: Deployment exitoso, todos los recursos creados

**Tarea 4.1.4**: Configurar secrets en Key Vault  
**Comando**:
```bash
az keyvault secret set --vault-name econeura-premium-vault --name JWT-SECRET --value "$(openssl rand -base64 64)"
az keyvault secret set --vault-name econeura-premium-vault --name SESSION-SECRET --value "$(openssl rand -base64 64)"
az keyvault secret set --vault-name econeura-premium-vault --name MAMMOUTH-API-KEY --value "$MAMMOUTH_API_KEY"
```
**Criterio éxito**: 3 secrets guardados

**Tarea 4.1.5**: Configurar App Service settings  
**Comando**:
```bash
az webapp config appsettings set \
  --name econeura-backend-premium \
  --resource-group econeura-premium-rg \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    USE_MOCK_DB=false \
    DATABASE_URL="@Microsoft.KeyVault(SecretUri=https://econeura-premium-vault.vault.azure.net/secrets/DATABASE-URL/)" \
    JWT_SECRET="@Microsoft.KeyVault(SecretUri=https://econeura-premium-vault.vault.azure.net/secrets/JWT-SECRET/)" \
    SESSION_SECRET="@Microsoft.KeyVault(SecretUri=https://econeura-premium-vault.vault.azure.net/secrets/SESSION-SECRET/)" \
    MAMMOUTH_API_KEY="@Microsoft.KeyVault(SecretUri=https://econeura-premium-vault.vault.azure.net/secrets/MAMMOUTH-API-KEY/)"
```
**Criterio éxito**: Settings configurados

---

### GRUPO 4.2: DATABASE SETUP (5 tareas)

**Tarea 4.2.1**: Crear database en PostgreSQL  
**Comando**:
```bash
az postgres flexible-server db create \
  --resource-group econeura-premium-rg \
  --server-name econeura-db-premium \
  --database-name econeura
```
**Criterio éxito**: DB creada

**Tarea 4.2.2**: Configurar firewall PostgreSQL  
**Comando**:
```bash
az postgres flexible-server firewall-rule create \
  --resource-group econeura-premium-rg \
  --name econeura-db-premium \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```
**Criterio éxito**: Firewall configurado

**Tarea 4.2.3**: Ejecutar schema inicial  
**Comando**:
```bash
psql $DATABASE_URL < backend/db/schema.sql
```
**Esperado**: 5 tablas creadas (users, tokens, chats, proposals, audit_log)  
**Criterio éxito**: Schema aplicado

**Tarea 4.2.4**: Verificar conexión PostgreSQL desde local  
**Comando**:
```bash
psql $DATABASE_URL -c "SELECT version();"
```
**Criterio éxito**: Conexión exitosa

**Tarea 4.2.5**: Seed inicial (usuario test)  
**Comando**:
```bash
psql $DATABASE_URL -c "INSERT INTO users (email, name, password_hash) VALUES ('admin@econeura.com', 'Admin', 'hash');"
```
**Criterio éxito**: Usuario creado

---

## 📊 FASE 5: MIGRACIÓN (5 tareas)

### GRUPO 5.1: DEPLOYMENT (5 tareas)

**Tarea 5.1.1**: Configurar GitHub secrets  
**GitHub**: Settings > Secrets > Actions  
**Secrets a crear**:
- `AZURE_CREDENTIALS` (JSON del service principal)
- `AZURE_WEBAPP_PUBLISH_PROFILE_PREMIUM` (XML del publish profile)
- `AZURE_STATIC_WEB_APPS_API_TOKEN_PREMIUM` (Token de Static Web App)

**Comando**:
```bash
# Crear service principal
az ad sp create-for-rbac \
  --name econeura-github-actions \
  --role contributor \
  --scopes /subscriptions/a0991f95-16e0-4f03-85df-db3d69004d94/resourceGroups/econeura-premium-rg \
  --sdk-auth > azure-credentials.json

# Obtener publish profile
az webapp deployment list-publishing-profiles \
  --name econeura-backend-premium \
  --resource-group econeura-premium-rg \
  --xml > publish-profile.xml

# Obtener Static Web App token
az staticwebapp secrets list \
  --name econeura-frontend-premium \
  --resource-group econeura-premium-rg \
  --query "properties.apiKey" -o tsv
```
**Criterio éxito**: 3 secrets configurados en GitHub

**Tarea 5.1.2**: Git commit + push  
**Comando**:
```bash
git add .
git commit -m "feat: production-ready deployment with Azure Premium P1V3"
git push origin main
```
**Criterio éxito**: Push exitoso

**Tarea 5.1.3**: Monitorear GitHub Actions  
**GitHub**: Actions tab  
**Esperado**:
- Workflow `backend-deploy.yml` → ✅ Success
- Workflow `frontend-deploy.yml` → ✅ Success
- Tiempo total: < 10 min

**Criterio éxito**: Ambos workflows exitosos

**Tarea 5.1.4**: Esperar 2 minutos (warm-up Azure)  
**Comando**:
```bash
sleep 120
```
**Criterio éxito**: Tiempo transcurrido

**Tarea 5.1.5**: Health check producción  
**Comando**:
```bash
curl -s https://econeura-backend-premium.azurewebsites.net/api/health | jq .
```
**Esperado**:
```json
{
  "status": "ok",
  "uptime": 120,
  "version": "1.0.0",
  "database": "postgresql",
  "redis": "azure-cache",
  "ai_providers": ["mammouth"],
  "environment": "production"
}
```
**Criterio éxito**: Response 200 OK, `status: "ok"`, `database: "postgresql"`

---

## 📊 FASE 6: VERIFICACIÓN PRODUCCIÓN (5 tareas)

### GRUPO 6.1: SMOKE TESTS (5 tareas)

**Tarea 6.1.1**: Frontend carga en producción  
**Browser**: `https://econeura-frontend-premium.azurestaticapps.net`  
**Esperado**: Homepage carga en < 2s  
**Criterio éxito**: Frontend carga correctamente

**Tarea 6.1.2**: Login producción funciona  
**Browser**: Frontend producción  
**Acción**: Login con Microsoft  
**Esperado**: OAuth callback exitoso  
**Criterio éxito**: Login funciona

**Tarea 6.1.3**: Chat NEURA CEO producción  
**Browser**: Cockpit producción  
**Acción**: Enviar mensaje a NEURA CEO  
**Esperado**: Respuesta en < 5s  
**Criterio éxito**: Chat funciona

**Tarea 6.1.4**: Monitoring funciona  
**Azure Portal**: Application Insights  
**Esperado**:
- Requests últimos 5 min: > 0
- Failures: 0
- Response time P95: < 200ms
**Criterio éxito**: Telemetría llegando

**Tarea 6.1.5**: Logs funciona  
**Comando**:
```bash
az webapp log tail \
  --name econeura-backend-premium \
  --resource-group econeura-premium-rg
```
**Esperado**: Logs en tiempo real  
**Criterio éxito**: Logs visibles

---

## ✅ CHECKLIST FINAL

**ANTES DE DECLARAR ÉXITO, VERIFICAR**:

### Backend
- [ ] npm install 0 errores
- [ ] .env configurado correctamente
- [ ] npm start funciona
- [ ] Health check local 200 OK
- [ ] Linter 0 errores
- [ ] NEURA CEO responde localmente

### Frontend
- [ ] npm install 0 errores
- [ ] npm run dev funciona
- [ ] npm run build exitoso (< 600 KB)
- [ ] Linter 0 errores
- [ ] TypeScript 0 errores
- [ ] E2E tests pasan (login + chat)
- [ ] Lighthouse ≥ 90 performance

### Integración Local
- [ ] Frontend conecta a backend
- [ ] Login funcional
- [ ] Chat con NEURAs funciona
- [ ] 0 errores CORS
- [ ] JWT tokens guardados

### Azure
- [ ] Todos los recursos creados (7 recursos)
- [ ] Key Vault con secrets
- [ ] PostgreSQL con schema
- [ ] GitHub Actions deployments exitosos
- [ ] Health check producción 200 OK

### Producción
- [ ] Frontend carga en < 2s
- [ ] Login OAuth funciona
- [ ] Chat producción funciona
- [ ] Monitoring activo
- [ ] Logs visibles

**SI TODAS LAS 25 CHECKS ✅ → EXCELENCIA ALCANZADA**

---

## 🎯 MÉTRICAS DE ÉXITO

### Performance
- Latency P95 backend: < 100ms ✅
- Latency P95 frontend: < 50ms ✅
- Bundle size: < 600 KB ✅
- Build time: < 20s ✅

### Quality
- Test coverage backend: ≥ 80% ✅
- Test coverage frontend: ≥ 85% ✅
- Linter errors: 0 ✅
- TypeScript errors: 0 ✅

### Availability
- Backend SLA: 99.95% ✅
- Frontend SLA: 99.99% ✅
- Database SLA: 99.99% ✅
- Composite SLA: 99.95% ✅

### Security
- Secrets in Git: 0 ✅
- HTTPS everywhere: 100% ✅
- WAF enabled: Yes ✅
- MFA supported: Yes ✅

---

## 📞 SOPORTE

**Si alguna tarea falla**:
1. ABORTAR inmediatamente
2. Reportar el error exacto
3. NO continuar hasta resolver
4. Documentar la solución

**Contacto**: support@econeura.com

---

**ESTE ES EL PLAN PARA EXCELENCIA** 🔥

