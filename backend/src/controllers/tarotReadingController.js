import prisma from '../config/database.js';
// import { interpretReadingAI } ...

export const createTarotReading = async (req, res) => {
  try {
    const { deck, spread, question } = req.body;
    // Validar usuario autenticado
    const member = req.member;
    if (!member) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }
    // Validar pregunta
    if (!question || question.length < 10) {
      return res.status(400).json({ success: false, message: 'La pregunta debe tener al menos 10 caracteres.' });
    }
    // Simular Maestro si está en trial activo
    const isMaestro = (member.subscriptionPlan || '').toUpperCase() === 'MAESTRO' || member.isTrialMaestro;
    // Si no es Maestro, validar límites (puedes integrar aquí la lógica centralizada si lo prefieres)
    if (!isMaestro) {
      // Aquí deberías consultar el límite real, pero para simplificar:
      // const limited = await checkTarotLimit(member.id);
      // if (limited) return res.status(403).json({ success: false, message: 'Has alcanzado tu límite de lecturas.' });
    }
    // Seleccionar cartas (simulado)
    const selectedCards = ['El Mago', 'La Sacerdotisa', 'El Sol']; // Simulación
    // Interpretación IA (simulado)
    const interpretation = 'Esta es una interpretación simulada del tarot.';
    // Guardar lectura en el modelo Reading
    const reading = await prisma.reading.create({
      data: {
        userId: member.id,
        type: 'TAROT',
        spreadType: spread,
        deckType: deck,
        question,
        cards: selectedCards,
        interpretation
      }
    });
    res.json({ success: true, reading });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getTarotLimitStatus = async (req, res) => {
  // TODO: Implementar lógica de límite por usuario
  res.json({ limited: false });
};

export const getTarotHistory = async (req, res) => {
  const readings = await prisma.tarotReading.findMany({ where: { userId: req.user.id } });
  res.json({ success: true, readings });
};
