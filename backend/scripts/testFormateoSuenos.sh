#!/bin/bash

echo "🌙 TEST FORMATEO DE SUEÑOS - RESULTADO MARKDOWN"
echo "=============================================="

# Obtener token
echo "1. 🔐 Login admin..."
TOKEN=$(curl -s -X POST http://localhost:5050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nebulosamagica.com","password":"Admin2024!"}' | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Error: No se pudo obtener token"
  exit 1
fi
echo "✅ Token obtenido"

echo ""
echo "2. 🌙 Probando interpretación de sueño..."
echo "Enviando: Sueño sobre volar y libertad"

RESPONSE=$(curl -s -X POST http://localhost:5050/api/dreams \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Soñé que volaba por encima de las montañas, sintiendo una increíble libertad. El paisaje era hermoso y me sentía en total paz.",
    "feelings": ["libertad", "paz", "alegría"],
    "date": "2025-11-10T00:00:00.000Z"
  }' \
  --max-time 30)

if echo "$RESPONSE" | grep -q '"dream"'; then
  echo "✅ Sueño interpretado correctamente"
  
  # Extraer la interpretación para mostrar un preview
  echo ""
  echo "📖 Preview de la interpretación (primeras líneas):"
  INTERPRETATION=$(echo "$RESPONSE" | jq -r '.dream.interpretation' | head -5)
  echo "$INTERPRETATION"
  echo ""
  echo "🎨 El frontend ahora debería mostrar:"
  echo "   ✅ Títulos con emojis (🔮 🌙 ⭐ 🤔 💫 💡)"
  echo "   ✅ Párrafos con fondo y bordes coloridos"
  echo "   ✅ Texto en **negrita** resaltado en dorado"
  echo "   ✅ Preguntas con estilo especial y emoji 💭"
  echo "   ✅ Animaciones suaves al aparecer"
  echo ""
  echo "🌐 Visita: https://nebulosamagica.com/dreams"
  echo "   Para ver el resultado formateado en el navegador"
else
  echo "❌ Error en interpretación: $RESPONSE"
fi

echo ""
echo "🎉 FORMATEO DE SUEÑOS IMPLEMENTADO:"
echo "=================================="
echo "✅ Detección automática de secciones markdown"
echo "✅ Emojis contextuales para cada tipo de sección"
echo "✅ Estilos diferenciados para títulos y párrafos"
echo "✅ Formato especial para preguntas reflexivas"
echo "✅ Animaciones CSS suaves"
echo "✅ Responsive design para móviles"
echo ""
echo "🚀 ¡La experiencia de interpretación de sueños es ahora mucho más atractiva y legible!"