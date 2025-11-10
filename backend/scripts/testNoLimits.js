import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5050/api';

async function testNoLimits() {
  try {
    console.log('🧪 Testing No Limits System...\n');

    // Test 1: Login como admin
    console.log('1. 🔐 Admin Login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'surik4thor@icloud.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    console.log('✅ Login exitoso');
    console.log('   Role:', loginData.user?.role);

    // Test 2: Verificar límites de tarot
    console.log('\n2. 🃏 Testing Tarot Limits...');
    const tarotLimitResponse = await fetch(`${API_BASE}/tarotReadings/limit-status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    const tarotLimitData = await tarotLimitResponse.json();
    console.log('✅ Tarot limit status:', tarotLimitData);

    // Test 3: Verificar límites de runas
    console.log('\n3. 🗿 Testing Runes Limits...');
    const runesLimitResponse = await fetch(`${API_BASE}/runesReadings/limit-status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    const runesLimitData = await runesLimitResponse.json();
    console.log('✅ Runes limit status:', runesLimitData);

    // Test 4: Verificar límites de sueños
    console.log('\n4. 🌙 Testing Dreams Limits...');
    const dreamsLimitResponse = await fetch(`${API_BASE}/dreams/limit-status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    const dreamsLimitData = await dreamsLimitResponse.json();
    console.log('✅ Dreams limit status:', dreamsLimitData);

    // Test 5: Intentar crear una lectura de tarot
    console.log('\n5. 🎯 Creating Tarot Reading...');
    const createTarotResponse = await fetch(`${API_BASE}/tarotReadings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deck: 'rider-waite',
        spread: 'three-card',
        question: 'Esta es una pregunta de prueba para verificar que no hay límites en el sistema.'
      })
    });

    if (createTarotResponse.ok) {
      console.log('✅ Tarot reading created successfully - no limits blocking!');
    } else {
      const error = await createTarotResponse.text();
      console.log('❌ Tarot reading blocked:', error);
    }

    // Test 6: Verificar endpoint unificado de límites
    console.log('\n6. 🎲 Testing Unified Limit Status...');
    const unifiedLimitResponse = await fetch(`${API_BASE}/readings/limit-status?type=tarot`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    const unifiedLimitData = await unifiedLimitResponse.json();
    console.log('✅ Unified limit status:', unifiedLimitData);

    console.log('\n🎉 ALL TESTS COMPLETED!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testNoLimits();