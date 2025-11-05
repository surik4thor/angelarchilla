#!/usr/bin/env node

/**
 * NEBULOSA MÁGICA - Test de Diferencias entre Barajas
 * Prueba que cada tipo de baraja tiene interpretaciones únicas y específicas
 */

const { generarLecturaRiderWaite } = require('../backend/src/services/openai-rider-waite.js');
const { generarLecturaMarsella } = require('../backend/src/services/openai-marsella.js');

console.log('🔮 NEBULOSA MÁGICA - Test de Diferencias entre Barajas');
console.log('=====================================================');

// Configuración de prueba
const cartasPrueba = [
  { nombre: 'El Loco', orientacion: 'derecha' },
  { nombre: 'La Muerte', orientacion: 'derecha' },
  { nombre: 'La Estrella', orientacion: 'inversa' }
];

const preguntaPrueba = "¿Qué debo saber sobre los cambios que se avecinan en mi vida?";
const tipoTirada = "tirada_libre";

async function probarDiferenciasBarajas() {
  try {
    console.log('🃏 Cartas de prueba:', cartasPrueba.map(c => `${c.nombre} (${c.orientacion})`).join(', '));
    console.log('❓ Pregunta:', preguntaPrueba);
    console.log('📐 Tipo de tirada:', tipoTirada);
    console.log('\n');

    // Rider-Waite
    console.log('🎨 INTERPRETACIÓN RIDER-WAITE (Visual/Psicológica)');
    console.log('='.repeat(60));
    try {
      const lecturaRW = await generarLecturaRiderWaite(cartasPrueba, preguntaPrueba, tipoTirada);
      console.log(lecturaRW);
    } catch (error) {
      console.log('❌ Error en Rider-Waite:', error.message);
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // Marsella  
    console.log('🏛️ INTERPRETACIÓN MARSELLA (Tradicional/Geométrica)');
    console.log('='.repeat(60));
    try {
      const lecturaMarsella = await generarLecturaMarsella(cartasPrueba, preguntaPrueba, tipoTirada);
      console.log(lecturaMarsella);
    } catch (error) {
      console.log('❌ Error en Marsella:', error.message);
    }

    console.log('\n' + '='.repeat(80) + '\n');

    console.log('✅ PRUEBA COMPLETADA - Compara las diferencias de enfoque:');
    console.log('   • Rider-Waite: Visual, psicológico, narrativo');
    console.log('   • Marsella: Geométrico, tradicional, numerológico');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar prueba
probarDiferenciasBarajas();