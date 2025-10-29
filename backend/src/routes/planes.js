import { authenticate, requireAdmin } from '../middleware/auth.js';
import express from 'express';
import { askPerplexity } from '../utils/perplexity.js';

const router = express.Router();

// Endpoint público para obtener información de planes disponibles
router.get('/', (req, res) => {
  res.setHeader(
    'Content-Security-Policy',
    "connect-src 'self' https://region1.google-analytics.com https://www.google-analytics.com https://www.googletagmanager.com;"
  );
  res.json({ plans: [
    { name: 'BÁSICO', price: 0 },
    { name: 'PREMIUM', price: 9.99 },
    { name: 'ADEPTO', price: 29.99 },
    { name: 'MAESTRO', price: 99.99 }
  ] });
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