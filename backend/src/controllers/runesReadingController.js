import prisma from '../config/database.js';
// import { interpretReadingAI } ...

export const createRunesReading = async (req, res) => {
  try {
    console.log('[RUNES] Body recibido:', req.body);
    const { spreadType, question } = req.body;
    const member = req.member;
    console.log('[RUNES] Usuario:', member);
    if (!member) {
      console.error('[RUNES] Usuario no autenticado');
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }
    if (!question || question.length < 10) {
      console.error('[RUNES] Pregunta inválida:', question);
      return res.status(400).json({ success: false, message: 'La pregunta debe tener al menos 10 caracteres.' });
    }
    // Simular Maestro si está en trial activo
    const isMaestro = (member.subscriptionPlan || '').toUpperCase() === 'MAESTRO' || member.isTrialMaestro;
    // Si no es Maestro, aquí podrías consultar el límite real
    // Simulación de runas seleccionadas
    const selectedRunes = ['Fehu', 'Ansuz', 'Raidho'];
    const interpretation = 'Esta es una interpretación simulada de runas.';
    console.log('[RUNES] Datos a guardar:', {
      userId: member.id,
      type: 'RUNES',
      spreadType,
      deckType: 'elder-futhark',
      question,
      cards: selectedRunes,
      interpretation
    });
    // Guardar lectura en el modelo Reading
    const reading = await prisma.reading.create({
      data: {
        userId: member.id,
        type: 'RUNES',
        spreadType,
        deckType: 'elder-futhark',
        question,
        cards: selectedRunes,
        interpretation
      }
    });
    console.log('[RUNES] Lectura guardada:', reading);
    res.json({ success: true, reading });
  } catch (err) {
    console.error('[RUNES] ERROR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getRunesLimitStatus = async (req, res) => {
  // TODO: Implementar lógica de límite por usuario
  res.json({ limited: false });
};

export const getRunesHistory = async (req, res) => {
  const readings = await prisma.runesReading.findMany({ where: { userId: req.user.id } });
  res.json({ success: true, readings });
};
