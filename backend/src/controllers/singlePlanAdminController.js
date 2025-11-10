import prisma from '../config/database.js';
import { notifyDiscord } from '../utils/discordNotify.js';
import { getUserPlanStatus, migrateLegacyUser } from '../middleware/singlePlanLimits.js';

// Estadísticas del sistema simplificado
export const getSinglePlanStats = async (req, res) => {
  try {
    // Contadores básicos
    const userCount = await prisma.user.count();
    const readingCount = await prisma.reading.count();
    const dreamCount = await prisma.dream.count();

    // Usuarios por estado del plan
    const planStats = await prisma.user.groupBy({
      by: ['subscriptionPlan'],
      _count: true
    });

    // Usuarios activos (con suscripción o trial activo)
    const activeUsers = await prisma.user.count({
      where: {
        OR: [
          { subscriptionStatus: 'active' },
          { 
            AND: [
              { trialEndDate: { not: null } },
              { trialEndDate: { gte: new Date() } }
            ]
          }
        ]
      }
    });

    // Ingresos del mes actual (aproximado basado en suscripciones activas)
    const activeSubscriptions = await prisma.user.count({
      where: { subscriptionStatus: 'active' }
    });

    // Estimado de ingresos mensuales (asumiendo €9/mes promedio)
    const estimatedMRR = activeSubscriptions * 9;

    // Usuarios registrados en los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLast30Days = await prisma.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    res.json({
      summary: {
        totalUsers: userCount,
        activeUsers,
        totalReadings: readingCount,
        totalDreams: dreamCount,
        newUsersLast30Days,
        estimatedMRR
      },
      planDistribution: planStats.reduce((acc, stat) => {
        acc[stat.subscriptionPlan || 'UNDEFINED'] = stat._count;
        return acc;
      }, {}),
      systemType: 'single_plan'
    });

  } catch (error) {
    console.error('Error getting single plan stats:', error);
    res.status(500).json({
      error: 'Error obteniendo estadísticas',
      message: error.message
    });
  }
};

// Listar todos los usuarios con información del plan simplificada
export const getAllUsersSimplified = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const users = await prisma.user.findMany({
      skip: offset,
      take: limit,
      select: {
        id: true,
        email: true,
        role: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        trialStartDate: true,
        trialEndDate: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Enriquecer con información del estado actual del plan
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const planStatus = await getUserPlanStatus(user);
        
        // Calcular días restantes del trial si aplica
        let trialDaysRemaining = 0;
        if (planStatus === 'TRIAL' && user.trialEndDate) {
          const now = new Date();
          const trialEnd = new Date(user.trialEndDate);
          trialDaysRemaining = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));
        }

        return {
          ...user,
          currentPlanStatus: planStatus,
          trialDaysRemaining: planStatus === 'TRIAL' ? trialDaysRemaining : null,
          isActive: planStatus === 'PREMIUM' || planStatus === 'TRIAL'
        };
      })
    );

    const totalUsers = await prisma.user.count();

    res.json({
      users: enrichedUsers,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      }
    });

  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      error: 'Error obteniendo usuarios',
      message: error.message
    });
  }
};

// Actualizar usuario en sistema simplificado
export const updateUserSimplified = async (req, res) => {
  try {
    const { id } = req.params;
    const { planAction, reason } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    let updateData = {};
    let actionDescription = '';

    switch (planAction) {
      case 'activate_trial':
        if (user.trialStartDate) {
          return res.status(400).json({
            error: 'El usuario ya ha usado su trial'
          });
        }
        
        const trialStartDate = new Date();
        const trialEndDate = new Date();
        trialEndDate.setDate(trialStartDate.getDate() + 7);
        
        updateData = {
          subscriptionPlan: 'TRIAL',
          trialStartDate,
          trialEndDate
        };
        actionDescription = 'Trial activado por admin';
        break;

      case 'extend_trial':
        if (!user.trialStartDate) {
          return res.status(400).json({
            error: 'El usuario no tiene un trial activo'
          });
        }
        
        const newTrialEndDate = new Date(user.trialEndDate);
        newTrialEndDate.setDate(newTrialEndDate.getDate() + 7);
        
        updateData = {
          trialEndDate: newTrialEndDate
        };
        actionDescription = 'Trial extendido 7 días por admin';
        break;

      case 'activate_premium':
        updateData = {
          subscriptionPlan: 'PREMIUM',
          subscriptionStatus: 'active'
        };
        actionDescription = 'Premium activado manualmente por admin';
        break;

      case 'deactivate_premium':
        updateData = {
          subscriptionPlan: 'EXPIRED',
          subscriptionStatus: 'canceled'
        };
        actionDescription = 'Premium desactivado por admin';
        break;

      case 'reset_trial':
        updateData = {
          trialStartDate: null,
          trialEndDate: null,
          subscriptionPlan: 'EXPIRED'
        };
        actionDescription = 'Trial reseteado por admin';
        break;

      default:
        return res.status(400).json({
          error: 'Acción no válida',
          availableActions: ['activate_trial', 'extend_trial', 'activate_premium', 'deactivate_premium', 'reset_trial']
        });
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    // Notificar a Discord si está configurado
    try {
      await notifyDiscord('admin', 
        `🔧 **Cambio de suscripción por admin**\n` +
        `👤 Usuario: ${user.email}\n` +
        `🎯 Acción: ${actionDescription}\n` +
        `📋 Razón: ${reason || 'No especificada'}\n` +
        `👤 Admin: ${req.member?.email || 'Desconocido'}`
      );
    } catch (e) {
      console.error('Error notifying Discord:', e);
    }

    // Obtener estado actualizado
    const newPlanStatus = await getUserPlanStatus(updatedUser);

    res.json({
      success: true,
      user: updatedUser,
      currentPlanStatus: newPlanStatus,
      action: actionDescription
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      error: 'Error actualizando usuario',
      message: error.message
    });
  }
};

// Migrar usuario del sistema legacy al nuevo
export const migrateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const migratedUser = await migrateLegacyUser(parseInt(id));

    if (!migratedUser) {
      return res.status(404).json({
        error: 'Usuario no encontrado o no se pudo migrar'
      });
    }

    // Notificar migración
    try {
      await notifyDiscord('admin', 
        `🔄 **Migración de usuario**\n` +
        `👤 Usuario: ${migratedUser.email}\n` +
        `📋 Nuevo plan: ${migratedUser.subscriptionPlan}\n` +
        `👤 Admin: ${req.member?.email || 'Sistema automático'}`
      );
    } catch (e) {
      console.error('Error notifying Discord migration:', e);
    }

    res.json({
      success: true,
      user: migratedUser,
      message: 'Usuario migrado al nuevo sistema'
    });

  } catch (error) {
    console.error('Error migrating user:', error);
    res.status(500).json({
      error: 'Error migrando usuario',
      message: error.message
    });
  }
};

// Obtener detalles completos de un usuario
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        readings: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            createdAt: true
          }
        },
        dreams: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const planStatus = await getUserPlanStatus(user);

    // Estadísticas de uso del usuario
    const [totalReadings, totalDreams, readingsThisMonth] = await Promise.all([
      prisma.reading.count({ where: { userId: parseInt(id) } }),
      prisma.dream.count({ where: { userId: parseInt(id) } }),
      prisma.reading.count({
        where: {
          userId: parseInt(id),
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    res.json({
      user: {
        ...user,
        currentPlanStatus: planStatus
      },
      stats: {
        totalReadings,
        totalDreams,
        readingsThisMonth
      },
      recentActivity: {
        readings: user.readings,
        dreams: user.dreams
      }
    });

  } catch (error) {
    console.error('Error getting user details:', error);
    res.status(500).json({
      error: 'Error obteniendo detalles del usuario',
      message: error.message
    });
  }
};

// Migrar todos los usuarios legacy de una vez (usar con precaución)
export const migrateAllLegacyUsers = async (req, res) => {
  try {
    // Obtener usuarios con planes legacy
    const legacyUsers = await prisma.user.findMany({
      where: {
        subscriptionPlan: {
          in: ['INVITADO', 'INICIADO', 'ADEPTO', 'MAESTRO']
        }
      }
    });

    let migratedCount = 0;
    const errors = [];

    for (const user of legacyUsers) {
      try {
        await migrateLegacyUser(user.id);
        migratedCount++;
      } catch (error) {
        errors.push(`Usuario ${user.id} (${user.email}): ${error.message}`);
      }
    }

    // Notificar migración masiva
    try {
      await notifyDiscord('admin', 
        `🔄 **Migración masiva completada**\n` +
        `✅ Usuarios migrados: ${migratedCount}\n` +
        `❌ Errores: ${errors.length}\n` +
        `👤 Admin: ${req.member?.email || 'Desconocido'}`
      );
    } catch (e) {
      console.error('Error notifying Discord bulk migration:', e);
    }

    res.json({
      success: true,
      migratedCount,
      totalLegacyUsers: legacyUsers.length,
      errors: errors.length > 0 ? errors : null
    });

  } catch (error) {
    console.error('Error in bulk migration:', error);
    res.status(500).json({
      error: 'Error en migración masiva',
      message: error.message
    });
  }
};

// Exportar funciones legacy para compatibilidad
export const getStats = getSinglePlanStats;
export const getAllUsers = getAllUsersSimplified;
export const updateUser = updateUserSimplified;