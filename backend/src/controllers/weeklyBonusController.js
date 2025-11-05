import prisma from '../config/database.js';

/**
 * Controlador para manejar bonos semanales de 8.99€
 * Permite acceso completo al plan Maestro por 7 días
 */

// Configuración del bono semanal
const WEEKLY_BONUS_CONFIG = {
  price: 8.99,
  currency: 'EUR',
  duration_days: 7,
  features: {
    plan: 'MAESTRO',
    unlimited_readings: true,
    all_tarot_decks: true,
    premium_interpretations: true,
    priority_support: true,
    advanced_features: true
  }
};

/**
 * Crear nuevo bono semanal (compra)
 */
export const purchaseWeeklyBonus = async (req, res) => {
  try {
    const { paymentMethod = 'bizum', paymentReference } = req.body;
    const member = req.member;

    if (!member) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
    }

    // Verificar si ya tiene un bono activo
    const existingActiveBonus = await prisma.weeklyBonus.findFirst({
      where: {
        userId: member.id,
        status: 'ACTIVE',
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (existingActiveBonus) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes un bono semanal activo',
        activeUntil: existingActiveBonus.expiresAt
      });
    }

    // Crear el bono
    const weeklyBonus = await prisma.weeklyBonus.create({
      data: {
        userId: member.id,
        amount: WEEKLY_BONUS_CONFIG.price,
        currency: WEEKLY_BONUS_CONFIG.currency,
        paymentMethod,
        paymentReference,
        features: WEEKLY_BONUS_CONFIG.features,
        status: 'PURCHASED'
      }
    });

    res.json({
      success: true,
      message: 'Bono semanal comprado exitosamente',
      bonus: {
        id: weeklyBonus.id,
        amount: weeklyBonus.amount,
        currency: weeklyBonus.currency,
        status: weeklyBonus.status,
        features: WEEKLY_BONUS_CONFIG.features
      }
    });

  } catch (error) {
    console.error('Error comprando bono semanal:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Activar bono semanal comprado
 */
export const activateWeeklyBonus = async (req, res) => {
  try {
    const { bonusId } = req.params;
    const member = req.member;

    if (!member) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
    }

    // Buscar el bono
    const bonus = await prisma.weeklyBonus.findFirst({
      where: {
        id: bonusId,
        userId: member.id,
        status: 'PURCHASED'
      }
    });

    if (!bonus) {
      return res.status(404).json({
        success: false,
        message: 'Bono no encontrado o ya activado'
      });
    }

    // Verificar si ya tiene otro bono activo
    const existingActiveBonus = await prisma.weeklyBonus.findFirst({
      where: {
        userId: member.id,
        status: 'ACTIVE',
        expiresAt: {
          gt: new Date()
        },
        id: {
          not: bonusId
        }
      }
    });

    if (existingActiveBonus) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes otro bono activo. Espera a que expire para activar este.',
        activeUntil: existingActiveBonus.expiresAt
      });
    }

    // Activar el bono
    const activatedAt = new Date();
    const expiresAt = new Date(activatedAt.getTime() + (WEEKLY_BONUS_CONFIG.duration_days * 24 * 60 * 60 * 1000));

    const activatedBonus = await prisma.weeklyBonus.update({
      where: { id: bonusId },
      data: {
        status: 'ACTIVE',
        activatedAt,
        expiresAt
      }
    });

    res.json({
      success: true,
      message: 'Bono semanal activado exitosamente',
      bonus: {
        id: activatedBonus.id,
        status: activatedBonus.status,
        activatedAt: activatedBonus.activatedAt,
        expiresAt: activatedBonus.expiresAt,
        features: activatedBonus.features
      }
    });

  } catch (error) {
    console.error('Error activando bono semanal:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Obtener estado de bonos del usuario
 */
export const getUserBonusStatus = async (req, res) => {
  try {
    const member = req.member;

    if (!member) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
    }

    // Buscar bonos del usuario
    const bonuses = await prisma.weeklyBonus.findMany({
      where: { userId: member.id },
      orderBy: { createdAt: 'desc' }
    });

    // Buscar bono activo actual
    const activeBonus = await prisma.weeklyBonus.findFirst({
      where: {
        userId: member.id,
        status: 'ACTIVE',
        expiresAt: {
          gt: new Date()
        }
      }
    });

    // Verificar si el usuario tiene acceso maestro por bono
    const hasMasterAccess = activeBonus !== null;

    res.json({
      success: true,
      bonusStatus: {
        hasActiveBonus: hasMasterAccess,
        activeBonus: activeBonus ? {
          id: activeBonus.id,
          activatedAt: activeBonus.activatedAt,
          expiresAt: activeBonus.expiresAt,
          features: activeBonus.features
        } : null,
        purchasedBonuses: bonuses.filter(b => b.status === 'PURCHASED').length,
        totalBonuses: bonuses.length
      },
      config: WEEKLY_BONUS_CONFIG
    });

  } catch (error) {
    console.error('Error obteniendo estado de bonos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Listar todos los bonos del usuario
 */
export const listUserBonuses = async (req, res) => {
  try {
    const member = req.member;

    if (!member) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
    }

    const bonuses = await prisma.weeklyBonus.findMany({
      where: { userId: member.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      bonuses: bonuses.map(bonus => ({
        id: bonus.id,
        amount: bonus.amount,
        currency: bonus.currency,
        status: bonus.status,
        purchaseDate: bonus.purchaseDate,
        activatedAt: bonus.activatedAt,
        expiresAt: bonus.expiresAt,
        paymentMethod: bonus.paymentMethod,
        features: bonus.features
      }))
    });

  } catch (error) {
    console.error('Error listando bonos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Verificar si un usuario tiene acceso maestro por bono
 */
export const checkBonusMasterAccess = async (userId) => {
  try {
    const activeBonus = await prisma.weeklyBonus.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        expiresAt: {
          gt: new Date()
        }
      }
    });

    return activeBonus !== null;
  } catch (error) {
    console.error('Error verificando acceso maestro por bono:', error);
    return false;
  }
};

/**
 * Middleware para verificar acceso maestro incluyendo bonos
 */
export const verifyMasterAccessWithBonus = async (req, res, next) => {
  try {
    const member = req.member;
    
    if (!member) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
    }

    // Verificar acceso maestro regular
    const hasRegularMaster = (member.subscriptionPlan || '').toUpperCase() === 'MAESTRO' || member.isTrialMaestro;
    
    // Verificar acceso maestro por bono
    const hasBonusMaster = await checkBonusMasterAccess(member.id);

    if (hasRegularMaster || hasBonusMaster) {
      req.hasMasterAccess = true;
      req.accessType = hasRegularMaster ? 'subscription' : 'bonus';
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Necesitas plan Maestro o bono semanal activo.',
        suggestion: 'Considera comprar un bono semanal por solo 8,99€'
      });
    }

  } catch (error) {
    console.error('Error verificando acceso maestro:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

export { WEEKLY_BONUS_CONFIG };