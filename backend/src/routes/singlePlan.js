// Rutas simplificadas para el sistema de plan único
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createSinglePlanCheckout,
  verifyCheckoutSession,
  getUserPlan,
  activateTrial,
  cancelSubscription,
  handleStripeWebhook
} from '../controllers/singlePlanController.js';

const router = express.Router();

// Ruta pública - obtener información de precios (sin autenticación)
router.get('/pricing', (req, res) => {
  res.json({
    plan: {
      name: 'Premium',
      description: 'Acceso completo a todas las funciones de Nebulosa Mágica',
      features: [
        'Lecturas ilimitadas de Tarot y Runas',
        'Todas las barajas disponibles',
        'Interpretación de sueños con IA',
        'Cartas natales completas',
        'Horóscopos personalizados',
        'Análisis de compatibilidad',
        'Historial completo de lecturas',
        'Exportación a PDF',
        'Soporte VIP prioritario'
      ],
      pricing: {
        monthly: {
          price: 9,
          currency: 'EUR',
          period: 'month'
        },
        annual: {
          price: 90,
          currency: 'EUR',
          period: 'year',
          savings: 18,
          savingsPercentage: 17
        }
      },
      trial: {
        enabled: true,
        days: 7,
        description: 'Prueba gratuita completa sin restricciones'
      }
    }
  });
});

// Rutas protegidas (requieren autenticación)

// Obtener información del plan actual del usuario
router.get('/plan', authenticate, getUserPlan);

// Activar trial gratuito
router.post('/trial', authenticate, activateTrial);

// Crear sesión de checkout para suscripción
router.post('/checkout', authenticate, createSinglePlanCheckout);

// Verificar sesión de checkout completada
router.get('/checkout/verify/:sessionId', authenticate, verifyCheckoutSession);

// Cancelar suscripción
router.post('/cancel', authenticate, cancelSubscription);

// Webhook de Stripe (sin autenticación - Stripe lo maneja)
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Ruta para migrar usuarios del sistema anterior (temporal)
router.post('/migrate', authenticate, async (req, res) => {
  try {
    const { migrateLegacyUser } = await import('../middleware/singlePlanLimits.js');
    const userId = req.member.id;
    
    const migratedUser = await migrateLegacyUser(userId);
    
    if (!migratedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Usuario migrado al nuevo sistema',
      oldPlan: req.body.oldPlan,
      newPlan: migratedUser.subscriptionPlan
    });

  } catch (error) {
    console.error('Error migrating user:', error);
    res.status(500).json({
      message: 'Error en la migración',
      error: error.message
    });
  }
});

// Ruta para obtener estadísticas de uso (opcional)
router.get('/usage', authenticate, async (req, res) => {
  try {
    const { getUserSubscriptionInfo } = await import('../middleware/singlePlanLimits.js');
    const userId = req.member.id;
    
    const subscriptionInfo = await getUserSubscriptionInfo(userId);
    
    if (!subscriptionInfo) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Obtener estadísticas de uso del mes actual
    const prisma = (await import('../config/database.js')).default;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [readingsThisMonth, dreamsThisMonth] = await Promise.all([
      prisma.reading.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth, lt: endOfMonth }
        }
      }),
      prisma.dream.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth, lt: endOfMonth }
        }
      })
    ]);

    res.json({
      ...subscriptionInfo,
      usage: {
        readingsThisMonth,
        dreamsThisMonth,
        period: {
          start: startOfMonth,
          end: endOfMonth
        }
      }
    });

  } catch (error) {
    console.error('Error getting usage stats:', error);
    res.status(500).json({
      message: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
});

export default router;