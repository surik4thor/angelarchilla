// Servicio de cálculo astrológico para Nebulosa Mágica
import * as A from 'astronomia';

// Constantes astrológicas
const ZODIAC_SIGNS = [
  'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
  'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
];

const PLANETS = [
  'Sol', 'Luna', 'Mercurio', 'Venus', 'Marte', 
  'Júpiter', 'Saturno', 'Urano', 'Neptuno', 'Plutón'
];

const HOUSES = [
  'I - Personalidad', 'II - Posesiones', 'III - Comunicación', 
  'IV - Hogar', 'V - Creatividad', 'VI - Salud',
  'VII - Relaciones', 'VIII - Transformación', 'IX - Filosofía',
  'X - Carrera', 'XI - Amistad', 'XII - Subconsciente'
];

/**
 * Calcula el signo zodiacal basado en la fecha de nacimiento
 */
export function calculateZodiacSign(birthDate) {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Tauro';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Géminis';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cáncer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Escorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagitario';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricornio';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Acuario';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Piscis';
  
  return 'Desconocido';
}

/**
 * Convierte grados a signo zodiacal y grados dentro del signo
 */
function degreesToZodiacPosition(degrees) {
  // Normalizar a 0-360
  const normalizedDegrees = ((degrees % 360) + 360) % 360;
  
  // Cada signo ocupa 30 grados
  const signIndex = Math.floor(normalizedDegrees / 30);
  const degreesInSign = normalizedDegrees % 30;
  
  return {
    sign: ZODIAC_SIGNS[signIndex],
    degrees: Math.round(degreesInSign * 100) / 100
  };
}

/**
 * Calcula posiciones planetarias aproximadas para una fecha
 */
export function calculatePlanetaryPositions(birthDate, birthTime = '12:00', birthLocation = { lat: 40.4168, lon: -3.7038 }) {
  try {
    const date = new Date(`${birthDate}T${birthTime}`);
    const jd = A.julian.CalendarGregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate());
    
    // Posiciones aproximadas (simplificadas)
    const positions = {};
    
    // Sol - cálculo simplificado
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 1)) / 86400000) + 1;
    const sunLon = (dayOfYear / 365.25) * 360; // Aproximación simple
    positions.Sol = degreesToZodiacPosition(sunLon);
    
    // Para otros planetas, usaremos cálculos aproximados
    // En una implementación real, usarías efemérides más precisas
    
    // Luna (aproximación simple)
    const moonLon = ((dayOfYear + 15) / 29.5 * 360) % 360; // Aproximación del ciclo lunar
    positions.Luna = degreesToZodiacPosition(moonLon);
    
    // Planetas (posiciones aproximadas basadas en órbitas medias)
    const daysSinceEpoch = jd - 2451545.0; // J2000.0
    
    positions.Mercurio = degreesToZodiacPosition((87.969 * daysSinceEpoch / 365.25) % 360 + sunLon * 180 / Math.PI);
    positions.Venus = degreesToZodiacPosition((224.701 * daysSinceEpoch / 365.25) % 360 + sunLon * 180 / Math.PI);
    positions.Marte = degreesToZodiacPosition((686.98 * daysSinceEpoch / 365.25) % 360 + sunLon * 180 / Math.PI);
    positions.Júpiter = degreesToZodiacPosition((4332.59 * daysSinceEpoch / 365.25) % 360 + sunLon * 180 / Math.PI);
    positions.Saturno = degreesToZodiacPosition((10759.22 * daysSinceEpoch / 365.25) % 360 + sunLon * 180 / Math.PI);
    
    // Planetas exteriores (movimiento muy lento, posición aproximada)
    positions.Urano = degreesToZodiacPosition((30688.5 * daysSinceEpoch / 365.25) % 360);
    positions.Neptuno = degreesToZodiacPosition((60182 * daysSinceEpoch / 365.25) % 360);
    positions.Plutón = degreesToZodiacPosition((90560 * daysSinceEpoch / 365.25) % 360);
    
    return positions;
  } catch (error) {
    console.error('Error calculando posiciones planetarias:', error);
    return generateFallbackPositions(birthDate);
  }
}

/**
 * Genera posiciones de respaldo basadas en la fecha de nacimiento
 */
function generateFallbackPositions(birthDate) {
  const zodiacSign = calculateZodiacSign(birthDate);
  const signIndex = ZODIAC_SIGNS.indexOf(zodiacSign);
  const baseDate = new Date(birthDate);
  const dayOfYear = Math.floor((baseDate - new Date(baseDate.getFullYear(), 0, 0)) / 86400000);
  
  const positions = {};
  
  // Sol en el signo correcto
  positions.Sol = { sign: zodiacSign, degrees: (dayOfYear % 30) };
  
  // Distribución aproximada de otros planetas
  PLANETS.forEach((planet, index) => {
    if (planet === 'Sol') return;
    
    const offset = (index * 45 + dayOfYear * 0.5) % 360;
    const planetSignIndex = Math.floor(offset / 30) % 12;
    const planetDegrees = offset % 30;
    
    positions[planet] = {
      sign: ZODIAC_SIGNS[planetSignIndex],
      degrees: Math.round(planetDegrees * 100) / 100
    };
  });
  
  return positions;
}

/**
 * Calcula las casas astrológicas (simplificado)
 */
export function calculateHouses(birthDate, birthTime = '12:00', birthLocation = { lat: 40.4168, lon: -3.7038 }) {
  // Sistema de casas simplificado (Placidus aproximado)
  const date = new Date(`${birthDate}T${birthTime}`);
  const hour = date.getHours() + date.getMinutes() / 60;
  
  // Ascendente aproximado basado en hora y ubicación
  const ascendantDegree = ((hour - 6) * 15 + birthLocation.lon) % 360;
  const ascendantSign = degreesToZodiacPosition(ascendantDegree);
  
  const houses = {};
  
  // Calcular todas las casas (cada casa 30 grados después de la anterior)
  for (let i = 0; i < 12; i++) {
    const houseDegree = (ascendantDegree + i * 30) % 360;
    const houseSign = degreesToZodiacPosition(houseDegree);
    
    houses[HOUSES[i]] = {
      sign: houseSign.sign,
      degrees: houseSign.degrees,
      number: i + 1
    };
  }
  
  return {
    ascendant: ascendantSign,
    houses: houses
  };
}

/**
 * Calcula aspectos astrológicos entre planetas
 */
export function calculateAspects(planetaryPositions) {
  const aspects = [];
  const planetNames = Object.keys(planetaryPositions);
  
  // Definir aspectos principales con sus grados
  const aspectTypes = {
    'Conjunción': { degrees: 0, orb: 8 },
    'Oposición': { degrees: 180, orb: 8 },
    'Trígono': { degrees: 120, orb: 6 },
    'Cuadratura': { degrees: 90, orb: 6 },
    'Sextil': { degrees: 60, orb: 4 }
  };
  
  // Comparar cada planeta con los demás
  for (let i = 0; i < planetNames.length - 1; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      const planet1 = planetNames[i];
      const planet2 = planetNames[j];
      
      // Convertir posiciones a grados absolutos
      const pos1 = zodiacPositionToDegrees(planetaryPositions[planet1]);
      const pos2 = zodiacPositionToDegrees(planetaryPositions[planet2]);
      
      // Calcular diferencia angular
      let difference = Math.abs(pos1 - pos2);
      if (difference > 180) difference = 360 - difference;
      
      // Verificar si forma algún aspecto
      Object.entries(aspectTypes).forEach(([aspectName, aspectData]) => {
        if (Math.abs(difference - aspectData.degrees) <= aspectData.orb) {
          aspects.push({
            planet1,
            planet2,
            aspect: aspectName,
            degrees: Math.round(difference * 100) / 100,
            orb: Math.round(Math.abs(difference - aspectData.degrees) * 100) / 100
          });
        }
      });
    }
  }
  
  return aspects;
}

/**
 * Convierte posición zodiacal a grados absolutos (0-360)
 */
function zodiacPositionToDegrees(position) {
  const signIndex = ZODIAC_SIGNS.indexOf(position.sign);
  return signIndex * 30 + position.degrees;
}

/**
 * Genera una carta natal completa
 */
export async function generateNatalChart(birthData) {
  const { birthDate, birthTime = '12:00', birthLocation = { lat: 40.4168, lon: -3.7038, city: 'Madrid' } } = birthData;
  
  try {
    const zodiacSign = calculateZodiacSign(birthDate);
    const planetaryPositions = calculatePlanetaryPositions(birthDate, birthTime, birthLocation);
    const housesData = calculateHouses(birthDate, birthTime, birthLocation);
    const aspects = calculateAspects(planetaryPositions);
    
    return {
      birthInfo: {
        date: birthDate,
        time: birthTime,
        location: birthLocation,
        zodiacSign
      },
      planets: planetaryPositions,
      houses: housesData,
      aspects,
      interpretation: generateBasicInterpretation(zodiacSign, planetaryPositions, housesData, aspects)
    };
  } catch (error) {
    console.error('Error generando carta natal:', error);
    throw new Error('No se pudo calcular la carta natal');
  }
}

/**
 * Genera interpretación básica de la carta natal
 */
function generateBasicInterpretation(zodiacSign, planets, houses, aspects) {
  let interpretation = `**Carta Natal - ${zodiacSign}**\n\n`;
  
  interpretation += `**Sol en ${planets.Sol.sign}**: Tu esencia y identidad fundamental se expresa a través de las cualidades de ${planets.Sol.sign}.\n\n`;
  
  interpretation += `**Luna en ${planets.Luna.sign}**: Tus emociones y mundo interior están influenciados por la energía de ${planets.Luna.sign}.\n\n`;
  
  interpretation += `**Ascendente en ${houses.ascendant.sign}**: Tu forma de presentarte al mundo y primera impresión están marcadas por ${houses.ascendant.sign}.\n\n`;
  
  if (aspects.length > 0) {
    interpretation += `**Aspectos Principales:**\n`;
    aspects.slice(0, 3).forEach(aspect => {
      interpretation += `- ${aspect.planet1} en ${aspect.aspect} con ${aspect.planet2}: ${getAspectInterpretation(aspect)}\n`;
    });
  }
  
  return interpretation;
}

/**
 * Interpretación básica de aspectos
 */
function getAspectInterpretation(aspect) {
  const interpretations = {
    'Conjunción': 'Energías unificadas que se potencian mutuamente',
    'Oposición': 'Tensión creativa que requiere equilibrio',
    'Trígono': 'Flujo armonioso de energías',
    'Cuadratura': 'Desafío que impulsa el crecimiento',
    'Sextil': 'Oportunidades de desarrollo positivo'
  };
  
  return interpretations[aspect.aspect] || 'Influencia significativa en tu personalidad';
}

/**
 * Calcula tránsitos actuales para horóscopos personalizados
 */
export function calculateCurrentTransits(natalPlanetPositions, currentDate = new Date()) {
  const currentDateStr = currentDate.toISOString().split('T')[0];
  const currentPositions = calculatePlanetaryPositions(currentDateStr);
  
  const significantTransits = [];
  
  // Definir aspectos a verificar
  const aspectTypes = {
    'Conjunción': { degrees: 0, orb: 5, symbol: '☌' },
    'Sextil': { degrees: 60, orb: 4, symbol: '⚹' },
    'Cuadratura': { degrees: 90, orb: 5, symbol: '◐' },
    'Trígono': { degrees: 120, orb: 5, symbol: '△' },
    'Oposición': { degrees: 180, orb: 5, symbol: '☍' }
  };
  
  // Planetas de tránsito más relevantes
  const transitPlanets = ['Sol', 'Luna', 'Mercurio', 'Venus', 'Marte', 'Jupiter', 'Saturno'];
  const natalPlanets = ['Sol', 'Luna', 'Mercurio', 'Venus', 'Marte', 'Jupiter', 'Saturno'];
  
  // Comparar cada planeta transitando con cada planeta natal
  transitPlanets.forEach(transitPlanet => {
    if (!currentPositions[transitPlanet]) return;
    
    natalPlanets.forEach(natalPlanet => {
      if (!natalPlanetPositions[natalPlanet]) return;
      
      const currentPos = currentPositions[transitPlanet];
      const natalPos = natalPlanetPositions[natalPlanet];
      
      // Convertir a grados absolutos
      const currentDegrees = zodiacPositionToDegrees(currentPos);
      const natalDegrees = zodiacPositionToDegrees(natalPos);
      
      // Calcular diferencia angular
      let difference = Math.abs(currentDegrees - natalDegrees);
      if (difference > 180) difference = 360 - difference;
      
      // Verificar aspectos
      Object.entries(aspectTypes).forEach(([aspectName, aspectData]) => {
        const orb = Math.abs(difference - aspectData.degrees);
        
        if (orb <= aspectData.orb) {
          const description = getTransitDescription(transitPlanet, natalPlanet, aspectName);
          
          significantTransits.push({
            aspect: `${transitPlanet} ${aspectData.symbol} ${natalPlanet} natal`,
            description: description,
            exactness: orb,
            influence: getTransitInfluence(transitPlanet, natalPlanet, aspectName),
            planetTransiting: transitPlanet,
            planetNatal: natalPlanet,
            aspectName: aspectName
          });
        }
      });
    });
  });
  
  // Filtrar y ordenar por importancia
  return significantTransits
    .sort((a, b) => {
      // Primero por influencia
      const influences = { 'major': 3, 'moderate': 2, 'minor': 1 };
      if (influences[b.influence] !== influences[a.influence]) {
        return influences[b.influence] - influences[a.influence];
      }
      // Luego por exactitud (menor orbe = más exacto)
      return a.exactness - b.exactness;
    })
    .slice(0, 5); // Solo los 5 más significativos
}

/**
 * Obtener descripción del tránsito
 */
function getTransitDescription(transitingPlanet, natalPlanet, aspectName) {
  const descriptions = {
    'Sol': {
      'Conjunción': 'ilumina y renueva tu energía vital',
      'Sextil': 'aporta oportunidades creativas',
      'Cuadratura': 'desafía tu expresión personal',
      'Trígono': 'favorece tu brillar natural',
      'Oposición': 'confronta aspectos inconscientes'
    },
    'Luna': {
      'Conjunción': 'intensifica las emociones y la intuición',
      'Sextil': 'armoniza el mundo emocional',
      'Cuadratura': 'genera tensiones emocionales',
      'Trígono': 'facilita la expresión emocional',
      'Oposición': 'polariza sentimientos'
    },
    'Mercurio': {
      'Conjunción': 'activa la comunicación y el pensamiento',
      'Sextil': 'facilita el intercambio de ideas',
      'Cuadratura': 'genera malentendidos o tensión mental',
      'Trígono': 'armoniza la expresión intelectual',
      'Oposición': 'confronta diferentes perspectivas'
    },
    'Venus': {
      'Conjunción': 'embellece y armoniza las relaciones',
      'Sextil': 'favorece el amor y la creatividad',
      'Cuadratura': 'trae tensiones afectivas',
      'Trígono': 'facilita el placer y la armonía',
      'Oposición': 'polariza relaciones y valores'
    },
    'Marte': {
      'Conjunción': 'enciende la acción y la energía',
      'Sextil': 'motiva hacia logros constructivos',
      'Cuadratura': 'genera conflictos y frustración',
      'Trígono': 'canaliza la fuerza productivamente',
      'Oposición': 'confronta con la agresividad'
    },
    'Jupiter': {
      'Conjunción': 'expande oportunidades y sabiduría',
      'Sextil': 'favorece el crecimiento gradual',
      'Cuadratura': 'genera excesos o sobreconfianza',
      'Trígono': 'trae abundancia natural',
      'Oposición': 'busca equilibrio en las creencias'
    },
    'Saturno': {
      'Conjunción': 'estructura y disciplina la expresión',
      'Sextil': 'favorece logros duraderos',
      'Cuadratura': 'impone limitaciones instructivas',
      'Trígono': 'consolida la autoridad natural',
      'Oposición': 'confronta con responsabilidades'
    }
  };

  const transitDesc = descriptions[transitingPlanet]?.[aspectName] || 'crea una influencia significativa';
  return `${transitingPlanet} ${transitDesc} en tu ${natalPlanet} natal`;
}

/**
 * Determinar nivel de influencia del tránsito
 */
function getTransitInfluence(transitingPlanet, natalPlanet, aspectName) {
  // Planetas lentos tienen más influencia duradera
  const slowPlanets = ['Jupiter', 'Saturno'];
  // Planetas personales son más intensos pero breves
  const personalPlanets = ['Sol', 'Luna', 'Mercurio', 'Venus', 'Marte'];
  // Aspectos duros vs suaves
  const hardAspects = ['Conjunción', 'Cuadratura', 'Oposición'];
  
  if (slowPlanets.includes(transitingPlanet) && personalPlanets.includes(natalPlanet)) {
    return hardAspects.includes(aspectName) ? 'major' : 'moderate';
  }
  
  if (hardAspects.includes(aspectName)) {
    return 'moderate';
  }
  
  return 'minor';
}

export default {
  calculateZodiacSign,
  calculatePlanetaryPositions,
  calculateHouses,
  calculateAspects,
  generateNatalChart,
  calculateCurrentTransits
};