import prisma from '../config/database.js';

// Simulación de validación Bizum
export const validateBizumPayment = async (req, res) => {
  try {
    // Aquí recibirías el comprobante (archivo) o código Bizum
    // const { codigo } = req.body;
    // const comprobante = req.file;
    // Integración real: llamar API Bizum y validar

    // Simulación: aceptar cualquier código/comprobante
    // Actualizar suscripción del usuario
    await prisma.user.update({
      where: { id: req.member.id },
      data: {
        subscriptionPlan: req.body.plan || 'INICIADO',
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiry: null
      }
    });
    res.json({ success: true, message: 'Pago Bizum validado y suscripción activada.' });
  } catch (err) {
    console.error('Error validando Bizum:', err);
    res.status(500).json({ success: false, message: 'Error validando pago Bizum.' });
  }
};
