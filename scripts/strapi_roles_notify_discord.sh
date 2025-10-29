#!/bin/bash
# Script: strapi_roles_notify_discord.sh
# Descripción: Audita roles y permisos de Strapi y notifica cambios/permisos peligrosos a Discord

WEBHOOK_URL="https://discordapp.com/api/webhooks/1430822052092186644/yc05mAqsqVnviu7EKSkljsHZqXnVktdUCwwEGi3V294VCB5SmjpyC5QXO36AAExm27Kq"
STRAPI_URL="https://strapi.nebulosamagica.com/admin"

# Ejemplo: usar la API REST de Strapi para obtener roles y permisos (requiere token admin)
ADMIN_TOKEN="<AQUÍ_TU_TOKEN_ADMIN>"

# Obtener roles y permisos
roles_json=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$STRAPI_URL/users-permissions/roles")

# Analizar y buscar permisos peligrosos en rol Public
public_perms=$(echo "$roles_json" | jq '.roles[] | select(.type=="public") | .permissions')

# Notificar si hay endpoints peligrosos
if echo "$public_perms" | grep -q 'create\|update\|delete'; then
  curl -s -H "Content-Type: application/json" -X POST -d '{"content": "⚠️ *Strapi Audit*: El rol Public tiene permisos peligrosos (create/update/delete). ¡Revisa configuración!"}' "$WEBHOOK_URL"
else
  curl -s -H "Content-Type: application/json" -X POST -d '{"content": "✅ *Strapi Audit*: El rol Public está seguro (solo lectura)."}' "$WEBHOOK_URL"
fi

# Puedes ampliar el script para auditar otros roles y notificar cambios
# Añade este script a cron para auditoría periódica
