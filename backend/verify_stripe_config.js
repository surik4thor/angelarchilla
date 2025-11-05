import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function verifyStripeConfig() {
  try {
    console.log('🔍 Verificando precios de Stripe...\n');
    
    const priceIds = [
      { name: 'ESENCIAL Monthly', id: process.env.STRIPE_ESENCIAL_PRICE_ID_MONTHLY },
      { name: 'ESENCIAL Annual', id: process.env.STRIPE_ESENCIAL_PRICE_ID_ANNUAL },
      { name: 'PREMIUM Monthly', id: process.env.STRIPE_PREMIUM_PRICE_ID_MONTHLY },
      { name: 'PREMIUM Annual', id: process.env.STRIPE_PREMIUM_PRICE_ID_ANNUAL }
    ];

    let allActive = true;

    for (const priceInfo of priceIds) {
      if (!priceInfo.id) {
        console.log(`❌ ${priceInfo.name}: ID no configurado`);
        allActive = false;
        continue;
      }

      try {
        const price = await stripe.prices.retrieve(priceInfo.id);
        const amount = (price.unit_amount / 100).toFixed(2);
        const currency = price.currency.toUpperCase();
        const interval = price.recurring ? price.recurring.interval : 'one-time';
        
        console.log(`✅ ${priceInfo.name}: €${amount} ${currency}/${interval} - ${price.active ? 'ACTIVO' : 'INACTIVO'}`);
        
        if (!price.active) {
          allActive = false;
        }
      } catch (error) {
        console.log(`❌ ${priceInfo.name}: Error - ${error.message}`);
        allActive = false;
      }
    }

    console.log(`\n📊 Resultado: ${allActive ? '✅ Todos los precios están configurados y activos' : '❌ Hay problemas con algunos precios'}`);
    
    if (allActive) {
      console.log('\n🎯 ¡El sistema de suscripciones está listo para funcionar!');
    } else {
      console.log('\n⚠️  Revisa los precios inactivos o mal configurados en Stripe');
    }

  } catch (error) {
    console.error('💥 Error verificando configuración de Stripe:', error.message);
  }
}

verifyStripeConfig();