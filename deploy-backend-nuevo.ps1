# ════════════════════════════════════════════════════════════
# BACKEND NUEVO ULTRA EFICIENTE (Sin bloqueos - 3 minutos)
# ════════════════════════════════════════════════════════════
# Basado en código local backend/ (542 líneas, Node 20, Mock DB)
# ════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"
$newApp = "econeura-backend"
$plan = "econeura-plan-production"
$rg = "appsvc_linux_northeurope_basic"

Write-Host "`n╔════════════════════════════════════════╗" -F Cyan
Write-Host "║  BACKEND NUEVO - ULTRA EFICIENTE      ║" -F Cyan
Write-Host "╚════════════════════════════════════════╝`n" -F Cyan

# ═══ PASO 1: Crear App Service ═══
Write-Host "[1/5] Creando App Service..." -F Yellow
az webapp create `
  --name $newApp `
  --resource-group $rg `
  --plan $plan `
  --runtime "NODE:20-lts" `
  --query "defaultHostName" -o tsv

# ═══ PASO 2: Settings optimizados ═══
Write-Host "`n[2/5] Configurando (Mock DB, Node 20)..." -F Yellow
az webapp config appsettings set `
  --name $newApp `
  --resource-group $rg `
  --settings `
    NODE_ENV="production" `
    USE_MOCK_DB="true" `
    SCM_DO_BUILD_DURING_DEPLOYMENT="false" `
    WEBSITE_NODE_DEFAULT_VERSION="20-lts" `
  --query "[?name=='USE_MOCK_DB'].{Name:name,Value:value}" -o table

az webapp config set `
  --name $newApp `
  --resource-group $rg `
  --startup-file "node server.js" `
  --query "linuxFxVersion" -o tsv

# ═══ PASO 3: Publish Profile ═══
Write-Host "`n[3/5] Generando publish profile..." -F Yellow
az webapp deployment list-publishing-profiles `
  --name $newApp `
  --resource-group $rg `
  --xml > publish-profile-NEW.xml

$profileSize = (Get-Item publish-profile-NEW.xml).Length
Write-Host "✅ Profile: $profileSize bytes" -F Green

# ═══ PASO 4: Mostrar profile para GitHub ═══
Write-Host "`n[4/5] ═══ ACCIÓN MANUAL ═══" -F Red
Write-Host "`nAbre: https://github.com/ECONEURA-MAX/econeura-perfecto/settings/secrets/actions" -F Cyan
Write-Host "Secret: AZURE_WEBAPP_PUBLISH_PROFILE_PROD" -F Yellow
Write-Host "`n┌─ COPIA ESTE CONTENIDO ────────────────┐" -F Gray
Get-Content publish-profile-NEW.xml
Write-Host "└───────────────────────────────────────┘`n" -F Gray

# Usuario actualiza secret manualmente - NO bloqueante
Write-Host "`n⏳ Esperando 30s para que copies el secret..." -F Cyan
Start-Sleep 30

# ═══ PASO 5: Trigger deployment ═══
Write-Host "`n[5/5] Triggering GitHub Actions..." -F Yellow
$env:GH_TOKEN = (gh auth token)
gh workflow run backend-deploy.yml --ref main

Start-Sleep 5
gh run list --limit 1 --json conclusion,displayTitle,createdAt | ConvertFrom-Json | Format-List

Write-Host "`n╔════════════════════════════════════════╗" -F Green
Write-Host "║  ✅ BACKEND CREADO                    ║" -F Green
Write-Host "╚════════════════════════════════════════╝" -F Green

Write-Host "`nURL: https://$newApp.azurewebsites.net" -F Cyan
Write-Host "Actions: https://github.com/ECONEURA-MAX/econeura-perfecto/actions" -F Cyan
Write-Host "`n⏰ Espera 2 min y verifica:" -F Yellow
Write-Host "   Invoke-RestMethod https://$newApp.azurewebsites.net/api/health | ConvertTo-Json" -F White

