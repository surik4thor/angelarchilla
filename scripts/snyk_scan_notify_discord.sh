#!/bin/bash
# Script para escaneo automatizado de seguridad con Snyk y notificación a Discord
# Uso: scripts/snyk_scan_notify_discord.sh
set -euo pipefail

DISCORD_WEBHOOK_FILE="/etc/nebulosa_discord_webhook_informes.url"
MENSAJE=""

if [ ! -f "$DISCORD_WEBHOOK_FILE" ]; then
  echo "No se encontró el archivo de webhook de Discord: $DISCORD_WEBHOOK_FILE" >&2
  exit 1
fi
WEBHOOK_URL=$(cat "$DISCORD_WEBHOOK_FILE" | tr -d '\n')

if ! command -v snyk >/dev/null 2>&1; then
  MENSAJE="Snyk no está instalado. Instala Snyk CLI para escaneo automatizado."
else
  SCAN=$(snyk test --severity-threshold=high --json || true)
  VULN_COUNT=$(echo "$SCAN" | grep -o '"severity":"high"' | wc -l)
  if [ "$VULN_COUNT" -gt 0 ]; then
    MENSAJE="🚨 Snyk: Se detectaron $VULN_COUNT vulnerabilidades HIGH. Revisa el reporte y ejecuta snyk wizard si es posible."
  else
    MENSAJE="✅ Snyk: No se detectaron vulnerabilidades HIGH."
  fi
fi

# Notificar a Discord con formato seguro y emojis
jq -n --arg content "$MENSAJE" '{content: $content}' | curl -s -X POST -H 'Content-Type: application/json' -d @- "$WEBHOOK_URL"
