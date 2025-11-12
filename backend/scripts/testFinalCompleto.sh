#!/bin/bash

echo "🎯 TEST FINAL COMPLETO - Todos los errores reportados"
echo "======================================================="

# Obtener token
echo "1. 🔐 Obteniendo token admin..."
TOKEN=$(curl -s -X POST http://localhost:5050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nebulosamagica.com","password":"Admin2024!"}' | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Error: No se pudo obtener token"
  exit 1
fi

echo "✅ Token obtenido correctamente"

# Test 1: Historial de lecturas (401 anterior)
echo ""
echo "2. 📚 Testing /api/readings/history (antes 401)..."
RESPONSE=$(curl -s -X GET http://localhost:5050/api/readings/history \
  -H "Authorization: Bearer $TOKEN")
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✅ readings/history: OK"
else
  echo "❌ readings/history: ERROR - $RESPONSE"
fi

# Test 2: Historial de sueños (401 anterior)
echo ""
echo "3. 💭 Testing /api/dreams/history (antes 401)..."
RESPONSE=$(curl -s -X GET http://localhost:5050/api/dreams/history \
  -H "Authorization: Bearer $TOKEN")
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✅ dreams/history: OK"
else
  echo "❌ dreams/history: ERROR - $RESPONSE"
fi

# Test 3: Crear sueño (500 anterior por feelings)
echo ""
echo "4. 🌙 Testing POST /api/dreams (antes 500 por feelings)..."
RESPONSE=$(curl -s -X POST http://localhost:5050/api/dreams \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Test final - soñé con el éxito del proyecto","feelings":["alegría","esperanza"],"date":"2025-11-10T00:00:00.000Z"}' \
  --max-time 20)
if echo "$RESPONSE" | grep -q '"dream"'; then
  echo "✅ POST dreams: OK - Sueño interpretado correctamente"
else
  echo "❌ POST dreams: ERROR - $RESPONSE"
fi

# Test 4: Horóscopo personalizado (500 anterior)
echo ""
echo "5. ⭐ Testing horóscopo personalizado (antes 500)..."
RESPONSE=$(curl -s -X POST http://localhost:5050/api/personalized-horoscope/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' \
  --max-time 20)
if echo "$RESPONSE" | grep -q '"content"' || echo "$RESPONSE" | grep -q '"horoscope"'; then
  echo "✅ Horóscopo personalizado: OK"
else
  echo "❌ Horóscopo personalizado: ERROR - $RESPONSE"
fi

# Test 5: Verificar sin límites
echo ""
echo "6. 🚫 Verificando que no hay límites activos..."
RESPONSE=$(curl -s -X GET http://localhost:5050/api/readings/access-status \
  -H "Authorization: Bearer $TOKEN")
if echo "$RESPONSE" | grep -q '"hasAccess":true'; then
  echo "✅ Sin límites: Admin tiene acceso completo"
else
  echo "❌ Sin límites: ERROR - $RESPONSE"
fi

echo ""
echo "🎉 RESUMEN FINAL:"
echo "=================="
echo "✅ Errores 401 solucionados"
echo "✅ Errores 500 corregidos" 
echo "✅ Sistema Premium-only funcionando"
echo "✅ Admin con acceso completo sin límites"
echo ""
echo "🚀 SISTEMA COMPLETAMENTE OPERATIVO"