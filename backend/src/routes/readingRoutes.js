// Archivo: backend/src/routes/readings.js
import express from 'express';
import { createReading, getReadingHistory } from '../controllers/readingController.js';
import { authenticate, optionalAuth, checkReadingLimit, requireMembership } from '../middleware/auth.js';
import { validateReading } from '../middleware/validation.js';
import { checkReadingLimits, checkFeatureAccess } from '../middleware/subscriptionLimits.js';

const router = express.Router();


// Invitados pueden crear primera lectura gratis (optionalAuth + checkReadingLimit)
router.post('/', optionalAuth, checkReadingLimit, validateReading, createReading);

// Miembros pueden crear lecturas según su membresía con nuevos límites
router.post('/create', authenticate, checkReadingLimits, validateReading, createReading);

// Historial de lecturas (solo miembros con acceso)
router.get('/history', authenticate, checkFeatureAccess('history'), getReadingHistory);

// Endpoint unificado para límite de lecturas
import { getUnifiedLimitStatus } from '../controllers/readingController.js';
router.get('/limit-status', authenticate, getUnifiedLimitStatus);

export default router;