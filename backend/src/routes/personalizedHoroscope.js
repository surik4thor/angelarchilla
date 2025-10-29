import express from 'express';
import PersonalizedHoroscopeController from '../controllers/personalizedHoroscopeController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// Generar horóscopo personalizado
router.post('/generate', PersonalizedHoroscopeController.generatePersonalizedHoroscope);

// Obtener historial de horóscopos
router.get('/history', PersonalizedHoroscopeController.getHoroscopeHistory);

// Obtener horóscopo específico por ID
router.get('/:id', PersonalizedHoroscopeController.getHoroscopeById);

// Eliminar horóscopo
router.delete('/:id', PersonalizedHoroscopeController.deleteHoroscope);

// Obtener estadísticas de horóscopos
router.get('/stats/user', PersonalizedHoroscopeController.getHoroscopeStats);

export default router;