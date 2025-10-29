// Test básico del sistema de sueños
import { interpretDreamAI } from '../src/services/llmService.js';

async function testDreamInterpretation() {
  console.log('🌙 TESTING: Sistema de Interpretación de Sueños');
  console.log('='.repeat(50));

  const dreamData = {
    text: 'Soñé que volaba sobre un océano azul infinito, sintiendo una libertad total mientras las olas brillaban como diamantes bajo la luna llena.',
    feelings: ['alegria', 'calma'],
    date: new Date().toISOString(),
    userId: 'test-user-123'
  };

  try {
    console.log('🔮 Generando interpretación IA para el sueño...');
    console.log('Sueño:', dreamData.text);
    console.log('Sentimientos:', dreamData.feelings.join(', '));
    
    const interpretation = await interpretDreamAI(dreamData);
    
    console.log('\n✨ INTERPRETACIÓN GENERADA:');
    console.log('-'.repeat(40));
    console.log(interpretation);
    console.log('-'.repeat(40));
    
    if (interpretation && interpretation.length > 50) {
      console.log('✅ Test exitoso - Interpretación generada correctamente');
    } else {
      console.log('⚠️ Test parcial - Interpretación muy corta o fallback');
    }
    
  } catch (error) {
    console.error('❌ Error en el test:', error.message);
  }
}

// Ejecutar test si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testDreamInterpretation();
}

export { testDreamInterpretation };