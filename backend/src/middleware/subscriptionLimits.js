import prisma from '../config/database.js';

// Definición de límites por plan
const SUBSCRIPTION_LIMITS = {
  INVITADO: {
    maxReadingsPerMonth: 0,
    maxReadingsPerDay: 0,
    hasDreams: false,
    hasNatalCharts: false,
    hasPersonalizedHoroscopes: false,
    hasHistory: false,
    hasPartnerSync: false
  },
  INICIADO: {
    maxReadingsPerMonth: 4,
    maxReadingsPerDay: null, // Sin límite diario, solo mensual
    hasDreams: false,
    hasNatalCharts: false,
    hasPersonalizedHoroscopes: false,
    hasHistory: false,
    hasPartnerSync: false
  },
  ADEPTO: {
    maxReadingsPerMonth: null, // Sin límite mensual
    maxReadingsPerDay: 1,
    hasDreams: false,
    hasNatalCharts: true,
    hasPersonalizedHoroscopes: true,
    hasHistory: true,
    hasPartnerSync: false
  },
  MAESTRO: {
    maxReadingsPerMonth: null,
    maxReadingsPerDay: null, // Ilimitado
    hasDreams: true,
    hasNatalCharts: true,
    hasPersonalizedHoroscopes: true,
    hasHistory: true,
    hasPartnerSync: true
  }
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
        requiredPlan = 'MAESTRO';
        break;
      case 'natal_charts':
        hasAccess = limits.hasNatalCharts;
        requiredPlan = 'ADEPTO';
        break;
      case 'personalized_horoscopes':
        hasAccess = limits.hasPersonalizedHoroscopes;
        requiredPlan = 'ADEPTO';
        break;
      case 'history':
        hasAccess = limits.hasHistory;
        requiredPlan = 'ADEPTO';
        break;
      case 'partner_sync':
        hasAccess = limits.hasPartnerSync;
        requiredPlan = 'MAESTRO';
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
        message: 'La interpretación de sueños requiere el plan MAESTRO',
        currentPlan: userPlan,
        requiredPlan: 'MAESTRO',
        upgradeRequired: true
      });
    }

    // Para el plan MAESTRO, verificar límites diarios si aplica
    if (userPlan === 'MAESTRO') {
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

export { SUBSCRIPTION_LIMITS };