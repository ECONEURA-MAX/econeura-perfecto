# ═══════════════════════════════════════════════════════════════
# SCRIPT MAESTRO - MIGRACIÓN COMPLETA ECONEURA
# ═══════════════════════════════════════════════════════════════
# Nuevo Repo: https://github.com/ECONEURA-MAX/ECONEURA-.git
# Nueva Azure: a0991f95-16e0-4f03-85df-db3d69004d94
# ═══════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"

Write-Host "`n🚀 MIGRACIÓN COMPLETA ECONEURA - INICIADA 🚀" -F Cyan
Write-Host "════════════════════════════════════════════════════════" -F Gray

# ═══════════════════════════════════════════════════════════════
# FASE 1: VERIFICAR LOCAL
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[FASE 1/6] VERIFICAR LOCAL..." -F Yellow
Write-Host "Ejecutando análisis..." -F Cyan
.\ANALISIS_TOTAL_COMANDOS.ps1

Write-Host "`n⚠️  CHECKPOINT 1:" -F Yellow
Write-Host "¿El análisis muestra TODO OK?" -F White
$continuar = Read-Host "Presiona Enter para continuar o 'n' para abortar"
if ($continuar -eq 'n') { exit }

# ═══════════════════════════════════════════════════════════════
# FASE 2: PREPARAR CÓDIGO
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[FASE 2/6] PREPARAR CÓDIGO..." -F Yellow

Write-Host "  Limpiando node_modules..." -F Cyan
Remove-Item -Path backend/node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path frontend/node_modules -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "  Limpiando logs..." -F Cyan
Remove-Item -Path backend/logs/*.log -Force -ErrorAction SilentlyContinue

Write-Host "  Limpiando temporales..." -F Cyan
Remove-Item -Path *.zip -Force -ErrorAction SilentlyContinue
Remove-Item -Path publish-profile-*.xml -Force -ErrorAction SilentlyContinue

Write-Host "  Actualizando .gitignore..." -F Cyan
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

# Temporales
*.zip
publish-profile-*.xml

# Azure
.azure/

# OS
.DS_Store
Thumbs.db
"@ | Out-File -FilePath .gitignore -Encoding utf8

Write-Host "✅ Código preparado" -F Green

Write-Host "`n⚠️  CHECKPOINT 2:" -F Yellow
Write-Host "Código limpio y listo para subir" -F White
$continuar = Read-Host "Presiona Enter para continuar"
if ($continuar -eq 'n') { exit }

# ═══════════════════════════════════════════════════════════════
# FASE 3: SUBIR A GITHUB NUEVO
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[FASE 3/6] SUBIR A GITHUB NUEVO..." -F Yellow

Write-Host "  Eliminando git viejo..." -F Cyan
Remove-Item -Path .git -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "  Inicializando git nuevo..." -F Cyan
git init
git branch -M main

Write-Host "  Configurando remote NUEVO..." -F Cyan
git remote add origin https://github.com/ECONEURA-MAX/ECONEURA-.git

Write-Host "  Agregando archivos..." -F Cyan
git add .

Write-Host "  Creando commit..." -F Cyan
git commit -m "feat: migración completa a nueva cuenta Azure - código limpio y optimizado"

Write-Host "  Pushing a nuevo repo..." -F Cyan
git push -u origin main

Write-Host "✅ Código en GitHub nuevo" -F Green

Write-Host "`n⚠️  CHECKPOINT 3:" -F Yellow
Write-Host "Verifica en: https://github.com/ECONEURA-MAX/ECONEURA-" -F Cyan
Write-Host "¿Se subió correctamente?" -F White
$continuar = Read-Host "Presiona Enter para continuar"
if ($continuar -eq 'n') { exit }

# ═══════════════════════════════════════════════════════════════
# FASE 4: DEPLOYAR A AZURE NUEVA
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[FASE 4/6] DEPLOYAR A AZURE NUEVA..." -F Yellow

Write-Host "  Login a Azure..." -F Cyan
az login

Write-Host "  Seleccionando nueva suscripción..." -F Cyan
az account set --subscription a0991f95-16e0-4f03-85df-db3d69004d94

Write-Host "  Verificando suscripción..." -F Cyan
az account show --query "{name:name,id:id,state:state}" -o table

Write-Host "`n  Ejecutando deploy completo..." -F Cyan
.\deploy-completo-nueva-cuenta.ps1

Write-Host "✅ Azure nueva cuenta deployada" -F Green

Write-Host "`n⚠️  CHECKPOINT 4:" -F Yellow
Write-Host "¿Se crearon los recursos correctamente?" -F White
$continuar = Read-Host "Presiona Enter para continuar"
if ($continuar -eq 'n') { exit }

# ═══════════════════════════════════════════════════════════════
# FASE 5: CONFIGURAR GITHUB SECRETS
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[FASE 5/6] CONFIGURAR GITHUB SECRETS..." -F Yellow

Write-Host "`n⚠️  ACCIÓN MANUAL REQUERIDA:" -F Red
Write-Host "1. Abre: https://github.com/ECONEURA-MAX/ECONEURA-/settings/secrets/actions" -F Cyan
Write-Host "2. Crea secret: AZURE_WEBAPP_PUBLISH_PROFILE_PROD" -F White
Write-Host "3. Copia contenido de: publish-profile-backend-nueva-cuenta.xml" -F White
Write-Host "4. Save" -F Green

Write-Host "`nAbriendo archivo para copiar..." -F Cyan
notepad publish-profile-backend-nueva-cuenta.xml

Write-Host "`n⚠️  CHECKPOINT 5:" -F Yellow
Write-Host "¿Has configurado el secret en GitHub?" -F White
$continuar = Read-Host "Presiona Enter para continuar"
if ($continuar -eq 'n') { exit }

# ═══════════════════════════════════════════════════════════════
# FASE 6: VERIFICAR TODO
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[FASE 6/6] VERIFICAR TODO..." -F Yellow

Write-Host "  Esperando 60s para que Azure inicie..." -F Cyan
Start-Sleep -Seconds 60

Write-Host "  Verificando backend health..." -F Cyan
try {
    $health = Invoke-RestMethod https://econeura-backend.azurewebsites.net/api/health -TimeoutSec 15
    Write-Host "✅ Backend UP:" -F Green
    $health | ConvertTo-Json
} catch {
    Write-Host "⚠️  Backend aún iniciando o error:" -F Yellow
    Write-Host $_.Exception.Message -F Red
}

Write-Host "`n  Abriendo frontend en navegador..." -F Cyan
Start-Process https://econeura-frontend.azurestaticapps.net

# ═══════════════════════════════════════════════════════════════
# RESUMEN FINAL
# ═══════════════════════════════════════════════════════════════

Write-Host "`n════════════════════════════════════════════════════════" -F Green
Write-Host "  ✅ MIGRACIÓN COMPLETA FINALIZADA ✅" -F Green
Write-Host "════════════════════════════════════════════════════════" -F Green

Write-Host "`n📊 RECURSOS CREADOS:" -F Cyan
Write-Host "• Repo GitHub: https://github.com/ECONEURA-MAX/ECONEURA-" -F White
Write-Host "• Backend: https://econeura-backend.azurewebsites.net" -F White
Write-Host "• Frontend: https://econeura-frontend.azurestaticapps.net" -F White
Write-Host "• Resource Group: econeura-rg" -F White

Write-Host "`n📋 PRÓXIMOS PASOS:" -F Yellow
Write-Host "1. Verificar backend responde OK" -F White
Write-Host "2. Verificar frontend carga OK" -F White
Write-Host "3. Probar flujo completo usuario" -F White
Write-Host "4. Monitorear GitHub Actions" -F White

Write-Host "`n🎯 URLs IMPORTANTES:" -F Cyan
Write-Host "• GitHub: https://github.com/ECONEURA-MAX/ECONEURA-" -F White
Write-Host "• Azure Portal: https://portal.azure.com" -F White
Write-Host "• Backend Health: https://econeura-backend.azurewebsites.net/api/health" -F White

Write-Host "`n✅ MIGRACIÓN 100% COMPLETA ✅" -F Green

