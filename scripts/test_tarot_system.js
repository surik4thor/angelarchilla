#!/usr/bin/env node

/**
 * Script de prueba para el sistema completo de tarot
 * Verifica backend, frontend y la integración de OpenAI
 */

const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const TEST_RESULTS_FILE = '/tmp/tarot_test_results.json';

// Datos de prueba
const testCases = [
  {
    name: 'Tarot Tradicional - Una Carta',
    payload: {
      deckType: 'rider-waite',
      spreadType: 'una-carta',
      question: 'Test question for traditional tarot',
      userId: 'test-user-1'
    }
  },
  {
    name: 'Tarot de los Ángeles - Tres Cartas',
    payload: {
      deckType: 'tarot-angeles',
      spreadType: 'tres-cartas',
      question: 'Test question for angel tarot',
      userId: 'test-user-2'
    }
  },
  {
    name: 'Tarot Egipcio - Cruz Celta',
    payload: {
      deckType: 'tarot-egipcio',
      spreadType: 'cruz-celta',
      question: 'Test question for egyptian tarot',
      userId: 'test-user-3'
    }
  }
];

async function testEndpoint(testCase) {
  console.log(`\n🔮 Testing: ${testCase.name}`);
  console.log(`   Deck: ${testCase.payload.deckType}`);
  console.log(`   Spread: ${testCase.payload.spreadType}`);
  
  try {
    const response = await axios.post(`${BASE_URL}/api/tarot/reading`, testCase.payload, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = response.data;
    
    // Validaciones básicas
    if (!result) {
      throw new Error('No result received');
    }
    
    if (testCase.payload.deckType === 'tarot-angeles') {
      // Validaciones específicas para tarot angelical
      if (!result.angel || !result.mensaje || !result.bendicion) {
        throw new Error('Missing angel reading structure');
      }
      console.log(`   ✅ Angel reading: ${result.angel}`);
      console.log(`   ✅ Message received: ${result.mensaje.substring(0, 100)}...`);
    } else if (testCase.payload.deckType === 'tarot-egipcio') {
      // Validaciones específicas para tarot egipcio
      if (!result.planoSuperior || !result.planoCentral || !result.planoInferior) {
        throw new Error('Missing egyptian three-plane structure');
      }
      console.log(`   ✅ Egyptian reading with three planes`);
      console.log(`   ✅ Upper plane: ${result.planoSuperior.interpretacion.substring(0, 80)}...`);
    } else {
      // Validaciones para tarot tradicional
      if (!result.cartas || !result.interpretacion) {
        throw new Error('Missing traditional reading structure');
      }
      console.log(`   ✅ Traditional reading with ${result.cartas.length} cards`);
      console.log(`   ✅ Interpretation: ${result.interpretacion.substring(0, 100)}...`);
    }
    
    return {
      success: true,
      testCase: testCase.name,
      responseTime: response.headers['x-response-time'] || 'unknown',
      dataSize: JSON.stringify(result).length,
      structure: Object.keys(result)
    };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      success: false,
      testCase: testCase.name,
      error: error.message,
      status: error.response?.status || 'network_error'
    };
  }
}

async function testTarotSystem() {
  console.log('🌟 NEBULOSA MÁGICA - Sistema de Tarot - Pruebas de Integración');
  console.log('=' .repeat(70));
  
  // Verificar que el servidor esté corriendo
  try {
    await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Backend server is running');
  } catch (error) {
    console.log('❌ Backend server is not accessible');
    console.log('   Please start the server: cd backend && npm start');
    process.exit(1);
  }
  
  const results = [];
  
  // Ejecutar pruebas
  for (const testCase of testCases) {
    const result = await testEndpoint(testCase);
    results.push(result);
    
    // Pausa entre requests para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Resumen de resultados
  console.log('\n' + '=' .repeat(70));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('=' .repeat(70));
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`✅ Éxitos: ${successCount}/${results.length}`);
  console.log(`❌ Fallos: ${failCount}/${results.length}`);
  
  if (failCount > 0) {
    console.log('\nErrores encontrados:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  • ${r.testCase}: ${r.error}`);
    });
  }
  
  // Guardar resultados detallados
  fs.writeFileSync(TEST_RESULTS_FILE, JSON.stringify(results, null, 2));
  console.log(`\n📝 Resultados detallados guardados en: ${TEST_RESULTS_FILE}`);
  
  if (successCount === results.length) {
    console.log('\n🎉 ¡Todas las pruebas pasaron! El sistema está funcionando correctamente.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisa la configuración del backend.');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  testTarotSystem().catch(error => {
    console.error('💥 Error fatal en las pruebas:', error.message);
    process.exit(1);
  });
}

module.exports = { testTarotSystem };