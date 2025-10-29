import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Listing decks:');
    const decks = await prisma.deck.findMany();
    decks.forEach(d => console.log(`- id=${d.id} slug=${d.slug} name=${d.name} type=${d.type}`));

  console.log('\nDistinct tarot card deckType values (from JS):');
  const cards = await prisma.tarotCard.findMany({ select: { deckType: true }, take: 1000 });
  const distinct = [...new Set(cards.map(c => c.deckType))];
  console.log(distinct);

    console.log('\nCount cards where deck.slug = "rider-waite":');
    const count = await prisma.tarotCard.count({ where: { deck: { slug: 'rider-waite' } } });
    console.log('count for rider-waite via relation:', count);

    console.log('\nCount cards where deckType = "RIDER_WAITE":');
    const count2 = await prisma.tarotCard.count({ where: { deckType: 'RIDER_WAITE' } });
    console.log('count for RIDER_WAITE token:', count2);

  } catch (e) {
    console.error('Error checking decks:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
