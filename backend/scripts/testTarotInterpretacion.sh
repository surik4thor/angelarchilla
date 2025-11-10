#!/bin/bash

# Script para probar que el tarot muestre la interpretación correctamente

echo "🔮 Probando lectura de tarot con interpretación..."

# Test 1: Crear una lectura de tarot
echo "📍 Test 1: Creando lectura de tarot de 3 cartas..."
curl -X POST http://localhost:5050/api/readings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AbmVidWxvc2FtYWdpY2EuY29tIiwicGxhbiI6IlBSRU1JVU0iLCJpYXQiOjE3MzEyNzExMTEsImV4cCI6MTczMTg3NTkxMX0.bMRLqhInQotba8xzB3rhcMhbOHA_MuSUOiK1oTEQHbc" \
  -d '{
    "readingType": "tarot",
    "spreadType": "tres-cartas", 
    "deckType": "rider-waite",
    "question": "¿Qué me depara el futuro en el amor?",
    "feelings": ["esperanzado", "curioso"]
  }' | jq '.'

echo ""
echo "✨ Si la respuesta incluye 'cartas' e 'interpretacion', el tarot funcionará correctamente!"
echo ""
echo "🎴 Para verificar en el frontend:"
echo "1. Ve a la sección de Tarot"
echo "2. Selecciona 'Lectura de 3 cartas'"
echo "3. Haz una pregunta y envía"
echo "4. Deberías ver las cartas Y la interpretación debajo"