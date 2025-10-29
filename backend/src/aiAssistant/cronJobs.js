// src/aiAssistant/cronJobs.js
import cron from 'node-cron';
import { runMonthlyJob } from './monthlyJob.js';
import { runAlertJob } from './alertJob.js';

// Ejecuta el informe mensual el día 1 de cada mes a las 09:00
cron.schedule('0 9 1 * *', async () => {
  console.log('[CRON] Ejecutando informe mensual IA...');
  await runMonthlyJob();
});

// Ejecuta las alertas inteligentes todos los lunes a las 10:00
cron.schedule('0 10 * * 1', async () => {
  console.log('[CRON] Ejecutando alertas inteligentes IA...');
  await runAlertJob();
});

// Puedes añadir más tareas programadas aquí si lo necesitas
// Publicar horóscopo diario en Twitter/X cada día a las 8:00
import { exec } from 'child_process';
cron.schedule('0 8 * * *', () => {
  exec('node src/scripts/publishDailyHoroscope.js', (err, stdout, stderr) => {
    if (err) console.error('Error publicando horóscopo diario en Twitter:', err);
    else console.log('Horóscopo diario publicado en Twitter:', stdout);
    if (stderr) console.error('stderr:', stderr);
  });
});

console.log('[CRON] Tareas programadas IA activas.');
