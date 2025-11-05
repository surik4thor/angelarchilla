// Servicio para generar lecturas del Tarot Egipcio usando OpenAI
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Definiciones de las tiradas egipcias y sus significados
const egyptianSpreads = {
  'siete-egipcias': {
    positions: ['Pasado', 'Presente', 'Futuro', 'Carta de la Suerte', 'Antepasados', 'Relaciones', 'Destino'],
    description: 'Lectura completa con sabiduría faraónica de las siete cartas sagradas'
  },
  'piramide-egipcia': {
    positions: ['Cúspide Divina', 'Plano Superior', 'Plano Medio', 'Plano Terrenal', 'Cimiento'],
    description: 'Estructura piramidal de conocimiento desde lo divino hasta lo terrenal'
  },
  'cruz-ankh': {
    positions: ['Vida Eterna', 'Poder Divino', 'Sabiduría', 'Protección'],
    description: 'La cruz Ankh revela los aspectos fundamentales de tu existencia'
  },
  'ojo-horus': {
    positions: ['Visión Interior', 'Protección', 'Sanación', 'Claridad', 'Poder'],
    description: 'El ojo de Horus te otorga visión mística y protección divina'
  },
  'nilo-sagrado': {
    positions: ['Fuente', 'Corriente', 'Cauce', 'Delta', 'Mar Eterno'],
    description: 'El flujo del Nilo sagrado marca el curso de tu destino'
  }
};

// Dioses y símbolos egipcios asociados
const egyptianSymbols = {
  gods: [
    { name: 'Ra', domain: 'Sol, poder supremo, vida', energy: 'Dorada brillante' },
    { name: 'Isis', domain: 'Magia, maternidad, protección', energy: 'Azul místico' },
    { name: 'Osiris', domain: 'Muerte, renacimiento, juicio', energy: 'Verde regenerador' },
    { name: 'Horus', domain: 'Cielo, protección, claridad', energy: 'Azul real' },
    { name: 'Thoth', domain: 'Sabiduría, escritura, magia', energy: 'Púrpura profundo' },
    { name: 'Anubis', domain: 'Muerte, guía espiritual, transformación', energy: 'Negro protector' },
    { name: 'Hathor', domain: 'Amor, belleza, música, alegría', energy: 'Rosa dorado' },
    { name: 'Ptah', domain: 'Creación, artesanía, manifestación', energy: 'Verde creador' }
  ],
  
  symbols: [
    'Ankh (vida eterna)', 'Ojo de Horus (protección)', 'Escarabajo (transformación)',
    'Loto (renacimiento)', 'Pirámide (ascensión)', 'Esfinge (misterio)',
    'Ibis (sabiduría)', 'Serpiente (poder kundalini)', 'Barca solar (viaje espiritual)'
  ],
  
  elements: {
    upper: 'Plano divino - Conexión con los dioses, aspectos espirituales superiores',
    center: 'Plano humano - Acción, decisiones, vida cotidiana, relaciones',
    lower: 'Plano instintivo - Pasiones, tentaciones, sombras, aspectos inconscientes'
  }
};

export async function generarLecturaEgipcia(spreadType, question, userId = null) {
  const spread = egyptianSpreads[spreadType];
  if (!spread) {
    throw new Error('Tipo de tirada egipcia no válida');
  }

  const prompt = `
Eres un sumo sacerdote egipcio del templo de Karnak, maestro en la interpretación de los sagrados arcanos egipcios.
Genera una lectura completa del Tarot Egipcio para la tirada "${spreadType}":
${spread.description}

Pregunta del consultante: "${question}"

Posiciones de la lectura: ${spread.positions.join(', ')}

IMPORTANTE: Cada carta egipcia tiene tres niveles de significado:
- PLANO SUPERIOR: Aspectos divinos, conexión con los dioses, espiritualidad
- PLANO CENTRAL: Acción humana, decisiones, manifestación en el mundo físico  
- PLANO INFERIOR: Instintos, tentaciones, sombras, aspectos inconscientes

Para cada posición, proporciona:
1. Un dios o diosa egipcia específica
2. El símbolo sagrado asociado
3. Interpretación del PLANO SUPERIOR (divino/espiritual)
4. Interpretación del PLANO CENTRAL (humano/acción)
5. Interpretación del PLANO INFERIOR (instintivo/sombra)
6. Mensaje integrado de los tres planos
7. Consejo práctico del sacerdote
8. Un jeroglífico o símbolo para meditar

Estilo de respuesta:
- Lenguaje místico y ceremonial egipcio
- Referencias a dioses, templos, Nilo, pirámides
- Sabiduría ancestral y profecía faraónica
- Conexión con los ciclos cósmicos y el ma'at (equilibrio)
- Respeto por el poder transformador del conocimiento

Formato JSON:
{
  "spreadType": "${spreadType}",
  "description": "${spread.description}",
  "cards": [
    {
      "position": "nombre de la posición",
      "deity": "Nombre del dios/diosa egipcia",
      "symbol": "Símbolo sagrado asociado",
      "upperPlane": "Interpretación del plano divino/superior (150-200 caracteres)",
      "centerPlane": "Interpretación del plano humano/central (150-200 caracteres)",
      "lowerPlane": "Interpretación del plano instintivo/inferior (150-200 caracteres)",
      "integratedMessage": "Mensaje unificado de los tres planos (200-250 caracteres)",
      "priestAdvice": "Consejo práctico del sacerdote (100-150 caracteres)",
      "meditationSymbol": "Jeroglífico o símbolo para meditar"
    }
  ],
  "overallReading": "Lectura general de todos los arcanos juntos (250-300 caracteres)",
  "pharaohBlessing": "Bendición final del faraón sagrado (100-150 caracteres)",
  "maat": "Enseñanza sobre el equilibrio y la justicia cósmica (150-200 caracteres)"
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
    reading.type = 'egyptian-reading';
    reading.temple = 'Templo de Karnak';
    
    return reading;
    
  } catch (error) {
    console.error('Error generando lectura egipcia:', error);
    throw new Error('Error al conectar con la sabiduría de los antiguos faraones');
  }
}

// Función para obtener un consejo egipcio diario
export async function obtenerConsejoEgipciodiario(userId = null) {
  const prompt = `
Como sumo sacerdote egipcio, proporciona un consejo de sabiduría faraónica para hoy.

Incluye:
1. Un dios egipcio específico que rige el día
2. Su mensaje de sabiduría ancestral
3. Un símbolo sagrado para llevar
4. Una acción recomendada bajo su protección
5. Una bendición faraónica

Respuesta mística y ceremonial egipcia.

Formato JSON:
{
  "deity": "Nombre del dios egipcio del día",
  "dailyWisdom": "Sabiduría ancestral para hoy (150-200 caracteres)",
  "sacredSymbol": "Símbolo egipcio de protección",
  "recommendedAction": "Acción recomendada bajo protección divina (100-150 caracteres)",
  "pharaohBlessing": "Bendición del faraón (100-150 caracteres)",
  "maat": "Enseñanza sobre el equilibrio para hoy (100-150 caracteres)"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 800,
    });

    const wisdom = JSON.parse(response.choices[0].message.content);
    wisdom.timestamp = new Date().toISOString();
    wisdom.userId = userId;
    wisdom.temple = 'Templo de Karnak';
    
    return wisdom;
    
  } catch (error) {
    console.error('Error obteniendo consejo egipcio diario:', error);
    throw new Error('Error al recibir la sabiduría faraónica');
  }
}

export { egyptianSpreads, egyptianSymbols };