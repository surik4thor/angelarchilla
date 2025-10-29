import prisma from '../config/database.js';

export async function logEmail({ userId, email, type, subject, sentAt }) {
  await prisma.emailLog.create({
    data: {
      userId,
      email,
      type,
      subject,
      sentAt: sentAt || new Date(),
      openedAt: null
    }
  });
}

export async function markEmailOpened(emailLogId) {
  await prisma.emailLog.update({
    where: { id: emailLogId },
    data: { openedAt: new Date() }
  });
}
