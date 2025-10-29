// Script para automatizar la actualización de campos personalizados en Brevo para todos los usuarios
const prisma = require('../src/config/database.js');
const { updateBrevoContact } = require('../src/utils/updateBrevoContact');

async function main() {
  // Obtén todos los usuarios activos (ajusta el filtro según tu lógica)
  const users = await prisma.user.findMany();
  console.log(`Actualizando ${users.length} usuarios en Brevo...`);

  for (const user of users) {
    // Construye el objeto de atributos según los campos de Brevo
    const attributes = {
      NOMBRE: user.name || '',
      APELLIDOS: user.surname || '',
      SIGNO: user.zodiacSign || '',
      MEMBRESIA: user.subscriptionPlan || '',
      BIRTHDATE: user.birthDate ? user.birthDate.toISOString().split('T')[0] : '',
      EXPIRY_PLAN: user.expiryDate ? user.expiryDate.toISOString().split('T')[0] : '',
      REMINDER_PLAN: user.reminderDate ? user.reminderDate.toISOString().split('T')[0] : '',
      PREMIUM: user.subscriptionPlan === 'PREMIUM',
      LAST_READING: user.lastReading ? user.lastReading.toISOString().split('T')[0] : ''
    };
    await updateBrevoContact(user.email, attributes);
  }
  console.log('Actualización masiva completada.');
}

main().catch(err => {
  console.error('Error en la actualización masiva:', err);
});
