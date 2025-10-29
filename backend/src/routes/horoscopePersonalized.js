import express from 'express';
import { getPersonalizedHoroscope } from '../controllers/horoscopeController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Endpoint personalizado para horóscopo diario IA
router.get('/personalized', authenticate, getPersonalizedHoroscope);

export default router;
