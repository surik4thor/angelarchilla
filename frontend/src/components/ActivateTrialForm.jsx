import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import api from '../api/apiClient.js';

export default function ActivateTrialForm() {
  const { user, setUser } = useAuth();
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { data } = await api.post(`/admin/users/${user.id}/activate-trial`, { coupon });
      if (data.success) {
        setMessage('¡Periodo de prueba activado! Disfruta tu experiencia premium durante 7 días.');
        if (data.user) setUser(data.user);
      } else {
        setMessage(data.message || 'No se pudo activar el periodo de prueba');
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.includes('Cupón inválido')) {
        setMessage('El cupón es inválido o ya fue usado. Solicita uno nuevo a tu influencer.');
      } else if (msg?.includes('El usuario ya ha disfrutado')) {
        setMessage('Ya has utilizado tu periodo de prueba anteriormente. ¡Únete al club para más beneficios!');
      } else {
        setMessage(msg || 'Error al activar el periodo de prueba');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="activate-trial-form" onSubmit={handleSubmit} style={{margin:'2em 0',padding:'1.5em',background:'#232946',borderRadius:10}}>
      <h3 style={{color:'#eebc1d'}}>¿Tienes un cupón de influencer?</h3>
      <input
        type="text"
        value={coupon}
        onChange={e => setCoupon(e.target.value)}
        placeholder="Introduce tu cupón aquí"
        style={{padding:'0.7em',fontSize:'1.1em',borderRadius:6,border:'1px solid #eebc1d',marginBottom:'1em',width:'100%'}}
        required
      />
      <button type="submit" disabled={loading} style={{background:'#eebc1d',color:'#232946',fontWeight:'bold',padding:'0.7em 2em',borderRadius:6}}>
        {loading ? 'Activando...' : 'Activar periodo de prueba'}
      </button>
      {message && <div style={{marginTop:'1em',color:message.includes('activado')?'#2ecc40':'#ff4136',fontWeight:'bold'}}>{message}</div>}
    </form>
  );
}
