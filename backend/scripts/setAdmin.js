import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setAdminUser() {
  try {
    // Buscar usuario por email admin
    const adminEmail = 'surik4thor@icloud.com';
    
    const user = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (user) {
      // Actualizar usuario existente a admin con Premium
      const updatedUser = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          role: 'ADMIN',
          subscriptionPlan: 'PREMIUM',
          subscriptionStatus: 'ACTIVE'
        }
      });
      
      console.log('✅ Usuario admin actualizado:', {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        plan: updatedUser.subscriptionPlan,
        status: updatedUser.subscriptionStatus
      });
    } else {
      console.log('❌ Usuario admin no encontrado con email:', adminEmail);
      
      // Mostrar usuarios existentes
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          subscriptionPlan: true,
          subscriptionStatus: true
        }
      });
      
      console.log('Usuarios existentes:');
      users.forEach(u => {
        console.log(`- ${u.email} (${u.role}) - ${u.subscriptionPlan}/${u.subscriptionStatus}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setAdminUser();