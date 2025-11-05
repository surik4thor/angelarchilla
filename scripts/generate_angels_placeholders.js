// Script para generar placeholders SVG del Tarot de los Ángeles (78 cartas)
// Cada jerarquía celestial tendrá colores y diseños específicos

const fs = require('fs');
const path = require('path');

// Importar la información de los ángeles
const angelsDeckModule = import('../backend/src/data/angels-deck.js');

// Configuración de directorios
const BASE_DIR = '/var/www/nebulosamagica/frontend/public/images/tarot';
const ANGELS_DIR = path.join(BASE_DIR, 'tarot-angeles');

// Configuración de colores por jerarquía celestial
const hierarchyColors = {
  "Serafines": {
    primary: "#FF6B35", // Naranja fuego divino
    secondary: "#FFD700", // Dorado celestial
    accent: "#FF4500", // Rojo fuego
    background: "radial-gradient(circle, #FFE4B5 0%, #FF6B35 100%)"
  },
  "Querubines": {
    primary: "#4169E1", // Azul real
    secondary: "#87CEEB", // Azul cielo
    accent: "#0000CD", // Azul medio
    background: "radial-gradient(circle, #E6F3FF 0%, #4169E1 100%)"
  },
  "Tronos": {
    primary: "#8A2BE2", // Violeta
    secondary: "#DDA0DD", // Ciruela
    accent: "#9370DB", // Púrpura medio
    background: "radial-gradient(circle, #F0E6FF 0%, #8A2BE2 100%)"
  },
  "Dominaciones": {
    primary: "#DC143C", // Carmesí
    secondary: "#FFB6C1", // Rosa claro
    accent: "#B22222", // Rojo ladrillo
    background: "radial-gradient(circle, #FFE4E1 0%, #DC143C 100%)"
  },
  "Virtudes": {
    primary: "#32CD32", // Verde lima
    secondary: "#98FB98", // Verde pálido
    accent: "#228B22", // Verde bosque
    background: "radial-gradient(circle, #F0FFF0 0%, #32CD32 100%)"
  },
  "Potestades": {
    primary: "#FF8C00", // Naranja oscuro
    secondary: "#FFE4B5", // Melocotón
    accent: "#FF4500", // Rojo naranja
    background: "radial-gradient(circle, #FFF8DC 0%, #FF8C00 100%)"
  },
  "Principados": {
    primary: "#20B2AA", // Verde mar claro
    secondary: "#AFEEEE", // Turquesa pálido
    accent: "#008B8B", // Verde azulado oscuro
    background: "radial-gradient(circle, #F0FFFF 0%, #20B2AA 100%)"
  },
  "Mensajeros": {
    primary: "#FFD700", // Dorado
    secondary: "#FFFFE0", // Amarillo claro
    accent: "#FFA500", // Naranja
    background: "radial-gradient(circle, #FFFACD 0%, #FFD700 100%)"
  },
  "Noveno Coro": {
    primary: "#C0C0C0", // Plateado
    secondary: "#F5F5F5", // Humo blanco
    accent: "#708090", // Gris pizarra
    background: "radial-gradient(circle, #F8F8FF 0%, #C0C0C0 100%)"
  },
  "Arcángeles": {
    primary: "#8B4513", // Marrón silla de montar
    secondary: "#D2691E", // Chocolate
    accent: "#A0522D", // Siena
    background: "radial-gradient(circle, #FAEBD7 0%, #8B4513 100%)"
  },
  "Hadas": {
    primary: "#FF69B4", // Rosa caliente
    secondary: "#FFB6C1", // Rosa claro
    accent: "#FF1493", // Rosa profundo
    background: "radial-gradient(circle, #FFF0F5 0%, #FF69B4 100%)"
  },
  "Gnomos": {
    primary: "#8B4513", // Marrón silla de montar
    secondary: "#D2B48C", // Tostado
    accent: "#654321", // Marrón oscuro
    background: "radial-gradient(circle, #F5DEB3 0%, #8B4513 100%)"
  },
  "Ángeles Representativos": {
    primary: "#6495ED", // Azul aciano
    secondary: "#B0E0E6", // Azul polvo
    accent: "#4682B4", // Azul acero
    background: "radial-gradient(circle, #F0F8FF 0%, #6495ED 100%)"
  },
  "Ángeles Especiales": {
    primary: "#9932CC", // Orquídea oscura
    secondary: "#DA70D6", // Orquídea
    accent: "#8B008B", // Magenta oscuro
    background: "radial-gradient(circle, #F8F0FF 0%, #9932CC 100%)"
  },
  "Grigori": {
    primary: "#2F4F4F", // Gris pizarra oscuro
    secondary: "#696969", // Gris tenue
    accent: "#000000", // Negro
    background: "radial-gradient(circle, #D3D3D3 0%, #2F4F4F 100%)"
  },
  "Ángeles Negativos": {
    primary: "#8B0000", // Rojo oscuro
    secondary: "#A0522D", // Siena
    accent: "#000000", // Negro
    background: "radial-gradient(circle, #FFE4E1 0%, #8B0000 100%)"
  }
};

// Función para crear directorio si no existe
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directorio creado: ${dirPath}`);
  }
}

// Función para obtener símbolo angelical según la jerarquía
function getAngelSymbol(hierarchy) {
  const symbols = {
    "Serafines": "♦", // Seis alas de fuego
    "Querubines": "⬟", // Cuatro caras y alas
    "Tronos": "⊙", // Ruedas con ojos
    "Dominaciones": "♛", // Corona de autoridad
    "Virtudes": "✤", // Estrella de virtud
    "Potestades": "⚔", // Espada de poder
    "Principados": "▲", // Pirámide de gobierno
    "Mensajeros": "✉", // Mensaje divino
    "Noveno Coro": "◈", // Coro celestial
    "Arcángeles": "☩", // Cruz angelical
    "Hadas": "❀", // Flor mágica
    "Gnomos": "⚒", // Martillo de trabajo
    "Ángeles Representativos": "☆", // Estrella representativa
    "Ángeles Especiales": "◊", // Diamante especial
    "Grigori": "👁", // Ojo vigilante
    "Ángeles Negativos": "⚡" // Rayo de caída
  };
  return symbols[hierarchy] || "☆";
}

// Función para generar SVG de carta angelical
function generateAngelCardSVG(cardNumber, cardData) {
  const colors = hierarchyColors[cardData.hierarchy];
  const symbol = getAngelSymbol(cardData.hierarchy);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="300" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .card-border { fill: none; stroke: ${colors.accent}; stroke-width: 3; }
      .background { fill: url(#bgGradient); }
      .hierarchy-text { font-family: 'Georgia', serif; font-size: 10px; fill: ${colors.accent}; font-weight: bold; }
      .number { font-family: 'Arial Black', sans-serif; font-size: 24px; fill: ${colors.primary}; font-weight: bold; }
      .name { font-family: 'Times New Roman', serif; font-size: 12px; fill: ${colors.accent}; font-weight: bold; }
      .symbol { font-size: 40px; fill: ${colors.primary}; text-anchor: middle; }
      .tier-text { font-family: 'Arial', sans-serif; font-size: 8px; fill: ${colors.accent}; font-style: italic; }
      .divine-light { fill: none; stroke: ${colors.secondary}; stroke-width: 1; opacity: 0.6; }
    </style>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.secondary};stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:${colors.primary};stop-opacity:0.1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Fondo de la carta -->
  <rect width="200" height="300" class="background" rx="15"/>
  
  <!-- Borde de la carta -->
  <rect width="194" height="294" x="3" y="3" class="card-border" rx="12"/>
  
  <!-- Rayos de luz divina -->
  <g class="divine-light" opacity="0.4">
    <line x1="100" y1="20" x2="100" y2="280" />
    <line x1="20" y1="150" x2="180" y2="150" />
    <line x1="40" y1="60" x2="160" y2="240" />
    <line x1="160" y1="60" x2="40" y2="240" />
  </g>
  
  <!-- Número de carta (esquina superior izquierda) -->
  <text x="15" y="30" class="number">${cardNumber}</text>
  
  <!-- Jerarquía (parte superior) -->
  <text x="100" y="45" class="hierarchy-text" text-anchor="middle">${cardData.hierarchy.toUpperCase()}</text>
  
  <!-- Nivel jerárquico -->
  <text x="100" y="55" class="tier-text" text-anchor="middle">${cardData.tier}</text>
  
  <!-- Símbolo angelical central -->
  <text x="100" y="140" class="symbol" filter="url(#glow)">${symbol}</text>
  
  <!-- Nombre del ángel (líneas múltiples si es necesario) -->
  <g class="name" text-anchor="middle">
    ${cardData.name.length > 20 ? 
      `<text x="100" y="180">${cardData.name.substring(0, 20)}</text>
       <text x="100" y="195">${cardData.name.substring(20)}</text>` :
      `<text x="100" y="185">${cardData.name}</text>`
    }
  </g>
  
  <!-- Elementos decorativos en las esquinas -->
  <circle cx="25" cy="275" r="8" fill="${colors.secondary}" opacity="0.6"/>
  <circle cx="175" cy="275" r="8" fill="${colors.secondary}" opacity="0.6"/>
  <circle cx="25" cy="25" r="8" fill="${colors.secondary}" opacity="0.6"/>
  <circle cx="175" cy="25" r="8" fill="${colors.secondary}" opacity="0.6"/>
  
  <!-- Aura angelical -->
  <circle cx="100" cy="120" r="60" fill="none" stroke="${colors.secondary}" stroke-width="1" opacity="0.3"/>
  <circle cx="100" cy="120" r="45" fill="none" stroke="${colors.primary}" stroke-width="1" opacity="0.2"/>
  
  <!-- Número en esquina inferior derecha -->
  <text x="185" y="285" class="number" text-anchor="end" font-size="18">${cardNumber}</text>
  
  <!-- Marca de autenticidad -->
  <text x="100" y="270" class="tier-text" text-anchor="middle" opacity="0.7">TAROT DE LOS ÁNGELES</text>
</svg>`;
}

// Función principal para generar todas las cartas
async function generateAllAngelCards() {
  console.log('🔮 Iniciando generación de placeholders del Tarot de los Ángeles (78 cartas)...\n');
  
  try {
    // Importar datos de ángeles
    const { angelsDeck } = await angelsDeckModule;
    
    // Crear directorio base
    ensureDirectoryExists(ANGELS_DIR);
    
    let generatedCount = 0;
    let hierarchyCount = {};
    
    // Generar cada carta
    for (let cardNumber = 1; cardNumber <= 78; cardNumber++) {
      const cardData = angelsDeck[cardNumber];
      
      if (!cardData) {
        console.log(`⚠️ Advertencia: No se encontraron datos para la carta ${cardNumber}`);
        continue;
      }
      
      // Contar por jerarquía
      if (!hierarchyCount[cardData.hierarchy]) {
        hierarchyCount[cardData.hierarchy] = 0;
      }
      hierarchyCount[cardData.hierarchy]++;
      
      // Generar SVG
      const svgContent = generateAngelCardSVG(cardNumber, cardData);
      
      // Crear nombre de archivo
      const fileName = `${cardNumber.toString().padStart(2, '0')}-${cardData.name.toLowerCase().replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}.svg`;
      const filePath = path.join(ANGELS_DIR, fileName);
      
      // Guardar archivo
      fs.writeFileSync(filePath, svgContent, 'utf8');
      console.log(`✨ Carta ${cardNumber}: ${cardData.name} (${cardData.hierarchy}) - ${fileName}`);
      
      generatedCount++;
    }
    
    console.log('\n📊 RESUMEN DE GENERACIÓN:');
    console.log(`📁 Directorio: ${ANGELS_DIR}`);
    console.log(`🎴 Total de cartas generadas: ${generatedCount}/78`);
    console.log('\n🏛️ DISTRIBUCIÓN POR JERARQUÍA:');
    
    Object.entries(hierarchyCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([hierarchy, count]) => {
        console.log(`   ${hierarchy}: ${count} cartas`);
      });
    
    if (generatedCount === 78) {
      console.log('\n✅ ¡ÉXITO! Se generaron todas las 78 cartas del Tarot de los Ángeles');
      console.log('🔮 Cada carta incluye:');
      console.log('   • Colores específicos por jerarquía celestial');
      console.log('   • Símbolo angelical único');
      console.log('   • Aura y rayos de luz divina');
      console.log('   • Nombre completo del ángel');
      console.log('   • Numeración y autenticidad');
    } else {
      console.log(`\n⚠️ Se generaron ${generatedCount} de 78 cartas. Revisar datos faltantes.`);
    }
    
  } catch (error) {
    console.error('❌ Error al generar cartas de ángeles:', error);
  }
}

// Ejecutar script
generateAllAngelCards();

console.log('\n🌟 Script de generación del Tarot de los Ángeles iniciado...');
console.log('   📋 78 cartas con jerarquía celestial completa');
console.log('   🎨 Diseños únicos por cada orden angelical');
console.log('   ✨ Colores y símbolos específicos por jerarquía\n');