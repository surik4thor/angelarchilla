// Tarot de los Ángeles - Configuración y Metodología
// Este es un sistema oracle basado en la guía angelical y mensajes divinos

export const angelTarotConfig = {
  name: "Tarot de los Ángeles",
  description: "Oracle de guía angelical para recibir mensajes divinos y orientación espiritual",
  totalCards: 44, // Número típico de cartas en un oracle de ángeles
  category: "oracle",
  spiritual: true,
  
  methodology: {
    purpose: "Conexión directa con la energía angelical para recibir guía, protección y mensajes de amor incondicional",
    focus: "Orientación espiritual, sanación emocional, propósito de vida, y conexión divina",
    energy: "Amor incondicional, luz divina, protección angelical, elevación espiritual",
    approach: "Suave, amorosa, protectora, elevadora, sin juicios",
    
    principles: [
      "Los ángeles siempre responden con amor y comprensión",
      "Cada mensaje viene desde la luz divina para el mayor bien",
      "Las cartas revelan la guía que necesitas en este momento",
      "La energía angelical es protectora y nunca dañina",
      "Cada lectura es una bendición y un regalo del cielo"
    ]
  },
  
  readingStyles: [
    {
      id: "single_guidance",
      name: "Mensaje Angelical",
      description: "Una carta para recibir la guía angelical del día",
      cardCount: 1,
      layout: "single",
      timeframe: "presente",
      spiritual: true
    },
    {
      id: "three_angels",
      name: "Trinidad Angelical",
      description: "Pasado, presente y futuro bajo la protección angelical",
      cardCount: 3,
      layout: "linear",
      positions: ["Lecciones del pasado", "Guía presente", "Bendiciones futuras"],
      timeframe: "completo"
    },
    {
      id: "angel_cross",
      name: "Cruz Angelical",
      description: "Guía completa en cuatro aspectos de tu vida",
      cardCount: 4,
      layout: "cross",
      positions: ["Situación actual", "Desafío a superar", "Guía angelical", "Resultado bendecido"],
      timeframe: "presente-futuro"
    },
    {
      id: "weekly_guidance",
      name: "Guía Semanal",
      description: "Siete mensajes angelicales para cada día de la semana",
      cardCount: 7,
      layout: "linear",
      positions: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
      timeframe: "semana"
    },
    {
      id: "life_purpose",
      name: "Propósito de Vida",
      description: "Descubre tu misión divina y camino espiritual",
      cardCount: 5,
      layout: "pentagram",
      positions: ["Tu alma", "Dones especiales", "Misión actual", "Obstáculos a transformar", "Propósito divino"],
      timeframe: "vida"
    }
  ],
  
  themes: [
    "Amor y relaciones",
    "Propósito de vida",
    "Sanación emocional",
    "Protección divina",
    "Abundancia y prosperidad",
    "Comunicación angelical",
    "Desarrollo espiritual",
    "Perdón y liberación",
    "Manifestación",
    "Conexión divina",
    "Transformación personal",
    "Guía profesional"
  ]
};

// Estructura base para las cartas (se completará con las cartas escaneadas)
export const angelCards = [
  // Se llenarán automáticamente cuando se suban las imágenes
  // Cada carta tendrá: id, name, filename, meaning, guidance, affirmation, colors, symbols
];

// Interpretaciones base para el sistema de ángeles
export const angelInterpretations = {
  general: {
    positive: "Los ángeles te envían bendiciones y luz divina",
    neutral: "Estás en un momento de transición y crecimiento espiritual", 
    protective: "Tus ángeles guardianes están cerca, protegiéndote y guiándote"
  },
  
  energyTypes: {
    protection: "Energía de protección angelical te rodea",
    healing: "Sanación divina fluye hacia ti en este momento",
    guidance: "Recibe la sabiduría angelical para tu camino",
    love: "El amor incondicional de los ángeles te abraza",
    manifestation: "Tus oraciones y deseos están siendo escuchados",
    transformation: "Un hermoso cambio espiritual está ocurriendo"
  },
  
  messages: {
    trust: "Confía en el plan divino para tu vida",
    patience: "Todo llega en el momento perfecto de Dios",
    selfLove: "Eres amado(a) infinitamente tal como eres",
    courage: "Los ángeles te dan fuerza para seguir adelante",
    gratitude: "Cuenta tus bendiciones y verás multiplicarse la abundancia",
    forgiveness: "El perdón te libera y sana tu corazón",
    purpose: "Estás cumpliendo tu misión divina paso a paso"
  }
};

export default {
  angelTarotConfig,
  angelCards,
  angelInterpretations
};