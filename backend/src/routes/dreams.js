import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { interpretDreamAI } from '../services/llmService.js';

const prisma = new PrismaClient();
const router = express.Router();

// Obtener estado de límites
router.get('/limit-status', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const dreamsThisMonth = await prisma.dream.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    const limits = {
      INVITADO: 1,
      INICIADO: 5,
      ADEPTO: 15,
      MAESTRO: 999
    };
    
    const userLimit = limits[user.subscriptionPlan] || 1;
    const remaining = Math.max(0, userLimit - dreamsThisMonth);
    
    res.json({ 
      limited: dreamsThisMonth >= userLimit,
      used: dreamsThisMonth,
      limit: userLimit,
      remaining: remaining,
      plan: user.subscriptionPlan
    });
  } catch (err) {
    console.error('Error en limit-status:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Crear sueño
router.post('/', authenticate, async (req, res) => {
  try {
    const { date, text, feelings } = req.body;
    console.log('[POST /dreams] req.user:', req.user);
    console.log('[POST /dreams] body:', req.body);
    if (!req.user || !req.user.id) {
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
      userId: req.user.id
    };

    // Interpretación por IA
    let interpretation = '';
    try {
      interpretation = await interpretDreamAI(dreamData);
    } catch (aiError) {
      console.error('[POST /dreams] Error IA:', aiError);
      interpretation = 'No se pudo obtener interpretación por IA.';
    }
    const dream = await prisma.dream.create({
      data: {
        userId: req.user.id,
        dreamText: text,
        date: parsedDate,
        feelings: feelings || [],
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

// Obtener sueños del usuario
router.get('/history', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const dreams = await prisma.dream.findMany({
      where: { userId: req.user.id },
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
      where: { userId: req.user.id }
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
