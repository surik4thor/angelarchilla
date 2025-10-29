import path from 'path';
import dreamsRoutes from './routes/dreams.js';
import astrologyRoutes from './routes/astrology.js';
import personalizedHoroscopeRoutes from './routes/personalizedHoroscope.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
// Importación única y correcta de ipKeyGenerator
// Importación única y correcta de ipKeyGenerator

if (process.env.NODE_ENV !== 'production') {
  // Solo cargar dotenv en desarrollo
  import('dotenv').then(dotenv => dotenv.config());
}

import logger from './utils/logger.js';
import prisma from './config/database.js';
import authRoutes from './routes/auth.js';
import subscriptionRoutes from './routes/subscriptions.js';
import adminRoutes from './routes/admin.js';
// import adminBlogRoutes from './routes/adminBlog.js';
import statsRoutes from './routes/stats.js'
import horoscopeRoutes from './routes/horoscope.js'
import horoscopoRoutes from './routes/horoscopo.js'
import membershipRoutes from './routes/membership.js';
import newsletterRoutes from './routes/newsletter.js';
import reportRoutes from './routes/report.js';
import objetivosRoutes from './routes/objetivos.js';
import decksRoutes from './routes/decks.js';
import webhooksRoutes from './routes/webhooks.js';
import planesRoutes from './routes/planes.js';

// dotenv.config(); // Solo necesario en desarrollo, ya gestionado por Docker en producción


const app = express();
app.set('trust proxy', 1); // Confía en el primer proxy

const PORT = process.env.PORT || 5050;

// Seguridad: CSP, CORS, rate limiting, parsing

app.use(
  helmet.crossOriginEmbedderPolicy({ policy: 'credentialless' })
);
// CSP personalizada para permitir Google Analytics y otros servicios externos
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "connect-src 'self' https://region1.google-analytics.com https://www.google-analytics.com https://www.googletagmanager.com https://analytics.google.com https://www.google.com https://ssl.google-analytics.com;"
  );
  next();
});
import { ipKeyGenerator } from 'express-rate-limit';
app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MINUTES || (process.env.NODE_ENV === 'production' ? 10 : 60)) * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS || (process.env.NODE_ENV === 'production' ? 100 : 1000)),
    keyGenerator: ipKeyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
  })
);
// CORS gestionado solo por Nginx. No usar cors() en Express.



// Confirmado: no hay handler OPTIONS global ni rutas con '*'.


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Registrar rutas después de los body parsers
import tarotReadingsRoutes from './routes/tarotReadings.js';
app.use('/api/dreams', dreamsRoutes);
app.use('/api/astrology', astrologyRoutes);
app.use('/api/personalized-horoscope', personalizedHoroscopeRoutes);
app.use('/api/tarotReadings', tarotReadingsRoutes);

// Rutas API

app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/horoscope', horoscopeRoutes);
app.use('/api/horoscopo', horoscopoRoutes);
app.use('/api/membership', membershipRoutes);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/newsletter', newsletterRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/objetivos', objetivosRoutes);
app.use('/api/decks', decksRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/planes', planesRoutes);
// Endpoint público para planes (CSP)
app.use('/api/planes', planesRoutes);
// Endpoint público para suscripciones (CSP)
app.use('/api/subscriptions', subscriptionRoutes);

app.use('/images', express.static('/var/www/NebulosaMagica/content/images'));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', database: 'Connected' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', database: 'Disconnected' });
  }
});

// Error handler

// Middleware CSP para errores (404, 500, etc.)
app.use((err, req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "connect-src 'self' https://region1.google-analytics.com https://www.google-analytics.com https://www.googletagmanager.com https://analytics.google.com https://www.google.com https://ssl.google-analytics.com;"
  );
  logger.error('Error en request', { err, url: req.originalUrl, user: req.user?.id });
  res.status(err.statusCode || 500).json({ error: 'Error interno del servidor' });
});


// Middleware para 404 con CSP amigable (debe ir tras todos los routers)
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "connect-src 'self' https://region1.google-analytics.com https://www.google-analytics.com https://www.googletagmanager.com https://analytics.google.com https://www.google.com https://ssl.google-analytics.com;"
  );
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  logger.info(`🚀 Nebulosa Mágica API listening on port ${PORT}`);
  console.log(`🚀 Backend Express escuchando en el puerto ${PORT}`);
});

// Ruta raíz: devuelve mensaje simple o documentación de API
app.get('/', (req, res) => {
  res.json({ status: 'OK', msg: 'Backend Nebulosa Mágica en funcionamiento' });
});