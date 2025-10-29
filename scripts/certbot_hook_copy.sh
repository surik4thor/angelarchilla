#!/bin/bash
# Hook local para copiar certificados renovados al /etc/ssl y reiniciar nginx en docker-compose
set -e

# Este script se debe copiar a /etc/letsencrypt/renewal-hooks/post/ y ser ejecutable
# Uso: sudo cp scripts/certbot_hook_copy.sh /etc/letsencrypt/renewal-hooks/post/ && sudo chmod +x /etc/letsencrypt/renewal-hooks/post/certbot_hook_copy.sh

/scripts/update_certs_and_reload.sh_path="/var/www/NebulosaMagica/scripts/update_certs_and_reload.sh"

if [ -x "$scripts_path" ]; then
  sudo "$scripts_path"
else
  echo "Script de actualización no encontrado en $scripts_path " >&2
  exit 1
fi
