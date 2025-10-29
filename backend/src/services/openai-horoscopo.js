import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generarHoroscopoIA(signo, fecha) {
  const prompt = `Genera un horóscopo completo y detallado para el signo ${signo} para la fecha ${fecha}.\nDebe incluir:\n- Predicción general del día (150-200 caracteres)\n- Consejo místico personalizado (100 caracteres)\n- 3 números de la suerte (entre 1-50)\n- Un color del día con su significado\nTono: místico, positivo, profesional y poético.\nFormato: JSON con campos: mensaje, consejo, numerosSuerte (array), colorDia`;

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: Number(process.env.OPENAI_TEMPERATURE) || 0.7,
    max_tokens: Number(process.env.OPENAI_MAX_TOKENS) || 500,
  });

  return JSON.parse(response.choices[0].message.content);
}
