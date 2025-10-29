import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const adminEmail = 'surik4thor@icloud.com';
    const adminPassword = 'admin123456'; // Cambiar en producción
    
    // Verificar si ya existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (existingAdmin) {
      console.log('✅ Usuario admin ya existe:', adminEmail);
      
      // Actualizar para asegurar que tiene rol SUPER_ADMIN
      await prisma.user.update({
        where: { email: adminEmail },
        data: { 
        role: 'ADMIN',
        subscriptionPlan: 'MAESTRO',
          subscriptionStatus: 'ACTIVE'
        }
      });
      
      console.log('✅ Rol actualizado a SUPER_ADMIN');
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    // Crear admin
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        username: 'Admin',
      role: 'ADMIN',
                subscriptionPlan: 'MAESTRO',
        subscriptionStatus: 'ACTIVE',
        readingsThisMonth: 0,
        createdAt: new Date(),
        lastLogin: new Date()
      }
    });
    
    console.log('✅ Usuario admin creado exitosamente:');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', adminPassword);
    console.log('👑 Role:', admin.role);
    console.log('💎 Plan:', admin.subscriptionPlan);
    
  } catch (error) {
    console.error('❌ Error creando admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();