// Tarea automática: revisa alertas y envía email si hay alguna
import { checkAlerts } from './alertManager.js';
import { sendEmail } from './emailSender.js';
import dotenv from 'dotenv';
dotenv.config();
import { notifyDiscord } from '../utils/discordNotify.js';

export async function runAlertJob() {
  const { alerts, iaSummary } = await checkAlerts();
  if (alerts.length === 0) return null;
  await sendEmail({
    to: process.env.ADMIN_EMAILS,
    subject: 'Alerta inteligente Arcana Club',
    html: `<h2>Alertas detectadas</h2><ul>${alerts.map(a => `<li>${a}</li>`).join('')}</ul><h3>Recomendaciones IA</h3><div>${iaSummary}</div>`
  });
  // Notificar en Discord (canal alertas)
  try { notifyDiscord('alertas', `Alertas detectadas: ${alerts.join('; ')}. Recomendaciones: ${iaSummary}`); } catch (e) { console.error('notify discord alert job error', e); }
  return { alerts, iaSummary };
}
