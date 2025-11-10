import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Mapeo para cartas de Marsella basado en los archivos reales
const marsellaMappings = {
  // Arcanos Mayores
  'El Loco': '00-le-mat.jpg',
  'El Bateleur': '01-le-bateleur.jpg',
  'La Papisa': '02-la-papesse.jpg',
  'La Emperatriz': '03-limperatrice.jpg',
  'El Emperador': '04-lempereur.jpg',
  'El Papa': '05-le-pape.jpg',
  'Los Enamorados': '06-lamovrevx.jpg',
  'El Carro': '07-le-chariot.jpg',
  'La Justicia': '08-la-justice.jpg',
  'El Ermitaño': '09-l-hermite.jpg',
  'La Rueda de la Fortuna': '10-la-rove-de-fortune.jpg',
  'La Fuerza': '11-la-force.jpg',
  'El Colgado': '12-le-pendu.jpg',
  'La Muerte': '13-la-mort.jpg',
  'La Templanza': '14-temperance.jpg',
  'El Diablo': '15-le-diable.jpg',
  'La Torre': '16-la-maison-diev.jpg',
  'La Estrella': '17-le-toille.jpg',
  'La Luna': '18-la-lune.jpg',
  'El Sol': '19-le-soleil.jpg',
  'El Juicio': '20-le-jugement.jpg',
  'El Mundo': '21-le-monde.jpg',
  
  // Bastos
  'As de Bastos': 'as-batons.jpg',
  'Dos de Bastos': 'two-batons.jpg',
  'Tres de Bastos': 'three-batons.jpg',
  'Cuatro de Bastos': 'four-batons.jpg',
  'Cinco de Bastos': 'five-batons.jpg',
  'Seis de Bastos': 'six-batons.jpg',
  'Siete de Bastos': 'seven-batons.jpg',
  'Ocho de Bastos': 'eight-batons.jpg',
  'Nueve de Bastos': 'nine-batons.jpg',
  'Diez de Bastos': 'ten-batons.jpg',
  'Valet de Bastos': 'valvet-batons.jpg',
  'Caballo de Bastos': 'cavalier-batons.jpg',
  'Reina de Bastos': 'reyne-batons.jpg',
  'Rey de Bastos': 'roy-batons.jpg',
  
  // Copas  
  'As de Copas': 'as-coupes.jpg',
  'Dos de Copas': 'two-coupes.jpg',
  'Tres de Copas': 'three-coupes.jpg',
  'Cuatro de Copas': 'four-coupes.jpg',
  'Cinco de Copas': 'five-coupes.jpg',
  'Seis de Copas': 'six-coupes.jpg',
  'Siete de Copas': 'seven-coupes.jpg',
  'Ocho de Copas': 'eight-coupes.jpg',
  'Nueve de Copas': 'nine-coupes.jpg',
  'Diez de Copas': 'ten-coupes.jpg',
  'Valet de Copas': 'valet-coupes.jpg',
  'Caballo de Copas': 'cavalier-coupes.jpg',
  'Reina de Copas': 'reyne-coupes.jpg',
  'Rey de Copas': 'roy-coupes.jpg',
  
  // Espadas
  'As de Espadas': 'as-epees.jpg',
  'Dos de Espadas': 'two-epees.jpg',
  'Tres de Espadas': 'three-epees.jpg',
  'Cuatro de Espadas': 'four-epees.jpg',
  'Cinco de Espadas': 'five-epees.jpg',
  'Seis de Espadas': 'six-epees.jpg',
  'Siete de Espadas': 'seven-epees.jpg',
  'Ocho de Espadas': 'eight-epees.jpg',
  'Nueve de Espadas': 'nine-epees.jpg',
  'Diez de Espadas': 'ten-epees.jpg',
  'Valet de Espadas': 'valvet-epees.jpg',
  'Caballo de Espadas': 'cavalier-epees.jpg',
  'Reina de Espadas': 'reyne-epees.jpg',
  'Rey de Espadas': 'roy-epees.jpg',
  
  // Oros
  'As de Oros': 'as-deniers.jpg',
  'Dos de Oros': '02-deniers.jpg',
  'Tres de Oros': '03-deniers.jpg',
  'Cuatro de Oros': '04-deniers.jpg',
  'Cinco de Oros': '05-deniers.jpg',
  'Seis de Oros': '06-deniers.jpg',
  'Siete de Oros': '07-deniers.jpg',
  'Ocho de Oros': '08-deniers.jpg',
  'Nueve de Oros': '09-deniers.jpg',
  'Diez de Oros': '10-deniers.jpg',
  'Valet de Oros': 'valet-deniers.jpg',
  'Caballo de Oros': 'cavalier-deniers.jpg',
  'Reina de Oros': 'reyne-deniers.jpg',
  'Rey de Oros': 'roy-deniers.jpg'
};

async function updateMarsellaImages() {
  try {
    console.log('🔧 Actualizando rutas de imágenes de Marsella...');
    
    let updated = 0;
    for (const [cardName, filename] of Object.entries(marsellaMappings)) {
      const result = await prisma.tarotCard.updateMany({
        where: { 
          name: cardName,
          deckType: 'MARSELLA'
        },
        data: {
          imageUrl: `images/marsella/${filename}`
        }
      });
      
      if (result.count > 0) {
        updated++;
        console.log(`✅ ${cardName} -> ${filename}`);
      } else {
        console.log(`⚠️  No encontrada: ${cardName}`);
      }
    }
    
    console.log(`\n📊 Actualizadas ${updated} cartas de Marsella`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateMarsellaImages();