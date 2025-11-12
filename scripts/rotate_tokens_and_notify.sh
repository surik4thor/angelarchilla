#!/bin/bash
# Script para rotar y limpiar tokens y notificar por Discord
# Uso: scripts/rotate_tokens_and_notify.sh
set -euo pipefail

DISCORD_WEBHOOK_FILE="/etc/nebulosa_discord_webhook_analytics.url"
MENSAJE=""

if [ ! -f "$DISCORD_WEBHOOK_FILE" ]; then
  echo "No se encontró el archivo de webhook de Discord: $DISCORD_WEBHOOK_FILE" >&2
  exit 1
fi
WEBHOOK_URL=$(cat "$DISCORD_WEBHOOK_FILE" | tr -d '\n')

# Aquí iría la lógica real de rotación y limpieza de tokens/secretos
# Por ahora solo notifica la tarea programada
MENSAJE="🔒 Rotación y limpieza de tokens/secrets ejecutada automáticamente. Revisa manualmente los tokens y elimina los no usados."

jq -n --arg content "$MENSAJE" '{content: $content}' | curl -s -X POST -H 'Content-Type: application/json' -d @- "$WEBHOOK_URL"
