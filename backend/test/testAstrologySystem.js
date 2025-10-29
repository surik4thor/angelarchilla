// Test del sistema astrológico
import { 
  calculateZodiacSign, 
  calculatePlanetaryPositions, 
  calculateHouses,
  generateNatalChart 
} from '../src/services/astroService.js';

async function testAstrologySystem() {
  console.log('🌟 TESTING: Sistema Astrológico Avanzado');
  console.log('='.repeat(50));

  try {
    // Test 1: Cálculo de signo zodiacal
    console.log('\n1️⃣ TESTING: Cálculo de Signo Zodiacal');
    const testDate = '1990-07-15';
    const zodiacSign = calculateZodiacSign(testDate);
    console.log(`✅ Fecha: ${testDate} → Signo: ${zodiacSign}`);

    // Test 2: Posiciones planetarias
    console.log('\n2️⃣ TESTING: Posiciones Planetarias');
    const planets = calculatePlanetaryPositions(testDate, '14:30', { lat: 40.4168, lon: -3.7038 });
    console.log('✅ Posiciones planetarias calculadas:');
    Object.entries(planets).forEach(([planet, position]) => {
      console.log(`   ${planet}: ${position.sign} ${position.degrees.toFixed(1)}°`);
    });

    // Test 3: Casas astrológicas
    console.log('\n3️⃣ TESTING: Casas Astrológicas');
    const houses = calculateHouses(testDate, '14:30', { lat: 40.4168, lon: -3.7038 });
    console.log(`✅ Ascendente: ${houses.ascendant.sign} ${houses.ascendant.degrees.toFixed(1)}°`);
    console.log('   Primeras 3 casas:');
    Object.entries(houses.houses).slice(0, 3).forEach(([house, data]) => {
      console.log(`   ${house}: ${data.sign}`);
    });

    // Test 4: Carta natal completa
    console.log('\n4️⃣ TESTING: Carta Natal Completa');
    const chartData = {
      birthDate: testDate,
      birthTime: '14:30',
      birthLocation: { 
        lat: 40.4168, 
        lon: -3.7038, 
        city: 'Madrid', 
        country: 'España' 
      }
    };

    const natalChart = await generateNatalChart(chartData);
    
    console.log('✅ Carta natal generada:');
    console.log(`   Signo Solar: ${natalChart.birthInfo.zodiacSign}`);
    console.log(`   Sol: ${natalChart.planets.Sol.sign} ${natalChart.planets.Sol.degrees.toFixed(1)}°`);
    console.log(`   Luna: ${natalChart.planets.Luna.sign} ${natalChart.planets.Luna.degrees.toFixed(1)}°`);
    console.log(`   Ascendente: ${natalChart.houses.ascendant.sign} ${natalChart.houses.ascendant.degrees.toFixed(1)}°`);
    console.log(`   Aspectos encontrados: ${natalChart.aspects.length}`);
    
    if (natalChart.aspects.length > 0) {
      console.log('   Primeros 3 aspectos:');
      natalChart.aspects.slice(0, 3).forEach(aspect => {
        console.log(`     ${aspect.planet1} ${aspect.aspect} ${aspect.planet2} (${aspect.degrees.toFixed(1)}°)`);
      });
    }

    console.log('\n📖 Interpretación generada:');
    console.log('-'.repeat(40));
    const interpretationLines = natalChart.interpretation.split('\n');
    interpretationLines.slice(0, 5).forEach(line => {
      if (line.trim()) console.log(line);
    });
    console.log('-'.repeat(40));

    console.log('\n✅ Test del sistema astrológico completado con éxito!');
    
  } catch (error) {
    console.error('❌ Error en el test astrológico:', error.message);
  }
}

// Test de diferentes fechas de nacimiento
async function testMultipleDates() {
  console.log('\n🎯 TESTING: Múltiples Fechas de Nacimiento');
  console.log('='.repeat(50));

  const testDates = [
    { date: '1985-03-25', expected: 'Aries' },
    { date: '1990-08-15', expected: 'Leo' },
    { date: '1992-12-10', expected: 'Sagitario' },
    { date: '1988-02-14', expected: 'Acuario' }
  ];

  testDates.forEach(({ date, expected }) => {
    const calculated = calculateZodiacSign(date);
    const status = calculated === expected ? '✅' : '❌';
    console.log(`${status} ${date}: Esperado ${expected}, Calculado ${calculated}`);
  });
}

// Ejecutar tests si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  await testAstrologySystem();
  await testMultipleDates();
}

export { testAstrologySystem, testMultipleDates };