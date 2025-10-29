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

// Exportar funciones
export {
  deleteContactFromBrevo,
  sendDoubleOptIn,
  addContactToNewsletter,
  sendReportEmail,
  removeContactFromList
};