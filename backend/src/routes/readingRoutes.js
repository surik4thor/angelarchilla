// Archivo: backend/src/routes/readings.js
import express from 'express';
import { createReading, getReadingHistory } from '../controllers/readingController.js';
import { authenticate, optionalAuth, checkReadingLimit, requireMembership } from '../middleware/auth.js';
import { validateReading } from '../middleware/validation.js';
import { checkReadingLimits, checkFeatureAccess } from '../middleware/subscriptionLimits.js';

const router = express.Router();

// Endpoint informativo para GET /readings
router.get('/', (req, res) => {
  res.json({
    message: 'API de Lecturas - Nebulosa Mágica',
    endpoints: {
      'POST /': 'Crear nueva lectura (requiere autenticación)',
      'GET /history': 'Obtener historial de lecturas (requiere autenticación)',
      'GET /limit-status': 'Verificar estado de límites de lecturas'
    },
    documentation: 'Para crear lecturas, usa POST con los datos requeridos'
  });
});

// Solo usuarios registrados pueden crear lecturas
router.post('/', authenticate, checkReadingLimits, validateReading, createReading);

// Endpoint legacy - redirigir al principal
router.post('/create', authenticate, checkReadingLimits, validateReading, createReading);

// Historial de lecturas (solo miembros con acceso)
router.get('/history', authenticate, checkFeatureAccess('history'), getReadingHistory);

// Endpoint unificado para límite de lecturas
import { getUnifiedLimitStatus } from '../controllers/readingController.js';
router.get('/limit-status', optionalAuth, getUnifiedLimitStatus);

export default router;