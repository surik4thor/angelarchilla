import prisma from '../prismaClient.js';
import { askPerplexity } from '../utils/perplexity.js';

export async function getObjetivosPropuestos() {
  // Recopilar datos históricos relevantes
  const ventas = await prisma.payment.aggregate({ _sum: { amount: true } });
  const suscriptores = await prisma.user.count({ where: { subscriptionPlan: { not: 'INVITADO' } } });
  const lecturas = await prisma.reading.count();

  // Construir prompt para IA
  const prompt = `Eres un analista de negocio para Arcana Club. Sugiere objetivos realistas para el próximo mes basados en los siguientes datos:\nVentas totales: ${ventas._sum.amount || 0}€\nSuscriptores activos: ${suscriptores}\nLecturas realizadas: ${lecturas}\nProporciona metas para ventas, suscriptores y lecturas en formato JSON con clave, valor, descripción y periodo.`;

  // Llamada a Perplexity AI
  const response = await askPerplexity({
    model: 'pplx-70b-online',
    messages: [
      { role: 'system', content: 'Eres un analista de negocio experto.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 300
  });

  // Parsear respuesta
  const text = response.choices?.[0]?.message?.content || '';
  let objetivos;
  try {
    objetivos = JSON.parse(text);
  } catch {
    objetivos = [];
  }
  return objetivos;
}
