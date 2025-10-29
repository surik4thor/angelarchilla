#!/bin/bash
# Script para renovar certificados SSL automáticamente con certbot y recargar nginx
# Uso: sudo scripts/auto_renew_ssl.sh
set -euo pipefail

DOMAINS=("nebulosamagica.com" "nebulosamagica.es")
EMAIL="admin@nebulosamagica.com"
WEBROOT="/var/www/letsencrypt"
RENEW_CMD="certbot renew --webroot -w $WEBROOT --quiet --deploy-hook '/var/www/NebulosaMagica/scripts/update_certs_and_reload.sh'"

if [ "$EUID" -ne 0 ]; then
  echo "Este script requiere privilegios de root. Ejecuta con sudo." >&2
  exit 1
fi

# Renovar certificados
if ! command -v certbot >/dev/null 2>&1; then
  echo "Certbot no está instalado. Instala certbot antes de continuar." >&2
  exit 1
fi

$RENEW_CMD

echo "Renovación de certificados completada y nginx recargado."
