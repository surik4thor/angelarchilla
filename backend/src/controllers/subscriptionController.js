// backend/src/controllers/subscriptionController.js
import Stripe from 'stripe';
import prisma from '../config/database.js';
import { config } from '../config/config.js';

const stripe = new Stripe(config.stripe.secretKey);

// Crear sesión de checkout para suscripción - ESTRUCTURA SIMPLIFICADA
export const createCheckoutSession = async (req, res) => {
  try {
    const { priceId, planName, billingCycle = 'monthly' } = req.body;
    
    // Validar plan simplificado
    const validPlans = ['esencial', 'premium'];
    if (planName && !validPlans.includes(planName.toLowerCase())) {
      return res.status(400).json({ 
        message: 'Plan no válido. Planes disponibles: ESENCIAL, PREMIUM',
        availablePlans: ['ESENCIAL', 'PREMIUM']
      });
    }

    // Determinar el priceId correcto si no se proporciona
    let finalPriceId = priceId;
    if (!finalPriceId && planName) {
      const planLower = planName.toLowerCase();
      console.log('DEBUG createCheckoutSession:', {
        planName,
        planLower,
        billingCycle,
        esencialMonthly: config.membership.esencial.stripeIdMonthly,
        premiumMonthly: config.membership.premium.stripeIdMonthly
      });
      
      if (billingCycle === 'annual') {
        finalPriceId = planLower === 'esencial' 
          ? config.membership.esencial.stripeIdAnnual 
          : config.membership.premium.stripeIdAnnual;
      } else {
        finalPriceId = planLower === 'esencial'
          ? config.membership.esencial.stripeIdMonthly
          : config.membership.premium.stripeIdMonthly;
      }
      
      console.log('DEBUG finalPriceId:', finalPriceId);
    }

    if (!finalPriceId) {
      return res.status(400).json({
        message: 'priceId requerido o planName válido',
        example: { planName: 'esencial', billingCycle: 'monthly' }
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: finalPriceId, quantity: 1 }],
      customer_email: req.member.email,
      success_url: `${config.server.frontendUrl}/profile?upgraded=true&plan=${planName || 'premium'}`,
      cancel_url: `${config.server.frontendUrl}/pricing?cancelled=true`,
      metadata: {
        simplified_structure: 'true',
        plan_name: planName || 'premium',
        user_id: req.member.id,
        billing_cycle: billingCycle
      },
      // Mejorar UX con información del plan
      ...(planName === 'esencial' && {
        allow_promotion_codes: true, // Permitir códigos de descuento para esencial
      }),
      ...(planName === 'premium' && {
        allow_promotion_codes: true,
        // trial_period_days: 7, // Temporalmente deshabilitado para debug
      })
    });
    
    res.json({ 
      checkoutUrl: session.url,
      sessionId: session.id,
      planInfo: {
        name: planName?.toUpperCase() || 'PREMIUM',
        trial: planName === 'premium' ? '7 días gratis' : null,
        billing: billingCycle,
        priceId: finalPriceId
      }
    });
  } catch (err) {
    console.error('Error createCheckoutSession:', err);
    res.status(500).json({ 
      message: 'Error creando sesión de pago',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Webhook de Stripe
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  // Manejar eventos relevantes de Stripe - ESTRUCTURA SIMPLIFICADA
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const user = await prisma.user.findUnique({ where: { email: session.customer_email } });
    if (user) {
      // Determinar plan basado en metadata o precio
      let planNickname = session.metadata?.plan_name?.toUpperCase() || 'PREMIUM';
      
      // Mapear nicknames de Stripe a estructura simplificada
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const priceNickname = subscription.items.data[0]?.price?.nickname?.toUpperCase();
        
        // Mapeo de precios a nueva estructura
        if (priceNickname?.includes('ESENCIAL')) {
          planNickname = 'ESENCIAL';
        } else if (priceNickname?.includes('PREMIUM')) {
          planNickname = 'PREMIUM';
        }
        // Legacy mapping para compatibilidad
        else if (priceNickname?.includes('INICIADO')) {
          planNickname = 'ESENCIAL'; // Migración automática
        } else if (priceNickname?.includes('ADEPTO') || priceNickname?.includes('MAESTRO')) {
          planNickname = 'PREMIUM'; // Migración automática
        }
      }

      await prisma.subscriptionHistory.create({
        data: {
          userId: user.id,
          plan: planNickname,
          status: 'ACTIVE',
          startDate: new Date(),
          stripeId: session.subscription?.id || session.subscription,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          metadata: {
            simplified_structure: true,
            original_plan: session.metadata?.plan_name,
            session_id: session.id
          }
        }
      });
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionPlan: planNickname,
          subscriptionStatus: 'ACTIVE',
          subscriptionExpiry: null
        }
      });
      
      // Email personalizado según el plan
      try {
        const { sendReportEmail } = await import('../utils/email.js');
        const emailSubject = planNickname === 'ESENCIAL' 
          ? '✨ ¡Bienvenido al plan Esencial de Nebulosa Mágica!'
          : '🔮 ¡Bienvenido al plan Premium de Nebulosa Mágica!';
        
        await sendReportEmail(user.email, emailSubject);
      } catch (err) {
        console.error('Error enviando email de suscripción:', err);
      }
    }
  }

  // Trial: cuando se crea una suscripción con periodo de prueba
  if (event.type === 'customer.subscription.created') {
    const subscription = event.data.object;
    const user = await prisma.user.findUnique({ where: { stripeCustomerId: subscription.customer } });
    if (user) {
      await prisma.subscriptionHistory.create({
        data: {
          userId: user.id,
          plan: subscription.items.data[0]?.price?.nickname?.toUpperCase() || 'PREMIUM',
          status: subscription.status?.toUpperCase() || 'TRIALING',
          startDate: new Date(subscription.start_date * 1000),
          trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          stripeId: subscription.id,
          amount: subscription.items.data[0]?.price?.unit_amount ? subscription.items.data[0].price.unit_amount / 100 : 0
        }
      });
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionPlan: subscription.items.data[0]?.price?.nickname?.toUpperCase() || 'PREMIUM',
          subscriptionStatus: subscription.status?.toUpperCase() || 'TRIALING',
          subscriptionExpiry: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null
        }
      });
      // Email de bienvenida al trial
      try {
        const { sendReportEmail } = await import('../utils/email.js');
        await sendReportEmail(
          user.email,
          '¡Tu periodo de prueba premium ha comenzado!'
        );
      } catch (err) {
        console.error('Error enviando email de trial:', err);
      }
    }
  }

  // Actualización de suscripción
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object;
    const user = await prisma.user.findUnique({ where: { stripeCustomerId: subscription.customer } });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: subscription.status?.toUpperCase(),
          subscriptionExpiry: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null
        }
      });
    }
  }

  // Cancelación de suscripción
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const user = await prisma.user.findUnique({ where: { stripeCustomerId: subscription.customer } });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'CANCELLED',
          subscriptionExpiry: null
        }
      });
      // Email de cancelación
      try {
        const { sendReportEmail } = await import('../utils/email.js');
        await sendReportEmail(
          user.email,
          'Tu suscripción ha sido cancelada. Puedes reactivarla en cualquier momento.'
        );
      } catch (err) {
        console.error('Error enviando email de cancelación:', err);
      }
    }
  }

  res.json({ received: true });
};

// Obtener suscripción del miembro actual
export const getMySubscription = async (req, res) => {
  try {
    const sub = await prisma.subscriptionHistory.findFirst({
      where: { userId: req.member.id },
      orderBy: { startDate: 'desc' }
    });
    res.json({ subscription: sub });
  } catch (err) {
    console.error('Error getMySubscription:', err);
    res.status(500).json({ message: 'Error obteniendo suscripción' });
  }
};