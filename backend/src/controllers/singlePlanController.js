// Controlador de suscripciones simplificado para plan único
import Stripe from 'stripe';
import prisma from '../config/database.js';
import { config } from '../config/config.js';
import { SINGLE_PLAN_CONFIG } from '../config/singlePlanConfig.js';
import { getUserPlanStatus, getUserSubscriptionInfo } from '../middleware/singlePlanLimits.js';

const stripe = new Stripe(config.stripe.secretKey);

// Crear sesión de checkout para suscripción PREMIUM
const createSinglePlanCheckout = async (req, res) => {
  try {
    const { billingCycle = 'monthly', successUrl, cancelUrl } = req.body;
    const userId = req.member?.id;

    if (!userId) {
      return res.status(401).json({
        message: 'Usuario no autenticado'
      });
    }

    // Solo hay un plan: PREMIUM
    const planConfig = SINGLE_PLAN_CONFIG.PREMIUM;
    const priceConfig = billingCycle === 'annual' ? planConfig.annual : planConfig.monthly;

    // Verificar si el usuario ya tiene una suscripción activa
    const existingSubscription = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        stripeSubscriptionId: true,
        subscriptionStatus: true,
        email: true,
        stripeCustomerId: true
      }
    });

    if (existingSubscription?.subscriptionStatus === 'active') {
      return res.status(400).json({
        message: 'Ya tienes una suscripción activa',
        currentPlan: 'PREMIUM'
      });
    }

    // Crear o recuperar customer de Stripe
    let customerId = existingSubscription?.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: existingSubscription.email,
        metadata: {
          userId: userId.toString(),
          plan: 'PREMIUM'
        }
      });
      
      customerId = customer.id;
      
      // Actualizar usuario con customerId
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId }
      });
    }

    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceConfig.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      
      // URLs de redirección
      success_url: successUrl || `${config.frontend.url}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: cancelUrl || `${config.frontend.url}/pricing?canceled=true`,
      
      // Trial de 7 días incluido automáticamente por la configuración del precio
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          userId: userId.toString(),
          plan: 'PREMIUM',
          billingCycle
        }
      },
      
      // Información adicional
      customer_update: {
        address: 'auto',
      },
      
      metadata: {
        userId: userId.toString(),
        plan: 'PREMIUM',
        billingCycle
      }
    });

    console.log(`Checkout session created for user ${userId}:`, {
      sessionId: session.id,
      customerId,
      priceId: priceConfig.priceId,
      billingCycle,
      trialDays: 7
    });

    res.json({
      sessionId: session.id,
      checkoutUrl: session.url,
      plan: 'PREMIUM',
      billingCycle,
      price: priceConfig.price,
      currency: priceConfig.currency,
      trialDays: 7
    });

  } catch (error) {
    console.error('Error creating single plan checkout:', error);
    res.status(500).json({
      message: 'Error al crear sesión de pago',
      error: error.message
    });
  }
};

// Verificar el estado del checkout
const verifyCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.member?.id;

    if (!userId || !sessionId) {
      return res.status(400).json({ 
        message: 'SessionId y usuario requeridos' 
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.userId !== userId.toString()) {
      return res.status(403).json({ 
        message: 'Sesión no autorizada para este usuario' 
      });
    }

    if (session.payment_status === 'paid') {
      // Verificar que la suscripción se haya creado correctamente
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      
      // Actualizar usuario en base de datos
      await prisma.user.update({
        where: { id: userId },
        data: {
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          subscriptionPlan: 'PREMIUM',
          // Mantener fechas de trial si está en período de prueba
          ...(subscription.status === 'trialing' ? {
            trialStartDate: new Date(subscription.trial_start * 1000),
            trialEndDate: new Date(subscription.trial_end * 1000)
          } : {})
        }
      });

      console.log(`Subscription activated for user ${userId}:`, {
        subscriptionId: subscription.id,
        status: subscription.status,
        isTrialing: subscription.status === 'trialing',
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
      });
    }

    res.json({
      sessionId,
      paymentStatus: session.payment_status,
      subscriptionStatus: session.subscription ? (await stripe.subscriptions.retrieve(session.subscription)).status : null,
      plan: 'PREMIUM'
    });

  } catch (error) {
    console.error('Error verifying checkout session:', error);
    res.status(500).json({
      message: 'Error verificando sesión de pago',
      error: error.message
    });
  }
};

// Obtener información del plan del usuario
const getUserPlan = async (req, res) => {
  try {
    const userId = req.member?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const subscriptionInfo = await getUserSubscriptionInfo(userId);
    
    if (!subscriptionInfo) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(subscriptionInfo);

  } catch (error) {
    console.error('Error getting user plan:', error);
    res.status(500).json({
      message: 'Error obteniendo información del plan',
      error: error.message
    });
  }
};

// Activar trial para nuevos usuarios
const activateTrial = async (req, res) => {
  try {
    const userId = req.member?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        trialStartDate: true,
        trialEndDate: true,
        subscriptionStatus: true,
        stripeSubscriptionId: true
      }
    });

    // Verificar si ya tiene trial activo o suscripción
    if (user.subscriptionStatus === 'active') {
      return res.status(400).json({
        message: 'Ya tienes una suscripción premium activa'
      });
    }

    if (user.trialStartDate) {
      return res.status(400).json({
        message: 'Ya has usado tu prueba gratuita'
      });
    }

    // Activar trial de 7 días
    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialStartDate.getDate() + 7);

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionPlan: 'TRIAL',
        trialStartDate,
        trialEndDate
      }
    });

    console.log(`Trial activated for user ${userId}:`, {
      startDate: trialStartDate,
      endDate: trialEndDate
    });

    res.json({
      message: '¡Prueba gratuita activada!',
      trialStartDate,
      trialEndDate,
      daysRemaining: 7,
      planStatus: 'TRIAL'
    });

  } catch (error) {
    console.error('Error activating trial:', error);
    res.status(500).json({
      message: 'Error activando prueba gratuita',
      error: error.message
    });
  }
};

// Cancelar suscripción
const cancelSubscription = async (req, res) => {
  try {
    const userId = req.member?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        stripeSubscriptionId: true,
        subscriptionStatus: true
      }
    });

    if (!user.stripeSubscriptionId || user.subscriptionStatus !== 'active') {
      return res.status(400).json({
        message: 'No tienes una suscripción activa para cancelar'
      });
    }

    // Cancelar suscripción en Stripe (al final del período)
    const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    // Actualizar estado en base de datos
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'canceled'  // Mantendrá acceso hasta el final del período
      }
    });

    console.log(`Subscription canceled for user ${userId}:`, {
      subscriptionId: user.stripeSubscriptionId,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    });

    res.json({
      message: 'Suscripción cancelada correctamente',
      accessUntil: new Date(subscription.current_period_end * 1000),
      subscriptionStatus: 'canceled'
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({
      message: 'Error cancelando suscripción',
      error: error.message
    });
  }
};

// Webhook para manejar eventos de Stripe
const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = config.stripe.webhookSecret;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('Stripe webhook received:', event.type);

    // Manejar eventos relevantes
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Funciones auxiliares para manejar webhooks
const handleSubscriptionUpdate = async (subscription) => {
  try {
    const userId = parseInt(subscription.metadata?.userId);
    if (!userId) return;

    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionPlan: subscription.status === 'active' || subscription.status === 'trialing' ? 'PREMIUM' : 'EXPIRED'
      }
    });

    console.log(`Subscription updated for user ${userId}:`, {
      subscriptionId: subscription.id,
      status: subscription.status
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
};

const handleSubscriptionDeleted = async (subscription) => {
  try {
    const userId = parseInt(subscription.metadata?.userId);
    if (!userId) return;

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'canceled',
        subscriptionPlan: 'EXPIRED'
      }
    });

    console.log(`Subscription deleted for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
};

const handlePaymentSucceeded = async (invoice) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const userId = parseInt(subscription.metadata?.userId);
    
    if (!userId) return;

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'active',
        subscriptionPlan: 'PREMIUM'
      }
    });

    console.log(`Payment succeeded for user ${userId}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
};

const handlePaymentFailed = async (invoice) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const userId = parseInt(subscription.metadata?.userId);
    
    if (!userId) return;

    // No cambiar inmediatamente a EXPIRED, dejar que Stripe maneje los reintentos
    console.log(`Payment failed for user ${userId} - Stripe will handle retries`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
};

export {
  createSinglePlanCheckout,
  verifyCheckoutSession,
  getUserPlan,
  activateTrial,
  cancelSubscription,
  handleStripeWebhook
};