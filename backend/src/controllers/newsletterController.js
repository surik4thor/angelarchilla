import { addContactToNewsletter, sendDoubleOptIn } from '../utils/email.js';
/**
 * Obtiene el estado de suscripción a newsletter del usuario autenticado
 */
export async function getNewsletterStatus(req, res) {
  try {
    if (!req.member) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    const consentimiento = await prisma.consentimientoNewsletter.findFirst({
      where: { user: { id: req.member.id } },
      orderBy: { acceptedAt: 'desc' }
    });
    return res.json({ subscribed: !!consentimiento, consentimiento });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Da de baja al usuario de la newsletter y sincroniza con Brevo
 */
export async function unsubscribeNewsletter(req, res) {
  try {
    if (!req.member) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    // Eliminar consentimiento en BD
    await prisma.consentimientoNewsletter.deleteMany({ where: { userId: req.member.id } });

    // Llamada real a la API de Brevo para desuscribir solo de la lista de newsletter
    try {
      const SibApiV3Sdk = require('sib-api-v3-sdk');
      const apiKey = process.env.BREVO_API_KEY;
      const listId = process.env.BREVO_NEWSLETTER_LIST_ID;
      const defaultClient = SibApiV3Sdk.ApiClient.instance;
      defaultClient.authentications['api-key'].apiKey = apiKey;
      const contactsApi = new SibApiV3Sdk.ContactsApi();
      const email = req.member.email;
      await contactsApi.removeContactFromList(Number(listId), { emails: [email] });
    } catch (err) {
      // Si falla la llamada a Brevo, solo loguea el error pero no bloquea la baja legal
      console.error('Error al desuscribir en Brevo:', err.message);
    }
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Registra el consentimiento de newsletter/promociones
 * @param {Object} req Express request
 * @param {Object} res Express response
 */
export async function registrarConsentimientoNewsletter(req, res) {
  try {
  let email = req.body.email;
  let userId = req.body.userId;
  // Log para depuración de usuario autenticado y body
  console.log('req.member en consentimiento:', req.member);
  console.log('Body recibido:', req.body);
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Si el usuario está autenticado, usar sus datos
    if (req.member) {
      userId = req.member.id;
      email = req.member.email;
    }

    if (!email) {
      return res.status(400).json({ error: 'Email es obligatorio' });
    }

    // Actualizar campo newsletter en usuario
    if (userId) {
      await prisma.user.update({ where: { id: userId }, data: { newsletter: true } });
    } else {
      const userFound = await prisma.user.findUnique({ where: { email } });
      if (userFound) await prisma.user.update({ where: { email }, data: { newsletter: true } });
    }
    // Registrar consentimiento
    let consentimientoData = {
      email,
      ip,
      acceptedAt: new Date(),
      acceptedLegal: true,
      acceptedNewsletter: true
    };
    if (userId) {
      consentimientoData.user = { connect: { id: userId } };
    }
    const consentimiento = await prisma.consentimientoNewsletter.create({ data: consentimientoData });
    // Añadir el email a la lista de Brevo según tipo de usuario
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else {
      user = await prisma.user.findUnique({ where: { email } });
    }
    try {
      await addContactToNewsletter(email, user);
      await sendDoubleOptIn(email);
    } catch (err) {
      console.error('Error al añadir email a Brevo o enviar doble opt-in:', err.message);
    }
    return res.status(201).json({ ok: true, consentimiento });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
