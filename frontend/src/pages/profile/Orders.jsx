import React, { useEffect, useState } from 'react';
import api from '../api/apiClient.js';
import '../styles/Orders.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/shop/orders')
      .then(({ data }) => setOrders(data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando pedidos…</p>;
  if (!orders.length) return <p>No tienes pedidos.</p>;

  return (
    <div className="orders-container">
      <h2>Mis Pedidos</h2>
      <ul>
        {orders.map(o => (
          <li key={o.id}>
            <p>Pedido #{o.id} — {o.status}</p>
            <p>Total: {o.total.toFixed(2)} €</p>
            <p>Fecha: {new Date(o.createdAt).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
