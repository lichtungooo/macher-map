#!/bin/bash
set -e

# Macher-Map Deployment Script
# Ausfuehren auf dem Server: bash deploy.sh

APP_DIR="/opt/macher-map"
REPO="https://github.com/lichtungooo/macher-map.git"

echo "=== Macher-Map Deployment ==="

# 1. Repo clonen oder updaten
if [ -d "$APP_DIR" ]; then
  echo "→ Repo updaten..."
  cd "$APP_DIR"
  git pull origin main
else
  echo "→ Repo clonen..."
  git clone "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

# 2. Docker bauen und starten
echo "→ Docker Image bauen..."
docker compose down 2>/dev/null || true
docker compose build --no-cache
docker compose up -d

echo ""
echo "=== Macher-Map laeuft! ==="
echo "→ https://macher-map.org"
docker compose ps
