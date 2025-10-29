#!/bin/bash
# Preflight checks antes de despliegue
set -e

echo "Comprobando Docker..."
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker no instalado. Instala docker antes de continuar." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose no disponible. Puedes usar 'docker-compose' o instalar el plugin." >&2
fi

REQUIRED_DIRS=("/etc/letsencrypt/live/nebulosamagica.com" "/etc/letsencrypt/live/nebulosamagica.es")
for d in "${REQUIRED_DIRS[@]}"; do
  if [ ! -d "$d" ]; then
    echo "Directorio $d no existe. Crea los certificados antes de continuar." >&2
    exit 1
  fi
done

echo "Preflight completado. Todo OK."