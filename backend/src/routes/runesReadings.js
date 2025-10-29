import express from 'express';
import { createRunesReading, getRunesLimitStatus, getRunesHistory } from '../controllers/runesReadingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/limit-status', authenticate, getRunesLimitStatus);
router.post('/', authenticate, createRunesReading);
router.get('/history', authenticate, getRunesHistory);

export default router;
