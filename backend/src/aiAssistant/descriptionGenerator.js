import OpenAI from 'openai';
import { config } from '../config/config.js';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

export async function generateProductDescription(product) {
  // Prompt para SEO y GEO
  const prompt = `Genera una descripción atractiva y optimizada para SEO y GEO de este producto: ${product.name}. Detalles: ${product.description || ''}`;
  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'Eres un experto en copywriting, SEO y Generative Engine Optimization para e-commerce.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 400
  });
  const aiDescription = response.data.choices[0].message.content;
  // Prompt GEO
  const geoPrompt = `Genera una versión GEO (Generative Engine Optimization) para el producto: ${product.name}. Enfócate en palabras clave locales y regionales.`;
  const geoResponse = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'Eres un experto en GEO y SEO local para tiendas online.' },
      { role: 'user', content: geoPrompt }
    ],
    max_tokens: 400
  });
  const geoDescription = geoResponse.data.choices[0].message.content;
  return { aiDescription, geoDescription };
}
