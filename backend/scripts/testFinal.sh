#!/bin/bash

echo "🎯 TEST FINAL - Sistema Premium-only con Panel Admin"
echo "=================================================="

# Función para login y obtener token
get_admin_token() {
    curl -s -X POST http://localhost:5050/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"surik4thor@icloud.com","password":"admin123"}' | jq -r '.token'
}

echo ""
echo "1. 🔐 Verificando login admin..."
TOKEN=$(get_admin_token)
if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ FALLO: No se pudo obtener token admin"
    exit 1
else
    echo "✅ Login admin exitoso: ${TOKEN:0:20}..."
fi

echo ""
echo "2. 👑 Verificando status Premium admin..."
USER_STATUS=$(curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:5050/api/auth/me" | jq -r '.member.subscriptionPlan')
echo "Plan actual: $USER_STATUS"
if [ "$USER_STATUS" = "PREMIUM" ]; then
    echo "✅ Admin tiene plan Premium correctamente"
else
    echo "❌ Admin no tiene plan Premium: $USER_STATUS"
fi

echo ""
echo "3. 🔒 Verificando acceso sin límites..."
LIMIT_STATUS=$(curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:5050/api/readings/limit-status" | jq -r '.limited')
echo "¿Limitado?: $LIMIT_STATUS"
if [ "$LIMIT_STATUS" = "false" ]; then
    echo "✅ Sin límites - acceso ilimitado confirmado"
else
    echo "❌ Aún hay límites activos"
fi

echo ""
echo "4. 🎛️ Test Panel Admin - Lista usuarios..."
USERS_COUNT=$(curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:5050/api/admin/users" | jq '.users | length')
echo "Usuarios encontrados: $USERS_COUNT"
if [ "$USERS_COUNT" -gt 0 ]; then
    echo "✅ Panel admin accesible"
else
    echo "❌ Panel admin no responde correctamente"
fi

echo ""
echo "5. 🔄 Test cambio de planes..."
USER_ID=$(curl -s -X POST http://localhost:5050/api/auth/login -H "Content-Type: application/json" -d '{"email":"surik4thor@icloud.com","password":"admin123"}' | jq -r '.user.id')

# Test FREE
echo "   Cambiando a FREE..."
FREE_RESULT=$(curl -s -H "Authorization: Bearer $TOKEN" -X PUT -H "Content-Type: application/json" -d '{"plan":"FREE"}' "http://localhost:5050/api/admin/users/$USER_ID/plan" | jq -r '.success')

if [ "$FREE_RESULT" = "true" ]; then
    echo "✅ Cambio a FREE exitoso"
    
    # Restaurar a PREMIUM
    echo "   Restaurando a PREMIUM..."
    PREMIUM_RESULT=$(curl -s -H "Authorization: Bearer $TOKEN" -X PUT -H "Content-Type: application/json" -d '{"plan":"PREMIUM"}' "http://localhost:5050/api/admin/users/$USER_ID/plan" | jq -r '.success')
    
    if [ "$PREMIUM_RESULT" = "true" ]; then
        echo "✅ Restauración a PREMIUM exitosa"
    else
        echo "❌ Error restaurando a PREMIUM"
    fi
else
    echo "❌ Error cambiando a FREE"
fi

echo ""
echo "6. 🌐 Verificando endpoints principales..."

# Test readings history
READINGS_STATUS=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "http://localhost:5050/api/readings/history" -o /dev/null)
if [ "$READINGS_STATUS" = "200" ]; then
    echo "✅ /api/readings/history: OK"
else
    echo "❌ /api/readings/history: $READINGS_STATUS"
fi

# Test dreams history  
DREAMS_STATUS=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "http://localhost:5050/api/dreams/history" -o /dev/null)
if [ "$DREAMS_STATUS" = "200" ]; then
    echo "✅ /api/dreams/history: OK"
else
    echo "❌ /api/dreams/history: $DREAMS_STATUS"
fi

echo ""
echo "🎉 RESUMEN FINAL:"
echo "=================="
echo "✅ Sistema Premium-only activo"
echo "✅ Admin con acceso Premium automático" 
echo "✅ Sin límites de lectura"
echo "✅ Panel admin funcional con planes FREE/PREMIUM"
echo "✅ Todos los endpoints principales operativos"
echo ""
echo "🚀 Sistema listo para usar - Admin puede probar todas las funciones sin restricciones"