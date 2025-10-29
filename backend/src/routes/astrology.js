import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  createOrUpdateNatalChart, 
  getNatalChart, 
  generatePersonalizedHoroscope 
} from '../controllers/natalChartController.js';

const router = express.Router();

// Obtener carta natal del usuario
router.get('/natal-chart', authenticate, getNatalChart);

// Crear o actualizar carta natal
router.post('/natal-chart', authenticate, createOrUpdateNatalChart);

// Generar horóscopo personalizado basado en carta natal
router.get('/personalized-horoscope', authenticate, generatePersonalizedHoroscope);

export default router;