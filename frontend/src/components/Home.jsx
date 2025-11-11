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
      {/* HERO ULTRA LIMPIO Y ELEGANTE */}
      <section className="hero-animated-bg" style={{
        padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem)'
      }}>
        <div style={{
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 'clamp(2rem, 6vw, 4rem)', 
          maxWidth: '1200px', 
          margin: '0 auto',
          alignItems: 'center'
        }}>
          <div className="hero-content" style={{textAlign: 'center'}}>
            {/* LOGO Y BRANDING */}
            <div style={{
              fontSize: 'clamp(3rem, 8vw, 4.5rem)', 
              marginBottom: 'clamp(1rem, 3vw, 1.5rem)'
            }}>✨</div>
            <h1 style={{
              fontFamily: 'var(--font-title)',
              color: '#d4af37',
              fontSize: 'clamp(1.8rem, 8vw, 4rem)',
              fontWeight: 800,
              marginBottom: '1rem',
              textShadow: '2px 2px 8px rgba(0,0,0,0.9)',
              lineHeight: '1.1'
            }}>
              Nebulosa Mágica
            </h1>
            
            <AnimatedSubtitle />

            {/* PROPUESTA DE VALOR */}
            <h2 style={{
              color: '#ffffff',
              fontSize: 'clamp(1.3rem, 5vw, 2.2rem)',
              fontWeight: 600,
              marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
              marginTop: 'clamp(2rem, 4vw, 3rem)',
              lineHeight: '1.3',
              textShadow: '1px 1px 4px rgba(0,0,0,0.8)'
            }}>
              Descubre tu Destino con IA Esotérica
            </h2>
            
            <p style={{
              color: '#ffffff',
              fontSize: 'clamp(0.9rem, 3.5vw, 1.2rem)',
              lineHeight: '1.5',
              opacity: 0.9,
              textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
              maxWidth: '500px',
              margin: '0 auto',
              marginBottom: 'clamp(2rem, 4vw, 3rem)',
              padding: '0 1rem'
            }}>
              Tarot, Runas, Horóscopos y Sueños interpretados por inteligencia artificial especializada
            </p>

            {/* BENEFICIOS SIMPLES */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'clamp(0.8rem, 3vw, 2rem)',
              flexWrap: 'wrap',
              marginBottom: 'clamp(2rem, 4vw, 3rem)',
              padding: '0 1rem'
            }}>
              <span style={{
                color: '#d4af37', 
                fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', 
                fontWeight: 500,
                textAlign: 'center'
              }}>🔮 Lecturas Ilimitadas</span>
              <span style={{
                color: '#d4af37', 
                fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', 
                fontWeight: 500,
                textAlign: 'center'
              }}>⚡ Resultados Instantáneos</span>
              <span style={{
                color: '#d4af37', 
                fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', 
                fontWeight: 500,
                textAlign: 'center'
              }}>🔒 100% Privado</span>
            </div>

            {/* CTA PRINCIPAL */}
            <button 
              onClick={() => {
                setAuthMode('register');
                setShowAuthModal(true);
              }}
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                color: '#1a1a2e',
                border: 'none',
                padding: 'clamp(1rem, 3vw, 1.4rem) clamp(2rem, 8vw, 3.5rem)',
                borderRadius: '50px',
                fontSize: 'clamp(1rem, 3.5vw, 1.3rem)',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 10px 35px rgba(212, 175, 55, 0.4)',
                transition: 'all 0.3s ease',
                marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
                width: '100%',
                maxWidth: '320px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px) scale(1.05)';
                e.target.style.boxShadow = '0 15px 45px rgba(212, 175, 55, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 10px 35px rgba(212, 175, 55, 0.4)';
              }}
            >
              🚀 Comenzar Gratis - 7 Días
            </button>

            <p style={{
              color: '#ffffff',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              opacity: 0.8,
              padding: '0 1rem'
            }}>
              Sin compromiso • Cancela cuando quieras
            </p>
          </div>
          
          <div className="hero-promo">
            {/* WIDGET PROMOCIONAL ELEGANTE */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #232946 100%)',
              border: '2px solid #d4af37',
              borderRadius: 'clamp(16px, 4vw, 24px)',
              padding: 'clamp(2rem, 5vw, 3rem) clamp(1.5rem, 4vw, 2.5rem)',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(20px)',
              margin: '0 auto',
              maxWidth: '400px'
            }}>
              {/* Badge superior */}
              <div style={{
                position: 'absolute',
                top: 'clamp(-15px, -3vw, -18px)',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                color: '#ffffff',
                padding: 'clamp(0.6rem, 2vw, 0.8rem) clamp(1.5rem, 5vw, 2.5rem)',
                borderRadius: '30px',
                fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)',
                fontWeight: 700,
                boxShadow: '0 8px 25px rgba(255, 107, 107, 0.4)',
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap'
              }}>
                🎁 OFERTA ESPECIAL
              </div>

              <div style={{
                fontSize: 'clamp(3rem, 8vw, 4.5rem)', 
                marginBottom: 'clamp(1.5rem, 3vw, 2rem)', 
                marginTop: 'clamp(0.5rem, 2vw, 1rem)'
              }}>🎁</div>
              
              <h3 style={{
                color: '#d4af37',
                fontSize: 'clamp(1.6rem, 6vw, 2.2rem)',
                marginBottom: '0.5rem',
                fontWeight: 800,
                textShadow: '0 0 15px rgba(212, 175, 55, 0.5)',
                letterSpacing: 'clamp(0.5px, 1vw, 1px)',
                lineHeight: '1.1'
              }}>
                7 DÍAS GRATIS
              </h3>
              
              <p style={{
                color: '#ffffff',
                fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                marginBottom: 'clamp(2rem, 4vw, 2.5rem)',
                opacity: 0.9,
                lineHeight: '1.4',
                padding: '0 0.5rem'
              }}>
                Acceso completo a todas las<br/>funciones premium
              </p>
              
              {/* Lista de beneficios */}
              <div style={{
                background: 'rgba(212, 175, 55, 0.1)',
                borderRadius: 'clamp(12px, 3vw, 16px)',
                padding: 'clamp(1.5rem, 4vw, 2rem)',
                marginBottom: 'clamp(2rem, 4vw, 2.5rem)',
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 'clamp(1rem, 2vw, 1.2rem)',
                  color: '#ffffff',
                  fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
                  textAlign: 'left'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span style={{color: '#d4af37'}}>✅</span>
                    <span>Tarot ilimitado</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span style={{color: '#d4af37'}}>✅</span>
                    <span>Runas nórdicas</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span style={{color: '#d4af37'}}>✅</span>
                    <span>Horóscopos IA</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span style={{color: '#d4af37'}}>✅</span>
                    <span>Análisis de sueños</span>
                  </div>
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
                  padding: 'clamp(1rem, 3vw, 1.3rem) clamp(1.5rem, 5vw, 2.5rem)',
                  borderRadius: '12px',
                  fontSize: 'clamp(1rem, 3.5vw, 1.25rem)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(212, 175, 55, 0.4)',
                  transition: 'all 0.3s ease',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 12px 35px rgba(212, 175, 55, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.4)';
                }}
              >
                🚀 ACTIVAR AHORA
              </button>
              
              <div style={{
                fontSize: '0.9rem',
                color: '#ffffff',
                marginTop: '2rem',
                opacity: 0.85,
                lineHeight: '1.4'
              }}>
                ⏰ <span style={{color: '#ff6b6b', fontWeight: 600}}>Solo quedan 8 plazas</span><br/>
                <span style={{color: '#d4af37'}}>Termina en 2 días</span>
              </div>
            </div>

            {/* MENSAJE DEL UNIVERSO ELEGANTE */}
            <div style={{
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '20px',
              padding: '2rem',
              marginTop: '2.5rem',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{fontSize: '2.5rem', marginBottom: '1rem', color: '#d4af37'}}>✶</div>
              <h4 style={{
                color: '#d4af37', 
                fontSize: '1.1rem', 
                marginBottom: '1rem', 
                fontWeight: 600,
                textShadow: '0 0 8px rgba(212, 175, 55, 0.5)'
              }}>
                Mensaje del Universo
              </h4>
              <p style={{
                color: '#ffffff',
                fontSize: '0.95rem',
                marginBottom: '0.8rem',
                opacity: 0.95,
                lineHeight: '1.5',
                fontStyle: 'italic'
              }}>
                {mensajeUniverso}
              </p>
              <p style={{color: '#b3bcdf', fontSize: '0.8rem', margin: 0}}>
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ESTADÍSTICAS SOCIALES SIMPLES */}
      <section style={{padding: '2rem', marginBottom: '3rem'}}>
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #d4af37 100%)',
          borderRadius: '24px',
          padding: '2.5rem',
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            color: '#ffffff',
            fontSize: '1.8rem',
            fontWeight: 700,
            marginBottom: '2rem',
            textShadow: '1px 1px 3px rgba(0,0,0,0.8)'
          }}>
            Únete a miles de usuarios satisfechos
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '2rem'
          }}>
            <div>
              <div style={{fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem'}}>
                15,247
              </div>
              <p style={{color: '#f8fafc', fontSize: '0.95rem', margin: 0, opacity: 0.9}}>
                Usuarios Activos
              </p>
            </div>
            <div>
              <div style={{fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem'}}>
                95%
              </div>
              <p style={{color: '#f8fafc', fontSize: '0.95rem', margin: 0, opacity: 0.9}}>
                Precisión IA
              </p>
            </div>
            <div>
              <div style={{fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem'}}>
                4.9★
              </div>
              <p style={{color: '#f8fafc', fontSize: '0.95rem', margin: 0, opacity: 0.9}}>
                Valoración
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WIDGET HOROSCOPO BÁSICO */}
      {!user && <HoroscopoBasicoWidget />}

      {/* SERVICIOS ESOTÉRICOS ELEGANTES */}
      <section style={{padding: '0 2rem', marginBottom: '4rem'}}>
        <h2 style={{
          textAlign: 'center',
          fontSize: 'clamp(1.8rem, 4vw, 2.2rem)',
          color: '#ffffff',
          marginBottom: '3rem',
          fontFamily: 'var(--font-title)',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          fontWeight: 700
        }}>
          ✨ Nuestros Servicios Esotéricos
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2.5rem',
          maxWidth: '1100px',
          margin: '0 auto'
        }}>
          {/* Tarot */}
          <div 
            onClick={() => navigate('/tarot')}
            style={{
              background: 'linear-gradient(135deg, #232946 0%, rgba(139, 92, 246, 0.15) 100%)',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              border: '2px solid rgba(212, 175, 55, 0.2)',
              transition: 'all 0.4s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-8px)';
              e.target.style.boxShadow = '0 15px 40px rgba(139, 92, 246, 0.3)';
              e.target.style.borderColor = '#d4af37';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = 'rgba(212, 175, 55, 0.2)';
            }}
          >
            <div style={{fontSize: '3.5rem', marginBottom: '1.5rem'}}>🔮</div>
            <h3 style={{
              color: '#d4af37', 
              fontSize: '1.4rem', 
              marginBottom: '1rem', 
              fontWeight: 600,
              textShadow: '0 0 10px rgba(212, 175, 55, 0.3)'
            }}>
              Lectura de Tarot
            </h3>
            <p style={{
              color: '#ffffff', 
              fontSize: '1rem', 
              opacity: 0.9, 
              lineHeight: '1.5',
              marginBottom: '1.5rem'
            }}>
              Descubre tu futuro con Madame Celestina y la sabiduría ancestral del Tarot
            </p>
            <div style={{
              background: 'rgba(212, 175, 55, 0.1)',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: '#d4af37',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              ⭐ Más Popular
            </div>
          </div>

          {/* Runas */}
          <div 
            onClick={() => navigate('/runes')}
            style={{
              background: 'linear-gradient(135deg, #232946 0%, rgba(139, 92, 246, 0.15) 100%)',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              border: '2px solid rgba(212, 175, 55, 0.2)',
              transition: 'all 0.4s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-8px)';
              e.target.style.boxShadow = '0 15px 40px rgba(139, 92, 246, 0.3)';
              e.target.style.borderColor = '#d4af37';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = 'rgba(212, 175, 55, 0.2)';
            }}
          >
            <div style={{fontSize: '3.5rem', marginBottom: '1.5rem'}}>⚡</div>
            <h3 style={{
              color: '#d4af37', 
              fontSize: '1.4rem', 
              marginBottom: '1rem', 
              fontWeight: 600,
              textShadow: '0 0 10px rgba(212, 175, 55, 0.3)'
            }}>
              Consulta de Runas
            </h3>
            <p style={{
              color: '#ffffff', 
              fontSize: '1rem', 
              opacity: 0.9, 
              lineHeight: '1.5',
              marginBottom: '1.5rem'
            }}>
              Sabiduría ancestral nórdica con Björn el Sabio y las runas Elder Futhark
            </p>
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: '#3b82f6',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              ⚡ Sabiduría Ancestral
            </div>
          </div>

          {/* Horóscopo */}
          <div 
            onClick={() => navigate('/horoscope')}
            style={{
              background: 'linear-gradient(135deg, #232946 0%, rgba(139, 92, 246, 0.15) 100%)',
              borderRadius: 'clamp(16px, 4vw, 20px)',
              padding: 'clamp(2rem, 5vw, 2.5rem) clamp(1.5rem, 4vw, 2rem)',
              textAlign: 'center',
              cursor: 'pointer',
              border: '2px solid rgba(212, 175, 55, 0.2)',
              transition: 'all 0.4s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-8px)';
              e.target.style.boxShadow = '0 15px 40px rgba(139, 92, 246, 0.3)';
              e.target.style.borderColor = '#d4af37';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = 'rgba(212, 175, 55, 0.2)';
            }}
          >
            <div style={{fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', marginBottom: 'clamp(1rem, 3vw, 1.5rem)'}}>⭐</div>
            <h3 style={{
              color: '#d4af37', 
              fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', 
              marginBottom: 'clamp(0.8rem, 2vw, 1rem)', 
              fontWeight: 600,
              textShadow: '0 0 10px rgba(212, 175, 55, 0.3)'
            }}>
              Horóscopo Personal
            </h3>
            <p style={{
              color: '#ffffff', 
              fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', 
              opacity: 0.9, 
              lineHeight: '1.5',
              marginBottom: 'clamp(1rem, 3vw, 1.5rem)'
            }}>
              Predicciones astrológicas personalizadas con Celeste la Astral
            </p>
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              borderRadius: '8px',
              padding: 'clamp(0.4rem, 1vw, 0.5rem) clamp(0.8rem, 2vw, 1rem)',
              color: '#f59e0b',
              fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
              fontWeight: 600
            }}>
              ⭐ Astrología Premium
            </div>
          </div>

          {/* Sueños */}
          <div 
            onClick={() => navigate('/dream-interpretation')}
            style={{
              background: 'linear-gradient(135deg, #232946 0%, rgba(139, 92, 246, 0.15) 100%)',
              borderRadius: 'clamp(16px, 4vw, 20px)',
              padding: 'clamp(2rem, 5vw, 2.5rem) clamp(1.5rem, 4vw, 2rem)',
              textAlign: 'center',
              cursor: 'pointer',
              border: '2px solid rgba(212, 175, 55, 0.2)',
              transition: 'all 0.4s ease',
              position: 'relative',
              overflow: 'hidden',
              opacity: user?.subscriptionPlan === 'MAESTRO' ? 1 : 0.6
            }}
            onMouseEnter={(e) => {
              if (user?.subscriptionPlan === 'MAESTRO') {
                e.target.style.transform = 'translateY(-8px)';
                e.target.style.boxShadow = '0 15px 40px rgba(139, 92, 246, 0.3)';
                e.target.style.borderColor = '#d4af37';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = 'rgba(212, 175, 55, 0.2)';
            }}
          >
            <div style={{fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', marginBottom: 'clamp(1rem, 3vw, 1.5rem)'}}>🌙</div>
            <h3 style={{
              color: '#d4af37', 
              fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', 
              marginBottom: 'clamp(0.8rem, 2vw, 1rem)', 
              fontWeight: 600,
              textShadow: '0 0 10px rgba(212, 175, 55, 0.3)'
            }}>
              Análisis de Sueños
            </h3>
            <p style={{
              color: '#ffffff', 
              fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', 
              opacity: 0.9, 
              lineHeight: '1.5',
              marginBottom: 'clamp(1rem, 3vw, 1.5rem)'
            }}>
              {user?.subscriptionPlan === 'MAESTRO' 
                ? 'Interpreta tus sueños con Morfeo el Onírico' 
                : 'Desbloquea el análisis de sueños con el Plan Maestro'
              }
            </p>
            <div style={{
              background: user?.subscriptionPlan === 'MAESTRO' 
                ? 'rgba(236, 72, 153, 0.1)' 
                : 'rgba(107, 114, 128, 0.1)',
              borderRadius: '8px',
              padding: 'clamp(0.4rem, 1vw, 0.5rem) clamp(0.8rem, 2vw, 1rem)',
              color: user?.subscriptionPlan === 'MAESTRO' ? '#ec4899' : '#6b7280',
              fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
              fontWeight: 600
            }}>
              {user?.subscriptionPlan === 'MAESTRO' ? '🌙 Exclusivo Maestro' : '🔒 Solo Plan Maestro'}
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL Y REDES SOCIALES */}
      <section style={{padding: '0 clamp(1rem, 4vw, 2rem)', marginBottom: 'clamp(3rem, 6vw, 4rem)'}}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #d4af37 100%)',
          borderRadius: 'clamp(20px, 5vw, 28px)',
          padding: 'clamp(3rem, 8vw, 4rem) clamp(2rem, 6vw, 3rem)',
          textAlign: 'center',
          color: '#fff',
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
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
            animation: 'pulse 6s ease-in-out infinite'
          }}></div>
          
          <div style={{position: 'relative', zIndex: 2}}>
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 2.8rem)',
              marginBottom: '1.5rem',
              fontWeight: 800,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              🌟 ¿Listo para Tu Transformación?
            </h2>
            
            <p style={{
              fontSize: 'clamp(1rem, 3vw, 1.3rem)',
              marginBottom: 'clamp(2rem, 5vw, 3rem)',
              opacity: 0.95,
              lineHeight: '1.5',
              maxWidth: '600px',
              margin: `0 auto clamp(2rem, 5vw, 3rem) auto`
            }}>
              Únete a más de 15,000 usuarios que han descubierto su destino con nuestras lecturas de IA especializada
            </p>

            {/* CTA PRINCIPAL */}
            <div style={{marginBottom: 'clamp(3rem, 6vw, 4rem)'}}>
              <button 
                onClick={() => {
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#8b5cf6',
                  border: 'none',
                  padding: 'clamp(1.2rem, 3.5vw, 1.5rem) clamp(2.5rem, 7vw, 3.5rem)',
                  borderRadius: '50px',
                  fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease',
                  marginBottom: '1.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px) scale(1.05)';
                  e.target.style.boxShadow = '0 15px 50px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 10px 40px rgba(0,0,0,0.3)';
                }}
              >
                🚀 Comenzar Gratis - 7 Días
              </button>
              
              <p style={{
                fontSize: '1rem',
                opacity: 0.9,
                margin: 0
              }}>
                Sin compromiso • Cancela cuando quieras
              </p>
            </div>

            {/* REDES SOCIALES */}
            <div>
              <h3 style={{
                fontSize: '1.4rem',
                marginBottom: '2rem',
                fontWeight: 600
              }}>
                Síguenos para contenido exclusivo diario
              </h3>
              
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1.5rem',
                flexWrap: 'wrap'
              }}>
                <a 
                  href="https://www.tiktok.com/@nebulosamagica"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    padding: '1rem 1.8rem',
                    borderRadius: '16px',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                    e.target.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{fontSize: '1.3rem'}}>🎵</span>
                  <span>TikTok</span>
                </a>

                <a 
                  href="https://www.instagram.com/nebulosa_magica"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    padding: '1rem 1.8rem',
                    borderRadius: '16px',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                    e.target.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{fontSize: '1.3rem'}}>📸</span>
                  <span>Instagram</span>
                </a>

                <a 
                  href="https://www.facebook.com/profile.php?id=61582853754961"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    padding: '1rem 1.8rem',
                    borderRadius: '16px',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                    e.target.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{fontSize: '1.3rem'}}>👥</span>
                  <span>Facebook</span>
                </a>

                <a 
                  href="https://www.threads.com/@nebulosa_magica?xmt=AQF0C8O4OKeUjJQQrVo52EMRFPa0ehKbNYfyoqrOcfbHh2A"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    padding: '1rem 1.8rem',
                    borderRadius: '16px',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                    e.target.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{fontSize: '1.3rem'}}>💬</span>
                  <span>Threads</span>
                </a>
              </div>
            </div>
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