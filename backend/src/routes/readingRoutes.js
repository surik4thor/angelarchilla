import { Router } from 'express';
import { createReading, getReadingHistory, getAccessStatus } from '../controllers/simplifiedReadingController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requirePremiumAccess, optionalPremiumAccess } from '../middleware/premiumAccess.js';

const router = Router();

// Endpoint informativo para GET /readings
router.get('/', (req, res) => {
  res.json({
    message: 'API de Lecturas - Nebulosa Mágica (Solo Premium)',
    status: 'Sistema simplificado - Solo requiere plan Premium activo',
    endpoints: {
      'POST /': 'Crear nueva lectura (requiere Premium activo)',
      'GET /history': 'Obtener historial de lecturas (requiere Premium activo)', 
      'GET /access-status': 'Verificar estado de acceso Premium'
    },
    access: 'Premium plan (trial de 7 días o suscripción pagada)',
    documentation: 'Ya no hay límites de lecturas - solo necesitas plan Premium activo'
  });
});

// Ruta para crear una nueva lectura (tarot o runas) - requiere Premium
router.post('/', authenticate, requirePremiumAccess, createReading);

// Endpoint legacy - mantener compatibilidad
router.post('/create', authenticate, requirePremiumAccess, createReading);

// Ruta para obtener el historial de lecturas - requiere Premium
router.get('/history', authenticate, requirePremiumAccess, getReadingHistory);

// Ruta para verificar el estado de acceso - usando auth opcional primero
router.get('/access-status', optionalAuth, optionalPremiumAccess, getAccessStatus);

// Backward compatibility - redirect old limit endpoint
router.get('/limit-status', optionalAuth, optionalPremiumAccess, getAccessStatus);

export default router;