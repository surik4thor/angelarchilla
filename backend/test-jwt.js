import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

console.log('JWT_SECRET from env:', process.env.JWT_SECRET);

// Crear un token con el JWT_SECRET actual
const userId = 'cmhkqwhxf0002jxmd820c1566';
const newToken = jwt.sign(
  { id: userId, role: 'ADMIN' },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('Nuevo token generado:', newToken);

// Verificar el token
try {
  const decoded = jwt.verify(newToken, process.env.JWT_SECRET);
  console.log('✅ Token válido:', decoded);
} catch (error) {
  console.log('❌ Error verificando token:', error.message);
}