import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PlansDetail.css';

export default function PlansDetail() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/membership/plans', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setPlans(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleStripeCheckout = async (priceId) => {
    try {
      const res = await fetch('/api/shop/create-checkout-session', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
      } else {
        alert('No se pudo iniciar el proceso de pago.');
      }
    } catch (err) {
      alert('Error al conectar con Stripe.');
    }
  };

  if (loading) {
    return (
      <div className="plans-loading">Cargando planes...</div>
    );
  }

  return (
    <main className="plans-detail-main">
      <h1 className="section-title">Planes y Beneficios Arcana Club</h1>
      <section className="plans-table-section">
        <table className="plans-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {plans.map(plan => (
              <tr key={plan.name}>
                <td>{plan.name}</td>
                <td>{plan.description}</td>
                <td>{plan.price === 0 ? 'Gratis' : `${plan.price.toFixed(2)}€/mes`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="plans-benefits-section">
        <h2 className="plans-benefits-title">¿Por qué suscribirte?</h2>
        <ul className="plans-benefits-list">
          {plans.map(plan => (
            <li key={plan.name}>{plan.name}: {plan.description}</li>
          ))}
        </ul>
      </section>
      <div className="plans-btns">
        <button className="menu-link btn-anim btn-back" onClick={() => navigate('/')}>Regresar a la web</button>
      </div>
      <div className="plans-btns">
        {plans.map(plan => {
          if (plan.price === 0) {
            return (
              <button key={plan.name} className="menu-link btn-anim btn-free" disabled>{plan.name} - Gratis</button>
            );
          } else {
            return (
              <button key={plan.name} className="menu-link btn-anim btn-premium" onClick={() => handleStripeCheckout(plan.stripeId)}>{plan.name} - {plan.price.toFixed(2)}€/mes</button>
            );
          }
        })}
      </div>
    </main>
  );
}
