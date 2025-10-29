// Genera plan comercial y análisis estratégico con Perplexity
import { askPerplexity } from '../utils/perplexity.js';
import { collectPlatformStats } from './dataCollector.js';

export async function generateBusinessPlan() {
  const stats = await collectPlatformStats();
  const prompt = `Eres un consultor de negocios experto en e-commerce y marketing digital. Analiza estos datos de Arcana Club y genera un plan comercial estratégico para el próximo trimestre:
Usuarios totales: ${stats.totalUsers}
Usuarios nuevos: ${stats.newUsers}
Ingresos: ${stats.totalIncome}€
Gastos: ${stats.totalExpenses}€
Lecturas realizadas: ${stats.totalReadings}
Churn: ${stats.churn}
Usuarios activos: ${stats.activeUsers}
Incluye:
- Análisis de situación
- Objetivos comerciales
- Estrategias de marketing y ventas
- Recomendaciones de producto y precios
- Acciones para reducir churn y aumentar retención
- Oportunidades de crecimiento
Devuelve el resultado en Markdown estructurado.`;
  const response = await askPerplexity({
    model: 'sonar',
    messages: [
      { role: 'user', content: prompt }
    ],
    max_tokens: 1200,
    temperature: 0.7,
    top_p: 1
  });
  return response.choices?.[0]?.message?.content || '';
}
