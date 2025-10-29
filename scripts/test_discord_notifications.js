// Script de pruebas: envía mensajes de prueba a todos los canales Discord configurados
const { notifyDiscord } = require('../backend/src/utils/discordNotify.js');

function runTests() {
  console.log('Enviando prueba a registro...');
  notifyDiscord('registro', 'Prueba automática: nuevo registro');
  console.log('Enviando prueba a informes...');
  notifyDiscord('informes', 'Prueba automática: informe mensual');
  console.log('Enviando prueba a suscripciones...');
  notifyDiscord('suscripciones', 'Prueba automática: suscripción nueva');
  console.log('Enviando prueba a analytics...');
  notifyDiscord('analytics', 'Prueba automática: analytics resumen');
  console.log('Enviando prueba a alertas...');
  notifyDiscord('alertas', 'Prueba automática: alerta crítica');
  console.log('Pruebas enviadas (async). Revisa los canales Discord.');
}

runTests();
