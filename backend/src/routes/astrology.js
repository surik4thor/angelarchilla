import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requirePremiumAccess } from '../middleware/premiumAccess.js';
import { 
  createOrUpdateNatalChart, 
  getNatalChart, 
  generatePersonalizedHoroscope 
} from '../controllers/natalChartController.js';

const router = express.Router();

// Obtener carta natal del usuario - requiere Premium activo
router.get('/natal-chart', authenticate, requirePremiumAccess, getNatalChart);

// Crear o actualizar carta natal - requiere Premium activo
router.post('/natal-chart', authenticate, requirePremiumAccess, createOrUpdateNatalChart);

// Generar horóscopo personalizado basado en carta natal - requiere Premium activo
router.get('/personalized-horoscope', authenticate, requirePremiumAccess, generatePersonalizedHoroscope);

export default router;