# 🚀 PLAN DE MIGRACIÓN COMPLETA - ECONEURA
**Fecha**: 12 Noviembre 2025
**Objetivo**: LOCAL → GITHUB NUEVO → AZURE NUEVA CUENTA

---

## 📋 INFORMACIÓN

### Repositorio Actual (viejo)
- URL: https://github.com/ECONEURA-MAX/econeura-perfecto
- Estado: Con historial, bloqueado por billing

### Repositorio Nuevo (limpio)
- URL: https://github.com/ECONEURA-MAX/ECONEURA-.git
- Estado: Vacío, listo para recibir código

### Azure Nueva Cuenta
- Suscripción: a0991f95-16e0-4f03-85df-db3d69004d94
- Directorio: econeuraoutlook.onmicrosoft.com
- Estado: Activo
- Rol: Propietario

---

## 🎯 FASES DE MIGRACIÓN

```
FASE 1: VERIFICAR LOCAL (10 min)
  ↓
FASE 2: PREPARAR CÓDIGO (15 min)
  ↓
FASE 3: SUBIR A GITHUB NUEVO (5 min)
  ↓
FASE 4: DEPLOYAR A AZURE NUEVA (20 min)
  ↓
FASE 5: VERIFICAR TODO (10 min)

TOTAL: 60 minutos
```

---

## ⚡ FASE 1: VERIFICAR LOCAL (10 min)

### Objetivo
Asegurar que el código local está completo y funcional.

### Comandos
```powershell
# 1.1 - Análisis rápido
.\ANALISIS_TOTAL_COMANDOS.ps1

# 1.2 - Verificar backend dependencies
cd backend
npm install
npm run verify  # o npm test si existe

# 1.3 - Verificar frontend dependencies
cd ../frontend
npm install
npm run build

# 1.4 - Volver a raíz
cd ..
```

### Checklist
- [ ] Backend: package.json instala correctamente
- [ ] Frontend: package.json instala correctamente
- [ ] Backend: build exitoso
- [ ] Frontend: build exitoso
- [ ] No hay errores críticos

### Output Esperado
```
✅ Backend: X dependencias instaladas
✅ Frontend: Y dependencias instaladas
✅ Builds exitosos
✅ Listo para subir
```

---

## 🔧 FASE 2: PREPARAR CÓDIGO (15 min)

### Objetivo
Limpiar y preparar código para nuevo repositorio.

### Comandos
```powershell
# 2.1 - Limpiar node_modules y archivos temporales
Remove-Item -Path backend/node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path frontend/node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path backend/logs/*.log -Force -ErrorAction SilentlyContinue
Remove-Item -Path *.zip -Force -ErrorAction SilentlyContinue
Remove-Item -Path publish-profile-*.xml -Force -ErrorAction SilentlyContinue

# 2.2 - Actualizar .gitignore
@"
# Dependencies
node_modules/
package-lock.json

# Logs
logs/
*.log

# Environment
.env
.env.local
.env.production

# Build
dist/
build/
.next/

# Temporales
*.zip
publish-profile-*.xml
backend.zip

# Azure
.azure/

# OS
.DS_Store
Thumbs.db
"@ | Out-File -FilePath .gitignore -Encoding utf8

# 2.3 - Crear README para nuevo repo
@"
# ECONEURA - Plataforma de IA Empresarial

## 🚀 Stack Tecnológico
- **Backend**: Node.js 20 + Express
- **Frontend**: React + TypeScript + Vite
- **Hosting**: Azure App Service + Static Web Apps
- **Database**: Mock DB (PostgreSQL futuro)

## 📦 Estructura
\`\`\`
ECONEURA/
├── backend/          # API Node.js
├── frontend/         # React App
├── .github/          # GitHub Actions
└── docs/            # Documentación
\`\`\`

## 🔧 Setup Local

### Backend
\`\`\`bash
cd backend
npm install
npm start
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## 🌐 Deploy
- Backend: Azure App Service (FREE tier)
- Frontend: Azure Static Web Apps (FREE)
- CI/CD: GitHub Actions automático

## 📝 Variables de Entorno
Ver \`backend/VARIABLES_REQUERIDAS.md\`

---
**Estado**: ✅ Activo | **Versión**: 1.0.0
"@ | Out-File -FilePath README.md -Encoding utf8
```

### Checklist
- [ ] node_modules eliminados
- [ ] Logs limpiados
- [ ] .gitignore actualizado
- [ ] README.md creado
- [ ] Archivos temporales eliminados

---

## 📤 FASE 3: SUBIR A GITHUB NUEVO (5 min)

### Objetivo
Subir código limpio al nuevo repositorio.

### Comandos
```powershell
# 3.1 - Eliminar git viejo (si existe)
Remove-Item -Path .git -Recurse -Force -ErrorAction SilentlyContinue

# 3.2 - Inicializar git nuevo
git init
git branch -M main

# 3.3 - Configurar remote (NUEVO REPOSITORIO)
git remote add origin https://github.com/ECONEURA-MAX/ECONEURA-.git

# 3.4 - Agregar archivos
git add .

# 3.5 - Commit inicial
git commit -m "feat: migración completa a nueva cuenta Azure - código limpio y optimizado"

# 3.6 - Push a nuevo repo
git push -u origin main
```

### Checklist
- [ ] Git viejo eliminado
- [ ] Git nuevo inicializado
- [ ] Remote apunta a ECONEURA-.git
- [ ] Commit creado
- [ ] Push exitoso

### Output Esperado
```
✅ Branch 'main' creado
✅ Remote configurado: ECONEURA-.git
✅ Commit exitoso
✅ Push exitoso a nuevo repositorio
```

---

## ☁️ FASE 4: DEPLOYAR A AZURE NUEVA (20 min)

### Objetivo
Crear recursos en nueva cuenta Azure y deployar.

### Comandos
```powershell
# 4.1 - Login a nueva cuenta Azure
az login

# 4.2 - Seleccionar nueva suscripción
az account set --subscription a0991f95-16e0-4f03-85df-db3d69004d94

# 4.3 - Verificar suscripción activa
az account show --query "{name:name,id:id,state:state}" -o table

# 4.4 - Ejecutar script de deploy completo
.\deploy-completo-nueva-cuenta.ps1
```

### Recursos que se crearán
1. **Resource Group**: `econeura-rg`
2. **App Service Plan**: `econeura-plan-free` (FREE tier)
3. **Backend**: `econeura-backend` (App Service)
4. **Frontend**: `econeura-frontend` (Static Web App)

### Checklist
- [ ] Login exitoso en nueva cuenta
- [ ] Suscripción correcta seleccionada
- [ ] Resource Group creado
- [ ] Backend App Service creado
- [ ] Frontend Static Web App creado
- [ ] Publish profile generado

### Output Esperado
```
✅ Resource Group: econeura-rg
✅ Backend: https://econeura-backend.azurewebsites.net
✅ Frontend: https://econeura-frontend.azurestaticapps.net
✅ Publish profile: publish-profile-backend-nueva-cuenta.xml
```

---

## 🔐 FASE 4.5: CONFIGURAR GITHUB SECRETS (5 min)

### Objetivo
Conectar GitHub Actions con Azure nueva.

### Pasos Manuales
1. **Abrir GitHub Secrets**
   - URL: https://github.com/ECONEURA-MAX/ECONEURA-/settings/secrets/actions

2. **Crear Secret para Backend**
   - Name: `AZURE_WEBAPP_PUBLISH_PROFILE_PROD`
   - Value: Copiar TODO el contenido de `publish-profile-backend-nueva-cuenta.xml`
   - Click: "Add secret"

### Checklist
- [ ] Secret creado: AZURE_WEBAPP_PUBLISH_PROFILE_PROD
- [ ] Contenido correcto del publish profile

---

## 🚀 FASE 5: DEPLOY AUTOMÁTICO (5 min)

### Objetivo
Triggerear GitHub Actions para deploy automático.

### Comandos
```powershell
# 5.1 - Verificar workflows en nuevo repo
gh repo view ECONEURA-MAX/ECONEURA- --web

# 5.2 - Trigger workflow backend (manual)
gh workflow run backend-deploy.yml --repo ECONEURA-MAX/ECONEURA- --ref main

# O hacer un push para trigger automático
git commit --allow-empty -m "trigger: deploy automático backend y frontend"
git push
```

### Checklist
- [ ] Workflow backend triggereado
- [ ] Workflow frontend triggereado
- [ ] GitHub Actions ejecutándose

---

## ✅ FASE 6: VERIFICAR TODO (10 min)

### Objetivo
Confirmar que todo funciona en nuevo entorno.

### Comandos
```powershell
# 6.1 - Verificar backend health
Invoke-RestMethod https://econeura-backend.azurewebsites.net/api/health | ConvertTo-Json

# 6.2 - Verificar frontend
Start-Process https://econeura-frontend.azurestaticapps.net

# 6.3 - Ver logs backend
az webapp log tail --name econeura-backend --resource-group econeura-rg

# 6.4 - Ver GitHub Actions
gh run list --repo ECONEURA-MAX/ECONEURA- --limit 5
```

### Checklist Final
- [ ] Backend responde (200 OK)
- [ ] Frontend carga correctamente
- [ ] API calls funcionan
- [ ] No hay errores en logs
- [ ] GitHub Actions verde (✅)

### Output Esperado
```json
{
  "status": "ok",
  "uptime": 123,
  "timestamp": "2025-11-12T...",
  "database": "mock",
  "services": {
    "ai_gateway": "operational"
  }
}
```

---

## 🔄 ROLLBACK PLAN (Si algo falla)

### Si falla FASE 3 (GitHub)
```powershell
# Revertir a estado anterior
git remote remove origin
git remote add origin https://github.com/ECONEURA-MAX/econeura-perfecto.git
```

### Si falla FASE 4 (Azure)
```powershell
# Eliminar recursos creados
az group delete --name econeura-rg --yes --no-wait

# Volver a cuenta vieja
az account set --subscription <ID_VIEJA>
```

### Si falla FASE 5 (Deploy)
- Revisar logs GitHub Actions
- Verificar secret publish profile
- Re-generar publish profile si necesario

---

## 📊 RESUMEN DE RECURSOS

### Recursos que SE CREARÁN (Nueva Cuenta)
| Recurso | Tipo | Tier | Costo/mes |
|---------|------|------|-----------|
| econeura-rg | Resource Group | - | $0 |
| econeura-plan-free | App Service Plan | FREE | $0 |
| econeura-backend | App Service | FREE | $0 |
| econeura-frontend | Static Web App | FREE | $0 |
| **TOTAL** | | | **$0** |

### Recursos que SE ELIMINARÁN (Cuenta Vieja)
- Ya eliminados en sesión anterior
- Cuenta vieja bloqueada por billing

---

## 🎯 CRITERIOS DE ÉXITO

### Técnicos
- ✅ Backend responde en nueva URL
- ✅ Frontend carga en nueva URL
- ✅ GitHub Actions verde
- ✅ Variables de entorno correctas
- ✅ Logs sin errores críticos

### Operacionales
- ✅ Nuevo repo GitHub activo
- ✅ Nueva cuenta Azure sin billing issues
- ✅ CI/CD funcionando automáticamente
- ✅ Rollback disponible si necesario

### Documentación
- ✅ README actualizado
- ✅ Variables documentadas
- ✅ Scripts de deploy creados
- ✅ Plan de migración ejecutado

---

## 📝 NOTAS IMPORTANTES

1. **No tocar cuenta vieja**: Dejar la suscripción vieja intacta (bloqueada)
2. **GitHub nuevo**: ECONEURA-.git es el repositorio principal ahora
3. **URLs nuevas**: Actualizar en frontend las URLs del backend
4. **Secrets**: Solo copiar los necesarios, NO los de cuenta vieja
5. **Testing**: Probar TODO antes de marcar como completado

---

## ⏱️ TIMELINE ESPERADO

```
00:00 - INICIO
00:10 - Verificación local completa ✅
00:25 - Código preparado y limpio ✅
00:30 - Código en GitHub nuevo ✅
00:50 - Azure nueva cuenta deployada ✅
00:55 - GitHub Actions configurado ✅
01:00 - TODO VERIFICADO Y FUNCIONANDO ✅
```

---

## 🚀 PRÓXIMO PASO

**EJECUTAR:**
```powershell
.\ANALISIS_TOTAL_COMANDOS.ps1
```

Después de ver los resultados, continuar con FASE 2.

---

**PLAN CREADO**: 12 Nov 2025 11:45
**EJECUTOR**: Usuario (manual)
**SUPERVISOR**: AI (verificación)
**OBJETIVO**: MIGRACIÓN 100% EXITOSA

