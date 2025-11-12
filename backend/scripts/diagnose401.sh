#!/bin/bash

echo "🧪 Diagnóstico completo de errores 401..."

# Función para hacer petición y mostrar detalles
test_endpoint() {
    local endpoint="$1"
    local name="$2"
    
    echo ""
    echo "🔍 Testing $name ($endpoint)"
    echo "================================"
    
    # Login y obtener token
    echo "1. 🔐 Obteniendo token..."
    TOKEN=$(curl -s -X POST http://localhost:5050/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"surik4thor@icloud.com","password":"admin123"}' | jq -r '.token')
    
    if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
        echo "❌ Error: No se pudo obtener token"
        return 1
    fi
    
    echo "✅ Token obtenido: ${TOKEN:0:20}..."
    
    # Hacer petición con token
    echo ""
    echo "2. 🌐 Petición a $endpoint..."
    
    RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}\nTIME:%{time_total}" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        "http://localhost:5050$endpoint")
    
    # Extraer código HTTP
    HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
    TIME=$(echo "$RESPONSE" | grep "TIME:" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/^HTTP_CODE:/d' | sed '/^TIME:/d')
    
    echo "Status: $HTTP_CODE"
    echo "Time: ${TIME}s"
    echo "Response:"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    
    # Verificar si es exitoso
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ $name: SUCCESS"
    else
        echo "❌ $name: FAILED (HTTP $HTTP_CODE)"
    fi
}

# Verificar estado del backend
echo "🔍 Verificando backend..."
curl -s http://localhost:5050/api/health | jq .

# Test de endpoints específicos que están fallando
test_endpoint "/api/readings/history" "Readings History"
test_endpoint "/api/dreams/history" "Dreams History" 
test_endpoint "/api/auth/me" "Auth Me"
test_endpoint "/api/astrology/natal-chart" "Astrology (esperado 404)"

echo ""
echo "🎯 Resumen de diagnóstico completado"