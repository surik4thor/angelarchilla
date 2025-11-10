import express from 'express';
import PersonalizedHoroscopeController from '../controllers/personalizedHoroscopeController.js';
import { authenticate } from '../middleware/auth.js';
import { requirePremiumAccess } from '../middleware/premiumAccess.js';

const router = express.Router();

// Aplicar autenticación y Premium activo a todas las rutas
router.use(authenticate);
router.use(requirePremiumAccess);

// Generar horóscopo personalizado (requiere Premium activo)
router.post('/generate', PersonalizedHoroscopeController.generatePersonalizedHoroscope);

// Obtener historial de horóscopos (requiere Premium activo)
router.get('/history', PersonalizedHoroscopeController.getHoroscopeHistory);

// Obtener horóscopo específico por ID (requiere Premium activo)
router.get('/:id', PersonalizedHoroscopeController.getHoroscopeById);

// Eliminar horóscopo (requiere Premium activo)
router.delete('/:id', PersonalizedHoroscopeController.deleteHoroscope);

// Obtener estadísticas de horóscopos (requiere Premium activo)
router.get('/stats/user', PersonalizedHoroscopeController.getHoroscopeStats);

export default router;