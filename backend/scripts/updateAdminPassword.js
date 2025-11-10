import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updateAdminPassword() {
  try {
    const adminEmail = 'surik4thor@icloud.com';
    const newPassword = 'admin123';
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
        subscriptionPlan: 'PREMIUM',
        subscriptionStatus: 'ACTIVE'
      }
    });
    
    console.log('✅ Password actualizada para admin:', adminEmail);
    console.log('   Nueva password:', newPassword);
    console.log('   Role:', updatedUser.role);
    console.log('   Plan:', updatedUser.subscriptionPlan);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword();