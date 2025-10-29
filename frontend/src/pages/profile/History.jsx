import React, { useEffect, useState } from 'react';
import { useReading } from '../hooks/useReading.js';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Link } from 'react-router-dom';
import '../styles/History.css';

export default function History() {
  const { getHistory, loading, error } = useReading();
  const [history, setHistory] = useState([]);
  const { user } = useAuth();
    const planActivo = ['ADEPTO','MAESTRO'].includes((user?.subscriptionPlan || '').toUpperCase());

  useEffect(() => {
    if (planActivo) {
      getHistory()
        .then(setHistory)
        .catch(console.error);
    }
  }, [planActivo]);

    if (!planActivo) {
      return (
        <div className="history-container" style={{color:'#ff4136',fontWeight:'bold',margin:'1em 0',background:'#232946',borderRadius:'10px',padding:'1.2em'}}>
          <h2>Historial de Lecturas</h2>
          El acceso al historial de lecturas es exclusivo para suscriptores <b>ADEPTO o MAESTRO</b>.<br/>
          Actualiza tu suscripci3n para desbloquear esta funci3n.<br/>
          <Link to="/planes" style={{color:'#eebc1d',textDecoration:'underline'}}>Ver planes disponibles</Link>
        </div>
      );
  }
  if (loading) return <p>Cargando historial…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!history.length) return <p>No tienes lecturas previas.</p>;

  return (
    <div className="history-container">
      <h2>Historial de Lecturas</h2>
      <ul>
        {history.map(r => (
          <li key={r.id}>
            <p>{new Date(r.createdAt).toLocaleString()} — {r.type}</p>
            <p>Pregunta: {r.question}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
