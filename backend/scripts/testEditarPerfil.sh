#!/bin/bash

echo "🔧 Verificando funcionalidad de edición de perfil..."
echo ""

# Obtener token fresco
echo "🔑 Obteniendo token de autenticación..."
TOKEN_RESPONSE=$(curl -s -X POST https://nebulosamagica.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"surik4thor@icloud.com","password":"admin123"}')

TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Error: No se pudo obtener token de autenticación"
  echo "Respuesta: $TOKEN_RESPONSE"
  exit 1
fi

echo "✅ Token obtenido correctamente"
echo ""

# Probar GET /api/auth/me
echo "📱 Probando GET /api/auth/me..."
ME_RESPONSE=$(curl -s -X GET https://nebulosamagica.com/api/auth/me \
  -H "Authorization: Bearer $TOKEN")

echo "Respuesta: $ME_RESPONSE" | jq '.'
echo ""

# Probar PUT /api/auth/profile
echo "✏️ Probando PUT /api/auth/profile..."
PROFILE_RESPONSE=$(curl -s -X PUT https://nebulosamagica.com/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"username":"AdminUserTest"}')

echo "Respuesta: $PROFILE_RESPONSE" | jq '.'
echo ""

# Verificar que el cambio se aplicó
echo "🔍 Verificando que el cambio se aplicó..."
VERIFY_RESPONSE=$(curl -s -X GET https://nebulosamagica.com/api/auth/me \
  -H "Authorization: Bearer $TOKEN")

USERNAME=$(echo $VERIFY_RESPONSE | jq -r '.member.username // empty')

if [ "$USERNAME" = "AdminUserTest" ]; then
  echo "✅ SUCCESS: El perfil se actualizó correctamente"
  echo "   Nuevo username: $USERNAME"
else
  echo "❌ ERROR: El perfil no se actualizó"
  echo "   Username actual: $USERNAME"
fi

echo ""
echo "🧪 INSTRUCCIONES PARA PROBAR EN EL FRONTEND:"
echo "1. Ve a https://nebulosamagica.com/login"
echo "2. Inicia sesión con: surik4thor@icloud.com / admin123"
echo "3. Ve a tu perfil de usuario"
echo "4. Intenta cambiar el nombre de usuario"
echo "5. Deberías ver que los cambios se guardan correctamente"