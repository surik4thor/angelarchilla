import express from 'express';
import { createTarotReading, getTarotLimitStatus, getTarotHistory } from '../controllers/tarotReadingController.js';
import { authenticate } from '../middleware/auth.js';
import { checkReadingLimits, checkFeatureAccess } from '../middleware/subscriptionLimits.js';

const router = express.Router();

router.get('/limit-status', authenticate, getTarotLimitStatus);
router.post('/', authenticate, checkReadingLimits, createTarotReading);
router.get('/history', authenticate, checkFeatureAccess('history'), getTarotHistory);

export default router;
