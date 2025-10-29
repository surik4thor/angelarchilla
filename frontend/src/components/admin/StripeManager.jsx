import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin.jsx';
import StripeIntegration from './StripeIntegration.jsx';

export default function StripeManager() {
  const {
    loading,
    error,
    setError,
    getStripeStats,
    getStripeCustomers,
    getStripeSubscriptions,
    getStripePayments
  } = useAdmin();

  const [activeMode, setActiveMode] = useState('simulation'); // 'simulation' or 'live'
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [customers, setCustomers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadStripeData();
  }, []);

  useEffect(() => {
    if (activeTab === 'payments') {
      loadPayments();
    }
  }, [dateRange, activeTab]);

  const loadStripeData = async () => {
    try {
      const [statsData, customersData, subscriptionsData] = await Promise.all([
        getStripeStats(),
        getStripeCustomers(1, 10),
        getStripeSubscriptions(1, 10)
      ]);
      
      setStats(statsData || {});
      setCustomers(customersData.customers || []);
      setSubscriptions(subscriptionsData.subscriptions || []);
    } catch (err) {
      console.error('Error loading Stripe data:', err);
    }
  };

  const loadPayments = async () => {
    try {
      const paymentsData = await getStripePayments(1, 20, dateRange);
      setPayments(paymentsData.payments || []);
    } catch (err) {
      console.error('Error loading payments:', err);
    }
  };

  const formatCurrency = (amount, currency = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100); // Stripe amounts are in cents
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { text: 'Activa', class: 'success', emoji: '✅', aria: 'Activa' },
      past_due: { text: 'Atrasada', class: 'warning', emoji: '⚠️', aria: 'Atrasada' },
      canceled: { text: 'Cancelada', class: 'error', emoji: '❌', aria: 'Cancelada' },
      succeeded: { text: 'Exitoso', class: 'success', emoji: '✅', aria: 'Exitoso' },
      pending: { text: 'Pendiente', class: 'warning', emoji: '⏳', aria: 'Pendiente' },
      failed: { text: 'Fallido', class: 'error', emoji: '❌', aria: 'Fallido' }
    };

    const config = statusConfig[status] || { text: status, class: 'default', emoji: '❓', aria: status };
    return (
      <span className={`status-badge ${config.class}`}>
        <span role="img" aria-label={config.aria} style={{ marginRight: '0.3em' }}>{config.emoji}</span>
        {config.text}
      </span>
    );
  };

  // Si está en modo live, usar la integración real de Stripe
  if (activeMode === 'live') {
  return <StripeIntegration />;
  }

  return (
    <div className="stripe-manager">
      <div className="stripe-header">
        <h2>Gestión de Stripe</h2>
        <div className="stripe-controls">
          <div className="mode-toggle">
            <span className={activeMode === 'simulation' ? 'active' : ''}>Simulación</span>
            <button 
              onClick={() => setActiveMode(activeMode === 'simulation' ? 'live' : 'simulation')}
              className="toggle-btn"
            >
              <span role="img" aria-label={activeMode === 'live' ? 'Live' : 'Simulación'}>{activeMode === 'live' ? '🟢' : '⚪'}</span>
            </button>
            <span className={activeMode === 'live' ? 'active' : ''}>Stripe Live</span>
          </div>
          <button onClick={loadStripeData} disabled={loading} className="refresh-btn">
            <span role="img" aria-label={loading ? 'Cargando' : 'Actualizar'} style={loading ? { animation: 'spin 1s linear infinite', display: 'inline-block' } : {}}>{loading ? '⏳' : '🔄'}</span>
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-alert admin-alert-error">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="stripe-tabs">
        <button 
          className={`stripe-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span role="img" aria-label="Resumen">📊</span>
          Resumen
        </button>
        <button 
          className={`stripe-tab ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <span role="img" aria-label="Clientes">👥</span>
          Clientes
        </button>
        <button 
          className={`stripe-tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          <span role="img" aria-label="Suscripciones">🔄</span>
          Suscripciones
        </button>
        <button 
          className={`stripe-tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <span role="img" aria-label="Pagos">💳</span>
          Pagos
        </button>
      </div>

      <div className="stripe-content">
        {activeTab === 'overview' && (
          <div className="stripe-overview">
            <div className="stats-grid">
              <div className="stat-card revenue">
                <div className="stat-icon">
                  <span role="img" aria-label="Ingresos">💶</span>
                </div>
                <div className="stat-info">
                  <h3>Ingresos del Mes</h3>
                  <span className="stat-number">
                    {formatCurrency(stats.monthlyRevenue || 0)}
                  </span>
                  <span className="stat-change positive">
                    +{stats.revenueGrowth || 0}%
                  </span>
                </div>
              </div>

              <div className="stat-card customers">
                <div className="stat-icon">
                  <span role="img" aria-label="Clientes">👥</span>
                </div>
                <div className="stat-info">
                  <h3>Clientes Activos</h3>
                  <span className="stat-number">{stats.activeCustomers || 0}</span>
                  <span className="stat-change positive">
                    +{stats.customerGrowth || 0}
                  </span>
                </div>
              </div>

              <div className="stat-card subscriptions">
                <div className="stat-icon">
                  <span role="img" aria-label="Suscripciones">🔄</span>
                </div>
                <div className="stat-info">
                  <h3>Suscripciones</h3>
                  <span className="stat-number">{stats.activeSubscriptions || 0}</span>
                  <span className="stat-change positive">
                    {stats.subscriptionGrowth || 0}% MRR
                  </span>
                </div>
              </div>

              <div className="stat-card payments">
                <div className="stat-icon">
                  <span role="img" aria-label="Pagos">💳</span>
                </div>
                <div className="stat-info">
                  <h3>Pagos del Mes</h3>
                  <span className="stat-number">{stats.monthlyPayments || 0}</span>
                  <span className="stat-change positive">
                    {stats.successRate || 95}% éxito
                  </span>
                </div>
              </div>
            </div>

            <div className="revenue-chart">
              <h3>Ingresos de los Últimos 12 Meses</h3>
              <div className="chart-placeholder">
                <p>Gráfico de ingresos mensual</p>
                <div className="chart-bars">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div 
                      key={i} 
                      className="chart-bar" 
                      style={{ height: `${Math.random() * 100}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="stripe-customers">
            <div className="customers-header">
              <h3>Clientes de Stripe</h3>
              <span className="total-count">{customers.length} clientes</span>
            </div>

            <div className="customers-table-container">
              <table className="stripe-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Estado</th>
                    <th>Registro</th>
                    <th>Total Gastado</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(customer => (
                    <tr key={customer.id}>
                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar">
                            {customer.name?.[0] || customer.email[0].toUpperCase()}
                          </div>
                          <span>{customer.name || 'Cliente'}</span>
                        </div>
                      </td>
                      <td>{customer.email}</td>
                      <td>
                        {customer.subscription ? (
                          <span className="plan-badge premium">
                            {customer.subscription.plan}
                          </span>
                        ) : (
                          <span className="plan-badge free">Gratuito</span>
                        )}
                      </td>
                      <td>
                        {getStatusBadge(customer.subscription?.status || 'no_subscription')}
                      </td>
                      <td>{formatDate(customer.created)}</td>
                      <td className="amount">
                        {formatCurrency(customer.totalSpent || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="stripe-subscriptions">
            <div className="subscriptions-header">
              <h3>Suscripciones Activas</h3>
              <span className="total-count">{subscriptions.length} suscripciones</span>
            </div>

            <div className="subscriptions-grid">
              {subscriptions.map(subscription => (
                <div key={subscription.id} className="subscription-card">
                  <div className="subscription-header">
                    <h4>{subscription.customer.name || subscription.customer.email}</h4>
                    {getStatusBadge(subscription.status)}
                  </div>
                  
                  <div className="subscription-details">
                    <div className="detail-row">
                      <span className="label">Plan:</span>
                      <span className="value">{subscription.plan.name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Precio:</span>
                      <span className="value amount">
                        {formatCurrency(subscription.plan.amount, subscription.plan.currency)}
                        /{subscription.plan.interval}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Próximo pago:</span>
                      <span className="value">
                        {formatDate(subscription.current_period_end)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Creada:</span>
                      <span className="value">{formatDate(subscription.created)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="stripe-payments">
            <div className="payments-header">
              <h3>Historial de Pagos</h3>
              <div className="date-range-picker">
                <span role="img" aria-label="Fecha">📅</span>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                />
                <span>hasta</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
            </div>

            <div className="payments-table-container">
              <table className="stripe-table">
                <thead>
                  <tr>
                    <th>ID de Pago</th>
                    <th>Cliente</th>
                    <th>Cantidad</th>
                    <th>Estado</th>
                    <th>Método</th>
                    <th>Fecha</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment.id}>
                      <td className="payment-id">
                        <code>{payment.id.substring(0, 12)}...</code>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <span>{payment.customer?.name || payment.customer?.email || 'Cliente'}</span>
                        </div>
                      </td>
                      <td className="amount">
                        {formatCurrency(payment.amount, payment.currency)}
                      </td>
                      <td>
                        {getStatusBadge(payment.status)}
                      </td>
                      <td>
                        <span className="payment-method">
                          {payment.payment_method?.type || 'card'}
                        </span>
                      </td>
                      <td>{formatDate(payment.created)}</td>
                      <td className="description">
                        {payment.description || 'Pago de suscripción'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}