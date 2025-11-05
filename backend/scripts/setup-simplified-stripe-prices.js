#!/usr/bin/env node
/**
 * Setup Simplified Stripe Prices para Estructura 3-Tier
 * Crear precios para ESENCIAL (€4.99) y PREMIUM (€9.99)
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setupSimplifiedPlans() {
  console.log('🚀 Configurando estructura simplificada de planes en Stripe...\n');

  try {
    // 1. Crear o verificar producto principal
    let product;
    const existingProducts = await stripe.products.list({ limit: 20 });
    product = existingProducts.data.find(p => 
      p.name.includes('Nebulosa Mágica') || p.name.includes('Arcana Club')
    );

    if (!product) {
      product = await stripe.products.create({
        name: 'Nebulosa Mágica - Membresía',
        description: 'Acceso completo a lecturas de tarot, runas, horóscopos y más',
        metadata: {
          simplified_structure: 'true',
          version: '3.0'
        }
      });
      console.log('✅ Producto creado:', product.id);
    } else {
      console.log('✅ Producto encontrado:', product.id);
    }

    // 2. Configurar precios para ESENCIAL
    console.log('\n📊 Configurando precios ESENCIAL (€4.99)...');
    
    const esencialMonthly = await stripe.prices.create({
      product: product.id,
      unit_amount: 499, // €4.99 en centimos
      currency: 'eur',
      recurring: {
        interval: 'month'
      },
      nickname: 'ESENCIAL_MONTHLY',
      metadata: {
        plan_tier: 'esencial',
        billing_period: 'monthly',
        max_readings: '15',
        features: 'all_decks,history,personalized_horoscopes'
      }
    });
    console.log(`✅ ESENCIAL Monthly: ${esencialMonthly.id}`);

    const esencialAnnual = await stripe.prices.create({
      product: product.id,
      unit_amount: 4990, // €49.90 (ahorro de 2 meses)
      currency: 'eur',
      recurring: {
        interval: 'year'
      },
      nickname: 'ESENCIAL_ANNUAL',
      metadata: {
        plan_tier: 'esencial',
        billing_period: 'annual',
        max_readings: '15',
        features: 'all_decks,history,personalized_horoscopes',
        savings: '2_months_free'
      }
    });
    console.log(`✅ ESENCIAL Annual: ${esencialAnnual.id}`);

    // 3. Configurar precios para PREMIUM
    console.log('\n🔮 Configurando precios PREMIUM (€9.99)...');
    
    const premiumMonthly = await stripe.prices.create({
      product: product.id,
      unit_amount: 999, // €9.99 en centimos (barrera psicológica <€10)
      currency: 'eur',
      recurring: {
        interval: 'month'
      },
      nickname: 'PREMIUM_MONTHLY',
      metadata: {
        plan_tier: 'premium',
        billing_period: 'monthly',
        max_readings: 'unlimited',
        features: 'unlimited_readings,dreams,natal_charts,vip_support,pdf_export'
      }
    });
    console.log(`✅ PREMIUM Monthly: ${premiumMonthly.id}`);

    const premiumAnnual = await stripe.prices.create({
      product: product.id,
      unit_amount: 9990, // €99.90 (ahorro de 2 meses)
      currency: 'eur',
      recurring: {
        interval: 'year'
      },
      nickname: 'PREMIUM_ANNUAL',
      metadata: {
        plan_tier: 'premium',
        billing_period: 'annual',
        max_readings: 'unlimited',
        features: 'unlimited_readings,dreams,natal_charts,vip_support,pdf_export',
        savings: '2_months_free'
      }
    });
    console.log(`✅ PREMIUM Annual: ${premiumAnnual.id}`);

    // 4. Generar configuración de entorno
    console.log('\n🔧 Variables de entorno para el .env:');
    console.log('# === ESTRUCTURA SIMPLIFICADA 3-TIER ===');
    console.log(`STRIPE_ESENCIAL_PRICE_ID_MONTHLY=${esencialMonthly.id}`);
    console.log(`STRIPE_ESENCIAL_PRICE_ID_ANNUAL=${esencialAnnual.id}`);
    console.log(`STRIPE_PREMIUM_PRICE_ID_MONTHLY=${premiumMonthly.id}`);
    console.log(`STRIPE_PREMIUM_PRICE_ID_ANNUAL=${premiumAnnual.id}`);

    // 5. Generar resumen de migración
    console.log('\n📋 RESUMEN DE LA MIGRACIÓN:');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│ ESTRUCTURA ANTERIOR → NUEVA ESTRUCTURA                     │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ INVITADO (€0.00)     → INVITADO (€0.00) - Sin cambios     │');
    console.log('│ INICIADO (€3.99)     → ESENCIAL (€4.99) - Más features    │');
    console.log('│ ADEPTO (€9.99)       → PREMIUM (€9.99) - Mismo precio     │');
    console.log('│ MAESTRO (€17.99)     → PREMIUM (€9.99) - ¡€8 de AHORRO!   │');
    console.log('└─────────────────────────────────────────────────────────────┘');

    console.log('\n✨ VENTAJAS DE LA NUEVA ESTRUCTURA:');
    console.log('• 🧠 Psicología de precios: Premium €9.99 < €10 (barrera mental)');
    console.log('• 🎯 Simplificación: 4 planes → 3 planes (menos confusión)');
    console.log('• 💰 Mejor valor: Usuarios Maestro ahorran €8/mes');
    console.log('• 📈 Conversión esperada: +25% por precio psicológico optimizado');

    console.log('\n🚀 PRÓXIMOS PASOS:');
    console.log('1. Actualizar variables de entorno con los IDs generados');
    console.log('2. Desplegar cambios en el backend');
    console.log('3. Actualizar frontend con nueva estructura de planes');
    console.log('4. Comunicar cambios a usuarios existentes');
    console.log('5. Configurar migración automática de usuarios legacy');

  } catch (error) {
    console.error('❌ Error configurando precios:', error.message);
    process.exit(1);
  }
}

// Verificar configuración antes de ejecutar
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ Error: STRIPE_SECRET_KEY no está configurado');
  process.exit(1);
}

setupSimplifiedPlans();