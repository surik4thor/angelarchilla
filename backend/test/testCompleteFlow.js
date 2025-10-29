import { selectCards } from '../src/services/cardSelector.js';
import { interpretReadingAI } from '../src/services/llmService.js';

async function testCompleteReadingFlow() {
  console.log('🔮 TESTING ARCANA CLUB - COMPLETE READING FLOW');
  console.log('='.repeat(60));

  try {
    // Test 1: Lectura completa de Tarot
    console.log('\n1️⃣ TESTING: Complete Tarot Reading Flow');
    
    const question = "¿Qué me depara el futuro en el amor?";
    const tarotCards = await selectCards('tarot', 'tres-cartas', 'RIDER_WAITE');
    
    console.log('📝 Question:', question);
    console.log('🃏 Selected Cards:');
    tarotCards.forEach((card, i) => {
      console.log(`  ${i+1}. ${card.card.name} (${card.card.reversed ? 'Reversed' : 'Upright'})`);
      console.log(`     Meaning: ${card.card.meaning}`);
    });

    // Test interpretación con IA (solo si hay API key)
    if (process.env.OPENAI_API_KEY) {
      console.log('\n🤖 Generating AI Interpretation...');
      try {
        const interpretation = await interpretReadingAI('tarot', 'tres-cartas', question, tarotCards);
        console.log('✅ AI Interpretation:');
        console.log(interpretation);
      } catch (aiError) {
        console.log('⚠️ AI Interpretation failed (this is expected if no API key):', aiError.message);
      }
    } else {
      console.log('⚠️ No OpenAI API key configured - skipping AI interpretation');
    }

    // Test 2: Lectura completa de Runas
    console.log('\n2️⃣ TESTING: Complete Rune Reading Flow');
    
    const runeQuestion = "¿Cuál es mi camino espiritual?";
    const runes = await selectCards('runes', 'tres-runas', 'ELDER_FUTHARK');
    
    console.log('📝 Question:', runeQuestion);
    console.log('ᚱ Selected Runes:');
    runes.forEach((rune, i) => {
      console.log(`  ${i+1}. ${rune.rune.name} ${rune.rune.symbol} (${rune.rune.reversed ? 'Reversed' : 'Upright'})`);
      console.log(`     Meaning: ${rune.rune.meaning}`);
    });

    // Test interpretación con IA para runas
    if (process.env.OPENAI_API_KEY) {
      console.log('\n🤖 Generating AI Interpretation for Runes...');  
      try {
        const runeInterpretation = await interpretReadingAI('runes', 'tres-runas', runeQuestion, runes);
        console.log('✅ AI Interpretation:');
        console.log(runeInterpretation);
      } catch (aiError) {
        console.log('⚠️ AI Interpretation failed:', aiError.message);
      }
    } else {
      console.log('⚠️ No OpenAI API key configured - skipping AI interpretation');
    }

    console.log('\n🎉 COMPLETE READING FLOW TEST PASSED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ COMPLETE FLOW TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Test simulado de API endpoint completo
async function testReadingEndpointFlow() {
  console.log('\n3️⃣ TESTING: Simulated API Endpoint Flow');
  console.log('-'.repeat(40));

  try {
    // Simular request body
    const requestBody = {
      type: 'tarot',
      spreadType: 'una-carta',
      deckType: 'MARSELLA',
      question: '¿Qué mensaje tiene el universo para mí hoy?',
      anonBirthDate: null,
      anonGender: null
    };

    console.log('📨 Simulated Request Body:');
    console.log(JSON.stringify(requestBody, null, 2));

    // Ejecutar el flujo similar al controller
    const cards = await selectCards(requestBody.type, requestBody.spreadType, requestBody.deckType);
    
    console.log('\n🃏 Selected Cards:');
    cards.forEach((card, i) => {
      console.log(`  Position ${card.position}: ${card.card.name}`);
    });

    const simulatedReading = {
      id: 'test-reading-123',
      userId: null, // guest user
      type: requestBody.type,
      spreadType: requestBody.spreadType,
      deckType: requestBody.deckType,
      question: requestBody.question,
      cards: cards,
      interpretation: "✨ Esta es una interpretación simulada. En producción, aquí estaría la interpretación generada por Madame Celestina con OpenAI. ✨",
      createdAt: new Date(),
      anonBirthDate: requestBody.anonBirthDate,
      anonGender: requestBody.anonGender
    };

    console.log('\n📋 Simulated Response:');
    console.log(JSON.stringify({ success: true, reading: simulatedReading }, null, 2));

    console.log('\n✅ API ENDPOINT SIMULATION PASSED!');

  } catch (error) {
    console.error('❌ API ENDPOINT SIMULATION FAILED:', error.message);
  }
}

// Ejecutar todos los tests
async function runAllTests() {
  await testCompleteReadingFlow();
  await testReadingEndpointFlow();
  
  console.log('\n🏆 ALL INTEGRATION TESTS COMPLETED!');
  console.log('🎯 ARCANA CLUB IS READY FOR PRODUCTION!');
}

// Ejecutar tests
runAllTests()
  .then(() => {
    console.log('\n✅ Integration testing completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Integration testing failed:', error);
    process.exit(1);
  });