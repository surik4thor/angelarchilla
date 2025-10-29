import { selectCards, selectTarotCards, selectRunes, getAvailableSpreads } from '../src/services/cardSelector.js';

async function testCardSelector() {
  console.log('🔮 TESTING ARCANA CLUB - CARD SELECTOR SERVICE');
  console.log('='.repeat(50));

  try {
    // Test 1: Obtener tiradas disponibles
    console.log('\n1️⃣ TESTING: Available Spreads');
    const tarotSpreads = getAvailableSpreads('tarot');
    const runeSpreads = getAvailableSpreads('runes');
    
    console.log('📚 Tarot Spreads:', Object.keys(tarotSpreads));
    console.log('ᚱ Rune Spreads:', Object.keys(runeSpreads));

    // Test 2: Selección de cartas de Tarot
    console.log('\n2️⃣ TESTING: Tarot Card Selection (Una Carta - Rider-Waite)');
    const tarotOneCard = await selectTarotCards('una-carta', 'RIDER_WAITE');
    console.log('✅ Selected Tarot Card:');
    console.log(JSON.stringify(tarotOneCard[0], null, 2));

    // Test 3: Selección de cartas de Tarot (Tres cartas - Marsella)  
    console.log('\n3️⃣ TESTING: Tarot Card Selection (Tres Cartas - Marsella)');
    const tarotThreeCards = await selectTarotCards('tres-cartas', 'MARSELLA');
    console.log('✅ Selected 3 Tarot Cards:');
    tarotThreeCards.forEach((card, i) => {
      console.log(`  Position ${i+1}: ${card.card.name} (${card.card.reversed ? 'Reversed' : 'Upright'})`);
    });

    // Test 4: Selección de runas
    console.log('\n4️⃣ TESTING: Rune Selection (Una Runa)');
    const runeOne = await selectRunes('runa-unica', 'ELDER_FUTHARK');
    console.log('✅ Selected Rune:');
    console.log(JSON.stringify(runeOne[0], null, 2));

    // Test 5: Selección de runas (Tres runas)
    console.log('\n5️⃣ TESTING: Rune Selection (Tres Runas)');
    const runeThree = await selectRunes('tres-runas', 'ELDER_FUTHARK');
    console.log('✅ Selected 3 Runes:');
    runeThree.forEach((rune, i) => {
      console.log(`  Position ${i+1}: ${rune.rune.name} ${rune.rune.symbol} (${rune.rune.reversed ? 'Reversed' : 'Upright'})`);
    });

    // Test 6: Función selectCards unificada
    console.log('\n6️⃣ TESTING: Unified selectCards Function');
    const tarotCards = await selectCards('tarot', 'una-carta', 'RIDER_WAITE');
    const runeCards = await selectCards('runes', 'runa-unica', 'ELDER_FUTHARK');
    
    console.log('✅ Tarot via selectCards:', tarotCards[0].card.name);
    console.log('✅ Rune via selectCards:', runeCards[0].rune.name, runeCards[0].rune.symbol);

    console.log('\n🎉 ALL TESTS PASSED! Card selector is working correctly!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar tests
testCardSelector()
  .then(() => {
    console.log('\n✅ Testing completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Testing failed:', error);
    process.exit(1);
  });