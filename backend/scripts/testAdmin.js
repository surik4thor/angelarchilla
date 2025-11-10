import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5050/api';

async function testAdminSystem() {
  try {
    console.log('🧪 Testing Admin System...\n');

    // Test 1: Login como admin
    console.log('1. 🔐 Login como admin...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'surik4thor@icloud.com',
        password: 'admin123' // Asume esta contraseña, ajusta según necesites
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    console.log('✅ Login exitoso');
    console.log('   Token:', token?.substring(0, 20) + '...');
    console.log('   Role:', loginData.user?.role);
    console.log('   Premium:', loginData.user?.isPremium);

    // Test 2: Verificar acceso a endpoint premium
    console.log('\n2. 🔒 Testing Premium Access...');
    const premiumResponse = await fetch(`${API_BASE}/readings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (premiumResponse.ok) {
      console.log('✅ Admin tiene acceso Premium automático');
    } else {
      console.log('❌ Admin no tiene acceso Premium:', await premiumResponse.text());
    }

    // Test 3: Verificar endpoint admin
    console.log('\n3. ⚡ Testing Admin Endpoints...');
    const adminResponse = await fetch(`${API_BASE}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (adminResponse.ok) {
      const users = await adminResponse.json();
      console.log('✅ Admin endpoint accessible');
      console.log('   Total users:', users.length);
    } else {
      console.log('❌ Admin endpoint failed:', await adminResponse.text());
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAdminSystem();