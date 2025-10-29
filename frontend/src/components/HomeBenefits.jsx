import '../styles/HomeBenefits.css';
import React from 'react';
// Eliminado FontAwesome, se usan emojis

export default function HomeBenefits({ openAuthModal, handleHoroscopoAnon, fechaNac, setFechaNac, genero, setGenero, horoscopoAnon }) {
  return (
    <>
      {/* Beneficios de registro */}
      <section className="registration-benefits">
        <div className="benefits-header">
          <h2 className="benefits-title" style={{fontFamily: 'var(--font-title)'}}>
            <span role="img" aria-label="Corazón">❤️</span>
            ¿Por qué unirse a Arcana Club?
            <span role="img" aria-label="Corazón">❤️</span>
          </h2>
          <p className="benefits-subtitle" style={{fontFamily: 'var(--font-base)'}}>
            Desbloquea el poder de la sabiduría ancestral con una cuenta gratuita
          </p>
        </div>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">
              <span role="img" aria-label="Magia">🪄</span>
            </div>
            <h3 style={{fontFamily: 'var(--font-title)'}}>Lecturas Gratuitas</h3>
            <p>3 consultas mensuales de Tarot y Runas completamente gratis</p>
            <div className="benefit-highlight">¡Sin costo!</div>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">
              <span role="img" aria-label="Sol">☀️</span>
            </div>
            <h3 style={{fontFamily: 'var(--font-title)'}}>Horóscopo Personalizado</h3>
            <p>Predicciones diarias basadas en tu perfil astrológico único</p>
            <div className="benefit-highlight">Exclusivo</div>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">
              <span role="img" aria-label="Corazón">❤️</span>
            </div>
            <h3 style={{fontFamily: 'var(--font-title)'}}>Historial Místico</h3>
            <p>Guarda todas tus lecturas y ve tu evolución espiritual</p>
            <div className="benefit-highlight">Personalizado</div>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">
              <span role="img" aria-label="Gema">💎</span>
            </div>
            <h3 style={{fontFamily: 'var(--font-title)'}}>Contenido Exclusivo</h3>
            <p>Acceso a rituales, guías y conocimiento esotérico premium</p>
            <div className="benefit-highlight">Único</div>
          </div>
        </div>
        <div className="cta-section" role="group" aria-label="Acciones de registro">
          <button className="cta-primary btn-anim" onClick={() => openAuthModal('signup')} aria-label="Crear cuenta gratuita" tabIndex={0} style={{fontFamily: 'var(--font-btn)'}}>
            <span role="img" aria-label="Usuario">👤</span>
            Crear mi cuenta gratuita
          </button>
          <div className="cta-subtitle">
            <span>¿Ya tienes cuenta?</span>
            <button className="cta-secondary btn-anim" onClick={() => openAuthModal('login')} aria-label="Iniciar sesión" tabIndex={0} style={{fontFamily: 'var(--font-btn)'}}>
              <span role="img" aria-label="Entrar">🔑</span>
              Iniciar sesión
            </button>
          </div>
        </div>
      </section>
      {/* Prueba rápida para usuarios no registrados */}
      <section className="quick-sample">
        <div className="sample-header">
          <h3 style={{fontFamily: 'var(--font-title)'}}>
            <span role="img" aria-label="Ojo">👁️</span>
            Prueba una lectura rápida
          </h3>
          <p style={{fontFamily: 'var(--font-base)'}}>Experimenta el poder del Tarot sin registrarte</p>
        </div>
        <form onSubmit={handleHoroscopoAnon} className="quick-sample-form">
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="fechaNac" style={{fontFamily: 'var(--font-base)'}}>
                <span role="img" aria-label="Calendario">📅</span>
                Tu fecha de nacimiento
              </label>
              <input
                id="fechaNac"
                type="date"
                value={fechaNac}
                onChange={e => { setFechaNac(e.target.value); }}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="genero" style={{fontFamily: 'var(--font-base)'}}>
                <span role="img" aria-label="Venus Marte">⚤</span>
                Tu género
              </label>
              <select
                id="genero"
                value={genero}
                onChange={e => { setGenero(e.target.value); }}
                required
              >
                <option value="">Selecciona tu género</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-anim" aria-label="Obtener horóscopo anónimo" style={{fontFamily: 'var(--font-btn)'}}>
            Obtener Horóscopo Anónimo
          </button>
        </form>
        <p className="horoscope-text" style={{fontFamily: 'var(--font-base)'}}>{horoscopoAnon}</p>
        <div className="sample-cta">
          <p style={{fontFamily: 'var(--font-base)'}}>¿Te gustó? <strong>Regístrate para obtener lecturas mucho más detalladas</strong></p>
          <button className="upgrade-button" onClick={() => openAuthModal('signup')} style={{fontFamily: 'var(--font-btn)'}}>
            <span role="img" aria-label="Usuario">👤</span>
            Crear mi cuenta ahora
          </button>
        </div>
      </section>
    </>
  );
}
