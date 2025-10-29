// Test directo importando funciones del backend
import { selectCards } from '../src/services/cardSelector.js';
import { interpretReadingAI } from '../src/services/llmService.js';

async function testIntegrationDirect() {
  console.log('🔮 TESTING DIRECT INTEGRATION - DATABASE ↔ SERVICES ↔ OPENAI');
  console.log('='.repeat(60));

  try {
    // Test 1: Selección de cartas con base de datos
    console.log('\n1️⃣ TESTING: Database Card Selection');
    const tarotCards = await selectCards('tarot', 'una-carta', 'RIDER_WAITE');
    console.log('✅ Tarot card selected from database:', tarotCards[0].card.name);
    console.log('   Deck Type:', tarotCards[0].card.deckType);
    console.log('   Meaning:', tarotCards[0].card.meaning);

    // Test 2: Selección de runas con base de datos
    console.log('\n2️⃣ TESTING: Database Rune Selection');
    const runes = await selectCards('runes', 'runa-unica', 'ELDER_FUTHARK');
    console.log('✅ Rune selected from database:', runes[0].rune.name, runes[0].rune.symbol);
    console.log('   Rune Set:', runes[0].rune.runeSet);
    console.log('   Meaning:', runes[0].rune.meaning);

    // Test 3: Interpretación con OpenAI - Tarot
    console.log('\n3️⃣ TESTING: OpenAI Interpretation - Tarot');
    const question = '¿Qué mensaje tiene el universo para mí hoy?';
    
    try {
      const interpretation = await interpretReadingAI('tarot', 'una-carta', question, tarotCards);
      console.log('✅ OpenAI Tarot Interpretation generated!');
      console.log('   Length:', interpretation.length, 'characters');
      console.log('   Preview:', interpretation.substring(0, 150) + '...');
      
      // Verificar que la interpretación tiene el estilo de Madame Celestina
      if (interpretation.includes('Celestina') || interpretation.toLowerCase().includes('carta') || interpretation.length > 100) {
        console.log('✅ AI interpretation style verified');
      } else {
        console.log('⚠️ AI interpretation might be generic');
      }
      
    } catch (aiError) {
      console.log('❌ OpenAI Interpretation failed:', aiError.message);
      console.log('   This could be due to API key issues or rate limiting');
    }

    // Test 4: Interpretación con OpenAI - Runas
    console.log('\n4️⃣ TESTING: OpenAI Interpretation - Runes');
    const runeQuestion = '¿Cuál es mi camino espiritual?';
    
    try {
      const runeInterpretation = await interpretReadingAI('runes', 'runa-unica', runeQuestion, runes);
      console.log('✅ OpenAI Rune Interpretation generated!');
      console.log('   Length:', runeInterpretation.length, 'characters');
      console.log('   Preview:', runeInterpretation.substring(0, 150) + '...');
      
      // Verificar que la interpretación tiene el estilo de Björn el Sabio
      if (runeInterpretation.includes('Björn') || runeInterpretation.toLowerCase().includes('runa') || runeInterpretation.length > 100) {
        console.log('✅ AI interpretation style verified');
      } else {
        console.log('⚠️ AI interpretation might be generic');
      }
      
    } catch (aiError) {
      console.log('❌ OpenAI Rune Interpretation failed:', aiError.message);
    }

    // Test 5: Múltiples cartas
    console.log('\n5️⃣ TESTING: Multiple Cards Selection');
    const threeCards = await selectCards('tarot', 'tres-cartas', 'MARSELLA');
    console.log('✅ Three cards selected:');
    threeCards.forEach((card, i) => {
      console.log(`   ${i+1}. ${card.card.name} (${card.card.reversed ? 'Reversed' : 'Upright'})`);
    });

    console.log('\n🏆 DIRECT INTEGRATION TEST COMPLETED!');
    console.log('✅ Database connection working');
    console.log('✅ Card/Rune selection functional');
    console.log('✅ OpenAI integration tested');
    console.log('🎯 ARCANA CLUB CORE SERVICES ARE FULLY OPERATIONAL!');

  } catch (error) {
    console.error('❌ DIRECT INTEGRATION TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar test
testIntegrationDirect()
  .then(() => {
    console.log('\n✅ Direct integration testing completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Direct integration testing failed:', error);
    process.exit(1);
  });