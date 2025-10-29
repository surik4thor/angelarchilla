import express from 'express';
import PersonalizedHoroscopeController from '../controllers/personalizedHoroscopeController.js';
import { authenticate } from '../middleware/auth.js';
import { checkFeatureAccess } from '../middleware/subscriptionLimits.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// Generar horóscopo personalizado (requiere plan ADEPTO o superior)
router.post('/generate', checkFeatureAccess('personalized_horoscopes'), PersonalizedHoroscopeController.generatePersonalizedHoroscope);

// Obtener historial de horóscopos (requiere plan ADEPTO o superior)
router.get('/history', checkFeatureAccess('personalized_horoscopes'), PersonalizedHoroscopeController.getHoroscopeHistory);

// Obtener horóscopo específico por ID (requiere acceso)
router.get('/:id', checkFeatureAccess('personalized_horoscopes'), PersonalizedHoroscopeController.getHoroscopeById);

// Eliminar horóscopo (requiere acceso)
router.delete('/:id', checkFeatureAccess('personalized_horoscopes'), PersonalizedHoroscopeController.deleteHoroscope);

// Obtener estadísticas de horóscopos (requiere acceso)
router.get('/stats/user', checkFeatureAccess('personalized_horoscopes'), PersonalizedHoroscopeController.getHoroscopeStats);

export default router;