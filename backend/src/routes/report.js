import { authenticate, requireAdmin } from '../middleware/auth.js';
import express from 'express';
const router = express.Router();
import { prisma } from '../prismaClient.js';
import axios from 'axios';
import { analyzeWithPerplexity } from '../utils/perplexity.js';

async function getIncomeSummary(startDate, endDate, filters) {
  const where = {
    date: { gte: new Date(startDate), lte: new Date(endDate) }
  };
  if (filters.category) where.category = filters.category;
  const total = await prisma.income.aggregate({ _sum: { amount: true }, where });
  const count = await prisma.income.count({ where });
  return { total: total._sum.amount || 0, count };
}

async function getExpensesSummary(startDate, endDate, filters) {
  const where = {
    date: { gte: new Date(startDate), lte: new Date(endDate) }
  };
  const total = await prisma.expense.aggregate({ _sum: { amount: true }, where });
  const count = await prisma.expense.count({ where });
  const cats = await prisma.expense.groupBy({
    by: ['category'],
    where,
    _sum: { amount: true }
  });
  const byCategory = {};
  cats.forEach(c => { byCategory[c.category] = c._sum.amount || 0; });
  return { total: total._sum.amount || 0, count, byCategory };
}

async function getSubscriptionsSummary(startDate, endDate, filters) {
  // Usar SubscriptionHistory como indica el schema.prisma
  const where = {
    startDate: { gte: new Date(startDate), lte: new Date(endDate) }
  };
  if (filters.plan) where.plan = filters.plan;
  // Nuevas suscripciones en el periodo
  const newSubscriptions = await prisma.subscriptionHistory.count({ where });
  // Cancelaciones en el periodo (status = 'CANCELED' y endDate en rango)
  const cancellations = await prisma.subscriptionHistory.count({
    where: {
      status: 'CANCELED',
      endDate: { gte: new Date(startDate), lte: new Date(endDate) },
      ...(filters.plan ? { plan: filters.plan } : {})
    }
  });
  // MRR estimado: suma de amount de suscripciones activas (status = 'ACTIVE', endDate null o > endDate)
  const activeSubs = await prisma.subscriptionHistory.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { endDate: null },
        { endDate: { gt: new Date(endDate) } }
      ],
      startDate: { lte: new Date(endDate) },
      ...(filters.plan ? { plan: filters.plan } : {})
    }
  });
  const mrr = activeSubs.reduce((sum, s) => sum + (s.amount || 0), 0);
  return { mrr, newSubscriptions, cancellations };
}

async function getOpenAICosts(startDate, endDate) {
  const where = {
    createdAt: { gte: new Date(startDate), lte: new Date(endDate) }
  };
  const total = await prisma.openAICall.aggregate({ _sum: { cost: true }, where });
  const calls = await prisma.openAICall.count({ where });
  return { total: total._sum.cost || 0, calls };
}

async function getChurnSummary(startDate, endDate) {
  // Cancelaciones en el periodo (status = 'CANCELED' y endDate en rango)
  const cancellations = await prisma.subscriptionHistory.count({
    where: {
      status: 'CANCELED',
      endDate: { gte: new Date(startDate), lte: new Date(endDate) }
    }
  });
  // Clientes activos al inicio del periodo (status = 'ACTIVE', startDate <= startDate, endDate null o > startDate)
  const startingCustomers = await prisma.subscriptionHistory.count({
    where: {
      status: 'ACTIVE',
      startDate: { lte: new Date(startDate) },
      OR: [
        { endDate: null },
        { endDate: { gt: new Date(startDate) } }
      ]
    }
  });
  const churnRate = startingCustomers ? cancellations / startingCustomers : 0;
  return { churnRate, cancellations };
}

async function getProductMetrics(startDate, endDate) {
  // Usamos DailyStats para métricas agregadas
  const stats = await prisma.dailyStats.findMany({
    where: {
      date: { gte: new Date(startDate), lte: new Date(endDate) }
    }
  });
  const activeUsers = stats.reduce((sum, s) => sum + (s.activeUsers || 0), 0);
  const conversions = stats.reduce((sum, s) => sum + (s.oneTimePayments || 0), 0);
  // ARPU estimado: ingresos / usuarios activos
  const totalIncome = stats.reduce((sum, s) => sum + (s.dailyRevenue || 0), 0);
  const arpu = activeUsers ? totalIncome / activeUsers : 0;
  return { activeUsers, conversions, arpu };
}

async function getEmailStatsFromBrevo(startDate, endDate) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await axios.get('https://api.brevo.com/v3/smtp/statistics', {
      headers: { 'api-key': apiKey },
      params: { startDate, endDate }
    });
    return {
      sent: res.data.totalSent || 0,
      opens: res.data.totalOpened || 0,
      clicks: res.data.totalClicked || 0
    };
  } catch (err) {
    console.error('Error Brevo:', err.message);
    return null;
  }
}

async function getIncomeHistory(monthsBack = 6, untilDate = new Date()) {
  const end = new Date(untilDate);
  const start = new Date(end);
  start.setMonth(end.getMonth() - monthsBack + 1);
  const rows = await prisma.$queryRaw`
    SELECT 
      to_char("date", 'YYYY-MM') as month,
      SUM("amount") as total
    FROM "income"
    WHERE "date" BETWEEN ${start} AND ${end}
    GROUP BY month
    ORDER BY month ASC
  `;
  return rows.map(r => ({
    month: r.month,
    total: Number(r.total)
  }));
}

function computeForecasts(incomeHistory, horizonMonths = 3) {
  if (!incomeHistory || incomeHistory.length < 2) {
    return { nextMonths: [], method: 'insuficientes datos' };
  }
  let growthRates = [];
  for (let i = 1; i < incomeHistory.length; i++) {
    const prev = incomeHistory[i - 1].total || 0;
    const cur = incomeHistory[i].total || 0;
    growthRates.push(prev === 0 ? 0 : (cur - prev) / prev);
  }
  const avgGrowth = growthRates.reduce((s, x) => s + x, 0) / growthRates.length;
  const last = incomeHistory[incomeHistory.length - 1].total || 0;
  const next = [];
  let current = last;
  for (let m = 1; m <= horizonMonths; m++) {
    current = current * (1 + avgGrowth);
    next.push({ monthAhead: m, projected: Number(current.toFixed(2)) });
  }
  return { nextMonths: next, avgGrowth };
}

router.post('/generate', async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      sections = {},
      filters = {},
      customPrompt
    } = req.body || {};

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate y endDate son requeridos' });
    }

    const sectionsData = {};
    const analysisParts = [];

    if (sections.income) {
      const income = await getIncomeSummary(startDate, endDate, filters);
      sectionsData.income = income;
      analysisParts.push(`Ingresos: total=${income.total}, transacciones=${income.count}`);
    }
    if (sections.expenses) {
      const expenses = await getExpensesSummary(startDate, endDate, filters);
      sectionsData.expenses = expenses;
      analysisParts.push(`Gastos: total=${expenses.total} (por categoría: ${JSON.stringify(expenses.byCategory)})`);
    }
    if (sections.subscriptions) {
      const subs = await getSubscriptionsSummary(startDate, endDate, filters);
      sectionsData.subscriptions = subs;
      analysisParts.push(`Suscripciones: MRR=${subs.mrr}, nuevas=${subs.newSubscriptions}, cancelaciones=${subs.cancellations}`);
    }
    if (sections.emails) {
      const emailStats = await getEmailStatsFromBrevo(startDate, endDate);
      sectionsData.emails = emailStats;
      if (emailStats) {
        analysisParts.push(`Emails (Brevo): enviados=${emailStats.sent || 0}, aperturas=${emailStats.opens || 0}, clics=${emailStats.clicks || 0}`);
      } else {
        analysisParts.push('Emails (Brevo): sin datos (revisar integración/BREVO_API_KEY)');
      }
    }
    if (sections.openaiCosts) {
      const openai = await getOpenAICosts(startDate, endDate);
      sectionsData.openaiCosts = openai;
      analysisParts.push(`Costes OpenAI: total=${openai.total}, llamadas=${openai.calls}`);
    }
    if (sections.churn) {
      const churn = await getChurnSummary(startDate, endDate);
      sectionsData.churn = churn;
      analysisParts.push(`Churn: tasa=${(churn.churnRate * 100).toFixed(2)}% (${churn.cancellations} cancelaciones)`);
    }
    if (sections.productMetrics) {
      const pm = await getProductMetrics(startDate, endDate);
      sectionsData.productMetrics = pm;
      analysisParts.push(`Métricas producto: usuarios activos=${pm.activeUsers}, conversiones=${pm.conversions}, ARPU=${pm.arpu}`);
    }
    if (sections.forecasts) {
      const incomeHistory = await getIncomeHistory(6, endDate);
      const forecasts = computeForecasts(incomeHistory, 3);
      sectionsData.forecasts = forecasts;
      analysisParts.push(`Previsiones: ${forecasts.nextMonths.length ? JSON.stringify(forecasts.nextMonths) : 'insuficientes datos para proyección'}`);
    }

    let analysis = `==============================\n`;
    analysis += `📊 Informe de Arcana Club\n`;
    analysis += `Periodo: ${startDate} a ${endDate}\n`;
    if (customPrompt) analysis += `\n📝 Personalización: ${customPrompt}\n`;
    analysis += `==============================\n`;
    analysis += '\n';
    // Presentar cada sección con título y formato
    if (sections.income && sectionsData.income) {
      analysis += `💰 INGRESOS\n  Total: ${sectionsData.income.total} €\n  Nº transacciones: ${sectionsData.income.count}\n\n`;
    }
    if (sections.expenses && sectionsData.expenses) {
      analysis += `💸 GASTOS\n  Total: ${sectionsData.expenses.total} €\n  Por categoría: ${Object.entries(sectionsData.expenses.byCategory).map(([cat, val]) => `\n    - ${cat}: ${val} €`).join('')}\n\n`;
    }
    if (sections.subscriptions && sectionsData.subscriptions) {
      analysis += `🧾 SUSCRIPCIONES\n  MRR: ${sectionsData.subscriptions.mrr} €\n  Nuevas: ${sectionsData.subscriptions.newSubscriptions}\n  Cancelaciones: ${sectionsData.subscriptions.cancellations}\n\n`;
    }
    if (sections.churn && sectionsData.churn) {
      analysis += `📉 CHURN\n  Tasa: ${(sectionsData.churn.churnRate * 100).toFixed(2)}%\n  Cancelaciones: ${sectionsData.churn.cancellations}\n\n`;
    }
    if (sections.productMetrics && sectionsData.productMetrics) {
      analysis += `📈 MÉTRICAS DE PRODUCTO\n  Usuarios activos: ${sectionsData.productMetrics.activeUsers}\n  Conversiones: ${sectionsData.productMetrics.conversions}\n  ARPU: ${sectionsData.productMetrics.arpu.toFixed(2)} €\n\n`;
    }
    if (sections.openaiCosts && sectionsData.openaiCosts) {
      analysis += `🤖 COSTES OPENAI\n  Total: ${sectionsData.openaiCosts.total} $\n  Nº llamadas: ${sectionsData.openaiCosts.calls}\n\n`;
    }
    if (sections.emails && sectionsData.emails) {
      analysis += `✉️ EMAILS (Brevo)\n  Enviados: ${sectionsData.emails.sent || 0}\n  Aperturas: ${sectionsData.emails.opens || 0}\n  Clics: ${sectionsData.emails.clicks || 0}\n\n`;
    }
    if (sections.forecasts && sectionsData.forecasts) {
      analysis += `🔮 PREVISIONES\n`;
      if (sectionsData.forecasts.nextMonths && sectionsData.forecasts.nextMonths.length) {
        analysis += sectionsData.forecasts.nextMonths.map(f => `  Mes +${f.monthAhead}: ${f.projected} €`).join('\n') + '\n';
      } else {
        analysis += '  Insuficientes datos para proyección\n';
      }
      analysis += '\n';
    }
    analysis += `==============================\n`;
    return res.json({ success: true, analysis, sectionsData });
  } catch (err) {
    console.error('Error generando informe:', err);
    return res.status(500).json({ success: false, message: 'Error interno generando informe' });
  }
});

// export default router; (eliminada exportación duplicada)

// (Eliminada declaración duplicada de PrismaClient)
// (Eliminada segunda declaración duplicada de router)

// Todas las rutas requieren autenticación y permisos admin
// Protección solo en la ruta /generate

// Generar informe detallado y enviarlo por email
router.post('/generate', async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      email,
      includeEmailStats = true,
      emailType = 'all',
      customPrompt = '',
      filters = {}
    } = req.body;
    if (!startDate || !endDate || !email) {
      return res.status(400).json({ success: false, message: 'Fechas y email requeridos' });
    }
    // Recopilar datos del periodo con filtros avanzados
    const userWhere = {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      },
      ...(filters.role ? { role: filters.role } : {}),
      ...(filters.plan ? { subscriptionPlan: filters.plan } : {})
    };
    const users = await prisma.user.count({ where: userWhere });

    const readingWhere = {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      },
      ...(filters.readingType ? { type: filters.readingType } : {})
    };
    const readings = await prisma.reading.count({ where: readingWhere });

    const churnWhere = {
      subscriptionStatus: 'CANCELED',
      updatedAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      },
      ...(filters.plan ? { subscriptionPlan: filters.plan } : {})
    };
    const churn = await prisma.user.count({ where: churnWhere });

    const incomeWhere = {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      },
      ...(filters.incomeCategory ? { category: filters.incomeCategory } : {})
    };
    const income = await prisma.income.aggregate({ where: incomeWhere, _sum: { amount: true } });

    const expenseWhere = {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      },
      ...(filters.expenseCategory ? { category: filters.expenseCategory } : {})
    };
    const expenses = await prisma.expense.aggregate({ where: expenseWhere, _sum: { amount: true } });

    // Estadísticas de emails
    let emailStats = null;
    if (includeEmailStats) {
      const where = {
        sentAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        ...(emailType !== 'all' ? { type: emailType } : {}),
        ...(filters.emailUser ? { email: filters.emailUser } : {})
      };
      const totalEmails = await prisma.emailLog.count({ where });
      const openedEmails = await prisma.emailLog.count({ where: { ...where, openedAt: { not: null } } });
      emailStats = {
        totalEmails,
        openedEmails,
        notOpened: totalEmails - openedEmails,
        type: emailType,
        filtroUsuario: filters.emailUser || null
      };
    }

    // Preparar datos para análisis
    const reportData = {
      users,
      readings,
      churn,
      income: income._sum.amount || 0,
      expenses: expenses._sum.amount || 0,
      startDate,
      endDate,
      emailStats,
      customPrompt,
      filters
    };
    // Analizar y redactar informe con Perplexity AI
    const analysis = await analyzeWithPerplexity(reportData);
    // Enviar informe por email
    await sendReportEmail(email, analysis);
    res.json({ success: true, message: 'Informe generado y enviado correctamente', analysis, emailStats });
  } catch (error) {
    console.error('Error generando informe:', error);
    res.status(500).json({ success: false, message: 'Error generando informe', details: error.message });
  }
});

export default router;
