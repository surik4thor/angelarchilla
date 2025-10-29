import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function testOpenAIConnection() {
  console.log('🤖 TESTING OPENAI API CONNECTION');
  console.log('='.repeat(40));

  const apiKey = process.env.OPENAI_API_KEY;
  const apiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
  const model = process.env.OPENAI_MODEL || 'gpt-4';

  console.log('API Key present:', apiKey ? '✅ Yes (length: ' + apiKey.length + ')' : '❌ No');
  console.log('API URL:', apiUrl);
  console.log('Model:', model);

  if (!apiKey) {
    console.log('❌ No API key found');
    return;
  }

  try {
    const payload = {
      model: model,
      messages: [
        { 
          role: 'system', 
          content: 'Eres Madame Celestina de Arcana Club. Responde brevemente en español.' 
        },
        { 
          role: 'user', 
          content: 'Di hola' 
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    };

    console.log('\n📨 Sending test request to OpenAI...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ OpenAI API Error:', response.status, response.statusText);  
      console.log('Error body:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ OpenAI Response received!');
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log('\n💬 AI Response:', data.choices[0].message.content);
      console.log('✅ OpenAI integration is working correctly!');
    }

  } catch (error) {
    console.error('❌ OpenAI Connection Test Failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testOpenAIConnection();