import express from 'express';
import { createRunesReading, getRunesLimitStatus, getRunesHistory } from '../controllers/runesReadingController.js';
import { authenticate } from '../middleware/auth.js';
import { checkReadingLimits, checkFeatureAccess } from '../middleware/subscriptionLimits.js';

const router = express.Router();

router.get('/limit-status', authenticate, getRunesLimitStatus);
router.post('/', authenticate, checkReadingLimits, createRunesReading);
router.get('/history', authenticate, checkFeatureAccess('history'), getRunesHistory);

export default router;
