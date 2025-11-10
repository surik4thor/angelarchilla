import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { interpretDreamAI } from '../services/llmService.js';

// Nuevo middleware simplificado
import { checkSinglePlanFeatureAccess } from '../middleware/singlePlanLimits.js';

// Legacy middleware (mantener por compatibilidad temporal)
import { checkDreamLimits, checkFeatureAccess } from '../middleware/subscriptionLimits.js';

const prisma = new PrismaClient();
const router = express.Router();

// Obtener estado de límites - sin límites para usuarios Premium
router.get('/limit-status', authenticate, async (req, res) => {
  try {
    if (!req.member) {
      return res.json({ 
        limited: true,
        message: 'Debes registrarte para acceder a interpretaciones de sueños'
      });
    }

    // Usuarios Premium - sin límites
    res.json({ 
      limited: false,
      plan: 'PREMIUM'
    });
  } catch (err) {
    console.error('Error en limit-status:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Solo requiere Premium activo (trial o suscripción)
import { requirePremiumAccess } from '../middleware/premiumAccess.js';

// Crear sueño - requiere Premium activo
router.post('/', authenticate, requirePremiumAccess, async (req, res) => {
  try {
    const { date, text, feelings } = req.body;
    console.log('[POST /dreams] req.member:', req.member);
    console.log('[POST /dreams] body:', req.body);
    if (!req.member || !req.member.id) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    if (!date || !text) {
      return res.status(400).json({ error: 'Faltan campos requeridos: date o text' });
    }
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Formato de fecha inválido' });
    }

    // Preparar datos para IA con userId incluido
    const dreamData = {
      text,
      feelings: feelings || [],
      date: parsedDate.toISOString(),
      userId: req.member.id
    };

    // Interpretación por IA
    let interpretation = '';
    try {
      interpretation = await interpretDreamAI(dreamData);
    } catch (aiError) {
      console.error('[POST /dreams] Error IA:', aiError);
      interpretation = 'No se pudo obtener interpretación por IA.';
    }
    // Asegurar que feelings sea array
    const feelingsArray = Array.isArray(feelings) 
      ? feelings 
      : feelings ? [feelings] : [];

    const dream = await prisma.dream.create({
      data: {
        userId: req.member.id,
        dreamText: text,
        date: parsedDate,
        feelings: feelingsArray,
        interpretation
      }
    });
    res.json({ dream });
  } catch (error) {
    console.error('[POST /dreams] Error:', error);
  // CORS headers gestionados globalmente
    res.status(500).json({ error: 'Error al guardar el sueño', details: error.message });
  }
});

// Obtener sueños del usuario - requiere Premium activo
router.get('/history', authenticate, requirePremiumAccess, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const dreams = await prisma.dream.findMany({
      where: { userId: req.member.id },
      orderBy: { date: 'desc' },
      skip: offset,
      take: limit,
      select: {
        id: true,
        dreamText: true,
        feelings: true,
        interpretation: true,
        date: true,
        createdAt: true
      }
    });

    const total = await prisma.dream.count({
      where: { userId: req.member.id }
    });

    res.json({ 
      success: true,
      dreams,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[GET /dreams/history] Error:', error);
    res.status(500).json({ error: 'Error al obtener el diario de sueños', details: error.message });
  }
});

export default router;
