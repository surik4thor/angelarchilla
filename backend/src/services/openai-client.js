// Cliente OpenAI configurado para toda la aplicación
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del cliente OpenAI
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuraciones por defecto
export const defaultConfig = {
  model: process.env.OPENAI_MODEL || 'gpt-4',
  temperature: Number(process.env.OPENAI_TEMPERATURE) || 0.8,
  max_tokens: Number(process.env.OPENAI_MAX_TOKENS) || 2000,
};

// Función helper para crear completions con configuración por defecto
export async function createCompletion(messages, customConfig = {}) {
  const config = { ...defaultConfig, ...customConfig };
  
  try {
    const response = await openai.chat.completions.create({
      model: config.model,
      messages: messages,
      temperature: config.temperature,
      max_tokens: config.max_tokens,
    });
    
    return response;
  } catch (error) {
    console.error('Error en OpenAI completion:', error);
    throw error;
  }
}

export default openai;