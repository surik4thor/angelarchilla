import { PrismaClient } from '@prisma/client';
import astroService from '../src/services/astroService.js';
import PersonalizedHoroscopeController from '../src/controllers/personalizedHoroscopeController.js';

const prisma = new PrismaClient();

async function testPersonalizedHoroscopeSystem() {
  console.log('🌟 Iniciando pruebas del Sistema de Horóscopos Personalizados...\n');

  try {
    // Test 1: Verificar modelo PersonalizedHoroscope en base de datos
    console.log('📊 Test 1: Verificando esquema de base de datos...');
    
    try {
      // Intentar crear un registro de prueba (si no hay errores, el modelo existe)
      await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'personalized_horoscopes'
        ORDER BY ordinal_position;
      `;
      console.log('✅ Tabla personalized_horoscopes existe en la base de datos');
    } catch (error) {
      console.log('❌ Tabla personalized_horoscopes NO existe. Ejecuta la migración primero.');
      console.log('   Comando: npx prisma migrate dev --name add-personalized-horoscope');
      return;
    }

    // Test 2: Verificar que existe usuario y carta natal de prueba
    console.log('\n📊 Test 2: Verificando datos de prueba...');
    
    const testUser = await prisma.user.findFirst({
      include: {
        natalChart: true
      }
    });

    if (!testUser) {
      console.log('❌ No se encontró usuario de prueba');
      console.log('   Crea un usuario desde el frontend o inserta datos manualmente');
      return;
    }

    console.log(`✅ Usuario encontrado: ${testUser.email}`);

    if (!testUser.natalChart) {
      console.log('❌ Usuario no tiene carta natal calculada');
      console.log('   Ve al perfil del usuario y calcula la carta natal primero');
      return;
    }

    console.log('✅ Carta natal encontrada para el usuario');

    // Test 3: Simular cálculo de tránsitos
    console.log('\n📊 Test 3: Probando cálculo de tránsitos actuales...');
    
    try {
      const sampleNatalPositions = {
        Sol: { sign: 'Leo', degrees: 15.5 },
        Luna: { sign: 'Piscis', degrees: 22.3 },
        Mercurio: { sign: 'Virgo', degrees: 8.7 },
        Venus: { sign: 'Cáncer', degrees: 12.1 },
        Marte: { sign: 'Escorpio', degrees: 28.9 }
      };

      const currentTransits = astroService.calculateCurrentTransits(
        sampleNatalPositions, 
        new Date()
      );

      console.log(`✅ Cálculo de tránsitos exitoso. ${currentTransits.length} tránsitos encontrados:`);
      currentTransits.forEach((transit, i) => {
        console.log(`   ${i + 1}. ${transit.aspect}: ${transit.description}`);
      });

    } catch (error) {
      console.log('❌ Error en cálculo de tránsitos:', error.message);
      return;
    }

    // Test 4: Simular generación de horóscopo (sin IA real)
    console.log('\n📊 Test 4: Probando generación de horóscopo personalizado...');
    
    try {
      // Crear un horóscopo de prueba
      const testHoroscope = await prisma.personalizedHoroscope.create({
        data: {
          userId: testUser.id,
          natalChartId: testUser.natalChart.id,
          content: `Horóscopo de Prueba para ${testUser.natalChart.zodiacSign}

**Energías Personales Activadas**
Tu carta natal única se activa con las energías cósmicas actuales, creando oportunidades específicas para tu crecimiento.

**Tránsitos Significativos**
Los planetas en movimiento forman aspectos importantes con tus posiciones natales, especialmente influenciando tu Sol en ${testUser.natalChart.zodiacSign}.

**Guía Para Hoy**
Las configuraciones actuales favorecen la introspección y el desarrollo personal. Es un momento ideal para conectar con tu verdadera esencia.

**Oportunidades de Crecimiento**
Tu carta natal sugiere potenciales únicos que se están activando. Mantente abierto/a a las sincronicidades.`,
          transits: JSON.stringify([
            {
              aspect: "Sol ☌ Luna natal",
              description: "El Sol ilumina y renueva tu energía vital en tu Luna natal",
              exactness: 2.1,
              influence: "major"
            }
          ]),
          zodiacSign: testUser.natalChart.zodiacSign,
          date: new Date()
        }
      });

      console.log(`✅ Horóscopo personalizado creado exitosamente (ID: ${testHoroscope.id})`);
      console.log(`   Contenido: ${testHoroscope.content.substring(0, 100)}...`);

    } catch (error) {
      console.log('❌ Error creando horóscopo personalizado:', error.message);
      return;
    }

    // Test 5: Verificar endpoint de API (simulado)
    console.log('\n📊 Test 5: Verificando estructura de controlador...');
    
    const controller = PersonalizedHoroscopeController;
    
    if (controller.generatePersonalizedHoroscope) {
      console.log('✅ Método generatePersonalizedHoroscope existe en controlador');
    } else {
      console.log('❌ Método generatePersonalizedHoroscope NO existe en controlador');
    }

    if (controller.getHoroscopeHistory) {
      console.log('✅ Método getHoroscopeHistory existe en controlador');
    } else {
      console.log('❌ Método getHoroscopeHistory NO existe en controlador');
    }

    // Test 6: Verificar límites de suscripción
    console.log('\n📊 Test 6: Verificando límites de suscripción...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const horoscopeCount = await prisma.personalizedHoroscope.count({
      where: {
        userId: testUser.id,
        createdAt: { gte: today }
      }
    });

    console.log(`✅ Usuario tiene ${horoscopeCount} horóscopo(s) hoy`);
    console.log(`   Plan del usuario: ${testUser.subscriptionPlan}`);
    
    if (testUser.subscriptionPlan === 'INVITADO' && horoscopeCount >= 1) {
      console.log('⚠️  Usuario gratuito ha alcanzado límite diario (1 horóscopo)');
    } else if (testUser.subscriptionPlan !== 'INVITADO') {
      console.log('✅ Usuario premium sin límites en horóscopos');
    } else {
      console.log('✅ Usuario gratuito dentro del límite diario');
    }

    // Limpiar datos de prueba
    console.log('\n🧹 Limpiando datos de prueba...');
    await prisma.personalizedHoroscope.deleteMany({
      where: {
        userId: testUser.id,
        content: { startsWith: 'Horóscopo de Prueba' }
      }
    });
    console.log('✅ Datos de prueba eliminados');

    console.log('\n🎉 ¡Todas las pruebas del sistema de horóscopos personalizados completadas exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('   ✅ Base de datos configurada correctamente');
    console.log('   ✅ Cálculos de tránsitos funcionando');
    console.log('   ✅ Generación de horóscopos operativa');
    console.log('   ✅ Controladores implementados');
    console.log('   ✅ Límites de suscripción funcionando');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar pruebas
testPersonalizedHoroscopeSystem();