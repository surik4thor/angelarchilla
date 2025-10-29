// Genera alertas inteligentes según reglas de negocio
import { collectPlatformStats } from './dataCollector.js';
import { askPerplexity } from '../utils/perplexity.js';

const RULES = [
  stats => stats.churn > 5 ? 'Alerta: El churn supera el umbral recomendado.' : null,
  stats => stats.totalIncome < stats.totalExpenses ? 'Alerta: Los gastos superan los ingresos.' : null,
  stats => stats.activeUsers < 10 ? 'Alerta: Baja actividad de usuarios.' : null
];

export async function checkAlerts() {
  const stats = await collectPlatformStats();
  const triggered = RULES.map(rule => rule(stats)).filter(Boolean);
  if (triggered.length === 0) return [];
  // Genera resumen IA de las alertas
  const prompt = `Eres un gestor profesional. Resume y recomienda acciones para estas alertas detectadas en Arcana Club:
${triggered.join('\n')}`;
  const response = await askPerplexity({
    model: 'sonar',
    messages: [
      { role: 'user', content: prompt }
    ],
    max_tokens: 400,
    temperature: 0.7,
    top_p: 1
  });
  return {
    alerts: triggered,
    iaSummary: response.choices?.[0]?.message?.content || ''
  };
}
