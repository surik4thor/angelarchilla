import { PrismaClient } from '@prisma/client';
import { hashPassword } from './src/utils/auth.js';

const prisma = new PrismaClient();

async function checkAndCreateUser() {
  try {
    // Verificar si existe algún usuario
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true }
    });
    
    console.log('Usuarios existentes:', users);
    
    // Si no hay usuarios, crear uno de prueba
    if (users.length === 0) {
      console.log('Creando usuario admin de prueba...');
      const hashedPassword = await hashPassword('admin123');
      
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@nebulosamagica.com',
          password: hashedPassword,
          role: 'ADMIN',
          subscriptionPlan: 'PREMIUM',
          subscriptionStatus: 'ACTIVE'
        }
      });
      
      console.log('Usuario admin creado:', adminUser);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateUser();