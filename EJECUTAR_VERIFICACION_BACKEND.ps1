# ═══════════════════════════════════════════════════════════════
# VERIFICACIÓN BACKEND LOCAL - TAREAS 1.15-1.17
# ═══════════════════════════════════════════════════════════════

Write-Host "`n🔥 VERIFICACIÓN BACKEND LOCAL INICIADA 🔥" -F Cyan
Write-Host "════════════════════════════════════════════════════════" -F Gray

# ═══════════════════════════════════════════════════════════════
# Tarea 1.14.1: Crear .env si no existe
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[1.14.1] Creando .env backend..." -F Yellow
$envContent = @"
NODE_ENV=development
PORT=8080
USE_MOCK_DB=true
SESSION_SECRET=econeura-local-dev-secret
JWT_ACCESS_SECRET=econeura-jwt-access-local
JWT_REFRESH_SECRET=econeura-jwt-refresh-local
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=info
FEATURE_MAKE_ENABLED=false
"@

$envContent | Out-File -FilePath backend/.env -Encoding utf8 -Force
Write-Host "✅ .env creado en backend/.env" -F Green

# ═══════════════════════════════════════════════════════════════
# Tarea 1.15: npm install
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[1.15] Instalando dependencies backend..." -F Yellow
cd backend
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ npm install exitoso" -F Green
} else {
    Write-Host "❌ npm install falló (ABORTAR MIGRACIÓN)" -F Red
    exit 1
}

# ═══════════════════════════════════════════════════════════════
# Tarea 1.16: npm start
# ═══════════════════════════════════════════════════════════════

Write-Host "`n[1.16] Iniciando backend..." -F Yellow
Write-Host "⚠️  Este proceso se quedará ejecutando" -F Yellow
Write-Host "⚠️  Abre OTRA terminal para el health check" -F Red
Write-Host "⚠️  Para detener: Ctrl+C" -F Yellow
Write-Host ""
Write-Host "Iniciando en 3 segundos..." -F Cyan
Start-Sleep 3

npm start

