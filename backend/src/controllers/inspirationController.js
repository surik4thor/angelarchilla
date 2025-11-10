import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generar frase inspiradora diaria
export const getDailyInspiration = async (req, res) => {
  try {
    // Obtener fecha de hoy en formato YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    
    // Buscar si ya existe una frase para hoy
    let dailyInspiration = await prisma.dailyInspiration.findUnique({
      where: { date: today }
    });

    if (!dailyInspiration) {
      // Generar nueva frase con OpenAI
      const prompt = `Genera una frase inspiradora, motivadora y positiva de máximo 15 palabras para personas interesadas en astrología, tarot y misticismo. La frase debe ser:
- Espiritual pero no religiosa
- Motivadora y positiva
- Relacionada con energía, intuición, cosmos, magia personal
- En español
- Sin emojis
- Directa y poderosa

Ejemplos del tono: "Tu intuición es tu mejor brújula, confía en ella", "La energía del universo conspira a tu favor hoy"

Solo responde con la frase, sin explicaciones.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en generar frases inspiradoras cortas para personas espirituales.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.8,
      });

      const inspiration = response.choices[0].message.content.trim();
      
      // Guardar en la base de datos
      dailyInspiration = await prisma.dailyInspiration.create({
        data: {
          date: today,
          message: inspiration,
          generatedBy: 'openai'
        }
      });
      
      console.log(`✨ Nueva frase generada para ${today}: "${inspiration}"`);
    } else {
      console.log(`♻️ Frase existente para ${today}: "${dailyInspiration.message}"`);
    }

    res.json({
      success: true,
      inspiration: dailyInspiration.message,
      date: today,
      cached: !!dailyInspiration
    });

  } catch (error) {
    console.error('Error generando inspiración diaria:', error);
    
    // Fallback a frases predefinidas si falla OpenAI
    const fallbackMessages = [
      'Tu intuición es tu mejor brújula, confía en ella',
      'La energía del universo conspira a tu favor hoy',
      'Cada momento es una nueva oportunidad para brillar',
      'Tu poder interior es más fuerte de lo que imaginas',
      'Las estrellas te guían hacia tu mejor versión',
      'Hoy es el día perfecto para manifestar tus sueños',
      'La magia sucede cuando crees en ti mismo',
      'Tu energía positiva transforma todo a tu alrededor',
      'El cosmos tiene planes maravillosos para ti',
      'Confía en el proceso, todo llega en el momento perfecto'
    ];
    
    const todayIndex = new Date().getDate() % fallbackMessages.length;
    const fallbackMessage = fallbackMessages[todayIndex];
    
    res.json({
      success: true,
      inspiration: fallbackMessage,
      date: new Date().toISOString().split('T')[0],
      fallback: true
    });
  }
};

// Obtener historial de frases (para admin)
export const getInspirationHistory = async (req, res) => {
  try {
    const history = await prisma.dailyInspiration.findMany({
      orderBy: { date: 'desc' },
      take: 30 // Últimos 30 días
    });

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error obteniendo historial de inspiraciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo historial'
    });
  }
};