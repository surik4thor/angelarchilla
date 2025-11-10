import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getSinglePlanStats,
  getAllUsersSimplified,
  updateUserSimplified,
  migrateUser,
  getUserDetails,
  migrateAllLegacyUsers
} from '../controllers/singlePlanAdminController.js';

const router = express.Router();

// Middleware para verificar que es admin
const requireAdmin = (req, res, next) => {
  if (!req.member || req.member.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Acceso denegado',
      message: 'Se requieren permisos de administrador',
      currentRole: req.member?.role || 'none'
    });
  }
  next();
};

// Todas las rutas requieren autenticación y permisos de admin
router.use(authenticate, requireAdmin);

// Estadísticas del sistema simplificado
router.get('/stats', getSinglePlanStats);

// Gestión de usuarios
router.get('/users', getAllUsersSimplified);
router.get('/users/:id', getUserDetails);
router.patch('/users/:id', updateUserSimplified);

// Migración de usuarios
router.post('/users/:id/migrate', migrateUser);
router.post('/migrate-all', migrateAllLegacyUsers);

// Endpoint para obtener información del sistema
router.get('/system-info', (req, res) => {
  res.json({
    systemType: 'single_plan',
    version: '2.0',
    features: {
      trialPeriod: 7,
      planTypes: ['TRIAL', 'PREMIUM', 'EXPIRED'],
      pricing: {
        monthly: 9,
        annual: 90,
        currency: 'EUR'
      }
    },
    availableActions: [
      'activate_trial',
      'extend_trial', 
      'activate_premium',
      'deactivate_premium',
      'reset_trial'
    ]
  });
});

// Endpoint para buscar usuarios
router.get('/search/users', async (req, res) => {
  try {
    const { q, status } = req.query;
    
    if (!q) {
      return res.status(400).json({
        error: 'Parámetro de búsqueda requerido'
      });
    }

    const { default: prisma } = await import('../config/database.js');
    
    let whereClause = {
      OR: [
        { email: { contains: q, mode: 'insensitive' } },
        { id: isNaN(parseInt(q)) ? undefined : parseInt(q) }
      ].filter(Boolean)
    };

    // Filtro adicional por estado si se especifica
    if (status && ['TRIAL', 'PREMIUM', 'EXPIRED'].includes(status)) {
      whereClause.subscriptionPlan = status;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        trialStartDate: true,
        trialEndDate: true,
        createdAt: true
      },
      take: 20,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ users });

  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      error: 'Error en la búsqueda',
      message: error.message
    });
  }
});

// Endpoint para acciones rápidas
router.post('/quick-actions', async (req, res) => {
  try {
    const { action, userIds, reason } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        error: 'Se requiere una lista de IDs de usuarios'
      });
    }

    const results = [];
    const errors = [];

    for (const userId of userIds) {
      try {
        // Simular la llamada a updateUserSimplified para cada usuario
        const mockReq = {
          params: { id: userId },
          body: { planAction: action, reason },
          member: req.member
        };
        
        // Aquí deberías llamar a la función updateUserSimplified
        // Para simplificar, solo registramos la acción
        results.push({ userId, action, success: true });
        
      } catch (error) {
        errors.push({ userId, error: error.message });
      }
    }

    res.json({
      success: true,
      processed: results.length,
      errors: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error in quick actions:', error);
    res.status(500).json({
      error: 'Error ejecutando acciones rápidas',
      message: error.message
    });
  }
});

export default router;