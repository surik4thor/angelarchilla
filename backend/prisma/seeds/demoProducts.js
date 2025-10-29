import prisma from '../../src/config/database.js';

async function main() {
  await prisma.product.create({
    data: {
      name: 'Pulsera Cuarzo Rosa',
      description: 'Pulsera artesanal con cuarzo rosa, ideal para atraer el amor y la armonía.',
      price: 19.99,
      category: 'joyas_misticas',
      featured: true,
      newArrival: true,
      imageUrl: '/uploads/products/images/demo_cuarzo_rosa.jpg',
      variants: {
        create: [
          { name: 'Talla S', price: 19.99 },
          { name: 'Talla M', price: 19.99 },
          { name: 'Talla L', price: 19.99 }
        ]
      },
      attributes: {
        create: [
          { key: 'Material', value: 'Cuarzo Rosa' },
          { key: 'Origen', value: 'Brasil' }
        ]
      }
    }
  });
  await prisma.product.create({
    data: {
      name: 'Baraja Tarot Rider Waite',
      description: 'Baraja clásica Rider Waite, perfecta para lecturas profundas y profesionales.',
      price: 24.99,
      category: 'barajas_tarot_premium',
      featured: true,
      newArrival: false,
      imageUrl: '/uploads/products/images/demo_rider_waite.jpg',
      variants: {
        create: [
          { name: 'Edición Estándar', price: 24.99 },
          { name: 'Edición Deluxe', price: 34.99 }
        ]
      },
      attributes: {
        create: [
          { key: 'Idioma', value: 'Español' },
          { key: 'Cartas', value: '78' }
        ]
      }
    }
  });
  await prisma.product.create({
    data: {
      name: 'Pack Cristales Energéticos',
      description: 'Set de cristales energéticos para protección y equilibrio espiritual.',
      price: 14.99,
      category: 'cristales_energeticos',
      featured: false,
      newArrival: true,
      imageUrl: '/uploads/products/images/demo_cristales.jpg',
      variants: {
        create: [
          { name: 'Pack 5 piedras', price: 14.99 },
          { name: 'Pack 10 piedras', price: 24.99 }
        ]
      },
      attributes: {
        create: [
          { key: 'Incluye', value: 'Amatista, Cuarzo, Citrino, Obsidiana, Aventurina' }
        ]
      }
    }
  });
  console.log('Productos demo creados');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());