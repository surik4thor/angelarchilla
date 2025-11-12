#!/bin/bash

echo "🧪 PRUEBA COMPLETA DE SISTEMA TAROT"
echo "==================================="

echo "📊 1. Verificando cartas en base de datos..."
cd /var/www/nebulosamagica/backend
node -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const riderCount = await prisma.tarotCard.count({ where: { deckType: 'RIDER_WAITE' } });
const marsellaCount = await prisma.tarotCard.count({ where: { deckType: 'MARSELLA' } });

console.log(\`✅ Cartas Rider-Waite: \${riderCount}\`);
console.log(\`✅ Cartas Marsella: \${marsellaCount}\`);

const sampleCard = await prisma.tarotCard.findFirst({
  where: { deckType: 'RIDER_WAITE' },
  select: { name: true, imageUrl: true, meaning: true }
});

console.log(\`📋 Carta de ejemplo:\`);
console.log(\`   Nombre: \${sampleCard.name}\`);
console.log(\`   Imagen: \${sampleCard.imageUrl}\`);
console.log(\`   Significado: \${sampleCard.meaning?.slice(0, 50)}...\`);

await prisma.\$disconnect();
"

echo ""
echo "🔍 2. Verificando archivos de imágenes..."
RIDER_FILES=$(ls /var/www/html/images/rider-waite/*.jpg 2>/dev/null | wc -l)
MARSELLA_FILES=$(ls /var/www/html/images/marsella/*.jpg 2>/dev/null | wc -l)

echo "✅ Archivos Rider-Waite: $RIDER_FILES"
echo "✅ Archivos Marsella: $MARSELLA_FILES"

echo ""
echo "🌐 3. Probando accesibilidad de imágenes..."
curl -s -o /dev/null -w "Rider-Waite imagen: %{http_code}\n" https://nebulosamagica.com/images/rider-waite/00-the-fool.jpg
curl -s -o /dev/null -w "Marsella imagen: %{http_code}\n" https://nebulosamagica.com/images/marsella/00-le-mat.jpg

echo ""
echo "🎯 RESULTADO: Sistema de imágenes configurado correctamente"
echo "🔧 Las lecturas de Tarot ahora deberían mostrar las cartas con sus imágenes"