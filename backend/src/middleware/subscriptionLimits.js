import prisma from '../config/database.js';

// === ESTRUCTURA DEFINITIVA (3 PLANES) ===
const SUBSCRIPTION_LIMITS = {
  INVITADO: {
    maxReadingsPerMonth: 3,      // 3 lecturas básicas al mes
    maxReadingsPerDay: null,     // Sin límite diario
    hasDreams: false,
    hasNatalCharts: false,
    hasPersonalizedHoroscopes: false,
    hasHistory: false,
    hasPartnerSync: false,
    hasAllDecks: false,          // Solo Rider-Waite básico
    hasAdvancedDashboard: false,
    hasExportPDF: false,
    hasPrioritySupport: false
  },
  
  ESENCIAL: {
    maxReadingsPerMonth: 15,     // 15 lecturas completas al mes
    maxReadingsPerDay: null,     // Sin límite diario
    hasDreams: false,
    hasNatalCharts: false,
    hasPersonalizedHoroscopes: true,   // Horóscopos personalizados
    hasHistory: true,                   // Historial completo
    hasPartnerSync: false,
    hasAllDecks: true,                  // Todas las barajas
    hasAdvancedDashboard: true,         // Dashboard con métricas
    hasExportPDF: false,
    hasPrioritySupport: false
  },
  
  PREMIUM: {
    maxReadingsPerMonth: null,   // Lecturas ilimitadas
    maxReadingsPerDay: null,     
    hasDreams: true,                    // Interpretación de sueños
    hasNatalCharts: true,               // Cartas natales detalladas
    hasPersonalizedHoroscopes: true,    // Horóscopos ultra-personalizados
    hasHistory: true,
    hasPartnerSync: true,               // Funciones de pareja
    hasAllDecks: true,
    hasAdvancedDashboard: true,
    hasExportPDF: true,                 // Exportar a PDF
    hasPrioritySupport: true            // Soporte VIP
  },

  // === MIGRACIÓN AUTOMÁTICA: Mapeo de planes legacy ===
  INICIADO: {
    // Mapeo automático a ESENCIAL
    maxReadingsPerMonth: 15,
    maxReadingsPerDay: null,
    hasDreams: false,
    hasNatalCharts: false,
    hasPersonalizedHoroscopes: true,
    hasHistory: true,
    hasPartnerSync: false,
    hasAllDecks: true,
    hasAdvancedDashboard: true,
    hasExportPDF: false,
    hasPrioritySupport: false
  },
  
  ADEPTO: {
    // Mapeo automático a PREMIUM
    maxReadingsPerMonth: null,
    maxReadingsPerDay: null,
    hasDreams: true,
    hasNatalCharts: true,
    hasPersonalizedHoroscopes: true,
    hasHistory: true,
    hasPartnerSync: true,
    hasAllDecks: true,
    hasAdvancedDashboard: true,
    hasExportPDF: true,
    hasPrioritySupport: true
  },
  
  MAESTRO: {
    // Mapeo automático a PREMIUM
    maxReadingsPerMonth: null,
    maxReadingsPerDay: null,
    hasDreams: true,
    hasNatalCharts: true,
    hasPersonalizedHoroscopes: true,
    hasHistory: true,
    hasPartnerSync: true,
    hasAllDecks: true,
    hasAdvancedDashboard: true,
    hasExportPDF: true,
    hasPrioritySupport: true
  }
};

// Mapeo de planes legacy a nuevos planes
const PLAN_MIGRATION_MAP = {
  INICIADO: 'ESENCIAL',
  ADEPTO: 'PREMIUM', 
  MAESTRO: 'PREMIUM'
};

// Middleware para verificar límites de lecturas
export const checkReadingLimits = async (req, res, next) => {
  try {
    if (!req.member) {
      return res.status(401).json({ 
        error: 'Autenticación requerida',
        message: 'Debes iniciar sesión para realizar lecturas'
      });
    }

    const userPlan = req.member.subscriptionPlan || 'INVITADO';
    const limits = SUBSCRIPTION_LIMITS[userPlan];

    if (!limits) {
      return res.status(500).json({ 
        error: 'Plan no válido',
        message: 'Tu plan de suscripción no es reconocido'
      });
    }

    // Verificar límites diarios
    if (limits.maxReadingsPerDay !== null) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const readingsToday = await prisma.reading.count({
        where: {
          userId: req.member.id,
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      });

      if (readingsToday >= limits.maxReadingsPerDay) {
        return res.status(403).json({
          error: 'Límite diario alcanzado',
          message: `Has alcanzado el límite de ${limits.maxReadingsPerDay} lectura(s) por día`,
          currentUsage: readingsToday,
          limit: limits.maxReadingsPerDay,
          resetTime: tomorrow.toISOString(),
          upgradeRequired: userPlan !== 'MAESTRO'
        });
      }
    }

    // Verificar límites mensuales
    if (limits.maxReadingsPerMonth !== null) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const readingsThisMonth = await prisma.reading.count({
        where: {
          userId: req.member.id,
          createdAt: {
            gte: startOfMonth,
            lt: endOfMonth
          }
        }
      });

      if (readingsThisMonth >= limits.maxReadingsPerMonth) {
        return res.status(403).json({
          error: 'Límite mensual alcanzado',
          message: `Has alcanzado el límite de ${limits.maxReadingsPerMonth} lectura(s) por mes`,
          currentUsage: readingsThisMonth,
          limit: limits.maxReadingsPerMonth,
          resetTime: endOfMonth.toISOString(),
          upgradeRequired: true
        });
      }
    }

    // Agregar información de límites al request
    req.userLimits = limits;
    req.userPlan = userPlan;
    
    next();

  } catch (error) {
    console.error('Error checking reading limits:', error);
    res.status(500).json({ 
      error: 'Error interno',
      message: 'Error verificando límites de suscripción'
    });
  }
};

// Middleware para verificar acceso a funciones premium
export const checkFeatureAccess = (feature) => {
  return (req, res, next) => {
    if (!req.member) {
      return res.status(401).json({ 
        error: 'Autenticación requerida',
        message: 'Debes iniciar sesión para acceder a esta función'
      });
    }

    const userPlan = req.member.subscriptionPlan || 'INVITADO';
    const limits = SUBSCRIPTION_LIMITS[userPlan];

    if (!limits) {
      return res.status(500).json({ 
        error: 'Plan no válido',
        message: 'Tu plan de suscripción no es reconocido'
      });
    }

    // Verificar acceso específico por funcionalidad
    let hasAccess = false;
    let requiredPlan = '';

    switch (feature) {
      case 'dreams':
        hasAccess = limits.hasDreams;
        requiredPlan = 'PREMIUM';
        break;
      case 'natal_charts':
        hasAccess = limits.hasNatalCharts;
        requiredPlan = 'PREMIUM';
        break;
      case 'personalized_horoscopes':
        hasAccess = limits.hasPersonalizedHoroscopes;
        requiredPlan = 'ESENCIAL';
        break;
      case 'history':
        hasAccess = limits.hasHistory;
        requiredPlan = 'ESENCIAL';
        break;
      case 'partner_sync':
        hasAccess = limits.hasPartnerSync;
        requiredPlan = 'PREMIUM';
        break;
      default:
        return res.status(400).json({ 
          error: 'Función no válida',
          message: 'La función solicitada no existe'
        });
    }

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Función no disponible',
        message: `Esta función requiere el plan ${requiredPlan} o superior`,
        currentPlan: userPlan,
        requiredPlan: requiredPlan,
        upgradeRequired: true
      });
    }

    next();
  };
};

// Middleware para verificar límites de sueños
export const checkDreamLimits = async (req, res, next) => {
  try {
    if (!req.member) {
      return res.status(401).json({ 
        error: 'Autenticación requerida',
        message: 'Debes iniciar sesión para interpretar sueños'
      });
    }

    const userPlan = req.member.subscriptionPlan || 'INVITADO';
    const limits = SUBSCRIPTION_LIMITS[userPlan];

    if (!limits.hasDreams) {
      return res.status(403).json({
        error: 'Función premium',
        message: 'La interpretación de sueños requiere el plan PREMIUM',
        currentPlan: userPlan,
        requiredPlan: 'PREMIUM',
        upgradeRequired: true
      });
    }

    // Para planes PREMIUM, verificar límites diarios si aplica
    if (userPlan === 'PREMIUM' || userPlan === 'MAESTRO' || userPlan === 'ADEPTO') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dreamsToday = await prisma.dream.count({
        where: {
          userId: req.member.id,
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      });

      // Límite generoso para sueños (10 por día)
      const maxDreamsPerDay = 10;
      if (dreamsToday >= maxDreamsPerDay) {
        return res.status(403).json({
          error: 'Límite diario de sueños alcanzado',
          message: `Has alcanzado el límite de ${maxDreamsPerDay} interpretaciones de sueños por día`,
          currentUsage: dreamsToday,
          limit: maxDreamsPerDay,
          resetTime: tomorrow.toISOString()
        });
      }
    }

    next();

  } catch (error) {
    console.error('Error checking dream limits:', error);
    res.status(500).json({ 
      error: 'Error interno',
      message: 'Error verificando límites de interpretación de sueños'
    });
  }
};

// Función auxiliar para obtener estadísticas de uso
export const getUserUsageStats = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const [readingsToday, readingsThisMonth, dreamsToday, dreamsThisMonth] = await Promise.all([
      prisma.reading.count({
        where: {
          userId,
          createdAt: { gte: today, lt: tomorrow }
        }
      }),
      prisma.reading.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth, lt: endOfMonth }
        }
      }),
      prisma.dream.count({
        where: {
          userId,
          createdAt: { gte: today, lt: tomorrow }
        }
      }),
      prisma.dream.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth, lt: endOfMonth }
        }
      })
    ]);

    return {
      readings: {
        today: readingsToday,
        thisMonth: readingsThisMonth
      },
      dreams: {
        today: dreamsToday,
        thisMonth: dreamsThisMonth
      },
      period: {
        today: today.toISOString(),
        startOfMonth: startOfMonth.toISOString(),
        endOfMonth: endOfMonth.toISOString()
      }
    };
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return null;
  }
};

// Función para obtener el plan equivalente actualizado
export const getUpdatedPlan = (currentPlan) => {
  return PLAN_MIGRATION_MAP[currentPlan] || currentPlan;
};

// Función para migrar usuario a nuevo sistema de planes
export const migrateUserPlan = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return null;

    const currentPlan = user.subscriptionPlan;
    const newPlan = getUpdatedPlan(currentPlan);

    if (newPlan !== currentPlan) {
      console.log(`Migrando usuario ${userId} de ${currentPlan} a ${newPlan}`);
      
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { subscriptionPlan: newPlan }
      });

      return updatedUser;
    }

    return user;
  } catch (error) {
    console.error('Error migrating user plan:', error);
    return null;
  }
};

export { SUBSCRIPTION_LIMITS, PLAN_MIGRATION_MAP };