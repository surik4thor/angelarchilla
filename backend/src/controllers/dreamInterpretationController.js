import prisma from '../config/database.js';
import { interpretDreamAI } from '../services/llmService.js';

export const createDreamInterpretation = async (req, res) => {
  try {
    const { dreamText, feelings, date } = req.body;
    
    // Validaciones básicas
    if (!dreamText || dreamText.trim().length < 10) {
      return res.status(400).json({ 
        success: false, 
        error: 'El sueño debe tener al menos 10 caracteres' 
      });
    }
    
    if (!Array.isArray(feelings) || feelings.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Debe seleccionar al menos una sensación' 
      });
    }

    // Validar límites según plan de suscripción
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

    // Límites según plan
    const limits = {
      INVITADO: 1,
      INICIADO: 5,
      ADEPTO: 15,
      MAESTRO: 999
    };
    
    const userLimit = limits[user.subscriptionPlan] || 1;
    
    if (dreamsThisMonth >= userLimit) {
      return res.status(429).json({
        success: false,
        error: `Has alcanzado el límite de ${userLimit} interpretaciones de sueños para tu plan ${user.subscriptionPlan}`,
        limit: userLimit,
        used: dreamsThisMonth
      });
    }

    // Preparar datos para IA
    const dreamData = {
      text: dreamText.trim(),
      feelings: feelings,
      date: date || new Date().toISOString(),
      userId: user.id
    };

    // Obtener interpretación de IA
    let interpretation = '';
    try {
      interpretation = await interpretDreamAI(dreamData);
    } catch (aiError) {
      console.error('Error en interpretación IA:', aiError);
      interpretation = 'No se pudo obtener interpretación por IA en este momento. Por favor, intenta más tarde.';
    }

    // Guardar en base de datos
    const dream = await prisma.dream.create({
      data: {
        userId: user.id,
        dreamText: dreamData.text,
        feelings: dreamData.feelings,
        interpretation,
        date: new Date(dreamData.date),
      }
    });

    res.json({ 
      success: true, 
      dream: {
        id: dream.id,
        dreamText: dream.dreamText,
        feelings: dream.feelings,
        interpretation: dream.interpretation,
        date: dream.date,
        createdAt: dream.createdAt
      }
    });
  } catch (err) {
    console.error('Error en createDreamInterpretation:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const getDreamLimitStatus = async (req, res) => {
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
    console.error('Error en getDreamLimitStatus:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const getDreamHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const dreams = await prisma.dream.findMany({ 
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
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
  } catch (err) {
    console.error('Error en getDreamHistory:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};
