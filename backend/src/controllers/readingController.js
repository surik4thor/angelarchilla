import { config, messages } from '../config/config.js';
import prisma from '../config/database.js';
import { selectCards } from '../services/cardSelector.js';
import { interpretReadingAI } from '../services/llmService.js';
import { getLimits, isMaestroOrTrial } from '../helpers/limitHelper.js';

// Endpoint unificado para límite de lecturas (tarot, runas, sueños)
export const getUnifiedLimitStatus = async (req, res) => {
  try {
    const type = (req.query.type || '').toLowerCase();
    // Helper centralizado para límites
    // Invitado real (no autenticado, sin req.member)
    if (!req.member) {
      const guestId = req.ip || 'unknown';
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (type === 'dreams' || type === 'sueños') {
        const guestDreamsToday = await prisma.dream.count({
          where: {
            userId: null,
            createdAt: { gte: today, lt: tomorrow }
          }
        });
        if (guestDreamsToday >= 1) {
          return res.json({
            limited: true,
            message: 'Has usado tu interpretación gratuita de sueños. ¡Únete al club para más!'
          });
        }
        return res.json({ limited: false });
      } else {
        const readingType = type === 'runes' ? 'RUNES' : 'TAROT';
        const guestReadingsToday = await prisma.reading.count({
          where: {
            userId: null,
            anonGender: guestId,
            type: readingType,
            createdAt: { gte: today, lt: tomorrow }
          }
        });
        if (guestReadingsToday >= 1) {
          return res.json({
            limited: true,
            message: `Has usado tu consulta gratuita de ${(type === 'runes') ? 'runas' : 'tarot'}. ¡Únete al club para más!`
          });
        }
        return res.json({ limited: false });
      }
    }
    // Usuario autenticado
    const member = req.member;
    // Si es Maestro o TRIAL, acceso ilimitado
    if (isMaestroOrTrial(member)) {
      return res.json({ limited: false });
    }
    // Lógica de límites para otros planes
    const limits = getLimits(member.subscriptionPlan);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (type === 'dreams' || type === 'sueños') {
      const dreamsToday = await prisma.dream.count({
        where: {
          userId: member.id,
          createdAt: { gte: today, lt: tomorrow }
        }
      });
      const dailyDreams = limits.dailyDreams || 1;
      if (dreamsToday >= dailyDreams) {
        return res.json({
          limited: true,
          message: 'Has alcanzado tu límite diario de interpretaciones de sueños. ¡Hazte premium para más!'
        });
      }
      return res.json({ limited: false });
    } else if (type === 'runes' || type === 'runas' || type === 'tarot') {
      const readingType = type === 'runes' || type === 'runas' ? 'RUNES' : 'TAROT';
      const readingsThisMonth = await prisma.reading.count({
        where: {
          userId: member.id,
          type: readingType,
          createdAt: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
            lt: new Date(today.getFullYear(), today.getMonth() + 1, 1)
          }
        }
      });
      const monthlyLimit = limits.monthly || 1;
      if (readingsThisMonth >= monthlyLimit) {
        return res.json({
          limited: true,
          message: `Has alcanzado tu límite mensual de ${(readingType === 'RUNES') ? 'consultas de runas' : 'lecturas de tarot'} (${monthlyLimit}). ¡Hazte premium para más!`
        });
      }
      return res.json({ limited: false });
    } else {
      return res.json({ limited: false });
    }
  } catch (e) {
    console.error('[getUnifiedLimitStatus] ERROR:', e);
    return res.status(500).json({ limited: false, error: true, message: 'Error interno en el límite de lecturas', details: e.message });
  }
};


export const getReadingLimitStatus = async (req, res) => {
  try {
    const type = (req.query.type || '').toLowerCase();
    // Helper centralizado para límites
    // Invitado real (no autenticado, sin req.member)
    if (!req.member) {
      const guestId = req.ip || 'unknown';
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (type === 'dreams' || type === 'sueños') {
        const guestDreamsToday = await prisma.dream.count({
          where: {
            userId: null,
            createdAt: { gte: today, lt: tomorrow }
          }
        });
        if (guestDreamsToday >= 1) {
          return res.json({
            limited: true,
            message: 'Has usado tu interpretación gratuita de sueños. ¡Únete al club para más!'
          });
        }
        return res.json({ limited: false });
      } else {
        const readingType = type === 'runes' ? 'RUNES' : 'TAROT';
        const guestReadingsToday = await prisma.reading.count({
          where: {
            userId: null,
            anonGender: guestId,
            type: readingType,
            createdAt: { gte: today, lt: tomorrow }
          }
        });
        if (guestReadingsToday >= 1) {
          return res.json({
            limited: true,
            message: `Has usado tu consulta gratuita de ${(type === 'runes') ? 'runas' : 'tarot'}. ¡Únete al club para más!`
          });
        }
        return res.json({ limited: false });
      }
    }
    // Usuario autenticado
    const member = req.member;
    // Si es Maestro o TRIAL, acceso ilimitado
    if (isMaestroOrTrial(member)) {
      return res.json({ limited: false });
    }
    // Lógica de límites para otros planes
    const limits = getLimits(member.subscriptionPlan);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (type === 'dreams' || type === 'sueños') {
      const dreamsToday = await prisma.dream.count({
        where: {
          userId: member.id,
          createdAt: { gte: today, lt: tomorrow }
        }
      });
      const dailyDreams = limits.dailyDreams || 1;
      if (dreamsToday >= dailyDreams) {
        return res.json({
          limited: true,
          message: 'Has alcanzado tu límite diario de interpretaciones de sueños. ¡Hazte premium para más!'
        });
      }
      return res.json({ limited: false });
    } else if (type === 'runes' || type === 'runas' || type === 'tarot') {
      const readingType = type === 'runes' || type === 'runas' ? 'RUNES' : 'TAROT';
      const readingsThisMonth = await prisma.reading.count({
        where: {
          userId: member.id,
          type: readingType,
          createdAt: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
            lt: new Date(today.getFullYear(), today.getMonth() + 1, 1)
          }
        }
      });
      const monthlyLimit = limits.monthly || 1;
      if (readingsThisMonth >= monthlyLimit) {
        return res.json({
          limited: true,
          message: `Has alcanzado tu límite mensual de ${(readingType === 'RUNES') ? 'consultas de runas' : 'lecturas de tarot'} (${monthlyLimit}). ¡Hazte premium para más!`
        });
      }
      return res.json({ limited: false });
    } else {
      return res.json({ limited: false });
    }
  } catch (e) {
    console.error('[getReadingLimitStatus] ERROR:', e);
    return res.status(500).json({ limited: false, error: true, message: 'Error interno en el límite de lecturas', details: e.message });
  }
};

// Crear nueva lectura (tarot o runas)
export const createReading = async (req, res) => {
  try {
    const { type, spreadType, deckType, question, anonBirthDate, anonGender } = req.body;
    const isGuest = !req.member;

    // Validar que exista la pregunta y sus longitudes
    if (!question || question.length < config.readings.question.minLength) {
      return res.status(400).json({ success: false, message: messages.readings.questionTooShort });
    }
    if (question.length > config.readings.question.maxLength) {
      return res.status(400).json({ success: false, message: messages.readings.questionTooLong });
    }

    // Verificar límite de lecturas
    // middleware auth.checkReadingLimit ya lo cubre

    let cards = [];
    let interpretation = '';
    console.log('[createReading] Recibido:', { type, spreadType, deckType, question });
    if (type.toLowerCase() === 'tarot') {
      cards = await selectCards(type, spreadType, deckType);
      console.log('[createReading] Cartas seleccionadas:', cards);
      interpretation = await interpretReadingAI(type, spreadType, question, cards, deckType);
      console.log('[createReading] Interpretación:', interpretation);
    } else if (type.toLowerCase() === 'runes') {
      // Siempre usar elder futhark, sin deckType
      cards = await selectCards(type, spreadType, 'ELDER_FUTHARK');
      console.log('[createReading] Runas seleccionadas:', cards);
      interpretation = await interpretReadingAI(type, spreadType, question, cards, 'ELDER_FUTHARK');
      console.log('[createReading] Interpretación:', interpretation);
    } else {
      return res.status(400).json({ success: false, message: 'Tipo de lectura no soportado' });
    }

    // Guardar en DB
    const reading = await prisma.reading.create({ data: {
      userId: isGuest ? null : req.member.id,
      type,
      spreadType,
      deckType: type.toLowerCase() === 'tarot' ? deckType || null : 'ELDER_FUTHARK',
      question,
      cards,
      interpretation,
      anonBirthDate: isGuest && anonBirthDate ? new Date(anonBirthDate) : null,
      anonGender: isGuest ? anonGender : null
    }});

    res.status(201).json({ success: true, reading });
  } catch (error) {
    console.error('Error crear lectura:', error);
    res.status(500).json({ success: false, message: messages.readings?.processingError || 'Error al procesar la lectura' });
  }
};

// Obtener historial de lecturas de un miembro
export const getReadingHistory = async (req, res) => {
  try {
    const userId = req.member.id;
    // Si el usuario está en trial o es Maestro, historial completo
    if (req.member.isTrialMaestro || (req.member.subscriptionPlan || '').toUpperCase() === 'MAESTRO') {
      const history = await prisma.reading.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      return res.status(200).json({ success: true, history });
    }
    // Para otros planes, puedes limitar el historial si lo deseas (aquí se devuelve todo por defecto)
    const history = await prisma.reading.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, history });
  } catch (error) {
    console.error('Error historial lecturas:', error);
    res.status(500).json({ success: false, message: messages.general.serverError });
  }
};

