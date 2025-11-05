// Actualización de límites para estructura simplificada
// Este archivo documenta los cambios necesarios en subscriptionLimits.js

const NUEVOS_SUBSCRIPTION_LIMITS = {
  // Estructura simplificada - 3 planes
  INVITADO: {
    maxReadingsPerMonth: 3,      // 3 lecturas básicas al mes
    maxReadingsPerDay: null,     // Sin límite diario
    hasDreams: false,
    hasNatalCharts: false,
    hasPersonalizedHoroscopes: false,
    hasHistory: false,
    hasPartnerSync: false,
    hasAllDecks: false,          // Solo Rider-Waite básico
    hasAdvancedDashboard: false
  },
  
  ESENCIAL: {
    maxReadingsPerMonth: 15,     // 15 lecturas completas al mes
    maxReadingsPerDay: null,     // Sin límite diario
    hasDreams: false,
    hasNatalCharts: false,
    hasPersonalizedHoroscopes: true,   // Horóscopos personalizados
    hasHistory: true,                   // Historial completo
    hasPartnerSync: false,
    hasAllDecks: true,                  // Todas las barajas
    hasAdvancedDashboard: true          // Dashboard con métricas
  },
  
  PREMIUM: {
    maxReadingsPerMonth: null,   // Lecturas ilimitadas
    maxReadingsPerDay: null,     
    hasDreams: true,                    // Interpretación de sueños
    hasNatalCharts: true,               // Cartas natales detalladas
    hasPersonalizedHoroscopes: true,    // Horóscopos ultra-personalizados
    hasHistory: true,
    hasPartnerSync: true,               // Funciones de pareja
    hasAllDecks: true,
    hasAdvancedDashboard: true,
    hasExportPDF: true,                 // Exportar a PDF
    hasPrioritySupport: true            // Soporte VIP
  },

  // Legacy: mantener compatibilidad durante migración
  INICIADO: {
    maxReadingsPerMonth: 12,
    maxReadingsPerDay: null,
    hasDreams: false,
    hasNatalCharts: false,
    hasPersonalizedHoroscopes: false,
    hasHistory: true,
    hasPartnerSync: false
  },
  
  ADEPTO: {
    maxReadingsPerMonth: 30,
    maxReadingsPerDay: null,
    hasDreams: false,
    hasNatalCharts: true,
    hasPersonalizedHoroscopes: true,
    hasHistory: true,
    hasPartnerSync: false
  },
  
  MAESTRO: {
    maxReadingsPerMonth: null,
    maxReadingsPerDay: null,
    hasDreams: true,
    hasNatalCharts: true,
    hasPersonalizedHoroscopes: true,
    hasHistory: true,
    hasPartnerSync: true
  }
};

// Función de mapeo para migración de usuarios
const mapLegacyToNew = {
  'INVITADO': 'INVITADO',    // Sin cambios
  'INICIADO': 'ESENCIAL',    // Mejora: +3 lecturas + todas las barajas
  'ADEPTO': 'PREMIUM',       // Mejora: lecturas ilimitadas + sueños
  'MAESTRO': 'PREMIUM'       // Precio reducido €17.99 → €9.99
};

// Configuración de planes para el frontend
const FRONTEND_PLANS = [
  {
    name: 'Invitado',
    displayName: 'Explorador Cósmico',
    priceMonthly: 0,
    priceAnnual: 0,
    stripeIdMonthly: null,
    stripeIdAnnual: null,
    description: '3 lecturas básicas al mes. Perfecto para empezar tu journey espiritual.',
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
    priceMonthly: 4.99,
    priceAnnual: 49.90,
    popular: true,
    description: '15 lecturas completas + todas las barajas. Ideal para practicantes regulares.',
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
    priceMonthly: 9.99,
    priceAnnual: 99.90,
    bestValue: true,
    description: 'Experiencia completa ilimitada. Para verdaderos entusiastas del esoterismo.',
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
  }
];

export { NUEVOS_SUBSCRIPTION_LIMITS, mapLegacyToNew, FRONTEND_PLANS };