import { selectTarotCards } from '../src/services/cardSelector.js';

async function main() {
  try {
    const cards = await selectTarotCards('tres-cartas', 'rider-waite');
    console.log('Selected cards count:', cards.length);
    console.log(JSON.stringify(cards.slice(0,3), null, 2));
  } catch (e) {
    console.error('Error running selectTarotCards:', e);
    process.exit(1);
  }
}

main();
