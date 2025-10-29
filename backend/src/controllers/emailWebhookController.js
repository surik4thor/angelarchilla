import { logEmail } from '../utils/emailLog.js';
import prisma from '../config/database.js';

// Brevo sends an array of events in the request body
export const brevoWebhookHandler = async (req, res) => {
  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];

    for (const ev of events) {
      const { messageId, event, email, reason, ts } = ev;

      // Create a generic entry in email_log for visibility
      try {
        await prisma.emailLog.create({
          data: {
            externalId: messageId || null,
            email: email || ev?.message?.to || null,
            type: `brevo:${event}`,
            subject: ev?.message?.subject || null,
            sentAt: ts ? new Date(ts * 1000) : new Date(),
            meta: JSON.stringify(ev)
          }
        });
      } catch (e) {
        console.warn('Failed to create emailLog for brevo event', e);
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error handling Brevo webhook', err);
    return res.status(500).json({ success: false, error: 'internal_error' });
  }
};
