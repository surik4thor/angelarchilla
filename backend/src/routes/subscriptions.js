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
// Endpoint público para planes disponibles - ESTRUCTURA SIMPLIFICADA 3 NIVELES
router.get('/plans', (req, res) => {
	res.setHeader(
		'Content-Security-Policy',
		"connect-src 'self' https://region1.google-analytics.com https://www.google-analytics.com https://www.googletagmanager.com;"
	);
	
	const simplifiedPlans = [
		{ 
			name: 'INVITADO', 
			displayName: 'Explorador Cósmico',
			price: 0, 
			features: ['3 lecturas/mes', 'Baraja básica', 'Horóscopo semanal'],
			limitations: ['Sin historial', 'Sin sueños', 'Sin cartas natales'],
			ctaText: 'Empezar Gratis',
			popular: false
		},
		{ 
			name: 'ESENCIAL', 
			displayName: 'Iniciado Místico',
			price: 4.99,
			priceAnnual: 49.90,
			features: ['15 lecturas/mes', 'Todas las barajas', 'Historial completo', 'Horóscopos personalizados'],
			limitations: ['Sin interpretación de sueños', 'Sin cartas natales'],
			ctaText: 'Suscribirse',
			popular: true,
			badge: 'Más Popular'
		},
		{ 
			name: 'PREMIUM', 
			displayName: 'Maestro Espiritual',
			price: 9.99,
			priceAnnual: 99.90,
			features: ['♾️ Lecturas ilimitadas', '🌙 Interpretación de sueños', '📊 Cartas natales', '🏆 Soporte VIP'],
			limitations: [],
			ctaText: 'Acceso Completo',
			popular: false,
			badge: 'Mejor Valor'
		}
	];
	
	res.json({ 
		plans: simplifiedPlans,
		migration: {
			message: 'Hemos simplificado nuestros planes para ofrecerte mejor valor',
			legacySupport: true
		}
	});
});

export default router;