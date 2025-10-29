// backend/src/controllers/subscriptionController.js
import Stripe from 'stripe';
import prisma from '../config/database.js';
import { config } from '../config/config.js';

const stripe = new Stripe(config.stripe.secretKey);

// Crear sesión de checkout para suscripción
export const createCheckoutSession = async (req, res) => {
  try {
    const { priceId } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: req.member.email,
      success_url: `${config.server.frontendUrl}/profile`,
      cancel_url: `${config.server.frontendUrl}/shop`
    });
    res.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error('Error createCheckoutSession:', err);
    res.status(500).json({ message: 'Error creando sesión de pago' });
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

  // Manejar eventos relevantes de Stripe
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const user = await prisma.user.findUnique({ where: { email: session.customer_email } });
    if (user) {
      let planNickname = 'PREMIUM';
      if (session.subscription && session.subscription.items && session.subscription.items.data[0]?.price?.nickname) {
        planNickname = session.subscription.items.data[0].price.nickname.toUpperCase();
      }
      await prisma.subscriptionHistory.create({
        data: {
          userId: user.id,
          plan: planNickname,
          status: 'ACTIVE',
          startDate: new Date(),
          stripeId: session.subscription?.id || session.subscription,
          amount: session.amount_total ? session.amount_total / 100 : 0
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
      // Enviar email de confirmación de suscripción premium
      try {
        const { sendReportEmail } = await import('../utils/email.js');
        await sendReportEmail(
          user.email,
          process.env.SUBSCRIPTION_EMAIL_SUBJECT || '¡Tu suscripción premium está activa!'
        );
      } catch (err) {
        console.error('Error enviando email de suscripción premium:', err);
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