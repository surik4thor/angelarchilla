import React, { useState, useEffect } from 'react';
import api from '../api/apiClient.js';
import '../styles/PartnerData.css';

export default function PartnerData() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/partners')
      .then(({ data }) => setPartners(data.partners))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando colaboradores…</p>;
  if (!partners.length) return <p>No hay datos de colaboradores.</p>;

  return (
    <section className="partner-data">
      <h2>Colaboradores y Socios</h2>
      <ul>
        {partners.map(p => (
          <li key={p.id}>
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <a href={p.website} target="_blank" rel="noopener noreferrer">
              Visitar sitio
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
