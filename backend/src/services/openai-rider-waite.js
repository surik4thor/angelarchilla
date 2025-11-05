import { openai } from './openai-client.js';

/**
 * Servicio especializado para interpretaciones del Tarot Rider-Waite
 * Enfoque en simbolismo visual rico y arquetipos psicológicos
 */

// Configuración específica del Rider-Waite
const RIDER_WAITE_CONFIG = {
  approach: 'Interpretación basada en el rico simbolismo visual y arquetipos psicológicos del Rider-Waite',
  focus: 'Las ilustraciones detalladas y escenas narrativas proporcionan lecturas intuitivas y claras',
  specialty: 'Ideal para conectar con imágenes mentales y simbolismo moderno',
  era: 'Creado en 1910 por Arthur Edward Waite y Pamela Colman Smith'
};

/**
 * Genera una lectura completa usando la metodología Rider-Waite
 */
async function generarLecturaRiderWaite(cartas, pregunta, tipoTirada) {
  try {
    const prompt = construirPromptRiderWaite(cartas, pregunta, tipoTirada);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Eres un experto tarotista especializado en el Tarot Rider-Waite. Tu enfoque se basa en:

${RIDER_WAITE_CONFIG.approach}

METODOLOGÍA RIDER-WAITE:
- Simbolismo visual rico: Cada carta tiene ilustraciones detalladas llenas de símbolos
- Arquetipos psicológicos: Basado en estudios de Carl Jung y psicología profunda  
- Narrativa clara: Las imágenes cuentan historias que son fáciles de interpretar
- Intuición moderna: Diseñado para lectores contemporáneos y principiantes
- Colores y escenas: Cada elemento visual tiene significado específico

CARACTERÍSTICAS DEL RIDER-WAITE:
- Arcanos Mayores: 22 cartas con simbolismo hermético y cabalístico
- Arcanos Menores: 56 cartas con escenas completas (no solo símbolos de palo)
- Elementos visuales: Figuras humanas, paisajes, objetos simbólicos detallados
- Psicología: Cada carta representa estados mentales y emocionales específicos

Tu interpretación debe ser:
1. Visual y descriptiva, haciendo referencia a las imágenes de las cartas
2. Psicológicamente profunda pero accesible
3. Narrativa y storytelling basado en las escenas
4. Moderna en lenguaje pero respetando la tradición
5. Práctica y aplicable a la vida contemporánea`
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error('Error en servicio Rider-Waite:', error);
    throw new Error('Error al generar interpretación Rider-Waite');
  }
}

/**
 * Construye el prompt específico para Rider-Waite
 */
function construirPromptRiderWaite(cartas, pregunta, tipoTirada) {
  let prompt = `CONSULTA DE TAROT RIDER-WAITE

Pregunta del consultante: "${pregunta}"
Tipo de tirada: ${tipoTirada}
Cartas seleccionadas: ${cartas.map(c => `${c.nombre} (${c.orientacion})`).join(', ')}

INSTRUCCIONES RIDER-WAITE:
1. Para cada carta, describe brevemente la imagen visual que se ve en ella
2. Interpreta los símbolos específicos presentes en la ilustración
3. Conecta el simbolismo con la pregunta usando arquetipos psicológicos
4. Proporciona una narrativa cohesiva basada en las escenas de las cartas
5. Incluye consejos prácticos basados en el mensaje de las imágenes

ESTRUCTURA DE RESPUESTA:
- Análisis individual de cada carta (imagen + simbolismo + significado)
- Síntesis narrativa conectando todas las cartas
- Mensaje principal y consejos prácticos
- Reflexión final basada en la sabiduría del Rider-Waite

Enfócate en el poder visual y narrativo único del Rider-Waite. Habla de lo que se "ve" en las cartas y cómo esas imágenes responden a la pregunta formulada.`;

  return prompt;
}

/**
 * Genera un mensaje diario Rider-Waite
 */
async function obtenerMensajeRiderWaiteDiario() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Eres un maestro del Tarot Rider-Waite. Genera un mensaje diario inspirado en la riqueza visual y simbólica de este tarot. El mensaje debe ser motivacional, visualmente evocativo y basado en los arquetipos del Rider-Waite.`
        },
        {
          role: "user",
          content: "Genera un mensaje inspiracional diario basado en la sabiduría visual del Tarot Rider-Waite. Incluye una imagen mental específica y un consejo práctico."
        }
      ],
      temperature: 0.9,
      max_tokens: 300
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error('Error mensaje diario Rider-Waite:', error);
    throw new Error('Error al generar mensaje Rider-Waite');
  }
}

export {
  generarLecturaRiderWaite,
  obtenerMensajeRiderWaiteDiario,
  RIDER_WAITE_CONFIG
};