import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generarHoroscopoIA(signo, fecha) {
  const prompt = `Genera un horóscopo para el signo ${signo} para la fecha ${fecha}.
Formato JSON ESTRICTO:
{
  "mensaje": "predicción del día (150-200 caracteres)",
  "consejo": "consejo místico (100 caracteres)",
  "numerosSuerte": [número1, número2, número3],
  "colorDia": "solo nombre del color (ejemplo: Azul, Rojo, Verde)"
}

IMPORTANTE: colorDia debe ser SOLO texto simple, NO un objeto.
Tono: místico, positivo, profesional.`;

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: Number(process.env.OPENAI_TEMPERATURE) || 0.7,
    max_tokens: Number(process.env.OPENAI_MAX_TOKENS) || 500,
  });

  const result = JSON.parse(response.choices[0].message.content);
  
  // Asegurar que colorDia sea siempre un string
  if (result.colorDia && typeof result.colorDia === 'object') {
    result.colorDia = result.colorDia.color || Object.values(result.colorDia)[0] || 'Azul';
  }
  
  return result;
}
