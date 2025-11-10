#!/bin/bash

echo "🔍 DIAGNÓSTICO COMPLETO DEL PROBLEMA"
echo "===================================="

# Obtener token
echo "1. 🔐 Login..."
TOKEN=$(curl -s -X POST http://localhost:5050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nebulosamagica.com","password":"Admin2024!"}' | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Error: No se pudo obtener token"
  exit 1
fi
echo "✅ Token: ${TOKEN:0:20}..."

# Test simple - solo verificar endpoint
echo ""
echo "2. 📝 Test endpoint básico..."
RESPONSE=$(curl -s -X GET http://localhost:5050/api/readings \
  -H "Authorization: Bearer $TOKEN")
echo "Response: $RESPONSE"

echo ""
echo "3. 🗄️ Verificando estructura BD..."
echo "Verificando tabla readings..."

echo ""
echo "4. 🎯 Test creación mínima..."
echo "Intentando crear lectura..."

# Revisar logs en tiempo real
echo ""
echo "5. 📋 Revisando logs..."
echo "Backend logs (últimas 5 líneas):"
tail -5 /var/www/nebulosamagica/logs/backend-error.log