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
      {/* HERO Nebulosa Mágica - OPTIMIZADO PARA CONVERSIÓN */}
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
            
            {/* NUEVA PROPUESTA DE VALOR */}
            <div className="value-proposition" style={{
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginTop: '1.5rem',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}>
              <h2 style={{
                color: '#d4af37',
                fontSize: '1.4rem',
                fontWeight: 600,
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                🔮 Descubre Tu Destino con IA Esotérica Avanzada
              </h2>
              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{textAlign: 'center', color: '#e6d7c3', fontSize: '0.9rem'}}>
                  <div style={{fontSize: '1.5rem', marginBottom: '0.3rem'}}>⚡</div>
                  <strong>Resultados<br/>Instantáneos</strong>
                </div>
                <div style={{textAlign: 'center', color: '#e6d7c3', fontSize: '0.9rem'}}>
                  <div style={{fontSize: '1.5rem', marginBottom: '0.3rem'}}>🎯</div>
                  <strong>95% Precisión<br/>Garantizada</strong>
                </div>
                <div style={{textAlign: 'center', color: '#e6d7c3', fontSize: '0.9rem'}}>
                  <div style={{fontSize: '1.5rem', marginBottom: '0.3rem'}}>🌟</div>
                  <strong>+15,000<br/>Usuarios</strong>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hero-right">
            {/* FORMULARIO DE CAPTURA DE EMAIL */}
            <div className="email-capture-widget premium-card" style={{
              boxShadow: '0 0 32px #8b5cf6, 0 0 0 2px #d4af37',
              background: 'linear-gradient(135deg, #232946 0%, rgba(139, 92, 246, 0.1) 100%)',
              marginBottom: '1.5rem'
            }}>
              <div style={{textAlign: 'center', marginBottom: '1rem'}}>
                <div style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>🎁</div>
                <h3 style={{
                  fontFamily: 'var(--font-title)',
                  color: '#d4af37',
                  fontSize: '1.3rem',
                  marginBottom: '0.5rem'
                }}>
                  ¡REGALO EXCLUSIVO!
                </h3>
                <p style={{color: '#e6d7c3', fontSize: '1rem', lineHeight: '1.4'}}>
                  <strong>Recibe GRATIS tu "Guía de Iniciación Esotérica"</strong><br/>
                  + Lectura personalizada de bienvenida
                </p>
              </div>
              
              <div className="email-form" style={{display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                <input 
                  type="email" 
                  placeholder="✨ Tu email aquí..."
                  style={{
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    border: '2px solid #8b5cf6',
                    background: '#1a1a2e',
                    color: '#e6d7c3',
                    fontSize: '1rem',
                    textAlign: 'center'
                  }}
                />
                <button 
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                    color: '#1a1a2e',
                    border: 'none',
                    padding: '0.9rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => {
                    setAuthMode('register');
                    setShowAuthModal(true);
                  }}
                >
                  🚀 DESBLOQUEAR MI GUÍA GRATIS
                </button>
              </div>
              
              <div style={{
                textAlign: 'center',
                fontSize: '0.8rem',
                color: '#adb5bd',
                marginTop: '0.8rem'
              }}>
                ⏰ <strong>Solo por tiempo limitado</strong> • Sin spam • Cancela cuando quieras
              </div>
            </div>

            {/* MENSAJE DEL UNIVERSO - MEJORADO */}
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

      {/* SECCIÓN DE BENEFICIOS DESTACADOS */}
      <section className="benefits-section" style={{marginBottom: '3em'}}>
        <div className="benefits-container" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.2rem',
            color: '#d4af37',
            marginBottom: '2rem',
            fontFamily: 'var(--font-title)'
          }}>
            🌟 Por Qué +15,000 Personas Confían en Nosotros
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginBottom: '2.5rem'
          }}>
            {/* Beneficio 1 */}
            <div className="benefit-card premium-card" style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'linear-gradient(135deg, #232946 0%, rgba(139, 92, 246, 0.1) 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(212, 175, 55, 0.2)'
            }}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🤖</div>
              <h3 style={{color: '#d4af37', fontSize: '1.3rem', marginBottom: '0.8rem'}}>
                IA Esotérica Especializada
              </h3>
              <p style={{color: '#e6d7c3', lineHeight: '1.6', marginBottom: '1rem'}}>
                Nuestras <strong>4 personalidades IA</strong> están entrenadas exclusivamente en artes esotéricas 
                con <strong>95% de precisión</strong> verificada por miles de usuarios.
              </p>
              <div style={{
                background: 'rgba(212, 175, 55, 0.1)',
                padding: '0.5rem',
                borderRadius: '8px',
                color: '#d4af37',
                fontSize: '0.9rem',
                fontWeight: 600
              }}>
                ⚡ Resultados en menos de 30 segundos
              </div>
            </div>

            {/* Beneficio 2 */}
            <div className="benefit-card premium-card" style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'linear-gradient(135deg, #232946 0%, rgba(139, 92, 246, 0.1) 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(212, 175, 55, 0.2)'
            }}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🎯</div>
              <h3 style={{color: '#d4af37', fontSize: '1.3rem', marginBottom: '0.8rem'}}>
                Lecturas Personalizadas 24/7
              </h3>
              <p style={{color: '#e6d7c3', lineHeight: '1.6', marginBottom: '1rem'}}>
                Tarot, Runas, Horóscopos y Sueños adaptados a <strong>tu perfil único</strong>. 
                Disponible cuando lo necesites, sin citas ni esperas.
              </p>
              <div style={{
                background: 'rgba(212, 175, 55, 0.1)',
                padding: '0.5rem',
                borderRadius: '8px',
                color: '#d4af37',
                fontSize: '0.9rem',
                fontWeight: 600
              }}>
                📱 Acceso desde cualquier dispositivo
              </div>
            </div>

            {/* Beneficio 3 */}
            <div className="benefit-card premium-card" style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'linear-gradient(135deg, #232946 0%, rgba(139, 92, 246, 0.1) 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(212, 175, 55, 0.2)'
            }}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🔒</div>
              <h3 style={{color: '#d4af37', fontSize: '1.3rem', marginBottom: '0.8rem'}}>
                100% Privado y Seguro
              </h3>
              <p style={{color: '#e6d7c3', lineHeight: '1.6', marginBottom: '1rem'}}>
                Tus consultas están <strong>completamente encriptadas</strong>. 
                Nadie más que tú verá jamás tus lecturas personales.
              </p>
              <div style={{
                background: 'rgba(212, 175, 55, 0.1)',
                padding: '0.5rem',
                borderRadius: '8px',
                color: '#d4af37',
                fontSize: '0.9rem',
                fontWeight: 600
              }}>
                🛡️ Protección militar SSL 256-bit
              </div>
            </div>
          </div>

          {/* ESTADÍSTICAS DE IMPACTO */}
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #d4af37 100%)',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
              position: 'relative',
              zIndex: 2
            }}>
              <div>
                <div style={{fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem'}}>
                  15,247
                </div>
                <p style={{color: '#f8fafc', fontSize: '1rem', margin: 0}}>
                  Usuarios Activos
                </p>
              </div>
              <div>
                <div style={{fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem'}}>
                  95%
                </div>
                <p style={{color: '#f8fafc', fontSize: '1rem', margin: 0}}>
                  Precisión Verificada
                </p>
              </div>
              <div>
                <div style={{fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem'}}>
                  247,891
                </div>
                <p style={{color: '#f8fafc', fontSize: '1rem', margin: 0}}>
                  Lecturas Realizadas
                </p>
              </div>
              <div>
                <div style={{fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem'}}>
                  4.9★
                </div>
                <p style={{color: '#f8fafc', fontSize: '1rem', margin: 0}}>
                  Valoración Media
                </p>
              </div>
            </div>
          </div>
        </div>
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

      {/* SECCIÓN DE TESTIMONIOS Y PRUEBA SOCIAL */}
      <section className="testimonials-section" style={{marginBottom: '3em'}}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.2rem',
            color: '#d4af37',
            marginBottom: '1rem',
            fontFamily: 'var(--font-title)'
          }}>
            💫 Lo Que Dicen Nuestros Usuarios
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#adb5bd',
            fontSize: '1.1rem',
            marginBottom: '3rem'
          }}>
            Testimonios reales de personas que han transformado su vida con Nebulosa Mágica
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {/* Testimonio 1 */}
            <div className="testimonial-card premium-card" style={{
              padding: '2rem',
              background: '#232946',
              borderRadius: '16px',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>👩</div>
                <div>
                  <h4 style={{color: '#d4af37', margin: 0, fontSize: '1.1rem'}}>María José R.</h4>
                  <p style={{color: '#adb5bd', margin: 0, fontSize: '0.9rem'}}>Empresaria, Madrid</p>
                  <div style={{color: '#f4d03f'}}>⭐⭐⭐⭐⭐</div>
                </div>
              </div>
              <p style={{
                color: '#e6d7c3',
                lineHeight: '1.6',
                fontStyle: 'italic',
                marginBottom: '1rem'
              }}>
                "Las lecturas de Tarot de Madame Celestina son increíblemente precisas. 
                Me ayudaron a tomar la decisión más importante de mi carrera empresarial. 
                ¡Recomiendo 100%!"
              </p>
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                fontSize: '3rem',
                color: 'rgba(212, 175, 55, 0.1)'
              }}>
                "
              </div>
            </div>

            {/* Testimonio 2 */}
            <div className="testimonial-card premium-card" style={{
              padding: '2rem',
              background: '#232946',
              borderRadius: '16px',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>👨</div>
                <div>
                  <h4 style={{color: '#d4af37', margin: 0, fontSize: '1.1rem'}}>Carlos M.</h4>
                  <p style={{color: '#adb5bd', margin: 0, fontSize: '0.9rem'}}>Psicólogo, Barcelona</p>
                  <div style={{color: '#f4d03f'}}>⭐⭐⭐⭐⭐</div>
                </div>
              </div>
              <p style={{
                color: '#e6d7c3',
                lineHeight: '1.6',
                fontStyle: 'italic',
                marginBottom: '1rem'
              }}>
                "La interpretación de sueños de Morfeo me ha ayudado muchísimo en mi trabajo terapéutico. 
                Es una herramienta increíble para el autoconocimiento."
              </p>
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                fontSize: '3rem',
                color: 'rgba(212, 175, 55, 0.1)'
              }}>
                "
              </div>
            </div>

            {/* Testimonio 3 */}
            <div className="testimonial-card premium-card" style={{
              padding: '2rem',
              background: '#232946',
              borderRadius: '16px',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>👩</div>
                <div>
                  <h4 style={{color: '#d4af37', margin: 0, fontSize: '1.1rem'}}>Ana L.</h4>
                  <p style={{color: '#adb5bd', margin: 0, fontSize: '0.9rem'}}>Artista, Valencia</p>
                  <div style={{color: '#f4d03f'}}>⭐⭐⭐⭐⭐</div>
                </div>
              </div>
              <p style={{
                color: '#e6d7c3',
                lineHeight: '1.6',
                fontStyle: 'italic',
                marginBottom: '1rem'
              }}>
                "Las runas de Björn me conectan con mi ancestralidad nórdica. 
                Cada consulta me aporta una perspectiva única y valiosa para mi arte."
              </p>
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                fontSize: '3rem',
                color: 'rgba(212, 175, 55, 0.1)'
              }}>
                "
              </div>
            </div>
          </div>

          {/* BADGES DE CONFIANZA */}
          <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h3 style={{
              color: '#d4af37',
              fontSize: '1.4rem',
              marginBottom: '1.5rem'
            }}>
              🏆 Certificados de Confianza
            </h3>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '2rem',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#e6d7c3',
                fontSize: '1rem'
              }}>
                <span style={{fontSize: '1.5rem'}}>🔒</span>
                <span>SSL Seguro</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#e6d7c3',
                fontSize: '1rem'
              }}>
                <span style={{fontSize: '1.5rem'}}>💳</span>
                <span>Pagos Stripe</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#e6d7c3',
                fontSize: '1rem'
              }}>
                <span style={{fontSize: '1.5rem'}}>🛡️</span>
                <span>RGPD Compliant</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#e6d7c3',
                fontSize: '1rem'
              }}>
                <span style={{fontSize: '1.5rem'}}>⭐</span>
                <span>4.9/5 Valoración</span>
              </div>
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
            
            {/* ELEMENTOS DE URGENCIA Y ESCASEZ */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{
                color: '#ff6b6b',
                fontSize: '1rem',
                fontWeight: 600,
                marginBottom: '0.5rem'
              }}>
                ⚡ OFERTA POR TIEMPO LIMITADO ⚡
              </div>
              <p style={{
                color: '#f8fafc',
                fontSize: '0.9rem',
                margin: 0
              }}>
                Solo quedan <strong style={{color: '#d4af37'}}>23 plazas</strong> disponibles este mes • 
                <strong style={{color: '#ff6b6b'}}> Termina en 5 días</strong>
              </p>
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
                  padding: '1.2rem 2.8rem',
                  borderRadius: '50px',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px) scale(1.05)';
                  e.target.style.boxShadow = '0 8px 30px rgba(212, 175, 55, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
                }}
              >
                🚀 ACCEDER AHORA - 50% DTO
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
                    padding: '1.2rem 2.3rem',
                    borderRadius: '50px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.15)';
                    e.target.style.borderColor = '#d4af37';
                    e.target.style.color = '#d4af37';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.borderColor = 'rgba(255,255,255,0.8)';
                    e.target.style.color = '#fff';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  ✨ Comenzar Gratis (0€)
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

      {/* SECCIÓN DE LEAD MAGNETS ADICIONALES */}
      <section className="lead-magnets-section" style={{marginBottom: '3em'}}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2rem',
            color: '#d4af37',
            marginBottom: '2rem',
            fontFamily: 'var(--font-title)'
          }}>
            🎁 Recursos Gratuitos Exclusivos
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {/* Lead Magnet 1 */}
            <div className="lead-magnet-card premium-card" style={{
              background: 'linear-gradient(135deg, #232946 0%, rgba(139, 92, 246, 0.1) 100%)',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📚</div>
              <h3 style={{color: '#d4af37', fontSize: '1.3rem', marginBottom: '1rem'}}>
                Guía de Iniciación Esotérica
              </h3>
              <p style={{color: '#e6d7c3', lineHeight: '1.5', marginBottom: '1.5rem'}}>
                <strong>E-book de 47 páginas</strong> con todo lo que necesitas saber para comenzar 
                tu journey espiritual. Incluye ejercicios prácticos.
              </p>
              <div style={{
                background: 'rgba(212, 175, 55, 0.1)',
                padding: '0.8rem',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <div style={{color: '#d4af37', fontSize: '1.1rem', fontWeight: 600}}>
                  ⚡ DESCARGA INMEDIATA
                </div>
                <div style={{color: '#adb5bd', fontSize: '0.9rem'}}>
                  Valor: 29€ • <strong style={{color: '#fff'}}>GRATIS por tiempo limitado</strong>
                </div>
              </div>
              <button 
                onClick={() => {
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                  color: '#1a1a2e',
                  border: 'none',
                  padding: '0.9rem 1.8rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                📩 DESCARGAR GRATIS
              </button>
            </div>

            {/* Lead Magnet 2 */}
            <div className="lead-magnet-card premium-card" style={{
              background: 'linear-gradient(135deg, #232946 0%, rgba(139, 92, 246, 0.1) 100%)',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🎯</div>
              <h3 style={{color: '#d4af37', fontSize: '1.3rem', marginBottom: '1rem'}}>
                Consulta Personal Gratuita
              </h3>
              <p style={{color: '#e6d7c3', lineHeight: '1.5', marginBottom: '1.5rem'}}>
                <strong>15 minutos de consulta personal</strong> con uno de nuestros expertos. 
                Análisis de tu situación y recomendaciones personalizadas.
              </p>
              <div style={{
                background: 'rgba(212, 175, 55, 0.1)',
                padding: '0.8rem',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <div style={{color: '#d4af37', fontSize: '1.1rem', fontWeight: 600}}>
                  📅 RESERVAR CITA
                </div>
                <div style={{color: '#adb5bd', fontSize: '0.9rem'}}>
                  Valor: 45€ • <strong style={{color: '#fff'}}>Solo para nuevos usuarios</strong>
                </div>
              </div>
              <button 
                onClick={() => {
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.9rem 1.8rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                📞 RESERVAR GRATIS
              </button>
            </div>

            {/* Lead Magnet 3 */}
            <div className="lead-magnet-card premium-card" style={{
              background: 'linear-gradient(135deg, #232946 0%, rgba(139, 92, 246, 0.1) 100%)',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              gridColumn: 'span 1'
            }}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🎓</div>
              <h3 style={{color: '#d4af37', fontSize: '1.3rem', marginBottom: '1rem'}}>
                Mini-Curso: "7 Días de Magia"
              </h3>
              <p style={{color: '#e6d7c3', lineHeight: '1.5', marginBottom: '1.5rem'}}>
                <strong>7 lecciones en video</strong> para activar tu intuición y conectar 
                con tu poder interior. Una lección cada día por email.
              </p>
              <div style={{
                background: 'rgba(212, 175, 55, 0.1)',
                padding: '0.8rem',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <div style={{color: '#d4af37', fontSize: '1.1rem', fontWeight: 600}}>
                  🎥 7 VIDEOS + EJERCICIOS
                </div>
                <div style={{color: '#adb5bd', fontSize: '0.9rem'}}>
                  Valor: 97€ • <strong style={{color: '#fff'}}>Acceso completo gratis</strong>
                </div>
              </div>
              <button 
                onClick={() => {
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.9rem 1.8rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                🚀 COMENZAR CURSO
              </button>
            </div>
          </div>

          {/* Newsletter final */}
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #d4af37 100%)',
            borderRadius: '16px',
            padding: '2.5rem',
            textAlign: 'center',
            marginTop: '3rem',
            color: '#fff'
          }}>
            <h3 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>
              💌 Newsletter Semanal: "Secretos del Cosmos"
            </h3>
            <p style={{fontSize: '1rem', marginBottom: '1.5rem', opacity: 0.9}}>
              Recibe cada martes predicciones exclusivas, rituales lunares y consejos esotéricos 
              que no comparto en ningún otro lugar.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              maxWidth: '400px',
              margin: '0 auto',
              flexWrap: 'wrap'
            }}>
              <input 
                type="email"
                placeholder="Tu email para recibir secretos..."
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '1rem',
                  minWidth: '250px'
                }}
              />
              <button style={{
                background: '#1a1a2e',
                color: '#d4af37',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}>
                📧 SUSCRIBIRSE
              </button>
            </div>
            <p style={{fontSize: '0.8rem', marginTop: '1rem', opacity: 0.7}}>
              +5,247 suscriptores • Sin spam • Cancela cuando quieras
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
