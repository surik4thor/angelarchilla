#!/bin/bash
# Check TLS certs for domains, print subject/issuer/expiry and return non-zero if expiring < 30 days
set -euo pipefail

DOMAINS=("nebulosamagica.com" "nebulosamagica.es")
if [ "$#" -gt 0 ]; then
  DOMAINS=("$@")
fi

EXIT_CODE=0
THRESHOLD_DAYS=${THRESHOLD_DAYS:-30}

NOTIFY_ENABLED=${NOTIFY_ENABLED:-0}
NOTIFY_SCRIPT="/var/www/NebulosaMagica/scripts/notify.sh"

# Cargar Discord webhook si no está definido
if [ -z "${DISCORD_WEBHOOK_URL:-}" ] && [ -f /etc/nebulosa_discord_webhook.url ]; then
  export DISCORD_WEBHOOK_URL="$(cat /etc/nebulosa_discord_webhook.url)"
fi

for d in "${DOMAINS[@]}"; do
  echo "Checking $d"
  out=$(echo | openssl s_client -connect ${d}:443 -servername ${d} 2>/dev/null | openssl x509 -noout -subject -issuer -dates || true)
  if [ -z "$out" ]; then
    echo "Unable to fetch certificate for $d"
    EXIT_CODE=2
    continue
  fi

  echo "$out"
  notAfter=$(echo "$out" | sed -n 's/notAfter=//p')
  if [ -z "$notAfter" ]; then
    echo "Could not parse expiry for $d"
    EXIT_CODE=2
    continue
  fi
  expiry_epoch=$(date -d "$notAfter" +%s)
  now_epoch=$(date +%s)
  days_left=$(( (expiry_epoch - now_epoch) / 86400 ))
  echo "Days left: $days_left"
  if [ "$days_left" -lt "$THRESHOLD_DAYS" ]; then
    echo "Certificate for $d expires in $days_left days (< $THRESHOLD_DAYS), needs renewal"
    EXIT_CODE=1
    if [ "$NOTIFY_ENABLED" -eq 1 ] && [ -x "$NOTIFY_SCRIPT" ]; then
      /bin/bash "$NOTIFY_SCRIPT" "[TLS] Certificate for $d expires in $days_left days"
    fi
  fi
  echo
done

exit $EXIT_CODE
