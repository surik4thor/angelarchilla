import { sendEmail } from '../aiAssistant/emailSender.js';
import { getHoroscopeEmailTemplate } from '../utils/horoscopeEmailTemplate.js';
import dotenv from 'dotenv';
dotenv.config();

const to = process.env.TEST_EMAIL || 'surik4thor@icloud.com';
const subject = 'Prueba plantilla horóscopo';
const html = getHoroscopeEmailTemplate();

sendEmail({ to, subject, html })
  .then(() => {
    console.log('Email de prueba enviado correctamente a', to);
  })
  .catch(err => {
    console.error('Error enviando email de prueba:', err);
    process.exit(1);
  });
