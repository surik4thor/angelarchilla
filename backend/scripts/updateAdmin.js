import prisma from '../src/config/database.js';

async function updateAdmin() {
  try {
    const user = await prisma.user.update({
      where: { email: 'admin@nebulosamagica.com' },
      data: { 
        subscriptionPlan: 'PREMIUM',
        subscriptionStatus: 'ACTIVE'
      }
    });
    
    console.log('✅ Admin actualizado:', {
      id: user.id,
      email: user.email,
      role: user.role,
      plan: user.subscriptionPlan,
      status: user.subscriptionStatus
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdmin();