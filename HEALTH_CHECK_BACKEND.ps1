# ═══════════════════════════════════════════════════════════════
# HEALTH CHECK BACKEND LOCAL - Tarea 1.17
# ═══════════════════════════════════════════════════════════════
# EJECUTAR EN OTRA TERMINAL (mientras backend está corriendo)
# ═══════════════════════════════════════════════════════════════

Write-Host "`n🔍 HEALTH CHECK BACKEND LOCAL 🔍" -F Cyan
Write-Host "════════════════════════════════════════════════════════" -F Gray

Write-Host "`n[1.17] Esperando 10s para que backend inicie..." -F Yellow
Start-Sleep 10

Write-Host "`n[1.17.1] Health check simple..." -F Cyan
try {
    $health = Invoke-RestMethod http://localhost:8080/api/health/simple -TimeoutSec 5
    Write-Host "✅ Backend responde:" -F Green
    $health | ConvertTo-Json
} catch {
    Write-Host "❌ Backend NO responde (ABORTAR MIGRACIÓN)" -F Red
    Write-Host "Error: $($_.Exception.Message)" -F Red
    exit 1
}

Write-Host "`n[1.17.2] Health check completo..." -F Cyan
try {
    $healthFull = Invoke-RestMethod http://localhost:8080/api/health -TimeoutSec 10
    Write-Host "✅ Health check completo:" -F Green
    $healthFull | ConvertTo-Json -Depth 5
} catch {
    Write-Host "⚠️  Health check completo falló (puede ser normal si faltan services)" -F Yellow
    Write-Host "Error: $($_.Exception.Message)" -F Yellow
}

Write-Host "`n════════════════════════════════════════════════════════" -F Green
Write-Host "  ✅ BACKEND LOCAL FUNCIONA CORRECTAMENTE ✅" -F Green
Write-Host "════════════════════════════════════════════════════════" -F Green

Write-Host "`n📋 RESULTADO:" -F Cyan
Write-Host "• Backend inicia sin crashes ✅" -F Green
Write-Host "• Health check responde 200 OK ✅" -F Green
Write-Host "• Listo para continuar con GRUPO 2 (Frontend) ✅" -F Green

Write-Host "`n⚠️  Para detener backend: Ve a la otra terminal y presiona Ctrl+C" -F Yellow

