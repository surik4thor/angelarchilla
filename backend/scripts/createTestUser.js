import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUserWithNatalChart() {
  console.log('🌟 Creando usuario de prueba con carta natal...\n');

  try {
    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const testUser = await prisma.user.upsert({
      where: { email: 'test@nebulosamagica.com' },
      update: {},
      create: {
        email: 'test@nebulosamagica.com',
        username: 'usuario_test',
        password: hashedPassword,
        birthDate: new Date('1990-08-15'),
        zodiacSign: 'Leo',
        subscriptionPlan: 'ADEPTO', // Premium para probar sin límites
        subscriptionStatus: 'ACTIVE'
      }
    });

    console.log(`✅ Usuario creado: ${testUser.email}`);

    // Crear carta natal de prueba
    const natalChart = await prisma.natalChart.upsert({
      where: { userId: testUser.id },
      update: {},
      create: {
        userId: testUser.id,
        birthDate: new Date('1990-08-15'),
        birthTime: '14:30',
        birthLocation: {
          lat: 40.4168,
          lon: -3.7038,
          city: 'Madrid',
          country: 'España'
        },
        zodiacSign: 'Leo',
        planetPositions: {
          Sol: { sign: 'Leo', degrees: 22.5 },
          Luna: { sign: 'Tauro', degrees: 18.3 },
          Mercurio: { sign: 'Leo', degrees: 5.7 },
          Venus: { sign: 'Cáncer', degrees: 28.1 },
          Marte: { sign: 'Géminis', degrees: 14.8 },
          Jupiter: { sign: 'Cáncer', degrees: 9.2 },
          Saturno: { sign: 'Capricornio', degrees: 24.6 }
        },
        houses: {
          ascendant: { sign: 'Escorpio', degrees: 15.4 },
          houses: [
            { number: 1, sign: 'Escorpio', degrees: 15.4 },
            { number: 2, sign: 'Sagitario', degrees: 18.7 },
            { number: 3, sign: 'Capricornio', degrees: 22.1 },
            { number: 4, sign: 'Acuario', degrees: 15.4 },
            { number: 5, sign: 'Piscis', degrees: 12.8 },
            { number: 6, sign: 'Aries', degrees: 9.3 }
          ]
        },
        aspects: [
          {
            planet1: 'Sol',
            planet2: 'Luna',
            aspect: 'Cuadratura',
            degrees: 94.2,
            orb: 4.2
          },
          {
            planet1: 'Venus',
            planet2: 'Marte',
            aspect: 'Sextil',
            degrees: 61.3,
            orb: 1.3
          }
        ],
        interpretation: 'Carta natal de prueba para Leo con ascendente Escorpio'
      }
    });

    console.log(`✅ Carta natal creada para el usuario`);

    // Crear algunos sueños de ejemplo
    const dreamSample = await prisma.dream.create({
      data: {
        userId: testUser.id,
        dreamText: 'Soñé que volaba sobre una ciudad llena de luces doradas. Me sentía libre y poderoso, como si pudiera alcanzar cualquier meta que me propusiera.',
        feelings: ['libertad', 'poder', 'alegría', 'esperanza'],
        interpretation: 'Este sueño refleja tu deseo de trascendencia y tu potencial creativo. Las luces doradas simbolizan sabiduría y éxito que está a tu alcance.',
        date: new Date('2024-10-25')
      }
    });

    console.log(`✅ Sueño de ejemplo creado`);

    console.log('\n🎉 ¡Usuario de prueba creado exitosamente!');
    console.log('\n📋 Datos de acceso:');
    console.log(`   📧 Email: test@nebulosamagica.com`);
    console.log(`   🔒 Password: test123`);
    console.log(`   ♌ Signo: Leo`);
    console.log(`   📊 Plan: ADEPTO (Premium)`);
    console.log(`   📅 Fecha de nacimiento: 15 de agosto de 1990`);
    console.log('\n✨ Puedes usar estos datos para probar el sistema de horóscopos personalizados');

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUserWithNatalChart();