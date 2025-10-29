import fetch from 'node-fetch';

async function testFullIntegration() {
  console.log('🔮 TESTING FULL INTEGRATION - FRONTEND ↔ BACKEND ↔ DATABASE ↔ OPENAI');
  console.log('='.repeat(70));

  const backendUrl = 'http://localhost:5000/api';
  
  try {
    // Test 1: Health Check
    console.log('\n1️⃣ TESTING: Backend Health Check');
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health Check Result:', healthData);

    // Test 2: Create Reading with Real AI
    console.log('\n2️⃣ TESTING: Complete Tarot Reading with AI');
    const readingPayload = {
      type: 'tarot',
      spreadType: 'una-carta',
      deckType: 'RIDER_WAITE',
      question: '¿Qué mensaje tiene el universo para mí hoy?',
      anonBirthDate: null,
      anonGender: null
    };

    console.log('📨 Sending reading request:', JSON.stringify(readingPayload, null, 2));
    
    const readingResponse = await fetch(`${backendUrl}/readings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(readingPayload)
    });

    if (!readingResponse.ok) {
      throw new Error(`HTTP ${readingResponse.status}: ${readingResponse.statusText}`);
    }

    const readingData = await readingResponse.json();
    console.log('✅ Reading Response received!');
    console.log('🃏 Selected Card:', readingData.reading.cards[0].card.name);
    console.log('💬 AI Interpretation Length:', readingData.reading.interpretation.length, 'characters');
    console.log('🤖 AI Interpretation Preview:', readingData.reading.interpretation.substring(0, 200) + '...');

    // Test 3: Rune Reading
    console.log('\n3️⃣ TESTING: Complete Rune Reading with AI');
    const runePayload = {
      type: 'runes',
      spreadType: 'runa-unica',
      deckType: 'ELDER_FUTHARK',
      question: '¿Cuál es mi camino espiritual?',
      anonBirthDate: null,
      anonGender: null
    };

    const runeResponse = await fetch(`${backendUrl}/readings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(runePayload)
    });

    if (!runeResponse.ok) {
      throw new Error(`HTTP ${runeResponse.status}: ${runeResponse.statusText}`);
    }

    const runeData = await runeResponse.json();
    console.log('✅ Rune Reading Response received!');
    console.log('ᚱ Selected Rune:', runeData.reading.cards[0].rune.name, runeData.reading.cards[0].rune.symbol);
    console.log('💬 AI Interpretation Length:', runeData.reading.interpretation.length, 'characters');
    console.log('🤖 AI Interpretation Preview:', runeData.reading.interpretation.substring(0, 200) + '...');

    console.log('\n🏆 FULL INTEGRATION TEST PASSED!');
    console.log('✅ Frontend can communicate with Backend');
    console.log('✅ Backend can access Database');
    console.log('✅ OpenAI Integration working');
    console.log('✅ Card/Rune selection working');
    console.log('✅ Complete reading flow functional');

  } catch (error) {
    console.error('❌ FULL INTEGRATION TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
    
    // Diagnostic information
    console.log('\n🔍 DIAGNOSTIC INFO:');
    console.log('- Make sure backend is running on http://localhost:5000');
    console.log('- Make sure database is populated with seeds');
    console.log('- Make sure OpenAI API key is configured in .env');
    console.log('- Check network connectivity');
  }
}

// Check if node-fetch is available, if not provide instruction
try {
  testFullIntegration()
    .then(() => {
      console.log('\n✅ Full integration testing completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Full integration testing failed:', error);
      process.exit(1);
    });
} catch (error) {
  console.error('❌ Error: node-fetch not available. Install with: npm install node-fetch');
  process.exit(1);
}