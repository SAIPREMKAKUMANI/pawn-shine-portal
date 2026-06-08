#!/bin/bash
# ============================================================
# Pawn Shine — Frontend Update & Redeploy Script
# Run on: PUBLIC instance only
#
# Pulls latest frontend code, rebuilds the Nginx container,
# and restarts. No backend or database involvement.
# ============================================================
set -euo pipefail

DEPLOY_DIR=~/pawn-deploy
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
cd "$DEPLOY_DIR"

echo "========================================"
echo "  Pawn Shine — Frontend Update"
echo "  Instance: PUBLIC (UI)"
echo "========================================"

# -----------------------------------------------------------
# 1. Pull latest frontend code
# -----------------------------------------------------------
echo "[1/3] Pulling latest frontend code from branch: $DEPLOY_BRANCH..."
cd pawn-frontend
git fetch origin
git checkout "$DEPLOY_BRANCH"
git pull origin "$DEPLOY_BRANCH"
cd ..

# -----------------------------------------------------------
# 2. Update docker-compose from frontend repo
# -----------------------------------------------------------
echo "[2/3] Updating docker-compose.yml..."
cp pawn-frontend/docker-compose.public.yml docker-compose.yml

# -----------------------------------------------------------
# 3. Rebuild and restart the frontend container
# -----------------------------------------------------------
echo "[3/3] Rebuilding and restarting frontend..."
docker compose up -d --build --force-recreate

# Cleanup dangling images
docker image prune -f

echo ""
echo "========================================"
echo "  Frontend update complete!"
echo "  docker compose ps:"
docker compose ps
echo "========================================"
