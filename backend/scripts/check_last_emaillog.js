import dotenv from 'dotenv';
dotenv.config();

import prisma from '../src/config/database.js';

async function main() {
  try {
    const last = await prisma.emailLog.findFirst({
      orderBy: { sentAt: 'desc' }
    });
    if (!last) {
      console.log('No hay entradas en email_log.');
      process.exit(0);
    }
    console.log('Última entrada en email_log:');
    console.log(JSON.stringify(last, null, 2));
  } catch (err) {
    console.error('Error consultando email_log:', err);
    process.exit(2);
  } finally {
    await prisma.$disconnect();
  }
}

main();
