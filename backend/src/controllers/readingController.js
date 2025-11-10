import { config, messages } from '../config/config.js';
import prisma from '../config/database.js';
import { selectCards } from '../services/cardSelector.js';
import { interpretReadingAI } from '../services/llmService.js';
import { getLimits, isMaestroOrTrial } from '../helpers/limitHelper.js';

// Endpoint unificado para límite de lecturas (tarot, runas, sueños)
export const getUnifiedLimitStatus = async (req, res) => {
  try {
    // USUARIOS NO REGISTRADOS: Sin acceso a lecturas
    if (!req.member) {
      return res.json({
        limited: true,
        message: 'Debes registrarte para acceder a las lecturas. ¡Únete a Nebulosa Mágica!',
        action: 'register_required'
      });
    }
    
    // Usuarios Premium (autenticados) - sin límites
    return res.json({ limited: false });
  } catch (e) {
    console.error('[getUnifiedLimitStatus] ERROR:', e);
    return res.status(500).json({ limited: false, error: true, message: 'Error interno en el límite de lecturas', details: e.message });
  }
};


export const getReadingLimitStatus = async (req, res) => {
  try {
    // USUARIOS NO REGISTRADOS: Sin acceso a lecturas
    if (!req.member) {
      return res.json({
        limited: true,
        message: 'Debes registrarte para acceder a las lecturas. ¡Únete a Nebulosa Mágica!',
        action: 'register_required'
      });
    }
    
    // Usuarios Premium (autenticados) - sin límites
    return res.json({ limited: false });
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

    // Sin límites para usuarios Premium

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
    // Usuarios Premium - historial completo sin límites
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

