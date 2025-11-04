#!/bin/bash
set -e
echo "Installing dependencies..."
npm ci --production
echo "Deployment complete"
