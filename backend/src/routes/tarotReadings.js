import express from 'express';
import { createTarotReading, getTarotLimitStatus, getTarotHistory } from '../controllers/tarotReadingController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

// Nuevo middleware simplificado
import { checkSinglePlanLimits, checkSinglePlanFeatureAccess } from '../middleware/singlePlanLimits.js';

// Legacy middleware (mantener por compatibilidad temporal)
import { checkReadingLimits, checkFeatureAccess } from '../middleware/subscriptionLimits.js';

const router = express.Router();

// Solo requiere Premium activo (trial o suscripción)
import { requirePremiumAccess, optionalPremiumAccess } from '../middleware/premiumAccess.js';

router.get('/limit-status', optionalPremiumAccess, getTarotLimitStatus);
router.post('/', authenticate, requirePremiumAccess, createTarotReading);
router.get('/history', authenticate, requirePremiumAccess, getTarotHistory);

export default router;
