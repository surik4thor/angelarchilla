import express from 'express';
import os from 'os';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
import AdmZip from 'adm-zip';
import sharp from 'sharp';
import cron from 'node-cron';
import pkg from '@prisma/client';
const { PrismaClient, SubscriptionPlan } = pkg;
import { trialCoupons } from '../config/coupons.js';
import { invalidateDecksCache } from '../controllers/deckController.js';
import { mcp_stripe_agent_retrieve_balance, mcp_stripe_agent_list_subscriptions, mcp_stripe_agent_list_customers, mcp_stripe_agent_create_refund } from '../services/stripeAgent.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { notifyDiscord } from '../utils/discordNotify.js';
import { getStats, getAllUsers, updateUser } from '../controllers/adminController.js';

const router = express.Router();
const prisma = new PrismaClient();

// Tarea semanal: resumen de métricas de la última semana a Discord
// Tarea semanal: resumen de métricas de la última semana a Discord
cron.schedule('0 8 * * MON', async () => { // cada lunes a las 8:00
  try {
    const now = new Date();
    const lastMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
    const prevMonday = new Date(lastMonday);
    prevMonday.setDate(lastMonday.getDate() - 7);
    const prevPrevMonday = new Date(prevMonday);
    prevPrevMonday.setDate(prevMonday.getDate() - 7);
    // Semana actual
    const res = await prisma.$transaction([
      prisma.user.count({ where: { createdAt: { gte: prevMonday, lte: lastMonday } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: prevMonday, lte: lastMonday } } }),
      prisma.order.count({ where: { createdAt: { gte: prevMonday, lte: lastMonday } } }),
      prisma.income.aggregate({ _sum: { amount: true }, where: { date: { gte: prevMonday, lte: lastMonday } } }),
      prisma.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: prevMonday, lte: lastMonday } } }),
      prisma.openAICall.aggregate({ _sum: { cost: true }, where: { createdAt: { gte: prevMonday, lte: lastMonday } } }),
      prisma.openAICall.count({ where: { createdAt: { gte: prevMonday, lte: lastMonday } } }),
      prisma.tarotReading.count({ where: { createdAt: { gte: prevMonday, lte: lastMonday } } }),
      prisma.runesReading.count({ where: { createdAt: { gte: prevMonday, lte: lastMonday } } }),
      prisma.dreamInterpretation.count({ where: { createdAt: { gte: prevMonday, lte: lastMonday } } }),
    ]);
    // Semana anterior
    const prevRes = await prisma.$transaction([
      prisma.user.count({ where: { createdAt: { gte: prevPrevMonday, lte: prevMonday } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: prevPrevMonday, lte: prevMonday } } }),
      prisma.order.count({ where: { createdAt: { gte: prevPrevMonday, lte: prevMonday } } }),
      prisma.income.aggregate({ _sum: { amount: true }, where: { date: { gte: prevPrevMonday, lte: prevMonday } } }),
      prisma.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: prevPrevMonday, lte: prevMonday } } }),
      prisma.openAICall.aggregate({ _sum: { cost: true }, where: { createdAt: { gte: prevPrevMonday, lte: prevMonday } } }),
      prisma.openAICall.count({ where: { createdAt: { gte: prevPrevMonday, lte: prevMonday } } }),
      prisma.tarotReading.count({ where: { createdAt: { gte: prevPrevMonday, lte: prevMonday } } }),
      prisma.runesReading.count({ where: { createdAt: { gte: prevPrevMonday, lte: prevMonday } } }),
      prisma.dreamInterpretation.count({ where: { createdAt: { gte: prevPrevMonday, lte: prevMonday } } }),
    ]);
    const [newUsers, weekSales, weekOrders, weekIncome, weekExpenses, weekOpenaiCost, weekOpenaiCalls, tarotCount, runesCount, dreamCount] = res;
    const [prevUsers, prevSales, prevOrders, prevIncome, prevExpenses, prevOpenaiCost, prevOpenaiCalls, prevTarotCount, prevRunesCount, prevDreamCount] = prevRes;
    // Comparativas
    const cmp = (curr, prev) => {
      const diff = curr - prev;
      const pct = prev === 0 ? 0 : (diff / prev) * 100;
      return `${diff >= 0 ? '▲' : '▼'} ${Math.abs(diff)} (${pct.toFixed(1)}%)`;
    };
  await notifyDiscord('usuarios', `📅 Resumen semanal: Nuevos usuarios: ${newUsers} (${cmp(newUsers, prevUsers)} vs semana anterior)`);
  await notifyDiscord('ventas', `📅 Resumen semanal: Ventas: €${weekSales._sum.total?.toFixed(2) || 0} (${weekOrders} pedidos) (${cmp(weekSales._sum.total || 0, prevSales._sum.total || 0)} vs semana anterior)`);
  await notifyDiscord('ingresos', `📅 Resumen semanal: Ingresos: €${weekIncome._sum.amount?.toFixed(2) || 0} (${cmp(weekIncome._sum.amount || 0, prevIncome._sum.amount || 0)} vs semana anterior)`);
  await notifyDiscord('gastos', `📅 Resumen semanal: Gastos: €${weekExpenses._sum.amount?.toFixed(2) || 0} (${cmp(weekExpenses._sum.amount || 0, prevExpenses._sum.amount || 0)} vs semana anterior)`);
  await notifyDiscord('ia', `📅 Resumen semanal: OpenAI/ChatGPT: ${weekOpenaiCalls} llamadas, gasto: $${weekOpenaiCost._sum.cost?.toFixed(2) || 0} (${cmp(weekOpenaiCost._sum.cost || 0, prevOpenaiCost._sum.cost || 0)} vs semana anterior)`);
  const totalLecturas = tarotCount + runesCount + dreamCount;
  const prevTotalLecturas = prevTarotCount + prevRunesCount + prevDreamCount;
  await notifyDiscord('lecturas', `📅 Resumen semanal: Lecturas totales: ${totalLecturas} (${cmp(totalLecturas, prevTotalLecturas)} vs semana anterior)`);
  } catch (e) {
    await notifyDiscord('alertas', `🚨 Error en resumen semanal: ${e.message}`);
  }
});
// Tarea periódica: resumen de métricas a Discord
// Tarea periódica: resumen de métricas a Discord
cron.schedule('0 * * * *', async () => { // cada hora
  try {
    const res = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { newsletter: true } }),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.count(),
      prisma.income.aggregate({ _sum: { amount: true } }),
      prisma.expense.aggregate({ _sum: { amount: true } }),
      prisma.openAICall.aggregate({ _sum: { cost: true } }),
      prisma.openAICall.count(),
    ]);
    const [totalUsers, totalSubscribers, totalSales, totalOrders, totalIncome, totalExpenses, openaiCost, openaiCalls] = res;
    await notifyDiscord('usuarios', `👥 Usuarios totales: ${totalUsers}, suscriptores: ${totalSubscribers}`);
    await notifyDiscord('ventas', `💸 Ventas totales: €${totalSales._sum.total?.toFixed(2) || 0} (${totalOrders} pedidos)`);
    await notifyDiscord('ingresos', `💰 Ingresos: €${totalIncome._sum.amount?.toFixed(2) || 0}`);
    await notifyDiscord('gastos', `💸 Gastos: €${totalExpenses._sum.amount?.toFixed(2) || 0}`);
    await notifyDiscord('ia', `🤖 OpenAI/ChatGPT: ${openaiCalls} llamadas, gasto: $${openaiCost._sum.cost?.toFixed(2) || 0}`);
  } catch (e) {
    await notifyDiscord('alertas', `🚨 Error en resumen periódico: ${e.message}`);
  }
});
// Endpoint: stats de sistema (CPU/RAM) con alerta Discord
router.get('/system-stats', async (req, res) => {
  try {
    const cpuLoad = os.loadavg()[0];
    const cpuPercent = Math.round((cpuLoad / os.cpus().length) * 100);
    const ramMB = Math.round(os.totalmem() - os.freemem()) / 1024 / 1024;
    if (cpuPercent > 85) await sendDiscordAlert(`🚨 CPU alta: ${cpuPercent}%`);
    if (ramMB > 6000) await sendDiscordAlert(`🚨 RAM alta: ${ramMB} MB`);
    res.json({ stats: { cpu: cpuPercent, ram: ramMB } });
  } catch (err) {
    res.json({ stats: { cpu: 0, ram: 0 } });
  }
});
// Endpoint: stats de uso de OpenAI/ChatGPT con alerta Discord
router.get('/openai-stats', async (req, res) => {
  try {
    const startMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endMonth = new Date();
    const calls = await prisma.openAICall.count({
      where: { createdAt: { gte: startMonth, lte: endMonth } }
    });
    const costAgg = await prisma.openAICall.aggregate({
      where: { createdAt: { gte: startMonth, lte: endMonth } },
      _sum: { cost: true }
    });
    if ((costAgg._sum.cost || 0) > 100) await sendDiscordAlert(`🚨 Gasto OpenAI elevado: $${costAgg._sum.cost?.toFixed(2)}`);
    res.json({ stats: { calls, cost: costAgg._sum.cost || 0 } });
  } catch (err) {
    res.json({ stats: { calls: 0, cost: 0 } });
  }
});
// Endpoint: log del servidor con alerta Discord
router.get('/server-log', async (req, res) => {
  try {
    const logPath = path.join(process.cwd(), 'backend', 'logs', 'server.log');
    let lines = [];
    if (fs.existsSync(logPath)) {
      const logContent = fs.readFileSync(logPath, 'utf8');
      lines = logContent.split(/\r?\n/).filter(Boolean).slice(-20);
      if (lines.some(l => l.toLowerCase().includes('error') || l.toLowerCase().includes('critical'))) {
        await sendDiscordAlert('🚨 Error crítico detectado en el log del servidor');
      }
    }
    res.json({ log: lines });
  } catch (err) {
    res.json({ log: ['Error leyendo log:', err.message] });
  }
});





// Endpoint: log del servidor (últimas líneas de logs)
router.get('/server-log', async (req, res) => {
  try {
    // Ruta del log (ajusta si usas otro archivo)
    const logPath = path.join(process.cwd(), 'backend', 'logs', 'server.log');
    let lines = [];
    if (fs.existsSync(logPath)) {
      const logContent = fs.readFileSync(logPath, 'utf8');
      lines = logContent.split(/\r?\n/).filter(Boolean).slice(-20);
      if (lines.some(l => l.toLowerCase().includes('error') || l.toLowerCase().includes('critical'))) {
        await sendDiscordAlert('🚨 Error crítico detectado en el log del servidor');
      }
    }
    res.json({ log: lines });
  } catch (err) {
    res.json({ log: ['Error leyendo log:', err.message] });
  }
});

// Endpoint: stats de sistema (CPU/RAM)
router.get('/system-stats', async (req, res) => {
  try {
    const cpuLoad = os.loadavg()[0]; // Promedio 1 min
    const cpuPercent = Math.round((cpuLoad / os.cpus().length) * 100);
    const ramMB = Math.round(os.totalmem() - os.freemem()) / 1024 / 1024;
    if (cpuPercent > 85) await sendDiscordAlert(`🚨 CPU alta: ${cpuPercent}%`);
    if (ramMB > 6000) await sendDiscordAlert(`🚨 RAM alta: ${ramMB} MB`);
    res.json({ stats: { cpu: cpuPercent, ram: ramMB } });
  } catch (err) {
    res.json({ stats: { cpu: 0, ram: 0 } });
  }
});

// Endpoint: stats de uso de OpenAI/ChatGPT
router.get('/openai-stats', async (req, res) => {
  try {
    // Contar llamadas y sumar coste
    const startMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endMonth = new Date();
    const calls = await prisma.openAICall.count({
      where: { createdAt: { gte: startMonth, lte: endMonth } }
    });
    const costAgg = await prisma.openAICall.aggregate({
      where: { createdAt: { gte: startMonth, lte: endMonth } },
      _sum: { cost: true }
    });
    if ((costAgg._sum.cost || 0) > 100) await sendDiscordAlert(`🚨 Gasto OpenAI elevado: $${costAgg._sum.cost?.toFixed(2)}`);
    res.json({ stats: { calls, cost: costAgg._sum.cost || 0 } });
  } catch (err) {
    res.json({ stats: { calls: 0, cost: 0 } });
  }
});


// Todas las rutas admin requieren autenticación + permisos admin
router.use(authenticate, requireAdmin);

// DELETE /api/admin/users/:id - Eliminar usuario (con logs detallados)
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('--- ELIMINAR USUARIO (ESM) ---');
    console.log('ID recibido:', id);
    console.log('Usuario autenticado:', req.admin?.id, req.admin?.email, req.admin?.role);

    if (!id || typeof id !== 'string') {
      console.log('ID inválido:', id);
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Verificar que el usuario existe
    const userToDelete = await prisma.user.findUnique({
      where: { id }
    });
// Endpoint centralizado de analíticas y métricas de negocio
router.get('/analytics', async (req, res) => {
  try {
    // Usuarios
    const totalUsers = await prisma.user.count();
    const newUsersMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lte: new Date()
        }
      }
    });
    // Registros y suscriptores
    const totalSubscribers = await prisma.user.count({ where: { newsletter: true } });
    const activeSubscriptions = await prisma.user.count({ where: { subscriptionStatus: 'ACTIVE' } });
    // Ecommerce: pedidos, ventas, ticket medio
    const totalOrders = await prisma.order.count();
    const totalSales = await prisma.order.aggregate({ _sum: { total: true } });
    const ticketMedio = totalOrders > 0 ? (totalSales._sum.total / totalOrders) : 0;
    // Productos más vendidos
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });
    const topProductsDetails = await Promise.all(topProducts.map(async p => {
      const prod = await prisma.product.findUnique({ where: { id: p.productId } });
      return { product: prod, quantity: p._sum.quantity };
    }));
    // Ventas por categoría
    const salesByCategoryRaw = await prisma.product.groupBy({
      by: ['category'],
      _sum: { inventory: true },
    });
    // Ventas por mes (histórico)
    const salesByMonth = await prisma.$queryRaw`SELECT to_char("createdAt", 'YYYY-MM') as month, SUM("total") as total, COUNT(*) as orders FROM "orders" GROUP BY month ORDER BY month ASC`;
    // Inventario actual
    const inventory = await prisma.product.findMany({ select: { id: true, name: true, inventory: true, inStock: true } });
    // Ingresos y gastos
    const totalIncome = await prisma.income.aggregate({ _sum: { amount: true } });
    const totalExpenses = await prisma.expense.aggregate({ _sum: { amount: true } });
    // Objetivos
    const objetivos = await prisma.objetivo.findMany();
    // Crecimiento: usuarios, ventas, ingresos últimos 6 meses
    const growthUsers = await prisma.$queryRaw`SELECT to_char("createdAt", 'YYYY-MM') as month, COUNT(*) as users FROM "users" GROUP BY month ORDER BY month ASC`;
    const growthSales = salesByMonth;
    const growthIncome = await prisma.$queryRaw`SELECT to_char("date", 'YYYY-MM') as month, SUM("amount") as total FROM "income" GROUP BY month ORDER BY month ASC`;
    // Lecturas y actividad
    const totalReadings = await prisma.reading.count();
    const readingsByMonth = await prisma.$queryRaw`SELECT to_char("createdAt", 'YYYY-MM') as month, COUNT(*) as readings FROM "readings" GROUP BY month ORDER BY month ASC`;
    // Suscriptores activos por plan
    const subsByPlan = await prisma.user.groupBy({ by: ['subscriptionPlan'], _count: { id: true } });
    // Retorno
    res.json({
      success: true,
      analytics: {
        usuarios: { total: totalUsers, nuevosEsteMes: newUsersMonth },
        suscriptores: { total: totalSubscribers, activos: activeSubscriptions, porPlan: subsByPlan },
        ecommerce: {
          pedidos: totalOrders,
          ventas: totalSales._sum.total,
          ticketMedio,
          productosTop: topProductsDetails,
          ventasPorCategoria: salesByCategoryRaw,
          ventasPorMes: salesByMonth,
          inventario
        },
        ingresos: totalIncome._sum.amount,
        gastos: totalExpenses._sum.amount,
        objetivos,
        crecimiento: {
          usuarios: growthUsers,
          ventas: growthSales,
          ingresos: growthIncome
        },
        lecturas: { total: totalReadings, porMes: readingsByMonth }
      }
    });
  } catch (error) {
    console.error('Error en analytics:', error);
    res.status(500).json({ success: false, message: 'Error obteniendo analíticas', details: error.message });
  }
});
    // ...existing code...

    if (!userToDelete) {
      console.log('Usuario no encontrado para id:', id);
      return res.status(404).json({ error: 'Usuario no encontrado', id });
    }

    // No permitir que se elimine a sí mismo
    if (id === req.admin.id) {
      console.log('Intento de auto-eliminación:', id);
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo', id });
    }

    // No permitir eliminar al super admin
    if (userToDelete.email === 'surik4thor@icloud.com') {
      console.log('Intento de eliminar super admin:', id);
      return res.status(400).json({ error: 'No se puede eliminar al administrador principal', id });
    }

    // Eliminar usuario (las lecturas se eliminarán en cascada)
    await prisma.user.delete({
      where: { id }
    });
    console.log('Usuario eliminado correctamente:', id);

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
      id
    });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// ...

// (Eliminado endpoint de prueba GET /delete-user/:id)

// Email logs para estadísticas
router.get('/email-logs', async (req, res) => {
  try {
    const logs = await prisma.emailLog.findMany({
      orderBy: { sentAt: 'desc' },
      take: 100,
    });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Error consultando logs de emails', details: err.message });
  }
});

// Dashboard Stats
router.get('/stats', requireAdmin, getStats);

// User Management
router.get('/users', requireAdmin, getAllUsers);

// Debug route - temporary to catch incorrect requests
router.all('/plan', (req, res) => {
  console.log('[ADMIN DEBUG] Petición incorrecta a /plan:', {
    method: req.method,
    headers: req.headers,
    body: req.body,
    params: req.params,
    query: req.query
  });
  res.status(405).json({
    error: 'Ruta incorrecta',
    message: 'Use PUT /users/:id/plan en su lugar',
    correctRoute: 'PUT /api/admin/users/:id/plan'
  });
});

// Informe detallado con datos reales
router.get('/generate-report', async (req, res) => {
  try {
    // Obtener datos reales de la base de datos
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const firstDayLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    
    // Estadísticas de usuarios
    const [
      totalUsers,
      usersThisMonth,
      usersLastMonth,
      usersByPlan,
      activeUsers,
      trialUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: firstDayThisMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: firstDayLastMonth, lt: firstDayThisMonth } } }),
      prisma.user.groupBy({
        by: ['subscriptionPlan'],
        _count: { id: true }
      }),
      prisma.user.count({ 
        where: { 
          OR: [
            { subscriptionStatus: 'ACTIVE' },
            { trialActive: true }
          ]
        }
      }),
      prisma.user.count({ where: { trialActive: true } })
    ]);

    // Estadísticas de lecturas
    const [
      totalReadings,
      readingsThisMonth,
      readingsLastMonth,
      readingsByType
    ] = await Promise.all([
      prisma.tarotReading.count(),
      prisma.tarotReading.count({ where: { createdAt: { gte: firstDayThisMonth } } }),
      prisma.tarotReading.count({ where: { createdAt: { gte: firstDayLastMonth, lt: firstDayThisMonth } } }),
      prisma.$queryRaw`
        SELECT 'tarot' as type, COUNT(*) as count FROM "TarotReading" WHERE "createdAt" >= ${firstDayThisMonth}
        UNION ALL
        SELECT 'runas' as type, COUNT(*) as count FROM "RunesReading" WHERE "createdAt" >= ${firstDayThisMonth}
        UNION ALL
        SELECT 'sueños' as type, COUNT(*) as count FROM "DreamInterpretation" WHERE "createdAt" >= ${firstDayThisMonth}
      `
    ]);

    // Calcular métricas de crecimiento
    const userGrowth = usersLastMonth > 0 ? ((usersThisMonth - usersLastMonth) / usersLastMonth * 100) : 100;
    const readingGrowth = readingsLastMonth > 0 ? ((readingsThisMonth - readingsLastMonth) / readingsLastMonth * 100) : 100;
    const conversionRate = totalUsers > 0 ? (activeUsers / totalUsers * 100) : 0;

    // Generar informe detallado
    const report = {
      fecha: now.toISOString().split('T')[0],
      resumenEjecutivo: {
        totalUsuarios: totalUsers,
        usuariosActivos: activeUsers,
        tasaConversion: Math.round(conversionRate * 100) / 100,
        crecimientoMensual: Math.round(userGrowth * 100) / 100,
        lecturasTotales: totalReadings,
        lecturasEsteMes: readingsThisMonth
      },
      analisisDetallado: {
        usuarios: {
          nuevosEsteMes: usersThisMonth,
          mesAnterior: usersLastMonth,
          tendencia: userGrowth >= 0 ? 'positiva' : 'negativa',
          porPlan: usersByPlan,
          enPrueba: trialUsers,
          retencion: Math.round((activeUsers / totalUsers * 100) * 100) / 100
        },
        engagement: {
          lecturasPorUsuario: totalUsers > 0 ? Math.round(totalReadings / totalUsers * 100) / 100 : 0,
          crecimientoLecturas: Math.round(readingGrowth * 100) / 100,
          distribucionTipos: readingsByType
        }
      },
      diagnostico: {
        fortalezas: [],
        debilidades: [],
        oportunidades: [],
        amenazas: []
      },
      recomendaciones: {
        inmediatas: [],
        medianoPlazo: [],
        largoplazo: []
      }
    };

    // Análisis automático y recomendaciones
    if (userGrowth > 10) {
      report.diagnostico.fortalezas.push('Crecimiento sólido de usuarios (+' + Math.round(userGrowth) + '%)');
      report.recomendaciones.inmediatas.push('Mantener estrategias actuales de adquisición');
    } else if (userGrowth < 0) {
      report.diagnostico.debilidades.push('Decrecimiento en nuevos usuarios (' + Math.round(userGrowth) + '%)');
      report.recomendaciones.inmediatas.push('Revisar estrategias de marketing y onboarding');
    }

    if (conversionRate > 25) {
      report.diagnostico.fortalezas.push('Excelente tasa de conversión (' + Math.round(conversionRate) + '%)');
    } else if (conversionRate < 15) {
      report.diagnostico.debilidades.push('Baja tasa de conversión (' + Math.round(conversionRate) + '%)');
      report.recomendaciones.inmediatas.push('Mejorar propuesta de valor y proceso de onboarding');
    }

    if (trialUsers / totalUsers > 0.1) {
      report.diagnostico.oportunidades.push('Alto interés en trials - oportunidad de conversión');
      report.recomendaciones.medianoPlazo.push('Desarrollar estrategia de conversión post-trial');
    }

    // Recomendaciones estándar basadas en mejores prácticas
    report.recomendaciones.inmediatas.push(
      'Implementar sistema de notificaciones push',
      'Optimizar landing page para mobile',
      'A/B testing en CTAs principales'
    );
    
    report.recomendaciones.medianoPlazo.push(
      'Programa de referidos con incentivos',
      'Content marketing en redes sociales',
      'Email marketing automatizado',
      'Análisis de cohortes de usuarios'
    );
    
    report.recomendaciones.largoplazo.push(
      'Expansión a nuevos mercados (LATAM)',
      'Desarrollo de app móvil nativa',
      'Integración con influencers del sector',
      'Programa de afiliados avanzado'
    );

    res.json({
      success: true,
      informe: report,
      generadoEn: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generando informe', 
      details: error.message 
    });
  }
});

// Plan comercial detallado con datos reales
router.get('/generate-business-plan', async (req, res) => {
  try {
    // Obtener datos actuales para el análisis
    const [totalUsers, activeSubscriptions, monthlyRevenue] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { subscriptionStatus: 'ACTIVE' } }),
      prisma.$queryRaw`
        SELECT COALESCE(SUM(CASE 
          WHEN "subscriptionPlan" = 'INICIADO' THEN 3.99
          WHEN "subscriptionPlan" = 'ADEPTO' THEN 9.99  
          WHEN "subscriptionPlan" = 'MAESTRO' THEN 17.99
          ELSE 0
        END), 0) as revenue
        FROM "User" 
        WHERE "subscriptionStatus" = 'ACTIVE'
      `
    ]);

    const currentRevenue = monthlyRevenue[0]?.revenue || 0;
    
    const businessPlan = {
      fecha: new Date().toISOString().split('T')[0],
      situacionActual: {
        usuarios: {
          total: totalUsers,
          activos: activeSubscriptions,
          tasaConversion: totalUsers > 0 ? Math.round(activeSubscriptions / totalUsers * 100 * 100) / 100 : 0
        },
        ingresos: {
          mensual: Math.round(currentRevenue * 100) / 100,
          anualEstimado: Math.round(currentRevenue * 12 * 100) / 100,
          ticketPromedio: activeSubscriptions > 0 ? Math.round(currentRevenue / activeSubscriptions * 100) / 100 : 0
        }
      },
      analisisSituacion: {
        loQueEstasBienHaciendo: [
          'Diversificación de servicios (Tarot, Runas, Sueños, Horóscopo)',
          'Modelo freemium con límites claros por plan',
          'Sistema de pruebas gratuitas para conversión',
          'Panel administrativo para gestión eficiente',
          'Integración con Stripe para pagos seguros',
          'Arquitectura escalable con React + Node.js'
        ],
        loQueEstaMal: [
          'Falta de estrategia de retención automatizada',
          'Sin notificaciones push para engagement',
          'Ausencia de programa de referidos',
          'Marketing limitado en redes sociales',
          'Sin análisis predictivo de churn',
          'Onboarding poco optimizado'
        ],
        oportunidadesPerdidas: [
          'No hay app móvil nativa (70% tráfico mobile)',
          'Sin contenido educativo sobre esoterismo',
          'Falta colaboraciones con influencers',
          'No aprovecha temporadas (Halloween, Año Nuevo)',
          'Sin gamificación para engagement',
          'Mercado LATAM sin explotar'
        ]
      },
      planAccion: {
        fase1_inmediato: {
          timeframe: '1-4 semanas',
          presupuesto: '€500-1000',
          acciones: [
            {
              accion: 'Optimizar landing page para mobile',
              como: 'Responsive design, velocidad carga <3s, CTA prominentes',
              cuando: 'Semana 1-2',
              kpi: 'Conversión mobile +25%'
            },
            {
              accion: 'Implementar email onboarding',
              como: 'Secuencia 5 emails automatizados con Mailchimp/Brevo',
              cuando: 'Semana 2-3',
              kpi: 'Activación usuarios +30%'
            },
            {
              accion: 'A/B test precios y CTAs',
              como: 'Test 2 versiones precio ADEPTO (€9.99 vs €12.99)',
              cuando: 'Semana 3-4',
              kpi: 'Revenue por usuario +15%'
            }
          ]
        },
        fase2_cortoplazo: {
          timeframe: '1-3 meses',
          presupuesto: '€2000-5000',
          acciones: [
            {
              accion: 'Programa referidos con incentivos',
              como: 'Mes gratis por cada amigo que se suscriba',
              cuando: 'Mes 1-2',
              kpi: 'Crecimiento orgánico +40%'
            },
            {
              accion: 'Content marketing en TikTok/Instagram',
              como: '3 posts semanales + 1 video explicativo servicios',
              cuando: 'Mes 1-3',
              kpi: '1000 seguidores nuevos/mes'
            },
            {
              accion: 'Notificaciones push inteligentes',
              como: 'Recordatorios personalizados según uso + horóscopo diario',
              cuando: 'Mes 2-3',
              kpi: 'Retención día 7 +50%'
            }
          ]
        },
        fase3_mediano: {
          timeframe: '3-6 meses',
          presupuesto: '€5000-15000',
          acciones: [
            {
              accion: 'App móvil nativa (iOS/Android)',
              como: 'React Native o Flutter, notificaciones push nativas',
              cuando: 'Mes 3-6',
              kpi: '50% usuarios en mobile app'
            },
            {
              accion: 'Colaboraciones con influencers',
              como: '5-10 micro-influencers esoterismo (10K-100K followers)',
              cuando: 'Mes 4-6',
              kpi: 'CAC reducido 30%'
            },
            {
              accion: 'Expansión mercado LATAM',
              como: 'Localización México/Colombia, pagos locales',
              cuando: 'Mes 5-6',
              kpi: '+25% usuarios internacionales'
            }
          ]
        },
        fase4_largo: {
          timeframe: '6-12 meses',
          presupuesto: '€15000-30000',
          acciones: [
            {
              accion: 'Plataforma de cursos esotéricos',
              como: 'LMS integrado con certificaciones pagadas',
              cuando: 'Mes 6-9',
              kpi: 'Nueva línea ingresos €2000/mes'
            },
            {
              accion: 'IA personalizada avanzada',
              como: 'Algoritmo ML para lecturas personalizadas',
              cuando: 'Mes 9-12',
              kpi: 'Satisfacción usuario +40%'
            },
            {
              accion: 'Marketplace de productos esotéricos',
              como: 'Venta cartas, cristales, accesorios con dropshipping',
              cuando: 'Mes 10-12',
              kpi: 'Ingresos adicionales €5000/mes'
            }
          ]
        }
      },
      proyeccionesFinancieras: {
        mes1: { usuarios: Math.round(totalUsers * 1.15), ingresos: Math.round(currentRevenue * 1.2 * 100) / 100 },
        mes3: { usuarios: Math.round(totalUsers * 1.45), ingresos: Math.round(currentRevenue * 1.8 * 100) / 100 },
        mes6: { usuarios: Math.round(totalUsers * 2.1), ingresos: Math.round(currentRevenue * 2.5 * 100) / 100 },
        mes12: { usuarios: Math.round(totalUsers * 3.2), ingresos: Math.round(currentRevenue * 4.2 * 100) / 100 }
      },
      kpisClaves: [
        'CAC (Costo Adquisición Cliente) < €15',
        'LTV/CAC ratio > 3:1',
        'Churn mensual < 5%',
        'Tiempo payback < 6 meses',
        'NPS (Net Promoter Score) > 50',
        'Conversión trial-pago > 25%'
      ]
    };

    res.json({
      success: true,
      planComercial: businessPlan,
      generadoEn: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating business plan:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generando plan comercial', 
      details: error.message 
    });
  }
});

// Endpoint para activar periodo de prueba mediante cupón
router.post('/users/:id/activate-trial', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { coupon } = req.body;
  // Buscar el cupón en la base de datos
  const trialCoupon = await prisma.trialCoupon.findUnique({ where: { code: coupon } });
  if (!trialCoupon || !trialCoupon.isActive) {
    return res.status(400).json({ success: false, message: 'Cupón inválido o ya usado' });
  }
  // Verificar si el usuario ya tuvo trial
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
  }
  if (user.trialActive || (user.trialExpiry && new Date() > new Date(user.trialExpiry))) {
    return res.status(400).json({ success: false, message: 'El usuario ya ha disfrutado el periodo de prueba' });
  }
  // Activar periodo de prueba por 7 días
  const now = new Date();
  const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      trialActive: true,
      trialExpiry: expiry
    }
  });
  // Marcar el cupón como usado
  await prisma.trialCoupon.update({
    where: { code: coupon },
    data: {
      isActive: false,
      usedBy: id,
      usedAt: now
    }
  });
  res.json({ success: true, message: 'Periodo de prueba activado', trialExpiry: expiry, user: updatedUser });
});

router.put('/users/:id', requireAdmin, updateUser);

// Endpoint simple para que el admin active/desactive trial directamente
router.put('/users/:id/admin-trial', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { activate } = req.body; // true para activar, false para desactivar
    
    console.log('[ADMIN] Cambiando estado de trial:', { id, activate });
    
    if (activate) {
      // Activar trial por 7 días con plan PREMIUM
      const now = new Date();
      const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          trialActive: true,
          trialExpiry: expiry,
          subscriptionPlan: 'PREMIUM' // Asignar plan PREMIUM durante el trial
        },
        select: {
          id: true,
          username: true, 
          email: true,
          subscriptionPlan: true,
          trialActive: true,
          trialExpiry: true
        }
      });
      
      console.log('[ADMIN] Trial PREMIUM activado para usuario:', updatedUser.email);
      res.json({ success: true, message: 'Trial PREMIUM activado por 7 días', trialExpiry: expiry, user: updatedUser });
    } else {
      // Desactivar trial y volver a INVITADO
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          trialActive: false,
          trialExpiry: null,
          subscriptionPlan: 'INVITADO' // Volver al plan básico
        },
        select: {
          id: true,
          username: true,
          email: true,
          subscriptionPlan: true,
          trialActive: true,
          trialExpiry: true
        }
      });
      
      console.log('[ADMIN] Trial desactivado para usuario:', updatedUser.email);
      res.json({ success: true, message: 'Trial desactivado, plan cambiado a INVITADO', user: updatedUser });
    }
  } catch (error) {
    console.error('[ADMIN] Error cambiando trial:', error);
    res.status(500).json({ error: 'Error cambiando estado del trial', details: error.message });
  }
});

// Endpoint para migrar planes legacy a nuevo sistema
router.post('/migrate-plans', requireAdmin, async (req, res) => {
  try {
    console.log('[ADMIN] Iniciando migración de planes...');
    
    // Mapeo de migración
    const migrations = {
      'INICIADO': 'ESENCIAL',
      'ADEPTO': 'PREMIUM',
      'MAESTRO': 'PREMIUM'
    };
    
    let migratedUsers = 0;
    let errors = [];
    
    for (const [oldPlan, newPlan] of Object.entries(migrations)) {
      try {
        // Buscar usuarios con plan legacy
        const usersToMigrate = await prisma.user.findMany({
          where: { subscriptionPlan: oldPlan },
          select: { id: true, email: true, subscriptionPlan: true }
        });
        
        console.log(`Encontrados ${usersToMigrate.length} usuarios con plan ${oldPlan}`);
        
        // Migrar cada usuario
        for (const user of usersToMigrate) {
          await prisma.user.update({
            where: { id: user.id },
            data: { subscriptionPlan: newPlan }
          });
          
          console.log(`Usuario ${user.email} migrado de ${oldPlan} a ${newPlan}`);
          migratedUsers++;
        }
      } catch (error) {
        console.error(`Error migrando plan ${oldPlan}:`, error);
        errors.push({ plan: oldPlan, error: error.message });
      }
    }
    
    console.log(`[ADMIN] Migración completada: ${migratedUsers} usuarios migrados`);
    
    res.json({
      success: true,
      message: `Migración completada: ${migratedUsers} usuarios actualizados`,
      migratedUsers,
      errors: errors.length > 0 ? errors : null
    });
    
  } catch (error) {
    console.error('[ADMIN] Error en migración de planes:', error);
    res.status(500).json({ 
      error: 'Error en migración de planes', 
      details: error.message 
    });
  }
});

// Endpoint para obtener estadísticas de planes
router.get('/plan-stats', requireAdmin, async (req, res) => {
  try {
    const stats = await prisma.user.groupBy({
      by: ['subscriptionPlan'],
      _count: {
        subscriptionPlan: true
      }
    });
    
    const formattedStats = stats.reduce((acc, stat) => {
      acc[stat.subscriptionPlan] = stat._count.subscriptionPlan;
      return acc;
    }, {});
    
    res.json({
      success: true,
      stats: formattedStats,
      totalUsers: stats.reduce((sum, stat) => sum + stat._count.subscriptionPlan, 0)
    });
    
  } catch (error) {
    console.error('[ADMIN] Error obteniendo estadísticas:', error);
    res.status(500).json({ 
      error: 'Error obteniendo estadísticas de planes' 
    });
  }
});

// Endpoint para obtener precios de Stripe configurados
router.get('/stripe-prices', requireAdmin, async (req, res) => {
  try {
    const { config } = await import('../config/config.js');
    
    const prices = {
      esencial: {
        monthly: {
          priceId: config.membership.esencial.stripeIdMonthly,
          amount: config.membership.esencial.priceMonthly
        },
        annual: {
          priceId: config.membership.esencial.stripeIdAnnual,
          amount: config.membership.esencial.priceAnnual
        }
      },
      premium: {
        monthly: {
          priceId: config.membership.premium.stripeIdMonthly,
          amount: config.membership.premium.priceMonthly
        },
        annual: {
          priceId: config.membership.premium.stripeIdAnnual,
          amount: config.membership.premium.priceAnnual
        }
      }
    };

    res.json({
      success: true,
      prices,
      message: 'Precios de Stripe configurados'
    });
    
  } catch (error) {
    console.error('[ADMIN] Error obteniendo precios Stripe:', error);
    res.status(500).json({ 
      error: 'Error obteniendo precios de Stripe' 
    });
  }
});

// Endpoint para obtener el estado del plan de un usuario
router.get('/users/:id/plan-status', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        trialActive: true,
        trialExpiry: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    // Determinar si el trial está activo
    const now = new Date();
    const trialIsActive = user.trialActive && user.trialExpiry && now <= user.trialExpiry;
    
    res.json({
      success: true,
      planStatus: {
        currentPlan: user.subscriptionPlan || 'INVITADO',
        status: user.subscriptionStatus || 'INACTIVE',
        trialActive: trialIsActive,
        trialExpiry: user.trialExpiry,
        memberSince: user.createdAt,
        lastUpdated: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching user plan status:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estado del plan' });
  }
});

// Endpoint para actualizar solo el rol de usuario
router.put('/users/:id/role', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!role || !['USER', 'ADMIN', 'ECOMMERCE', 'BLOG'].includes(role)) {
    return res.status(400).json({ error: 'Rol no válido' });
  }
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { role }
    });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando rol', details: error.message });
  }
});

// Endpoint para activar/desactivar el trial de un usuario
router.put('/users/:id/trial', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, trialActive: true, trialExpiry: true }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    // Toggle trial status
    const newTrialActive = !user.trialActive;
    let updateData = { trialActive: newTrialActive };
    
    // Si se está activando, establecer fecha de expiración (7 días)
    if (newTrialActive) {
      const now = new Date();
      const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      updateData.trialExpiry = expiry;
    } else {
      // Si se está desactivando, limpiar fecha de expiración
      updateData.trialExpiry = null;
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        trialActive: true,
        trialExpiry: true,
        subscriptionPlan: true
      }
    });
    
    res.json({
      success: true,
      message: newTrialActive ? 'Trial activado' : 'Trial desactivado',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error toggling trial:', error);
    res.status(500).json({ success: false, message: 'Error al modificar el trial' });
  }
});

// Endpoint para actualizar el plan de suscripción de un usuario
router.put('/users/:id/plan', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { plan } = req.body;
  
  console.log('[ADMIN] PUT /users/:id/plan llamado con:', { id, plan, body: req.body });
  
  const validPlans = ['INVITADO', 'ESENCIAL', 'PREMIUM', 'INICIADO', 'ADEPTO', 'MAESTRO'];
  if (!plan || !validPlans.includes(plan)) {
    console.log('[ADMIN] Plan inválido:', { plan, validPlans });
    return res.status(400).json({ error: 'Plan no válido', received: plan, valid: validPlans });
  }
  try {
    console.log('[ADMIN] Actualizando plan de usuario:', { id, plan });
    const user = await prisma.user.update({
      where: { id },
      data: { subscriptionPlan: plan }
    });
    console.log('[ADMIN] Usuario actualizado exitosamente:', { email: user.email, newPlan: user.subscriptionPlan });
    res.json({ success: true, user });
  } catch (error) {
    console.error('[ADMIN] Error actualizando plan:', error);
    res.status(500).json({ error: 'Error actualizando plan', details: error.message });
  }
});

// Blog Management Routes
router.get('/blog/posts', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = status ? { status: status.toUpperCase() } : {};
    
    const posts = await prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: { id: true, email: true, username: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });
    
    const total = await prisma.blogPost.count({ where });
    
    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ success: false, message: 'Error al obtener posts del blog' });
  }
});

router.post('/blog/posts', async (req, res) => {
  try {
    const { title, content, excerpt, tags, status, featuredImage, seoTitle, seoDescription } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Título y contenido son requeridos' });
    }
    
    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    
    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        tags: tags || [],
        status: status || 'DRAFT',
        featuredImage,
        seoTitle,
        seoDescription,
        authorId: req.admin.id
      },
      include: {
        author: {
          select: { id: true, email: true, username: true }
        }
      }
    });
    
    res.json({
      success: true,
      message: 'Post creado exitosamente',
      post
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ success: false, message: 'Ya existe un post con ese slug' });
    } else {
      res.status(500).json({ success: false, message: 'Error al crear el post' });
    }
  }
});

router.put('/blog/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, tags, status, featuredImage, seoTitle, seoDescription } = req.body;
    
    // Update slug if title changed
    const updateData = {
      content,
      excerpt,
      tags: tags || [],
      status,
      featuredImage,
      seoTitle,
      seoDescription
    };
    
    if (title) {
      updateData.title = title;
      updateData.slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
    }
    
    const post = await prisma.blogPost.update({
      where: { id },
      data: { ...updateData, authorId: req.admin.id },
      include: {
        author: {
          select: { id: true, email: true, username: true }
        }
      }
    });
    
    res.json({
      success: true,
      message: 'Post actualizado exitosamente',
      post
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Post no encontrado' });
    } else if (error.code === 'P2002') {
      res.status(400).json({ success: false, message: 'Ya existe un post con ese slug' });
    } else {
      res.status(500).json({ success: false, message: 'Error al actualizar el post' });
    }
  }
});

router.delete('/blog/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.blogPost.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Post eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Post no encontrado' });
    } else {
      res.status(500).json({ success: false, message: 'Error al eliminar el post' });
    }
  }
});

// Shop Management Routes
router.get('/shop/products', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (category) where.category = category;
    if (status) where.status = status.toUpperCase();
    
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });
    
    const total = await prisma.product.count({ where });
    
    res.json({
      success: true,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Error al obtener productos' });
  }
});

router.post('/shop/products', async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      compareAtPrice, 
      sku, 
      category, 
      tags, 
      inventory, 
      weight, 
      images, 
      seoTitle, 
      seoDescription,
      status 
    } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Nombre y precio son requeridos' });
    }
    
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        sku,
        category,
        tags: tags || [],
        inventory: inventory || 0,
        weight: weight ? parseFloat(weight) : null,
        images: images || [],
        seoTitle,
        seoDescription,
        status: status || 'ACTIVE'
      }
    });
    
    res.json({
      success: true,
      message: 'Producto creado exitosamente',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ success: false, message: 'Ya existe un producto con ese SKU' });
    } else {
      res.status(500).json({ success: false, message: 'Error al crear el producto' });
    }
  }
});

router.put('/shop/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      price, 
      compareAtPrice, 
      sku, 
      category, 
      tags, 
      inventory, 
      weight, 
      images, 
      seoTitle, 
      seoDescription,
      status 
    } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (compareAtPrice !== undefined) updateData.compareAtPrice = compareAtPrice ? parseFloat(compareAtPrice) : null;
    if (sku !== undefined) updateData.sku = sku;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (inventory !== undefined) updateData.inventory = inventory;
    if (weight !== undefined) updateData.weight = weight ? parseFloat(weight) : null;
    if (images !== undefined) updateData.images = images;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (status) updateData.status = status;
    
    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });
    
    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Producto no encontrado' });
    } else if (error.code === 'P2002') {
      res.status(400).json({ success: false, message: 'Ya existe un producto con ese SKU' });
    } else {
      res.status(500).json({ success: false, message: 'Error al actualizar el producto' });
    }
  }
});

router.delete('/shop/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.product.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Producto no encontrado' });
    } else {
      res.status(500).json({ success: false, message: 'Error al eliminar el producto' });
    }
  }
});

// Decks Management (Mazos)
router.get('/decks', async (req, res) => {
  try {
    const { page = 1, limit = 50, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (type) where.type = type.toUpperCase();

    const decks = await prisma.deck.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    });

    const total = await prisma.deck.count({ where });

    res.json({ success: true, decks, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    console.error('Error fetching decks:', error);
    res.status(500).json({ success: false, message: 'Error al obtener mazos' });
  }
});

// ==========================
// Deck Cards Management
// ==========================

// GET /api/admin/decks/:deckId/cards - listar cartas del mazo
router.get('/decks/:deckId/cards', requireAdmin, async (req, res) => {
  try {
    const { deckId } = req.params;
    const cards = await prisma.tarotCard.findMany({ where: { deckId } });
    res.json({ success: true, cards });
  } catch (error) {
    console.error('Error listing deck cards:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/admin/decks/:deckId/cards - crear una carta en el mazo
router.post('/decks/:deckId/cards', requireAdmin, async (req, res) => {
  try {
    const { deckId } = req.params;
    const { name, cardNumber, arcana, suit, meaning, reversedMeaning, keywords, imageUrl, deckType, prompt } = req.body;
    if (!name) return res.status(400).json({ error: 'Nombre requerido' });

    const card = await prisma.tarotCard.create({
      data: {
        name,
        cardNumber: cardNumber || null,
        arcana: (arcana || 'TAROT').toString(),
        suit: suit || null,
        meaning: meaning || '',
        reversedMeaning: reversedMeaning || '',
        keywords: keywords || [],
        imageUrl: imageUrl || '',
        deckType: deckType || 'CUSTOM',
        deckId: deckId,
        prompt: prompt || ''
      }
    });

    res.json({ success: true, card });
  } catch (error) {
    console.error('Error creating deck card:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/admin/decks/:deckId/cards/:cardId - actualizar carta
router.put('/decks/:deckId/cards/:cardId', requireAdmin, async (req, res) => {
  try {
    const { cardId } = req.params;
    const updateData = req.body;
    const card = await prisma.tarotCard.update({ where: { id: cardId }, data: updateData });
    res.json({ success: true, card });
  } catch (error) {
    console.error('Error updating deck card:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/admin/decks/:deckId/cards/:cardId - borrar carta
router.delete('/decks/:deckId/cards/:cardId', requireAdmin, async (req, res) => {
  try {
    const { cardId } = req.params;
    await prisma.tarotCard.delete({ where: { id: cardId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting deck card:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/admin/decks/:deckId/cards/bulk - subir CSV o JSON bulk (stub)
router.post('/decks/:deckId/cards/bulk', requireAdmin, async (req, res) => {
  try {
    // Para simplificar: aceptar body.cards = [{...}, {...}]
    const { deckId } = req.params;
    const { cards } = req.body;
    if (!Array.isArray(cards)) return res.status(400).json({ error: 'Se requiere un array cards' });

    const created = [];
    for (const c of cards) {
      const newCard = await prisma.tarotCard.create({ data: { ...c, deckId } });
      created.push(newCard);
    }

    res.json({ success: true, createdCount: created.length, created });
  } catch (error) {
    console.error('Error bulk creating cards:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/admin/decks/:deckId/cards/bulk-zip - subir CSV + ZIP con imágenes
// ...imports...
// Función para enviar alerta a Discord
async function sendDiscordAlert(msg) {
  try {
    await notifyDiscord('alertas', msg);
  } catch (e) {
    console.error('Error enviando alerta a Discord:', e);
  }
}
router.post('/decks/:deckId/cards/bulk-zip', requireAdmin, upload.fields([{ name: 'csv' }, { name: 'images' }]), async (req, res) => {
  try {
    const { deckId } = req.params;
    const csvFile = req.files['csv']?.[0];
    const imagesFile = req.files['images']?.[0];

    if (!csvFile) return res.status(400).json({ error: 'CSV requerido' });

    // Leer CSV (básico usando split lines y JSON.parse for simplicity if JSON rows)
    const csvContent = fs.readFileSync(csvFile.path, 'utf8');
    const lines = csvContent.split(/\r?\n/).filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      const cols = line.split(',').map(c => c.trim());
      const obj = {};
      headers.forEach((h, i) => { obj[h] = cols[i] || ''; });
      return obj;
    });

    // Extraer imágenes si ZIP provisto
    const extractedDir = path.join(process.cwd(), 'tmp', `extracted-${Date.now()}`);
    if (imagesFile) {
      fs.mkdirSync(extractedDir, { recursive: true });
      const zip = new AdmZip(imagesFile.path);
      zip.extractAllTo(extractedDir, true);
    }

    const uploadsDir = path.join(process.cwd(), 'uploads', 'cards');
    fs.mkdirSync(uploadsDir, { recursive: true });

    const created = [];
    for (const r of rows) {
      // r should have name, meaning, imageName, arcana, suit
      let imageUrl = '';
      if (r.imageName && imagesFile) {
        const candidate = path.join(extractedDir, r.imageName);
        if (fs.existsSync(candidate)) {
          const outName = `${Date.now()}-${Math.random().toString(36).substr(2,8)}${path.extname(r.imageName)}`;
          const outPath = path.join(uploadsDir, outName);
          // Optimize with sharp
          await sharp(candidate).resize(800).jpeg({ quality: 80 }).toFile(outPath);
          imageUrl = `/uploads/cards/${outName}`;
        }
      }

      const cardData = {
        name: r.name || r.title || 'Sin nombre',
        cardNumber: r.cardNumber || null,
        arcana: (r.arcana || 'TAROT').toString(),
        suit: r.suit || null,
        meaning: r.meaning || '',
        reversedMeaning: r.reversedMeaning || '',
        keywords: (r.keywords || '').split(';').map(k => k.trim()).filter(Boolean),
        imageUrl: imageUrl || (r.imageUrl || ''),
        deckType: r.deckType || 'CUSTOM',
        deckId: deckId,
        prompt: r.prompt || ''
      };

      const c = await prisma.tarotCard.create({ data: cardData });
      created.push(c);
    }

    // Cleanup temp files
    try { fs.unlinkSync(csvFile.path); } catch (e) {}
    if (imagesFile) { try { fs.unlinkSync(imagesFile.path); } catch (e) {} }

    res.json({ success: true, createdCount: created.length, created });
  } catch (error) {
    console.error('Error bulk-zip creating cards:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/decks', async (req, res) => {
  try {
    const { name, description, imageUrl, type } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Nombre es requerido' });

    const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();

    const deck = await prisma.deck.create({
      data: { name, slug, description, imageUrl, type: type ? type.toUpperCase() : undefined }
    });

  // Invalidate cached public decks so frontend sees the new mazo immediately
  let cacheInvalidated = false;
  try { await invalidateDecksCache(); cacheInvalidated = true; } catch (e) { console.warn('Failed to invalidate decks cache', e); }

  res.json({ success: true, message: 'Mazo creado', deck, cacheInvalidated });
  } catch (error) {
    console.error('Error creating deck:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ success: false, message: 'Ya existe un mazo con ese slug' });
    } else {
      res.status(500).json({ success: false, message: 'Error al crear mazo' });
    }
  }
});

router.put('/decks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, type } = req.body;

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();
    }
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (type !== undefined) updateData.type = type ? type.toUpperCase() : null;

    const deck = await prisma.deck.update({ where: { id }, data: updateData });
  // Invalidate cached public decks so frontend sees the updated mazo immediately
  let cacheInvalidated = false;
  try { await invalidateDecksCache(); cacheInvalidated = true; } catch (e) { console.warn('Failed to invalidate decks cache', e); }

  res.json({ success: true, message: 'Mazo actualizado', deck, cacheInvalidated });
  } catch (error) {
    console.error('Error updating deck:', error);
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Mazo no encontrado' });
    res.status(500).json({ success: false, message: 'Error al actualizar mazo' });
  }
});

router.delete('/decks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.deck.delete({ where: { id } });
  // Invalidate cached public decks so frontend sees the removal immediately
  let cacheInvalidated = false;
  try { await invalidateDecksCache(); cacheInvalidated = true; } catch (e) { console.warn('Failed to invalidate decks cache', e); }

  res.json({ success: true, message: 'Mazo eliminado', cacheInvalidated });
  } catch (error) {
    console.error('Error deleting deck:', error);
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Mazo no encontrado' });
    res.status(500).json({ success: false, message: 'Error al eliminar mazo' });
  }
});

// Stripe Management Routes
router.get('/stripe/stats', async (req, res) => {
  try {
    // Get Stripe balance
    const balance = await mcp_stripe_agent_retrieve_balance();
    
    // Get subscription stats
    const subscriptions = await mcp_stripe_agent_list_subscriptions({ status: 'active' });
    
    // Get customer count
    const customers = await mcp_stripe_agent_list_customers({ limit: 1 });
    
    // Calculate monthly revenue from active subscriptions
    const monthlyRevenue = subscriptions.data?.reduce((total, sub) => {
      return total + (sub.items?.data[0]?.price?.unit_amount || 0);
    }, 0) || 0;
    
    res.json({
      success: true,
      stats: {
        totalRevenue: balance.available?.[0]?.amount || 0,
        monthlyRevenue: monthlyRevenue,
        activeSubscriptions: subscriptions.data?.length || 0,
        totalCustomers: customers.total_count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching Stripe stats:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas de Stripe' });
  }
});

router.get('/stripe/customers', async (req, res) => {
  try {
    const { page = 1, limit = 10, email } = req.query;
    
    const params = { limit: parseInt(limit) };
    if (email) params.email = email;
    
    const customers = await mcp_stripe_agent_list_customers(params);
    
    res.json({
      success: true,
      customers: customers.data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        has_more: customers.has_more || false
      }
    });
  } catch (error) {
    console.error('Error fetching Stripe customers:', error);
    res.status(500).json({ success: false, message: 'Error al obtener clientes de Stripe' });
  }
});

router.get('/stripe/subscriptions', async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all', customer } = req.query;
    
    const params = { 
      limit: parseInt(limit),
      status 
    };
    if (customer) params.customer = customer;
    
    const subscriptions = await mcp_stripe_agent_list_subscriptions(params);
    
    res.json({
      success: true,
      subscriptions: subscriptions.data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        has_more: subscriptions.has_more || false
      }
    });
  } catch (error) {
    console.error('Error fetching Stripe subscriptions:', error);
    res.status(500).json({ success: false, message: 'Error al obtener suscripciones de Stripe' });
  }
});

router.post('/stripe/refund', async (req, res) => {
  try {
    const { payment_intent, amount, reason } = req.body;
    
    if (!payment_intent) {
      return res.status(400).json({ success: false, message: 'Payment Intent ID es requerido' });
    }
    
    const refundParams = { payment_intent };
    if (amount) refundParams.amount = parseInt(amount);
    if (reason) refundParams.reason = reason;
    
    const refund = await mcp_stripe_agent_create_refund(refundParams);
    
    res.json({
      success: true,
      message: 'Reembolso procesado exitosamente',
      refund
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ success: false, message: 'Error al procesar el reembolso' });
  }
});

// Cashflow Management Routes
router.get('/cashflow/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Get total income
    const totalIncomeResult = await prisma.income.aggregate({
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      _sum: {
        amount: true
      }
    });
    
    // Get total expenses
    const totalExpensesResult = await prisma.expense.aggregate({
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      _sum: {
        amount: true
      }
    });
    
    const totalIncome = totalIncomeResult._sum.amount || 0;
    const totalExpenses = totalExpensesResult._sum.amount || 0;
    const netProfit = totalIncome - totalExpenses;
    
    // Calculate monthly growth (compare with previous month)
    const prevMonthStart = new Date(start);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(start);
    prevMonthEnd.setDate(0);
    
    const prevIncomeResult = await prisma.income.aggregate({
      where: {
        date: {
          gte: prevMonthStart,
          lte: prevMonthEnd
        }
      },
      _sum: {
        amount: true
      }
    });
    
    const prevExpensesResult = await prisma.expense.aggregate({
      where: {
        date: {
          gte: prevMonthStart,
          lte: prevMonthEnd
        }
      },
      _sum: {
        amount: true
      }
    });
    
    const prevNetProfit = (prevIncomeResult._sum.amount || 0) - (prevExpensesResult._sum.amount || 0);
    const monthlyGrowth = prevNetProfit === 0 ? 0 : ((netProfit - prevNetProfit) / Math.abs(prevNetProfit)) * 100;
    
    res.json({
      success: true,
      stats: {
        totalIncome: totalIncome / 100, // Convert from cents to euros
        totalExpenses: totalExpenses / 100,
        netProfit: netProfit / 100,
        monthlyGrowth: Math.round(monthlyGrowth * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error fetching cashflow stats:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas de cashflow' });
  }
});

router.get('/cashflow/income', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (category) where.category = category.toUpperCase();
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    const income = await prisma.income.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: parseInt(limit)
    });
    
    const total = await prisma.income.count({ where });
    
    // Convert amounts from cents to euros
    const formattedIncome = income.map(item => ({
      ...item,
      amount: item.amount / 100
    }));
    
    res.json({
      success: true,
      income: formattedIncome,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching income:', error);
    res.status(500).json({ success: false, message: 'Error al obtener ingresos' });
  }
});

router.get('/cashflow/expenses', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (category) where.category = category.toUpperCase();
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    const expenses = await prisma.expense.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, email: true, username: true }
        }
      },
      orderBy: { date: 'desc' },
      skip,
      take: parseInt(limit)
    });
    
    const total = await prisma.expense.count({ where });
    
    // Convert amounts from cents to euros
    const formattedExpenses = expenses.map(expense => ({
      ...expense,
      amount: expense.amount / 100
    }));
    
    res.json({
      success: true,
      expenses: formattedExpenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ success: false, message: 'Error al obtener gastos' });
  }
});

router.post('/cashflow/expenses', async (req, res) => {
  try {
    const { description, amount, category, date, recurring, notes } = req.body;
    
    if (!description || !amount || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Descripción, cantidad y categoría son requeridos' 
      });
    }
    
    const expense = await prisma.expense.create({
      data: {
        description,
        amount: Math.round(parseFloat(amount) * 100), // Convert euros to cents
        category: category.toUpperCase(),
        date: date ? new Date(date) : new Date(),
        recurring: recurring || false,
        notes,
        createdById: req.user.id
      },
      include: {
        createdBy: {
          select: { id: true, email: true, username: true }
        }
      }
    });
    
    // Convert amount back to euros for response
    const formattedExpense = {
      ...expense,
      amount: expense.amount / 100
    };
    
    res.json({
      success: true,
      message: 'Gasto creado exitosamente',
      expense: formattedExpense
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ success: false, message: 'Error al crear el gasto' });
  }
});

router.put('/cashflow/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category, date, recurring, notes } = req.body;
    
    const updateData = {};
    if (description) updateData.description = description;
    if (amount) updateData.amount = Math.round(parseFloat(amount) * 100);
    if (category) updateData.category = category.toUpperCase();
    if (date) updateData.date = new Date(date);
    if (recurring !== undefined) updateData.recurring = recurring;
    if (notes !== undefined) updateData.notes = notes;
    
    const expense = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, email: true, username: true }
        }
      }
    });
    
    // Convert amount back to euros for response
    const formattedExpense = {
      ...expense,
      amount: expense.amount / 100
    };
    
    res.json({
      success: true,
      message: 'Gasto actualizado exitosamente',
      expense: formattedExpense
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Gasto no encontrado' });
    } else {
      res.status(500).json({ success: false, message: 'Error al actualizar el gasto' });
    }
  }
});

router.delete('/cashflow/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.expense.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Gasto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Gasto no encontrado' });
    } else {
      res.status(500).json({ success: false, message: 'Error al eliminar el gasto' });
    }
  }
});

// File Upload Route
router.post('/upload', (req, res) => {
  // Placeholder - implementar file upload
  res.json({
    success: true,
    message: 'Archivo subido',
    url: '/uploads/placeholder.jpg'
  });
});

export default router;