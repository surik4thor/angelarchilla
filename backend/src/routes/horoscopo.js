import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';
import winston from 'winston';
import fs from 'fs';
if (!fs.existsSync('/app/tmp')) {
  fs.mkdirSync('/app/tmp', { recursive: true });
}
import { generarHoroscopoIA } from '../services/openai-horoscopo.js';
import { zodiacSymbols } from '../utils/zodiac-symbols.js';

const router = Router();

// Configuración de caché 24h
const horoscopoCache = new NodeCache({ stdTTL: 86400 });

// Rate limiter: 10 peticiones por hora por IP
import { ipKeyGenerator } from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Demasiadas consultas, intenta de nuevo en una hora',
  keyGenerator: ipKeyGenerator
});
router.use(limiter);

// Logger estructurado
const logDir = '/app/tmp';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: '/app/tmp/horoscopo.log' })
  ]
});

const signosValidos = [
  'aries','tauro','geminis','cancer','leo','virgo','libra','escorpio','sagitario','capricornio','acuario','piscis'
];

router.post('/:signo', async (req, res) => {
  const { signo } = req.params;
  const { fecha } = req.body;
  const ip = req.ip;
  const userAgent = req.headers['user-agent'];

  // Validar signo
  if (!signosValidos.includes(signo.toLowerCase())) {
    return res.status(400).json({ error: 'Signo zodiacal inválido' });
  }
  if (!fecha) {
    return res.status(400).json({ error: 'Fecha es obligatoria' });
  }

  // Cache key por signo y fecha
  const cacheKey = `${signo.toLowerCase()}_${fecha}`;
  const cached = horoscopoCache.get(cacheKey);
  if (cached) {
    logger.info({ timestamp: new Date(), signo, fecha, ip, userAgent, cache: true });
    return res.json(cached);
  }

  try {
    // Generar horóscopo vía OpenAI
    const horoscopo = await generarHoroscopoIA(signo, fecha);
    const simbolo = zodiacSymbols[signo.toLowerCase()] || '';
    const response = {
      signo: signo.toLowerCase(),
      simbolo,
      fecha,
      horoscopo
    };
    horoscopoCache.set(cacheKey, response);
    logger.info({ timestamp: new Date(), signo, fecha, ip, userAgent, cache: false });
    res.json(response);
  } catch (error) {
    logger.error({ timestamp: new Date(), signo, fecha, ip, userAgent, error: error.message });
    res.status(500).json({ error: 'Error generando horóscopo' });
  }
});

export default router;
