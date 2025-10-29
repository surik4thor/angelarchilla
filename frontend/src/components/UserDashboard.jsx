import '../styles/UserDashboard.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { getPlanLabel } from '../utils/getPlanLabel.js';

// Simulación de horóscopo, reemplazar por datos reales si existen
const fakeHoroscope = 'Hoy es un día para confiar en tu intuición y abrirte a nuevas oportunidades. La energía astral favorece los cambios positivos.';

export default function UserDashboard({ user }) {
  const missingBirthDate = !user.birthDate;
    const planActivo = ['ADEPTO','MAESTRO'].includes((user.subscriptionPlan || '').toUpperCase());
  const isAdmin = user?.role === 'ADMIN' || user?.email === 'surik4thor@icloud.com';
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
    </section>
  );
}
