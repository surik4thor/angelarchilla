import '../styles/UserDashboard.css';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPlanLabel } from '../utils/getPlanLabel.js';
import api from '../api/api.js';
import CalendarioUnificado from './CalendarioUnificado.jsx';

// Componente de métricas de usuario
const UserMetrics = ({ userStats, user }) => {
  if (!userStats) return null;

  const { currentUsage, limits, remaining, features, userPlan } = userStats;
  const planColors = {
    INVITADO: '#9CA3AF',
    INICIADO: '#3B82F6',
    ADEPTO: '#8B5CF6',
    MAESTRO: '#F59E0B'
  };

  const planColor = planColors[userPlan] || planColors.INVITADO;

  return (
    <div className="user-metrics" style={{
      background: 'linear-gradient(135deg, #232946 0%, #d4af37 100%)',
      padding: '1.5rem',
      borderRadius: '16px',
      margin: '1rem 0',
      color: 'white'
    }}>
      <h3 style={{fontFamily: 'var(--font-title)', marginBottom: '1rem', textAlign: 'center'}}>
        📊 Tu Actividad en Nebulosa Mágica
      </h3>
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
        {/* Lecturas realizadas */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🎴</div>
          <div style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{currentUsage.readings.thisMonth}</div>
          <div style={{fontSize: '0.9rem', opacity: 0.8}}>Lecturas este mes</div>
          {limits.maxReadingsPerMonth && (
            <div style={{fontSize: '0.8rem', marginTop: '0.25rem'}}>
              Límite: {limits.maxReadingsPerMonth}
            </div>
          )}
        </div>

        {/* Sueños interpretados */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🌙</div>
          <div style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{currentUsage.dreams.thisMonth}</div>
          <div style={{fontSize: '0.9rem', opacity: 0.8}}>Sueños interpretados</div>
          {features.dreams ? (
            <div style={{fontSize: '0.8rem', color: '#4ade80', marginTop: '0.25rem'}}>✓ Disponible</div>
          ) : (
            <div style={{fontSize: '0.8rem', color: '#f87171', marginTop: '0.25rem'}}>✗ Requiere MAESTRO</div>
          )}
        </div>

        {/* Tiempo en plataforma */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>⏰</div>
          <div style={{fontSize: '1.5rem', fontWeight: 'bold'}}>
            {user.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
          </div>
          <div style={{fontSize: '0.9rem', opacity: 0.8}}>Días contigo</div>
        </div>

        {/* Plan actual con progreso */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>👑</div>
          <div style={{fontSize: '1.2rem', fontWeight: 'bold', color: planColor}}>
            {getPlanLabel(userPlan)}
          </div>
          <div style={{fontSize: '0.9rem', opacity: 0.8}}>Plan actual</div>
          {userPlan !== 'MAESTRO' && (
            <Link to="/planes" style={{
              fontSize: '0.8rem',
              color: '#eebc1d',
              textDecoration: 'underline',
              display: 'block',
              marginTop: '0.25rem'
            }}>
              Mejorar plan
            </Link>
          )}
        </div>
      </div>

      {/* Barra de progreso para lecturas mensuales */}
      {limits.maxReadingsPerMonth && (
        <div style={{marginTop: '1rem'}}>
          <div style={{fontSize: '0.9rem', marginBottom: '0.5rem', textAlign: 'center'}}>
            Lecturas utilizadas: {currentUsage.readings.thisMonth} / {limits.maxReadingsPerMonth}
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            height: '8px',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: currentUsage.readings.thisMonth >= limits.maxReadingsPerMonth 
                ? '#f87171' 
                : planColor,
              height: '100%',
              width: `${Math.min(100, (currentUsage.readings.thisMonth / limits.maxReadingsPerMonth) * 100)}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {/* Funciones disponibles */}
      <div style={{marginTop: '1rem', textAlign: 'center'}}>
        <div style={{fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.8}}>Funciones disponibles:</div>
        <div style={{display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap'}}>
          <span style={{color: features.natalCharts ? '#4ade80' : '#f87171'}}>
            {features.natalCharts ? '✓' : '✗'} Cartas Natales
          </span>
          <span style={{color: features.personalizedHoroscopes ? '#4ade80' : '#f87171'}}>
            {features.personalizedHoroscopes ? '✓' : '✗'} Horóscopos
          </span>
          <span style={{color: features.history ? '#4ade80' : '#f87171'}}>
            {features.history ? '✓' : '✗'} Historial
          </span>
          <span style={{color: features.partnerSync ? '#4ade80' : '#f87171'}}>
            {features.partnerSync ? '✓' : '✗'} Parejas
          </span>
        </div>
      </div>
    </div>
  );
};

export default function UserDashboard({ user }) {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const missingBirthDate = !user.birthDate;
  const planActivo = ['ADEPTO','MAESTRO'].includes((user.subscriptionPlan || '').toUpperCase());
  const isAdmin = user?.role === 'ADMIN' || user?.email === 'surik4thor@icloud.com';

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await api.get('/api/user/usage-stats');
        setUserStats(response.data);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);
  return (
  <section className="user-dashboard">
      <div className="welcome-section">
        {missingBirthDate && (
          <div style={{background:'#ffe066',color:'#232946',padding:'0.75em',borderRadius:'8px',marginBottom:'1em',fontWeight:'bold'}}>
            ¡Completa tu perfil para una experiencia personalizada!<br/>
            <Link to="/profile/edit" style={{color:'#d4af37',textDecoration:'underline'}}>Añadir fecha de nacimiento</Link>
          </div>
        )}
        <h2 className="welcome-title" style={{fontFamily: 'var(--font-title)'}}>
          ❤️
          Bienvenido de vuelta, {user.username || user.email?.split('@')[0]}
        </h2>
        <p className="user-plan" style={{fontFamily: 'var(--font-base)'}}>
          Plan actual: <span className={`plan-${user.subscriptionPlan?.toLowerCase()}`}>
            {getPlanLabel(user.subscriptionPlan)}
          </span>
        </p>
      </div>

      {/* Métricas de usuario */}
      {!loading && <UserMetrics userStats={userStats} user={user} />}

      {/* Bloque para lectura diaria con selección */}
      <div className="dashboard-block dashboard-reading">
        <div className="action-card primary">
          <div className="action-icon">
            🎴
          </div>
          <div className="action-content">
            <h3 style={{fontFamily: 'var(--font-title)'}}>Tu lectura diaria</h3>
            <p style={{fontFamily: 'var(--font-base)'}}>¿Qué deseas consultar hoy?</p>
            <div className="reading-options" style={{display:'flex',justifyContent:'center',margin:'1.2em 0'}}>
              <Link to="/tarot" className="action-btn premium-btn" aria-label="Ir a lectura de Tarot" style={{background:'linear-gradient(90deg,#d4af37 60%,#8a2be2 100%)',color:'#fff',fontWeight:800,padding:'1.1em 2.5em',fontSize:'1.1em',borderRadius:'16px',boxShadow:'0 2px 12px #d4af3788',marginRight:'0.7em'}}>
                🎴 Tarot
              </Link>
              <Link to="/runes" className="action-btn premium-btn" aria-label="Ir a lectura de Runas" style={{background:'linear-gradient(90deg,#25d366 60%,#128c7e 100%)',color:'#fff',fontWeight:800,padding:'1.1em 2.5em',fontSize:'1.1em',borderRadius:'16px',boxShadow:'0 2px 12px #25d36688',marginRight:'0.7em'}}>
                ®️ Runas
              </Link>
              <Link to="/suenos" className="action-btn premium-btn" aria-label="Ir a interpretación de sueños" style={{background:'linear-gradient(90deg,#232946 60%,#eebc1d 100%)',color:'#fff',fontWeight:800,padding:'1.1em 2.5em',fontSize:'1.1em',borderRadius:'16px',boxShadow:'0 2px 12px #23294688'}}>
                🌙 Sueños
              </Link>
            </div>
            <div className="reading-desc" style={{fontFamily: 'var(--font-base)',textAlign:'center'}}>
              <span>Accede a una experiencia premium y elige tu método después de pulsar el botón.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bloque para diario de sueños */}
      <div className="dashboard-block dashboard-dreams">
        <div className="action-card secondary">
          <div className="action-icon">
            <span role="img" aria-label="Blog">📝</span>
          </div>
          <div className="action-content">
            <h3 style={{fontFamily: 'var(--font-title)'}}>Diario de sueños</h3>
            {planActivo ? (
              <div style={{color:'#2ecc40',margin:'1em 0'}}>
                Accede y gestiona tu diario de sueños aquí.<br/>
                <Link to="/dreams" className="action-btn" style={{background:'#eebc1d',color:'#232946',borderRadius:4,padding:'4px 12px'}}>Ir al diario</Link>
              </div>
            ) : (
              <div style={{color:'#ff4136',fontWeight:'bold',margin:'1em 0'}}>
                El acceso al diario de sueños es exclusivo para suscriptores <b>ADEPTO o MAESTRO</b>.<br/>
                Actualiza tu suscripción para desbloquear esta función.<br/>
                <Link to="/planes" style={{color:'#eebc1d',textDecoration:'underline'}}>Ver planes disponibles</Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Panel Admin solo visible para admin */}
      {isAdmin && (
        <div className="dashboard-block dashboard-admin">
          <div className="action-card admin">
            <div className="action-icon">
              <span role="img" aria-label="Admin">🛡️</span>
            </div>
            <div className="action-content">
              <h3 style={{fontFamily: 'var(--font-title)'}}>Panel de Administración</h3>
              <Link to="/admin" className="action-btn" style={{background:'#d4af37',color:'#232946',borderRadius:4,padding:'4px 12px'}}>Ir al Panel Admin</Link>
            </div>
          </div>
        </div>
      )}

      {/* Botón para mostrar calendario */}
      <div className="dashboard-block dashboard-calendar">
        <div className="action-card secondary">
          <div className="action-icon">
            <span role="img" aria-label="Calendario">📅</span>
          </div>
          <div className="action-content">
            <h3 style={{fontFamily: 'var(--font-title)'}}>Tu Calendario Místico</h3>
            <p style={{fontFamily: 'var(--font-base)'}}>
              Revisa tu historial de lecturas, sueños interpretados y eventos astrológicos
            </p>
            <button 
              onClick={() => setShowCalendar(!showCalendar)}
              className="action-btn" 
              style={{
                background: showCalendar ? '#8b5cf6' : '#d4af37',
                color: '#232946',
                borderRadius: 4,
                padding: '8px 16px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {showCalendar ? 'Ocultar Calendario' : 'Ver Calendario'}
            </button>
          </div>
        </div>
      </div>

      {/* Calendario unificado */}
      {showCalendar && (
        <div className="dashboard-block dashboard-calendar-view">
          <CalendarioUnificado user={user} />
        </div>
      )}

      {/* Biblioteca de Tutoriales */}
      <div className="dashboard-block dashboard-tutorials">
        <div className="action-card secondary">
          <div className="action-icon">
            <span role="img" aria-label="Tutoriales">📚</span>
          </div>
          <div className="action-content">
            <h3 style={{fontFamily: 'var(--font-title)'}}>Biblioteca de Conocimiento Místico</h3>
            <p style={{fontFamily: 'var(--font-base)'}}>
              Aprende las artes esotéricas con nuestras guías completas y especializadas. 
              <strong style={{color: '#eebc1d'}}> ¡Acceso incluido en tu plan actual!</strong>
            </p>
            <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center'}}>
              <Link 
                to="/tutoriales" 
                className="action-btn" 
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: 'white',
                  borderRadius: 8,
                  padding: '8px 16px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  display: 'inline-block',
                  marginTop: '0.5rem'
                }}
              >
                📖 Explorar Tutoriales
              </Link>
              <Link 
                to="/planes" 
                className="action-btn" 
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #eebc1d 100%)',
                  color: '#232946',
                  borderRadius: 8,
                  padding: '8px 16px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  display: 'inline-block',
                  marginTop: '0.5rem'
                }}
              >
                👑 Ver Todos los Planes
              </Link>
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#4ade80',
              fontWeight: 'bold',
              marginTop: '0.8rem',
              padding: '0.5rem',
              background: 'rgba(74, 222, 128, 0.1)',
              borderRadius: '6px',
              border: '1px solid rgba(74, 222, 128, 0.3)'
            }}>
              ✅ Tutoriales disponibles para usuarios {getPlanLabel(user.subscriptionPlan)} y superiores
              {!planActivo && (
                <div style={{marginTop: '0.5rem', color: '#eebc1d'}}>
                  🎁 ¡Actualiza tu plan y encuentra cupones especiales de bienvenida!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
