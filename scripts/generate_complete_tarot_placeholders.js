#!/usr/bin/env node

/**
 * NEBULOSA MÁGICA - Generador de Placeholders COMPLETOS de Tarot
 * Genera todas las 78 cartas: 22 Arcanos Mayores + 56 Arcanos Menores
 */

const fs = require('fs').promises;
const path = require('path');

// Configuraciones de colores y temas por tipo de baraja
const DECK_THEMES = {
  'rider-waite': {
    name: 'Rider-Waite',
    colors: ['#1e3a8a', '#fbbf24', '#f3f4f6'],
    description: 'Simbolismo visual rico y arquetipos psicológicos'
  },
  'marsella': {
    name: 'Marsella', 
    colors: ['#dc2626', '#fbbf24', '#f9fafb'],
    description: 'Tradición francesa pura y geometría sagrada'
  },
  'tarot-angeles': {
    name: 'Tarot de Ángeles',
    colors: ['#0ea5e9', '#f8fafc', '#e0f2fe'], 
    description: 'Conexión celestial y guía angelical'
  },
  'tarot-egipcio': {
    name: 'Tarot Egipcio',
    colors: ['#d97706', '#0f172a', '#fef3c7'],
    description: 'Sabiduría ancestral del antiguo Egipto'
  },
  'tarot-gitano': {
    name: 'Tarot Gitano', 
    colors: ['#7c3aed', '#d1d5db', '#f3e8ff'],
    description: 'Tradición bohemia y intuición gitana'
  }
};

// Directorio base
const TAROT_DIR = path.join(process.cwd(), '../frontend/public/images/tarot');

// Definición de Arcanos Mayores (22 cartas)
const MAJOR_ARCANA = [
  { id: 0, name: 'el-loco', title: 'El Loco', roman: '0' },
  { id: 1, name: 'el-mago', title: 'El Mago', roman: 'I' },
  { id: 2, name: 'la-suma-sacerdotisa', title: 'La Suma Sacerdotisa', roman: 'II' },
  { id: 3, name: 'la-emperatriz', title: 'La Emperatriz', roman: 'III' },
  { id: 4, name: 'el-emperador', title: 'El Emperador', roman: 'IV' },
  { id: 5, name: 'el-sumo-sacerdote', title: 'El Sumo Sacerdote', roman: 'V' },
  { id: 6, name: 'los-enamorados', title: 'Los Enamorados', roman: 'VI' },
  { id: 7, name: 'el-carro', title: 'El Carro', roman: 'VII' },
  { id: 8, name: 'la-fuerza', title: 'La Fuerza', roman: 'VIII' },
  { id: 9, name: 'el-ermitano', title: 'El Ermitaño', roman: 'IX' },
  { id: 10, name: 'la-rueda-de-la-fortuna', title: 'La Rueda de la Fortuna', roman: 'X' },
  { id: 11, name: 'la-justicia', title: 'La Justicia', roman: 'XI' },
  { id: 12, name: 'el-colgado', title: 'El Colgado', roman: 'XII' },
  { id: 13, name: 'la-muerte', title: 'La Muerte', roman: 'XIII' },
  { id: 14, name: 'la-templanza', title: 'La Templanza', roman: 'XIV' },
  { id: 15, name: 'el-diablo', title: 'El Diablo', roman: 'XV' },
  { id: 16, name: 'la-torre', title: 'La Torre', roman: 'XVI' },
  { id: 17, name: 'la-estrella', title: 'La Estrella', roman: 'XVII' },
  { id: 18, name: 'la-luna', title: 'La Luna', roman: 'XVIII' },
  { id: 19, name: 'el-sol', title: 'El Sol', roman: 'XIX' },
  { id: 20, name: 'el-juicio', title: 'El Juicio', roman: 'XX' },
  { id: 21, name: 'el-mundo', title: 'El Mundo', roman: 'XXI' }
];

// Definición de Arcanos Menores (56 cartas)
const MINOR_ARCANA = {
  suits: [
    { name: 'copas', title: 'Copas', symbol: '♥', element: 'Agua' },
    { name: 'espadas', title: 'Espadas', symbol: '⚔', element: 'Aire' },
    { name: 'bastos', title: 'Bastos', symbol: '♣', element: 'Fuego' },
    { name: 'oros', title: 'Oros', symbol: '♦', element: 'Tierra' }
  ],
  numbers: [
    { value: 1, name: 'as', title: 'As' },
    { value: 2, name: 'dos', title: 'Dos' },
    { value: 3, name: 'tres', title: 'Tres' },
    { value: 4, name: 'cuatro', title: 'Cuatro' },
    { value: 5, name: 'cinco', title: 'Cinco' },
    { value: 6, name: 'seis', title: 'Seis' },
    { value: 7, name: 'siete', title: 'Siete' },
    { value: 8, name: 'ocho', title: 'Ocho' },
    { value: 9, name: 'nueve', title: 'Nueve' },
    { value: 10, name: 'diez', title: 'Diez' }
  ],
  court: [
    { name: 'sota', title: 'Sota', symbol: 'J' },
    { name: 'caballo', title: 'Caballo', symbol: 'C' },
    { name: 'reina', title: 'Reina', symbol: 'Q' },
    { name: 'rey', title: 'Rey', symbol: 'K' }
  ]
};

/**
 * Crea las carpetas necesarias
 */
async function ensureDirectories() {
  for (const deckType of Object.keys(DECK_THEMES)) {
    const deckDir = path.join(TAROT_DIR, deckType);
    
    // Crear carpetas para arcanos mayores y menores
    const majorDir = path.join(deckDir, 'arcanos-mayores');
    const minorDir = path.join(deckDir, 'arcanos-menores');
    
    await fs.mkdir(majorDir, { recursive: true });
    await fs.mkdir(minorDir, { recursive: true });
    
    // Crear subcarpetas para cada palo de arcanos menores
    for (const suit of MINOR_ARCANA.suits) {
      const suitDir = path.join(minorDir, suit.name);
      await fs.mkdir(suitDir, { recursive: true });
    }
  }
}

/**
 * Crea un placeholder SVG para carta de arcanos mayores
 */
function createMajorArcanaPlaceholder(card, deckType) {
  const theme = DECK_THEMES[deckType];
  const [primary, secondary, accent] = theme.colors;
  
  return `<svg width="200" height="350" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${deckType}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primary};stop-opacity:0.1"/>
      <stop offset="100%" style="stop-color:${secondary};stop-opacity:0.2"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="black" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Fondo -->
  <rect x="5" y="5" width="190" height="340" rx="15" ry="15" 
        fill="url(#bg-${deckType})" 
        stroke="${primary}" 
        stroke-width="2"
        filter="url(#shadow)"/>
  
  <!-- Borde interior -->
  <rect x="15" y="15" width="170" height="320" rx="10" ry="10" 
        fill="none" 
        stroke="${secondary}" 
        stroke-width="1" 
        opacity="0.6"/>
  
  <!-- Número romano -->
  <text x="100" y="50" 
        text-anchor="middle" 
        font-family="serif" 
        font-size="24" 
        font-weight="bold"
        fill="${primary}">
    ${card.roman}
  </text>
  
  <!-- Símbolo central decorativo -->
  <g transform="translate(100, 175)">
    <circle r="40" fill="none" stroke="${secondary}" stroke-width="2" opacity="0.4"/>
    <path d="M0,-30 L7.5,-7.5 L30,0 L7.5,7.5 L0,30 L-7.5,7.5 L-30,0 L-7.5,-7.5 Z" 
          fill="${secondary}" 
          opacity="0.3"/>
  </g>
  
  <!-- Título -->
  <text x="100" y="300" 
        text-anchor="middle" 
        font-family="serif" 
        font-size="12" 
        font-weight="bold"
        fill="${primary}">
    ${card.title}
  </text>
  
  <!-- Marca Nebulosa Mágica -->
  <text x="100" y="325" 
        text-anchor="middle" 
        font-family="sans-serif" 
        font-size="8" 
        fill="${secondary}" 
        opacity="0.6">
    NEBULOSA MÁGICA
  </text>
</svg>`;
}

/**
 * Crea un placeholder SVG para carta de arcanos menores
 */
function createMinorArcanaPlaceholder(title, number, suit, deckType, cardType = 'number') {
  const theme = DECK_THEMES[deckType];
  const [primary, secondary, accent] = theme.colors;
  
  // Símbolos repetidos para cartas numeradas
  let symbolsPattern = '';
  if (cardType === 'number' && number <= 10) {
    for (let i = 0; i < Math.min(number, 5); i++) {
      const x = 50 + (i % 3) * 30;
      const y = 120 + Math.floor(i / 3) * 40;
      symbolsPattern += `<text x="${x}" y="${y}" text-anchor="middle" font-size="20" fill="${secondary}" opacity="0.6">${suit.symbol}</text>`;
    }
  }
  
  return `<svg width="200" height="350" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${deckType}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primary};stop-opacity:0.1"/>
      <stop offset="100%" style="stop-color:${secondary};stop-opacity:0.2"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="black" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Fondo -->
  <rect x="5" y="5" width="190" height="340" rx="15" ry="15" 
        fill="url(#bg-${deckType})" 
        stroke="${primary}" 
        stroke-width="2"
        filter="url(#shadow)"/>
  
  <!-- Borde interior -->
  <rect x="15" y="15" width="170" height="320" rx="10" ry="10" 
        fill="none" 
        stroke="${secondary}" 
        stroke-width="1" 
        opacity="0.6"/>
  
  <!-- Número o letra de corte -->
  <text x="30" y="40" 
        font-family="serif" 
        font-size="18" 
        font-weight="bold"
        fill="${primary}">
    ${cardType === 'court' ? suit.symbol : number}
  </text>
  
  <text x="170" y="320" 
        font-family="serif" 
        font-size="18" 
        font-weight="bold"
        fill="${primary}"
        transform="rotate(180 170 320)">
    ${cardType === 'court' ? suit.symbol : number}
  </text>
  
  <!-- Símbolo del palo central -->
  <text x="100" y="100" 
        text-anchor="middle" 
        font-family="serif" 
        font-size="30" 
        fill="${secondary}">
    ${suit.symbol}
  </text>
  
  <!-- Patrones de símbolos para cartas numeradas -->
  ${symbolsPattern}
  
  <!-- Elemento del palo -->
  <text x="100" y="140" 
        text-anchor="middle" 
        font-family="serif" 
        font-size="10" 
        fill="${primary}" 
        opacity="0.7">
    ${suit.element}
  </text>
  
  <!-- Título -->
  <text x="100" y="280" 
        text-anchor="middle" 
        font-family="serif" 
        font-size="11" 
        font-weight="bold"
        fill="${primary}">
    ${title}
  </text>
  
  <!-- Palo -->
  <text x="100" y="300" 
        text-anchor="middle" 
        font-family="serif" 
        font-size="10" 
        fill="${secondary}" 
        opacity="0.8">
    ${suit.title}
  </text>
  
  <!-- Marca -->
  <text x="100" y="325" 
        text-anchor="middle" 
        font-family="sans-serif" 
        font-size="8" 
        fill="${secondary}" 
        opacity="0.6">
    NEBULOSA MÁGICA
  </text>
</svg>`;
}

/**
 * Genera dorso de carta
 */
function createCardBack(deckType) {
  const theme = DECK_THEMES[deckType];
  const [primary, secondary, accent] = theme.colors;
  
  return `<svg width="200" height="350" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="back-${deckType}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${secondary};stop-opacity:0.3"/>
      <stop offset="100%" style="stop-color:${primary};stop-opacity:0.1"/>
    </radialGradient>
    <pattern id="pattern-${deckType}" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="3" fill="${secondary}" opacity="0.2"/>
    </pattern>
  </defs>
  
  <!-- Fondo -->
  <rect x="5" y="5" width="190" height="340" rx="15" ry="15" 
        fill="url(#back-${deckType})" 
        stroke="${primary}" 
        stroke-width="2"/>
  
  <!-- Patrón -->
  <rect x="10" y="10" width="180" height="330" rx="10" ry="10" 
        fill="url(#pattern-${deckType})"/>
  
  <!-- Logo central -->
  <text x="100" y="175" 
        text-anchor="middle" 
        font-family="serif" 
        font-size="16" 
        font-weight="bold"
        fill="${primary}">
    NEBULOSA
  </text>
  <text x="100" y="195" 
        text-anchor="middle" 
        font-family="serif" 
        font-size="16" 
        font-weight="bold"
        fill="${primary}">
    MÁGICA
  </text>
  
  <!-- Subtítulo -->
  <text x="100" y="220" 
        text-anchor="middle" 
        font-family="serif" 
        font-size="12" 
        fill="${secondary}">
    ${theme.name}
  </text>
</svg>`;
}

/**
 * Genera placeholders para una baraja completa
 */
async function generateFullDeck(deckType) {
  let totalCreated = 0;
  
  console.log(`\n🃏 Generando baraja completa: ${DECK_THEMES[deckType].name}`);
  
  // Arcanos Mayores (22 cartas)
  const majorDir = path.join(TAROT_DIR, deckType, 'arcanos-mayores');
  for (const card of MAJOR_ARCANA) {
    const filename = `${card.name}.svg`;
    const filepath = path.join(majorDir, filename);
    
    try {
      await fs.access(filepath);
      console.log(`⏭️  Ya existe: arcanos-mayores/${filename}`);
    } catch {
      const svg = createMajorArcanaPlaceholder(card, deckType);
      await fs.writeFile(filepath, svg, 'utf8');
      console.log(`✅ Creado: arcanos-mayores/${filename}`);
      totalCreated++;
    }
  }
  
  // Arcanos Menores (56 cartas)
  for (const suit of MINOR_ARCANA.suits) {
    const suitDir = path.join(TAROT_DIR, deckType, 'arcanos-menores', suit.name);
    
    // Cartas numeradas (As - 10)
    for (const number of MINOR_ARCANA.numbers) {
      const filename = `${number.name}-de-${suit.name}.svg`;
      const filepath = path.join(suitDir, filename);
      const title = `${number.title} de ${suit.title}`;
      
      try {
        await fs.access(filepath);
        console.log(`⏭️  Ya existe: arcanos-menores/${suit.name}/${filename}`);
      } catch {
        const svg = createMinorArcanaPlaceholder(title, number.value, suit, deckType, 'number');
        await fs.writeFile(filepath, svg, 'utf8');
        console.log(`✅ Creado: arcanos-menores/${suit.name}/${filename}`);
        totalCreated++;
      }
    }
    
    // Cartas de la corte (Sota, Caballo, Reina, Rey)
    for (const court of MINOR_ARCANA.court) {
      const filename = `${court.name}-de-${suit.name}.svg`;
      const filepath = path.join(suitDir, filename);
      const title = `${court.title} de ${suit.title}`;
      
      try {
        await fs.access(filepath);
        console.log(`⏭️  Ya existe: arcanos-menores/${suit.name}/${filename}`);
      } catch {
        const svg = createMinorArcanaPlaceholder(title, court.symbol, suit, deckType, 'court');
        await fs.writeFile(filepath, svg, 'utf8');
        console.log(`✅ Creado: arcanos-menores/${suit.name}/${filename}`);
        totalCreated++;
      }
    }
  }
  
  // Dorso de carta
  const backPath = path.join(TAROT_DIR, deckType, 'card-back.svg');
  try {
    await fs.access(backPath);
    console.log(`⏭️  Ya existe: card-back.svg`);
  } catch {
    const svg = createCardBack(deckType);
    await fs.writeFile(backPath, svg, 'utf8');
    console.log(`✅ Creado: card-back.svg`);
    totalCreated++;
  }
  
  return totalCreated;
}

/**
 * Función principal
 */
async function main() {
  console.log('🎨 NEBULOSA MÁGICA - Generador COMPLETO de Placeholders de Tarot');
  console.log('='.repeat(80));
  console.log('📊 Generando las 78 cartas + dorso para cada tipo de baraja');
  console.log('   • 22 Arcanos Mayores');
  console.log('   • 56 Arcanos Menores (14 cartas × 4 palos)');
  console.log('   • 1 Dorso de carta');
  console.log('='.repeat(80));
  
  let grandTotal = 0;
  
  try {
    // Crear directorios
    await ensureDirectories();
    console.log('📁 Estructura de directorios creada');
    
    // Generar barajas completas
    for (const deckType of Object.keys(DECK_THEMES)) {
      const created = await generateFullDeck(deckType);
      grandTotal += created;
    }
    
    // Resumen final
    console.log('\n' + '='.repeat(80));
    console.log('📋 RESUMEN FINAL');
    console.log('='.repeat(80));
    console.log(`✅ Placeholders creados: ${grandTotal}`);
    console.log(`🃏 Barajas procesadas: ${Object.keys(DECK_THEMES).length}`);
    console.log(`📦 Total por baraja: 79 archivos (78 cartas + 1 dorso)`);
    console.log(`🎯 Total posible: ${Object.keys(DECK_THEMES).length * 79} archivos`);
    console.log('');
    console.log('📖 Estructura generada:');
    console.log('   /tarot/[tipo-baraja]/arcanos-mayores/     (22 cartas)');
    console.log('   /tarot/[tipo-baraja]/arcanos-menores/');
    console.log('     ├── copas/      (14 cartas)');
    console.log('     ├── espadas/    (14 cartas)'); 
    console.log('     ├── bastos/     (14 cartas)');
    console.log('     └── oros/       (14 cartas)');
    console.log('   /tarot/[tipo-baraja]/card-back.svg       (1 dorso)');
    console.log('');
    console.log('🎉 ¡Sistema de placeholders completo y listo!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Ejecutar
main();