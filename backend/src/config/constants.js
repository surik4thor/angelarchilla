// Signos zodiacales en español
export const SIGNOS_ZODIACALES = {
  ARIES: 'Aries',
  TAURO: 'Tauro', 
  GEMINIS: 'Géminis',
  CANCER: 'Cáncer',
  LEO: 'Leo',
  VIRGO: 'Virgo',
  LIBRA: 'Libra',
  ESCORPIO: 'Escorpio',
  SAGITARIO: 'Sagitario',
  CAPRICORNIO: 'Capricornio',
  ACUARIO: 'Acuario',
  PISCIS: 'Piscis'
};

// Cartas del Tarot Rider-Waite en español
export const CARTAS_TAROT = {
  // Arcanos Mayores
  'The Fool': 'El Loco',
  'The Magician': 'El Mago',
  'The High Priestess': 'La Suma Sacerdotisa',
  'The Empress': 'La Emperatriz',
  'The Emperor': 'El Emperador',
  'The Hierophant': 'El Hierofante',
  'The Lovers': 'Los Enamorados',
  'The Chariot': 'El Carro',
  'Strength': 'La Fuerza',
  'The Hermit': 'El Ermitaño',
  'Wheel of Fortune': 'La Rueda de la Fortuna',
  'Justice': 'La Justicia',
  'The Hanged Man': 'El Colgado',
  'Death': 'La Muerte',
  'Temperance': 'La Templanza',
  'The Devil': 'El Diablo',
  'The Tower': 'La Torre',
  'The Star': 'La Estrella',
  'The Moon': 'La Luna',
  'The Sun': 'El Sol',
  'Judgement': 'El Juicio',
  'The World': 'El Mundo'
};

// Runas del Elder Futhark en español
export const RUNAS_ELDER_FUTHARK = {
  'Fehu': 'Fehu - Ganado, Riqueza',
  'Uruz': 'Uruz - Uro, Fuerza',
  'Thurisaz': 'Thurisaz - Gigante, Espina',
  'Ansuz': 'Ansuz - Dios, Comunicación',
  'Raidho': 'Raidho - Viaje, Movimiento',
  'Kenaz': 'Kenaz - Antorcha, Conocimiento',
  'Gebo': 'Gebo - Regalo, Intercambio',
  'Wunjo': 'Wunjo - Alegría, Perfección',
  'Hagalaz': 'Hagalaz - Granizo, Disrupción',
  'Nauthiz': 'Nauthiz - Necesidad, Resistencia',
  'Isa': 'Isa - Hielo, Quietud',
  'Jera': 'Jera - Año, Cosecha',
  'Eihwaz': 'Eihwaz - Tejo, Defensa',
  'Perth': 'Perth - Dado, Misterio',
  'Algiz': 'Algiz - Alce, Protección',
  'Sowilo': 'Sowilo - Sol, Victoria',
  'Tiwaz': 'Tiwaz - Tyr, Honor',
  'Berkano': 'Berkano - Abedul, Crecimiento',
  'Ehwaz': 'Ehwaz - Caballo, Cooperación',
  'Mannaz': 'Mannaz - Hombre, Humanidad',
  'Laguz': 'Laguz - Agua, Intuición',
  'Inguz': 'Inguz - Ing, Fertilidad',
  'Othila': 'Othila - Herencia, Hogar',
  'Dagaz': 'Dagaz - Día, Despertar'
};

// Tipos de tiradas en español
export const TIPOS_TIRADAS = {
  tarot: {
    'cruz_celta': 'Cruz Celta',
    'tres_cartas': 'Tres Cartas',
    'una_carta': 'Una Carta',
    'herradura': 'Herradura',
    'estrella': 'Estrella de Siete Puntas'
  },
  runas: {
    'ojo_odin': 'Ojo de Odín',
    'tres_runas': 'Tres Runas',
    'una_runa': 'Una Runa',
    'cruz_nordica': 'Cruz Nórdica'
  }
};

// Estados de suscripción en español
export const ESTADOS_SUSCRIPCION = {
  ACTIVE: 'Activa',
  INACTIVE: 'Inactiva', 
  CANCELED: 'Cancelada',
  EXPIRED: 'Expirada'
};

// Planes de suscripción en español
export const PLANES_SUSCRIPCION = {
  FREEMIUM: 'Gratuito',
  BASIC: 'Básico',
  PREMIUM: 'Premium',
  UNLIMITED: 'Ilimitado'
};

export default {
  SIGNOS_ZODIACALES,
  CARTAS_TAROT,
  RUNAS_ELDER_FUTHARK,
  TIPOS_TIRADAS,
  ESTADOS_SUSCRIPCION,
  PLANES_SUSCRIPCION
};
