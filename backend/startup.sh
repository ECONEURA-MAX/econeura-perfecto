#!/bin/bash
set -e

echo "=== ECONEURA STARTUP SCRIPT ==="
echo "Node: $(node --version)"
echo "NPM: $(npm --version)"
echo "PWD: $(pwd)"
echo "Contents:"
ls -la

# Si no existen node_modules, instalarlos
if [ ! -d "node_modules" ]; then
  echo "⚠️ node_modules not found - installing..."
  npm ci --omit=dev --prefer-offline --no-audit --loglevel=error
  echo "✅ Dependencies installed"
fi

# Verificar express
if ! node -e "require('express')" 2>/dev/null; then
  echo "❌ express not found - forcing install..."
  npm install --production --no-audit
fi

echo "✅ Starting server..."
node server.js

