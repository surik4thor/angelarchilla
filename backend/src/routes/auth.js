import rateLimit from 'express-rate-limit';
// Rate limiting estricto para login y registro
const sensitiveLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 10,
  message: 'Demasiados intentos, espera 10 minutos para volver a intentarlo.'
});
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { authenticate } from '../middleware/auth.js';
import { validateRegister, validateUpdateProfile } from '../middleware/validation.js';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';

const prisma = new PrismaClient();
const router = express.Router();

// Eliminar cuenta del usuario autenticado
router.delete('/account', authenticate, async (req, res) => {
  try {
    const userId = req.member.id;
    const email = req.member.email;
    // Eliminar consentimientos
    await prisma.consentimientoNewsletter.deleteMany({ where: { userId } });
    // Eliminar usuario de la tabla correcta (users)
    await prisma.user.delete({ where: { id: userId }});
    // Baja total en Brevo
    try {
      const { deleteContactFromBrevo } = await import('../utils/email.js');
      await deleteContactFromBrevo(email);
    } catch (err) {
      console.error('Error al eliminar contacto en Brevo:', err.message);
    }
    res.json({ success: true });
  } catch (error) {
    // Si el usuario no existe, devolver éxito para idempotencia
    if (error.code === 'P2025') {
      res.json({ success: true, info: 'Usuario ya eliminado' });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

// Actualizar preferencias de notificación
router.put('/notifications', authenticate, async (req, res) => {
  try {
    const { preferences } = req.body;
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ error: 'Preferencias inválidas' });
    }
    const updated = await prisma.user.update({
      where: { id: req.member.id },
      data: { preferences }
    });
    res.json({ user: updated });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando preferencias', details: error.message });
  }
});

// Servir archivos estáticos de avatars
const avatarsPath = path.join(process.cwd(), 'uploads/avatars');
router.use('/uploads/avatars', express.static(avatarsPath));

// Configuración de multer para subir archivos
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const upload = multer({
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
    }
  }
});

// Registro
import { addContactToNewsletter, sendDoubleOptIn } from '../utils/email.js';

router.post('/register', sensitiveLimiter, validateRegister, async (req, res) => {
  const { email, password, role, birthDate, username, acceptLegal, acceptNewsletter } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }
  if (!acceptLegal) {
    return res.status(400).json({ error: 'Debes aceptar los términos legales para registrarte.' });
  }
  try {
    const hashed = await hashPassword(password);
    let userRole = 'USER';
    // Permitir crear admin solo si el email es especial o el rol es seguro
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');
    if (role && role === 'ADMIN' && (adminEmails.includes(email) || email === 'surik4thor@icloud.com')) {
      userRole = role;
    }
    // Permitir crear otros roles especiales
    if (role && ['ECOMMERCE', 'BLOG'].includes(role)) {
      userRole = role;
    }
    // Función para calcular el signo zodiacal
    function getZodiacSign(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      const day = date.getUTCDate();
      const month = date.getUTCMonth() + 1;
      const zodiac = [
        { sign: 'Acuario', from: [1, 20], to: [2, 18] },
        { sign: 'Piscis', from: [2, 19], to: [3, 20] },
        { sign: 'Aries', from: [3, 21], to: [4, 19] },
        { sign: 'Tauro', from: [4, 20], to: [5, 20] },
        { sign: 'Géminis', from: [5, 21], to: [6, 20] },
        { sign: 'Cáncer', from: [6, 21], to: [7, 22] },
        { sign: 'Leo', from: [7, 23], to: [8, 22] },
        { sign: 'Virgo', from: [8, 23], to: [9, 22] },
        { sign: 'Libra', from: [9, 23], to: [10, 22] },
        { sign: 'Escorpio', from: [10, 23], to: [11, 21] },
        { sign: 'Sagitario', from: [11, 22], to: [12, 21] },
        { sign: 'Capricornio', from: [12, 22], to: [1, 19] }
      ];
      for (const z of zodiac) {
        if (
          (month === z.from[0] && day >= z.from[1]) ||
          (month === z.to[0] && day <= z.to[1])
        ) {
          return z.sign;
        }
      }
      return null;
    }

    const zodiacSign = birthDate ? getZodiacSign(birthDate) : null;

    const userData = {
      email,
      password: hashed,
      role: userRole,
      subscriptionPlan: 'INVITADO',
      subscriptionStatus: 'ACTIVE',
      ...(birthDate && { birthDate: new Date(birthDate) }),
      ...(zodiacSign && { zodiacSign }),
      ...(username && { username })
    };
    console.log('Datos enviados a prisma.user.create:', userData);
    const user = await prisma.user.create({ data: userData });
    // Registrar consentimiento en BD
    if (acceptNewsletter) {
      await prisma.consentimientoNewsletter.create({
        data: {
          email: user.email,
          user: { connect: { id: user.id } },
          acceptedAt: new Date(),
          ip: req.ip,
          acceptedLegal: true,
          acceptedNewsletter: true
        }
      });
      // Sincronizar con Brevo y enviar doble opt-in
      try {
        await addContactToNewsletter(user.email, user);
        await sendDoubleOptIn(user.email);
      } catch (err) {
        console.error('Error Brevo/doble opt-in en registro:', err.message);
      }
    }
    const token = generateToken(user.id, user.role);
    console.log('Token generado para usuario:', user.email, token);
    res.json({ user: { id: user.id, email: user.email, role: user.role }, token });
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(400).json({ error: 'Email ya registrado' });
    }
    console.error('Error detallado en registro:', e);
    res.status(500).json({ error: 'Error interno al registrar usuario', details: e.message });
  }
});

// Login
router.post('/login', sensitiveLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const token = generateToken(user.id, user.role);
    res.json({ user: { id: user.id, email: user.email, role: user.role }, token });
  } catch (e) {
    res.status(500).json({ error: 'Error interno al iniciar sesión' });
  }
});

// Solicitar recuperación de contraseña
import { 
  generateResetToken, 
  saveResetToken, 
  canRequestReset,
  validateResetToken,
  clearResetToken
} from '../utils/passwordReset.js';
import { sendPasswordResetEmail } from '../utils/email.js';

router.post('/forgot-password', sensitiveLimiter, async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'El email es obligatorio' });
  }

  try {
    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: { id: true, email: true, username: true }
    });

    // Por seguridad, siempre respondemos con éxito, incluso si el usuario no existe
    if (!user) {
      return res.json({ 
        success: true, 
        message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación.' 
      });
    }

    // Verificar que puede solicitar reset (anti-spam)
    const canRequest = await canRequestReset(email);
    if (!canRequest) {
      return res.status(429).json({ 
        error: 'Ya se envió un enlace de recuperación recientemente. Espera 10 minutos antes de solicitar otro.' 
      });
    }

    // Generar token y guardarlo
    const resetToken = generateResetToken();
    const saved = await saveResetToken(email, resetToken);
    
    if (!saved) {
      return res.status(500).json({ error: 'Error interno. Inténtalo de nuevo.' });
    }

    // Enviar email
    await sendPasswordResetEmail(email, resetToken, user.username);

    res.json({ 
      success: true, 
      message: 'Te hemos enviado un enlace de recuperación a tu email. Revisa tu bandeja de entrada y spam.' 
    });

  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ error: 'Error interno. Inténtalo de nuevo más tarde.' });
  }
});

// Validar token de reset (opcional - para verificar antes de mostrar formulario)
router.get('/validate-reset-token/:token', async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ error: 'Token requerido' });
  }

  try {
    const user = await validateResetToken(token);
    
    if (!user) {
      return res.status(400).json({ 
        error: 'Token inválido o expirado',
        expired: true
      });
    }

    res.json({ 
      success: true, 
      message: 'Token válido',
      email: user.email 
    });

  } catch (error) {
    console.error('Error validando token:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Restablecer contraseña
router.post('/reset-password', sensitiveLimiter, async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    // Validar token
    const user = await validateResetToken(token);
    
    if (!user) {
      return res.status(400).json({ 
        error: 'Token inválido o expirado. Solicita un nuevo enlace de recuperación.',
        expired: true
      });
    }

    // Hashear nueva contraseña
    const hashedPassword = await hashPassword(password);

    // Actualizar contraseña y limpiar token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    res.json({ 
      success: true, 
      message: 'Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.' 
    });

  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({ error: 'Error interno. Inténtalo de nuevo.' });
  }
});

// Ruta para obtener usuario autenticado
router.get('/me', authenticate, async (req, res) => {
  try {
    if (!req.member) {
      // Si no hay usuario autenticado, devolver siempre { member: null }
      return res.status(200).json({ member: null });
    }
    const userId = req.member.id;
    // Buscar consentimiento activo de newsletter
    const newsletterConsent = await prisma.consentimientoNewsletter.findFirst({
      where: {
        userId,
        acceptedNewsletter: true
      }
    });
    const isNewsletterSubscribed = !!newsletterConsent;

    // Obtener horóscopo del día si el usuario tiene signo
    let horoscopeToday = null;
    if (req.member.zodiacSign) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const cache = await prisma.horoscopeCache.findFirst({
        where: {
          zodiacSign: req.member.zodiacSign,
          date: today
        }
      });
      if (cache) horoscopeToday = cache.content;
    }

    res.json({
      member: { ...req.member, role: req.member.role, horoscopeToday },
      isNewsletterSubscribed
    });
  } catch (error) {
    res.status(500).json({ error: 'Error consultando perfil', details: error.message });
  }
});

// Actualizar perfil del usuario autenticado
router.put('/profile', authenticate, validateUpdateProfile, async (req, res) => {
  try {
    const { username, email, birthDate } = req.body;
    // Calcular signo zodiacal si se actualiza la fecha de nacimiento
    let zodiacSign;
    if (birthDate) {
      const date = new Date(birthDate);
      const day = date.getUTCDate();
      const month = date.getUTCMonth() + 1;
      const zodiac = [
        { sign: 'Acuario', from: [1, 20], to: [2, 18] },
        { sign: 'Piscis', from: [2, 19], to: [3, 20] },
        { sign: 'Aries', from: [3, 21], to: [4, 19] },
        { sign: 'Tauro', from: [4, 20], to: [5, 20] },
        { sign: 'Géminis', from: [5, 21], to: [6, 20] },
        { sign: 'Cáncer', from: [6, 21], to: [7, 22] },
        { sign: 'Leo', from: [7, 23], to: [8, 22] },
        { sign: 'Virgo', from: [8, 23], to: [9, 22] },
        { sign: 'Libra', from: [9, 23], to: [10, 22] },
        { sign: 'Escorpio', from: [10, 23], to: [11, 21] },
        { sign: 'Sagitario', from: [11, 22], to: [12, 21] },
        { sign: 'Capricornio', from: [12, 22], to: [1, 19] }
      ];
      for (const z of zodiac) {
        const [fromMonth, fromDay] = z.from;
        const [toMonth, toDay] = z.to;
        if (
          (month === fromMonth && day >= fromDay) ||
          (month === toMonth && day <= toDay)
        ) {
          zodiacSign = z.sign;
          break;
        }
      }
    }
    // Actualizar usuario
    const updated = await prisma.user.update({
      where: { id: req.member.id },
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(birthDate && { birthDate: new Date(birthDate) }),
        ...(zodiacSign && { zodiacSign })
      }
    });
    res.json({ member: updated });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando perfil', details: error.message });
  }
});

// Subir foto de avatar
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió archivo de avatar' });
    }
    // Convertir y redimensionar la imagen a JPEG 256x256
    const avatarDir = path.join(process.cwd(), 'uploads/avatars');
    const filename = `${req.member.id}-${Date.now()}.jpg`;
    const filepath = path.join(avatarDir, filename);
    await sharp(req.file.buffer)
      .resize(256, 256, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(filepath);
    const avatarUrl = `/uploads/avatars/${filename}`;
    const updated = await prisma.user.update({
      where: { id: req.member.id },
      data: { avatar: avatarUrl }
    });
    res.json({ member: updated, avatarUrl });
  } catch (error) {
    res.status(500).json({ error: 'Error subiendo avatar', details: error.message });
  }
});

// Eliminar avatar
router.delete('/avatar', authenticate, async (req, res) => {
  try {
    const updated = await prisma.user.update({
      where: { id: req.member.id },
      data: { avatar: null }
    });
    res.json({ user: updated });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando avatar', details: error.message });
  }
});

// Cambiar contraseña
router.put('/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Se requiere la contraseña actual y la nueva contraseña' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar contraseña actual
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !(await comparePassword(currentPassword, user.password))) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    }

    // Hashear y actualizar nueva contraseña
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error cambiando contraseña', details: error.message });
  }
});

export default router;
