import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
// import api from './api.js';
import { useNavigate } from 'react-router-dom';

export default function EditProfile() {
  const { user, loading, updateProfile, setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setBirthDate(user.birthDate ? user.birthDate.slice(0,10) : '');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await updateProfile({ username, email, birthDate });
      setUser(updated);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="edit-profile-container">
      <h2>Editar Perfil</h2>
      <form onSubmit={handleSave} className="edit-profile-form">
        <label>
          Nombre de usuario:
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
        </label>
        <label>
          Email:
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label>
          Fecha de nacimiento:
          <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
        </label>
        <button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
        {error && <div className="edit-profile-error">{error}</div>}
      </form>
    </div>
  );
}
