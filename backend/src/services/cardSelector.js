import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuraciones de tiradas disponibles
const SPREAD_CONFIGURATIONS = {
  // Tarot Spreads
  'una-carta': { name: 'Una Carta', positions: 1, type: 'tarot' },
  'tres-cartas': { name: 'Tres Cartas (Pasado/Presente/Futuro)', positions: 3, type: 'tarot' },
  'cruz-celta': { name: 'Cruz Celta', positions: 10, type: 'tarot' },
  'herradura': { name: 'Herradura', positions: 7, type: 'tarot' },
  'amor': { name: 'Tirada del Amor', positions: 5, type: 'tarot' },
  'trabajo': { name: 'Tirada del Trabajo', positions: 4, type: 'tarot' },
  
  // Rune Spreads
  'runa-unica': { name: 'Runa Única', positions: 1, type: 'runes' },
  'tres-runas': { name: 'Tres Runas (Pasado/Presente/Futuro)', positions: 3, type: 'runes' },
  'cinco-runas': { name: 'Cinco Runas', positions: 5, type: 'runes' }
};

// Función para mezclar array (Fisher-Yates shuffle)
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Función para determinar si una carta está invertida (30% probabilidad)
function isReversed() {
  return Math.random() < 0.3;
}

/**
 * Selecciona cartas de Tarot de la base de datos
 * @param {string} spreadType - Tipo de tirada
 * @param {string} deckType - Tipo de baraja (RIDER_WAITE, MARSELLA)
 * @returns {Promise<Array>} Array de cartas seleccionadas
 */
export async function selectTarotCards(spreadType, deckType = 'RIDER_WAITE') {
  try {
    const spreadConfig = SPREAD_CONFIGURATIONS[spreadType];
    if (!spreadConfig) {
      throw new Error(`Spread type '${spreadType}' not supported`);
    }

    if (spreadConfig.type !== 'tarot') {
      throw new Error(`Spread '${spreadType}' is not a tarot spread`);
    }

    // Normalizar deckType: aceptar slug (rider-waite) o el valor almacenado en tarotCard.deckType
    let filterDeckType;
    let deckBySlug = null;
    if (typeof deckType === 'string' && deckType.includes('-')) {
      // Intentar resolver el deck por slug (slug es único)
      try {
        deckBySlug = await prisma.deck.findUnique({ where: { slug: deckType } });
      } catch (e) {
        // Ignore errores de conexión aquí; seguiremos con normalización básica
        console.warn('Warning finding deck by slug:', e.message);
      }
      if (deckBySlug) {
        // Usar el slug en mayúsculas sin guiones como valor alternativo (RIDER_WAITE)
        filterDeckType = deckBySlug.slug.replace(/-/g, '_').toUpperCase();
      } else {
        // Si no existe deck, transformar el valor pasado a un token probable
        filterDeckType = deckType.replace(/-/g, '_').toUpperCase();
      }
    } else {
      filterDeckType = deckType ? deckType.toString().replace(/-/g, '_').toUpperCase() : undefined;
    }

  // Depuración: mostrar cómo estamos resolviendo el deckType
  console.log('selectTarotCards debug:', { deckType, filterDeckType, deckBySlug: deckBySlug ? { id: deckBySlug.id, slug: deckBySlug.slug } : null });

  // Obtener todas las cartas del deck especificado. Buscamos por:
    //  - tarotCard.deckType igual al token normalizado (RIDER_WAITE)
    //  - tarotCard.deckType igual al valor original uppercased
    //  - o por la relación deck.slug igual al slug pasado (para emparejar por deckId)
    const allCards = await prisma.tarotCard.findMany({
      where: {
        OR: [
          filterDeckType ? { deckType: filterDeckType } : undefined,
          deckType ? { deckType: deckType.toString().toUpperCase() } : undefined,
          typeof deckType === 'string' ? { deck: { slug: deckType } } : undefined
        ].filter(Boolean)
      },
      include: { deck: true }
    });

    if (allCards.length === 0) {
      throw new Error(`No cards found for deck type: ${deckType}`);
    }

    // Mezclar y seleccionar las cartas necesarias
    const shuffledCards = shuffleArray(allCards);
    const selectedCards = shuffledCards.slice(0, spreadConfig.positions);

    // Formatear las cartas con posiciones e información de inversión
    const formattedCards = selectedCards.map((card, index) => {
      const reversed = isReversed();
      return {
        position: index + 1,
        card: {
          id: card.id,
          name: card.name,
          cardNumber: card.cardNumber,
          arcana: card.arcana,
          suit: card.suit,
          meaning: reversed ? card.reversedMeaning : card.meaning,
          keywords: card.keywords,
          imageUrl: card.imageUrl,
          deckType: card.deckType,
          prompt: card.prompt,
          reversed: reversed
        }
      };
    });

    console.log(`✅ Selected ${selectedCards.length} tarot cards for ${spreadType} spread`);
    return formattedCards;

  } catch (error) {
    console.error('Error selecting tarot cards:', error);
    throw error;
  }
}

/**
 * Selecciona runas de la base de datos
 * @param {string} spreadType - Tipo de tirada
 * @param {string} runeSet - Set de runas (ELDER_FUTHARK por defecto)
 * @returns {Promise<Array>} Array de runas seleccionadas
 */
export async function selectRunes(spreadType, runeSet = 'ELDER_FUTHARK') {
  try {
    const spreadConfig = SPREAD_CONFIGURATIONS[spreadType];
    if (!spreadConfig) {
      throw new Error(`Spread type '${spreadType}' not supported`);
    }

    if (spreadConfig.type !== 'runes') {
      throw new Error(`Spread '${spreadType}' is not a rune spread`);
    }

    // Obtener todas las runas del set especificado (case-insensitive)
    // Normalizar el valor recibido para aceptar guion medio y guion bajo
    const normalizedSet = runeSet.replace(/-/g, '_').toUpperCase();
    const allRunes = await prisma.rune.findMany({
      where: {
        runeSet: {
          equals: normalizedSet,
          mode: 'insensitive'
        }
      }
    });

    if (allRunes.length === 0) {
      throw new Error(`No runes found for set: ${runeSet}`);
    }

    // Mezclar y seleccionar las runas necesarias
    const shuffledRunes = shuffleArray(allRunes);
    const selectedRunes = shuffledRunes.slice(0, spreadConfig.positions);

    // Formatear las runas con posiciones e información de inversión
    const formattedRunes = selectedRunes.map((rune, index) => {
      const reversed = isReversed();
      return {
        position: index + 1,
        rune: {
          id: rune.id,
          name: rune.name,
          symbol: rune.symbol,
          meaning: reversed ? rune.reversedMeaning : rune.meaning,
          keywords: rune.keywords,
          imageUrl: rune.imageUrl,
          runeSet: rune.runeSet,
          prompt: rune.prompt,
          reversed: reversed
        }
      };
    });

    console.log(`✅ Selected ${selectedRunes.length} runes for ${spreadType} spread`);
    return formattedRunes;

  } catch (error) {
    console.error('Error selecting runes:', error);
    throw error;
  }
}

/**
 * Función principal para seleccionar cartas/runas según el tipo
 * @param {string} type - Tipo de lectura ('tarot' o 'runes')
 * @param {string} spreadType - Tipo de tirada
 * @param {string} deckType - Tipo de baraja o set de runas
 * @returns {Promise<Array>} Array de elementos seleccionados
 */
export async function selectCards(type, spreadType, deckType) {
  try {
    if (type.toLowerCase() === 'tarot') {
      return await selectTarotCards(spreadType, deckType);
    } else if (type.toLowerCase() === 'runes') {
      return await selectRunes(spreadType, deckType);
    } else {
      throw new Error(`Reading type '${type}' not supported`);
    }
  } catch (error) {
    console.error('Error in selectCards:', error);
    throw error;
  }
}

/**
 * Obtiene las configuraciones de tiradas disponibles
 * @param {string} type - Tipo de lectura ('tarot' o 'runes')
 * @returns {Object} Configuraciones de tiradas filtradas por tipo
 */
export function getAvailableSpreads(type) {
  const filtered = {};
  Object.entries(SPREAD_CONFIGURATIONS).forEach(([key, value]) => {
    if (value.type === type.toLowerCase()) {
      filtered[key] = value;
    }
  });
  return filtered;
}

/**
 * Obtiene información de una tirada específica
 * @param {string} spreadType - Tipo de tirada
 * @returns {Object|null} Configuración de la tirada o null si no existe
 */
export function getSpreadInfo(spreadType) {
  return SPREAD_CONFIGURATIONS[spreadType] || null;
}

// Cerrar conexión al finalizar
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { SPREAD_CONFIGURATIONS };