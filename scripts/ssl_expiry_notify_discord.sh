#!/bin/bash
# Script para monitorizar expiración de certificados SSL y notificar a Discord
# Uso: scripts/ssl_expiry_notify_discord.sh
set -euo pipefail

DOMAINS=("nebulosamagica.com" "nebulosamagica.es")
DISCORD_WEBHOOK_FILE="/etc/nebulosa_discord_webhook_alertas.url"
MENSAJE=""

if [ ! -f "$DISCORD_WEBHOOK_FILE" ]; then
  echo "No se encontró el archivo de webhook de Discord: $DISCORD_WEBHOOK_FILE" >&2
  exit 1
fi
WEBHOOK_URL=$(cat "$DISCORD_WEBHOOK_FILE" | tr -d '\n')

for d in "${DOMAINS[@]}"; do
  CERT_FILE="/etc/letsencrypt/live/$d/fullchain.pem"
  if [ ! -f "$CERT_FILE" ]; then
    MENSAJE+=$'❌ Certificado no encontrado para '$d'\n'
    continue
  fi
  EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_FILE" | cut -d= -f2)
  EXPIRY_TS=$(date -d "$EXPIRY" +%s)
  NOW_TS=$(date +%s)
  DIFF=$(( (EXPIRY_TS - NOW_TS) / 86400 ))
  if [ "$DIFF" -le 15 ]; then
    MENSAJE+=$'⚠️ El certificado SSL de '$d' expira en '$DIFF' días ('$EXPIRY'). ¡Renueva pronto!\n'
  else
    MENSAJE+=$'✅ Certificado SSL de '$d' válido hasta '$EXPIRY' ('$DIFF' días restantes).\n'
  fi
  done

# Notificar a Discord con formato seguro y saltos de línea reales
# Usar jq -Rs para evitar el escape de \n
if [ -n "$MENSAJE" ]; then
  echo "{\"content\":$(jq -Rs . <<< "$MENSAJE")}" | curl -s -X POST -H 'Content-Type: application/json' -d @- "$WEBHOOK_URL"
fi
