import { useEffect } from 'react';
import { register } from '../api/auth';

export default function AdminRegister() {
  useEffect(() => {
    register({
  email: 'hola@nebulosamagica.com',
      password: 'y&ho3t5HeGoECgU!DXc8',
      username: 'Admin',
      role: 'ADMIN'
    })
      .then(user => {
        console.log('Admin creado:', user);
        alert('Usuario admin creado correctamente. Puedes eliminar este componente.');
      })
      .catch(err => {
        console.error('Error creando admin:', err);
        alert('Error creando admin: ' + (err?.response?.data?.error || err.message));
      });
  }, []);

  return <div>Creando usuario administrador...</div>;
}
