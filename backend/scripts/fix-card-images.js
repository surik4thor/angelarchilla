import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Mapeo de nombres de cartas en español a inglés para Rider-Waite
const riderWaiteMappings = {
  'El Loco': '00-the-fool.jpg',
  'El Mago': '01-the-magician.jpg',
  'La Sacerdotisa': '02-the-high-priestess.jpg',
  'La Emperatriz': '03-the-empress.jpg',
  'El Emperador': '04-the-emperor.jpg',
  'El Hierofante': '05-the-hierophant.jpg',
  'Los Enamorados': '06-the-lovers.jpg',
  'El Carro': '07-the-chariot.jpg',
  'La Fuerza': '08-strength.jpg',
  'El Ermitaño': '09-the-hermit.jpg',
  'La Rueda de la Fortuna': '10-the-wheel-of-fortune.jpg',
  'La Justicia': '09-Justice.jpg',
  'El Colgado': '12-the-hanged-man.jpg',
  'La Muerte': '13-death.jpg',
  'La Templanza': '14-Temperance.jpg',
  'El Diablo': '15-the-devil.jpg',
  'La Torre': '16-the-tower.jpg',
  'La Estrella': '17-the-star.jpg',
  'La Luna': '18-the-moon.jpg',
  'El Sol': '19-the-sun.jpg',
  'El Juicio': '20-judgement.jpg',
  'El Mundo': '21-the-world.jpg',
  // Copas
  'As de Copas': 'ace-of-cups.jpg',
  'Dos de Copas': 'two-of-cups.jpg',
  'Tres de Copas': 'three-of-cups.jpg',
  'Cuatro de Copas': 'four-of-cups.jpg',
  'Cinco de Copas': 'five-of-cups.jpg',
  'Seis de Copas': 'six-of-cups.jpg',
  'Siete de Copas': 'seven-of-cups.jpg',
  'Ocho de Copas': 'eight-of-cups.jpg',
  'Nueve de Copas': 'nine-of-cups.jpg',
  'Diez de Copas': 'ten-of-cups.jpg',
  'Paje de Copas': 'page-of-cups.jpg',
  'Caballero de Copas': 'knight-of-cups.jpg',
  'Reina de Copas': 'queen-of-cups.jpg',
  'Rey de Copas': 'king-of-cups.jpg',
  // Pentáculos
  'As de Pentáculos': 'ace-of-pentacles.jpg',
  'Dos de Pentáculos': 'two-of-pentacles.jpg',
  'Tres de Pentáculos': 'three-of-pentacles.jpg',
  'Cuatro de Pentáculos': 'four-of-pentacles.jpg',
  'Cinco de Pentáculos': 'five-of-pentacles.jpg',
  'Seis de Pentáculos': 'six-of-pentacles.jpg',
  'Siete de Pentáculos': 'seven-of-pentacles.jpg',
  'Ocho de Pentáculos': 'eight-of-pentacles.jpg',
  'Nueve de Pentáculos': 'nine-of-pentacles.jpg',
  'Diez de Pentáculos': 'ten-of-pentacles.jpg',
  'Paje de Pentáculos': 'page-of-pentacles.jpg',
  'Caballero de Pentáculos': 'knight-of-pentacles.jpg',
  'Reina de Pentáculos': 'queen-of-pentacles.jpg',
  'Rey de Pentáculos': 'king-of-pentacles.jpg',
  // Espadas
  'As de Espadas': 'ace-of-swords.jpg',
  'Dos de Espadas': 'two-of-swords.jpg',
  'Tres de Espadas': 'three-of-swords.jpg',
  'Cuatro de Espadas': 'four-of-swords.jpg',
  'Cinco de Espadas': 'five-of-swords.jpg',
  'Seis de Espadas': 'six-of-swords.jpg',
  'Siete de Espadas': 'seven-of-swords.jpg',
  'Ocho de Espadas': 'eight-of-swords.jpg',
  'Nueve de Espadas': 'nine-of-swords.jpg',
  'Diez de Espadas': 'ten-of-swords.jpg',
  'Paje de Espadas': 'page-of-swords.jpg',
  'Caballero de Espadas': 'knight-of-swords.jpg',
  'Reina de Espadas': 'queen-of-swords.jpg',
  'Rey de Espadas': 'king-of-swords.jpg',
  // Bastos
  'As de Bastos': 'ace-of-wands.jpg',
  'Dos de Bastos': 'two-of-wands.jpg',
  'Tres de Bastos': 'three-of-wands.jpg',
  'Cuatro de Bastos': 'four-of-wands.jpg',
  'Cinco de Bastos': 'five-of-wands.jpg',
  'Seis de Bastos': 'six-of-wands.jpg',
  'Siete de Bastos': 'seven-of-wands.jpg',
  'Ocho de Bastos': 'eight-of-wands.jpg',
  'Nueve de Bastos': 'nine-of-wands.jpg',
  'Diez de Bastos': 'ten-of-wands.jpg',
  'Paje de Bastos': 'page-of-wands.jpg',
  'Caballero de Bastos': 'knight-of-wands.jpg',
  'Reina de Bastos': 'queen-of-wands.jpg',
  'Rey de Bastos': 'king-of-wands.jpg'
};

async function updateImagePaths() {
  try {
    console.log('🔧 Actualizando rutas de imágenes...');
    
    // Actualizar cartas Rider-Waite
    let updated = 0;
    for (const [cardName, filename] of Object.entries(riderWaiteMappings)) {
      const result = await prisma.tarotCard.updateMany({
        where: { 
          name: cardName,
          deckType: 'RIDER_WAITE'
        },
        data: {
          imageUrl: `images/rider-waite/${filename}`
        }
      });
      
      if (result.count > 0) {
        updated++;
        console.log(`✅ ${cardName} -> ${filename}`);
      } else {
        console.log(`⚠️  No encontrada: ${cardName}`);
      }
    }
    
    console.log(`\n📊 Actualizadas ${updated} cartas Rider-Waite`);
    
    // Verificar algunas cartas actualizadas
    const sampleCards = await prisma.tarotCard.findMany({
      where: { deckType: 'RIDER_WAITE' },
      take: 3
    });
    
    console.log('\n🎴 Cartas de muestra:');
    sampleCards.forEach(card => {
      console.log(`- ${card.name}: ${card.imageUrl}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateImagePaths();