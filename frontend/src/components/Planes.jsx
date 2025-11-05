import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import api from '../api/apiClient.js';
import '../styles/Planes.css';

const Planes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/api/membership/plans');
        setPlans(response.data);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSubscribe = async (planName) => {
    if (!user) {
      // Redirigir al home para que se registre
      navigate('/?register=true');
      return;
    }

    try {
      const plan = plans.find(p => p.name === planName);
      if (!plan) return;

      const priceId = selectedPeriod === 'monthly' ? plan.stripeIdMonthly : plan.stripeIdAnnual;
      
      const response = await api.post('/api/subscriptions/create-checkout-session', {
        priceId
      });

      if (response.data.checkoutUrl) {
        window.open(response.data.checkoutUrl, '_blank');
      } else {
        alert('Error al crear la sesión de pago');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Error al procesar la suscripción. Inténtalo de nuevo.');
    }
  };

  const getCurrentPlanName = () => {
    const currentPlan = user?.subscriptionPlan || 'INVITADO';
    
    // Map legacy plan names to new structure
    const planMapping = {
      'INVITADO': 'Invitado',
      'INICIADO': 'Esencial', // Legacy migration
      'ADEPTO': 'Premium',    // Legacy migration  
      'MAESTRO': 'Premium',   // Legacy migration
      'ESENCIAL': 'Esencial',
      'PREMIUM': 'Premium'
    };
    
    return planMapping[currentPlan.toUpperCase()] || 'Invitado';
  };

  const getGradientForPlan = (planName) => {
    const gradients = {
      'Invitado': '#6b7280, #4b5563',
      'Esencial': '#3b82f6, #1d4ed8', 
      'Premium': '#f59e0b, #d97706',
      // Legacy support
      'Iniciado': '#3b82f6, #1d4ed8',
      'Adepto': '#8b5cf6, #7c3aed',
      'Maestro': '#f59e0b, #d97706'
    };
    return gradients[planName] || gradients['Invitado'];
  };

  const planDetails = {
    'Invitado': {
      icon: '🌟',
      color: '#6b7280',
      gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      displayName: 'Explorador Cósmico'
    },
    'Esencial': {
      icon: '✨',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      popular: true,
      displayName: 'Iniciado Místico'
    },
    'Premium': {
      icon: '🔮',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      premium: true,
      displayName: 'Maestro Espiritual'
    },
    
    // Legacy mappings for compatibility
    'Iniciado': {
      icon: '🌙',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      displayName: 'Iniciado (Legacy)'
    },
    'Adepto': {
      icon: '⭐',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      displayName: 'Adepto (Legacy)'
    },
    'Maestro': {
      icon: '🔮',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      displayName: 'Maestro (Legacy)'
    }
  };

  if (loading) {
    return (
      <div className="planes-loading">
        <div className="loading-spinner"></div>
        <p>Cargando planes de suscripción...</p>
      </div>
    );
  }

  return (
    <div className="planes-container">
      {/* Header */}
      <section className="planes-hero">
        <h1>💎 Planes de Suscripción</h1>
        <p>Elige el plan que mejor se adapte a tu journey espiritual</p>
        
        {/* Toggle periodo */}
        <div className="period-toggle">
          <button 
            className={selectedPeriod === 'monthly' ? 'active' : ''}
            onClick={() => setSelectedPeriod('monthly')}
          >
            Mensual
          </button>
          <button 
            className={selectedPeriod === 'annual' ? 'active' : ''}
            onClick={() => setSelectedPeriod('annual')}
          >
            Anual
            <span className="discount-badge">¡Ahorra 2 meses!</span>
          </button>
        </div>
      </section>

      {/* Comparación de planes en formato tabla */}
      <section className="planes-table-section">
        <div className="table-container">
          <table className="planes-table">
            <thead>
              <tr>
                <th className="feature-column">Características</th>
                {plans.map(plan => {
                  const details = planDetails[plan.name];
                  const isCurrentPlan = getCurrentPlanName().toUpperCase() === plan.name.toUpperCase();
                  const price = selectedPeriod === 'monthly' ? plan.priceMonthly : plan.priceAnnual;
                  
                  return (
                    <th key={plan.name} className={`plan-column ${isCurrentPlan ? 'current-plan' : ''} ${details?.popular ? 'popular-plan' : ''}`}>
                      <div className="plan-header-cell">
                        <div className="plan-icon">{details?.icon}</div>
                        <h3 className="plan-name">{plan.displayName || plan.name}</h3>
                        {plan.badge && <span className="popular-badge">{plan.badge}</span>}
                        {details?.popular && <span className="popular-badge">Más Popular</span>}
                        {isCurrentPlan && <span className="current-badge">Actual</span>}
                        <div className="plan-price">
                          {price === 0 ? (
                            <span className="price-free">Gratis</span>
                          ) : (
                            <div className="price-info">
                              <span className="price-amount">€{price?.toFixed(2)}</span>
                              <span className="price-period">/{selectedPeriod === 'monthly' ? 'mes' : 'año'}</span>
                              {selectedPeriod === 'annual' && plan.priceMonthly && (
                                <div className="price-savings">
                                  <small>Ahorra €{((plan.priceMonthly * 12) - plan.priceAnnual).toFixed(2)}/año</small>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Lecturas mensuales */}
              <tr>
                <td className="feature-label">📚 Lecturas mensuales</td>
                {plans.map(plan => {
                  const details = planDetails[plan.name];
                  let readingsText = '';
                  
                  // Extract readings info from features
                  const readingFeature = plan.features?.find(f => f.includes('lecturas') || f.includes('Lecturas'));
                  if (readingFeature) {
                    readingsText = readingFeature;
                  } else if (plan.name === 'Invitado') {
                    readingsText = '3 lecturas básicas';
                  }
                  
                  return (
                    <td key={`readings-${plan.name}`} className={`plan-cell ${details?.popular ? 'popular-cell' : ''} ${details?.premium ? 'premium-cell' : ''}`}>
                      {readingsText}
                    </td>
                  );
                })}
              </tr>
              
              {/* Horóscopo */}
              <tr>
                <td className="feature-label">🌟 Horóscopo</td>
                {plans.map(plan => {
                  const details = planDetails[plan.name];
                  let horoscopeText = '';
                  
                  // Extract horoscope info from features
                  const horoscopeFeature = plan.features?.find(f => f.toLowerCase().includes('horóscopo'));
                  if (horoscopeFeature) {
                    horoscopeText = horoscopeFeature;
                  } else if (plan.name === 'Invitado') {
                    horoscopeText = 'Horóscopo semanal básico';
                  }
                  
                  return (
                    <td key={`horoscope-${plan.name}`} className={`plan-cell ${details?.popular ? 'popular-cell' : ''} ${details?.premium ? 'premium-cell' : ''}`}>
                      {horoscopeText}
                    </td>
                  );
                })}
              </tr>
              
              {/* Historial */}
              <tr>
                <td className="feature-label">📖 Historial de lecturas</td>
                {plans.map(plan => {
                  const details = planDetails[plan.name];
                  let historyText = '';
                  
                  if (plan.limitations?.includes('Sin historial de lecturas')) {
                    historyText = '❌ No disponible';
                  } else {
                    const historyFeature = plan.features?.find(f => f.toLowerCase().includes('historial'));
                    if (historyFeature) {
                      historyText = `✅ ${historyFeature}`;
                    } else {
                      historyText = '✅ Disponible';
                    }
                  }
                  
                  return (
                    <td key={`history-${plan.name}`} className={`plan-cell ${details?.popular ? 'popular-cell' : ''} ${details?.premium ? 'premium-cell' : ''}`}>
                      {historyText}
                    </td>
                  );
                })}
              </tr>
              
              {/* Tutoriales */}
              <tr>
                <td className="feature-label">🎓 Acceso a tutoriales</td>
                {plans.map(plan => {
                  const details = planDetails[plan.name];
                  const tutorialFeature = plan.features?.find(f => f.toLowerCase().includes('tutorial'));
                  let tutorialText = tutorialFeature || (plan.name === 'Invitado' ? 'Acceso a tutoriales' : '✅ Completos');
                  
                  return (
                    <td key={`tutorials-${plan.name}`} className={`plan-cell ${details?.popular ? 'popular-cell' : ''} ${details?.premium ? 'premium-cell' : ''}`}>
                      {tutorialText}
                    </td>
                  );
                })}
              </tr>
              
              {/* Interpretación de sueños */}
              <tr>
                <td className="feature-label">🌙 Interpretación de sueños</td>
                {plans.map(plan => {
                  const details = planDetails[plan.name];
                  let dreamText = '';
                  
                  if (plan.limitations?.includes('Sin interpretación de sueños') || !plan.features?.some(f => f.toLowerCase().includes('sueños'))) {
                    dreamText = '❌ No disponible';
                  } else {
                    dreamText = '✅ Completa';
                  }
                  
                  return (
                    <td key={`dreams-${plan.name}`} className={`plan-cell ${details?.popular ? 'popular-cell' : ''} ${details?.premium ? 'premium-cell' : ''}`}>
                      {dreamText}
                    </td>
                  );
                })}
              </tr>
              
              {/* Cartas natales */}
              <tr>
                <td className="feature-label">📊 Cartas natales</td>
                {plans.map(plan => {
                  const details = planDetails[plan.name];
                  let natalText = '';
                  
                  if (plan.limitations?.includes('Sin cartas natales') || !plan.features?.some(f => f.toLowerCase().includes('cartas natales'))) {
                    natalText = '❌ No disponible';
                  } else {
                    const natalFeature = plan.features?.find(f => f.toLowerCase().includes('cartas natales'));
                    natalText = `✅ ${natalFeature || 'Disponibles'}`;
                  }
                  
                  return (
                    <td key={`natal-${plan.name}`} className={`plan-cell ${details?.popular ? 'popular-cell' : ''} ${details?.premium ? 'premium-cell' : ''}`}>
                      {natalText}
                    </td>
                  );
                })}
              </tr>
              
              {/* Soporte */}
              <tr>
                <td className="feature-label">🛟 Soporte</td>
                {plans.map(plan => {
                  const details = planDetails[plan.name];
                  let supportText = '';
                  
                  const supportFeature = plan.features?.find(f => f.toLowerCase().includes('soporte'));
                  if (supportFeature) {
                    supportText = supportFeature;
                  } else if (plan.name === 'Invitado') {
                    supportText = 'Comunidad';
                  } else {
                    supportText = 'Email';
                  }
                  
                  return (
                    <td key={`support-${plan.name}`} className={`plan-cell ${details?.popular ? 'popular-cell' : ''} ${details?.premium ? 'premium-cell' : ''}`}>
                      {supportText}
                    </td>
                  );
                })}
              </tr>
              
              {/* Acciones */}
              <tr className="action-row">
                <td className="feature-label"><strong>Acciones</strong></td>
                {plans.map(plan => {
                  const details = planDetails[plan.name];
                  const isCurrentPlan = getCurrentPlanName().toUpperCase() === plan.name.toUpperCase();
                  
                  return (
                    <td key={`action-${plan.name}`} className="plan-cell action-cell">
                      {isCurrentPlan ? (
                        <button className="plan-btn-table current" disabled>
                          ✅ Plan Activo
                        </button>
                      ) : plan.name === 'Invitado' ? (
                        <Link to="/" className="plan-btn-table free">
                          🚀 Comenzar Gratis
                        </Link>
                      ) : (
                        <button 
                          className={`plan-btn-table subscribe ${details?.popular ? 'popular' : ''} ${details?.premium ? 'premium' : ''}`}
                          onClick={() => handleSubscribe(plan.name)}
                          title={`Suscribirse a ${plan.displayName || plan.name} - €${selectedPeriod === 'monthly' ? plan.priceMonthly : plan.priceAnnual}/${selectedPeriod === 'monthly' ? 'mes' : 'año'}`}
                        >
                          {plan.badge === 'Más Popular' ? '⭐' : plan.badge === 'Mejor Valor' ? '💎' : '💳'} {user ? 'Suscribirse' : 'Registrarse'}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Características destacadas */}
      <section className="features-highlight">
        <h2>🌟 ¿Por qué elegir Nebulosa Mágica?</h2>
        <div className="highlight-grid">
          <div className="highlight-item">
            <div className="highlight-icon">🤖</div>
            <h3>IA Especializada</h3>
            <p>Nuestras 4 personalidades IA están entrenadas específicamente en artes esotéricas para brindarte interpretaciones precisas y personalizadas.</p>
          </div>
          <div className="highlight-item">
            <div className="highlight-icon">📚</div>
            <h3>Biblioteca Completa</h3>
            <p>Acceso a tutoriales, guías y recursos educativos para profundizar en tu conocimiento místico.</p>
          </div>
          <div className="highlight-item">
            <div className="highlight-icon">🔒</div>
            <h3>Privacidad Total</h3>
            <p>Tus consultas y datos personales están completamente seguros y encriptados.</p>
          </div>
          <div className="highlight-item">
            <div className="highlight-icon">📱</div>
            <h3>Acceso 24/7</h3>
            <p>Consulta cuando quieras desde cualquier dispositivo. Tu guía espiritual siempre disponible.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <h2>❓ Preguntas Frecuentes</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>¿Puedo cambiar de plan en cualquier momento?</h4>
            <p>Sí, puedes actualizar o degradar tu plan cuando quieras. Los cambios se aplicarán en tu próximo ciclo de facturación.</p>
          </div>
          <div className="faq-item">
            <h4>¿Qué métodos de pago aceptan?</h4>
            <p>Aceptamos todas las tarjetas principales a través de Stripe. Próximamente añadiremos PayPal y Bizum.</p>
          </div>
          <div className="faq-item">
            <h4>¿Hay garantía de reembolso?</h4>
            <p>Ofrecemos garantía de 7 días para nuevos suscriptores. Si no estás satisfecho, te devolvemos tu dinero.</p>
          </div>
          <div className="faq-item">
            <h4>¿Los tutoriales están incluidos en todos los planes?</h4>
            <p>Los tutoriales básicos están disponibles para todos. Los tutoriales avanzados y cupones especiales están incluidos en los planes de pago.</p>
          </div>
        </div>
      </section>

      {/* Call to action final */}
      {!user && (
        <section className="final-cta">
          <h2>🔮 ¿Listo para comenzar tu journey espiritual?</h2>
          <p>Únete a miles de personas que ya confían en Nebulosa Mágica para guiar su destino</p>
          <Link to="/" className="cta-button">
            Comenzar Gratis Ahora
          </Link>
        </section>
      )}
    </div>
  );
};

export default Planes;