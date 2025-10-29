console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY);
console.log('STRIPE_INICIADO_PRICE_ID:', process.env.STRIPE_INICIADO_PRICE_ID);
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY);
console.log('OPENAI_API_URL:', process.env.OPENAI_API_URL);
console.log('OPENAI_MODEL:', process.env.OPENAI_MODEL);
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import Stripe from 'stripe';
import fetch from 'node-fetch';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function testStripeSession() {
  try {
    const priceId = process.env.STRIPE_INICIADO_PRICE_ID;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: 'test@arcanaclub.es',
      success_url: 'http://localhost:5173/profile',
      cancel_url: 'http://localhost:5173/shop'
    });
    console.log('✅ Stripe session created:', session.url);
  } catch (err) {
    console.error('❌ Stripe session error:', err.message);
    if (err.raw) console.error('Stripe raw error:', err.raw);
  }
}

async function testOpenAI() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const apiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
    const model = process.env.OPENAI_MODEL || 'gpt-4';
    const payload = {
      model,
      messages: [
        { role: 'system', content: 'Eres Madame Celestina de Arcana Club. Responde brevemente en español.' },
        { role: 'user', content: 'Di hola' }
      ],
      max_tokens: 50
    };
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`OpenAI API error ${res.status}: ${errorText}`);
    }
    const data = await res.json();
    console.log('✅ OpenAI response:', data.choices[0].message.content);
  } catch (err) {
    console.error('❌ OpenAI error:', err.message);
  }
}

console.log('--- TEST STRIPE SESSION ---');
testStripeSession().then(() => {
  console.log('--- TEST OPENAI ---');
  return testOpenAI();
});
