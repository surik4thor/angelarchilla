import fetch from 'node-fetch';

const API_KEY = process.env.BREVO_API_KEY;
const TO_EMAIL = process.env.TEST_EMAIL;

if (!API_KEY) {
  console.error('Set BREVO_API_KEY env var to run this test');
  process.exit(1);
}
if (!TO_EMAIL) {
  console.error('Set TEST_EMAIL env var to run this test (recipient)');
  process.exit(1);
}

async function sendTest() {
  const url = 'https://api.brevo.com/v3/smtp/email';
  const body = {
    sender: { name: process.env.BREVO_SENDER_NAME || 'Reino Místico', email: process.env.BREVO_SENDER_EMAIL || 'no-reply@example.com' },
    to: [{ email: TO_EMAIL }],
    subject: 'Prueba de envío Brevo - Reino Místico',
    htmlContent: `<html><body><h1>Prueba Brevo</h1><p>Si recibes este correo, la integración con Brevo funciona.</p></body></html>`
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': API_KEY
    },
    body: JSON.stringify(body)
  });

  const json = await res.json().catch(() => null);
  if (res.ok) {
    console.log('Email enviado correctamente. Response:', json);
  } else {
    console.error('Error enviando email:', res.status, json);
    process.exit(1);
  }
}

sendTest();
