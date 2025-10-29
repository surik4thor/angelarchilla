import { removeContactFromList, deleteContactFromBrevo, addContactToNewsletter, sendDoubleOptIn, sendReportEmail } from '../utils/email.js';
import prisma from '../config/database.js';
import express from 'express';
import { registrarConsentimientoNewsletter, getNewsletterStatus, unsubscribeNewsletter } from '../controllers/newsletterController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Endpoint para baja de newsletter (sin auth, para baja directa desde perfil)
router.post('/unsubscribe', async (req, res) => {
	const { email } = req.body;
	if (!email) return res.status(400).json({ success: false, error: 'Email requerido' });
		try {
			// Quitar de lista Brevo
				// Eliminar de todas las listas relevantes en Brevo
				const listIds = [
					process.env.BREVO_NEWSLETTER_LIST_ID,
					process.env.BREVO_REGISTRADOS_LIST_ID,
					process.env.BREVO_SUSCRITOS_LIST_ID,
					process.env.BREVO_MAESTRO_LIST_ID
				].filter(Boolean);
				for (const listId of listIds) {
					try {
						await brevo.removeContactFromList(email, listId);
					} catch (err) {
						// Si el error es que el contacto ya fue eliminado/no existe, responder igualmente éxito
						if (err?.response?.body?.code === 'invalid_parameter') {
							// Log opcional: console.warn(`Contacto ya eliminado/no existe en lista ${listId}`);
						} else {
							throw err;
						}
					}
				}
			// Actualizar usuario en BD
			const userFound = await prisma.user.findUnique({ where: { email } });
			if (userFound) await prisma.user.update({ where: { email }, data: { newsletter: false } });
			// Registrar consentimiento de baja
				await prisma.consentimientoNewsletter.create({
					data: {
						email,
						user: userFound ? { connect: { id: userFound.id } } : undefined,
						acceptedAt: new Date(),
						ip: req.ip,
						acceptedLegal: true,
						acceptedNewsletter: false
					}
				});
			res.json({ success: true });
		} catch (e) {
			console.error('Error en /newsletter/unsubscribe:', e);
			res.status(500).json({ success: false, error: e.message || 'Error al procesar la baja' });
		}
});

// Endpoint público para suscripción anónima desde el overlay
router.post('/subscribe', async (req, res) => {
		console.log('POST /api/newsletter/subscribe', { body: req.body });
	const { email } = req.body;
	if (!email) return res.status(400).json({ success: false, error: 'Email requerido' });
		try {
			// Buscar usuario por email
			const userFound = await prisma.user.findUnique({ where: { email } });

			// Crear registro de consentimiento si no existe
			await prisma.consentimientoNewsletter.create({
				data: {
					email,
					user: userFound ? { connect: { id: userFound.id } } : undefined,
					acceptedAt: new Date(),
					ip: req.ip,
					acceptedLegal: true,
					acceptedNewsletter: true
				}
			});

			// Sincronizar con Brevo (añadir contacto a lista)
			try {
				await addContactToNewsletter(email, userFound || null);
			} catch (err) {
				console.warn('addContactToNewsletter falló pero se continúa:', err?.message || err);
			}

			// Enviar email con plantilla horóscopo
			try {
				const { getHoroscopeEmailTemplate } = await import('../utils/horoscopeEmailTemplate.js');
				const { sendReportEmail } = await import('../utils/email.js');
				const html = getHoroscopeEmailTemplate();
				await sendReportEmail(email, {
					subject: '¡Bienvenido/a a la newsletter de Nebulosa Mágica!',
					html
				});
			} catch (e) {
				console.warn('Error enviando email de horóscopo:', e?.message || e);
			}

			// Notificar a Discord (canal de suscripciones)
			try {
				const { notifyDiscord } = await import('../utils/discordNotify.js');
				notifyDiscord('suscripciones', `Nueva suscripción: ${email}`);
			} catch (e) {
				console.warn('notifyDiscord fallo:', e?.message || e);
			}

			return res.json({ success: true });
		} catch (e) {
			logger.error('Error en /newsletter/subscribe', { error: e, body: req.body });
			let errorMsg = 'Error interno';
			if (e.code === 'P2002') {
				errorMsg = 'El email ya está suscrito.';
			} else if (e.message) {
				errorMsg = e.message;
			}
			return res.status(500).json({ success: false, error: errorMsg });
		}
});

// Endpoint para registrar consentimiento de newsletter/promociones
router.post('/consentimiento-newsletter', optionalAuth, registrarConsentimientoNewsletter);

// Estado de suscripción a newsletter
router.get('/estado', optionalAuth, getNewsletterStatus);

// Baja de la newsletter
router.post('/baja', optionalAuth, unsubscribeNewsletter);

export default router;
