import express from 'express';
import { createTarotReading, getTarotLimitStatus, getTarotHistory } from '../controllers/tarotReadingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/limit-status', authenticate, getTarotLimitStatus);
router.post('/', authenticate, createTarotReading);
router.get('/history', authenticate, getTarotHistory);

export default router;
