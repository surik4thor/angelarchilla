import express from 'express';
import { createDreamInterpretation, getDreamLimitStatus, getDreamHistory } from '../controllers/dreamInterpretationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/limit-status', authenticate, getDreamLimitStatus);
router.post('/', authenticate, createDreamInterpretation);
router.get('/history', authenticate, getDreamHistory);

export default router;
