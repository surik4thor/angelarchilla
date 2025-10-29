#!/bin/bash
# Revisa logs de seguridad de Nginx y Strapi
NGINX_LOG="/var/log/nginx/error.log"
STRAPI_LOG="/var/www/nebulosamagica/strapi-backend/logs/strapi.log"

# Busca errores críticos recientes
if [ -f "$NGINX_LOG" ]; then
  echo "--- Últimos errores Nginx ---"
  tail -n 50 "$NGINX_LOG" | grep -iE "error|crit|alert|warn" || echo "Sin errores recientes."
fi
if [ -f "$STRAPI_LOG" ]; then
  echo "--- Últimos errores Strapi ---"
  tail -n 50 "$STRAPI_LOG" | grep -iE "error|warn|fail|unauthorized|forbidden" || echo "Sin errores recientes."
fi
