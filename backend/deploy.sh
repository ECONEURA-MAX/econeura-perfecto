#!/bin/bash
# ECONEURA - Azure Deployment Script
# Este script se ejecuta en Azure después del deploy

set -e

echo "=== ECONEURA Backend Deployment ==="

# 1. Verificar Node.js
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# 2. Instalar dependencias de producción
echo "Installing production dependencies..."
npm ci --omit=dev --prefer-offline --no-audit

# 3. Verificar instalación
if [ ! -d "node_modules" ]; then
  echo "ERROR: node_modules not found"
  exit 1
fi

echo "Dependencies installed successfully"

# 4. Verificar archivos críticos
critical_files=("server.js" "package.json" "config/envValidation.js" "services/logger.js")
for file in "${critical_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "ERROR: Critical file missing: $file"
    exit 1
  fi
done

echo "All critical files present"

# 5. Verificar variables de entorno
if [ -z "$OPENAI_API_KEY" ]; then
  echo "WARNING: OPENAI_API_KEY not set"
fi

if [ -z "$NODE_ENV" ]; then
  echo "WARNING: NODE_ENV not set, defaulting to production"
  export NODE_ENV=production
fi

echo "=== Deployment Complete ==="
echo "Starting application with: node server.js"

