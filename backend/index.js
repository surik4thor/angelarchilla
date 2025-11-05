import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './src/routes/auth.js';
import readingRoutes from './src/routes/readingRoutes.js';
import adminRoutes from './src/routes/admin.js';
import reportRoutes from './src/routes/report.js';
import bizumRoutes from './src/routes/bizum.js';
import runesReadingsRoutes from './src/routes/runesReadings.js';
import newsletterRoutes from './src/routes/newsletter.js';
import tarotReadingsRoutes from './src/routes/tarotReadings.js';
import dreamsRoutes from './src/routes/dreams.js';
import path from 'path';
import cron from 'node-cron';
import horoscopoRoutes from './src/routes/horoscopo.js';
import horoscopePersonalizedRoutes from './src/routes/horoscopePersonalized.js';
import membershipRoutes from './src/routes/membership.js';
import weeklyBonusRoutes from './src/routes/weeklyBonus.js';
import subscriptionRoutes from './src/routes/subscriptions.js';

const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://nebulosamagica.com',
    'http://nebulosamagica.com'
  ],
  credentials: true
}));
app.use(express.json());
// Servir archivos subidos (images, avatars, cards)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(process.cwd(), '../frontend/dist')));
}
// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/bizum', bizumRoutes);
app.use('/api/horoscope', horoscopePersonalizedRoutes);
app.use('/api/runesReadings', runesReadingsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/horoscopo', horoscopoRoutes);
app.use('/api/dreams', dreamsRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/weekly-bonus', weeklyBonusRoutes);
app.use('/api/tarot-readings', tarotReadingsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Ruta raíz - evita errores 404 en peticiones del navegador
app.get('/', (req, res) => {
  res.json({
    message: 'Nebulosa Mágica API',
    status: 'OK',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      tarot: '/api/tarot-readings',
      weeklyBonus: '/api/weekly-bonus',
      membership: '/api/membership'
    }
  });
});

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Arcana Club Backend funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Crear usuario (legacy - mantener por compatibilidad)
app.post('/api/users', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.create({ data: { email, password } });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
// Crear tirada de tarot (legacy - mantener por compatibilidad)
app.post('/api/tarot', async (req, res) => {
  const { userId, spread, question, result } = req.body;
  try {
    const tarotReading = await prisma.tarotReading.create({
      data: { userId, spread, question, result }
    });
    res.json(tarotReading);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
// Obtener tiradas por usuario (legacy - mantener por compatibilidad)
app.get('/api/users/:id/tarot', async (req, res) => {
  const { id } = req.params;
  try {
    const readings = await prisma.tarotReading.findMany({
      where: { userId: Number(id) },
      orderBy: { createdAt: 'desc' }
    });
    res.json(readings);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// NOTE: el manejador 404 se moverá al final del archivo para no interceptar rutas añadidas dinámicamente

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor Nebulosa Mágica corriendo en http://localhost:${PORT}`);
  console.log(`📊 Panel Admin disponible en http://localhost:5173/admin`);
  console.log(`🔮 API Health Check: http://localhost:${PORT}/api/health`);
  // Activar cron jobs automáticos de IA (informes mensuales y alertas inteligentes)
  try {
    import('./src/aiAssistant/cronJobs.js');
    console.log('✅ Cron jobs IA (informes y alertas) activados.');
  } catch (err) {
    console.error('❌ Error al activar cron jobs IA:', err);
  }

  // Log de rutas registradas (para debug en producción)
  try {
    const routes = [];
    if (app._router && app._router.stack) {
      app._router.stack.forEach((middleware) => {
        if (middleware.route) {
          routes.push({ path: middleware.route.path, methods: Object.keys(middleware.route.methods) });
        } else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) {
          middleware.handle.stack.forEach((handler) => {
            if (handler.route) routes.push({ path: handler.route.path, methods: Object.keys(handler.route.methods) });
          });
        }
      });
    }
    console.log('Registered routes:', JSON.stringify(routes));
  } catch (e) {
    console.warn('Could not dump routes:', e?.message || e);
  }
});

// DEBUG: listar rutas registradas (temporal)
app.get('/debug/routes', (req, res) => {
  try {
    const routes = [];
    if (app._router && app._router.stack) {
      app._router.stack.forEach((middleware) => {
        if (middleware.route) {
          // rutas registradas directamente
          routes.push({ path: middleware.route.path, methods: Object.keys(middleware.route.methods) });
        } else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) {
          middleware.handle.stack.forEach((handler) => {
            if (handler.route) routes.push({ path: handler.route.path, methods: Object.keys(handler.route.methods) });
          });
        }
      });
    }
    res.json({ routes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Manejo de rutas SPA del frontend (debe ir DESPUÉS de todas las rutas API)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ 
        error: 'Ruta API no encontrada',
        path: req.originalUrl
      });
    }
    res.sendFile(path.join(process.cwd(), '../frontend/dist/index.html'));
  });
} else {
  // Manejo de rutas no encontradas en desarrollo
  app.use((req, res) => {
    res.status(404).json({ 
      error: 'Ruta no encontrada',
      path: req.originalUrl
    });
  });
}