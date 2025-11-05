import { authenticate, requireAdmin } from '../middleware/auth.js';
import express from 'express';
import { askPerplexity } from '../utils/perplexity.js';

const router = express.Router();

// Endpoint público para obtener información de planes disponibles - ESTRUCTURA SIMPLIFICADA
router.get('/', (req, res) => {
  res.setHeader(
    'Content-Security-Policy',
    "connect-src 'self' https://region1.google-analytics.com https://www.google-analytics.com https://www.googletagmanager.com;"
  );
  
  const newPlansStructure = [
    { 
      name: 'INVITADO', 
      displayName: 'Explorador Cósmico 🌟',
      price: 0,
      recommended: false,
      description: 'Perfecto para empezar tu journey espiritual',
      features: {
        readings: 3,
        decks: ['rider-waite'],
        horoscope: 'básico semanal',
        history: false,
        dreams: false,
        natalCharts: false,
        support: 'comunidad'
      }
    },
    { 
      name: 'ESENCIAL', 
      displayName: 'Iniciado Místico ✨',
      price: 4.99,
      priceAnnual: 49.90,
      savingsText: 'Ahorra 2 meses',
      recommended: true,
      popularBadge: 'Más Popular',
      description: 'Ideal para practicantes regulares del esoterismo',
      features: {
        readings: 15,
        decks: ['rider-waite', 'marsella', 'celta', 'egipcio', 'runas'],
        horoscope: 'personalizado diario',
        history: true,
        dreams: false,
        natalCharts: false,
        support: 'email'
      }
    },
    { 
      name: 'PREMIUM', 
      displayName: 'Maestro Espiritual 🔮',
      price: 9.99,
      priceAnnual: 99.90,
      savingsText: 'Ahorra 2 meses + Descuento especial',
      recommended: false,
      valueBadge: 'Mejor Valor',
      description: 'Experiencia completa para verdaderos entusiastas',
      features: {
        readings: -1, // Ilimitado
        decks: 'todas + futuras',
        horoscope: 'ultra-personalizado',
        history: 'completo + exportar PDF',
        dreams: true,
        natalCharts: 'detalladas + compatibilidad',
        support: 'VIP 24/7'
      }
    }
  ];
  
  res.json({ 
    plans: newPlansStructure,
    businessLogic: {
      psychology: 'Precio €9.99 para mantener barrera psicológica bajo €10',
      migration: 'Legacy users: INICIADO->ESENCIAL, ADEPTO/MAESTRO->PREMIUM',
      simplification: '4 planes reducidos a 3 para menor confusión'
    }
  });
});

// Endpoint para proponer planes comerciales y estratégicos con IA
router.post('/proponer', authenticate, requireAdmin, async (req, res) => {
  try {
    const { contexto, objetivo } = req.body || {};
    const prompt = `Eres un consultor de negocios senior. Proporciona un plan comercial y estratégico para Arcana Club. Contexto: ${contexto || 'No especificado'}. Objetivo: ${objetivo || 'No especificado'}. El plan debe incluir análisis de situación, objetivos SMART, estrategias de marketing, acciones recomendadas y KPIs. Devuelve el resultado en formato Markdown bien estructurado.`;
    let plan = '';
    try {
      const response = await askPerplexity({
        model: 'sonar',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.7,
        top_p: 1
      });
      plan = response.choices?.[0]?.message?.content || '';
    } catch (iaError) {
      console.error('Error en generación IA /planes/proponer:', iaError);
      return res.status(502).json({
        success: false,
        message: 'No se pudo generar el plan con IA en este momento. Por favor, revisa la configuración de la API o inténtalo de nuevo más tarde.'
      });
    }
    res.json({ success: true, plan });
  } catch (error) {
    console.error('Error inesperado en /planes/proponer:', error);
    res.status(500).json({
      success: false,
      message: 'Ha ocurrido un error inesperado en el servidor. Si el problema persiste, contacta con soporte.'
    });
  }
});

export default router;