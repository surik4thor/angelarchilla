import prisma from '../config/database.js';
import { generarLecturaAngeles } from '../services/openai-angeles.js';
import { generarLecturaEgipcia } from '../services/openai-egipcio.js';
import { generarLecturaRiderWaite } from '../services/openai-rider-waite.js';
import { generarLecturaMarsella } from '../services/openai-marsella.js';
import { checkBonusMasterAccess } from './weeklyBonusController.js';
// import { interpretReadingAI } ...

export const createTarotReading = async (req, res) => {
  try {
    const { deck, spread, question } = req.body;
    // Validar usuario autenticado (middleware ya garantiza Premium activo)
    const member = req.member;
    if (!member) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }
    // Validar pregunta
    if (!question || question.length < 10) {
      return res.status(400).json({ success: false, message: 'La pregunta debe tener al menos 10 caracteres.' });
    }
    // Generar lectura según el tipo de baraja
    let selectedCards, interpretation;
    
    if (deck === 'tarot-angeles') {
      // Lectura angelical con IA
      const angelReading = await generarLecturaAngeles(spread, question, member.id);
      selectedCards = angelReading.cards.map(card => card.angel);
      interpretation = JSON.stringify(angelReading);
    } else if (deck === 'tarot-egipcio') {
      // Lectura egipcia con IA
      const egyptianReading = await generarLecturaEgipcia(spread, question, member.id);
      selectedCards = egyptianReading.cards.map(card => card.deity);
      interpretation = JSON.stringify(egyptianReading);
    } else if (deck === 'rider-waite') {
      // Lectura Rider-Waite con IA especializada
      const riderWaiteReading = await generarLecturaRiderWaite(selectedCards, question, spread);
      selectedCards = ['El Mago', 'La Sacerdotisa', 'El Sol']; // Simular por ahora
      interpretation = riderWaiteReading;
    } else if (deck === 'marsella') {
      // Lectura Tarot de Marsella con IA especializada
      const marsellaReading = await generarLecturaMarsella(selectedCards, question, spread);
      selectedCards = ['Le Bateleur', 'La Papesse', 'Le Soleil']; // Simular por ahora
      interpretation = marsellaReading;
    } else {
      // Tarot tradicional genérico (fallback)
      selectedCards = ['El Mago', 'La Sacerdotisa', 'El Sol']; // Simulación
      interpretation = 'Esta es una interpretación simulada del tarot tradicional.';
    }
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
  // Sin límites para usuarios Premium - siempre unlimited
  res.json({ limited: false });
};

export const getTarotHistory = async (req, res) => {
  const readings = await prisma.tarotReading.findMany({ where: { userId: req.user.id } });
  res.json({ success: true, readings });
};
