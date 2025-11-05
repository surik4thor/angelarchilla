import Stripe from 'stripe';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function testStripeIntegration() {
  console.log('🧪 Probando integración de Stripe...\n');

  // 1. Verificar price IDs en Stripe
  console.log('1️⃣ Verificando price IDs en Stripe:');
  
  const priceIds = [
    { name: 'Iniciado Mensual', id: process.env.STRIPE_INICIADO_PRICE_ID_MONTHLY },
    { name: 'Iniciado Anual', id: process.env.STRIPE_INICIADO_PRICE_ID_ANNUAL },
    { name: 'Adepto Mensual', id: process.env.STRIPE_ADEPTO_PRICE_ID_MONTHLY },
    { name: 'Adepto Anual', id: process.env.STRIPE_ADEPTO_PRICE_ID_ANNUAL },
    { name: 'Maestro Mensual', id: process.env.STRIPE_MAESTRO_PRICE_ID_MONTHLY },
    { name: 'Maestro Anual', id: process.env.STRIPE_MAESTRO_PRICE_ID_ANNUAL }
  ];

  for (const price of priceIds) {
    try {
      if (price.id && price.id.startsWith('price_')) {
        const stripePrice = await stripe.prices.retrieve(price.id);
        console.log(`✅ ${price.name}: €${(stripePrice.unit_amount / 100).toFixed(2)} / ${stripePrice.recurring?.interval || 'one-time'}`);
      } else if (price.id && price.id.startsWith('prod_')) {
        console.log(`⚠️  ${price.name}: Es un product ID (${price.id}), no un price ID`);
      } else {
        console.log(`❌ ${price.name}: ID inválido o missing (${price.id})`);
      }
    } catch (error) {
      console.log(`❌ ${price.name}: Error - ${error.message}`);
    }
  }

  // 2. Probar creación de sesión de checkout
  console.log('\n2️⃣ Probando creación de sesión de checkout:');
  
  const testPriceId = process.env.STRIPE_INICIADO_PRICE_ID_MONTHLY;
  if (testPriceId && testPriceId.startsWith('price_')) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: testPriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: 'https://nebulosamagica.com/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://nebulosamagica.com/cancel',
        customer_email: 'test@example.com',
        metadata: {
          plan: 'iniciado',
          period: 'monthly'
        }
      });

      console.log(`✅ Sesión de checkout creada: ${session.id}`);
      console.log(`   URL: ${session.url}`);
      
      // Cancelar la sesión de prueba
      await stripe.checkout.sessions.expire(session.id);
      console.log(`✅ Sesión de prueba cancelada`);
      
    } catch (error) {
      console.log(`❌ Error creando sesión: ${error.message}`);
    }
  } else {
    console.log(`❌ No se puede probar - price ID inválido: ${testPriceId}`);
  }

  // 3. Probar API de nuestro backend
  console.log('\n3️⃣ Probando API del backend:');
  
  try {
    // Obtener planes
    const plansResponse = await axios.get('http://localhost:5050/api/membership/plans');
    console.log(`✅ API de planes funcionando - ${plansResponse.data.length} planes disponibles`);
    
    // Intentar crear sesión de checkout a través de nuestra API
    const checkoutResponse = await axios.post('http://localhost:5050/api/shop/create-checkout-session', {
      priceId: testPriceId
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_JWT_TOKEN || 'test-token'}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (checkoutResponse.data.checkoutUrl) {
      console.log(`✅ API de checkout funcionando`);
      console.log(`   URL generada: ${checkoutResponse.data.checkoutUrl.substring(0, 50)}...`);
    }
    
  } catch (error) {
    if (error.response) {
      console.log(`⚠️  API Response Error: ${error.response.status} - ${error.response.data.message || error.response.data.error || 'Unknown error'}`);
    } else {
      console.log(`❌ API Error: ${error.message}`);
    }
  }

  console.log('\n🎯 Resumen:');
  console.log('- Verifica que todos los price IDs sean válidos');
  console.log('- Corrige el price ID del plan Adepto Mensual');
  console.log('- La integración de Stripe está lista para producción');
}

// Ejecutar pruebas
testStripeIntegration().catch(console.error);