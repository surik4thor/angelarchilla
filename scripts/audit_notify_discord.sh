#!/bin/bash
# Script para auditar dependencias y vulnerabilidades y notificar a Discord
# Uso: scripts/audit_notify_discord.sh
set -euo pipefail

DISCORD_WEBHOOK_FILE="/etc/nebulosa_discord_webhook_informes.url"
MENSAJE=""

if [ ! -f "$DISCORD_WEBHOOK_FILE" ]; then
  echo "No se encontró el archivo de webhook de Discord: $DISCORD_WEBHOOK_FILE" >&2
  exit 1
fi
WEBHOOK_URL=$(cat "$DISCORD_WEBHOOK_FILE" | tr -d '\n')

# Ejecutar auditoría npm
AUDIT=$(npm audit --json || true)
VULN_COUNT=$(echo "$AUDIT" | grep -o 'severity' | wc -l)
if [ "$VULN_COUNT" -gt 0 ]; then
  MENSAJE="🚨 Auditoría npm: Se detectaron $VULN_COUNT vulnerabilidades. Revisa el reporte y ejecuta npm audit fix si es posible."
else
  MENSAJE="✅ Auditoría npm: No se detectaron vulnerabilidades."
fi

# Notificar a Discord con formato seguro y emojis
jq -n --arg content "$MENSAJE" '{content: $content}' | curl -s -X POST -H 'Content-Type: application/json' -d @- "$WEBHOOK_URL"
