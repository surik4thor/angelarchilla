import prisma from '../src/config/database.js';
import bcrypt from 'bcryptjs';

async function checkAdmin() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@nebulosamagica.com' }
    });
    
    if (!user) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }
    
    console.log('✅ Usuario admin encontrado:', {
      id: user.id,
      email: user.email,
      role: user.role,
      plan: user.subscriptionPlan,
      status: user.subscriptionStatus
    });
    
    // Verificar contraseña
    const isValid = await bcrypt.compare('Admin2024!', user.password);
    console.log('🔑 Contraseña válida:', isValid);
    
    if (!isValid) {
      console.log('🔄 Actualizando contraseña...');
      const hashedPassword = await bcrypt.hash('Admin2024!', 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      console.log('✅ Contraseña actualizada');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();