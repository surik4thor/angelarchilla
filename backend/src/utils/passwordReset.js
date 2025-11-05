// backend/src/utils/passwordReset.js
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Genera un token seguro para reset de contraseña
 * @returns {string} Token de 32 caracteres hexadecimales
 */
export function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Guarda el token de reset en la base de datos
 * @param {string} email - Email del usuario
 * @param {string} token - Token de reset
 * @returns {Promise<boolean>} True si se guardó correctamente
 */
export async function saveResetToken(email, token) {
  try {
    // Expira en 1 hora
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    
    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error guardando token de reset:', error);
    return false;
  }
}

/**
 * Valida un token de reset
 * @param {string} token - Token a validar
 * @returns {Promise<Object|null>} Usuario si el token es válido, null si no
 */
export async function validateResetToken(token) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date() // Token no expirado
        }
      }
    });
    
    return user;
  } catch (error) {
    console.error('Error validando token de reset:', error);
    return null;
  }
}

/**
 * Limpia el token de reset después de usarlo
 * @param {string} userId - ID del usuario
 */
export async function clearResetToken(userId) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });
  } catch (error) {
    console.error('Error limpiando token de reset:', error);
  }
}

/**
 * Verifica si un usuario puede solicitar reset (evita spam)
 * @param {string} email - Email del usuario
 * @returns {Promise<boolean>} True si puede solicitar, false si debe esperar
 */
export async function canRequestReset(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { resetPasswordExpires: true }
    });
    
    // Si no hay token existente o ya expiró, puede solicitar
    if (!user || !user.resetPasswordExpires) {
      return true;
    }
    
    // Si el token expira en más de 50 minutos, debe esperar
    // Esto evita spam permitiendo máximo 1 solicitud cada 10 minutos
    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
    
    return user.resetPasswordExpires < tenMinutesFromNow;
  } catch (error) {
    console.error('Error verificando si puede solicitar reset:', error);
    return false;
  }
}