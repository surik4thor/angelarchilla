import prisma from '../config/database.js';
import { selectCards } from '../services/cardSelector.js';
import { interpretReadingAI } from '../services/llmService.js';

// Controlador simplificado - solo verifica Premium activo
export const createReading = async (req, res) => {
  try {
    const { type, question, deckType, spreadType, cards } = req.body;

    if (!req.member) {
      return res.status(401).json({
        error: 'Autenticación requerida',
        message: 'Debes iniciar sesión para realizar lecturas'
      });
    }

    // El middleware ya verificó que tiene Premium activo
    console.log(`User ${req.member.id} creating ${type} reading with ${req.userAccess?.type} access`);

    // Validaciones básicas
    if (!type || !['tarot', 'runes', 'TAROT', 'RUNES'].includes(type)) {
      return res.status(400).json({
        error: 'Tipo de lectura inválido',
        message: 'El tipo debe ser "tarot", "runes", "TAROT" o "RUNES"'
      });
    }

    if (!question || question.length < 5) {
      return res.status(400).json({
        error: 'Pregunta inválida',
        message: 'La pregunta debe tener al menos 5 caracteres'
      });
    }

    if (question.length > 500) {
      return res.status(400).json({
        error: 'Pregunta demasiado larga',
        message: 'La pregunta no puede exceder 500 caracteres'
      });
    }

    // Seleccionar cartas/runas si no se proporcionaron
    let selectedCards = cards;
    if (!selectedCards) {
      selectedCards = await selectCards(type, spreadType, deckType);
    }

    // Generar interpretación con IA
    const interpretation = await interpretReadingAI(type, spreadType, question, selectedCards, deckType);

    // Guardar la lectura
    const reading = await prisma.reading.create({
      data: {
        user: {
          connect: { id: req.member.id }
        },
        type: type.toUpperCase(), // Convertir a mayúsculas para el enum
        question,
        deckType: deckType || 'rider_waite',
        spreadType: spreadType || 'tres_cartas',
        cards: selectedCards,
        interpretation
      }
    });

    res.json({
      success: true,
      reading: {
        id: reading.id,
        type: reading.type,
        question: reading.question,
        cards: reading.cards,
        interpretation: reading.interpretation,
        createdAt: reading.createdAt
      },
      accessInfo: req.userAccess
    });

  } catch (error) {
    console.error('Error creating reading:', error);
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al crear la lectura. Inténtalo de nuevo.'
    });
  }
};

// Obtener historial de lecturas
export const getReadingHistory = async (req, res) => {
  try {
    if (!req.member) {
      return res.status(401).json({
        error: 'Autenticación requerida'
      });
    }

    // El middleware ya verificó que tiene Premium activo
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [readings, total] = await Promise.all([
      prisma.reading.findMany({
        where: { userId: req.member.id },
        select: {
          id: true,
          type: true,
          question: true,
          cards: true,
          interpretation: true,
          createdAt: true,
          deckType: true,
          spreadType: true
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.reading.count({
        where: { userId: req.member.id }
      })
    ]);

    res.json({
      success: true,
      readings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      accessInfo: req.userAccess
    });

  } catch (error) {
    console.error('Error getting reading history:', error);
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al obtener el historial de lecturas'
    });
  }
};

// Estado de acceso simplificado
export const getAccessStatus = async (req, res) => {
  try {
    // Si no está autenticado, responder con información básica
    if (!req.member) {
      return res.json({
        hasAccess: false,
        accessType: 'guest',
        message: 'Regístrate y activa tu prueba gratuita de 7 días para acceder a todas las lecturas',
        actions: {
          register: '/api/auth/register',
          trial: '/api/subscription/trial'
        }
      });
    }

    // El middleware opcional ya estableció req.userAccess
    const hasAccess = req.userAccess?.status === 'active';
    
    let message = '';
    let actions = {};

    if (!hasAccess) {
      message = 'Tu acceso ha expirado. Suscríbete para continuar disfrutando de todas las funciones';
      actions = {
        subscribe: '/api/subscription/checkout',
        pricing: '/api/subscription/pricing'
      };
    } else {
      if (req.userAccess.type === 'trial') {
        message = `Tienes ${req.userAccess.daysRemaining} días restantes de prueba gratuita`;
        actions = {
          subscribe: '/api/subscription/checkout'
        };
      } else {
        message = 'Acceso Premium activo - disfruta de todas las funciones ilimitadas';
      }
    }

    res.json({
      hasAccess,
      accessType: req.userAccess?.type || 'none',
      status: req.userAccess?.status || 'none',
      message,
      actions
    });

  } catch (error) {
    console.error('Error getting access status:', error);
    res.status(500).json({
      hasAccess: false,
      error: 'Error interno'
    });
  }
};