#!/usr/bin/env node

/**
 * Generador de placeholders mejorados para cartas de tarot
 * Crea imágenes temporales elegantes mientras se añaden las reales
 */

const fs = require('fs').promises;
const path = require('path');

// Directorio base para el tarot
const TAROT_DIR = '/var/www/nebulosamagica/frontend/public/images/tarot';

// Temas visuales para cada tipo de baraja
const DECK_THEMES = {
  'rider-waite': {
    colors: ['#8B4513', '#DAA520', '#4B0082'],
    style: 'Simbolismo Visual Rico',
    era: '1910',
    background: 'linear-gradient(135deg, #8B4513, #DAA520)'
  },
  'marsella': {
    colors: ['#DC143C', '#FFD700', '#000080'],
    style: 'Tradición Francesa',
    era: 'Siglo XVII',
    background: 'linear-gradient(135deg, #DC143C, #FFD700)'
  },
  'tarot-angeles': {
    colors: ['#FFD700', '#F0F8FF', '#DDA0DD'],
    style: 'Guía Angelical',
    era: 'Espiritual',
    background: 'linear-gradient(135deg, #FFD700, #F0F8FF)'
  },
  'tarot-egipcio': {
    colors: ['#CD853F', '#DAA520', '#8B4513'],
    style: 'Sabiduría Ancestral',
    era: 'Antiguo Egipto',
    background: 'linear-gradient(135deg, #CD853F, #DAA520)'
  },
  'tarot-gitano': {
    colors: ['#8B0000', '#FFD700', '#32CD32'],
    style: 'Tradición Romani',
    era: 'Ancestral',
    background: 'linear-gradient(135deg, #8B0000, #FFD700)'
  }
};

// Lista de cartas principales (Arcanos Mayores)
// Definición de Arcanos Mayores
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

// Definición de Arcanos Menores
const MINOR_ARCANA = {
  suits: [
    { name: 'copas', title: 'Copas', symbol: '♥' },
    { name: 'espadas', title: 'Espadas', symbol: '⚔' },
    { name: 'bastos', title: 'Bastos', symbol: '♣' },
    { name: 'oros', title: 'Oros', symbol: '♦' }
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
    { name: 'sota', title: 'Sota' },
    { name: 'caballo', title: 'Caballo' },
    { name: 'reina', title: 'Reina' },
    { name: 'rey', title: 'Rey' }
  ]
};

/**
 * Crea un placeholder elegante para una carta de tarot
 */
function createTarotCardPlaceholder(card, deckType) {
  const theme = DECK_THEMES[deckType];
  const primaryColor = theme.colors[0];
  const secondaryColor = theme.colors[1];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="350" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradiente de fondo -->
    <linearGradient id="bg-${deckType}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${secondaryColor};stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:${primaryColor};stop-opacity:0.6" />
    </linearGradient>
    
    <!-- Patrón decorativo -->
    <pattern id="pattern-${deckType}" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="none"/>
      <circle cx="20" cy="20" r="2" fill="${secondaryColor}" opacity="0.3"/>
      <path d="M0,20 Q20,0 40,20 Q20,40 0,20" fill="none" stroke="${secondaryColor}" stroke-width="0.5" opacity="0.2"/>
    </pattern>
    
    <!-- Sombra -->
    <filter id="shadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="2" dy="2" result="offset"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.5"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Fondo de carta -->
  <rect x="5" y="5" width="190" height="340" rx="15" ry="15" 
        fill="url(#bg-${deckType})" 
        stroke="${primaryColor}" 
        stroke-width="2"
        filter="url(#shadow)"/>
  
  <!-- Patrón decorativo de fondo -->
  <rect x="10" y="10" width="180" height="330" rx="10" ry="10" 
        fill="url(#pattern-${deckType})" 
        opacity="0.3"/>
  
  <!-- Borde interior -->
  <rect x="15" y="15" width="170" height="320" rx="10" ry="10" 
        fill="none" 
        stroke="${secondaryColor}" 
        stroke-width="1" 
        opacity="0.6"/>
  
  <!-- Número romano (si aplica) -->
  ${card.number !== undefined ? `
    <text x="30" y="40" 
          font-family="serif" 
          font-size="18" 
          font-weight="bold"
          fill="${secondaryColor}" 
          opacity="0.8">
      ${toRoman(card.number)}
    </text>
  ` : ''}
  
  <!-- Símbolo central decorativo -->
  <g transform="translate(100, 175)">
    <!-- Estrella de 8 puntas -->
    <path d="M0,-30 L7.5,-7.5 L30,0 L7.5,7.5 L0,30 L-7.5,7.5 L-30,0 L-7.5,-7.5 Z" 
          fill="${secondaryColor}" 
          opacity="0.4"
          stroke="${primaryColor}" 
          stroke-width="1"/>
    
    <!-- Círculo interior -->
    <circle cx="0" cy="0" r="15" 
            fill="none" 
            stroke="${secondaryColor}" 
            stroke-width="2" 
            opacity="0.6"/>
  </g>
  
  <!-- Título de la carta -->
  <text x="100" y="280" 
        text-anchor="middle" 
        font-family="serif" 
        font-size="16" 
        font-weight="bold"
        fill="${primaryColor}">
    ${card.title}
  </text>
  
  <!-- Subtítulo del mazo -->
  <text x="100" y="300" 
        text-anchor="middle" 
        font-family="serif" 
        font-size="12" 
        fill="${primaryColor}" 
        opacity="0.8">
    ${theme.style}
  </text>
  
  <!-- Información del mazo -->
  <text x="100" y="315" 
        text-anchor="middle" 
        font-family="serif" 
        font-size="10" 
        fill="${primaryColor}" 
        opacity="0.6">
    ${theme.era}
  </text>
  
  <!-- Marca de placeholder -->
  <text x="100" y="330" 
        text-anchor="middle" 
        font-family="sans-serif" 
        font-size="8" 
        fill="${primaryColor}" 
        opacity="0.4">
    PLACEHOLDER
  </text>
  
  <!-- Decoraciones en las esquinas -->
  <g opacity="0.3">
    <!-- Esquina superior izquierda -->
    <path d="M20,25 Q25,20 30,25 Q25,30 20,25" fill="${secondaryColor}"/>
    <!-- Esquina superior derecha -->
    <path d="M170,25 Q175,20 180,25 Q175,30 170,25" fill="${secondaryColor}"/>
    <!-- Esquina inferior izquierda -->
    <path d="M20,325 Q25,320 30,325 Q25,330 20,325" fill="${secondaryColor}"/>
    <!-- Esquina inferior derecha -->
    <path d="M170,325 Q175,320 180,325 Q175,330 170,325" fill="${secondaryColor}"/>
  </g>
  
</svg>`;
}

/**
 * Convierte número a romano
 */
function toRoman(num) {
  const romanNumerals = [
    { value: 21, symbol: 'XXI' },
    { value: 20, symbol: 'XX' },
    { value: 19, symbol: 'XIX' },
    { value: 18, symbol: 'XVIII' },
    { value: 17, symbol: 'XVII' },
    { value: 16, symbol: 'XVI' },
    { value: 15, symbol: 'XV' },
    { value: 14, symbol: 'XIV' },
    { value: 13, symbol: 'XIII' },
    { value: 12, symbol: 'XII' },
    { value: 11, symbol: 'XI' },
    { value: 10, symbol: 'X' },
    { value: 9, symbol: 'IX' },
    { value: 8, symbol: 'VIII' },
    { value: 7, symbol: 'VII' },
    { value: 6, symbol: 'VI' },
    { value: 5, symbol: 'V' },
    { value: 4, symbol: 'IV' },
    { value: 3, symbol: 'III' },
    { value: 2, symbol: 'II' },
    { value: 1, symbol: 'I' },
    { value: 0, symbol: '0' }
  ];
  
  for (const numeral of romanNumerals) {
    if (num === numeral.value) {
      return numeral.symbol;
    }
  }
  return num.toString();
}

/**
 * Genera placeholders para un tipo de baraja específico
 */
async function generateDeckPlaceholders(deckType) {
  console.log(`🎨 Generando placeholders para: ${deckType}`);
  
  const deckDir = path.join(TAROT_DIR, deckType, 'arcanos-mayores');
  let created = 0;
  
  for (const card of MAJOR_ARCANA) {
    try {
      const fileName = `${card.name}.svg`;
      const filePath = path.join(deckDir, fileName);
      
      // Verificar si ya existe (evitar sobrescribir imágenes reales)
      try {
        await fs.access(filePath);
        console.log(`⏭️  Ya existe: ${fileName}`);
        continue;
      } catch {
        // No existe, crear placeholder
      }
      
      const svgContent = createTarotCardPlaceholder(card, deckType);
      await fs.writeFile(filePath, svgContent);
      created++;
      
      console.log(`✅ Placeholder creado: ${fileName}`);
      
    } catch (error) {
      console.error(`❌ Error creando placeholder ${card.name}:`, error.message);
    }
  }
  
  return created;
}

/**
 * Genera un dorso de carta genérico
 */
function createCardBack(deckType) {
  const theme = DECK_THEMES[deckType];
  const primaryColor = theme.colors[0];
  const secondaryColor = theme.colors[1];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="350" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="back-bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${secondaryColor};stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:${primaryColor};stop-opacity:1" />
    </radialGradient>
    
    <pattern id="back-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
      <rect width="30" height="30" fill="none"/>
      <circle cx="15" cy="15" r="3" fill="${secondaryColor}" opacity="0.4"/>
      <rect x="12" y="12" width="6" height="6" fill="none" stroke="${secondaryColor}" stroke-width="0.5" opacity="0.3"/>
    </pattern>
  </defs>
  
  <rect x="5" y="5" width="190" height="340" rx="15" ry="15" 
        fill="url(#back-bg)" 
        stroke="${primaryColor}" 
        stroke-width="3"/>
  
  <rect x="15" y="15" width="170" height="320" rx="10" ry="10" 
        fill="url(#back-pattern)"/>
  
  <text x="100" y="180" 
        text-anchor="middle" 
        font-family="serif" 
        font-size="20" 
        font-weight="bold"
        fill="${secondaryColor}">
    TAROT
  </text>
  
  <text x="100" y="205" 
        text-anchor="middle" 
        font-family="serif" 
        font-size="14" 
        fill="${secondaryColor}" 
        opacity="0.8">
    NEBULOSA MÁGICA
  </text>
  
</svg>`;
}

/**
 * Función principal
 */
async function main() {
  console.log('🎨 NEBULOSA MÁGICA - Generador de Placeholders de Tarot');
  console.log('='.repeat(65));
  
  let totalCreated = 0;
  
  try {
    // Generar placeholders para cada tipo de baraja
    for (const deckType of Object.keys(DECK_THEMES)) {
      const created = await generateDeckPlaceholders(deckType);
      totalCreated += created;
      
      // Crear dorso de carta
      const backContent = createCardBack(deckType);
      const backPath = path.join(TAROT_DIR, deckType, 'card-back.svg');
      
      try {
        await fs.access(backPath);
      } catch {
        await fs.writeFile(backPath, backContent);
        console.log(`✅ Dorso creado para: ${deckType}`);
      }
    }
    
    // Resumen
    console.log('\n' + '='.repeat(65));
    console.log('📋 RESUMEN DE PLACEHOLDERS');
    console.log('='.repeat(65));
    console.log(`✅ Placeholders creados: ${totalCreated}`);
    console.log('✅ Dorsos de cartas: 5 tipos');
    console.log('✅ Estilos únicos por baraja');
    console.log('✅ Números romanos en Arcanos Mayores');
    console.log('\n🎯 Los placeholders serán reemplazados cuando añadas las imágenes reales');
    
  } catch (error) {
    console.error('\n💥 Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createTarotCardPlaceholder, DECK_THEMES, MAJOR_ARCANA };