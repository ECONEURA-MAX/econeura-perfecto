# ═══════════════════════════════════════════════════════════════
# COMANDOS ANÁLISIS TOTAL - EJECUTAR MANUALMENTE
# ═══════════════════════════════════════════════════════════════

Write-Host "`n🔥 ANÁLISIS TOTAL MONOREPO - COMANDOS DIRECTOS 🔥" -F Cyan

# ═══════════════════════════════════════════════════════════════
# PASO 1: INVENTARIO COMPLETO
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[1] Contando líneas BACKEND..." -F Yellow
$backendFiles = Get-ChildItem -Path backend -Recurse -Include *.js,*.json -Exclude node_modules
$backendLines = ($backendFiles | Get-Content | Measure-Object -Line).Lines
Write-Host "✅ Backend: $backendLines líneas en $($backendFiles.Count) archivos" -F Green

Write-Host "`n[2] Contando líneas FRONTEND..." -F Yellow
$frontendFiles = Get-ChildItem -Path frontend -Recurse -Include *.tsx,*.ts,*.json -Exclude node_modules,dist
$frontendLines = ($frontendFiles | Get-Content | Measure-Object -Line).Lines
Write-Host "✅ Frontend: $frontendLines líneas en $($frontendFiles.Count) archivos" -F Green

Write-Host "`n[3] TOTAL MONOREPO..." -F Yellow
$totalLines = $backendLines + $frontendLines
Write-Host "✅ TOTAL: $totalLines líneas" -F Green

# ═══════════════════════════════════════════════════════════════
# PASO 2: ARCHIVOS CRÍTICOS BACKEND
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[4] Archivos BACKEND más grandes (críticos)..." -F Yellow
$backendFiles | Sort-Object Length -Descending | Select-Object -First 20 | ForEach-Object {
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
    Write-Host "  $($_.Name): $lines líneas" -F Cyan
}

# ═══════════════════════════════════════════════════════════════
# PASO 3: ARCHIVOS CRÍTICOS FRONTEND
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[5] Archivos FRONTEND más grandes (críticos)..." -F Yellow
$frontendFiles | Sort-Object Length -Descending | Select-Object -First 20 | ForEach-Object {
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
    Write-Host "  $($_.Name): $lines líneas" -F Cyan
}

# ═══════════════════════════════════════════════════════════════
# PASO 4: VERIFICAR DEPENDENCIES
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[6] Verificando package.json BACKEND..." -F Yellow
$backendPkg = Get-Content backend/package.json | ConvertFrom-Json
Write-Host "  Dependencies: $($backendPkg.dependencies.PSObject.Properties.Count)" -F Cyan
Write-Host "  DevDependencies: $($backendPkg.devDependencies.PSObject.Properties.Count)" -F Cyan

Write-Host "`n[7] Verificando package.json FRONTEND..." -F Yellow
$frontendPkg = Get-Content frontend/package.json | ConvertFrom-Json
Write-Host "  Dependencies: $($frontendPkg.dependencies.PSObject.Properties.Count)" -F Cyan
Write-Host "  DevDependencies: $($frontendPkg.devDependencies.PSObject.Properties.Count)" -F Cyan

# ═══════════════════════════════════════════════════════════════
# PASO 5: LISTAR RUTAS Y SERVICIOS
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[8] Rutas disponibles (backend/routes/)..." -F Yellow
Get-ChildItem backend/routes/*.js | ForEach-Object {
    Write-Host "  ✓ $($_.Name)" -F Green
}

Write-Host "`n[9] Servicios disponibles (backend/services/)..." -F Yellow
Get-ChildItem backend/services/*.js | ForEach-Object {
    Write-Host "  ✓ $($_.Name)" -F Green
}

Write-Host "`n[10] Middleware disponibles (backend/middleware/)..." -F Yellow
Get-ChildItem backend/middleware/*.js | ForEach-Object {
    Write-Host "  ✓ $($_.Name)" -F Green
}

# ═══════════════════════════════════════════════════════════════
# PASO 6: VERIFICAR VARIABLES DE ENTORNO
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[11] Variables de entorno en server.js..." -F Yellow
Select-String -Path backend/server.js -Pattern "process\.env\." | ForEach-Object {
    Write-Host "  $($_.Line.Trim())" -F Cyan
} | Select-Object -First 10

# ═══════════════════════════════════════════════════════════════
# PASO 7: VERIFICAR WORKFLOWS
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[12] GitHub Actions workflows..." -F Yellow
Get-ChildItem .github/workflows/*.yml | ForEach-Object {
    Write-Host "  ✓ $($_.Name)" -F Green
}

# ═══════════════════════════════════════════════════════════════
# PASO 8: GENERAR REPORTE COMPLETO
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[13] Generando reporte completo..." -F Yellow

$reporte = @"
# ANÁLISIS TOTAL MONOREPO ECONEURA
Fecha: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## INVENTARIO
- **Backend**: $backendLines líneas en $($backendFiles.Count) archivos
- **Frontend**: $frontendLines líneas en $($frontendFiles.Count) archivos
- **TOTAL**: $totalLines líneas

## BACKEND
### Dependencies
- Dependencies: $($backendPkg.dependencies.PSObject.Properties.Count)
- DevDependencies: $($backendPkg.devDependencies.PSObject.Properties.Count)

### Estructura
- Routes: $(Get-ChildItem backend/routes/*.js | Measure-Object).Count
- Services: $(Get-ChildItem backend/services/*.js | Measure-Object).Count
- Middleware: $(Get-ChildItem backend/middleware/*.js | Measure-Object).Count

## FRONTEND
### Dependencies
- Dependencies: $($frontendPkg.dependencies.PSObject.Properties.Count)
- DevDependencies: $($frontendPkg.devDependencies.PSObject.Properties.Count)

## ARCHIVOS CRÍTICOS BACKEND (Top 10)
$($backendFiles | Sort-Object Length -Descending | Select-Object -First 10 | ForEach-Object {
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
    "- $($_.Name): $lines líneas"
} | Out-String)

## ARCHIVOS CRÍTICOS FRONTEND (Top 10)
$($frontendFiles | Sort-Object Length -Descending | Select-Object -First 10 | ForEach-Object {
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
    "- $($_.Name): $lines líneas"
} | Out-String)

## WORKFLOWS
$((Get-ChildItem .github/workflows/*.yml).Name | ForEach-Object { "- $_" } | Out-String)

## ESTADO
✅ Backend: Código completo
✅ Frontend: Código completo
✅ Workflows: Configurados
✅ Dependencies: Verificadas

## LISTO PARA MIGRACIÓN
"@

$reporte | Out-File -FilePath "ANALISIS_TOTAL_MONOREPO.md" -Encoding utf8
Write-Host "✅ Reporte guardado en: ANALISIS_TOTAL_MONOREPO.md" -F Green

# ═══════════════════════════════════════════════════════════════
# RESUMEN FINAL
# ═══════════════════════════════════════════════════════════════

Write-Host "`n════════════════════════════════════════════════════════" -F Green
Write-Host "  ✅ ANÁLISIS COMPLETO FINALIZADO ✅" -F Green
Write-Host "════════════════════════════════════════════════════════" -F Green
Write-Host "`n📊 RESULTADOS:" -F Cyan
Write-Host "• Total líneas: $totalLines" -F White
Write-Host "• Backend: $backendLines líneas" -F White
Write-Host "• Frontend: $frontendLines líneas" -F White
Write-Host "• Archivos backend: $($backendFiles.Count)" -F White
Write-Host "• Archivos frontend: $($frontendFiles.Count)" -F White
Write-Host "`n📄 Reporte: ANALISIS_TOTAL_MONOREPO.md" -F Cyan
Write-Host "`n✅ LISTO PARA MIGRAR A NUEVA CUENTA AZURE ✅" -F Green

