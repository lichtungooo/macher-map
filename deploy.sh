#!/bin/bash
set -e

# Macher-Map Deployment Script
# Ausfuehren auf dem Server: bash deploy.sh

APP_DIR="/opt/macher-map"
REPO="https://github.com/lichtungooo/macher-map.git"

echo "=== Macher-Map Deployment ==="

# 1. Repo clonen oder updaten (fuer docker-compose.yml)
if [ -d "$APP_DIR" ]; then
  echo "→ Repo updaten..."
  cd "$APP_DIR"
  git pull origin main
else
  echo "→ Repo clonen..."
  git clone "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

# 2. Image von ghcr.io ziehen und starten
echo "→ Neues Image ziehen..."
docker compose pull
docker compose up -d

echo ""
echo "=== Macher-Map laeuft! ==="
echo "→ https://macher-map.org"
docker compose ps
