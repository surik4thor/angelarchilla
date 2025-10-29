import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx'
import AnimatedSubtitle from './AnimatedSubtitle.jsx'
import HomePlans from './HomePlans.jsx'
import PaymentMethodModal from './PaymentMethodModal.jsx'
import AuthModal from './AuthModal.jsx'
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
    const mensajes = [
      'Hoy es un gran día para comenzar nuevos proyectos.',
      'La creatividad fluye en ti. ¡Exprésate!',
      'Es un buen momento para cuidar de ti mismo y relajarte.',
      'Las estrellas están de tu lado, aprovecha las oportunidades.',
      'Recuerda que el amor y la amistad son tesoros valiosos.',
      'La sabiduría ancestral guía tus pasos hoy.',
      'Confía en tu intuición, te llevará por el camino correcto.',
      'Hoy es un día para brillar y mostrar tu verdadero yo.',
      'Las energías cósmicas favorecen la comunicación y el entendimiento.',
      'Es un buen día para aprender algo nuevo o profundizar en tus conocimientos.'
    ]
    const idx = Math.floor(Math.random() * mensajes.length)
    setMensajeUniverso(mensajes[idx])
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
  const priceIds = {
    iniciado: plans.find(p => p.name === 'Iniciado')?.stripeId,
    adepto: plans.find(p => p.name === 'Adepto')?.stripeId,
    maestro: plans.find(p => p.name === 'Maestro')?.stripeId
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

      {/* SERVICIOS DESTACADOS */}
      <section className="cards-destacadas-section" style={{marginBottom: '2.5em'}}>
        <h2 className="section-title" style={{marginBottom: '1.2em'}}>
          ☀️ Tu espacio esotérico ☀️
        </h2>
        <div className="cards-destacadas" role="region" aria-label="Destacados esotéricos">
          {/* ...existing code... */}
        </div>
      </section>


    </main>
  )
}
