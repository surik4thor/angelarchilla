// Configuración simplificada para plan único PREMIUM
// Solo 2 precios: mensual y anual

export const SINGLE_PLAN_CONFIG = {
  PREMIUM: {
    name: 'PREMIUM',
    displayName: 'Nebulosa Mágica Premium',
    description: 'Acceso completo a todas las funciones de la plataforma',
    monthly: {
      price: 9.00,          // €9/mes
      priceId: 'price_1SQUEVHGfDpKeVe84RP2dRHO', // Nuevo precio mensual con trial
      currency: 'EUR',
      interval: 'month',
      interval_count: 1,
      trial_period_days: 7  // 7 días de prueba gratuita
    },
    annual: {
      price: 90.00,         // €90/año (ahorro de €29.88)
      priceId: 'price_1SQUEVHGfDpKeVe8jHs115pm', // Nuevo precio anual con trial
      currency: 'EUR',
      interval: 'year',
      interval_count: 1,
      trial_period_days: 7  // 7 días de prueba gratuita
    }
  }
};

// Características incluidas en PREMIUM (todo incluido)
export const PREMIUM_FEATURES = [
  {
    icon: '♾️',
    title: 'Lecturas Ilimitadas',
    description: 'Tarot, Runas y todas las modalidades sin restricciones'
  },
  {
    icon: '🔮',
    title: 'Todas las Barajas',
    description: 'Rider-Waite, Marsella, Egipcio, Ángeles y más'
  },
  {
    icon: '🌙',
    title: 'Interpretación de Sueños',
    description: 'IA avanzada para descifrar tus sueños'
  },
  {
    icon: '⭐',
    title: 'Cartas Natales Completas',
    description: 'Análisis astrológico detallado personalizado'
  },
  {
    icon: '📊',
    title: 'Horóscopos Personalizados',
    description: 'Predicciones únicas basadas en tu perfil'
  },
  {
    icon: '💕',
    title: 'Compatibilidad de Pareja',
    description: 'Análisis de relaciones y sinastría'
  },
  {
    icon: '📚',
    title: 'Historial Completo',
    description: 'Todas tus lecturas guardadas para siempre'
  },
  {
    icon: '📄',
    title: 'Exportar a PDF',
    description: 'Descarga tus lecturas en formato profesional'
  },
  {
    icon: '🏆',
    title: 'Soporte VIP',
    description: 'Atención prioritaria y personalizada'
  },
  {
    icon: '📈',
    title: 'Dashboard Avanzado',
    description: 'Métricas y evolución de tu journey espiritual'
  }
];

// Configuración para el frontend - Vista simplificada
export const FRONTEND_PRICING = {
  title: 'Nebulosa Mágica Premium',
  subtitle: 'Todo lo que necesitas para tu journey espiritual',
  
  trialBanner: {
    title: '🎁 ¡Prueba GRATIS por 7 días!',
    description: 'Acceso completo a todas las funciones sin compromiso',
    cta: 'Iniciar Prueba Gratuita'
  },

  plan: {
    name: 'Premium',
    description: 'Acceso completo e ilimitado a toda la plataforma',
    
    pricing: {
      monthly: {
        price: 9,
        originalPrice: null,
        currency: '€',
        period: 'mes',
        priceId: SINGLE_PLAN_CONFIG.PREMIUM.monthly.priceId,
        popular: false
      },
      annual: {
        price: 90,
        originalPrice: 108, // 9€ x 12 meses = 108€
        currency: '€',
        period: 'año',
        priceId: SINGLE_PLAN_CONFIG.PREMIUM.annual.priceId,
        popular: true,
        savings: 'Ahorra 18€ (2 meses gratis)'
      }
    },

    features: PREMIUM_FEATURES,

    trial: {
      enabled: true,
      days: 7,
      description: 'Prueba gratuita de 7 días incluida',
      noPaymentRequired: true
    },

    cta: {
      monthly: 'Suscribirse Mensual',
      annual: 'Suscribirse Anual (¡Mejor precio!)',
      trial: 'Empezar Prueba Gratis'
    }
  },

  // Sección de preguntas frecuentes simplificada
  faq: [
    {
      question: '¿La prueba gratuita requiere tarjeta de crédito?',
      answer: 'No, puedes iniciar tu prueba de 7 días completamente gratis sin introducir datos de pago.'
    },
    {
      question: '¿Puedo cancelar en cualquier momento?',
      answer: 'Sí, puedes cancelar tu suscripción cuando quieras desde tu panel de usuario. No hay permanencias.'
    },
    {
      question: '¿Qué incluye exactamente el plan Premium?',
      answer: 'TODO. Acceso ilimitado a todas las lecturas, barajas, interpretación de sueños, cartas natales, y todas las funciones premium.'
    },
    {
      question: '¿Hay descuentos para estudiantes?',
      answer: 'El plan anual ya incluye un descuento del 17% (2 meses gratis). ¡Es nuestro mejor precio!'
    }
  ]
};

// Mapeo de precios legacy para migración
export const LEGACY_PRICE_MIGRATION = {
  // Precios antiguos que se deben desactivar
  'price_esencial_monthly_old': SINGLE_PLAN_CONFIG.PREMIUM.monthly.priceId,
  'price_esencial_annual_old': SINGLE_PLAN_CONFIG.PREMIUM.annual.priceId,
  'price_premium_monthly_old': SINGLE_PLAN_CONFIG.PREMIUM.monthly.priceId,
  'price_premium_annual_old': SINGLE_PLAN_CONFIG.PREMIUM.annual.priceId
};

// Función para validar precios de Stripe
export const validateStripePrices = async () => {
  // Esta función debería verificar que los precios existen en Stripe
  // y tienen la configuración correcta (trial_period_days, etc.)
  const requiredPrices = [
    SINGLE_PLAN_CONFIG.PREMIUM.monthly.priceId,
    SINGLE_PLAN_CONFIG.PREMIUM.annual.priceId
  ];
  
  console.log('Validating required Stripe prices:', requiredPrices);
  
  // TODO: Implementar verificación real con Stripe API
  return {
    valid: true,
    prices: requiredPrices,
    errors: []
  };
};

export default SINGLE_PLAN_CONFIG;