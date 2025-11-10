import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { config, messages } from '../config/config.js';

// Middleware para requerir nivel de membresía específico
export const requireMembership = (requiredLevels = []) => {
  return (req, res, next) => {
    if (!req.member) {
      return res.status(401).json({
        success: false,
        message: messages.auth.membershipRequired
      });
    }
    const memberLevel = req.member.subscriptionPlan;
    const memberStatus = req.member.subscriptionStatus;
    // Si no se especifican niveles, solo verificar que tenga membresía activa
    if (requiredLevels.length === 0) {
      if (memberStatus !== 'ACTIVE' && memberLevel === 'INVITADO') {
        return res.status(403).json({
          success: false,
          message: 'Se requiere suscripción activa',
          currentLevel: messages.membership[memberLevel.toLowerCase()],
          currentStatus: memberStatus
        });
      }
    } else {
      // Verificar nivel específico
      if (!requiredLevels.includes(memberLevel) || memberStatus !== 'ACTIVE') {
        return res.status(403).json({
          success: false,
          message: 'Tu nivel de suscripción no permite esta acción',
          currentLevel: messages.membership[memberLevel.toLowerCase()],
          currentStatus: memberStatus,
          requiredLevels: requiredLevels.map(level => 
            messages.membership[level.toLowerCase()]
          )
        });
      }
    }
    next();
  };
};
// Middleware opcional: solo añade req.member si el usuario está autenticado, si no, sigue como invitado
export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.arcanaToken) {
      token = req.cookies.arcanaToken;
    }
    if (!token) return next();
  const jwtSecret = process.env.JWT_SECRET || config.jwt.secret || 'arcana-club-secret-key-2025';
  const decoded = jwt.verify(token, jwtSecret);
    if (!decoded.id) return next();
    const member = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionExpiry: true,
        readingsThisMonth: true,
        zodiacSign: true,
        birthDate: true,
        createdAt: true,
        lastLogin: true,
        avatar: true
      }
    });
    if (member) req.member = member;
    next();
  } catch (err) {
    next();
  }
};
// Verificar token JWT para miembros de Arcana Club
export const authenticate = async (req, res, next) => {
  // Función para enviar error sin headers CORS (gestionados globalmente)
  const sendCorsError = (status, obj) => {
    return res.status(status).json(obj);
  };
  try {
    let token;
    // Log para depuración de cookies y headers
    console.log('Cookies recibidas:', req.cookies);
    console.log('Header Authorization:', req.headers.authorization);
    // Obtener token del header Authorization o cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.arcanaToken) {
      token = req.cookies.arcanaToken;
    }

    if (!token) {
      return sendCorsError(401, {
        success: false,
        message: messages.auth.tokenRequired
      });
    }

    // Verificar token
  const jwtSecret = process.env.JWT_SECRET || config.jwt.secret || 'arcana-club-secret-key-2025';
  console.log('[AUTH] Token recibido:', token);
  const decoded = jwt.verify(token, jwtSecret);

    // Verificar que el token tenga ID válido
    if (!decoded.id) {
      return sendCorsError(401, {
        success: false,
        message: 'Token malformado'
      });
    }

    // Obtener miembro del club de la base de datos
    const member = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionExpiry: true,
        readingsThisMonth: true,
        zodiacSign: true,
        birthDate: true,
        createdAt: true,
        lastLogin: true,
        avatar: true,
        trialActive: true,
        trialExpiry: true
      }
    });
    console.log('Usuario autenticado:', member);

    if (!member) {
      return sendCorsError(401, {
        success: false,
        message: messages.auth.userNotFound
      });
    }
    // Verificar si es administrador y darle acceso Premium automático
    const isAdminByRole = member.role === 'ADMIN';
    const isAdminByEmail = member.email === 'surik4thor@icloud.com' || 
                           process.env.ADMIN_EMAILS?.split(',').includes(member.email);
    
    if (isAdminByRole || isAdminByEmail) {
      req.member = {
        ...member,
        subscriptionPlan: 'PREMIUM',
        subscriptionStatus: 'ACTIVE',
        isAdmin: true
      };
    } else if (member.trialActive && member.trialExpiry && new Date() < new Date(member.trialExpiry)) {
      // Si el usuario tiene trial activo y no ha expirado, simular Premium
      req.member = {
        ...member,
        subscriptionPlan: 'PREMIUM',
        subscriptionStatus: 'ACTIVE',
        isTrialPremium: true
      };
    } else {
      req.member = member;
    }
    next();
  } catch (err) {
    return sendCorsError(401, {
      success: false,
      message: messages.auth.invalidToken,
      details: err.message
    });
  }
}

// Verificar límite de lecturas según membresía
export const checkReadingLimit = async (req, res, next) => {
  try {
    if (!req.member) {
      // Para invitados, verificar si es su primera lectura gratuita
      const guestReadingsToday = await checkGuestReadings(req);
      
      if (guestReadingsToday >= 1) {
        return res.status(403).json({
          success: false,
          message: 'Para más lecturas, suscríbete a un plan superior',
          action: 'register_required'
        });
      }
      
      return next(); // Permitir primera lectura gratis
    }
    
    const member = req.member;
    const membershipLevel = member.subscriptionPlan.toLowerCase();
    
    // Obtener límites según membresía
    const limits = config.membershipLimits[membershipLevel];
    
    if (!limits) {
      return res.status(400).json({
        success: false,
        message: 'Nivel de suscripción no reconocido'
      });
    }
    // Los maestros y usuarios en periodo TRIAL tienen acceso ilimitado
    const isTrial = member.trialActive && member.trialExpiry && new Date() < new Date(member.trialExpiry);
    if (membershipLevel === 'maestro' || isTrial) {
      return next();
    }
    // Para invitados, verificar límite diario
    if (membershipLevel === 'invitado') {
      const readingsToday = await getReadingsToday(member.id);
      if (readingsToday >= limits.daily) {
        return res.status(403).json({
          success: false,
          message: 'Has usado tu lectura gratuita. ¡Amplía tu suscripción para más!',
          currentLevel: messages.membership.invitado,
          upgradePrompt: messages.readings.upgradePrompt
        });
      }
    } else {
      // Para otros miembros, verificar límite mensual usando conteo real
      const today = new Date();
      const readingsThisMonth = await prisma.reading.count({
        where: {
          userId: member.id,
          createdAt: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
            lt: new Date(today.getFullYear(), today.getMonth() + 1, 1)
          }
        }
      });
      if (readingsThisMonth >= limits.monthly) {
        return res.status(403).json({
          success: false,
          message: `Has alcanzado tu límite mensual de ${limits.monthly} lecturas`,
          currentLevel: messages.membership[membershipLevel],
          readingsUsed: readingsThisMonth,
          monthlyLimit: limits.monthly,
          upgradePrompt: messages.readings.upgradePrompt
        });
      }
    }
    next();
  } catch (error) {
    console.error('Error verificando límite de lecturas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verificando permisos del club'
    });
  }
};

// Funciones auxiliares
async function getReadingsToday(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return await prisma.reading.count({
    where: {
      userId: userId,
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    }
  });
}

async function checkGuestReadings(req) {
  // Para invitados, usar IP o algún identificador temporal
  const guestId = req.ip || 'unknown';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return await prisma.reading.count({
    where: {
      userId: null,
      anonGender: guestId, // Temporal, usar para tracking
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    }
  });
}

// Middleware para administradores del club
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.member) {
      return res.status(401).json({
        success: false,
        message: messages.auth.tokenRequired
      });
    }
    
    // Obtener el usuario completo con rol
    const user = await prisma.user.findUnique({
      where: { id: req.member.id },
      select: {
        id: true,
        email: true,
        role: true
      }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar si es admin por rol o email especial
    const isAdminByRole = user.role === 'ADMIN';
    const isAdminByEmail = user.email === 'surik4thor@icloud.com' || 
                           process.env.ADMIN_EMAILS?.split(',').includes(user.email);
    
    if (!isAdminByRole && !isAdminByEmail) {
      return res.status(403).json({
        success: false,
        message: 'Se requieren privilegios de administrador'
      });
    }
    
    // Agregar información de admin al request
    req.admin = user;
    next();
  } catch (error) {
    console.error('Error verificando admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verificando permisos de administrador'
    });
  }
};
