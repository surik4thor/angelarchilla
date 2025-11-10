import express from 'express';
import { createRunesReading, getRunesLimitStatus, getRunesHistory } from '../controllers/runesReadingController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

// Nuevo middleware simplificado
import { checkSinglePlanLimits, checkSinglePlanFeatureAccess } from '../middleware/singlePlanLimits.js';

// Legacy middleware (mantener por compatibilidad temporal)
import { checkReadingLimits, checkFeatureAccess } from '../middleware/subscriptionLimits.js';

const router = express.Router();

// Solo requiere Premium activo (trial o suscripción)
import { requirePremiumAccess, optionalPremiumAccess } from '../middleware/premiumAccess.js';

router.get('/limit-status', optionalPremiumAccess, getRunesLimitStatus);
router.post('/', authenticate, requirePremiumAccess, createRunesReading);
router.get('/history', authenticate, requirePremiumAccess, getRunesHistory);

export default router;
