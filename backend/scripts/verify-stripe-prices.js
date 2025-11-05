import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function verifyAndCreatePrices() {
  console.log('🔍 Verificando precios de Stripe...\n');

  const expectedPrices = [
    {
      name: 'Iniciado Mensual',
      amount: 399, // €3.99 en centavos
      interval: 'month',
      envKey: 'STRIPE_INICIADO_PRICE_ID_MONTHLY'
    },
    {
      name: 'Iniciado Anual', 
      amount: 3990, // €39.90 en centavos
      interval: 'year',
      envKey: 'STRIPE_INICIADO_PRICE_ID_ANNUAL'
    },
    {
      name: 'Adepto Mensual',
      amount: 999, // €9.99 en centavos
      interval: 'month', 
      envKey: 'STRIPE_ADEPTO_PRICE_ID_MONTHLY'
    },
    {
      name: 'Adepto Anual',
      amount: 9990, // €99.90 en centavos
      interval: 'year',
      envKey: 'STRIPE_ADEPTO_PRICE_ID_ANNUAL'
    },
    {
      name: 'Maestro Mensual',
      amount: 1799, // €17.99 en centavos
      interval: 'month',
      envKey: 'STRIPE_MAESTRO_PRICE_ID_MONTHLY'
    },
    {
      name: 'Maestro Anual',
      amount: 17990, // €179.90 en centavos
      interval: 'year',
      envKey: 'STRIPE_MAESTRO_PRICE_ID_ANNUAL'
    }
  ];

  for (const expectedPrice of expectedPrices) {
    const priceId = process.env[expectedPrice.envKey];
    
    if (priceId) {
      try {
        const price = await stripe.prices.retrieve(priceId);
        console.log(`✅ ${expectedPrice.name}:`);
        console.log(`   Price ID: ${price.id}`);
        console.log(`   Precio actual: €${(price.unit_amount / 100).toFixed(2)}`);
        console.log(`   Precio esperado: €${(expectedPrice.amount / 100).toFixed(2)}`);
        console.log(`   Intervalo: ${price.recurring?.interval || 'N/A'}`);
        
        if (price.unit_amount !== expectedPrice.amount) {
          console.log(`   ⚠️  PRECIO INCORRECTO - Necesita actualización`);
        } else {
          console.log(`   ✅ PRECIO CORRECTO`);
        }
        console.log('');
      } catch (error) {
        console.log(`❌ Error al verificar ${expectedPrice.name}: ${error.message}\n`);
      }
    } else {
      console.log(`⚠️  ${expectedPrice.name}: NO CONFIGURADO (${expectedPrice.envKey} no encontrado)\n`);
    }
  }

  // Verificar producto base
  try {
    const products = await stripe.products.list({ limit: 10 });
    console.log(`📦 Productos encontrados: ${products.data.length}`);
    
    products.data.forEach(product => {
      console.log(`   - ${product.name} (${product.id})`);
    });
  } catch (error) {
    console.log(`❌ Error al listar productos: ${error.message}`);
  }
}

async function createMissingProduct() {
  try {
    const products = await stripe.products.list({ limit: 10 });
    const nebulosaMagicaProduct = products.data.find(p => 
      p.name.includes('Nebulosa') || p.name.includes('Subscription')
    );

    if (!nebulosaMagicaProduct) {
      console.log('\n🏗️  Creando producto base...');
      const product = await stripe.products.create({
        name: 'Nebulosa Mágica - Suscripción',
        description: 'Planes de suscripción para Nebulosa Mágica - Lecturas esotéricas premium'
      });
      console.log(`✅ Producto creado: ${product.name} (${product.id})`);
      return product.id;
    } else {
      console.log(`\n📦 Producto existente: ${nebulosaMagicaProduct.name} (${nebulosaMagicaProduct.id})`);
      return nebulosaMagicaProduct.id;
    }
  } catch (error) {
    console.log(`❌ Error al crear/verificar producto: ${error.message}`);
    return null;
  }
}

// Ejecutar verificación
verifyAndCreatePrices()
  .then(() => createMissingProduct())
  .then((productId) => {
    if (productId) {
      console.log(`\n🎯 Producto ID para crear precios: ${productId}`);
      console.log('\nPara crear precios nuevos, usa:');
      console.log(`stripe prices create --product ${productId} --unit-amount 399 --currency eur --recurring interval=month`);
    }
  })
  .catch(console.error);