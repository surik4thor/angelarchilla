import prisma from '../config/database.js';

// Middleware simple: solo verifica que tenga Premium activo (trial o suscripción)
export const requirePremiumAccess = async (req, res, next) => {
  try {
    if (!req.member) {
      return res.status(401).json({ 
        error: 'Acceso denegado',
        message: 'Debes iniciar sesión para acceder'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.member.id },
      select: {
        id: true,
        email: true,
        role: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionExpiry: true,
        trialActive: true,
        trialExpiry: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // Verificar si es administrador (acceso Premium automático)
    const isAdminByRole = user.role === 'ADMIN';
    const isAdminByEmail = user.email === 'surik4thor@icloud.com' || 
                           process.env.ADMIN_EMAILS?.split(',').includes(user.email);
    
    if (isAdminByRole || isAdminByEmail) {
      req.userAccess = { type: 'admin', status: 'active' };
      return next();
    }

    // Verificar si tiene suscripción Premium activa
    if (user.subscriptionStatus === 'ACTIVE' && user.subscriptionPlan === 'PREMIUM') {
      req.userAccess = { type: 'premium', status: 'active' };
      return next();
    }

    // Verificar si tiene trial activo
    if (user.trialActive && user.trialExpiry) {
      const now = new Date();
      const trialEnd = new Date(user.trialExpiry);
      
      if (now <= trialEnd) {
        const daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
        req.userAccess = { 
          type: 'trial', 
          status: 'active',
          daysRemaining 
        };
        return next();
      }
    }

    // No tiene acceso premium
    return res.status(403).json({
      error: 'Premium requerido',
      message: 'Necesitas una suscripción Premium activa para acceder. ¡Suscríbete por solo €9/mes!',
      actions: {
        startTrial: '/api/subscription/trial',
        subscribe: '/api/subscription/checkout'
      }
    });

  } catch (error) {
    console.error('Error checking premium access:', error);
    res.status(500).json({
      error: 'Error interno',
      message: 'Error verificando acceso premium'
    });
  }
};

// Middleware opcional que proporciona información de acceso pero no bloquea
export const optionalPremiumAccess = async (req, res, next) => {
  try {
    if (!req.member) {
      req.userAccess = { type: 'guest', status: 'none' };
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: req.member.id },
      select: {
        id: true,
        email: true,
        role: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionExpiry: true,
        trialActive: true,
        trialExpiry: true
      }
    });

    if (!user) {
      req.userAccess = { type: 'guest', status: 'none' };
      return next();
    }

    // Verificar si es administrador (acceso Premium automático)
    const isAdminByRole = user.role === 'ADMIN';
    const isAdminByEmail = user.email === 'surik4thor@icloud.com' || 
                           process.env.ADMIN_EMAILS?.split(',').includes(user.email);
    
    if (isAdminByRole || isAdminByEmail) {
      req.userAccess = { type: 'admin', status: 'active' };
      return next();
    }

    // Verificar si tiene suscripción Premium activa
    if (user.subscriptionStatus === 'ACTIVE' && user.subscriptionPlan === 'PREMIUM') {
      req.userAccess = { type: 'premium', status: 'active' };
      return next();
    }

    // Verificar si tiene trial activo
    if (user.trialActive && user.trialExpiry) {
      const now = new Date();
      const trialEnd = new Date(user.trialExpiry);
      
      if (now <= trialEnd) {
        const daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
        req.userAccess = { 
          type: 'trial', 
          status: 'active',
          daysRemaining 
        };
        return next();
      }
    }

    // No tiene acceso premium
    req.userAccess = { type: 'expired', status: 'none' };
    next();

  } catch (error) {
    console.error('Error checking optional premium access:', error);
    req.userAccess = { type: 'error', status: 'none' };
    next();
  }
};

export default { requirePremiumAccess, optionalPremiumAccess };