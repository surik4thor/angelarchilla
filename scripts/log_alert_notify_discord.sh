#!/bin/bash
# Script para auditar logs de seguridad y notificar alertas a Discord
# Uso: scripts/log_alert_notify_discord.sh
set -euo pipefail

LOG_FILE="/var/log/nebulosamagica/error.log"
DISCORD_WEBHOOK_FILE="/etc/nebulosa_discord_webhook_analytics.url"
MENSAJE=""

if [ ! -f "$DISCORD_WEBHOOK_FILE" ]; then
  echo "No se encontró el archivo de webhook de Discord: $DISCORD_WEBHOOK_FILE" >&2
  exit 1
fi
WEBHOOK_URL=$(cat "$DISCORD_WEBHOOK_FILE" | tr -d '\n')

if [ ! -f "$LOG_FILE" ]; then
  MENSAJE="No se encontró el log de errores: $LOG_FILE"
else
  # Buscar errores críticos recientes (últimas 24h)
  ALERTAS=$(grep -i 'error\|critical\|security' "$LOG_FILE" | tail -n 20)
  if [ -n "$ALERTAS" ]; then
    MENSAJE="🚨 Alertas de seguridad detectadas en logs:\n$ALERTAS"
  else
    MENSAJE="✅ No se detectaron alertas críticas en los logs de seguridad."
  fi
fi

# Notificar a Discord con formato seguro y emojis
jq -n --arg content "$MENSAJE" '{content: $content}' | curl -s -X POST -H 'Content-Type: application/json' -d @- "$WEBHOOK_URL"
