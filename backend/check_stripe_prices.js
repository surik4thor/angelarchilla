// Script para verificar precios activos en Stripe
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkPrices() {
  try {
    console.log('🔍 Verificando precios activos en Stripe...\n');
    
    // Listar todos los precios activos
    const prices = await stripe.prices.list({
      active: true,
      limit: 20
    });
    
    console.log('📋 Precios activos encontrados:');
    console.log('=====================================');
    
    prices.data.forEach((price, index) => {
      console.log(`${index + 1}. ID: ${price.id}`);
      console.log(`   Producto: ${price.product}`);
      console.log(`   Monto: ${price.unit_amount ? (price.unit_amount / 100) : 'N/A'} ${price.currency?.toUpperCase()}`);
      console.log(`   Intervalo: ${price.recurring?.interval || 'one-time'}`);
      console.log(`   Nickname: ${price.nickname || 'Sin nombre'}`);
      console.log(`   Activo: ${price.active}`);
      console.log('   ---');
    });
    
    // Verificar precios específicos del .env
    console.log('\n🔍 Verificando precios del .env...');
    console.log('=====================================');
    
    const envPrices = [
      'STRIPE_ESENCIAL_PRICE_ID_MONTHLY',
      'STRIPE_ESENCIAL_PRICE_ID_ANNUAL', 
      'STRIPE_PREMIUM_PRICE_ID_MONTHLY',
      'STRIPE_PREMIUM_PRICE_ID_ANNUAL'
    ];
    
    for (const envVar of envPrices) {
      const priceId = process.env[envVar];
      if (priceId) {
        try {
          const price = await stripe.prices.retrieve(priceId);
          console.log(`✅ ${envVar}: ${priceId}`);
          console.log(`   Estado: ${price.active ? 'ACTIVO' : 'INACTIVO'}`);
          console.log(`   Monto: ${price.unit_amount ? (price.unit_amount / 100) : 'N/A'} ${price.currency?.toUpperCase()}`);
        } catch (error) {
          console.log(`❌ ${envVar}: ${priceId}`);
          console.log(`   Error: ${error.message}`);
        }
        console.log('');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPrices();