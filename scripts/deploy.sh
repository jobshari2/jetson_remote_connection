#!/bin/bash
set -euo pipefail

echo "=== AI GPU Workbench: Deployment ==="

# Build all Docker images
echo "Building Docker images..."
docker compose build

# Run the application
echo "Starting application..."
docker compose up -d

echo "=== Deployment Complete ==="
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
