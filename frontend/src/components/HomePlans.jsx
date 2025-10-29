import '../styles/HomePlans.css';
import { getPlanLabel } from '../utils/getPlanLabel.js';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
export default function HomePlans({ onSubscribe, priceIds, currentPlan, plans }) {
  const navigate = useNavigate();
  // Obtiene el objeto del plan por clave
  const getPlanObj = planKey => plans?.find(p => p.name.toLowerCase() === planKey);

  // Handler local para cada botón
  const handleSubscribeClick = useCallback((plan) => {
    // Siempre redirige a /planes
    navigate('/planes');
  }, [navigate]);

  return (
    <section className="premium-upgrade">
      <div className="upgrade-header">
        <h3 style={{fontFamily: 'var(--font-title)'}}>
          <span role="img" aria-label="Corona">👑</span>
          Desbloquea todo tu potencial místico
        </h3>
        <p style={{fontFamily: 'var(--font-base)'}}>Mejora tu plan y accede a experiencias premium</p>
      </div>
      <div className="plans-comparison">
        {/* Invitado */}
        <div className={`plan-card${currentPlan === 'invitado' ? ' current' : ''}`}> 
          <div className="plan-header invitado">
            <h4 style={{fontFamily: 'var(--font-title)'}}>{getPlanLabel('invitado')}</h4>
            <div className="plan-price">Gratis</div>
            {currentPlan === 'invitado' && <div className="plan-badge current-badge">Actual</div>}
          </div>
          <ul className="plan-features">
            <li><span role="img" aria-label="Check">✅</span> 3 lecturas mensuales</li>
            <li><span role="img" aria-label="Check">✅</span> Horóscopo básico</li>
            <li><span role="img" aria-label="Cancelar">❌</span> Sin historial detallado</li>
            <li><span role="img" aria-label="Cancelar">❌</span> Sin descuentos</li>
          </ul>
// Eliminado código duplicado fuera de la función
        </div>
        {/* Iniciado */}
        <div className={`plan-card recommended${currentPlan === 'iniciado' ? ' current' : ''}`}> 
          <div className="plan-header premium">
            <h4 style={{fontFamily: 'var(--font-title)'}}>{getPlanLabel('iniciado')}</h4>
            <div className="plan-price">€{getPlanObj('iniciado')?.priceMonthly?.toFixed(2)}<span>/mes</span></div>
            {currentPlan === 'iniciado' && <div className="plan-badge current-badge">Actual</div>}
          </div>
          <ul className="plan-features">
            <li><span role="img" aria-label="Check">✅</span> 15 lecturas mensuales</li>
            <li><span role="img" aria-label="Check">✅</span> Consultas personalizadas</li>
            <li><span role="img" aria-label="Check">✅</span> Horóscopo avanzado diario</li>
            <li><span role="img" aria-label="Check">✅</span> Descuentos exclusivos</li>
          </ul>
          <div style={{display:'flex', gap:'0.7em', flexWrap:'wrap'}}>
            <button
              className="home-form-btn upgrade-btn"
              style={{fontFamily: 'var(--font-btn)'}}
              onClick={() => handleSubscribeClick('iniciado')}
            >
              <span role="img" aria-label="Corona">👑</span> Suscribirse
            </button>
          </div>
        </div>
        {/* Adepto */}
        <div className={`plan-card${currentPlan === 'adepto' ? ' current' : ''}`}> 
          <div className="plan-header vip">
            <h4 style={{fontFamily: 'var(--font-title)'}}>{getPlanLabel('adepto')}</h4>
            <div className="plan-price">€{getPlanObj('adepto')?.priceMonthly?.toFixed(2)}<span>/mes</span></div>
            <div className="plan-badge popular-badge">Recomendado</div>
            {currentPlan === 'adepto' && <div className="plan-badge current-badge">Actual</div>}
          </div>
          <ul className="plan-features">
            <li><span role="img" aria-label="Check">✅</span> Todo lo de Iniciado</li>
            <li><span role="img" aria-label="Check">✅</span> 30 lecturas mensuales</li>
            <li><span role="img" aria-label="Check">✅</span> Historial de lecturas</li>
            <li><span role="img" aria-label="Check">✅</span> Carta astral anual</li>
            <li><span role="img" aria-label="Check">✅</span> Programa de puntos</li>
            <li><span role="img" aria-label="Check">✅</span> Sin anuncios</li>
          </ul>
          <div style={{display:'flex', gap:'0.7em', flexWrap:'wrap'}}>
            <button
              className="home-form-btn upgrade-btn"
              style={{fontFamily: 'var(--font-btn)'}}
              onClick={() => handleSubscribeClick('adepto')}
            >
              <span role="img" aria-label="Escudo">🛡️</span> Suscribirse
            </button>
          </div>
        </div>
        {/* Maestro */}
        <div className={`plan-card${currentPlan === 'maestro' ? ' current' : ''}`}> 
          <div className="plan-header elite">
            <h4 style={{fontFamily: 'var(--font-title)'}}>{getPlanLabel('maestro')}</h4>
            <div className="plan-price">€{getPlanObj('maestro')?.priceMonthly?.toFixed(2)}<span>/mes</span></div>
            {currentPlan === 'maestro' && <div className="plan-badge current-badge">Actual</div>}
          </div>
          <ul className="plan-features">
            <li><span role="img" aria-label="Check">✅</span> Todo lo de Adepto</li>
            <li><span role="img" aria-label="Infinito">♾️</span> Lecturas ilimitadas</li>
            <li><span role="img" aria-label="Check">✅</span> Carta astral extra para regalar</li>
            <li><span role="img" aria-label="Check">✅</span> Acceso anticipado a nuevas funciones</li>
          </ul>
          <div style={{display:'flex', gap:'0.7em', flexWrap:'wrap'}}>
            <button
              className="home-form-btn upgrade-btn"
              style={{fontFamily: 'var(--font-btn)'}}
              onClick={() => handleSubscribeClick('maestro')}
            >
              <span role="img" aria-label="Infinito">♾️</span> Suscribirse
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
