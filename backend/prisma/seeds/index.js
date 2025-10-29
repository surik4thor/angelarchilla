import { PrismaClient } from '@prisma/client';
import { riderWaiteDeck } from './rider-waite-deck.js';
import { marsellaDeck } from './marsella-deck.js';
import { futharkRunes } from './futhark-runes.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌟 Iniciando seeds de Arcana Club...');
  
  try {
    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await prisma.reading.deleteMany();
    await prisma.rune.deleteMany();
    await prisma.tarotCard.deleteMany();
    await prisma.deck.deleteMany();
    
    // Crear mazos (decks)
    console.log('📚 Creando mazos de ejemplo...');
    const riderDeck = await prisma.deck.create({ data: { name: 'Rider Waite', slug: 'rider-waite', description: 'Mazo Rider Waite clásico', imageUrl: null, type: 'TAROT' } });
    const marsellaDeckRec = await prisma.deck.create({ data: { name: 'Marsella', slug: 'marsella', description: 'Mazo de Marsella', imageUrl: null, type: 'TAROT' } });
    const futharkDeck = await prisma.deck.create({ data: { name: 'Elder Futhark', slug: 'elder-futhark', description: 'Conjunto de runas Elder Futhark', imageUrl: null, type: 'RUNES' } });

    // Seed Cartas Rider-Waite
    console.log('🃏 Creando cartas Rider-Waite (78 cartas)...');
    for (const card of riderWaiteDeck) {
      await prisma.tarotCard.create({
        data: {
          id: `rw-${card.name.toLowerCase().replace(/\s+/g, '-').replace(/[áéíóú]/g, (m) => ({'á':'a','é':'e','í':'i','ó':'o','ú':'u'}[m]))}`,
          name: card.name,
          cardNumber: card.number || null,
          arcana: card.arcana.toUpperCase(),
          suit: card.suit || null,
          meaning: card.meaning,
          reversedMeaning: card.reversedMeaning || "Interpretación invertida: aspectos bloqueados o internos de la carta.",
          keywords: card.meaning.split(', ').slice(0, 5), // Primeras 5 palabras clave
          imageUrl: card.image,
          deckType: 'RIDER_WAITE',
          deckId: riderDeck.id,
          prompt: card.prompt
        },
      });
    }
    
    // Seed Cartas Marsella
    console.log('🃏 Creando cartas Marsella (78 cartas)...');
    for (const card of marsellaDeck) {
      await prisma.tarotCard.create({
        data: {
          id: `ma-${card.name.toLowerCase().replace(/\s+/g, '-').replace(/[áéíóú]/g, (m) => ({'á':'a','é':'e','í':'i','ó':'o','ú':'u'}[m]))}`,
          name: card.name,
          cardNumber: card.number || null,
          arcana: card.arcana.toUpperCase(),
          suit: card.suit || null,
          meaning: card.meaning,
          reversedMeaning: card.reversedMeaning || "Interpretación invertida: aspectos bloqueados o internos de la carta.",
          keywords: card.meaning.split(', ').slice(0, 5), // Primeras 5 palabras clave  
          imageUrl: card.image,
          deckType: 'MARSELLA',
          deckId: marsellaDeckRec.id,
          prompt: card.prompt
        },
      });
    }
    
    // Seed Runas Elder Futhark
    console.log('ᚱ Creando runas Elder Futhark (24 runas)...');
    for (const rune of futharkRunes) {
      await prisma.rune.create({
        data: {
          id: `ef-${rune.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: rune.name,
          symbol: rune.symbol,
          meaning: rune.meaning,
          reversedMeaning: `Interpretación invertida: aspectos bloqueados de ${rune.meaning.toLowerCase()}`,
          keywords: rune.meaning.split(', ').slice(0, 5), // Primeras 5 palabras clave
          imageUrl: rune.svg || `images/runes/${rune.name.toLowerCase()}.svg`,
          runeSet: 'ELDER_FUTHARK',
          deckId: futharkDeck.id,
          prompt: rune.prompt
        },
      });
    }
    
    console.log('✅ Seeds completados exitosamente:');
    console.log(`   📚 ${riderWaiteDeck.length} cartas Rider-Waite`);
    console.log(`   📚 ${marsellaDeck.length} cartas Marsella`);  
    console.log(`   ᚱ ${futharkRunes.length} runas Elder Futhark`);
    
  } catch (error) {
    console.error('❌ Error en seeds:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });