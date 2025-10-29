import prismaPkg from '@prisma/client';
const { PrismaClient } = prismaPkg;

const prisma = new PrismaClient();

async function remove() {
  try {
    const slug = 'autotest---deck-invalidation';
    const deck = await prisma.deck.findUnique({ where: { slug } });
    if (!deck) {
      console.log('No test deck found with slug:', slug);
      return;
    }
    await prisma.tarotCard.deleteMany({ where: { deckId: deck.id } }).catch(()=>{});
    await prisma.deck.delete({ where: { id: deck.id } });
    console.log('Deleted test deck:', slug);
  } catch (e) {
    console.error('Error deleting test deck:', e);
  } finally {
    await prisma.$disconnect();
  }
}

remove();
