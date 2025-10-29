// Tarea mensual automática: genera informe IA y lo envía por email
import { generateMonthlyReport } from './reportGenerator.js';
import { sendEmail } from './emailSender.js';
import { notifyDiscord } from '../utils/discordNotify.js';
import dotenv from 'dotenv';
dotenv.config();

export async function runMonthlyJob() {
  const report = await generateMonthlyReport();
  await sendEmail({
    to: process.env.ADMIN_EMAILS,
    subject: 'Informe mensual Arcana Club',
    html: `<h2>Informe mensual IA</h2><div>${report}</div>`
  });
  // Enviar resumen a Discord (canal informes)
  try { notifyDiscord('informes', `Informe mensual generado. Resumen: ${String(report).slice(0, 500)}`); } catch (e) { console.error('notify discord monthly job error', e); }
  return report;
}
