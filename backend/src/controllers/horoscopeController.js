import prisma from '../config/database.js';
// import { generatePersonalizedHoroscopeAI } from '../services/aiService.js';

export const getPersonalizedHoroscope = async (req, res) => {
  try {
    const userId = req.user.id;
    // Si el usuario está en trial o es Maestro, devolver horóscopo premium
    if (req.user.isTrialMaestro || (req.user.subscriptionPlan || '').toUpperCase() === 'MAESTRO') {
      // Aquí puedes personalizar aún más el horóscopo premium si lo deseas
      const horoscope = {
        mainMessage: 'Hoy tu energía se ve influida por tus sueños y lecturas recientes. Confía en tu intuición y abre tu mente a nuevas señales.',
        love: 'El tarot muestra apertura emocional, aprovecha para expresar tus sentimientos.',
        work: 'Las runas sugieren cambios positivos en tu entorno laboral.',
        health: 'Escucha las señales de tu cuerpo, el descanso es clave.',
        spirituality: 'Tus sueños recientes traen mensajes de crecimiento interior.',
        mysticalAdvice: 'Medita sobre los símbolos que se repiten en tus sueños y lecturas.',
        personalizedMessage: 'Tu horóscopo se ha personalizado con tu historial esotérico y acceso premium.',
        affirmation: 'Confío en la sabiduría de mi subconsciente.'
      };
      return res.json({ success: true, horoscope });
    }
    // Obtener datos básicos del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        birthDate: true,
        zodiacSign: true,
        gender: true,
      }
    });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Obtener historial reciente de lecturas e interpretaciones
    const [tarot, runes, dreams] = await Promise.all([
      prisma.tarotReading.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.runesReading.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.dreamInterpretation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Unificar historial para IA
    const readingHistory = [
      ...tarot.map(r => ({ type: 'tarot', ...r })),
      ...runes.map(r => ({ type: 'runes', ...r })),
      ...dreams.map(r => ({ type: 'dream', ...r }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Llamar a la IA (placeholder)
    // const horoscope = await generatePersonalizedHoroscopeAI({
    //   birthDate: user.birthDate,
    //   zodiacSign: user.zodiacSign,
    //   gender: user.gender,
    //   readingHistory
    // });
    const horoscope = {
      mainMessage: 'Hoy tu energía se ve influida por tus sueños y lecturas recientes. Confía en tu intuición y abre tu mente a nuevas señales.',
      love: 'El tarot muestra apertura emocional, aprovecha para expresar tus sentimientos.',
      work: 'Las runas sugieren cambios positivos en tu entorno laboral.',
      health: 'Escucha las señales de tu cuerpo, el descanso es clave.',
      spirituality: 'Tus sueños recientes traen mensajes de crecimiento interior.',
      mysticalAdvice: 'Medita sobre los símbolos que se repiten en tus sueños y lecturas.',
      personalizedMessage: 'Tu horóscopo se ha personalizado con tu historial esotérico.',
      affirmation: 'Confío en la sabiduría de mi subconsciente.'
    };

    res.json({ success: true, horoscope });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
