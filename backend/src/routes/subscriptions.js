import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { createCheckoutSession, handleWebhook, getMySubscription } from '../controllers/subscriptionController.js';

const router = express.Router();

// Crear sesión de pago Stripe
router.post('/create-checkout-session', authenticate, createCheckoutSession);
// Webhook Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);
// Obtener datos de suscripción propia
router.get('/me', authenticate, getMySubscription);
// Endpoint público para planes disponibles (mock temporal)
router.get('/plans', (req, res) => {
	res.setHeader(
		'Content-Security-Policy',
		"connect-src 'self' https://region1.google-analytics.com https://www.google-analytics.com https://www.googletagmanager.com;"
	);
	res.json({ plans: [
		{ name: 'BÁSICO', price: 0 },
		{ name: 'PREMIUM', price: 9.99 },
		{ name: 'ADEPTO', price: 29.99 },
		{ name: 'MAESTRO', price: 99.99 }
	] });
});

export default router;