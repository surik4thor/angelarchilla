import prisma from '../config/database.js';
import { generateNatalChart, calculateCurrentTransits } from '../services/astroService.js';

export const createOrUpdateNatalChart = async (req, res) => {
  try {
    const { birthDate, birthTime, birthLocation } = req.body;
    
    // Validaciones
    if (!birthDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'La fecha de nacimiento es requerida' 
      });
    }

    const parsedBirthDate = new Date(birthDate);
    if (isNaN(parsedBirthDate.getTime())) {
      return res.status(400).json({ 
        success: false, 
        error: 'Formato de fecha inválido' 
      });
    }

    // Validar que no sea una fecha futura
    if (parsedBirthDate > new Date()) {
      return res.status(400).json({ 
        success: false, 
        error: 'La fecha de nacimiento no puede ser futura' 
      });
    }

    // Preparar datos para el cálculo
    const chartData = {
      birthDate: parsedBirthDate.toISOString().split('T')[0],
      birthTime: birthTime || '12:00',
      birthLocation: birthLocation || { 
        lat: 40.4168, 
        lon: -3.7038, 
        city: 'Madrid', 
        country: 'España' 
      }
    };

    // Generar carta natal
    const natalChart = await generateNatalChart(chartData);
    
    // Buscar si ya existe una carta natal para el usuario
    const existingChart = await prisma.natalChart.findUnique({
      where: { userId: req.user.id }
    });

    let savedChart;
    
    if (existingChart) {
      // Actualizar carta natal existente
      savedChart = await prisma.natalChart.update({
        where: { userId: req.user.id },
        data: {
          birthDate: parsedBirthDate,
          birthTime: chartData.birthTime,
          birthLocation: chartData.birthLocation,
          zodiacSign: natalChart.birthInfo.zodiacSign,
          planetPositions: natalChart.planets,
          houses: natalChart.houses,
          aspects: natalChart.aspects,
          interpretation: natalChart.interpretation
        }
      });
    } else {
      // Crear nueva carta natal
      savedChart = await prisma.natalChart.create({
        data: {
          userId: req.user.id,
          birthDate: parsedBirthDate,
          birthTime: chartData.birthTime,
          birthLocation: chartData.birthLocation,
          zodiacSign: natalChart.birthInfo.zodiacSign,
          planetPositions: natalChart.planets,
          houses: natalChart.houses,
          aspects: natalChart.aspects,
          interpretation: natalChart.interpretation
        }
      });
    }

    res.json({ 
      success: true, 
      natalChart: {
        id: savedChart.id,
        birthDate: savedChart.birthDate,
        birthTime: savedChart.birthTime,
        birthLocation: savedChart.birthLocation,
        zodiacSign: savedChart.zodiacSign,
        planets: savedChart.planetPositions,
        houses: savedChart.houses,
        aspects: savedChart.aspects,
        interpretation: savedChart.interpretation
      }
    });
  } catch (err) {
    console.error('Error en createOrUpdateNatalChart:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Error calculando carta natal: ' + err.message 
    });
  }
};

export const getNatalChart = async (req, res) => {
  try {
    const natalChart = await prisma.natalChart.findUnique({
      where: { userId: req.user.id }
    });

    if (!natalChart) {
      return res.status(404).json({
        success: false,
        error: 'No se ha calculado una carta natal para este usuario'
      });
    }

    res.json({
      success: true,
      natalChart: {
        id: natalChart.id,
        birthDate: natalChart.birthDate,
        birthTime: natalChart.birthTime,
        birthLocation: natalChart.birthLocation,
        zodiacSign: natalChart.zodiacSign,
        planets: natalChart.planetPositions,
        houses: natalChart.houses,
        aspects: natalChart.aspects,
        interpretation: natalChart.interpretation,
        createdAt: natalChart.createdAt,
        updatedAt: natalChart.updatedAt
      }
    });
  } catch (err) {
    console.error('Error en getNatalChart:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Error obteniendo carta natal' 
    });
  }
};

export const generatePersonalizedHoroscope = async (req, res) => {
  try {
    // Obtener carta natal del usuario
    const natalChart = await prisma.natalChart.findUnique({
      where: { userId: req.user.id }
    });

    if (!natalChart) {
      return res.status(404).json({
        success: false,
        error: 'Necesitas tener una carta natal calculada para obtener horóscopos personalizados'
      });
    }

    // Calcular tránsitos actuales
    const transits = calculateCurrentTransits({
      planets: natalChart.planetPositions,
      houses: natalChart.houses
    });

    // Generar horóscopo personalizado con IA
    const personalizedHoroscope = await generatePersonalizedHoroscopeWithAI(
      natalChart.zodiacSign, 
      natalChart.planetPositions, 
      transits
    );

    res.json({
      success: true,
      horoscope: {
        date: new Date().toISOString().split('T')[0],
        zodiacSign: natalChart.zodiacSign,
        content: personalizedHoroscope,
        transits: transits.slice(0, 3), // Primeros 3 tránsitos más importantes
        personalizedLevel: 'premium'
      }
    });
  } catch (err) {
    console.error('Error en generatePersonalizedHoroscope:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Error generando horóscopo personalizado' 
    });
  }
};

// Helper function para generar horóscopo con IA
async function generatePersonalizedHoroscopeWithAI(zodiacSign, planets, transits) {
  // Importar el servicio de IA
  try {
    const { interpretReadingAI } = await import('../services/llmService.js');
    
    const prompt = `Genera un horóscopo personalizado para ${zodiacSign} considerando:
    
Planetas en signos:
- Sol en ${planets.Sol?.sign}
- Luna en ${planets.Luna?.sign}
- Mercurio en ${planets.Mercurio?.sign}
- Venus en ${planets.Venus?.sign}
- Marte en ${planets.Marte?.sign}

Tránsitos actuales importantes:
${transits.map(t => `- ${t.description}`).join('\n')}

Crea un horóscopo detallado, específico y personalizado para hoy ${new Date().toLocaleDateString('es-ES')}.`;

    const horoscope = await interpretReadingAI('horoscope', 'personalizado', prompt, []);
    return horoscope;
  } catch (error) {
    console.error('Error generando horóscopo con IA:', error);
    
    // Horóscopo de respaldo
    return `Horóscopo personalizado para ${zodiacSign}
    
Hoy es un día especial para ti como ${zodiacSign}. Con tu Sol en ${planets.Sol?.sign}, tu energía está especialmente enfocada en ${getSignKeywords(planets.Sol?.sign)}.

Tu Luna en ${planets.Luna?.sign} te invita a prestar atención a ${getMoonGuidance(planets.Luna?.sign)}.

Los tránsitos actuales sugieren que es un momento propicio para la introspección y el crecimiento personal.

Mantente abierto/a a las señales del universo y confía en tu intuición natural de ${zodiacSign}.`;
  }
}

function getSignKeywords(sign) {
  const keywords = {
    'Aries': 'la acción y el liderazgo',
    'Tauro': 'la estabilidad y la sensualidad',
    'Géminis': 'la comunicación y el aprendizaje',
    'Cáncer': 'las emociones y el hogar',
    'Leo': 'la creatividad y la autoexpresión',
    'Virgo': 'el perfeccionamiento y el servicio',
    'Libra': 'la armonía y las relaciones',
    'Escorpio': 'la transformación y los misterios',
    'Sagitario': 'la aventura y la filosofía',
    'Capricornio': 'la ambición y la estructura',
    'Acuario': 'la innovación y la humanidad',
    'Piscis': 'la espiritualidad y la compasión'
  };
  
  return keywords[sign] || 'el crecimiento personal';
}

function getMoonGuidance(sign) {
  const guidance = {
    'Aries': 'tu necesidad de independencia emocional',
    'Tauro': 'tu búsqueda de seguridad y comfort',
    'Géminis': 'tu curiosidad emocional y necesidad de variedad',
    'Cáncer': 'tu conexión con la familia y las raíces',
    'Leo': 'tu necesidad de reconocimiento y afecto',
    'Virgo': 'tu deseo de orden emocional y perfección',
    'Libra': 'tu búsqueda de equilibrio en las relaciones',
    'Escorpio': 'tus emociones intensas y transformadoras',
    'Sagitario': 'tu necesidad de libertad emocional',
    'Capricornio': 'tu estructura emocional y metas',
    'Acuario': 'tu individualidad emocional',
    'Piscis': 'tu sensibilidad y conexión espiritual'
  };
  
  return guidance[sign] || 'tus patrones emocionales';
}