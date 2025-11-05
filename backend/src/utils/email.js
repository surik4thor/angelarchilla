// Import único de la SDK de Brevo
import SibApiV3Sdk from 'sib-api-v3-sdk';

// Configuración de la API Key
const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  throw new Error('Falta la API Key de Brevo en el .env (BREVO_API_KEY)');
}
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKeyInstance = defaultClient.authentications['api-key'];
apiKeyInstance.apiKey = apiKey;

// Instancia de los APIs de Brevo
const contactsApi = new SibApiV3Sdk.ContactsApi();
const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Elimina completamente el contacto de Brevo
 * @param {string} email
 */
async function deleteContactFromBrevo(email) {
  try {
    await contactsApi.deleteContact(email);
  } catch (err) {
    if (err.response?.body?.code === 'document_not_found') {
      return;
    }
    throw err;
  }
}

/**
 * Envía email de doble opt-in tras suscripción
 * @param {string} email
 */
async function sendDoubleOptIn(email) {
  const subject = 'Confirma tu suscripción a Arcana Club';
  const html = `
    <div style="font-family:sans-serif;padding:2em;">
      <h2>¡Confirma tu suscripción!</h2>
      <p>Haz clic en el enlace para validar tu email:</p>
      <p>
        <a href="https://nebulosamagica.com/newsletter/confirmar?email=${encodeURIComponent(email)}"
           style="background:#635bff;color:#fff;padding:1em 2em;border-radius:8px;text-decoration:none;">
          Confirmar suscripción
        </a>
      </p>
      <p>Si no solicitaste esta suscripción, ignora este mensaje.</p>
      <p>Equipo Nebulosa Mágica</p>
    </div>
  `;
  await sendReportEmail(email, { subject, html });
}

/**
 * Añade el email a la lista Brevo adecuada
 * @param {string} email
 * @param {object} [user]
 */
async function addContactToNewsletter(email, user = null) {
  let listId = 2; // Lista Newsletter (anónimos)
  if (user) {
    if (user.subscriptionStatus === 'ACTIVE' && user.subscriptionPlan !== 'INVITADO') {
      listId = user.subscriptionPlan === 'MAESTRO' ? 5 : 4;
    } else {
      listId = 3;
    }
  }

  // Crear contacto si no existe
  try {
    await contactsApi.createContact({ email });
  } catch (err) {
    if (err.response?.body?.code !== 'duplicate_parameter') {
      throw err;
    }
  }

  // Añadir a la lista
  await contactsApi.addContactToList(Number(listId), { emails: [email] });
}

/**
 * Envía un email transaccional usando Brevo
 * @param {string|string[]} to
 * @param {object} options
 */
async function sendReportEmail(to, options) {
  let subject, html, text, templateId, params;
  if (typeof options === 'string') {
    subject = options;
  } else {
    ({ subject, html, text, templateId, params } = options);
  }

  const sender = process.env.EMAIL_FROM
    ? { email: process.env.EMAIL_FROM, name: process.env.EMAIL_FROM_NAME || 'Oráculo de la Nebulosa Mágica' }
    : undefined;

  const emailData = {
    sender,
    to: Array.isArray(to)
      ? to.map(email => ({ email }))
      : [{ email: to }],
    subject,
    htmlContent: html,
    textContent: text,
    templateId,
    params
  };

  // Eliminar campos undefined
  Object.keys(emailData).forEach(key => {
    if (emailData[key] === undefined) delete emailData[key];
  });

  return emailApi.sendTransacEmail(emailData);
}

/**
 * Elimina un contacto de una lista
 * @param {string} email
 * @param {number} listId
 */
async function removeContactFromList(email, listId) {
  return contactsApi.removeContactFromList(listId, { emails: [email] });
}

/**
 * Envía email de recuperación de contraseña
 * @param {string} email - Email del usuario
 * @param {string} resetToken - Token de reset
 * @param {string} username - Nombre del usuario (opcional)
 */
async function sendPasswordResetEmail(email, resetToken, username = '') {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const subject = '🔐 Recuperar contraseña - Nebulosa Mágica';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #e2e8f0; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 20px;">
          🔮
        </div>
        <h1 style="color: #e2e8f0; margin: 0; font-size: 28px;">Nebulosa Mágica</h1>
        <p style="color: #94a3b8; margin: 5px 0 0 0;">Recuperación de Contraseña</p>
      </div>
      
      <div style="background-color: #1e293b; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #f1f5f9; margin-top: 0; margin-bottom: 20px;">🔐 Restablecer tu contraseña</h2>
        
        ${username ? `<p style="color: #cbd5e1; margin-bottom: 20px;">Hola ${username},</p>` : ''}
        
        <p style="color: #cbd5e1; line-height: 1.6; margin-bottom: 20px;">
          Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Nebulosa Mágica. 
          Si fuiste tú quien hizo esta solicitud, haz clic en el botón de abajo para crear una nueva contraseña.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);">
            🔑 Restablecer Contraseña
          </a>
        </div>
        
        <div style="background-color: #0f172a; padding: 20px; border-radius: 6px; border-left: 4px solid #f59e0b;">
          <p style="color: #f59e0b; margin: 0; font-weight: bold;">⚠️ Importante:</p>
          <ul style="color: #cbd5e1; margin: 10px 0 0 20px;">
            <li>Este enlace expira en <strong>1 hora</strong></li>
            <li>Solo puedes usarlo una vez</li>
            <li>Si no solicitaste este cambio, ignora este email</li>
          </ul>
        </div>
      </div>
      
      <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p style="color: #94a3b8; font-size: 14px; margin: 0;">
          <strong>¿No funciona el botón?</strong><br>
          Copia y pega este enlace en tu navegador:<br>
          <span style="color: #6366f1; word-break: break-all;">${resetUrl}</span>
        </p>
      </div>
      
      <div style="text-align: center; color: #64748b; font-size: 14px;">
        <p style="margin: 0;">
          Si tienes problemas, contacta con nosotros en<br>
          <a href="mailto:soporte@nebulosamagica.com" style="color: #6366f1;">soporte@nebulosamagica.com</a>
        </p>
        <p style="margin: 20px 0 0 0; color: #475569;">
          © ${new Date().getFullYear()} Nebulosa Mágica - Tu guía espiritual digital
        </p>
      </div>
    </div>
  `;

  try {
    await emailApi.sendTransacEmail({
      sender: {
        name: 'Nebulosa Mágica',
        email: process.env.EMAIL_FROM || 'noreply@nebulosamagica.com'
      },
      to: [{ email, name: username || email }],
      subject,
      htmlContent: html
    });
    
    console.log(`Email de recuperación enviado a: ${email}`);
    return true;
  } catch (error) {
    console.error('Error enviando email de recuperación:', error);
    throw new Error('No se pudo enviar el email de recuperación');
  }
}

// Exportar funciones
export {
  deleteContactFromBrevo,
  sendDoubleOptIn,
  addContactToNewsletter,
  sendReportEmail,
  removeContactFromList,
  sendPasswordResetEmail
};