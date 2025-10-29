#!/bin/bash
# Monitoriza recursos del VPS y envía alerta si se superan umbrales
THRESHOLD_CPU=90
THRESHOLD_MEM=90
THRESHOLD_DISK=90
ALERT_EMAIL="surik4thor@icloud.com"

cpu=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}')
mem=$(free | awk '/Mem/ {printf("%.0f", $3/$2 * 100.0)}')
disk=$(df / | awk 'END{print $5}' | tr -d '%')

alerta=""
if (( $(echo "$cpu > $THRESHOLD_CPU" | bc -l) )); then
  alerta+="CPU alta: $cpu%\n"
fi
if (( mem > THRESHOLD_MEM )); then
  alerta+="RAM alta: $mem%\n"
fi
if (( disk > THRESHOLD_DISK )); then
  alerta+="Disco lleno: $disk%\n"
fi

if [ -n "$alerta" ]; then
  echo -e "[NebulosaMágica VPS] ALERTA:\n$alerta" | mail -s "[ALERTA VPS] Recursos críticos" "$ALERT_EMAIL"
fi
