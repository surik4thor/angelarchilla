#!/bin/bash
# Simple notification helper: supports Discord webhook (DISCORD_WEBHOOK_URL), Slack webhook (SLACK_WEBHOOK_URL) and email (ALERT_EMAIL)
set -euo pipefail

MESSAGE="${1:-No message provided}"

# Helper for safe JSON encoding using python3 if available, otherwise simple escaping
json_encode() {
  if command -v python3 >/dev/null 2>&1; then
    python3 - <<PY - "$1"
import json,sys
print(json.dumps(sys.argv[1]))
PY
  else
    printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e ':a;N;$!ba;s/\n/\\n/g'
  fi
}

 # Discord
if [ -n "${DISCORD_WEBHOOK_URL:-}" ]; then
  if command -v python3 >/dev/null 2>&1; then
    payload=$(python3 -c "import json,sys;print(json.dumps({'content': sys.argv[1]}))" "$MESSAGE")
  else
    SAFE=$(printf '%s' "$MESSAGE" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e ':a;N;$!ba;s/\n/\\n/g')
    payload="{\"content\":\"$SAFE\"}"
  fi
  curl -s -X POST -H 'Content-Type: application/json' --data "$payload" "$DISCORD_WEBHOOK_URL" || true
fi

# Slack (fallback)
if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
  if command -v python3 >/dev/null 2>&1; then
    payload=$(python3 -c "import json,sys;print(json.dumps({'text': sys.argv[1]}))" "$MESSAGE")
  else
    SAFE=$(printf '%s' "$MESSAGE" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e ':a;N;$!ba;s/\n/\\n/g')
    payload="{\"text\":\"$SAFE\"}"
  fi
  curl -s -X POST -H 'Content-Type: application/json' --data "$payload" "$SLACK_WEBHOOK_URL" || true
fi

# Fallback to email
if [ -n "${ALERT_EMAIL:-}" ]; then
  echo "$MESSAGE" | mail -s "[NebulosaMagica] TLS alert" "$ALERT_EMAIL" || true
fi

echo "$MESSAGE"
