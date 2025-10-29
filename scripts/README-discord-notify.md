# Notificaciones automáticas a Discord por canales

## ¿Cómo funciona?

- Cada tipo de evento (registro, informes, suscripciones, analytics, alertas) tiene su propio webhook y canal en Discord.
- Guarda la URL de cada webhook en un archivo:
  - `/etc/nebulosa_discord_webhook_registro.url`
  - `/etc/nebulosa_discord_webhook_informes.url`
  - `/etc/nebulosa_discord_webhook_suscripciones.url`
  - `/etc/nebulosa_discord_webhook_analytics.url`
  - `/etc/nebulosa_discord_webhook_alertas.url`
- El script `discord_notify.js` detecta el canal y envía el mensaje usando el webhook correspondiente.

## Ejemplo de uso en backend (Node.js)
```js
const notifyDiscord = require('./discord_notify');
notifyDiscord('registro', 'Nuevo usuario: email@dominio.com');
notifyDiscord('informes', 'Informe generado: https://...');
notifyDiscord('suscripciones', 'Suscripción activa: email@dominio.com - Plan PRO');
notifyDiscord('analytics', 'Visitas hoy: 1234');
notifyDiscord('alertas', '¡Error crítico en backend!');
```

## Recomendaciones
- Crea los canales en Discord y sus webhooks desde la configuración del canal.
- Guarda cada URL en el archivo correspondiente, solo la URL, sin espacios extra.
- Puedes agregar más tipos de eventos añadiendo nuevas claves en `WEBHOOKS` en `discord_notify.js`.
- Documenta en el README principal cómo agregar nuevos eventos y canales.

## Automatización
- Puedes llamar a `notifyDiscord` desde cualquier parte del backend, scripts, o incluso desde el frontend vía API.
- Los mensajes se envían en tiempo real y quedan organizados por canal.
- Si el webhook falla, revisa permisos del canal y que la URL esté correcta.
