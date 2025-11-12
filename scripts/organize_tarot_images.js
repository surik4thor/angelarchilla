#!/usr/bin/env node

/**
 * Script para organizar y descargar imágenes de cartas de tarot
 * Crea estructura de directorios y descarga imágenes desde fuentes web
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const { pipeline } = require('stream/promises');

// Configuración de estructura de directorios
const BASE_DIR = '/var/www/nebulosamagica/frontend/public/images/tarot';
const IMAGE_SOURCES = {
  'rider-waite': {
    baseUrl: 'https://upload.wikimedia.org/wikipedia/commons',
    cards: {
      // Arcanos Mayores
      'el-loco': '/7/70/RWS_Tarot_00_Fool.jpg',
      'el-mago': '/d/de/RWS_Tarot_01_Magician.jpg',
      'la-suma-sacerdotisa': '/8/88/RWS_Tarot_02_High_Priestess.jpg',
      'la-emperatriz': '/d/d2/RWS_Tarot_03_Empress.jpg',
      'el-emperador': '/c/c3/RWS_Tarot_04_Emperor.jpg',
      'el-sumo-sacerdote': '/8/8d/RWS_Tarot_05_Hierophant.jpg',
      'los-enamorados': '/3/3a/RWS_Tarot_06_Lovers.jpg',
      'el-carro': '/9/9b/RWS_Tarot_07_Chariot.jpg',
      'la-fuerza': '/f/f5/RWS_Tarot_08_Strength.jpg',
      'el-ermitano': '/4/4d/RWS_Tarot_09_Hermit.jpg',
      'la-rueda-de-la-fortuna': '/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg',
      'la-justicia': '/e/e0/RWS_Tarot_11_Justice.jpg',
      'el-colgado': '/2/2b/RWS_Tarot_12_Hanged_Man.jpg',
      'la-muerte': '/d/d7/RWS_Tarot_13_Death.jpg',
      'la-templanza': '/f/f8/RWS_Tarot_14_Temperance.jpg',
      'el-diablo': '/5/55/RWS_Tarot_15_Devil.jpg',
      'la-torre': '/5/53/RWS_Tarot_16_Tower.jpg',
      'la-estrella': '/d/db/RWS_Tarot_17_Star.jpg',
      'la-luna': '/7/7f/RWS_Tarot_18_Moon.jpg',
      'el-sol': '/1/17/RWS_Tarot_19_Sun.jpg',
      'el-juicio': '/d/dd/RWS_Tarot_20_Judgement.jpg',
      'el-mundo': '/f/ff/RWS_Tarot_21_World.jpg'
    }
  },
  'marsella': {
    // Para Marsella podríamos usar imágenes del Tarot de Marsella histórico
    baseUrl: 'https://example.com/marsella', // Placeholder
    cards: {
      'le-bateleur': '/00_bateleur.jpg',
      'la-papesse': '/01_papesse.jpg',
      'limperatrice': '/02_imperatrice.jpg',
      // ... más cartas del Marsella
    }
  },
  'tarot-angeles': {
    // Para ángeles necesitaremos crear imágenes o buscar fuentes libres
    baseUrl: 'placeholder',
    cards: {}
  },
  'tarot-egipcio': {
    // Para egipcio también necesitaremos fuentes específicas
    baseUrl: 'placeholder',
    cards: {}
  }
};

/**
 * Crea la estructura de directorios para todas las barajas
 */
async function createDirectoryStructure() {
  console.log('🏗️  Creando estructura de directorios...');
  
  const decks = ['rider-waite', 'marsella', 'tarot-angeles', 'tarot-egipcio', 'tarot-gitano'];
  const categories = ['arcanos-mayores', 'arcanos-menores', 'oros', 'copas', 'espadas', 'bastos'];
  
  try {
    // Crear directorio base
    await fs.mkdir(BASE_DIR, { recursive: true });
    console.log(`✅ Directorio base creado: ${BASE_DIR}`);
    
    // Crear directorios para cada baraja
    for (const deck of decks) {
      const deckDir = path.join(BASE_DIR, deck);
      await fs.mkdir(deckDir, { recursive: true });
      
      // Crear subdirectorios para categorías
      for (const category of categories) {
        const categoryDir = path.join(deckDir, category);
        await fs.mkdir(categoryDir, { recursive: true });
      }
      
      console.log(`✅ Estructura creada para: ${deck}`);
    }
    
    // Crear directorio para imágenes de respaldo
    await fs.mkdir(path.join(BASE_DIR, 'fallback'), { recursive: true });
    console.log('✅ Directorio fallback creado');
    
    return true;
  } catch (error) {
    console.error('❌ Error creando estructura:', error.message);
    return false;
  }
}

/**
 * Descarga una imagen desde una URL
 */
async function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = require('fs').createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
      }
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Descarga las imágenes del Rider-Waite desde Wikipedia
 */
async function downloadRiderWaiteImages() {
  console.log('🎨 Descargando imágenes del Rider-Waite...');
  
  const source = IMAGE_SOURCES['rider-waite'];
  const deckDir = path.join(BASE_DIR, 'rider-waite', 'arcanos-mayores');
  let downloaded = 0;
  let failed = 0;
  
  for (const [cardName, cardPath] of Object.entries(source.cards)) {
    try {
      const url = source.baseUrl + cardPath;
      const fileName = `${cardName}.jpg`;
      const filePath = path.join(deckDir, fileName);
      
      // Verificar si ya existe
      try {
        await fs.access(filePath);
        console.log(`⏭️  Ya existe: ${fileName}`);
        continue;
      } catch {
        // No existe, proceder con descarga
      }
      
      console.log(`⬇️  Descargando: ${cardName}...`);
      await downloadImage(url, filePath);
      downloaded++;
      console.log(`✅ Descargado: ${fileName}`);
      
      // Pausa entre descargas para ser respetuosos
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Error descargando ${cardName}:`, error.message);
      failed++;
    }
  }
  
  return { downloaded, failed };
}

/**
 * Crea imágenes placeholder para barajas sin fuentes
 */
async function createPlaceholderImages() {
  console.log('🎭 Creando imágenes placeholder...');
  
  const decks = ['marsella', 'tarot-angeles', 'tarot-egipcio', 'tarot-gitano'];
  const sampleCards = [
    'el-loco', 'el-mago', 'la-suma-sacerdotisa', 'la-emperatriz', 'el-emperador'
  ];
  
  // SVG placeholder básico
  const createSVGPlaceholder = (deckName, cardName) => {
    return `<svg width="200" height="350" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="350" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
      <text x="100" y="175" text-anchor="middle" font-family="serif" font-size="14" fill="#6c757d">
        <tspan x="100" dy="0">${deckName.toUpperCase()}</tspan>
        <tspan x="100" dy="20">${cardName.replace(/-/g, ' ').toUpperCase()}</tspan>
        <tspan x="100" dy="30">Placeholder</tspan>
      </text>
    </svg>`;
  };
  
  let created = 0;
  
  for (const deck of decks) {
    const deckDir = path.join(BASE_DIR, deck, 'arcanos-mayores');
    
    for (const cardName of sampleCards) {
      try {
        const fileName = `${cardName}.svg`;
        const filePath = path.join(deckDir, fileName);
        
        // Verificar si ya existe
        try {
          await fs.access(filePath);
          continue;
        } catch {
          // No existe, crear placeholder
        }
        
        const svgContent = createSVGPlaceholder(deck, cardName);
        await fs.writeFile(filePath, svgContent);
        created++;
        
      } catch (error) {
        console.error(`❌ Error creando placeholder para ${deck}/${cardName}:`, error.message);
      }
    }
    
    console.log(`✅ Placeholders creados para: ${deck}`);
  }
  
  return created;
}

/**
 * Genera el archivo de configuración de imágenes
 */
async function generateImageConfig() {
  console.log('⚙️  Generando configuración de imágenes...');
  
  const config = {
    basePath: '/images/tarot',
    decks: {
      'rider-waite': {
        name: 'Rider-Waite',
        path: 'rider-waite',
        format: 'jpg',
        hasImages: true
      },
      'marsella': {
        name: 'Tarot de Marsella',
        path: 'marsella',
        format: 'svg',
        hasImages: false // placeholder
      },
      'tarot-angeles': {
        name: 'Tarot de los Ángeles',
        path: 'tarot-angeles',
        format: 'svg',
        hasImages: false // placeholder
      },
      'tarot-egipcio': {
        name: 'Tarot Egipcio',
        path: 'tarot-egipcio',
        format: 'svg',
        hasImages: false // placeholder
      },
      'tarot-gitano': {
        name: 'Tarot Gitano',
        path: 'tarot-gitano',
        format: 'svg',
        hasImages: false // placeholder
      }
    },
    fallback: {
      path: 'fallback',
      defaultCard: 'card-back.svg'
    }
  };
  
  const configPath = path.join(BASE_DIR, 'config.json');
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  
  console.log('✅ Configuración generada:', configPath);
  return config;
}

/**
 * Función principal
 */
async function main() {
  console.log('🌟 NEBULOSA MÁGICA - Organizador de Imágenes de Tarot');
  console.log('='.repeat(60));
  
  try {
    // 1. Crear estructura de directorios
    const structureCreated = await createDirectoryStructure();
    if (!structureCreated) {
      throw new Error('No se pudo crear la estructura de directorios');
    }
    
    // 2. Descargar imágenes del Rider-Waite
    const riderWaiteStats = await downloadRiderWaiteImages();
    console.log(`📊 Rider-Waite: ${riderWaiteStats.downloaded} descargadas, ${riderWaiteStats.failed} fallos`);
    
    // 3. Crear placeholders para otras barajas
    const placeholdersCreated = await createPlaceholderImages();
    console.log(`📊 Placeholders creados: ${placeholdersCreated}`);
    
    // 4. Generar configuración
    const config = await generateImageConfig();
    
    // 5. Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMEN DE ORGANIZACIÓN');
    console.log('='.repeat(60));
    console.log('✅ Estructura de directorios: Completada');
    console.log(`✅ Imágenes Rider-Waite: ${riderWaiteStats.downloaded} descargadas`);
    console.log(`✅ Placeholders creados: ${placeholdersCreated}`);
    console.log('✅ Configuración generada');
    console.log('\n📁 Estructura creada en:', BASE_DIR);
    console.log('🎯 Próximo paso: Añadir imágenes reales para Marsella, Ángeles, Egipcio y Gitano');
    
    if (riderWaiteStats.failed > 0) {
      console.log(`\n⚠️  ${riderWaiteStats.failed} imágenes fallaron al descargar`);
      console.log('💡 Puedes ejecutar el script nuevamente para reintentar');
    }
    
  } catch (error) {
    console.error('\n💥 Error en la organización:', error.message);
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

module.exports = { main, createDirectoryStructure, downloadRiderWaiteImages };