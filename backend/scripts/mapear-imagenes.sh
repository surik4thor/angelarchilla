#!/bin/bash

echo "🔧 Creando mapeo correcto de rutas de imágenes..."

# Crear el mapeo de nombres en inglés a español para Rider-Waite
# Esto asumiendo que las imágenes están en inglés pero los seeds en español

echo "Verificando correspondencia de archivos..."

# Verificar Rider-Waite
echo "📁 Rider-Waite:"
ls -la /var/www/html/images/rider-waite/ | grep -E "\.(jpg|png|webp)" | head -10

echo ""
echo "📁 Marsella:"  
ls -la /var/www/html/images/marsella/ | grep -E "\.(jpg|png|webp)" | head -10

echo ""
echo "🎯 Vamos a crear un script de corrección..."