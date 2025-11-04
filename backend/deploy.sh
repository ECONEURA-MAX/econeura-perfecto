#!/bin/bash
set -e
echo "=== ECONEURA Backend Deployment ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Instalar dependencias de producción
echo "Installing production dependencies..."
npm ci --omit=dev --prefer-offline --no-audit

# Verificar instalación
if [ ! -d "node_modules" ]; then
  echo "ERROR: node_modules not found"
  exit 1
fi

echo "Dependencies installed successfully"
echo "Deployment complete"
