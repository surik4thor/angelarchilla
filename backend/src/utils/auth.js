import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getSecret } from './secrets.js';

// Generar JWT token con id y rol
export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    getSecret('jwt_secret', 'arcana-club-secret-key-2025'),
    { expiresIn: getSecret('jwt_expires_in', '7d') }
  );
};

// Verificar JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, getSecret('jwt_secret', 'arcana-club-secret-key-2025'));
  } catch (error) {
    throw new Error('Token inválido');
  }
};

// Hash password
export const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Comparar password
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Middleware de autenticación
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de acceso requerido',
      code: 'UNAUTHORIZED' 
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Token inválido o expirado',
      code: 'FORBIDDEN' 
    });
  }
};

// Middleware para verificar roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Autenticación requerida',
        code: 'UNAUTHORIZED' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Permisos insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS' 
      });
    }

    next();
  };
};

// Generar código de verificación
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Validar email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar fortaleza de contraseña
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    errors: [
      ...(password.length < minLength ? ['La contraseña debe tener al menos 8 caracteres'] : []),
      ...(!hasUpperCase ? ['Debe contener al menos una mayúscula'] : []),
      ...(!hasLowerCase ? ['Debe contener al menos una minúscula'] : []),
      ...(!hasNumbers ? ['Debe contener al menos un número'] : [])
    ]
  };
};