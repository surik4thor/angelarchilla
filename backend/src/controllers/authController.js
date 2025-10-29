import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { config, messages } from '../config/config.js';
import { notifyDiscord } from '../utils/discordNotify.js';

// Generar token JWT para Arcana Club
const generateToken = (id) =>
  jwt.sign({ id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

const createSendToken = (member, statusCode, res) => {
  const token = generateToken(member.id);
  const cookieOptions = {
    expires: new Date(Date.now() + config.jwt.cookieExpiresIn * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: config.server.nodeEnv === 'production',
    sameSite: 'lax'
  };
  res.cookie('arcanaToken', token, cookieOptions);
  // Eliminar password del objeto
  // @ts-ignore
  delete member.password;
  res.status(statusCode).json({
    success: true,
    token,
    member
  });
};

// @desc    Registrar nuevo miembro
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    console.log('Registro recibido:', req.body);
    const { email, password, username, birthDate } = req.body;

    // Verificar existencia
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: messages.auth.userExists });
    }

    // Hash de contraseña
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Calcular signo zodiacal automáticamente
    function getZodiacSign(date) {
      if (!date) return null;
      const d = new Date(date);
      const day = d.getUTCDate();
      const month = d.getUTCMonth() + 1;
      if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'ARIES';
      if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'TAURUS';
      if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'GEMINI';
      if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'CANCER';
      if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'LEO';
      if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'VIRGO';
      if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'LIBRA';
      if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'SCORPIO';
      if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'SAGITTARIUS';
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'CAPRICORN';
      if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'AQUARIUS';
      if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'PISCES';
      return null;
    }

    const zodiacSign = getZodiacSign(birthDate);

    // Crear usuario
    const member = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username: username || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        zodiacSign,
          role: email === 'surik4thor@icloud.com' ? 'ADMIN' : undefined,
          subscriptionPlan: 'INVITADO',
          subscriptionStatus: 'ACTIVE',
          subscriptionExpiry: null,
          readingsThisMonth: 0,
          createdAt: new Date(),
          lastLogin: new Date()
      }
    });

    // Enviar email de bienvenida
    try {
      const { sendReportEmail } = await import('../utils/email.js');
      await sendReportEmail(member.email, {
        subject: process.env.WELCOME_EMAIL_SUBJECT || '¡Bienvenido/a a Arcana Club!',
        html: `<div style='font-family:sans-serif;padding:2em;'>
          <h2>¡Bienvenido/a a Arcana Club!</h2>
          <p>Tu cuenta ha sido creada correctamente.</p>
          <p>Para disfrutar de una experiencia personalizada, completa tu perfil y añade tu fecha de nacimiento:</p>
          <p><a href="https://arcanaclub.es/profile/edit" style="background:#d4af37;color:#232946;padding:1em 2em;border-radius:8px;text-decoration:none;">Completar perfil</a></p>
          <p>¡Gracias por confiar en nosotros!</p>
          <p>Equipo Arcana Club</p>
        </div>`
      });
      // Notificar en Discord canal de registros (no bloquear)
      try { notifyDiscord('registro', `Nuevo usuario: ${member.email} (${member.username || 'sin username'})`); } catch (e) { console.error('notify discord error:', e); }
    } catch (err) {
      console.error('Error enviando email de bienvenida:', err);
    }
    createSendToken(member, 201, res);
  } catch (error) {
    console.error('Error registrar miembro:', error);
    if (error && error.stack) console.error(error.stack);
    res.status(500).json({ success: false, message: messages.general.serverError });
  }
};

// @desc    Login de miembro
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    console.log('Login recibido:', req.body);
    const { email, password } = req.body;
    const member = await prisma.user.findUnique({ where: { email } });

    if (!member || !(await bcrypt.compare(password, member.password))) {
      return res.status(401).json({ success: false, message: messages.auth.invalidCredentials });
    }

    // Actualizar último login
    member.lastLogin = new Date();
    await prisma.user.update({
      where: { id: member.id },
      data: { lastLogin: member.lastLogin }
    });

    createSendToken(member, 200, res);
  } catch (error) {
    console.error('Error login miembro:', error);
    if (error && error.stack) console.error(error.stack);
    res.status(500).json({ success: false, message: messages.general.serverError });
  }
};

// @desc    Logout de miembro
// @route   POST /api/auth/logout
// @access  Private
export const logout = (req, res) => {
  res.cookie('arcanaToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ success: true, message: messages.auth.loggedOut });
};

// @desc    Obtener perfil de miembro
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const member = await prisma.user.findUnique({
      where: { id: req.member.id },
      select: {
        id: true,
        email: true,
        username: true,
        birthDate: true,
        zodiacSign: true,
        role: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionExpiry: true,
        readingsThisMonth: true,
        createdAt: true,
        lastLogin: true
      }
    });
    res.status(200).json({ success: true, member });
  } catch (error) {
    console.error('Error obtener perfil:', error);
    res.status(500).json({ success: false, message: messages.general.serverError });
  }
};

// @desc    Actualizar perfil de miembro
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const updates = {};
    const {
      username,
      birthDate,
      bio,
      firstName,
      lastName,
      location,
      phone,
      website,
      interests,
      email,
      currentPassword,
      newPassword
    } = req.body;

    if (username !== undefined) updates.username = username;
    if (birthDate !== undefined) updates.birthDate = birthDate ? new Date(birthDate) : null;
    if (bio !== undefined) updates.bio = bio;
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (location !== undefined) updates.location = location;
    if (phone !== undefined) updates.phone = phone;
    if (website !== undefined) updates.website = website;
    if (Array.isArray(interests)) updates.interests = interests;
    if (email !== undefined) updates.email = email;

    // Recalcular signo zodiacal si cambia la fecha de nacimiento
    function getZodiacSign(date) {
      if (!date) return null;
      const d = new Date(date);
      const day = d.getUTCDate();
      const month = d.getUTCMonth() + 1;
      if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'ARIES';
      if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'TAURUS';
      if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'GEMINI';
      if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'CANCER';
      if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'LEO';
      if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'VIRGO';
      if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'LIBRA';
      if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'SCORPIO';
      if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'SAGITTARIUS';
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'CAPRICORN';
      if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'AQUARIUS';
      if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'PISCES';
      return null;
    }
    if (birthDate !== undefined) updates.zodiacSign = getZodiacSign(birthDate);

    if (currentPassword && newPassword) {
      const member = await prisma.user.findUnique({ where: { id: req.member.id } });
      if (!(await bcrypt.compare(currentPassword, member.password))) {
        return res.status(400).json({ success: false, message: messages.auth.passwordIncorrect });
      }
      const salt = await bcrypt.genSalt(12);
      updates.password = await bcrypt.hash(newPassword, salt);
    }

    const updated = await prisma.user.update({
      where: { id: req.member.id },
      data: updates
    });

    res.status(200).json({ success: true, message: messages.auth.profileUpdated, member: updated });
  } catch (error) {
    console.error('Error actualizar perfil:', error);
    res.status(500).json({ success: false, message: messages.general.serverError });
  }
};
