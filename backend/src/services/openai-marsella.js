import { openai } from './openai-client.js';

/**
 * Servicio especializado para interpretaciones del Tarot de Marsella
 * Enfoque en tradición francesa pura y simbolismo geométrico esencial
 */

// Configuración específica del Marsella
const MARSELLA_CONFIG = {
  approach: 'Interpretación basada en la tradición francesa clásica y simbolismo geométrico puro',
  focus: 'Símbolos esenciales sin adornos, numerología sagrada y geometría espiritual',
  specialty: 'Para lectores avanzados que prefieren simbolismo abstracto y meditativo',
  era: 'Tradición francesa desde el siglo XVII, el tarot conservado más antiguo'
};

/**
 * Genera una lectura completa usando la metodología del Tarot de Marsella
 */
async function generarLecturaMarsella(cartas, pregunta, tipoTirada) {
  try {
    const prompt = construirPromptMarsella(cartas, pregunta, tipoTirada);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Eres un maestro tarotista especializado en el Tarot de Marsella, la tradición más pura y ancestral del tarot. Tu enfoque se basa en:

${MARSELLA_CONFIG.approach}

METODOLOGÍA TAROT DE MARSELLA:
- Simbolismo puro: Geometría sagrada, colores primarios, símbolos esenciales
- Tradición francesa: Herencia directa de los maestros cartománticos europeos
- Numerología sagrada: Los números son clave, especialmente en arcanos menores
- Abstracción meditativa: Interpretación basada en esencia, no en imágenes narrativas
- Colores tradicionales: Azul, rojo, amarillo y blanco con significados específicos

CARACTERÍSTICAS DEL MARSELLA:
- Arcanos Mayores: 22 cartas con simbolismo hermético puro y directo
- Arcanos Menores: 56 cartas simples (copas, espadas, bastos, oros) sin escenas
- Elementos geométricos: Formas, números y símbolos sin figuras complejas
- Tradición oral: Interpretaciones transmitidas de maestro a discípulo
- Esencia versus forma: Lo importante no es lo que se ve, sino lo que se siente

Tu interpretación debe ser:
1. Abstracta y simbólica, enfocándose en esencias más que en imágenes
2. Numerológicamente precisa, especialmente con arcanos menores
3. Tradicionalmente francesa en estilo y sabiduría
4. Meditativa y profunda, para reflexión personal
5. Directa al grano, sin adornos innecesarios`
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error('Error en servicio Marsella:', error);
    throw new Error('Error al generar interpretación Marsella');
  }
}

/**
 * Construye el prompt específico para Tarot de Marsella
 */
function construirPromptMarsella(cartas, pregunta, tipoTirada) {
  let prompt = `CONSULTA DE TAROT DE MARSELLA

Pregunta del consultante: "${pregunta}"
Tipo de tirada: ${tipoTirada}
Cartas seleccionadas: ${cartas.map(c => `${c.nombre} (${c.orientacion})`).join(', ')}

INSTRUCCIONES TAROT DE MARSELLA:
1. Para cada carta, enfócate en su esencia numérica y simbólica pura
2. Interpreta según la tradición francesa clásica y geometría sagrada  
3. Los arcanos menores se leen por numerología (1-10) y elemento (copas, espadas, bastos, oros)
4. Evita descripciones visuales complejas, enfócate en significados esenciales
5. Proporciona sabiduría directa y meditativa

ESTRUCTURA DE RESPUESTA:
- Análisis simbólico de cada carta (número + elemento + esencia)
- Síntesis según tradición marsellesa clásica
- Mensaje directo sin adornos
- Reflexión final con sabiduría ancestral francesa

Enfócate en la pureza simbólica y la tradición ancestral. El Marsella habla a través de formas simples pero poderosas, números sagrados y colores primarios. La respuesta debe ser meditativa y esencial.`;

  return prompt;
}

/**
 * Genera un mensaje diario del Tarot de Marsella
 */
async function obtenerMensajeMarsellaDiario() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Eres un maestro del Tarot de Marsella. Genera un mensaje diario inspirado en la tradición francesa pura y el simbolismo geométrico ancestral. El mensaje debe ser directo, meditativo y basado en la esencia del Marsella.`
        },
        {
          role: "user",
          content: "Genera un mensaje inspiracional diario basado en la sabiduría ancestral del Tarot de Marsella. Debe ser directo, simbólico y meditativo."
        }
      ],
      temperature: 0.8,
      max_tokens: 250
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error('Error mensaje diario Marsella:', error);
    throw new Error('Error al generar mensaje Marsella');
  }
}

export {
  generarLecturaMarsella,
  obtenerMensajeMarsellaDiario,
  MARSELLA_CONFIG
};