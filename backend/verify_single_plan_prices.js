import Stripe from 'stripe';
import { config } from './src/config/config.js';

const stripe = new Stripe(config.stripe.secretKey);

async function verifyAndSetupSinglePlanPrices() {
  try {
    console.log('🔍 Verificando precios de Stripe...');
    
    // Precios actuales de Premium que usaremos como plan único
    const monthlyPriceId = config.membership.premium.stripeIdMonthly;
    const annualPriceId = config.membership.premium.stripeIdAnnual;
    
    console.log(`Precio mensual: ${monthlyPriceId}`);
    console.log(`Precio anual: ${annualPriceId}`);
    
    // Verificar precios actuales
    const monthlyPrice = await stripe.prices.retrieve(monthlyPriceId);
    const annualPrice = await stripe.prices.retrieve(annualPriceId);
    
    console.log('\n📋 Información del precio mensual:');
    console.log(`- ID: ${monthlyPrice.id}`);
    console.log(`- Activo: ${monthlyPrice.active}`);
    console.log(`- Cantidad: €${monthlyPrice.unit_amount / 100}`);
    console.log(`- Intervalo: ${monthlyPrice.recurring.interval}`);
    console.log(`- Trial period days: ${monthlyPrice.recurring.trial_period_days || 'No configurado'}`);
    
    console.log('\n📋 Información del precio anual:');
    console.log(`- ID: ${annualPrice.id}`);
    console.log(`- Activo: ${annualPrice.active}`);
    console.log(`- Cantidad: €${annualPrice.unit_amount / 100}`);
    console.log(`- Intervalo: ${annualPrice.recurring.interval}`);
    console.log(`- Trial period days: ${annualPrice.recurring.trial_period_days || 'No configurado'}`);
    
    // Verificar si necesitamos crear nuevos precios con trial
    let needsNewMonthlyPrice = false;
    let needsNewAnnualPrice = false;
    
    if (!monthlyPrice.recurring.trial_period_days || monthlyPrice.recurring.trial_period_days !== 7) {
      console.log('\n⚠️ El precio mensual no tiene trial de 7 días configurado');
      needsNewMonthlyPrice = true;
    }
    
    if (!annualPrice.recurring.trial_period_days || annualPrice.recurring.trial_period_days !== 7) {
      console.log('⚠️ El precio anual no tiene trial de 7 días configurado');
      needsNewAnnualPrice = true;
    }
    
    // Obtener o crear producto para plan único
    let product = await getOrCreateSinglePlanProduct();
    
    // Crear nuevos precios con trial si es necesario
    if (needsNewMonthlyPrice) {
      const newMonthlyPrice = await createPriceWithTrial(product.id, 900, 'month'); // €9.00
      console.log(`✅ Nuevo precio mensual creado con trial: ${newMonthlyPrice.id}`);
    }
    
    if (needsNewAnnualPrice) {
      const newAnnualPrice = await createPriceWithTrial(product.id, 9000, 'year'); // €90.00
      console.log(`✅ Nuevo precio anual creado con trial: ${newAnnualPrice.id}`);
    }
    
    if (!needsNewMonthlyPrice && !needsNewAnnualPrice) {
      console.log('\n✅ Los precios actuales ya están configurados correctamente');
    }
    
    console.log('\n🎯 Plan único configurado correctamente');
    
  } catch (error) {
    console.error('❌ Error verificando precios:', error);
  }
}

async function getOrCreateSinglePlanProduct() {
  try {
    // Buscar producto existente
    const products = await stripe.products.list({
      limit: 10
    });
    
    // Buscar producto "Premium" o crear uno nuevo
    let product = products.data.find(p => p.name.includes('Premium') || p.name.includes('Nebulosa'));
    
    if (!product) {
      console.log('🆕 Creando producto para plan único...');
      product = await stripe.products.create({
        name: 'Nebulosa Mágica Premium',
        description: 'Acceso completo e ilimitado a todas las funciones de la plataforma',
        metadata: {
          type: 'single_plan',
          version: '2.0'
        }
      });
      console.log(`✅ Producto creado: ${product.id}`);
    } else {
      console.log(`📦 Usando producto existente: ${product.id} - ${product.name}`);
    }
    
    return product;
  } catch (error) {
    console.error('Error manejando producto:', error);
    throw error;
  }
}

async function createPriceWithTrial(productId, unitAmount, interval) {
  try {
    const price = await stripe.prices.create({
      unit_amount: unitAmount, // en centavos
      currency: 'eur',
      recurring: {
        interval: interval, // 'month' o 'year'
        trial_period_days: 7
      },
      product: productId,
      metadata: {
        plan_type: 'single_premium',
        trial_enabled: 'true'
      }
    });
    
    return price;
  } catch (error) {
    console.error('Error creando precio:', error);
    throw error;
  }
}

// Ejecutar script
verifyAndSetupSinglePlanPrices();