import prisma from '../src/config/database.js';

async function testReading() {
  try {
    console.log('🔍 Testing Reading model...');
    
    // Verificar usuario admin
    const user = await prisma.user.findUnique({
      where: { email: 'admin@nebulosamagica.com' }
    });
    
    if (!user) {
      throw new Error('Admin user not found');
    }
    
    console.log('✅ Admin found:', user.id);
    
    // Intentar crear lectura simple
    const reading = await prisma.reading.create({
      data: {
        user: {
          connect: { id: user.id }
        },
        type: 'TAROT',
        question: 'Test question',
        deckType: 'rider-waite',
        spreadType: 'tres-cartas',
        cards: [{ test: 'card' }],
        interpretation: 'Test interpretation'
      }
    });
    
    console.log('✅ Reading created:', reading.id);
    
    // Limpiar - eliminar la lectura de test
    await prisma.reading.delete({
      where: { id: reading.id }
    });
    
    console.log('✅ Test reading deleted');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testReading();