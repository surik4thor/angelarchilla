// Utilidad para enviar notificaciones a Discord desde Node.js
// Permite usar diferentes webhooks (canales) para cada tipo de evento

import https from 'https';
import fs from 'fs';

const WEBHOOKS = {
  registro: '/etc/nebulosa_discord_webhook_registro.url',
  informes: '/etc/nebulosa_discord_webhook_informes.url',
  suscripciones: '/etc/nebulosa_discord_webhook_suscripciones.url',
  analytics: '/etc/nebulosa_discord_webhook_analytics.url',
  alertas: '/etc/nebulosa_discord_webhook_alertas.url',
};

export function notifyDiscord(tipo, mensaje) {
  const webhookFile = WEBHOOKS[tipo];
  if (!webhookFile) {
    console.error('Tipo de canal Discord no soportado:', tipo);
    return;
  }
  if (!fs.existsSync(webhookFile)) {
    console.error('Webhook file no existe:', webhookFile);
    return;
  }
  const url = fs.readFileSync(webhookFile, 'utf8').trim();
  if (!url) {
    console.error('Webhook URL vacío');
    return;
  }
  // Validar mensaje
  if (typeof mensaje !== 'string' || mensaje.length > 2000) {
    console.error('Mensaje inválido para Discord');
    return;
  }
  const data = JSON.stringify({ content: mensaje });
  const req = https.request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }, (res) => {
    if (res.statusCode < 200 || res.statusCode >= 300) {
      console.error('Error enviando a Discord:', res.statusCode);
    }
  });
  req.on('error', (err) => {
    console.error('Error en petición Discord:', err);
  });
  req.write(data);
  req.end();
}




/*
Ejemplo de uso:
import { notifyDiscord } from './discord_notify.js';
notifyDiscord('registro', 'Nuevo usuario: email@dominio.com');
notifyDiscord('informes', 'Informe generado: https://...');
notifyDiscord('suscripciones', 'Suscripción activa: email@dominio.com - Plan PRO');
notifyDiscord('analytics', 'Visitas hoy: 1234');
notifyDiscord('alertas', '¡Error crítico en backend!');
*/
