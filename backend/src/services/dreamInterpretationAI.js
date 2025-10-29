// Servicio para interpretar sueños con IA (OpenAI)
import axios from 'axios';

export async function interpretDreamAI({ text, feelings }) {
  // Aquí deberías poner tu clave y endpoint de OpenAI o el modelo que uses
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  const prompt = `Interpreta el siguiente sueño de forma profunda y espiritual. Sueño: "${text}". Sensaciones: ${feelings || 'No especificadas'}`;

  const response = await axios.post(endpoint, {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'Eres un experto en interpretación de sueños y espiritualidad.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 300,
    temperature: 0.7
  }, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data.choices[0].message.content;
}
