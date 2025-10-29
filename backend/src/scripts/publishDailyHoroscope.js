// Script para publicar el horóscopo diario en Twitter/X
// Para producción, ejecuta con:
// env $(cat backend/.env.twitter.test | xargs) node backend/src/scripts/publishDailyHoroscope.js
// Así se usan solo las variables necesarias de Twitter/X y se evita conflicto con otras del .env
import { publishHoroscopeTweet } from '../services/twitterService.js';
import { askPerplexity } from '../utils/perplexity.js';

// Utilidad para obtener mensaje destacado y CTA
function buildTweet(signo, mensaje) {
  const url = `https://nebulosamagica.com/horoscopo?signo=${signo}`;
  return `✨ #${signo.charAt(0).toUpperCase() + signo.slice(1)}: ${mensaje}\n\nDescubre tu horóscopo completo y personalizado en Nebulosa Mágica.\nRegístrate y accede a predicciones premium.\n👉 ${url} #Horoscopo #Astrologia #${signo.charAt(0).toUpperCase() + signo.slice(1)}`;
}

async function main() {
  // Selecciona un signo aleatorio y su mensaje destacado
  const signos = [
    'aries','tauro','geminis','cancer','leo','virgo','libra','escorpio','sagitario','capricornio','acuario','piscis'
  ];
  const signo = signos[Math.floor(Math.random() * signos.length)];
  // Mensajes base para rotar
  const mensajesBase = [
    `Hoy ${signo} tiene una energía especial. Aprovecha las oportunidades y mantén la mente abierta.`,
    `¡Atención #${signo}! Las estrellas te favorecen hoy para tomar decisiones importantes.`,
    `#${signo}, tu intuición será tu mejor guía hoy. Confía en ti y en el universo.`,
    `Para #${signo}, el día trae sorpresas positivas. Mantente receptivo y agradecido.`,
    `#${signo}, hoy es ideal para conectar con personas clave y avanzar en tus proyectos.`,
    `El horóscopo de #${signo} te invita a soñar en grande y dar el primer paso.`,
    `#${signo}, la suerte está de tu lado. Aprovecha cada momento y comparte tu luz.`,
    `Hoy #${signo} puede descubrir algo importante sobre sí mismo. Escucha tu corazón.`,
    `#${signo}, la armonía y el equilibrio serán tus aliados hoy.`,
    `Para #${signo}, el día es perfecto para iniciar algo nuevo y dejar atrás lo que no suma.`,
  ];

  // Genera un mensaje con Perplexity/OpenAI para mayor variedad
  let mensaje = mensajesBase[Math.floor(Math.random() * mensajesBase.length)];
  try {
    const prompt = `Genera un mensaje breve y positivo para el horóscopo diario de ${signo}, usando hashtags y tono motivador.`;
    const response = await askPerplexity({
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 60,
      model: 'sonar'
    });
    const aiMsg = response.choices?.[0]?.message?.content;
    if (aiMsg) mensaje = aiMsg;
  } catch {}

  const tweet = buildTweet(signo, mensaje);
  await publishHoroscopeTweet({ mensaje: tweet });
  console.log('Tweet publicado:', tweet);
}

main();
