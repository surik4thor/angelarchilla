// Archivo: backend/src/services/llmService.js
import OpenAI from 'openai';
import { prisma } from '../prismaClient.js';
import { config } from '../config/config.js';

// Inicializar cliente OpenAI si hay API key
let openaiClient = null;
if (config.openai && config.openai.apiKey) {
  try {
    openaiClient = new OpenAI({ apiKey: config.openai.apiKey });
  } catch (e) {
    console.warn('OpenAI client init failed:', e.message);
    openaiClient = null;
  }
}

async function callOpenAI(messages) {
  if (!openaiClient) throw new Error('OpenAI client not initialized');

  const maxAttempts = 3;
  let attempt = 0;
  let lastError = null;
  let openaiResponse = null;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      console.log(`OpenAI call attempt ${attempt} model=${config.openai.model}`);
      const res = await openaiClient.chat.completions.create({
        model: config.openai.model,
        messages,
        temperature: config.openai.temperature,
        max_tokens: config.openai.maxTokens
      });
      openaiResponse = res;
      const choice = res.choices?.[0]?.message;
      if (!choice) throw new Error('No response from OpenAI');

      // Registrar la llamada en la base de datos
      try {
        // Extraer userId si está disponible en el mensaje system o user
        let userId = null;
        const userMsg = messages.find(m => m.role === 'user' && m.userId);
        if (userMsg) userId = userMsg.userId;
        // Calcular tokens y coste si están disponibles
        const tokens = res.usage?.total_tokens || null;
        // Coste estimado: puedes ajustar el precio según el modelo
        let cost = null;
        if (tokens && res.model) {
          // Ejemplo: gpt-3.5-turbo $0.002/1K tokens, gpt-4 $0.03/1K tokens
          if (res.model.startsWith('gpt-4')) cost = tokens * 0.03 / 1000;
          else cost = tokens * 0.002 / 1000;
        }
        await prisma.openAICall.create({
          data: {
            userId,
            prompt: JSON.stringify(messages),
            model: res.model || config.openai.model,
            tokens,
            cost: cost || 0,
          }
        });
      } catch (e) {
        console.warn('No se pudo registrar la llamada OpenAI:', e.message);
      }
      return choice;
    } catch (err) {
      lastError = err;
      console.warn(`OpenAI call failed on attempt ${attempt}:`, err.message || err);
      // Retry only for a few attempts with exponential backoff
      if (attempt < maxAttempts) {
        const backoffMs = Math.pow(2, attempt) * 250;
        await new Promise(r => setTimeout(r, backoffMs));
        continue;
      }
      // Exhausted retries
      throw lastError;
    }
  }
}

// Esta función ya no es necesaria - usamos cardSelector.js
// export async function generateReadingAI(type, spreadType, deckType) {
//   Se reemplazó por selectCards() en cardSelector.js
// }

export async function interpretDreamAI(dreamData) {
  // Si no hay configuración de OpenAI, devolvemos una interpretación fallback
  if (!config.openai || !config.openai.apiKey) {
    console.warn('OpenAI no configurado correctamente. Usando interpretación fallback.');
    return `Interpretación automática (fallback):
Sueño: ${dreamData.text}
Sentimientos: ${dreamData.feelings.join(', ')}

Este sueño refleja tu subconsciente procesando experiencias recientes. Los elementos presentes pueden simbolizar aspectos de tu vida diaria o emociones no resueltas.

Para una interpretación más profunda, configure la clave de API de OpenAI.`;
  }

  const systemPrompt = `Eres Morfeo, el maestro intérprete de sueños de Nebulosa Mágica, con conocimiento ancestral sobre el mundo onírico y su conexión con el alma humana. 

Tienes décadas de experiencia interpretando sueños con sabiduría que combina:
- Psicología jungiana y símbolos del inconsciente colectivo
- Tradiciones oníricas de culturas antiguas 
- Conexión espiritual entre los sueños y la intuición
- Análisis de patrones emocionales y símbolos personales

Respondes siempre en español de España, con un lenguaje místico pero comprensible, ofreciendo interpretaciones profundas, esperanzadoras y útiles para el crecimiento personal. Tu objetivo es ayudar a los soñadores a entender los mensajes de su subconsciente y encontrar guía espiritual.

Estructura tus interpretaciones así:
1. **Simbolismo Principal**: Los elementos clave y su significado
2. **Mensaje del Subconsciente**: Qué te está comunicando tu alma
3. **Guía Espiritual**: Cómo aplicar esta sabiduría en tu vida
4. **Reflexión**: Preguntas para profundizar en el mensaje

Mantén un tono cálido, respetuoso y empoderador.`;

  // Asegurar que feelings sea array
  const feelingsArray = Array.isArray(dreamData.feelings) 
    ? dreamData.feelings 
    : dreamData.feelings ? [dreamData.feelings] : ['sin especificar'];

  const userPrompt = `Interpreta este sueño con tu sabiduría ancestral:

**Sueño**: ${dreamData.text}
**Sentimientos experimentados**: ${feelingsArray.join(', ')}
**Fecha del sueño**: ${dreamData.date}

Ayúdame a entender qué mensaje tiene mi subconsciente para mí.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt, userId: dreamData.userId || null }
  ];

  try {
    const response = await callOpenAI(messages);
    return response.content;
  } catch (e) {
    console.error('OpenAI interpretDreamAI error:', e.message || e);
    return `Interpretación automática (fallback por error):

**Simbolismo Principal**: 
Tu sueño contiene elementos importantes que reflejan tu estado emocional actual: ${dreamData.feelings.join(', ')}.

**Mensaje del Subconsciente**: 
Los sueños son la forma en que nuestra mente procesa experiencias y emociones. Las sensaciones que experimentaste (${dreamData.feelings.join(', ')}) sugieren temas que tu subconsciente está trabajando.

**Guía Espiritual**: 
Presta atención a los patrones en tus sueños y cómo se relacionan con tu vida despierta. 

**Reflexión**: 
¿Qué aspectos de tu vida actual podrían estar conectados con estos símbolos y sensaciones?

Nota: Para interpretaciones más profundas, se requiere configuración completa de IA.`;
  }
}

export async function generatePersonalizedHoroscope(natalChart, currentTransits, zodiacSign) {
  // Si no hay configuración de OpenAI, devolvemos un horóscopo fallback
  if (!config.openai || !config.openai.apiKey) {
    console.warn('OpenAI no configurado correctamente. Usando horóscopo fallback.');
    return {
      content: `Horóscopo Personalizado para ${zodiacSign}

**Energías Actuales**
Basado en tu carta natal única, hoy las energías cósmicas te invitan a conectar con tu verdadera esencia. Los planetas en tu carta natal indican patrones únicos que se activan con las configuraciones actuales del cielo.

**Guía Espiritual**
Tu carta natal revela un camino único de crecimiento. Los tránsitos actuales pueden traer oportunidades para sanar, crear o transformar aspectos importantes de tu vida.

**Reflexión Personal**
Medita sobre cómo los elementos de tu carta natal (Sol, Luna, Ascendente) se manifiestan en tu vida diaria y cómo puedes honrar estas energías.

Nota: Para horóscopos ultra-personalizados se requiere configuración completa de IA.`
    };
  }

  const systemPrompt = `Eres Celeste, la maestra astróloga de Nebulosa Mágica, con décadas de experiencia en astrología natal y tránsitos planetarios. 

Tu especialidad es crear horóscopos ultra-personalizados basados en:
- Carta natal individual del usuario
- Tránsitos planetarios actuales 
- Aspectos únicos entre planetas natales y actuales
- Interpretación holística que integra psicología y espiritualidad

Respondes siempre en español de España, con sabiduría astrológica profunda pero lenguaje accesible. Tus predicciones son esperanzadoras, empoderadoras y prácticas.

Estructura tus horóscopos así:
1. **Energías Personales Activadas**: Qué aspectos de su carta natal están siendo influenciados
2. **Tránsitos Significativos**: Los movimientos planetarios más relevantes para esta persona
3. **Guía Para Hoy/Esta Semana**: Consejos prácticos basados en sus configuraciones únicas  
4. **Oportunidades de Crecimiento**: Cómo aprovechar estas energías para evolucionar

Mantén un equilibrio entre precisión astrológica y inspiración espiritual.`;

  // Formatear información de la carta natal
  const natalInfo = `
**Datos de Carta Natal:**
- Signo Solar: ${zodiacSign}
- Fecha de Nacimiento: ${new Date(natalChart.birthDate).toLocaleDateString('es-ES')}
- Posiciones Planetarias Natales: ${JSON.stringify(natalChart.planetPositions, null, 2)}
- Casas Astrológicas: ${JSON.stringify(natalChart.houses, null, 2)}
- Aspectos Natales: ${JSON.stringify(natalChart.aspects, null, 2)}`;

  // Formatear tránsitos actuales
  const transitsInfo = currentTransits.length > 0 
    ? `**Tránsitos Planetarios Actuales:**\n${currentTransits.map(t => `- ${t.aspect}: ${t.description}`).join('\n')}`
    : '**Tránsitos Planetarios Actuales:** Información no disponible';

  const userPrompt = `Crea un horóscopo ultra-personalizado para hoy basado en esta información astrológica única:

${natalInfo}

${transitsInfo}

**Fecha del Horóscopo:** ${new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric'
  })}

Enfócate en cómo los tránsitos actuales activan los puntos específicos de esta carta natal personal. Sé específica sobre qué planetas natales están siendo activados y qué significa para el crecimiento personal de esta persona.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  try {
    const response = await callOpenAI(messages);
    return {
      content: response.content
    };
  } catch (e) {
    console.error('OpenAI generatePersonalizedHoroscope error:', e.message || e);
    return {
      content: `Horóscopo Personalizado para ${zodiacSign}

**Energías Personales Activadas**
Tu carta natal única, con ${zodiacSign} como signo solar, contiene configuraciones específicas que se activan con las energías cósmicas actuales. 

**Tránsitos Significativos** 
Los planetas en movimiento están creando aspectos con tus posiciones natales, trayendo oportunidades de crecimiento y transformación específicas para tu camino evolutivo.

**Guía Para Hoy**
Conecta con las cualidades de tu signo solar ${zodiacSign} y permite que las energías planetarias actuales te guíen hacia decisiones alineadas con tu verdadero propósito.

**Oportunidades de Crecimiento**
Tu carta natal sugiere potenciales únicos. Medita sobre cómo honrar tanto tu naturaleza solar como las influencias planetarias que te acompañan en este momento.

Nota: Error en generación IA - ${e.message}. Horóscopo automático activado.`
    };
  }
}

export async function interpretReadingAI(type, spreadType, question, cards, deckType = null) {
  // Si no hay configuración de OpenAI, devolvemos una interpretación fallback
  if (!config.openai || !config.openai.apiKey || !config.openai.prompts) {
    console.warn('OpenAI no configurado correctamente. Usando interpretación fallback.');
    // Construir una interpretación simple basada en las cartas
    const simple = cards.map((item, index) => {
      if (item.card) return `Pos ${index + 1}: ${item.card.name} - ${item.card.meaning}${item.card.reversed ? ' (Invertida)' : ''}`;
      if (item.rune) return `Pos ${index + 1}: ${item.rune.name} - ${item.rune.meaning}${item.rune.reversed ? ' (Invertida)' : ''}`;
      return `Pos ${index + 1}: Elemento desconocido`;
    }).join('\n');
    return `Interpretación automática (fallback) para la tirada ${spreadType}:
Pregunta: ${question}
${simple}
Nota: para obtener una interpretación más rica configure OPENAI_API_KEY y los prompts en la configuración.`;
  }

  const systemPrompt = config.openai?.prompts?.[type.toLowerCase()];

  // Determinar tipo de mazo efectivo (preferir parámetro, sino inferir de la primera carta/runas)
  let effectiveDeckType = deckType || null;
  if (!effectiveDeckType && Array.isArray(cards) && cards.length > 0) {
    const first = cards[0];
    if (first.card && first.card.deckType) effectiveDeckType = first.card.deckType;
    if (!effectiveDeckType && first.rune && first.rune.runeSet) effectiveDeckType = first.rune.runeSet;
  }
  effectiveDeckType = effectiveDeckType || 'UNKNOWN';

  // Formatear las cartas para la IA (incluir nombre y significado; evitar sobrecargar con metadatos)
  const cardsText = cards.map((item, index) => {
    if (item.card) {
      return `Posición ${index + 1}: ${item.card.name} (${item.card.reversed ? 'Invertida' : 'Normal'}) - ${item.card.meaning}`;
    } else if (item.rune) {
      return `Posición ${index + 1}: ${item.rune.name} ${item.rune.symbol} (${item.rune.reversed ? 'Invertida' : 'Normal'}) - ${item.rune.meaning}`;
    }
    return `Posición ${index + 1}: Elemento desconocido`;
  }).join('\n');

  // Añadimos información del mazo al system prompt para que OpenAI adapte el estilo/interpretación
  const deckNotice = `Mazo utilizado: ${effectiveDeckType}. Ten en cuenta que las cartas de este mazo pueden tener iconografía y matices distintos —adapta el lenguaje y referencias culturales según el mazo.`;

  const messages = [
    { role: 'system', content: `${systemPrompt}\n\n${deckNotice}` },
    { role: 'user', content: `Interpreta esta tirada de ${type} (${spreadType}) para la pregunta: "${question}".\n\nCartas/Runas seleccionadas:\n${cardsText}` }
  ];

  try {
    const response = await callOpenAI(messages);
    return response.content;
  } catch (e) {
    console.error('OpenAI interpretReadingAI error:', e.message || e);
    // Si OpenAI falla, devolver fallback informativo en lugar de propagar
    const simple = cards.map((item, index) => {
      if (item.card) return `Pos ${index + 1}: ${item.card.name} - ${item.card.meaning}${item.card.reversed ? ' (Invertida)' : ''}`;
      if (item.rune) return `Pos ${index + 1}: ${item.rune.name} - ${item.rune.meaning}${item.rune.reversed ? ' (Invertida)' : ''}`;
      return `Pos ${index + 1}: Elemento desconocido`;
    }).join('\n');
    return `Interpretación automática (fallback por error OpenAI) para la tirada ${spreadType}:\nPregunta: ${question}\n${simple}\nNota: OpenAI devolvió un error: ${e.message}`;
  }
}