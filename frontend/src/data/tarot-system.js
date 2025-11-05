// Sistema completo de barajas de tarot con metodologías específicas
// Basado en la investigación de tiradadetarot.gratis y metodologías tradicionales

export const tarotDecks = {
  'rider-waite': {
    name: 'Rider-Waite',
    description: 'Simbolismo rico con ilustraciones detalladas',
    category: 'traditional',
    totalCards: 78,
    hasMinorArcana: true,
    meditation: 'Cierra los ojos y conecta con la tradición y el simbolismo del Rider-Waite. Visualiza las escenas vibrantes y detalladas de cada carta. Deja que los arquetipos universales y las ricas ilustraciones te hablen. Siente la energía moderna y la claridad visual que este mazo ofrece.',
    colors: ['#8B4513', '#DAA520', '#4B0082'],
    methodology: {
      purpose: 'Interpretación basada en simbolismo visual rico y arquetipos psicológicos',
      preparation: 'Observa mentalmente las imágenes detalladas y simbolos de cada carta',
      focus: 'Las ilustraciones completas proporcionan narrativas claras y directas',
      specialty: 'Ideal para principiantes y lecturas intuitivas basadas en imágenes',
      era: 'Creado en 1910 por Arthur Edward Waite y Pamela Colman Smith'
    },
    spreads: ['una-carta', 'tres-cartas', 'cruz-celta', 'herradura', 'amor', 'trabajo']
  },
  
  'marsella': {
    name: 'Tarot de Marsella',
    description: 'Tradición pura francesa con símbolos esenciales',
    category: 'traditional',
    totalCards: 78,
    hasMinorArcana: true,
    meditation: 'Respira profundo y conecta con la historia ancestral del Tarot de Marsella. Imagina los trazos simples pero poderosos de la tradición francesa. Permite que la simbología pura, directa y sin adornos te inspire claridad absoluta y verdad esencial.',
    colors: ['#DC143C', '#FFD700', '#000080'],
    methodology: {
      purpose: 'Lectura basada en tradición europea clásica y simbolismo geométrico',
      preparation: 'Conecta con la simplicidad y pureza de los símbolos ancestrales',
      focus: 'Los arcanos menores son simples (palos y números), enfoque en Arcanos Mayores',
      specialty: 'Para lectores avanzados que prefieren simbolismo abstracto y meditativo',
      era: 'Tradición francesa desde el siglo XVII, el tarot más antiguo conservado'
    },
    spreads: ['una-carta', 'tres-cartas', 'cruz-celta', 'herradura', 'amor', 'trabajo']
  },
  
  'tarot-angeles': {
    name: 'Tarot de los Ángeles',
    description: 'Las 78 cartas de la jerarquía celestial completa',
    category: 'angelical',
    totalCards: 78,
    hasMinorArcana: true,
    meditation: 'Respira suavemente y abre tu corazón a la energía angelical. Visualiza una luz dorada y amorosa que te rodea, conectándote con toda la jerarquía celestial. Desde los Serafines hasta los Ángeles Guardianes, siente la presencia divina que guía esta lectura para tu mayor bien espiritual.',
    colors: ['#FFD700', '#F0F8FF', '#DDA0DD'],
    methodology: {
      purpose: 'Conexión con la jerarquía celestial completa y guía divina',
      preparation: 'Conecta con los 9 coros angelicales y la energía de luz divina',
      focus: 'Las 78 cartas representan toda la jerarquía desde Serafines hasta Ángeles Caídos para enseñanza completa',
      hierarchy: {
        'primera-jerarquia': 'Serafines (1-3), Querubines (4-6), Tronos (7-9)',
        'segunda-jerarquia': 'Dominaciones (10-12), Virtudes (13-18)',
        'tercera-jerarquia': 'Principados (19-21), Mensajeros (22-24), Noveno Coro (25-27)',
        'arcangeles': 'Arcángeles (28-37)',
        'angeles-representativos': 'Ángeles Especiales, Hadas, Gnomos (38-66)',
        'angeles-negativos': 'Ángeles Caídos para aprendizaje (67-78)'
      },
      positions: {
        standard: ['Ángel del Pasado', 'Ángel del Presente', 'Ángel del Futuro', 'Tu Ángel Representante', 'Ángel Guía', 'Ángel de la Guarda', 'Ángel de los Antepasados']
      }
    },
    spreads: ['mensaje-angelical', 'trinidad-angelical', 'cruz-angelical', 'jerarquia-celestial', 'guia-semanal', 'proposito-vida', 'sanacion-angeles']
  },
  
  'tarot-egipcio': {
    name: 'Tarot Egipcio',
    description: 'Sabiduría ancestral de los faraones',
    category: 'ancient',
    totalCards: 78,
    hasMinorArcana: true,
    meditation: 'Cierra los ojos e imagínate en las arenas doradas de Egipto, bajo la protección de los dioses antiguos. Conecta con la sabiduría milenaria de los faraones y permite que los símbolos sagrados del Nilo te revelen sus secretos ancestrales.',
    colors: ['#DAA520', '#8B4513', '#4169E1'],
    methodology: {
      purpose: 'Conocimiento profundo del futuro y análisis de la personalidad',
      preparation: 'Relajarse, concentrarse y formular la pregunta en voz alta en completo silencio',
      cardStructure: {
        upper: 'Plano superior/divino - Visión divina egipcia, aspectos místicos',
        center: 'Plano humano - Representación de la acción mediante figuras humanas',
        lower: 'Plano inferior - Aspectos instintivos, tentaciones, sombras internas'
      },
      arcanas: {
        major: 22, // Arcanos Mayores con significación profunda
        minor: 56  // Arcanos Menores que definen y complementan los mayores
      },
      positions: {
        standard: ['Pasado', 'Presente', 'Futuro', 'Carta de la Suerte', 'Carta de los Antepasados', 'Relaciones', 'Destino']
      }
    },
    spreads: ['siete-egipcias', 'piramide-egipcia', 'cruz-ankh', 'ojo-horus', 'nilo-sagrado']
  },

  'tarot-gitano': {
    name: 'Tarot Gitano',
    description: 'Tradición nómada y sabiduría popular',
    category: 'folk',
    totalCards: 36,
    hasMinorArcana: false,
    meditation: 'Conecta con el espíritu libre de los gitanos. Imagina las hogueras bajo las estrellas y la sabiduría transmitida de generación en generación. Permite que la intuición y la tradición oral te guíen en esta lectura ancestral.',
    colors: ['#8B0000', '#FFD700', '#2E8B57'],
    spreads: ['cruz-gitana', 'camino-gitano', 'fortuna-gitana']
  }
};

// Definiciones específicas de tiradas para cada baraja
export const spreadDefinitions = {
  // Tiradas tradicionales (Rider-Waite, Marsella)
  'una-carta': {
    name: 'Una Carta',
    description: 'Respuesta directa y concisa',
    positions: [{ name: 'Respuesta', meaning: 'La guía que necesitas ahora' }],
    layout: 'single'
  },
  
  'tres-cartas': {
    name: 'Tres Cartas',
    description: 'Pasado, Presente y Futuro',
    positions: [
      { name: 'Pasado', meaning: 'Influencias del pasado' },
      { name: 'Presente', meaning: 'Situación actual' },
      { name: 'Futuro', meaning: 'Tendencias futuras' }
    ],
    layout: 'linear'
  },
  
  'cruz-celta': {
    name: 'Cruz Celta',
    description: 'Análisis profundo y completo',
    positions: [
      { name: 'Situación Actual', meaning: 'El corazón del asunto' },
      { name: 'Desafío', meaning: 'Lo que se cruza en tu camino' },
      { name: 'Pasado Distante', meaning: 'Fundamentos de la situación' },
      { name: 'Pasado Reciente', meaning: 'Eventos recientes relevantes' },
      { name: 'Posible Futuro', meaning: 'Lo que puede manifestarse' },
      { name: 'Futuro Inmediato', meaning: 'Los próximos pasos' },
      { name: 'Tu Enfoque', meaning: 'Tu actitud ante la situación' },
      { name: 'Influencias Externas', meaning: 'Factores del entorno' },
      { name: 'Esperanzas y Miedos', meaning: 'Tus emociones internas' },
      { name: 'Resultado Final', meaning: 'El desenlace probable' }
    ],
    layout: 'celtic-cross'
  },

  // Tiradas angelicales
  'mensaje-angelical': {
    name: 'Mensaje Angelical',
    description: 'Una guía divina para el momento presente',
    positions: [{ name: 'Mensaje Divino', meaning: 'La guía que tus ángeles te envían hoy' }],
    layout: 'single'
  },
  
  'trinidad-angelical': {
    name: 'Trinidad Angelical',
    description: 'Lecciones, guía y bendiciones',
    positions: [
      { name: 'Lecciones del Pasado', meaning: 'Sabiduría angelical del pasado' },
      { name: 'Guía Presente', meaning: 'Mensaje angelical para hoy' },
      { name: 'Bendiciones Futuras', meaning: 'Las bendiciones que te esperan' }
    ],
    layout: 'linear'
  },
  
  'cruz-angelical': {
    name: 'Cruz Angelical',
    description: 'Situación, desafío, guía y resultado bendecido',
    positions: [
      { name: 'Situación Actual', meaning: 'Cómo ven los ángeles tu situación' },
      { name: 'Desafío a Superar', meaning: 'Lo que necesitas transformar' },
      { name: 'Guía Angelical', meaning: 'El consejo de tus ángeles' },
      { name: 'Resultado Bendecido', meaning: 'La bendición que te espera' }
    ],
    layout: 'cross'
  },

  // Tiradas egipcias
  'siete-egipcias': {
    name: 'Las Siete Egipcias',
    description: 'Lectura completa con sabiduría faraónica',
    positions: [
      { name: 'Pasado', meaning: 'Las arenas del tiempo pasado' },
      { name: 'Presente', meaning: 'El momento bajo Ra' },
      { name: 'Futuro', meaning: 'El camino del Nilo' },
      { name: 'Carta de la Suerte', meaning: 'La bendición de Isis' },
      { name: 'Antepasados', meaning: 'La sabiduría ancestral' },
      { name: 'Relaciones', meaning: 'Los vínculos humanos' },
      { name: 'Destino', meaning: 'El juicio de Osiris' }
    ],
    layout: 'egyptian-seven'
  },
  
  'piramide-egipcia': {
    name: 'Pirámide Egipcia',
    description: 'Estructura piramidal de conocimiento',
    positions: [
      { name: 'Cúspide', meaning: 'Tu objetivo divino' },
      { name: 'Plano Superior', meaning: 'Tu mente consciente' },
      { name: 'Plano Medio', meaning: 'Tu corazón' },
      { name: 'Plano Terrenal', meaning: 'Tu realidad física' },
      { name: 'Cimiento', meaning: 'Tus fundamentos' }
    ],
    layout: 'pyramid'
  }
};

// Metodologías específicas por tipo de baraja
export const deckMethodologies = {
  traditional: {
    approach: 'Simbolismo arquetípico universal',
    interpretation: 'Basada en tradición europea y simbolismo hermético',
    energy: 'Neutra, equilibrada entre luz y sombra'
  },
  
  oracle: {
    approach: 'Canalización de mensajes divinos',
    interpretation: 'Guía espiritual directa y amorosa',
    energy: 'Luminosa, protectora, elevadora'
  },
  
  angelical: {
    approach: 'Conexión con la jerarquía celestial completa',
    interpretation: 'Basada en teología angelical y enseñanzas celestiales',
    energy: 'Divina, transformadora, incluye luz y sombra para aprendizaje completo'
  },
  
  ancient: {
    approach: 'Sabiduría ancestral y conocimiento esotérico',
    interpretation: 'Profunda, mística, conectada con civilizaciones antiguas',
    energy: 'Poderosa, transformadora, iniciática'
  },
  
  folk: {
    approach: 'Tradición popular y sabiduría práctica',
    interpretation: 'Directa, práctica, basada en experiencia vivida',
    energy: 'Terrenal, intuitiva, cercana'
  }
};

export default {
  tarotDecks,
  spreadDefinitions,
  deckMethodologies
};