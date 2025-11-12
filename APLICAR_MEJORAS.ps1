# MEJORA 10: ESLint auto-fix
cd backend
npx eslint . --ext .js --fix --quiet
Write-Host "✅ ESLint backend fixed" -ForegroundColor Green

cd ..\frontend  
npx eslint . --ext .ts,.tsx --fix --quiet
Write-Host "✅ ESLint frontend fixed" -ForegroundColor Green

# Verificar sintaxis
cd ..\backend
node --check server.js
Write-Host "✅ Sintaxis OK" -ForegroundColor Green

