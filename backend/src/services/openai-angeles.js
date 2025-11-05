// Servicio para generar lecturas del Tarot de los Ángeles usando OpenAI (78 cartas celestiales)
import OpenAI from 'openai';
import { angelsDeck, angelicalHierarchy, getAngelCard } from '../data/angels-deck.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Definiciones de las consultas angelicales y sus significados
const angelSpreads = {
  'mensaje-angelical': {
    positions: ['Mensaje Divino'],
    description: 'Un mensaje directo de tus ángeles guardianes'
  },
  'trinidad-angelical': {
    positions: ['Lecciones del Pasado', 'Guía Presente', 'Bendiciones Futuras'],
    description: 'La sabiduría angelical para tu camino de vida'
  },
  'cruz-angelical': {
    positions: ['Situación Actual', 'Desafío a Superar', 'Guía Angelical', 'Resultado Bendecido'],
    description: 'Orientación completa bajo la protección angelical'
  },
  'guia-semanal': {
    positions: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    description: 'Mensajes angelicales para cada día de la semana'
  },
  'jerarquia-celestial': {
    positions: ['Primera Jerarquía', 'Segunda Jerarquía', 'Tercera Jerarquía', 'Arcángeles', 'Ángeles Guardianes'],
    description: 'Conexión con toda la jerarquía celestial para guía completa'
  },
  'proposito-vida': {
    positions: ['Tu Alma', 'Dones Especiales', 'Misión Actual', 'Obstáculos a Transformar', 'Propósito Divino'],
    description: 'Descubre tu misión divina y camino espiritual'
  },
  'sanacion-angeles': {
    positions: ['Heridas a Sanar', 'Energía Angelical', 'Perdón Necesario', 'Sanación del Corazón', 'Renovación Espiritual', 'Bendición Final'],
    description: 'Proceso de sanación con ayuda angelical'
  }
};

// Función para generar cartas angelicales aleatorias
function getRandomAngelCards(count) {
  const cardNumbers = Array.from({length: 78}, (_, i) => i + 1);
  const selectedCards = [];
  
  for (let i = 0; i < count && cardNumbers.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * cardNumbers.length);
    const cardNumber = cardNumbers.splice(randomIndex, 1)[0];
    const cardData = angelsDeck[cardNumber];
    
    if (cardData) {
      selectedCards.push({
        number: cardNumber,
        ...cardData
      });
    }
  }
  
  return selectedCards;
}

// Función para obtener información de jerarquía angelical
function getHierarchyInfo(hierarchy) {
  const hierarchyDescriptions = {
    "Serafines": "Los más cercanos a Dios, ángeles del amor puro y fuego divino",
    "Querubines": "Guardianes de la sabiduría divina y protectores celestiales",
    "Tronos": "Ángeles de la justicia divina y equilibrio cósmico",
    "Dominaciones": "Líderes celestiales que gobiernan con sabiduría",
    "Virtudes": "Ángeles de los milagros y la fuerza espiritual",
    "Potestades": "Guerreros celestiales contra las fuerzas negativas",
    "Principados": "Protectores de naciones y comunidades",
    "Mensajeros": "Portadores de decretos y comunicaciones divinas",
    "Noveno Coro": "Ángeles especializados en sanación y custodia",
    "Arcángeles": "Líderes angelicales con misiones específicas",
    "Hadas": "Espíritus de la naturaleza y la magia benevolente",
    "Gnomos": "Guardianes de la tierra y el trabajo",
    "Ángeles Representativos": "Ángeles de aspectos específicos de la vida",
    "Ángeles Especiales": "Seres celestiales con propósitos únicos",
    "Grigori": "Ángeles vigilantes con lecciones sobre el poder",
    "Ángeles Negativos": "Ángeles caídos que enseñan a través del contraste y la superación"
  };
  
  return hierarchyDescriptions[hierarchy] || "Seres celestiales con sabiduría divina";
}

export async function generarLecturaAngeles(spreadType, question, userId = null) {
  const spread = angelSpreads[spreadType];
  if (!spread) {
    throw new Error('Tipo de consulta angelical no válida');
  }

  // Obtener cartas angelicales aleatorias para la tirada
  const selectedCards = getRandomAngelCards(spread.positions.length);

  const prompt = `
Eres un canal angelical divino especializado en el Tarot de los Ángeles de 78 cartas con la jerarquía celestial completa.
Interpretas mensajes de toda la corte celestial: Serafines, Querubines, Tronos, Dominaciones, Virtudes, Potestades, Principados, Arcángeles y Ángeles Guardianes.

Consulta: "${spreadType}" - ${spread.description}
Pregunta del consultante: "${question}"

CARTAS SELECCIONADAS POR LOS ÁNGELES:
${selectedCards.map((card, index) => `
Posición ${index + 1} - "${spread.positions[index]}":
- Carta: ${card.name} (Carta #${card.number})
- Jerarquía: ${card.hierarchy} - ${card.tier}
- Significado al derecho: ${card.meaning_upright}
${card.meaning_reversed ? `- Significado al revés: ${card.meaning_reversed}` : '- Esta carta solo tiene significado positivo'}
- Palabras clave: ${card.keywords_upright.join(', ')}
- Elemento: ${card.element} | Planeta: ${card.planet}
`).join('')}

INSTRUCCIONES PARA LA INTERPRETACIÓN:
1. Para cada carta, considera si está al derecho o al revés (usa intuición angelical)
2. Conecta el significado específico de cada ángel con la posición en la tirada
3. Incluye la sabiduría específica de cada jerarquía celestial
4. Si aparecen Ángeles Negativos, interprétalos como lecciones de superación y crecimiento

Estilo de respuesta angelical:
- Lenguaje amoroso, elevador y lleno de luz
- Transforma cualquier aspecto desafiante en oportunidad de crecimiento
- Enfoque en el amor incondicional y la protección divina
- Mensajes esperanzadores que conecten con el propósito superior
- Incluye la energía específica de cada jerarquía angelical

Formato JSON:
{
  "spreadType": "${spreadType}",
  "description": "${spread.description}",
  "cards": [
    {
      "cardNumber": número de la carta,
      "position": "nombre de la posición",
      "angel": "Nombre completo del ángel",
      "hierarchy": "Jerarquía celestial",
      "orientation": "upright" o "reversed",
      "message": "Mensaje principal del ángel específico (150-250 caracteres)",
      "guidance": "Guía práctica basada en su especialidad (100-150 caracteres)", 
      "affirmation": "Afirmación angelical personalizada (50-100 caracteres)",
      "energy": "Energía y colores específicos de esta jerarquía",
      "symbol": "Símbolo o señal que este ángel puede enviar",
      "hierarchyWisdom": "Sabiduría específica de esta jerarquía celestial (50-100 caracteres)"
    }
  ],
  "overallMessage": "Mensaje conjunto de toda la jerarquía celestial presente (200-300 caracteres)",
  "angelicBlessing": "Bendición final de protección y amor divino (100-150 caracteres)",
  "celestialGuidance": "Guía especial sobre la jerarquía angelical involucrada (100-150 caracteres)"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: Number(process.env.OPENAI_TEMPERATURE) || 0.8,
      max_tokens: Number(process.env.OPENAI_MAX_TOKENS) || 2500,
    });

    const reading = JSON.parse(response.choices[0].message.content);
    
    // Añadir metadatos adicionales
    reading.timestamp = new Date().toISOString();
    reading.userId = userId;
    reading.type = 'angel-reading';
    reading.totalCards = 78;
    reading.selectedCards = selectedCards.map(card => ({
      number: card.number,
      name: card.name,
      hierarchy: card.hierarchy
    }));
    
    return reading;
    
  } catch (error) {
    console.error('Error generando lectura angelical:', error);
    throw new Error('Error al conectar con la energía angelical');
  }
}

// Función para obtener un mensaje angelical diario con las 78 cartas
export async function obtenerMensajeAngelicalDiario(userId = null) {
  // Seleccionar una carta angelical aleatoria para el día
  const dailyCard = getRandomAngelCards(1)[0];

  const prompt = `
Como canal angelical divino, canaliza un mensaje diario de la carta:

CARTA DEL DÍA:
- Ángel: ${dailyCard.name}
- Jerarquía: ${dailyCard.hierarchy} - ${dailyCard.tier}
- Significado: ${dailyCard.meaning_upright}
- Palabras clave: ${dailyCard.keywords_upright.join(', ')}
- Elemento: ${dailyCard.element} | Planeta: ${dailyCard.planet}

Canaliza la energía específica de este ángel y su jerarquía para crear un mensaje diario personal.

Incluye:
1. Mensaje personal de este ángel específico
2. Afirmación basada en su energía
3. Color de protección de su jerarquía
4. Acción angelical específica de su especialidad
5. Sabiduría de su nivel celestial

Respuesta amorosa, elevadora y conectada con la jerarquía celestial específica.

Formato JSON:
{
  "cardNumber": ${dailyCard.number},
  "angel": "${dailyCard.name}",
  "hierarchy": "${dailyCard.hierarchy}",
  "dailyMessage": "Mensaje personal de este ángel específico (100-150 caracteres)",
  "affirmation": "Afirmación basada en su energía angelical (50-80 caracteres)",
  "protectionColor": "Color de protección de su jerarquía celestial",
  "angelicAction": "Acción específica basada en su especialidad (50-100 caracteres)",
  "hierarchyWisdom": "Sabiduría de su nivel celestial (50-100 caracteres)",
  "blessing": "Bendición final de este ángel (50-100 caracteres)"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 800,
    });

    const message = JSON.parse(response.choices[0].message.content);
    message.timestamp = new Date().toISOString();
    message.userId = userId;
    message.cardData = {
      number: dailyCard.number,
      name: dailyCard.name,
      hierarchy: dailyCard.hierarchy,
      tier: dailyCard.tier
    };
    
    return message;
    
  } catch (error) {
    console.error('Error obteniendo mensaje angelical diario:', error);
    throw new Error('Error al recibir el mensaje angelical');
  }
}

export { 
  angelSpreads, 
  getRandomAngelCards, 
  getHierarchyInfo, 
  angelsDeck, 
  angelicalHierarchy 
};