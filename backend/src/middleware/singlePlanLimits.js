import prisma from '../config/database.js';

// === SISTEMA SIMPLIFICADO: SOLO 2 ESTADOS ===
const SINGLE_PLAN_LIMITS = {
  TRIAL: {
    // Prueba gratuita de 7 días con acceso completo
    maxReadingsPerMonth: null,   // Sin límites durante trial
    maxReadingsPerDay: 10,       // Límite razonable para evitar abuso
    hasDreams: true,
    hasNatalCharts: true,
    hasPersonalizedHoroscopes: true,
    hasHistory: true,
    hasPartnerSync: true,
    hasAllDecks: true,
    hasAdvancedDashboard: true,
    hasExportPDF: true,
    hasPrioritySupport: false,
    trialDays: 7
  },
  
  PREMIUM: {
    // Plan premium único con todo incluido
    maxReadingsPerMonth: null,   // Ilimitado
    maxReadingsPerDay: null,     // Ilimitado
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

  // Estados especiales
  EXPIRED: {
    // Trial expirado - acceso muy limitado para motivar suscripción
    maxReadingsPerMonth: 1,      // Solo 1 lectura al mes
    maxReadingsPerDay: 1,        
    hasDreams: false,
    hasNatalCharts: false,
    hasPersonalizedHoroscopes: false,
    hasHistory: false,           // Pueden ver el historial pero no crear nuevo contenido
    hasPartnerSync: false,
    hasAllDecks: false,          // Solo baraja básica
    hasAdvancedDashboard: false,
    hasExportPDF: false,
    hasPrioritySupport: false
  }
};

// Mapeo de planes legacy a nuevo sistema
const LEGACY_TO_SINGLE_PLAN_MAP = {
  INVITADO: 'EXPIRED',    // Los usuarios gratuitos pasan a estado expirado
  INICIADO: 'PREMIUM',    // Usuarios pagos actuales mantienen PREMIUM
  ESENCIAL: 'PREMIUM',
  ADEPTO: 'PREMIUM',
  MAESTRO: 'PREMIUM',
  PREMIUM: 'PREMIUM'
};

// Función para determinar el estado actual del usuario
export const getUserPlanStatus = async (user) => {
  try {
    // Si ya tiene una suscripción activa, es PREMIUM
    if (user.stripeSubscriptionId && user.subscriptionStatus === 'active') {
      return 'PREMIUM';
    }

    // Si no tiene suscripción activa, verificar trial
    if (!user.trialStartDate) {
      // Nuevo usuario - activar trial automáticamente
      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialStartDate.getDate() + 7);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          trialStartDate,
          trialEndDate,
          subscriptionPlan: 'TRIAL'
        }
      });

      return 'TRIAL';
    }

    // Usuario existente - verificar si el trial sigue activo
    const now = new Date();
    const trialEndDate = new Date(user.trialEndDate);

    if (now <= trialEndDate) {
      return 'TRIAL';
    }

    // Trial expirado
    return 'EXPIRED';

  } catch (error) {
    console.error('Error determining user plan status:', error);
    return 'EXPIRED'; // Seguro por defecto
  }
};

// Middleware principal para verificar límites
export const checkSinglePlanLimits = async (req, res, next) => {
  try {
    if (!req.member) {
      return res.status(401).json({ 
        error: 'Autenticación requerida',
        message: 'Debes iniciar sesión para realizar lecturas'
      });
    }

    const planStatus = await getUserPlanStatus(req.member);
    const limits = SINGLE_PLAN_LIMITS[planStatus];

    if (!limits) {
      return res.status(500).json({ 
        error: 'Estado de plan no válido',
        message: 'No se pudo determinar tu estado de suscripción'
      });
    }

    // Verificar límites diarios si aplica
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
          message: planStatus === 'TRIAL' 
            ? `Has alcanzado el límite de ${limits.maxReadingsPerDay} lecturas por día durante tu prueba gratuita`
            : `Has alcanzado el límite de ${limits.maxReadingsPerDay} lectura por día. Suscríbete para acceso ilimitado`,
          currentUsage: readingsToday,
          limit: limits.maxReadingsPerDay,
          resetTime: tomorrow.toISOString(),
          planStatus,
          upgradeRequired: planStatus !== 'PREMIUM'
        });
      }
    }

    // Verificar límites mensuales si aplica
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
          message: `Has alcanzado el límite de ${limits.maxReadingsPerMonth} lectura por mes. Suscríbete para acceso ilimitado`,
          currentUsage: readingsThisMonth,
          limit: limits.maxReadingsPerMonth,
          resetTime: endOfMonth.toISOString(),
          planStatus,
          upgradeRequired: true
        });
      }
    }

    // Agregar información al request
    req.userLimits = limits;
    req.userPlanStatus = planStatus;
    
    next();

  } catch (error) {
    console.error('Error checking single plan limits:', error);
    res.status(500).json({ 
      error: 'Error interno',
      message: 'Error verificando límites de suscripción'
    });
  }
};

// Middleware para verificar acceso a funciones específicas
export const checkSinglePlanFeatureAccess = (feature) => {
  return async (req, res, next) => {
    if (!req.member) {
      return res.status(401).json({ 
        error: 'Autenticación requerida',
        message: 'Debes iniciar sesión para acceder a esta función'
      });
    }

    const planStatus = await getUserPlanStatus(req.member);
    const limits = SINGLE_PLAN_LIMITS[planStatus];

    if (!limits) {
      return res.status(500).json({ 
        error: 'Estado de plan no válido',
        message: 'No se pudo determinar tu estado de suscripción'
      });
    }

    // Verificar acceso específico por funcionalidad
    let hasAccess = false;
    let featureName = '';

    switch (feature) {
      case 'dreams':
        hasAccess = limits.hasDreams;
        featureName = 'Interpretación de sueños';
        break;
      case 'natal_charts':
        hasAccess = limits.hasNatalCharts;
        featureName = 'Cartas natales';
        break;
      case 'personalized_horoscopes':
        hasAccess = limits.hasPersonalizedHoroscopes;
        featureName = 'Horóscopos personalizados';
        break;
      case 'history':
        hasAccess = limits.hasHistory;
        featureName = 'Historial de lecturas';
        break;
      case 'partner_sync':
        hasAccess = limits.hasPartnerSync;
        featureName = 'Análisis de pareja';
        break;
      case 'export_pdf':
        hasAccess = limits.hasExportPDF;
        featureName = 'Exportación a PDF';
        break;
      default:
        return res.status(400).json({ 
          error: 'Función no válida',
          message: 'La función solicitada no existe'
        });
    }

    if (!hasAccess) {
      let message = '';
      if (planStatus === 'EXPIRED') {
        message = `${featureName} requiere una suscripción activa. ¡Suscríbete por solo €9/mes para acceso completo!`;
      } else if (planStatus === 'TRIAL') {
        message = `${featureName} está incluido en tu prueba gratuita, pero requiere suscripción para continuar después del trial`;
      }

      return res.status(403).json({
        error: 'Función no disponible',
        message,
        planStatus,
        upgradeRequired: planStatus !== 'PREMIUM'
      });
    }

    next();
  };
};

// Función para obtener información de la suscripción del usuario
export const getUserSubscriptionInfo = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        trialStartDate: true,
        trialEndDate: true,
        createdAt: true
      }
    });

    if (!user) return null;

    const planStatus = await getUserPlanStatus(user);
    const limits = SINGLE_PLAN_LIMITS[planStatus];

    // Calcular días restantes del trial si aplica
    let trialDaysRemaining = 0;
    if (planStatus === 'TRIAL' && user.trialEndDate) {
      const now = new Date();
      const trialEnd = new Date(user.trialEndDate);
      trialDaysRemaining = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));
    }

    return {
      userId: user.id,
      email: user.email,
      planStatus,
      limits,
      trialInfo: planStatus === 'TRIAL' ? {
        startDate: user.trialStartDate,
        endDate: user.trialEndDate,
        daysRemaining: trialDaysRemaining
      } : null,
      subscriptionInfo: planStatus === 'PREMIUM' ? {
        customerId: user.stripeCustomerId,
        subscriptionId: user.stripeSubscriptionId,
        status: user.subscriptionStatus
      } : null
    };

  } catch (error) {
    console.error('Error getting user subscription info:', error);
    return null;
  }
};

// Función para migrar usuarios del sistema anterior al nuevo
export const migrateLegacyUser = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return null;

    const currentPlan = user.subscriptionPlan;
    
    // Si ya está en el nuevo sistema, no hacer nada
    if (['TRIAL', 'PREMIUM', 'EXPIRED'].includes(currentPlan)) {
      return user;
    }

    // Mapear plan legacy a nuevo sistema
    const newStatus = LEGACY_TO_SINGLE_PLAN_MAP[currentPlan] || 'EXPIRED';
    
    let updateData = {
      subscriptionPlan: newStatus
    };

    // Si era usuario gratuito (INVITADO), darle trial
    if (currentPlan === 'INVITADO' && !user.trialStartDate) {
      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialStartDate.getDate() + 7);
      
      updateData = {
        subscriptionPlan: 'TRIAL',
        trialStartDate,
        trialEndDate
      };
    }

    console.log(`Migrando usuario ${userId} de ${currentPlan} a ${updateData.subscriptionPlan}`);
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    return updatedUser;
  } catch (error) {
    console.error('Error migrating legacy user:', error);
    return null;
  }
};

export { SINGLE_PLAN_LIMITS, LEGACY_TO_SINGLE_PLAN_MAP };