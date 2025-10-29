import fetch from 'node-fetch';

async function testPersonalizedHoroscopeAPI() {
  console.log('🧪 Probando API de Horóscopos Personalizados...\n');

  const baseUrl = 'http://localhost:5050/api';
  const testUser = {
    email: 'test@nebulosamagica.com',
    password: 'test123'
  };

  try {
    // 1. Hacer login para obtener token
    console.log('🔐 Paso 1: Autenticación...');
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    if (!loginResponse.ok) {
      throw new Error(`Error en login: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login exitoso');

    // 2. Verificar carta natal existe
    console.log('\n📊 Paso 2: Verificando carta natal...');
    const natalResponse = await fetch(`${baseUrl}/astrology/natal-chart`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (natalResponse.ok) {
      const natalData = await natalResponse.json();
      console.log(`✅ Carta natal encontrada: ${natalData.natalChart.zodiacSign}`);
    } else {
      console.log('⚠️ Carta natal no encontrada, pero continuamos...');
    }

    // 3. Generar horóscopo personalizado
    console.log('\n🌟 Paso 3: Generando horóscopo personalizado...');
    const horoscopeResponse = await fetch(`${baseUrl}/personalized-horoscope/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!horoscopeResponse.ok) {
      const errorData = await horoscopeResponse.json();
      throw new Error(`Error generando horóscopo: ${horoscopeResponse.status} - ${errorData.error}`);
    }

    const horoscopeData = await horoscopeResponse.json();
    console.log('✅ Horóscopo generado exitosamente!');
    console.log(`   Signo: ${horoscopeData.horoscope.zodiacSign}`);
    console.log(`   Tránsitos: ${horoscopeData.horoscope.transits.length} aspectos`);
    console.log(`   Contenido: ${horoscopeData.horoscope.content.substring(0, 100)}...`);

    // 4. Obtener historial de horóscopos
    console.log('\n📚 Paso 4: Obteniendo historial...');
    const historyResponse = await fetch(`${baseUrl}/personalized-horoscope/history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      console.log(`✅ Historial obtenido: ${historyData.horoscopes.length} horóscopos`);
    }

    // 5. Obtener estadísticas
    console.log('\n📈 Paso 5: Obteniendo estadísticas...');
    const statsResponse = await fetch(`${baseUrl}/personalized-horoscope/stats/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log(`✅ Estadísticas obtenidas:`);
      console.log(`   Total: ${statsData.stats.total}`);
      console.log(`   Hoy: ${statsData.stats.today}`);
      console.log(`   Este mes: ${statsData.stats.thisMonth}`);
      console.log(`   Tiene carta natal: ${statsData.stats.hasNatalChart ? 'Sí' : 'No'}`);
    }

    console.log('\n🎉 ¡Todas las pruebas de API completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

testPersonalizedHoroscopeAPI();