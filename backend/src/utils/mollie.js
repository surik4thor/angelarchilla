import { getSecret } from './secrets.js';
// backend/src/utils/mollie.js
// Utilidades para pagos con Mollie
import { getSecret } from './secrets.js';

export const mollieApiKey = getSecret('mollie_api_key', '');

// Función placeholder para crear pagos con Mollie
export const createMolliePayment = async ({ amount, currency, description, redirectUrl }) => {
  // Aquí iría la lógica real con el SDK de Mollie
  // Por ahora solo retorna un objeto simulado
  return {
    success: false,
    message: 'Mollie no está configurado aún',
    paymentUrl: null
  };
};