# ═══════════════════════════════════════════════════════════════
# DEPLOY COMPLETO - BACKEND + FRONTEND - NUEVA CUENTA AZURE
# ═══════════════════════════════════════════════════════════════
# Suscripción: a0991f95-16e0-4f03-85df-db3d69004d94
# Directorio: econeuraoutlook.onmicrosoft.com
# ═══════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"

Write-Host "`n════════════════════════════════════════════════════════" -F Cyan
Write-Host "  🚀 DEPLOY COMPLETO - NUEVA CUENTA AZURE 🚀" -F Cyan
Write-Host "════════════════════════════════════════════════════════" -F Cyan

# ═══════════════════════════════════════════════════════════════
# CONFIGURACIÓN
# ═══════════════════════════════════════════════════════════════
$subscriptionId = "a0991f95-16e0-4f03-85df-db3d69004d94"
$rgName = "econeura-rg"
$location = "northeurope"

# Backend
$backendAppName = "econeura-backend"
$backendPlanName = "econeura-plan-free"

# Frontend
$frontendAppName = "econeura-frontend"

Write-Host "`n📋 CONFIGURACIÓN:" -F Yellow
Write-Host "• Suscripción: $subscriptionId" -F White
Write-Host "• Resource Group: $rgName" -F White
Write-Host "• Ubicación: $location" -F White
Write-Host "• Backend: $backendAppName" -F White
Write-Host "• Frontend: $frontendAppName" -F White

# ═══════════════════════════════════════════════════════════════
# PASO 1: LOGIN Y SELECCIÓN DE SUSCRIPCIÓN
# ═══════════════════════════════════════════════════════════════
Write-Host "`n[1/6] Verificando login y suscripción..." -F Yellow
Write-Host "Ejecutando: az login" -F Cyan
az login

Write-Host "`nSeleccionando suscripción correcta..." -F Cyan
az account set --subscription $subscriptionId

$currentSub = az account show --query "{name:name,id:id,state:state}" -o json | ConvertFrom-Json
Write-Host "✅ Suscripción activa:" -F Green
Write-Host "   Nombre: $($currentSub.name)" -F White
Write-Host "   ID: $($currentSub.id)" -F White
Write-Host "   Estado: $($currentSub.state)" -F White

# ═══════════════════════════════════════════════════════════════
# PASO 2: CREAR RESOURCE GROUP
# ═══════════════════════════════════════════════════════════════
Write-Host "`n[2/6] Creando Resource Group..." -F Yellow
az group create --name $rgName --location $location
Write-Host "✅ Resource Group '$rgName' creado en $location" -F Green

# ═══════════════════════════════════════════════════════════════
# PASO 3: CREAR BACKEND (APP SERVICE)
# ═══════════════════════════════════════════════════════════════
Write-Host "`n[3/6] Creando Backend (App Service)..." -F Yellow

Write-Host "   Creando App Service Plan (FREE)..." -F Cyan
az appservice plan create `
  --name $backendPlanName `
  --resource-group $rgName `
  --location $location `
  --sku FREE `
  --is-linux

Write-Host "   Creando App Service..." -F Cyan
az webapp create `
  --name $backendAppName `
  --resource-group $rgName `
  --plan $backendPlanName `
  --runtime "NODE:20-lts"

Write-Host "   Configurando settings..." -F Cyan
az webapp config appsettings set `
  --name $backendAppName `
  --resource-group $rgName `
  --settings `
    NODE_ENV="production" `
    USE_MOCK_DB="true" `
    PORT="8080" `
    WEBSITE_NODE_DEFAULT_VERSION="20-lts" `
    SCM_DO_BUILD_DURING_DEPLOYMENT="true"

Write-Host "✅ Backend creado: https://$backendAppName.azurewebsites.net" -F Green

# ═══════════════════════════════════════════════════════════════
# PASO 4: GENERAR PUBLISH PROFILE BACKEND
# ═══════════════════════════════════════════════════════════════
Write-Host "`n[4/6] Generando Publish Profile para GitHub..." -F Yellow
$publishProfile = az webapp deployment list-publishing-profiles `
  --name $backendAppName `
  --resource-group $rgName `
  --xml

$publishProfile | Out-File -FilePath "publish-profile-backend-nueva-cuenta.xml" -Encoding utf8
Write-Host "✅ Publish profile guardado en: publish-profile-backend-nueva-cuenta.xml" -F Green

# ═══════════════════════════════════════════════════════════════
# PASO 5: CREAR FRONTEND (STATIC WEB APP)
# ═══════════════════════════════════════════════════════════════
Write-Host "`n[5/6] Creando Frontend (Static Web App)..." -F Yellow
Write-Host "⚠️  Para Static Web App necesitas un token de GitHub" -F Yellow
Write-Host "   Generando token..." -F Cyan

# Intentar obtener token de GitHub CLI
$githubToken = ""
try {
    $githubToken = gh auth token 2>$null
    Write-Host "✅ Token de GitHub obtenido" -F Green
} catch {
    Write-Host "❌ No se pudo obtener token automáticamente" -F Red
    Write-Host "   Genera uno manualmente en: https://github.com/settings/tokens" -F Yellow
    Write-Host "   Permisos necesarios: repo, workflow" -F Yellow
    $githubToken = Read-Host "Pega tu GitHub token aquí"
}

Write-Host "`n   Creando Static Web App..." -F Cyan
az staticwebapp create `
  --name $frontendAppName `
  --resource-group $rgName `
  --location "westeurope" `
  --source "https://github.com/ECONEURA-MAX/econeura-perfecto" `
  --branch "main" `
  --app-location "/frontend" `
  --output-location "dist" `
  --token $githubToken

Write-Host "✅ Frontend creado: https://$frontendAppName.azurestaticapps.net" -F Green

# ═══════════════════════════════════════════════════════════════
# PASO 6: CONFIGURAR GITHUB SECRETS
# ═══════════════════════════════════════════════════════════════
Write-Host "`n[6/6] Configurando GitHub Secrets..." -F Yellow

Write-Host "`n⚠️  ACCIÓN MANUAL REQUERIDA:" -F Yellow
Write-Host "1. Abre: https://github.com/ECONEURA-MAX/econeura-perfecto/settings/secrets/actions" -F Cyan
Write-Host "2. Actualiza/Crea el secret: AZURE_WEBAPP_PUBLISH_PROFILE_PROD" -F White
Write-Host "3. Contenido: Copia todo el contenido de publish-profile-backend-nueva-cuenta.xml" -F White
Write-Host "4. Save" -F Green

Write-Host "`n════════════════════════════════════════════════════════" -F Green
Write-Host "  ✅ DEPLOY COMPLETO EXITOSO ✅" -F Green
Write-Host "════════════════════════════════════════════════════════" -F Green

Write-Host "`n📋 URLS:" -F Cyan
Write-Host "• Backend:  https://$backendAppName.azurewebsites.net" -F White
Write-Host "• Frontend: https://$frontendAppName.azurestaticapps.net" -F White
Write-Host "• Health:   https://$backendAppName.azurewebsites.net/api/health" -F White

Write-Host "`n📦 ARCHIVOS GENERADOS:" -F Cyan
Write-Host "• publish-profile-backend-nueva-cuenta.xml (para GitHub)" -F White

Write-Host "`n🎯 PRÓXIMOS PASOS:" -F Yellow
Write-Host "1. Actualizar GitHub secret con el publish profile" -F White
Write-Host "2. Trigger workflow: gh workflow run backend-deploy.yml --ref main" -F Cyan
Write-Host "3. Verificar backend: Invoke-RestMethod https://$backendAppName.azurewebsites.net/api/health | ConvertTo-Json" -F Cyan
Write-Host "4. El frontend se deployará automáticamente desde GitHub Actions" -F White

Write-Host "`n✅ TODO EN UNA CUENTA - SIN BLOQUEOS ✅" -F Green

