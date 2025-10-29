// Genera informe IA usando Perplexity y los datos recopilados
import { askPerplexity } from '../utils/perplexity.js';
import { collectPlatformStats } from './dataCollector.js';

export async function generateMonthlyReport() {
  const stats = await collectPlatformStats();
  const prompt = `Eres un gestor profesional. Analiza estos datos de Arcana Club y genera un informe mensual con recomendaciones y alertas:
Usuarios totales: ${stats.totalUsers}
Usuarios nuevos: ${stats.newUsers}
Ingresos: ${stats.totalIncome}€
Gastos: ${stats.totalExpenses}€
Lecturas realizadas: ${stats.totalReadings}
Churn: ${stats.churn}
Usuarios activos: ${stats.activeUsers}
Incluye análisis, tendencias, riesgos y oportunidades. Devuelve el resultado en Markdown estructurado.`;
  const response = await askPerplexity({
    model: 'sonar',
    messages: [
      { role: 'user', content: prompt }
    ],
    max_tokens: 800,
    temperature: 0.7,
    top_p: 1
  });
  return response.choices?.[0]?.message?.content || '';
}
