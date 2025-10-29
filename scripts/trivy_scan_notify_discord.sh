#!/bin/bash
# Script para escaneo automatizado de seguridad con Trivy y notificación a Discord
# Uso: scripts/trivy_scan_notify_discord.sh
set -euo pipefail

DISCORD_WEBHOOK_FILE="/etc/nebulosa_discord_webhook_informes.url"
MENSAJE=""

if [ ! -f "$DISCORD_WEBHOOK_FILE" ]; then
  echo "No se encontró el archivo de webhook de Discord: $DISCORD_WEBHOOK_FILE" >&2
  exit 1
fi
WEBHOOK_URL=$(cat "$DISCORD_WEBHOOK_FILE" | tr -d '\n')

if ! command -v trivy >/dev/null 2>&1; then
  MENSAJE="Trivy no está instalado. Instala Trivy CLI para escaneo automatizado."
else
  SCAN=$(trivy fs --severity HIGH,CRITICAL --format json . || true)
  VULN_COUNT=$(echo "$SCAN" | grep -o '"Severity":"HIGH"\|"Severity":"CRITICAL"' | wc -l)
  if [ "$VULN_COUNT" -gt 0 ]; then
    MENSAJE="🚨 Trivy: Se detectaron $VULN_COUNT vulnerabilidades HIGH/CRITICAL. Revisa el reporte y ejecuta las correcciones necesarias."
  else
    MENSAJE="✅ Trivy: No se detectaron vulnerabilidades HIGH/CRITICAL."
  fi
fi

# Notificar a Discord con formato seguro y emojis
jq -n --arg content "$MENSAJE" '{content: $content}' | curl -s -X POST -H 'Content-Type: application/json' -d @- "$WEBHOOK_URL"
