import express from 'express';
import { config } from '../config/config.js';

const router = express.Router();

// Endpoint público para obtener los planes y precios - ESTRUCTURA SIMPLIFICADA
router.get('/plans', (req, res) => {
  const plans = [
    {
      name: 'Invitado',
      displayName: 'Explorador Cósmico',
      priceMonthly: 0,
      priceAnnual: 0,
      stripeIdMonthly: null,
      stripeIdAnnual: null,
      description: '3 lecturas básicas al mes. Perfecto para empezar tu journey espiritual.',
      badge: null,
      features: [
        '3 lecturas Tarot/Runas',
        'Baraja Rider-Waite básica',
        'Horóscopo semanal básico',
        'Acceso a tutoriales'
      ],
      limitations: [
        'Sin historial de lecturas',
        'Sin interpretación de sueños',
        'Sin cartas natales',
        'Sin barajas premium'
      ]
    },
    {
      name: 'Esencial',
      displayName: 'Iniciado Místico',
      priceMonthly: config.membership.esencial?.priceMonthly || 4.99,
      priceAnnual: config.membership.esencial?.priceAnnual || 49.90,
      stripeIdMonthly: config.membership.esencial?.stripeIdMonthly,
      stripeIdAnnual: config.membership.esencial?.stripeIdAnnual,
      description: '15 lecturas completas + todas las barajas. Ideal para practicantes regulares.',
      badge: 'Más Popular',
      features: [
        '15 lecturas completas/mes',
        'Todas las barajas (5 tipos)',
        'Historial completo',
        'Horóscopos personalizados',
        'Dashboard con métricas',
        'Soporte por email'
      ],
      limitations: [
        'Sin interpretación de sueños',
        'Sin cartas natales'
      ]
    },
    {
      name: 'Premium',
      displayName: 'Maestro Espiritual',
      priceMonthly: config.membership.premium?.priceMonthly || 9.99,
      priceAnnual: config.membership.premium?.priceAnnual || 99.90,
      stripeIdMonthly: config.membership.premium?.stripeIdMonthly,
      stripeIdAnnual: config.membership.premium?.stripeIdAnnual,
      description: 'Experiencia completa ilimitada. Para verdaderos entusiastas del esoterismo.',
      badge: 'Mejor Valor',
      features: [
        '♾️ Lecturas ilimitadas',
        '🌙 Interpretación de sueños',
        '📊 Cartas natales detalladas',
        '⭐ Horóscopos ultra-personalizados',
        '📄 Exportación a PDF',
        '🏆 Soporte VIP 24/7',
        '💕 Análisis de compatibilidad'
      ],
      limitations: []
    },
    
    // === LEGACY: Compatibilidad durante migración ===
    {
      name: 'Iniciado',
      priceMonthly: config.membership.iniciado.priceMonthly,
      priceAnnual: config.membership.iniciado.priceAnnual,
      stripeIdMonthly: config.membership.iniciado.stripeIdMonthly,
      stripeIdAnnual: config.membership.iniciado.stripeIdAnnual,
      description: '[LEGACY] 12 lecturas completas al mes (tarot y runas), horóscopo personalizado. Historial básico de lecturas.',
      deprecated: true
    },
    {
      name: 'Adepto',
      priceMonthly: config.membership.adepto.priceMonthly,
      priceAnnual: config.membership.adepto.priceAnnual,
      stripeIdMonthly: config.membership.adepto.stripeIdMonthly,
      stripeIdAnnual: config.membership.adepto.stripeIdAnnual,
      description: '[LEGACY] 30 lecturas al mes + horóscopo avanzado + cartas natales básicas. Historial completo y soporte prioritario.',
      deprecated: true
    },
    {
      name: 'Maestro',
      priceMonthly: config.membership.maestro.priceMonthly,
      priceAnnual: config.membership.maestro.priceAnnual,
      stripeIdMonthly: config.membership.maestro.stripeIdMonthly,
      stripeIdAnnual: config.membership.maestro.stripeIdAnnual,
      description: '[LEGACY] Lecturas ilimitadas + interpretación de sueños + cartas natales detalladas + soporte VIP 24/7.',
      deprecated: true
    }
  ];
  
  // Filtrar planes deprecated para nuevos usuarios, mantener para compatibilidad API
  const activePlans = plans.filter(plan => !plan.deprecated);
  res.json(activePlans);
});

export default router;
