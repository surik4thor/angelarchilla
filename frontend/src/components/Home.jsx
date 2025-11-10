import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx'
import AnimatedSubtitle from './AnimatedSubtitle.jsx'

import PaymentMethodModal from './PaymentMethodModal.jsx'
import AuthModal from './AuthModal.jsx'
import HoroscopoBasicoWidget from './HoroscopoBasicoWidget.jsx'
import { getPlanLabel } from '../utils/getPlanLabel.js'
import '../styles/Home.css'

export default function Home() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const {
    user,
    openAuthModal,
    handleHoroscopoAnon,
    fechaNac, setFechaNac,
    genero, setGenero,
    horoscopoAnon,
    login,
    register
  } = useAuth()
  const navigate = useNavigate();

  // Estados de UI y datos
  const [mensajeUniverso, setMensajeUniverso] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [plans, setPlans] = useState([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  // Fetch de planes al montar
  useEffect(() => {
  fetch('/api/membership/plans', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setPlans(data)
        setLoadingPlans(false)
      })
      .catch(() => setLoadingPlans(false))
  }, [])

  // Mensaje aleatorio del universo
  useEffect(() => {
    const fetchDailyInspiration = async () => {
      try {
        const response = await fetch('https://nebulosamagica.com/api/inspiration');
        const data = await response.json();
        if (data.success) {
          setMensajeUniverso(data.inspiration.replace(/"/g, ''));
        } else {
          // Fallback
          setMensajeUniverso('Tu intuición es tu mejor guía, confía en ella');
        }
      } catch (error) {
        console.error('Error cargando inspiración diaria:', error);
        setMensajeUniverso('La energía del universo conspira a tu favor hoy');
      }
    };
    
    fetchDailyInspiration();
  }, [])

  // Abre modal de suscripción o autenticación
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const handleSubscribe = (planKey, period = 'monthly') => {
    if (!user) {
      setAuthError('Debes iniciar sesión para suscribirte');
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setSelectedPlan(planKey);
    setSelectedPeriod(period);
    setShowPaymentModal(true);
  };

  // Checkout Stripe
  const handleStripeCheckout = async priceId => {
    try {
      const token = localStorage.getItem('arcanaToken')
  const res = await fetch('/api/shop/create-checkout-session', { credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ priceId })
      })
      const { checkoutUrl } = await res.json()
      if (checkoutUrl) window.open(checkoutUrl, '_blank')
      else alert('No se pudo iniciar el proceso de pago.')
    } catch {
      alert('Error al conectar con Stripe.')
    } finally {
      setShowPaymentModal(false)
    }
  }


  // Envío del formulario de auth
  const handleAuthSubmit = async data => {
    setAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'login') {
        await login(data.email, data.password);
      } else {
        await register(data);
      }
      // Refrescar usuario completo (incluyendo horoscopeToday)
      if (typeof window !== 'undefined' && window.location) {
        // Esperar un pequeño delay para asegurar que el token esté guardado
        setTimeout(async () => {
          if (typeof window !== 'undefined') {
            const { getMe } = await import('../api/auth.js');
            const fullUser = await getMe();
            if (fullUser) {
              // Actualizar el usuario en el contexto
              if (typeof setUser === 'function') setUser(fullUser);
            }
            setShowAuthModal(false);
          }
        }, 300);
      }
    } catch (err) {
      setAuthError(err.message || 'Error al iniciar sesión');
    } finally {
      setAuthLoading(false);
    }
  }

  // Mapeo de priceIds para el modal
  const safeFindPlan = (planName) => {
    if (!Array.isArray(plans)) return undefined;
    return plans.find(p => p.name === planName);
  };

  const priceIds = {
    iniciado: safeFindPlan('Iniciado')?.stripeId,
    adepto: safeFindPlan('Adepto')?.stripeId,
    maestro: safeFindPlan('Maestro')?.stripeId
  }

  return (
    <main className="home-main">
      {/* HERO Nebulosa Mágica */}
      <section className="hero-animated-bg" style={{marginBottom: '2.5em'}}>
        <div className="hero-layout">
          <div className="hero-left">
            <h1 className="main-title premium-title" style={{fontFamily: 'var(--font-title)', color: '#d4af37', fontWeight: 700, fontSize: '2.3rem', letterSpacing: '2px', textShadow: '0 0 18px #8b5cf6'}}>
              <span className="logo-rune rune-icon" style={{fontSize: '2.2rem', color: '#8b5cf6', textShadow: '0 0 12px #d4af37'}}>
                <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" style={{verticalAlign:'middle'}}>
                  <circle cx="19" cy="19" r="16" fill="#8b5cf6" fillOpacity="0.18" />
                  <path d="M19 6 L22 16 L32 19 L22 22 L19 32 L16 22 L6 19 L16 16 Z" stroke="#d4af37" strokeWidth="2.2" fill="#d4af37" fillOpacity="0.7" />
                </svg>
              </span>
              <span className="title-text">Nebulosa Mágica</span>
            </h1>
            <AnimatedSubtitle className="animated-subtitle" />
          </div>
          <div className="hero-right">
            <div className="universe-message-card premium-card" role="region" aria-label="Mensaje del universo" style={{boxShadow: '0 0 32px #8b5cf6, 0 0 0 2px #d4af37'}}>
              <div className="icon-container" aria-hidden="true" style={{fontSize: '2.1rem', color: '#d4af37'}}>✶</div>
              <div className="content-container">
                <h3 style={{fontFamily: 'var(--font-title)', color: '#d4af37', textShadow: '0 0 12px #8b5cf6'}}>Mensaje del Universo</h3>
                <p className="message-text" style={{fontFamily: 'var(--font-base)', color: '#e6d7c3'}}>{mensajeUniverso}</p>
                <p className="message-date" style={{color: '#b3bcdf'}}>
                  {new Date().toLocaleDateString('es-ES', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-bg-icon" aria-hidden="true" style={{fontSize: '2.5rem', color: '#8b5cf6', textShadow: '0 0 18px #d4af37', opacity: 0.18}}>✶</div>
      </section>

      {/* WIDGET HOROSCOPO BÁSICO */}
      {!user && <HoroscopoBasicoWidget />}

      {/* SERVICIOS DESTACADOS */}
      <section className="cards-destacadas-section" style={{marginBottom: '2.5em'}}>
        <h2 className="section-title" style={{marginBottom: '1.2em'}}>
          ☀️ Tu espacio esotérico ☀️
        </h2>
        <div className="cards-destacadas" role="region" aria-label="Destacados esotéricos">
          
          {/* Tarot Reading */}
          <div className="card-destacada premium-card" onClick={() => navigate('/tarot')} style={{cursor: 'pointer'}}>
            <div className="card-icon" style={{fontSize: '2.5rem', marginBottom: '0.8rem'}}>🔮</div>
            <h3 className="card-title">Lectura de Tarot</h3>
            <p className="card-description">
              Descubre los misterios del futuro con las cartas del tarot. 
              Madame Celestina te guiará través de la sabiduría ancestral.
            </p>
            <div className="card-badge" style={{background: 'linear-gradient(135deg, #8b5cf6, #d4af37)', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.85rem', marginTop: '1rem'}}>
              ⭐ Más Popular
            </div>
          </div>

          {/* Runas Reading */}
          <div className="card-destacada premium-card" onClick={() => navigate('/runes')} style={{cursor: 'pointer'}}>
            <div className="card-icon" style={{fontSize: '2.5rem', marginBottom: '0.8rem'}}>⚡</div>
            <h3 className="card-title">Consulta de Runas</h3>
            <p className="card-description">
              Conecta con la sabiduría nórdica ancestral. 
              Björn el Sabio interpretará las runas Elder Futhark para ti.
            </p>
            <div className="card-badge" style={{background: 'linear-gradient(135deg, #3b82f6, #1e40af)', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.85rem', marginTop: '1rem'}}>
              ⚡ Sabiduría Ancestral
            </div>
          </div>

          {/* Horoscope */}
          <div className="card-destacada premium-card" onClick={() => navigate('/horoscope')} style={{cursor: 'pointer'}}>
            <div className="card-icon" style={{fontSize: '2.5rem', marginBottom: '0.8rem'}}>⭐</div>
            <h3 className="card-title">Horóscopo Personalizado</h3>
            <p className="card-description">
              Horóscopo único basado en tu carta natal y los tránsitos planetarios actuales. 
              Celeste te revelará lo que los astros tienen preparado.
            </p>
            <div className="card-badge" style={{background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.85rem', marginTop: '1rem'}}>
              ⭐ Astrología Premium
            </div>
          </div>

          {/* Dreams - Solo para plan MAESTRO */}
          <div className="card-destacada premium-card" onClick={() => navigate('/dream-interpretation')} style={{cursor: 'pointer', opacity: user?.subscriptionPlan === 'MAESTRO' ? 1 : 0.7}}>
            <div className="card-icon" style={{fontSize: '2.5rem', marginBottom: '0.8rem'}}>🌙</div>
            <h3 className="card-title">Interpretación de Sueños</h3>
            <p className="card-description">
              Descifra los mensajes de tu subconsciente. 
              Morfeo te ayudará a entender el simbolismo onírico de tus sueños.
            </p>
            <div className="card-badge" style={{background: user?.subscriptionPlan === 'MAESTRO' ? 'linear-gradient(135deg, #ec4899, #be185d)' : 'linear-gradient(135deg, #6b7280, #4b5563)', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.85rem', marginTop: '1rem'}}>
              {user?.subscriptionPlan === 'MAESTRO' ? '🌙 Exclusivo Maestro' : '🔒 Solo Plan Maestro'}
            </div>
          </div>

        </div>
      </section>

      {/* CTA SUSCRIPCIÓN */}
      <section className="cta-subscription-section" style={{marginBottom: '2.5em'}}>
        <div className="cta-container premium-card" style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #d4af37 100%)',
          padding: '3rem 2rem',
          textAlign: 'center',
          borderRadius: '24px',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Fondo decorativo */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
            animation: 'pulse 4s ease-in-out infinite'
          }}></div>
          
          <div style={{position: 'relative', zIndex: 2}}>
            <div className="cta-icon" style={{fontSize: '3.5rem', marginBottom: '1.5rem'}}>✨</div>
            
            <h2 className="cta-title" style={{
              fontFamily: 'var(--font-title)',
              fontSize: '2.2rem',
              fontWeight: 700,
              color: '#fff',
              marginBottom: '1rem',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
              ¡Desbloquea tu Destino Completo!
            </h2>
            
            <p className="cta-description" style={{
              fontSize: '1.15rem',
              color: '#f8fafc',
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem auto',
              lineHeight: '1.6'
            }}>
              Accede a lecturas ilimitadas, interpretaciones personalizadas y descubre los secretos 
              que el universo tiene reservados para ti. ¡Tu transformación espiritual comienza aquí!
            </p>
            
            <div className="cta-benefits" style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              marginBottom: '2.5rem',
              flexWrap: 'wrap'
            }}>
              <div className="benefit-item" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#fff',
                fontSize: '0.95rem'
              }}>
                <span>🔮</span>
                <span>Lecturas Ilimitadas</span>
              </div>
              <div className="benefit-item" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#fff',
                fontSize: '0.95rem'
              }}>
                <span>⭐</span>
                <span>Interpretaciones IA</span>
              </div>
              <div className="benefit-item" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#fff',
                fontSize: '0.95rem'
              }}>
                <span>🌙</span>
                <span>Análisis de Sueños</span>
              </div>
              <div className="benefit-item" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#fff',
                fontSize: '0.95rem'
              }}>
                <span>📊</span>
                <span>Cartas Natales</span>
              </div>
            </div>
            
            <div className="cta-buttons" style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                className="cta-primary-btn"
                onClick={() => navigate('/planes')}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#8b5cf6',
                  border: 'none',
                  padding: '1rem 2.5rem',
                  borderRadius: '50px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 25px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
                }}
              >
                ⭐ Ver Planes Premium
              </button>
              
              {!user && (
                <button 
                  className="cta-secondary-btn"
                  onClick={() => {
                    setAuthMode('register');
                    setShowAuthModal(true);
                  }}
                  style={{
                    background: 'transparent',
                    color: '#fff',
                    border: '2px solid rgba(255,255,255,0.8)',
                    padding: '1rem 2rem',
                    borderRadius: '50px',
                    fontSize: '1rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.1)';
                    e.target.style.borderColor = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.borderColor = 'rgba(255,255,255,0.8)';
                  }}
                >
                  🔓 Crear Cuenta Gratis
                </button>
              )}
            </div>
            
            <p className="cta-guarantee" style={{
              marginTop: '1.5rem',
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.8)',
              fontStyle: 'italic'
            }}>
              💫 Garantía de satisfacción • Cancela cuando quieras • Soporte 24/7
            </p>
          </div>
        </div>
      </section>

      {/* Modales */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          mode={authMode}
          error={authError}
          loading={authLoading}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
          onSubmit={handleAuthSubmit}
        />
      )}
      
      {showPaymentModal && (
        <PaymentMethodModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          selectedPlan={selectedPlan}
          selectedPeriod={selectedPeriod}
          priceIds={priceIds}
          onStripeCheckout={handleStripeCheckout}
        />
      )}

    </main>
  )
}
