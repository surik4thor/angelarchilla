#!/bin/bash
# Script para organizar las imágenes de las barajas de tarot
# Uso: ./organize_tarot_images.sh

echo "🔮 Organizador de Imágenes de Tarot de Nebulosa Mágica"
echo "=================================================="

# Directorios base
BASE_DIR="/var/www/nebulosamagica/frontend/public/images"
RIDER_WAITE_DIR="$BASE_DIR/rider-waite"
MARSELLA_DIR="$BASE_DIR/marsella"
ANGELES_DIR="$BASE_DIR/tarot-angeles"
EGIPCIO_DIR="$BASE_DIR/tarot-egipcio"
GITANO_DIR="$BASE_DIR/tarot-gitano"

# Crear directorios si no existen
mkdir -p "$RIDER_WAITE_DIR"
mkdir -p "$MARSELLA_DIR"
mkdir -p "$ANGELES_DIR"
mkdir -p "$EGIPCIO_DIR"
mkdir -p "$GITANO_DIR"

echo "📁 Directorios creados para las barajas:"
echo "   - Rider-Waite: $RIDER_WAITE_DIR"
echo "   - Marsella: $MARSELLA_DIR"
echo "   - Ángeles: $ANGELES_DIR"
echo "   - Egipcio: $EGIPCIO_DIR"
echo "   - Gitano: $GITANO_DIR"

echo ""
echo "📋 Estructura recomendada para cada baraja:"
echo ""
echo "🃏 Rider-Waite y Marsella (78 cartas):"
echo "   Arcanos Mayores (22): 00-fool.jpg a 21-world.jpg"
echo "   Arcanos Menores (56):"
echo "     - Bastos: ace-wands.jpg a king-wands.jpg"
echo "     - Copas: ace-cups.jpg a king-cups.jpg"  
echo "     - Espadas: ace-swords.jpg a king-swords.jpg"
echo "     - Oros: ace-pentacles.jpg a king-pentacles.jpg"

echo ""
echo "👼 Tarot de los Ángeles (44 cartas típicamente):"
echo "   Formato: angel-001-miguel.jpg a angel-044-nombre.jpg"
echo "   Ejemplos:"
echo "     - angel-001-arcangel-miguel.jpg"
echo "     - angel-002-arcangel-gabriel.jpg"
echo "     - angel-003-angel-guardian.jpg"

echo ""
echo "🏺 Tarot Egipcio (78 cartas):"
echo "   Arcanos Mayores: egypt-major-01-mago.jpg a egypt-major-22-mundo.jpg"
echo "   Arcanos Menores: egypt-minor-[palo]-[numero].jpg"
echo "   Ejemplos:"
echo "     - egypt-major-01-mago.jpg"
echo "     - egypt-minor-bastos-as.jpg"

echo ""
echo "🔥 Tarot Gitano (36 cartas típicamente):"
echo "   Formato: gitano-01-nombre.jpg a gitano-36-nombre.jpg"

echo ""
echo "🌐 URLs de referencia para obtener imágenes:"
echo "   - Base: https://www.tiradadetarot.gratis/"
echo "   - Ángeles: https://www.tiradadetarot.gratis/tarot-de-los-angeles.php"
echo "   - Egipcio: https://www.tiradadetarot.gratis/tarot-egipcio.php"

echo ""
echo "💡 Recomendaciones:"
echo "   1. Nombres en minúsculas con guiones"
echo "   2. Formato JPG o PNG optimizado para web"
echo "   3. Tamaño recomendado: 300x500px para cartas"
echo "   4. Crear un reverso genérico: back.jpg para cada baraja"

echo ""
echo "📝 Archivo de configuración creado en:"
echo "   $BASE_DIR/tarot-images-config.json"

# Crear archivo de configuración JSON
cat > "$BASE_DIR/tarot-images-config.json" << EOF
{
  "imageConfig": {
    "rider-waite": {
      "path": "/images/rider-waite/",
      "totalCards": 78,
      "hasMinorArcana": true,
      "backImage": "back.jpg",
      "majorArcana": {
        "count": 22,
        "format": "{number}-{name-en}.jpg",
        "example": "00-fool.jpg"
      },
      "minorArcana": {
        "suits": ["wands", "cups", "swords", "pentacles"],
        "format": "{rank}-{suit}.jpg",
        "example": "ace-wands.jpg"
      }
    },
    "marsella": {
      "path": "/images/marsella/",
      "totalCards": 78,
      "hasMinorArcana": true,
      "backImage": "back.jpg",
      "majorArcana": {
        "count": 22,
        "format": "{number}-{name-fr}.jpg",
        "example": "01-bateleur.jpg"
      },
      "minorArcana": {
        "suits": ["batons", "coupes", "epees", "deniers"],
        "format": "{rank}-{suit}.jpg",
        "example": "as-batons.jpg"
      }
    },
    "tarot-angeles": {
      "path": "/images/tarot-angeles/",
      "totalCards": 44,
      "hasMinorArcana": false,
      "backImage": "back.jpg",
      "format": "angel-{number}-{name}.jpg",
      "example": "angel-001-arcangel-miguel.jpg"
    },
    "tarot-egipcio": {
      "path": "/images/tarot-egipcio/", 
      "totalCards": 78,
      "hasMinorArcana": true,
      "backImage": "back.jpg",
      "majorArcana": {
        "count": 22,
        "format": "egypt-major-{number}-{name}.jpg",
        "example": "egypt-major-01-mago.jpg"
      },
      "minorArcana": {
        "suits": ["bastos", "copas", "espadas", "oros"],
        "format": "egypt-minor-{suit}-{rank}.jpg",
        "example": "egypt-minor-bastos-as.jpg"
      }
    },
    "tarot-gitano": {
      "path": "/images/tarot-gitano/",
      "totalCards": 36,
      "hasMinorArcana": false,
      "backImage": "back.jpg", 
      "format": "gitano-{number}-{name}.jpg",
      "example": "gitano-01-amor.jpg"
    }
  }
}
EOF

echo "✅ Configuración completada!"
echo ""
echo "🚀 Próximos pasos:"
echo "   1. Descargar imágenes de tiradadetarot.gratis"
echo "   2. Renombrar según la estructura definida"
echo "   3. Optimizar tamaño y calidad para web"
echo "   4. Colocar en los directorios correspondientes"
echo "   5. Crear reversos personalizados para cada baraja"

chmod +x "$0"