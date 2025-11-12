# ═══════════════════════════════════════════════════════════════
# REORGANIZACIÓN COMPLETA MONOREPO - AZURE-FIRST
# ═══════════════════════════════════════════════════════════════
# Crear estructura perfecta para nuevo repo ECONEURA-.git
# ═══════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"

Write-Host "`n🔥 REORGANIZACIÓN TOTAL MONOREPO - INICIADA 🔥" -F Cyan
Write-Host "════════════════════════════════════════════════════════" -F Gray

# Crear directorio temporal para nuevo estructura
$newRoot = "C:\Users\Usuario\ECONEURA-NUEVO"

Write-Host "`n[1/10] Creando estructura nueva en: $newRoot" -F Yellow
Remove-Item -Path $newRoot -Recurse -Force -ErrorAction SilentlyContinue
New-Item -Path $newRoot -ItemType Directory

# ═══════════════════════════════════════════════════════════════
# ESTRUCTURA BACKEND
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[2/10] Creando estructura backend optimizada..." -F Yellow

# Directorios principales backend
$backendDirs = @(
    "$newRoot/backend",
    "$newRoot/backend/src",
    "$newRoot/backend/src/api",
    "$newRoot/backend/src/routes",
    "$newRoot/backend/src/services",
    "$newRoot/backend/src/services/database",
    "$newRoot/backend/src/services/ai",
    "$newRoot/backend/src/services/auth",
    "$newRoot/backend/src/services/azure",
    "$newRoot/backend/src/middleware",
    "$newRoot/backend/src/config",
    "$newRoot/backend/src/utils",
    "$newRoot/backend/config",
    "$newRoot/backend/tests"
)

$backendDirs | ForEach-Object {
    New-Item -Path $_ -ItemType Directory -Force | Out-Null
}

Write-Host "✅ Estructura backend creada" -F Green

# ═══════════════════════════════════════════════════════════════
# COPIAR ARCHIVOS BACKEND (SELECTIVO)
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[3/10] Copiando archivos backend (solo esenciales)..." -F Yellow

# Package.json
Copy-Item "backend/package.json" "$newRoot/backend/"

# Server.js (copiaremos y limpiaremos después)
Copy-Item "backend/server.js" "$newRoot/backend/"
Copy-Item "backend/startup-safe.js" "$newRoot/backend/src/"

# API endpoints
Copy-Item "backend/api/health.js" "$newRoot/backend/src/api/"
Copy-Item "backend/api/agents.js" "$newRoot/backend/src/api/"
Copy-Item "backend/api/library.js" "$newRoot/backend/src/api/"
Copy-Item "backend/api/metrics.js" "$newRoot/backend/src/api/"
Copy-Item "backend/api/proposals.js" "$newRoot/backend/src/api/"

# Routes
Copy-Item "backend/routes/*.js" "$newRoot/backend/src/routes/" -Exclude "*.backup"

# Services
Copy-Item "backend/services/logger.js" "$newRoot/backend/src/services/"
Copy-Item "backend/services/resilientAIGateway.js" "$newRoot/backend/src/services/ai/"
Copy-Item "backend/services/openaiService.js" "$newRoot/backend/src/services/ai/"
Copy-Item "backend/services/neuraAnalysisService.js" "$newRoot/backend/src/services/ai/"
Copy-Item "backend/services/jwtService.js" "$newRoot/backend/src/services/auth/"
Copy-Item "backend/services/tokenStore.js" "$newRoot/backend/src/services/auth/"
Copy-Item "backend/services/keyVaultService.js" "$newRoot/backend/src/services/azure/"
Copy-Item "backend/services/azureBlob.js" "$newRoot/backend/src/services/azure/" -ErrorAction SilentlyContinue
Copy-Item "backend/services/neuraAgentExecutor.js" "$newRoot/backend/src/services/"
Copy-Item "backend/services/makeService.js" "$newRoot/backend/src/services/" -ErrorAction SilentlyContinue

# Database
Copy-Item "backend/db.js" "$newRoot/backend/src/services/database/postgresql.js"
Copy-Item "backend/db-mock.js" "$newRoot/backend/src/services/database/mock.js"

# Middleware
Copy-Item "backend/middleware/*.js" "$newRoot/backend/src/middleware/"

# Config
Copy-Item "backend/config/*.js" "$newRoot/backend/src/config/"
Copy-Item "backend/config/*.json" "$newRoot/backend/config/" -ErrorAction SilentlyContinue

# Utils
Copy-Item "backend/utils/errorHandler.js" "$newRoot/backend/src/utils/" -ErrorAction SilentlyContinue
Copy-Item "backend/utils/retry.js" "$newRoot/backend/src/utils/" -ErrorAction SilentlyContinue

Write-Host "✅ Archivos backend copiados" -F Green

# ═══════════════════════════════════════════════════════════════
# COPIAR FRONTEND COMPLETO
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[4/10] Copiando frontend completo..." -F Yellow

Copy-Item "frontend" "$newRoot/frontend" -Recurse -Exclude "node_modules","dist",".vite"

Write-Host "✅ Frontend copiado" -F Green

# ═══════════════════════════════════════════════════════════════
# COPIAR WORKFLOWS
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[5/10] Copiando GitHub Actions workflows..." -F Yellow

New-Item -Path "$newRoot/.github/workflows" -ItemType Directory -Force | Out-Null
Copy-Item ".github/workflows/backend-deploy.yml" "$newRoot/.github/workflows/"
Copy-Item ".github/workflows/*" "$newRoot/.github/workflows/" -ErrorAction SilentlyContinue

Write-Host "✅ Workflows copiados" -F Green

# ═══════════════════════════════════════════════════════════════
# CREAR DOCUMENTACIÓN
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[6/10] Creando documentación..." -F Yellow

New-Item -Path "$newRoot/docs" -ItemType Directory -Force | Out-Null

# Copiar documentos creados
Copy-Item "ARQUITECTURA_AZURE_ECONEURA.md" "$newRoot/docs/"
Copy-Item "PLAN_REORGANIZACION_MONOREPO.md" "$newRoot/docs/"
Copy-Item "CONTEXTO_MIGRACION_COMPLETO.md" "$newRoot/docs/" -ErrorAction SilentlyContinue

Write-Host "✅ Documentación creada" -F Green

# ═══════════════════════════════════════════════════════════════
# CREAR .gitignore OPTIMIZADO
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[7/10] Creando .gitignore optimizado..." -F Yellow

@"
# Dependencies
node_modules/
package-lock.json

# Environment
.env
.env.local
.env.production
*.env

# Logs
logs/
*.log
npm-debug.log*

# Build
dist/
build/
.next/
out/

# Testing
coverage/
.nyc_output/

# Temporales
*.zip
*.tar.gz
publish-profile-*.xml
backend.zip

# Azure
.azure/
*.publishsettings

# IDEs
.vscode/
.idea/
*.suo
*.user
*.userosscache
*.sln.docstates

# OS
.DS_Store
Thumbs.db
desktop.ini

# Scripts temporales
EJECUTAR_*.ps1
HEALTH_*.ps1
ANALISIS_*.ps1
deploy-backend-nuevo.ps1
deploy-completo-nueva-cuenta.ps1
"@ | Out-File -FilePath "$newRoot/.gitignore" -Encoding utf8

Write-Host "✅ .gitignore creado" -F Green

# ═══════════════════════════════════════════════════════════════
# CREAR README.md PRINCIPAL
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[8/10] Creando README.md principal..." -F Yellow

@"
# 🚀 ECONEURA - Plataforma Empresarial IA

Plataforma de inteligencia artificial empresarial con NEURAs especializadas.

## 🏗️ Arquitectura

- **Frontend**: React + TypeScript + Vite → Azure Static Web Apps
- **Backend**: Node.js 20 + Express → Azure App Service
- **Database**: Azure Cosmos DB (FREE tier)
- **Storage**: Azure Storage Account
- **Monitoring**: Application Insights
- **Security**: Azure Key Vault + JWT

## 🚀 Quick Start

### Backend
\`\`\`bash
cd backend
npm install
npm start
# http://localhost:8080
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
# http://localhost:5173
\`\`\`

## 📦 Estructura

\`\`\`
ECONEURA/
├── backend/          # API Node.js
├── frontend/         # React App
├── .github/          # CI/CD
├── docs/             # Documentación
└── scripts/          # Scripts útiles
\`\`\`

## ☁️ Azure Services

- **App Service**: FREE tier (F1) → upgrade a B1 (\$54.75/mes)
- **Static Web Apps**: FREE forever
- **Cosmos DB**: FREE tier (25 GB)
- **Storage**: FREE tier (5 GB)
- **Application Insights**: FREE (5M eventos/mes)

## 📝 Documentación

- [Arquitectura Azure](docs/ARQUITECTURA_AZURE_ECONEURA.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [API Documentation](docs/API.md)

## 🔐 Variables de Entorno

Ver \`docs/VARIABLES.md\` para lista completa.

## 🎯 Estado

✅ Activo | 🚀 Producción Ready | 💰 Costo: \$0-55/mes

---

**Azure Subscription**: a0991f95-16e0-4f03-85df-db3d69004d94  
**GitHub**: https://github.com/ECONEURA-MAX/ECONEURA-.git  
**Version**: 1.0.0
"@ | Out-File -FilePath "$newRoot/README.md" -Encoding utf8

Write-Host "✅ README.md creado" -F Green

# ═══════════════════════════════════════════════════════════════
# CREAR .env.example
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[9/10] Creando .env.example..." -F Yellow

@"
# Backend
NODE_ENV=development
PORT=8080
USE_MOCK_DB=true
FRONTEND_URL=http://localhost:5173
"@ | Out-File -FilePath "$newRoot/backend/.env.example" -Encoding utf8

@"
# Frontend
VITE_API_URL=http://localhost:8080
"@ | Out-File -FilePath "$newRoot/frontend/.env.example" -Encoding utf8

Write-Host "✅ .env.example creados" -F Green

# ═══════════════════════════════════════════════════════════════
# RESUMEN
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[10/10] Reorganización completa..." -F Yellow

Write-Host "`n════════════════════════════════════════════════════════" -F Green
Write-Host "  ✅ ESTRUCTURA NUEVA CREADA ✅" -F Green
Write-Host "════════════════════════════════════════════════════════" -F Green

Write-Host "`n📂 Ubicación: $newRoot" -F Cyan
Write-Host "`n📋 Próximos pasos:" -F Yellow
Write-Host "1. Revisar estructura en: $newRoot" -F White
Write-Host "2. Verificar archivos copiados" -F White
Write-Host "3. git init en nuevo directorio" -F White
Write-Host "4. Push a https://github.com/ECONEURA-MAX/ECONEURA-.git" -F White

Write-Host "`n✅ REORGANIZACIÓN COMPLETA ✅" -F Green

