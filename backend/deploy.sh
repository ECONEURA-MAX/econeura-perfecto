#!/bin/bash
set -e
echo "=== ECONEURA Backend Deployment ==="
echo "Node version: $(node --version)"
npm ci --production
echo "Deployment complete - Azure will start server automatically"
