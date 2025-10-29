import React, { useState, useEffect } from 'react';

export default function StripeIntegration() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stripeData, setStripeData] = useState({
    balance: null,
    customers: [],
    subscriptions: [],
    products: [],
    prices: [],
    paymentIntents: []
  });

  useEffect(() => {
    loadStripeData();
  }, []);

  const loadStripeData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Cargar datos principales de Stripe usando las herramientas MCP
      const [balance, customers, subscriptions, products, paymentIntents] = await Promise.all([
        window.mcp_stripe_agent_retrieve_balance?.() || Promise.resolve(null),
        window.mcp_stripe_agent_list_customers?.({ limit: 10 }) || Promise.resolve({ data: [] }),
        window.mcp_stripe_agent_list_subscriptions?.({ limit: 10 }) || Promise.resolve({ data: [] }),
        window.mcp_stripe_agent_list_products?.({ limit: 10 }) || Promise.resolve({ data: [] }),
        window.mcp_stripe_agent_list_payment_intents?.({ limit: 20 }) || Promise.resolve({ data: [] })
      ]);

      setStripeData({
        balance: balance || null,
        customers: customers.data || [],
        subscriptions: subscriptions.data || [],
        products: products.data || [],
        paymentIntents: paymentIntents.data || []
      });
    } catch (err) {
      setError('Error cargando datos de Stripe: ' + err.message);
      console.error('Stripe error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('es-ES', {
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
      failed: { text: 'Fallido', class: 'error', emoji: '❌', aria: 'Fallido' },
      requires_payment_method: { text: 'Requiere Pago', class: 'warning', emoji: '💳', aria: 'Requiere método de pago' }
    };

    const config = statusConfig[status] || { text: status, class: 'default', emoji: '❓', aria: status };
    return (
      <span className={`status-badge ${config.class}`}>
        <span role="img" aria-label={config.aria} style={{ marginRight: '0.3em' }}>{config.emoji}</span>
        {config.text}
      </span>
    );
  };

  const handleCreateCustomer = async () => {
    const name = prompt('Nombre del cliente:');
    const email = prompt('Email del cliente:');
    
    if (!name || !email) return;

    try {
      setLoading(true);
      await window.mcp_stripe_agent_create_customer?.({ name, email });
      await loadStripeData();
    } catch (err) {
      setError('Error creando cliente: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    const name = prompt('Nombre del producto:');
    const description = prompt('Descripción del producto:');
    
    if (!name) return;

    try {
      setLoading(true);
      await window.mcp_stripe_agent_create_product?.({ name, description });
      await loadStripeData();
    } catch (err) {
      setError('Error creando producto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stripe-integration">
      <div className="stripe-header">
        <h2>Integración con Stripe</h2>
        <div className="stripe-controls">
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
          className={`stripe-tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <span role="img" aria-label="Productos">💳</span>
          Productos
        </button>
        <button 
          className={`stripe-tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <span role="img" aria-label="Pagos">💶</span>
          Pagos
        </button>
      </div>

      <div className="stripe-content">
        {activeTab === 'overview' && (
          <div className="stripe-overview">
            <div className="stats-grid">
              <div className="stat-card balance">
                <div className="stat-icon">
                  <span role="img" aria-label="Balance">💶</span>
                </div>
                <div className="stat-info">
                  <h3>Balance Disponible</h3>
                  <span className="stat-number">
                    {stripeData.balance ? 
                      formatCurrency(stripeData.balance.available[0]?.amount || 0, stripeData.balance.available[0]?.currency) : 
                      '€0.00'
                    }
                  </span>
                  <span className="stat-change">
                    Pendiente: {stripeData.balance ? 
                      formatCurrency(stripeData.balance.pending[0]?.amount || 0, stripeData.balance.pending[0]?.currency) : 
                      '€0.00'
                    }
                  </span>
                </div>
              </div>

              <div className="stat-card customers">
                <div className="stat-icon">
                  <span role="img" aria-label="Clientes">👥</span>
                </div>
                <div className="stat-info">
                  <h3>Total Clientes</h3>
                  <span className="stat-number">{stripeData.customers.length}</span>
                  <span className="stat-change">Registrados en Stripe</span>
                </div>
              </div>

              <div className="stat-card subscriptions">
                <div className="stat-icon">
                  <span role="img" aria-label="Suscripciones">🔄</span>
                </div>
                <div className="stat-info">
                  <h3>Suscripciones</h3>
                  <span className="stat-number">
                    {stripeData.subscriptions.filter(s => s.status === 'active').length}
                  </span>
                  <span className="stat-change">
                    {stripeData.subscriptions.length} total
                  </span>
                </div>
              </div>

              <div className="stat-card products">
                <div className="stat-icon">
                  <span role="img" aria-label="Productos">💳</span>
                </div>
                <div className="stat-info">
                  <h3>Productos</h3>
                  <span className="stat-number">{stripeData.products.length}</span>
                  <span className="stat-change">En catálogo</span>
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <h3>Actividad Reciente</h3>
              <div className="activity-list">
                {stripeData.paymentIntents.slice(0, 5).map(payment => (
                  <div key={payment.id} className="activity-item">
                    <div className="activity-icon">
                      <span role="img" aria-label="Pago">💳</span>
                    </div>
                    <div className="activity-details">
                      <div className="activity-title">
                        Pago {getStatusBadge(payment.status)}
                      </div>
                      <div className="activity-amount">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                      <div className="activity-time">
                        {formatDate(payment.created)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="stripe-customers">
            <div className="customers-header">
              <h3>Clientes de Stripe</h3>
              <button onClick={handleCreateCustomer} className="create-btn">
                <span role="img" aria-label="Nuevo">➕</span>
                Nuevo Cliente
              </button>
            </div>

            <div className="customers-table-container">
              <table className="stripe-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Email</th>
                    <th>Registrado</th>
                    <th>Métodos de Pago</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {stripeData.customers.map(customer => (
                    <tr key={customer.id}>
                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar">
                            {customer.name?.[0] || customer.email[0].toUpperCase()}
                          </div>
                          <span>{customer.name || 'Sin nombre'}</span>
                        </div>
                      </td>
                      <td>{customer.email}</td>
                      <td>{formatDate(customer.created)}</td>
                      <td>
                        <span className="payment-methods-count">
                          {customer.default_source ? '1 método' : 'Sin métodos'}
                        </span>
                      </td>
                      <td>
                        <div className="customer-actions">
                          <button className="action-btn edit" title="Editar">
                            <span role="img" aria-label="Editar">✏️</span>
                          </button>
                        </div>
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
              <h3>Suscripciones</h3>
              <span className="total-count">{stripeData.subscriptions.length} suscripciones</span>
            </div>

            <div className="subscriptions-grid">
              {stripeData.subscriptions.map(subscription => (
                <div key={subscription.id} className="subscription-card">
                  <div className="subscription-header">
                    <h4>{subscription.customer?.email || 'Cliente'}</h4>
                    {getStatusBadge(subscription.status)}
                  </div>
                  
                  <div className="subscription-details">
                    <div className="detail-row">
                      <span className="label">Plan:</span>
                      <span className="value">{subscription.items?.data[0]?.price?.nickname || 'Plan personalizado'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Precio:</span>
                      <span className="value amount">
                        {subscription.items?.data[0]?.price ? 
                          formatCurrency(subscription.items.data[0].price.unit_amount, subscription.items.data[0].price.currency) : 
                          'N/A'
                        }
                        /{subscription.items?.data[0]?.price?.recurring?.interval}
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

                  <div className="subscription-actions">
                    {subscription.status === 'active' && (
                      <button 
                        onClick={() => {
                          if (confirm('¿Cancelar esta suscripción?')) {
                            window.mcp_stripe_agent_cancel_subscription?.({ subscription: subscription.id });
                          }
                        }}
                        className="action-btn delete"
                        title="Cancelar suscripción"
                      >
                        <span role="img" aria-label="Eliminar">🗑️</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="stripe-products">
            <div className="products-header">
              <h3>Productos de Stripe</h3>
              <button onClick={handleCreateProduct} className="create-btn">
                <span role="img" aria-label="Nuevo">➕</span>
                Nuevo Producto
              </button>
            </div>

            <div className="products-grid">
              {stripeData.products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-content">
                    <div className="product-header">
                      <h3>{product.name}</h3>
                      <span className={`status-badge ${product.active ? 'success' : 'inactive'}`}>
                        {product.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    
                    <p className="product-description">
                      {product.description || 'Sin descripción'}
                    </p>
                    
                    <div className="product-meta">
                      <span className="product-id">ID: {product.id.substring(0, 12)}...</span>
                      <span className="product-created">
                        Creado: {formatDate(product.created)}
                      </span>
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
              <span className="total-count">{stripeData.paymentIntents.length} pagos</span>
            </div>

            <div className="payments-table-container">
              <table className="stripe-table">
                <thead>
                  <tr>
                    <th>ID de Pago</th>
                    <th>Cliente</th>
                    <th>Cantidad</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {stripeData.paymentIntents.map(payment => (
                    <tr key={payment.id}>
                      <td className="payment-id">
                        <code>{payment.id.substring(0, 12)}...</code>
                      </td>
                      <td>
                        <span>{payment.customer || 'Cliente anónimo'}</span>
                      </td>
                      <td className="amount">
                        {formatCurrency(payment.amount, payment.currency)}
                      </td>
                      <td>
                        {getStatusBadge(payment.status)}
                      </td>
                      <td>{formatDate(payment.created)}</td>
                      <td className="description">
                        {payment.description || 'Sin descripción'}
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