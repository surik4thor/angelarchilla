// Script para crear usuario administrador
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔐 Creando usuario administrador...');
    
    // Verificar si ya existe un admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (existingAdmin) {
      console.log('⚠️ Ya existe un usuario administrador:', existingAdmin.email);
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Username:', existingAdmin.username);
      console.log('🔑 Role:', existingAdmin.role);
      return;
    }
    
    // Crear hash de la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Crear usuario admin
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@nebulosamagica.com',
        username: 'admin',
        password: hashedPassword,
        role: 'ADMIN',
        subscriptionPlan: 'MAESTRO',
        subscriptionStatus: 'ACTIVE'
      }
    });
    
    console.log('✅ Usuario administrador creado exitosamente!');
    console.log('📧 Email: admin@nebulosamagica.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Username: admin');
    console.log('🎯 Role: admin');
    console.log('🔗 Login: http://localhost:5173/login');
    console.log('🔗 Admin Panel: http://localhost:5173/admin');
    
  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
    
    if (error.code === 'P2002') {
      console.log('⚠️ El usuario ya existe. Intentando actualizar...');
      
      try {
        const updatedUser = await prisma.user.update({
          where: { email: 'admin@nebulosamagica.com' },
          data: { 
            role: 'ADMIN',
            password: await bcrypt.hash('admin123', 12)
          }
        });
        
        console.log('✅ Usuario admin actualizado!');
        console.log('📧 Email: admin@nebulosamagica.com');
        console.log('🔑 Password: admin123');
        
      } catch (updateError) {
        console.error('❌ Error actualizando usuario:', updateError);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar script
createAdminUser();