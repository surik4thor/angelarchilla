import express from 'express';
import { 
  purchaseWeeklyBonus,
  activateWeeklyBonus,
  getUserBonusStatus,
  listUserBonuses,
  verifyMasterAccessWithBonus
} from '../controllers/weeklyBonusController.js';
import { authenticateToken } from '../utils/auth.js';

const router = express.Router();

/**
 * Rutas para bonos semanales de 8.99€
 * Permiten acceso completo al plan Maestro por 7 días
 */

// Obtener información sobre bonos semanales
router.get('/info', (req, res) => {
  res.json({
    success: true,
    weeklyBonus: {
      price: 8.99,
      currency: 'EUR',
      duration: '7 días',
      description: 'Acceso completo al plan Maestro durante una semana',
      features: [
        'Lecturas ilimitadas de tarot',
        'Acceso a todas las barajas (Ángeles, Egipcio, Rider-Waite, Marsella)',
        'Interpretaciones premium con IA avanzada',
        'Consultas sin límite',
        'Soporte prioritario',
        'Todas las funciones premium'
      ],
      paymentMethods: ['bizum', 'tarjeta'],
      validFor: 'Una semana completa desde activación'
    }
  });
});

// Comprar bono semanal
router.post('/purchase', authenticateToken, purchaseWeeklyBonus);

// Activar bono semanal comprado
router.post('/activate/:bonusId', authenticateToken, activateWeeklyBonus);

// Obtener estado actual de bonos
router.get('/status', authenticateToken, getUserBonusStatus);

// Listar todos los bonos del usuario
router.get('/list', authenticateToken, listUserBonuses);

// Ruta de ejemplo protegida con verificación de acceso maestro (incluyendo bonos)
router.get('/test-master-access', authenticateToken, verifyMasterAccessWithBonus, (req, res) => {
  res.json({
    success: true,
    message: 'Tienes acceso maestro',
    accessType: req.accessType,
    hasMasterAccess: req.hasMasterAccess
  });
});

export default router;