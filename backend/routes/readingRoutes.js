import { Router } from 'express';
import { createReading, getReadingHistory, getAccessStatus } from '../src/controllers/simplifiedReadingController.js';
import { authenticate } from '../src/middleware/auth.js';
import { requirePremiumAccess, optionalPremiumAccess } from '../src/middleware/premiumAccess.js';

const router = Router();

// Ruta para crear una nueva lectura (tarot o runas) - requiere Premium
router.post('/', authenticate, requirePremiumAccess, createReading);

// Ruta para obtener el historial de lecturas - requiere Premium
router.get('/history', authenticate, requirePremiumAccess, getReadingHistory);

// Ruta para verificar el estado de acceso - sin requerir Premium
router.get('/access-status', optionalPremiumAccess, getAccessStatus);

export default router;