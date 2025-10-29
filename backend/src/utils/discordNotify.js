import https from 'https';
import logger from './logger.js';
import fs from 'fs';

const WEBHOOK_FILES = {
  registro: '/etc/nebulosa_discord_webhook_registro.url',
  informes: '/etc/nebulosa_discord_webhook_informes.url',
  suscripciones: '/etc/nebulosa_discord_webhook_suscripciones.url',
  analytics: '/etc/nebulosa_discord_webhook_analytics.url',
  alertas: '/etc/nebulosa_discord_webhook_alertas.url'
};

export function notifyDiscord(type, message) {
  try {
    const file = WEBHOOK_FILES[type];
    if (!file) return;
    if (!fs.existsSync(file)) return;
    const url = fs.readFileSync(file, 'utf8').trim();
    if (!url) return;
    // Validar mensaje
    if (typeof message !== 'string' || message.length > 2000) {
  logger.warn('Mensaje inválido para Discord');
      return;
    }
    const data = JSON.stringify({ content: message });
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
  logger.error('Error enviando a Discord', { statusCode: res.statusCode });
      }
    });
    req.on('error', (err) => {
      logger.error('Error en petición Discord', { err });
    });
    req.write(data);
    req.end();
  } catch (e) {
  logger.error('notifyDiscord failed', { error: e });
  }
}
