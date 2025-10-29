import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import logger from './utils/logger.js';
import prisma from './config/database.js';

// Rutas esenciales
import authRoutes from './routes/auth.js';
import membershipRoutes from './routes/membership.js';
import horoscopeRoutes from './routes/horoscope.js';

const app = express();
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5050;

// Seguridad básica
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://nebulosamagica.com',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por IP
});
app.use('/api/', limiter);

// Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'nebulosa-backend',
    version: '2.0.0-minimal'
  });
});

// Rutas principales
app.use('/auth', authRoutes);
app.use('/membership', membershipRoutes);
app.use('/horoscope', horoscopeRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'Nebulosa Mágica API',
    version: '2.0.0-minimal',
    endpoints: ['/health', '/auth', '/membership', '/horoscope']
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  logger.error('Error no capturado:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`🚀 Nebulosa Mágica API (minimal) escuchando en puerto ${PORT}`);
  console.log(`🚀 Backend Express escuchando en el puerto ${PORT}`);
});

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});
