#!/bin/bash
# Script para actualizar certificados desde /etc/letsencrypt y recargar nginx en docker-compose
# Uso: sudo scripts/update_certs_and_reload.sh
set -euo pipefail

# Dominios y rutas
DOMAINS=("nebulosamagica.com" "nebulosamagica.es")
SSL_DIR="/etc/ssl"
COMPOSE_FILE="/var/www/NebulosaMagica/docker-compose.yml"

if [ "$EUID" -ne 0 ]; then
  echo "Este script requiere privilegios de root. Ejecuta con sudo." >&2
  exit 1
fi

for d in "${DOMAINS[@]}"; do
  src_live="/etc/letsencrypt/live/$d"
  dest="$SSL_DIR/$d"

  if [ ! -d "$src_live" ]; then
    echo "Directorio $src_live no encontrado, omitiendo $d"
    continue
  fi

  mkdir -p "$dest"
  # No copy to /etc/ssl: use /etc/letsencrypt directly inside containers
  # Copy fullchain locally for record if needed
  cp -f "$src_live/fullchain.pem" "$dest/fullchain.pem" || true
  # algunos dominios (es) usan diferente nombre de clave en config (privkey.key)
  keyname="privkey.pem"
  if [ "$d" = "nebulosamagica.es" ]; then
    keyname="privkey.key"
  fi
    # Algunos dominios pueden usar nombres distintos; copiar la privkey si existe
    keyname="privkey.pem"
    if [ -f "$src_live/privkey.pem" ]; then
      cp -f "$src_live/privkey.pem" "$dest/$keyname" || true
    elif [ -f "$src_live/privkey.key" ]; then
      # Convert key name to privkey.pem if only privkey.key exists
      cp -f "$src_live/privkey.key" "$dest/privkey.pem" || true
    else
      echo "Aviso: no se encontró clave privada para $d en $src_live" >&2
    fi
    else
      echo "Aviso: no se encontró clave privada para $d en $src_live" >&2
    fi
  chmod 600 "$dest"/* || true
  chown root:root "$dest"/* || true
  echo "Copiados certificados para $d -> $dest"
done

# Reiniciar solo nginx en docker-compose
  if command -v docker >/dev/null 2>&1; then
  echo "Reiniciando nginx via docker compose..."
  # Si existe el servicio en Swarm, forzamos la actualización; si no, usamos compose
  if docker service ls --filter name=nebulosa_nginx --format '{{.Name}}' | grep -q .; then
    echo "Actualizando servicio nginx en Swarm para aplicar certificados..."
    docker service update --force nebulosa_nginx || true
  else
    echo "Reiniciando nginx via docker compose..."
    docker compose -f "$COMPOSE_FILE" restart nginx || docker-compose -f "$COMPOSE_FILE" restart nginx || true
  fi
else
  echo "Docker no encontrado. Asegurate de reiniciar el stack manualmente: docker compose -f $COMPOSE_FILE restart nginx" >&2
fi

echo "Actualización y recarga completadas."