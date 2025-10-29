import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },

  // Información del club
  club: {
    name: 'Arcana Club',
    foundedYear: parseInt(process.env.CLUB_FOUNDED_YEAR) || 2025,
    maxMembers: parseInt(process.env.CLUB_MAX_MEMBERS) || 10000,
    vipThreshold: parseInt(process.env.VIP_MEMBER_THRESHOLD) || 100,
    anniversary: process.env.CLUB_ANNIVERSARY || '31-10'
  },

  // Servidor
  server: {
  port: parseInt(process.env.PORT) || 5050,
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173']
  },

  // Base de datos
  database: {
    url: process.env.DATABASE_URL
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 7
  },

  // Límites por membresía
  membershipLimits: {
    invitado: {
      daily: parseInt(process.env.LIMIT_INVITADO_DAILY) || 1,
      dailyDreams: 1,
      monthly: 1,
      features: ['lectura_bienvenida']
    },
    iniciado: {
      monthly: parseInt(process.env.LIMIT_INICIADO_MONTHLY) || 15,
      features: ['lecturas_ilimitadas_basicas', 'horoscopo_diario']
    },
    adepto: {
      monthly: parseInt(process.env.LIMIT_ADEPTO_MONTHLY) || 30,
      features: ['lecturas_premium', 'carta_astral_anual', 'acceso_boutique_premium']
    },
    maestro: {
      monthly: parseInt(process.env.LIMIT_MAESTRO_MONTHLY) || 999,
      features: ['lecturas_ilimitadas', 'consultas_personales', 'productos_exclusivos', 'carta_astral_semestral']
    }
  },

  // Configuración de lecturas
  readings: {
    question: {
      minLength: parseInt(process.env.MIN_QUESTION_LENGTH) || 10,
      maxLength: parseInt(process.env.MAX_QUESTION_LENGTH) || 500
    },
    cooldownMinutes: parseInt(process.env.READING_COOLDOWN_MINUTES) || 5,
    firstReadingFree: process.env.FIRST_READING_FREE === 'true',
    tarotDecks: process.env.AVAILABLE_TAROT_DECKS?.split(',') || ['rider_waite', 'marsella'],
    runeSets: process.env.AVAILABLE_RUNE_SETS?.split(',') || ['elder_futhark'],
    tarotSpreads: process.env.TAROT_SPREADS?.split(',') || ['cruz_celta', 'tres_cartas', 'una_carta', 'herradura', 'estrella_arcana'],
    runeSpreads: process.env.RUNE_SPREADS?.split(',') || ['ojo_odin', 'tres_runas', 'una_runa', 'cruz_nordica'],
    loadingMessages: process.env.LOADING_MESSAGES?.split(',') || [
      'El círculo de Arcana se activa...',
      'Las energías ancestrales del club se alinean...',
      'Los maestros del club interpretan los símbolos...'
    ]
  },

  // Precios de membresías
  membership: {
    iniciado: {
      priceMonthly: parseFloat(process.env.PRICE_INICIADO_MONTHLY) || 7.99,
      priceAnnual: parseFloat(process.env.PRICE_INICIADO_ANNUAL) || 0,
      stripeIdMonthly: process.env.STRIPE_INICIADO_PRICE_ID_MONTHLY,
      stripeIdAnnual: process.env.STRIPE_INICIADO_PRICE_ID_ANNUAL
    },
    adepto: {
      priceMonthly: parseFloat(process.env.PRICE_ADEPTO_MONTHLY) || 19.99,
      priceAnnual: parseFloat(process.env.PRICE_ADEPTO_ANNUAL) || 0,
      stripeIdMonthly: process.env.STRIPE_ADEPTO_PRICE_ID_MONTHLY,
      stripeIdAnnual: process.env.STRIPE_ADEPTO_PRICE_ID_ANNUAL
    },
    maestro: {
      priceMonthly: parseFloat(process.env.PRICE_MAESTRO_MONTHLY) || 39.99,
      priceAnnual: parseFloat(process.env.PRICE_MAESTRO_ANNUAL) || 0,
      stripeIdMonthly: process.env.STRIPE_MAESTRO_PRICE_ID_MONTHLY,
      stripeIdAnnual: process.env.STRIPE_MAESTRO_PRICE_ID_ANNUAL
    }
  },

  // Boutique
  boutique: {
    name: process.env.BOUTIQUE_NAME || 'Boutique Arcana',
    shipping: {
      spain: parseFloat(process.env.SHIPPING_COST_SPAIN) || 4.95,
      eu: parseFloat(process.env.SHIPPING_COST_EU) || 8.95,
      worldwide: parseFloat(process.env.SHIPPING_COST_WORLDWIDE) || 12.95,
      freeThreshold: parseFloat(process.env.FREE_SHIPPING_THRESHOLD) || 49.99
    },
    categories: process.env.PRODUCT_CATEGORIES?.split(',') || ['barajas_tarot_premium', 'runas_artesanales', 'cristales_energeticos']
  },

  // OpenAI
  email: {
    from: process.env.EMAIL_FROM || 'noreply@arcanaclub.es',
    fromName: process.env.EMAIL_FROM_NAME || 'Arcana Club',
    templates: {
      welcome: process.env.WELCOME_EMAIL_SUBJECT || '🃏 ¡Bienvenido/a a Arcana Club! ✨',
      renewal: process.env.RENEWAL_EMAIL_SUBJECT || '⏰ Tu suscripción en Arcana Club caduca pronto',
      subscription: process.env.SUBSCRIPTION_EMAIL_SUBJECT || '🎉 ¡Tu suscripción premium en Arcana Club está activa!'
    }
  },


  // Blog
  blog: {
    name: process.env.BLOG_NAME || 'Sabiduría Arcana',
    postsPerPage: parseInt(process.env.BLOG_POSTS_PER_PAGE) || 12,
    categories: process.env.BLOG_CATEGORIES?.split(',') || ['tarot', 'runas', 'astrologia', 'rituales', 'meditacion']
  },

  // Localización
  locale: {
    timezone: process.env.DEFAULT_TIMEZONE || 'Europe/Madrid',
    currency: process.env.DEFAULT_CURRENCY || 'EUR',
    locale: process.env.DEFAULT_LOCALE || 'es-ES',
    taxRate: parseFloat(process.env.TAX_RATE_SPAIN) || 0.21
  },

  // SEO
  seo: {
    siteName: process.env.SITE_NAME || 'Arcana Club',
    siteDescription: process.env.SITE_DESCRIPTION || 'Club esotérico exclusivo de España',
    siteKeywords: process.env.SITE_KEYWORDS || 'arcana club,tarot,runas,esoterismo',
    siteUrl: process.env.SITE_URL || 'https://arcanaclub.es',
    ogImage: process.env.OG_IMAGE_URL,
    twitterHandle: process.env.TWITTER_HANDLE || '@ArcanaClubES'
  }

  // OpenAI (configuración para interpretar lecturas)
  ,openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4',
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 800,
    // Prompts base por tipo (puedes personalizarlos en producción)
    prompts: {
      tarot: process.env.OPENAI_PROMPT_TAROT || `Eres un lector/a de Tarot profesional, compasivo y preciso. Interpreta las cartas cuidando el tono positivo y práctico, ofreciendo consejos claros.`,
      runes: process.env.OPENAI_PROMPT_RUNES || `Eres un experto en runas nórdicas que interpreta símbolos y significados con precisión histórica y espiritual. Ofrece interpretaciones directas y recomendaciones.`
    }
  },

  // PayPal
  paypal: {
    clientId: 'AUD2wXWVJ8Pi9KV0ODlPfXiFqlzaO9V96NFiv2QSYYjpg24Q5KJRMPqyvU-947jvS7SdwyUCDUOFxuzi',
    secret: 'EEIzPVjjy9n-ApWflZB7MHMeInhvn4ZJt_LkUrsSZg04nAMUSYCPIkj7_IV7CxkMrw_NkMkXawrITpTD',
    sandbox: true
  }
};

// Mensajes en español para Arcana Club
export const messages = {
  auth: {
    welcomeToClub: '¡Bienvenido/a al círculo exclusivo de Arcana Club!',
    userExists: 'Ya existe un miembro con este email en nuestro club',
    invalidCredentials: 'Credenciales incorrectas para acceder al club',
    tokenRequired: 'Se requiere autenticación para acceder al club',
    accessDenied: 'Acceso denegado al círculo de Arcana',
    profileUpdated: 'Tu perfil de miembro ha sido actualizado',
    loggedOut: 'Has salido del círculo de Arcana Club',
    membershipRequired: 'Se requiere membresía activa para esta función'
  },
  readings: {
    limitReached: 'Has alcanzado el límite de tu membresía. Considera actualizar tu plan',
    questionTooShort: `Tu pregunta debe tener al menos ${parseInt(process.env.MIN_QUESTION_LENGTH) || 10} caracteres`,
    questionTooLong: `Tu pregunta no puede superar ${parseInt(process.env.MAX_QUESTION_LENGTH) || 500} caracteres`,
    processingError: 'Error al canalizar las energías. Inténtalo de nuevo',
    cooldownActive: `Las energías necesitan ${parseInt(process.env.READING_COOLDOWN_MINUTES) || 5} minutos para realinearse`,
    firstReadingWelcome: '¡Disfruta de tu primera lectura gratuita de bienvenida a Arcana Club!',
    upgradePrompt: 'Actualiza tu membresía para desbloquear más lecturas'
  },
  membership: {
    invitado: 'Invitado del Club',
    iniciado: 'Miembro Iniciado',
    adepto: 'Miembro Adepto', 
    maestro: 'Maestro del Club',
    expired: 'Tu membresía ha expirado. Renuévala para seguir disfrutando',
    upgraded: 'Tu membresía ha sido actualizada correctamente',
    benefits: 'Descubre todos los beneficios de tu nueva membresía'
  },
  boutique: {
    addedToCart: 'Producto añadido a tu colección',
    outOfStock: 'Este artículo místico está agotado',
    memberOnly: 'Producto exclusivo para miembros del club',
    shippingCalculated: 'Envío calculado según tu ubicación'
  },
  general: {
    welcome: 'Bienvenido/a a Arcana Club',
    notFound: 'El recurso místico no ha sido encontrado',
    serverError: 'Las energías del servidor están temporalmente desalineadas',
    accessForbidden: 'Este conocimiento está reservado para miembros de mayor rango'
  }
};