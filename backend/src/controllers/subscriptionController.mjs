import Stripe from 'stripe';
import { config } from '../config/config.js';
import prisma from '../config/database.js';
import fetch from 'node-fetch';

const stripe = new Stripe(config.stripe.secretKey);

// Definición de planes de suscripción
const SUBSCRIPTION_PLANS = {
  INICIADO: {
    name: 'Iniciado',
    priceId: process.env.STRIPE_PRICE_INICIADO, // Configurar en .env
    features: ['4 lecturas por mes', 'Acceso básico'],
    maxReadingsPerMonth: 4,
    hasHistory: false,
    hasDreams: false,
    hasPartnerSync: false
  },
  ADEPTO: {
    name: 'Adepto',
    priceId: process.env.STRIPE_PRICE_ADEPTO, // Configurar en .env
    features: ['1 lectura por día', 'Historial completo', 'Herramientas de seguimiento'],
    maxReadingsPerDay: 1,
    hasHistory: true,
    hasDreams: false,
    hasPartnerSync: false
  },
  MAESTRO: {
    name: 'Maestro',
    priceId: process.env.STRIPE_PRICE_MAESTRO, // Configurar en .env
    features: ['Lecturas ilimitadas', 'Interpretación de sueños', 'Sincronización de pareja'],
    maxReadingsPerDay: 999,
    hasHistory: true,
    hasDreams: true,
    hasPartnerSync: true
  }
};

// Crear sesión de checkout para suscripción
export const createSubscriptionCheckoutSession = async (req, res) => {
  try {
    const { planType } = req.body;
    
    if (!SUBSCRIPTION_PLANS[planType]) {
      return res.status(400).json({ error: 'Plan de suscripción no válido' });
    }

    const plan = SUBSCRIPTION_PLANS[planType];
    
    if (!plan.priceId) {
      return res.status(500).json({ error: 'Plan no configurado en Stripe' });
    }

    // Verificar si el usuario ya tiene una suscripción activa
    const user = await prisma.user.findUnique({
      where: { id: req.member.id }
    });

    if (user.stripeCustomerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: 'active'
      });

      if (subscriptions.data.length > 0) {
        return res.status(400).json({ error: 'Ya tienes una suscripción activa' });
      }
    }

    // Crear o recuperar customer de Stripe
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.member.email,
        name: req.member.username,
        metadata: {
          userId: req.member.id
        }
      });
      
      customerId = customer.id;
      
      // Actualizar usuario con el ID del customer
      await prisma.user.update({
        where: { id: req.member.id },
        data: { stripeCustomerId: customerId }
      });
    }

    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: plan.priceId,
        quantity: 1
      }],
      success_url: `${config.server.frontendUrl}/profile?subscription_success=true`,
      cancel_url: `${config.server.frontendUrl}/profile?subscription_cancel=true`,
      metadata: {
        userId: req.member.id,
        planType: planType
      }
    });

    res.json({ 
      checkoutUrl: session.url,
      plan: {
        name: plan.name,
        features: plan.features
      }
    });

  } catch (err) {
    console.error('Error createSubscriptionCheckoutSession:', err);
    res.status(500).json({ error: 'Error creando sesión de suscripción' });
  }
};

// Listar planes disponibles
export const listSubscriptionPlans = async (req, res) => {
  try {
    const plans = Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
      id: key,
      name: plan.name,
      features: plan.features,
      active: !!plan.priceId
    }));

    res.json({ plans });
  } catch (err) {
    console.error('Error listSubscriptionPlans:', err);
    res.status(500).json({ error: 'Error obteniendo planes' });
  }
};

// Obtener suscripción actual del usuario
export const getCurrentSubscription = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.member.id }
    });

    if (!user.stripeCustomerId) {
      return res.json({ subscription: null });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
      limit: 1
    });

    if (subscriptions.data.length === 0) {
      return res.json({ subscription: null });
    }

    const subscription = subscriptions.data[0];
    const planType = subscription.metadata?.planType || 'INICIADO';
    
    res.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        planType: planType,
        planName: SUBSCRIPTION_PLANS[planType]?.name || 'Plan Desconocido'
      }
    });

  } catch (err) {
    console.error('Error getCurrentSubscription:', err);
    res.status(500).json({ error: 'Error obteniendo suscripción' });
  }
};

// Cancelar suscripción
export const cancelSubscription = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.member.id }
    });

    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: 'No tienes una suscripción activa' });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active'
    });

    if (subscriptions.data.length === 0) {
      return res.status(400).json({ error: 'No tienes una suscripción activa' });
    }

    const subscription = subscriptions.data[0];
    
    // Cancelar al final del período actual
    const canceledSubscription = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true
    });

    res.json({
      message: 'Suscripción cancelada. Permanecerá activa hasta el final del período actual.',
      endsAt: canceledSubscription.current_period_end
    });

  } catch (err) {
    console.error('Error cancelSubscription:', err);
    res.status(500).json({ error: 'Error cancelando suscripción' });
  }
};

// Webhook de Stripe para manejar eventos de suscripción
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        if (session.mode === 'subscription') {
          await handleSubscriptionCreated(session);
        }
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        await handleSubscriptionChanged(subscription);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    res.status(500).json({ error: 'Error processing webhook' });
  }
};

// Funciones auxiliares para manejar eventos de Stripe
async function handleSubscriptionCreated(session) {
  const userId = session.metadata?.userId;
  const planType = session.metadata?.planType;

  if (userId && planType) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionType: planType,
        subscriptionStatus: 'ACTIVE'
      }
    });

    // Enviar notificación a Discord si está configurado
    await sendDiscordNotification(`✅ Nueva suscripción: Usuario ${userId} se suscribió al plan ${planType}`);
  }
}

async function handleSubscriptionChanged(subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer);
  const userId = customer.metadata?.userId;

  if (userId) {
    const status = subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE';
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: status
      }
    });

    await sendDiscordNotification(`🔄 Suscripción actualizada: Usuario ${userId} - Estado: ${status}`);
  }
}

async function sendDiscordNotification(message) {
  const webhook = process.env.DISCORD_WEBHOOK_SUBSCRIPTIONS;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
      });
    } catch (err) {
      console.error('Error sending Discord notification:', err);
    }
  }
}

// Verificar límites de suscripción (middleware)
export const checkSubscriptionLimits = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.member.id }
    });

    if (!user.subscriptionType || user.subscriptionStatus !== 'ACTIVE') {
      return res.status(403).json({ error: 'Se requiere una suscripción activa' });
    }

    const plan = SUBSCRIPTION_PLANS[user.subscriptionType];
    
    // Verificar límites según el tipo de operación
    const operation = req.body.operation || req.params.operation;
    
    if (operation === 'reading') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const readingsToday = await prisma.reading.count({
        where: {
          userId: req.member.id,
          createdAt: {
            gte: today
          }
        }
      });

      if (plan.maxReadingsPerDay && readingsToday >= plan.maxReadingsPerDay) {
        return res.status(403).json({ error: 'Has alcanzado el límite diario de lecturas' });
      }

      if (plan.maxReadingsPerMonth) {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const readingsThisMonth = await prisma.reading.count({
          where: {
            userId: req.member.id,
            createdAt: {
              gte: startOfMonth
            }
          }
        });

        if (readingsThisMonth >= plan.maxReadingsPerMonth) {
          return res.status(403).json({ error: 'Has alcanzado el límite mensual de lecturas' });
        }
      }
    }

    if (operation === 'dream' && !plan.hasDreams) {
      return res.status(403).json({ error: 'La interpretación de sueños requiere el plan Maestro' });
    }

    if (operation === 'partner_sync' && !plan.hasPartnerSync) {
      return res.status(403).json({ error: 'La sincronización de pareja requiere el plan Maestro' });
    }

    req.userPlan = plan;
    next();

  } catch (err) {
    console.error('Error checkSubscriptionLimits:', err);
    res.status(500).json({ error: 'Error verificando límites de suscripción' });
  }
};