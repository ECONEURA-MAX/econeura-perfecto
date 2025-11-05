#!/bin/bash
set -e
echo "=== ECONEURA Backend Deployment ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Working directory: $(pwd)"

# Limpiar cache npm para evitar problemas
echo "Cleaning npm cache..."
npm cache clean --force 2>/dev/null || true

# Instalar dependencias de producción (optimizado)
echo "Installing production dependencies..."
npm ci --omit=dev --prefer-offline --no-audit --loglevel=error

# Verificar instalación
if [ ! -d "node_modules" ]; then
  echo "ERROR: node_modules not found"
  ls -la
  exit 1
fi

# Verificar módulos críticos
echo "Verifying critical modules..."
node -e "require('express'); console.log('✅ express OK')"
node -e "require('cors'); console.log('✅ cors OK')"

echo "✅ Dependencies installed successfully"
echo "✅ Deployment complete - Ready to start"
