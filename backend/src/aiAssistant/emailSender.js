import { getHoroscopeEmailTemplate } from '../utils/horoscopeEmailTemplate.js';
// Envío de emails automáticos con Brevo
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// Si el parámetro html es 'HOROSCOPE_TEMPLATE', usa la plantilla del archivo
export async function sendEmail({ to, subject, html }) {
  let htmlContent = html;
  if (html === 'HOROSCOPE_TEMPLATE') {
    htmlContent = getHoroscopeEmailTemplate();
  }
  await transporter.sendMail({
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html: htmlContent
  });
}


// Bloque de prueba directa para ejecución manual
if (process.argv.includes('--test-send')) {
  (async () => {
    const testEmail = process.env.TEST_EMAIL || process.env.EMAIL_USER;
    const testSubject = 'Prueba plantilla horóscopo';
    const testHtml = 'HOROSCOPE_TEMPLATE';
    try {
      await sendEmail({
        to: testEmail,
        subject: testSubject,
        html: testHtml
      });
      console.log('✅ Email de prueba enviado correctamente a', testEmail);
    } catch (err) {
      console.error('❌ Error al enviar email de prueba:', err);
    }
  })();
}

