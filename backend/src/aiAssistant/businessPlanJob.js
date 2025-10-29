// Tarea manual/admin para generar y enviar plan comercial IA
import { generateBusinessPlan } from './businessPlanGenerator.js';
import { sendEmail } from './emailSender.js';
import { notifyDiscord } from '../utils/discordNotify.js';
import dotenv from 'dotenv';
dotenv.config();

export async function runBusinessPlanJob() {
  const plan = await generateBusinessPlan();
  await sendEmail({
    to: process.env.ADMIN_EMAILS,
    subject: 'Plan comercial IA Arcana Club',
    html: `<h2>Plan comercial IA</h2><div>${plan}</div>`
  });
  try { notifyDiscord('informes', `Plan comercial generado. Resumen: ${String(plan).slice(0, 500)}`); } catch (e) { console.error('notify discord business plan job error', e); }
  return plan;
}
