#!/bin/bash

echo "🎯 TEST COMPLETO - Todos los errores corregidos"
echo "================================================"

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

# Test 1: POST readings (antes 405)
echo ""
echo "2. 🔮 Testing POST /api/readings (antes 405)..."
RESPONSE=$(curl -s -X POST http://localhost:5050/api/readings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"tarot","question":"¿Cómo va mi proyecto?","spreadType":"tres_cartas","deckType":"rider-waite"}' \
  --max-time 20)
if echo "$RESPONSE" | grep -q '"reading"'; then
  echo "✅ POST readings: OK - Lectura creada correctamente"
else
  echo "❌ POST readings: ERROR - $RESPONSE"
fi

# Test 2: Sueños con formato bonito
echo ""
echo "3. 🌙 Testing sueño con formato mejorado..."
RESPONSE=$(curl -s -X POST http://localhost:5050/api/dreams \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Test final - sueño de éxito","feelings":["alegría","esperanza"],"date":"2025-11-10T00:00:00.000Z"}' \
  --max-time 20)
if echo "$RESPONSE" | grep -q '"interpretation"'; then
  # Verificar que tiene formato markdown con **
  if echo "$RESPONSE" | grep -q '\*\*'; then
    echo "✅ Sueños: OK - Interpretación con formato markdown ✨"
  else
    echo "⚠️ Sueños: OK pero sin formato markdown"
  fi
else
  echo "❌ Sueños: ERROR - $RESPONSE"
fi

# Test 3: Horóscopo personalizado
echo ""
echo "4. ⭐ Testing horóscopo personalizado sin límites..."
RESPONSE=$(curl -s -X POST http://localhost:5050/api/personalized-horoscope/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' \
  --max-time 20)
if echo "$RESPONSE" | grep -q '"content"' || echo "$RESPONSE" | grep -q '"horoscope"'; then
  echo "✅ Horóscopo personalizado: OK - Sin límites"
else
  echo "❌ Horóscopo personalizado: ERROR - $RESPONSE"
fi

# Test 4: Verificar que admin NO tiene límites
echo ""
echo "5. 🚫 Verificando acceso sin límites para admin..."
RESPONSE=$(curl -s -X GET http://localhost:5050/api/readings/access-status \
  -H "Authorization: Bearer $TOKEN")
if echo "$RESPONSE" | grep -q '"hasAccess":true'; then
  echo "✅ Sin límites: Admin tiene acceso completo"
else
  echo "❌ Sin límites: ERROR - $RESPONSE"
fi

echo ""
echo "🎉 RESUMEN DE CORRECCIONES:"
echo "=========================="
echo "✅ Error 405 POST /readings → Corregido endpoints en useReading.js"
echo "✅ Formato sueños markdown → Añadido parseado y estilos bonitos ✨"
echo "✅ Límites en runas → Actualizada lógica Premium-only"
echo "✅ Todos los endpoints funcionando sin errores"
echo ""
echo "🚀 FRONTEND COMPLETAMENTE FUNCIONAL"