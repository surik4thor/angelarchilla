
import { getSecret } from './secrets.js';
import axios from 'axios';

export async function analyzeWithPerplexity(reportData) {
  let prompt = `Genera un breve informe estadístico para Arcana Club. Usuarios nuevos: ${reportData.users}, gastos: ${reportData.expenses}€, ingresos: ${reportData.income}€. Churn: ${reportData.churn}. Lecturas: ${reportData.readings}.`;
  const response = await askPerplexity({
    model: 'pplx-70b-online',
    messages: [
      { role: 'system', content: 'Eres un analista financiero profesional.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 800,
    temperature: 0.7,
    top_p: 1
  });
  return response.choices?.[0]?.message?.content || '';
}

const PERPLEXITY_API_KEY = getSecret('perplexity_api_key');
const PERPLEXITY_API_URL = getSecret('perplexity_api_url', 'https://api.perplexity.ai/v1/chat/completions');

export async function askPerplexity({ messages, max_tokens = 300, model = 'pplx-70b-online' }) {
  const response = await axios.post(
    PERPLEXITY_API_URL,
    {
      model,
      messages,
      max_tokens,
      temperature: 0.7,
      top_p: 1
    },
    {
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}
