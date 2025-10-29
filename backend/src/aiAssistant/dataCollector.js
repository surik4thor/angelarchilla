// Recopila métricas clave de la plataforma
import { prisma } from '../prismaClient.js';

export async function collectPlatformStats() {
  // Usuarios
  const totalUsers = await prisma.users.count();
  const newUsers = await prisma.users.count({ where: { createdAt: { gte: new Date(Date.now() - 30*24*60*60*1000) } } });
  // Ingresos y gastos
  const totalIncome = await prisma.transactions.aggregate({ _sum: { amount: true }, where: { type: 'income' } });
  const totalExpenses = await prisma.transactions.aggregate({ _sum: { amount: true }, where: { type: 'expense' } });
  // Lecturas
  const totalReadings = await prisma.readings.count();
  // Churn
  const churn = await prisma.users.count({ where: { subscriptionStatus: 'CANCELLED' } });
  // Actividad
  const activeUsers = await prisma.users.count({ where: { lastLogin: { gte: new Date(Date.now() - 7*24*60*60*1000) } } });

  return {
    totalUsers,
    newUsers,
    totalIncome: totalIncome._sum.amount || 0,
    totalExpenses: totalExpenses._sum.amount || 0,
    totalReadings,
    churn,
    activeUsers
  };
}
