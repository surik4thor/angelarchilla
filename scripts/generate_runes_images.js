#!/usr/bin/env node

/**
 * Generador de imágenes de runas con símbolos sobre fondos de piedra/mármol
 * Crea imágenes SVG estilizadas para cada runa nórdica
 */

const fs = require('fs').promises;
const path = require('path');

// Directorio base para las runas
const RUNES_DIR = '/var/www/nebulosamagica/frontend/public/images/runes';

// Definición completa del Futhark Elder (24 runas)
const ELDER_FUTHARK = [
  { name: 'fehu', symbol: 'ᚠ', meaning: 'Ganado, Riqueza', unicode: '\u16A0' },
  { name: 'uruz', symbol: 'ᚢ', meaning: 'Uro, Fuerza', unicode: '\u16A2' },
  { name: 'thurisaz', symbol: 'ᚦ', meaning: 'Gigante, Espina', unicode: '\u16A6' },
  { name: 'ansuz', symbol: 'ᚨ', meaning: 'Dios, Mensaje', unicode: '\u16A8' },
  { name: 'raidho', symbol: 'ᚱ', meaning: 'Viaje, Camino', unicode: '\u16B1' },
  { name: 'kenaz', symbol: 'ᚲ', meaning: 'Antorcha, Conocimiento', unicode: '\u16B2' },
  { name: 'gebo', symbol: 'ᚷ', meaning: 'Regalo, Generosidad', unicode: '\u16B7' },
  { name: 'wunjo', symbol: 'ᚹ', meaning: 'Alegría, Perfección', unicode: '\u16B9' },
  { name: 'hagalaz', symbol: 'ᚺ', meaning: 'Granizo, Crisis', unicode: '\u16BA' },
  { name: 'nauthiz', symbol: 'ᚾ', meaning: 'Necesidad, Pena', unicode: '\u16BE' },
  { name: 'isa', symbol: 'ᛁ', meaning: 'Hielo, Paralización', unicode: '\u16C1' },
  { name: 'jera', symbol: 'ᛃ', meaning: 'Año, Cosecha', unicode: '\u16C3' },
  { name: 'eihwaz', symbol: 'ᛇ', meaning: 'Tejo, Protección', unicode: '\u16C7' },
  { name: 'perthro', symbol: 'ᛈ', meaning: 'Destino, Secreto', unicode: '\u16C8' },
  { name: 'algiz', symbol: 'ᛉ', meaning: 'Alce, Protección', unicode: '\u16C9' },
  { name: 'sowilo', symbol: 'ᛋ', meaning: 'Sol, Victoria', unicode: '\u16CB' },
  { name: 'tiwaz', symbol: 'ᛏ', meaning: 'Tyr, Victoria', unicode: '\u16CF' },
  { name: 'berkano', symbol: 'ᛒ', meaning: 'Abedul, Crecimiento', unicode: '\u16D2' },
  { name: 'ehwaz', symbol: 'ᛖ', meaning: 'Caballo, Movimiento', unicode: '\u16D6' },
  { name: 'mannaz', symbol: 'ᛗ', meaning: 'Hombre, Humanidad', unicode: '\u16D7' },
  { name: 'laguz', symbol: 'ᛚ', meaning: 'Agua, Intuición', unicode: '\u16DA' },
  { name: 'ingwaz', symbol: 'ᛜ', meaning: 'Ing, Fertilidad', unicode: '\u16DC' },
  { name: 'othala', symbol: 'ᛟ', meaning: 'Herencia, Hogar', unicode: '\u16DF' },
  { name: 'dagaz', symbol: 'ᛞ', meaning: 'Día, Despertar', unicode: '\u16DE' }
];

// Texturas de fondo para piedras/mármol
const STONE_TEXTURES = {
  granite: {
    baseColor: '#4a4a4a',
    patterns: [
      { color: '#5a5a5a', opacity: 0.6 },
      { color: '#3a3a3a', opacity: 0.4 },
      { color: '#6a6a6a', opacity: 0.3 }
    ]
  },
  marble: {
    baseColor: '#f8f8f8',
    patterns: [
      { color: '#e8e8e8', opacity: 0.7 },
      { color: '#d8d8d8', opacity: 0.5 },
      { color: '#c8c8c8', opacity: 0.3 }
    ]
  },
  slate: {
    baseColor: '#2f4f4f',
    patterns: [
      { color: '#3f5f5f', opacity: 0.6 },
      { color: '#1f3f3f', opacity: 0.4 },
      { color: '#4f6f6f', opacity: 0.3 }
    ]
  },
  sandstone: {
    baseColor: '#daa520',
    patterns: [
      { color: '#cd853f', opacity: 0.7 },
      { color: '#b8860b', opacity: 0.5 },
      { color: '#f4a460', opacity: 0.4 }
    ]
  }
};

/**
 * Genera un patrón de textura de piedra SVG
 */
function generateStoneTexture(textureType, id) {
  const texture = STONE_TEXTURES[textureType];
  
  return `
    <defs>
      <pattern id="${id}" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
        <rect width="50" height="50" fill="${texture.baseColor}"/>
        ${texture.patterns.map((pattern, index) => `
          <circle cx="${15 + index * 12}" cy="${15 + index * 8}" r="${3 + index * 2}" 
                  fill="${pattern.color}" opacity="${pattern.opacity}"/>
          <ellipse cx="${30 + index * 8}" cy="${35 + index * 5}" rx="${2 + index}" ry="${1 + index}" 
                   fill="${pattern.color}" opacity="${pattern.opacity * 0.8}"/>
        `).join('')}
        <rect width="50" height="50" fill="none" stroke="${texture.baseColor}" stroke-width="0.5" opacity="0.3"/>
      </pattern>
      
      <!-- Efectos de profundidad -->
      <filter id="shadow-${id}">
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
      
      <!-- Borde cincelado -->
      <filter id="engrave-${id}">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur"/>
        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="matrix"/>
        <feComposite in="SourceGraphic" in2="matrix" operator="over"/>
      </filter>
    </defs>
  `;
}

/**
 * Crea una imagen SVG de runa con fondo de piedra
 */
function createRuneImage(rune, textureType = 'granite') {
  const id = `texture-${rune.name}`;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="300" xmlns="http://www.w3.org/2000/svg">
  ${generateStoneTexture(textureType, id)}
  
  <!-- Fondo de piedra con forma de runa -->
  <rect x="10" y="10" width="180" height="280" rx="20" ry="20" 
        fill="url(#${id})" 
        stroke="#2a2a2a" 
        stroke-width="3"
        filter="url(#shadow-${id})"/>
  
  <!-- Borde interior cincelado -->
  <rect x="15" y="15" width="170" height="270" rx="15" ry="15" 
        fill="none" 
        stroke="#1a1a1a" 
        stroke-width="1" 
        opacity="0.6"/>
  
  <!-- Símbolo de la runa -->
  <text x="100" y="180" 
        text-anchor="middle" 
        font-family="serif" 
        font-size="80" 
        font-weight="bold"
        fill="#d4af37" 
        stroke="#8b7355" 
        stroke-width="1"
        filter="url(#engrave-${id})">
    ${rune.symbol}
  </text>
  
  <!-- Nombre de la runa -->
  <text x="100" y="250" 
        text-anchor="middle" 
        font-family="serif" 
        font-size="16" 
        font-weight="bold"
        fill="#e8e8e8" 
        opacity="0.9">
    ${rune.name.toUpperCase()}
  </text>
  
  <!-- Significado -->
  <text x="100" y="270" 
        text-anchor="middle" 
        font-family="serif" 
        font-size="12" 
        fill="#c8c8c8" 
        opacity="0.7">
    ${rune.meaning}
  </text>
  
  <!-- Efectos de desgaste -->
  <circle cx="50" cy="80" r="2" fill="#3a3a3a" opacity="0.3"/>
  <circle cx="150" cy="120" r="1.5" fill="#3a3a3a" opacity="0.2"/>
  <circle cx="70" cy="220" r="1" fill="#3a3a3a" opacity="0.4"/>
  
</svg>`;
}

/**
 * Crea la estructura de directorios para runas
 */
async function createRunesDirectoryStructure() {
  console.log('🏗️  Creando estructura de directorios para runas...');
  
  try {
    // Crear directorio base
    await fs.mkdir(RUNES_DIR, { recursive: true });
    console.log(`✅ Directorio base creado: ${RUNES_DIR}`);
    
    // Crear subdirectorios
    const subdirs = ['elder-futhark', 'younger-futhark', 'anglo-saxon', 'fallback'];
    
    for (const subdir of subdirs) {
      await fs.mkdir(path.join(RUNES_DIR, subdir), { recursive: true });
      console.log(`✅ Subdirectorio creado: ${subdir}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error creando estructura:', error.message);
    return false;
  }
}

/**
 * Genera todas las imágenes de runas del Elder Futhark
 */
async function generateElderFutharkImages() {
  console.log('🗿 Generando imágenes del Elder Futhark...');
  
  const textureTypes = ['granite', 'marble', 'slate', 'sandstone'];
  let created = 0;
  
  for (const [index, rune] of ELDER_FUTHARK.entries()) {
    try {
      // Alternar texturas para variedad
      const textureType = textureTypes[index % textureTypes.length];
      
      const svgContent = createRuneImage(rune, textureType);
      const fileName = `${rune.name}.svg`;
      const filePath = path.join(RUNES_DIR, 'elder-futhark', fileName);
      
      // Verificar si ya existe
      try {
        await fs.access(filePath);
        console.log(`⏭️  Ya existe: ${fileName}`);
        continue;
      } catch {
        // No existe, proceder con creación
      }
      
      await fs.writeFile(filePath, svgContent);
      created++;
      console.log(`✅ Creada: ${fileName} (${textureType})`);
      
    } catch (error) {
      console.error(`❌ Error creando ${rune.name}:`, error.message);
    }
  }
  
  return created;
}

/**
 * Genera configuración de runas
 */
async function generateRunesConfig() {
  console.log('⚙️  Generando configuración de runas...');
  
  const config = {
    basePath: '/images/runes',
    sets: {
      'elder-futhark': {
        name: 'Elder Futhark',
        path: 'elder-futhark',
        format: 'svg',
        count: ELDER_FUTHARK.length,
        runes: ELDER_FUTHARK.map(rune => ({
          name: rune.name,
          symbol: rune.symbol,
          meaning: rune.meaning,
          unicode: rune.unicode
        }))
      }
    },
    textures: Object.keys(STONE_TEXTURES),
    fallback: {
      path: 'fallback',
      defaultRune: 'blank-rune.svg'
    }
  };
  
  const configPath = path.join(RUNES_DIR, 'config.json');
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  
  console.log('✅ Configuración de runas generada:', configPath);
  return config;
}

/**
 * Crea una runa en blanco para fallback
 */
async function createBlankRune() {
  const blankRuneContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="blank-texture" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill="#6a6a6a"/>
      <circle cx="10" cy="10" r="2" fill="#5a5a5a" opacity="0.5"/>
    </pattern>
  </defs>
  
  <rect x="10" y="10" width="180" height="280" rx="20" ry="20" 
        fill="url(#blank-texture)" 
        stroke="#2a2a2a" 
        stroke-width="3"/>
  
  <text x="100" y="160" 
        text-anchor="middle" 
        font-family="serif" 
        font-size="24" 
        fill="#d4af37" 
        opacity="0.7">
    RUNA
  </text>
  
  <text x="100" y="190" 
        text-anchor="middle" 
        font-family="serif" 
        font-size="16" 
        fill="#c8c8c8" 
        opacity="0.5">
    EN BLANCO
  </text>
</svg>`;

  const blankPath = path.join(RUNES_DIR, 'fallback', 'blank-rune.svg');
  await fs.writeFile(blankPath, blankRuneContent);
  console.log('✅ Runa en blanco creada para fallback');
}

/**
 * Función principal
 */
async function main() {
  console.log('🗿 NEBULOSA MÁGICA - Generador de Imágenes de Runas');
  console.log('='.repeat(60));
  
  try {
    // 1. Crear estructura de directorios
    const structureCreated = await createRunesDirectoryStructure();
    if (!structureCreated) {
      throw new Error('No se pudo crear la estructura de directorios');
    }
    
    // 2. Generar imágenes del Elder Futhark
    const runesCreated = await generateElderFutharkImages();
    console.log(`📊 Runas del Elder Futhark creadas: ${runesCreated}`);
    
    // 3. Crear runa en blanco
    await createBlankRune();
    
    // 4. Generar configuración
    const config = await generateRunesConfig();
    
    // 5. Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMEN DE GENERACIÓN DE RUNAS');
    console.log('='.repeat(60));
    console.log('✅ Estructura de directorios: Completada');
    console.log(`✅ Runas Elder Futhark: ${runesCreated} creadas`);
    console.log('✅ Texturas: granite, marble, slate, sandstone');
    console.log('✅ Runa fallback: Creada');
    console.log('✅ Configuración generada');
    console.log('\n📁 Runas creadas en:', RUNES_DIR);
    console.log('🎯 Las runas tienen símbolos reales sobre fondos de piedra/mármol estilizados');
    
  } catch (error) {
    console.error('\n💥 Error en la generación:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Error fatal:', error.message);
    process.exit(1);
  });
}

module.exports = { main, createRuneImage, ELDER_FUTHARK, STONE_TEXTURES };