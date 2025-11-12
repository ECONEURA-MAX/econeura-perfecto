# 🎯 PLAN POR TAREAS - LOCAL 10/10 PRIMERO

**Fecha**: 12 Nov 2025
**Principio**: LOCAL perfecto → DESPUÉS migrar
**Total tareas**: 65 tareas específicas

---

## 🎯 REGLA FUNDAMENTAL

```
SI GRUPO N tiene ❌ → ABORTAR
NO continuar hasta GRUPO N = 100% ✅
```

---

## 📋 GRUPO 1: LOCAL BACKEND 10/10 (20 tareas)

### Tarea 1.1: Instalar dependencies backend
**Comando**:
```powershell
cd backend
npm install
```
**Verificación**: Sin errores
**Estado**: [ ] Pendiente

### Tarea 1.2: Leer package.json completo
**Archivo**: backend/package.json
**Acción**: Leer TODAS las líneas + listar dependencies
**Estado**: [ ] Pendiente

### Tarea 1.3: Leer server.js completo
**Archivo**: backend/server.js (542 líneas)
**Acción**: Leer en chunks de 200 líneas (3 chunks)
**Verificar**: imports, routes, middleware
**Estado**: [ ] Pendiente

### Tarea 1.4: Leer startup-safe.js completo
**Archivo**: backend/startup-safe.js (62 líneas)
**Acción**: Leer completo en 1 chunk
**Estado**: [ ] Pendiente

### Tarea 1.5: Leer envValidation.js completo
**Archivo**: backend/config/envValidation.js (110 líneas)
**Acción**: Leer completo
**Verificar**: variables requeridas
**Estado**: [ ] Pendiente

### Tarea 1.6: Leer db.js completo
**Archivo**: backend/db/db.js
**Acción**: Leer completo
**Estado**: [ ] Pendiente

### Tarea 1.7: Leer db-mock.js completo
**Archivo**: backend/db-mock.js (113 líneas)
**Acción**: Leer completo
**Verificar**: métodos query(), users, tokens
**Estado**: [ ] Pendiente

### Tarea 1.8: Leer health.js completo
**Archivo**: backend/api/health.js
**Acción**: Leer completo
**Estado**: [ ] Pendiente

### Tarea 1.9: Leer TODAS routes/*.js
**Archivos**: 8 archivos en backend/routes/
**Acción**: Leer cada uno completo
**Verificar**: exports correctos
**Estado**: [ ] Pendiente

### Tarea 1.10: Leer TODAS services/*.js
**Archivos**: 6+ archivos en backend/services/
**Acción**: Leer los principales completos
**Estado**: [ ] Pendiente

### Tarea 1.11: Leer TODOS middleware/*.js
**Archivos**: 5+ archivos en backend/middleware/
**Acción**: Leer cada uno completo
**Estado**: [ ] Pendiente

### Tarea 1.12: Verificar imports no rotos
**Acción**: grep imports + verificar archivos existen
**Comando**:
```powershell
Select-String -Path backend/**/*.js -Pattern "require\(|import " | Select-Object -First 50
```
**Estado**: [ ] Pendiente

### Tarea 1.13: Verificar exports no rotos
**Acción**: grep exports + verificar coherencia
**Estado**: [ ] Pendiente

### Tarea 1.14: Crear .env local
**Archivo**: backend/.env
**Contenido**:
```
NODE_ENV=development
PORT=8080
USE_MOCK_DB=true
```
**Estado**: [ ] Pendiente

### Tarea 1.15: INICIAR backend local
**Comando**:
```powershell
cd backend
npm start
```
**Verificación**: Inicia SIN crashes
**CRÍTICO**: Si falla → ABORTAR TODO
**Estado**: [ ] Pendiente

### Tarea 1.16: Health check local
**Comando**:
```powershell
Invoke-RestMethod http://localhost:8080/api/health
```
**Verificación**: Responde 200 OK
**CRÍTICO**: Si falla → ABORTAR TODO
**Estado**: [ ] Pendiente

### Tarea 1.17: Verificar logs backend
**Acción**: Revisar logs backend, sin errores críticos
**Estado**: [ ] Pendiente

### Tarea 1.18: Detener backend
**Comando**: Ctrl+C o Stop-Process
**Estado**: [ ] Pendiente

### Tarea 1.19: Documentar variables entorno
**Archivo**: VARIABLES_BACKEND.md
**Acción**: Listar TODAS las process.env usadas
**Estado**: [ ] Pendiente

### Tarea 1.20: Backend LOCAL 10/10 ✅
**Verificación**: Todas las tareas 1.1-1.19 completas
**Estado**: [ ] Pendiente

---

## 📋 GRUPO 2: LOCAL FRONTEND 10/10 (15 tareas)

### Tarea 2.1: Instalar dependencies frontend
**Comando**:
```powershell
cd frontend
npm install
```
**Verificación**: Sin errores
**Estado**: [ ] Pendiente

### Tarea 2.2: Leer package.json completo
**Archivo**: frontend/package.json
**Acción**: Leer TODAS las líneas + listar dependencies
**Estado**: [ ] Pendiente

### Tarea 2.3: Leer vite.config.ts completo
**Archivo**: frontend/vite.config.ts
**Acción**: Leer completo
**Estado**: [ ] Pendiente

### Tarea 2.4: Leer App.tsx completo
**Archivo**: frontend/src/App.tsx
**Acción**: Leer completo
**Estado**: [ ] Pendiente

### Tarea 2.5: Leer main.tsx completo
**Archivo**: frontend/src/main.tsx
**Acción**: Leer completo
**Estado**: [ ] Pendiente

### Tarea 2.6: Leer TODAS pages/*.tsx
**Archivos**: Todas las páginas en src/pages/
**Acción**: Listar + leer las principales
**Estado**: [ ] Pendiente

### Tarea 2.7: Leer components principales
**Archivos**: Componentes principales en src/components/
**Acción**: Listar + leer los más usados
**Estado**: [ ] Pendiente

### Tarea 2.8: Leer services/*.ts
**Archivos**: API calls en src/services/
**Acción**: Leer completos
**Verificar**: URLs backend correctas
**Estado**: [ ] Pendiente

### Tarea 2.9: Verificar imports no rotos
**Acción**: grep imports + verificar archivos existen
**Estado**: [ ] Pendiente

### Tarea 2.10: Crear .env.local
**Archivo**: frontend/.env.local
**Contenido**:
```
VITE_API_URL=http://localhost:8080
```
**Estado**: [ ] Pendiente

### Tarea 2.11: INICIAR frontend local
**Comando**:
```powershell
cd frontend
npm run dev
```
**Verificación**: Inicia SIN crashes
**CRÍTICO**: Si falla → ABORTAR TODO
**Estado**: [ ] Pendiente

### Tarea 2.12: Abrir frontend en navegador
**URL**: http://localhost:5173
**Verificación**: Carga correctamente
**CRÍTICO**: Si falla → ABORTAR TODO
**Estado**: [ ] Pendiente

### Tarea 2.13: Verificar console browser
**Acción**: Abrir DevTools, verificar sin errores críticos
**Estado**: [ ] Pendiente

### Tarea 2.14: Detener frontend
**Comando**: Ctrl+C o Stop-Process
**Estado**: [ ] Pendiente

### Tarea 2.15: Frontend LOCAL 10/10 ✅
**Verificación**: Todas las tareas 2.1-2.14 completas
**Estado**: [ ] Pendiente

---

## 📋 GRUPO 3: PREPARAR MIGRACIÓN (10 tareas)

### Tarea 3.1: Limpiar node_modules
**Comando**:
```powershell
Remove-Item backend/node_modules -Recurse -Force
Remove-Item frontend/node_modules -Recurse -Force
```
**Estado**: [ ] Pendiente

### Tarea 3.2: Limpiar logs
**Comando**:
```powershell
Remove-Item backend/logs/*.log -Force
```
**Estado**: [ ] Pendiente

### Tarea 3.3: Limpiar temporales
**Comando**:
```powershell
Remove-Item *.zip -Force
Remove-Item publish-profile-*.xml -Force
```
**Estado**: [ ] Pendiente

### Tarea 3.4: Actualizar .gitignore
**Acción**: Asegurar que excluye node_modules, logs, .env, etc.
**Estado**: [ ] Pendiente

### Tarea 3.5: Crear README.md nuevo
**Archivo**: README.md en raíz
**Contenido**: Instrucciones setup local + deploy
**Estado**: [ ] Pendiente

### Tarea 3.6: Verificar .env.example
**Acción**: Crear .env.example SIN secrets
**Estado**: [ ] Pendiente

### Tarea 3.7: Actualizar workflows
**Archivos**: .github/workflows/*.yml
**Acción**: Verificar apuntan a nuevo repo y Azure
**Estado**: [ ] Pendiente

### Tarea 3.8: Crear VARIABLES_ENTORNO.md
**Archivo**: VARIABLES_ENTORNO.md
**Contenido**: TODAS las variables necesarias backend + frontend
**Estado**: [ ] Pendiente

### Tarea 3.9: Crear DEPLOYMENT_CHECKLIST.md
**Archivo**: DEPLOYMENT_CHECKLIST.md
**Contenido**: Pasos para deploy manual
**Estado**: [ ] Pendiente

### Tarea 3.10: Código listo para migrar ✅
**Verificación**: Todas las tareas 3.1-3.9 completas
**Estado**: [ ] Pendiente

---

## 📋 GRUPO 4: SUBIR A GITHUB NUEVO (5 tareas)

**⚠️ SOLO SI GRUPOS 1, 2, 3 = 100% ✅**

### Tarea 4.1: Inicializar git nuevo
**Comandos**:
```powershell
Remove-Item .git -Recurse -Force
git init
git branch -M main
git remote add origin https://github.com/ECONEURA-MAX/ECONEURA-.git
```
**Estado**: [ ] Pendiente

### Tarea 4.2: Agregar archivos
**Comando**:
```powershell
git add .
```
**Verificación**: Revisar que NO incluye node_modules, logs, .env
**Estado**: [ ] Pendiente

### Tarea 4.3: Commit
**Comando**:
```powershell
git commit -m "feat: migración completa - código local 10/10 verificado"
```
**Estado**: [ ] Pendiente

### Tarea 4.4: Push a nuevo repo
**Comando**:
```powershell
git push -u origin main
```
**Verificación**: Push exitoso
**Estado**: [ ] Pendiente

### Tarea 4.5: Verificar en GitHub web
**URL**: https://github.com/ECONEURA-MAX/ECONEURA-
**Acción**: Abrir navegador, verificar código subió
**Estado**: [ ] Pendiente

---

## 📋 GRUPO 5: DEPLOY AZURE NUEVA CUENTA (10 tareas)

**⚠️ SOLO SI GRUPO 4 = 100% ✅**

### Tarea 5.1: Login Azure nueva cuenta
**Comando**:
```powershell
az login
```
**Estado**: [ ] Pendiente

### Tarea 5.2: Seleccionar suscripción
**Comando**:
```powershell
az account set --subscription a0991f95-16e0-4f03-85df-db3d69004d94
az account show
```
**Verificación**: Suscripción correcta activa
**Estado**: [ ] Pendiente

### Tarea 5.3: Crear resource group
**Comando**:
```powershell
az group create --name econeura-rg --location northeurope
```
**Estado**: [ ] Pendiente

### Tarea 5.4: Crear app service plan
**Comando**:
```powershell
az appservice plan create --name econeura-plan-free --resource-group econeura-rg --sku FREE --is-linux
```
**Estado**: [ ] Pendiente

### Tarea 5.5: Crear backend app service
**Comando**:
```powershell
az webapp create --name econeura-backend --resource-group econeura-rg --plan econeura-plan-free --runtime "NODE:20-lts"
```
**Estado**: [ ] Pendiente

### Tarea 5.6: Configurar backend settings
**Comando**:
```powershell
az webapp config appsettings set --name econeura-backend --resource-group econeura-rg --settings NODE_ENV=production USE_MOCK_DB=true
```
**Estado**: [ ] Pendiente

### Tarea 5.7: Generar publish profile
**Comando**:
```powershell
az webapp deployment list-publishing-profiles --name econeura-backend --resource-group econeura-rg --xml | Out-File publish-profile-nuevo.xml
```
**Estado**: [ ] Pendiente

### Tarea 5.8: Actualizar GitHub secret
**Acción Manual**:
1. Ir a https://github.com/ECONEURA-MAX/ECONEURA-/settings/secrets/actions
2. Crear: AZURE_WEBAPP_PUBLISH_PROFILE_PROD
3. Copiar contenido de publish-profile-nuevo.xml
**Estado**: [ ] Pendiente

### Tarea 5.9: Trigger workflow
**Comando**:
```powershell
gh workflow run backend-deploy.yml --repo ECONEURA-MAX/ECONEURA- --ref main
```
**Estado**: [ ] Pendiente

### Tarea 5.10: Verificar deployment exitoso
**Acción**: Ver GitHub Actions, esperar ✅
**Estado**: [ ] Pendiente

---

## 📋 GRUPO 6: VERIFICAR PRODUCCIÓN (5 tareas)

**⚠️ SOLO SI GRUPO 5 = 100% ✅**

### Tarea 6.1: Backend URL responde
**Comando**:
```powershell
Invoke-RestMethod https://econeura-backend.azurewebsites.net/api/health
```
**Verificación**: Responde 200 OK
**Estado**: [ ] Pendiente

### Tarea 6.2: Frontend URL carga
**URL**: https://econeura-frontend.azurestaticapps.net
**Acción**: Abrir navegador, verificar carga
**Estado**: [ ] Pendiente

### Tarea 6.3: API calls funcionan
**Acción**: En frontend, hacer llamada al backend
**Verificación**: Sin errores CORS, respuestas correctas
**Estado**: [ ] Pendiente

### Tarea 6.4: Logs sin errores
**Comando**:
```powershell
az webapp log tail --name econeura-backend --resource-group econeura-rg
```
**Verificación**: Sin errores críticos
**Estado**: [ ] Pendiente

### Tarea 6.5: TODO funcionando ✅
**Verificación**: Todas las tareas 6.1-6.4 completas
**Estado**: [ ] Pendiente

---

## 📊 PROGRESO TOTAL

```
GRUPO 1: LOCAL BACKEND     [ ] 0/20 tareas
GRUPO 2: LOCAL FRONTEND    [ ] 0/15 tareas
GRUPO 3: PREPARAR          [ ] 0/10 tareas
GRUPO 4: GITHUB            [ ] 0/5 tareas
GRUPO 5: AZURE             [ ] 0/10 tareas
GRUPO 6: VERIFICAR         [ ] 0/5 tareas
───────────────────────────────────────────
TOTAL:                     [ ] 0/65 tareas
```

---

## ✅ CRITERIO DE ÉXITO

```
GRUPO 1 = 20/20 ✅ → Continuar GRUPO 2
GRUPO 2 = 15/15 ✅ → Continuar GRUPO 3
GRUPO 3 = 10/10 ✅ → Continuar GRUPO 4
GRUPO 4 = 5/5 ✅   → Continuar GRUPO 5
GRUPO 5 = 10/10 ✅ → Continuar GRUPO 6
GRUPO 6 = 5/5 ✅   → MIGRACIÓN COMPLETA
```

**SI CUALQUIER TAREA = ❌ → ABORTAR Y ARREGLAR**

---

**PLAN POR TAREAS - LOCAL 10/10 PRIMERO**
**65 tareas específicas y verificables**
**Garantía: LOCAL perfecto → Migración exitosa**

