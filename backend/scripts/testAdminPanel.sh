#!/bin/bash

echo "🔧 Test Panel Admin - Verificación completa"
echo "========================================="

# Función para test con token admin
test_with_admin_token() {
    local endpoint="$1"
    local method="${2:-GET}"
    local data="$3"
    
    echo ""
    echo "🧪 Testing: $method $endpoint"
    
    # Login admin
    TOKEN=$(curl -s -X POST http://localhost:5050/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"surik4thor@icloud.com","password":"admin123"}' | jq -r '.token')
    
    if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
        echo "❌ No se pudo obtener token admin"
        return 1
    fi
    
    # Hacer petición
    if [ "$method" = "GET" ]; then
        RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
            -H "Authorization: Bearer $TOKEN" \
            "http://localhost:5050$endpoint")
    else
        RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
            -X "$method" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "http://localhost:5050$endpoint")
    fi
    
    HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/^HTTP_CODE:/d')
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ SUCCESS ($HTTP_CODE)"
        echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    else
        echo "❌ FAILED ($HTTP_CODE)"
        echo "$BODY"
    fi
}

echo "1. 🏥 Verificando salud del backend..."
curl -s http://localhost:5050/api/health | jq .

echo ""
echo "2. 👥 Verificando lista de usuarios admin..."
test_with_admin_token "/api/admin/users"

echo ""
echo "3. 📊 Verificando estadísticas admin..."
test_with_admin_token "/api/admin/stats"

echo ""
echo "4. 🔄 Test actualización de plan de usuario..."
# Primero obtener el ID del usuario admin
USER_ID=$(curl -s -X POST http://localhost:5050/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"surik4thor@icloud.com","password":"admin123"}' | jq -r '.user.id')

echo "Usuario ID: $USER_ID"

# Test cambiar plan a PREMIUM (debería funcionar)
test_with_admin_token "/api/admin/users/$USER_ID/plan" "PUT" '{"plan":"PREMIUM"}'

echo ""
echo "5. 🆓 Test plan FREE (nuevo sistema)..."
# Test cambiar plan a FREE
test_with_admin_token "/api/admin/users/$USER_ID/plan" "PUT" '{"plan":"FREE"}'

echo ""
echo "6. 🔙 Restaurar plan PREMIUM..."
test_with_admin_token "/api/admin/users/$USER_ID/plan" "PUT" '{"plan":"PREMIUM"}'

echo ""
echo "🎯 Test completado - Panel admin listo para usar"