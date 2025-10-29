import React, { useState } from 'react';
import '../styles/Footer.css';
import { Link } from 'react-router-dom';

export default function Footer() {

  // Estados para newsletter
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [newsletterMsg, setNewsletterMsg] = useState('');
  // Items de navegación legal
  const items = [
    { to: '/terms', txt: 'Términos', icon: '📜' },
    { to: '/privacy', txt: 'Privacidad', icon: '🔒' },
    { to: '/disclaimer', txt: 'Descargo', icon: '⚠️' },
    { to: '/methodology', txt: 'Metodología', icon: '✨' }
  ];
  // Función para manejar newsletter
  const handleNewsletter = async (e) => {
    e.preventDefault();
    setNewsletterMsg('');
    if (!newsletterConsent) {
      setNewsletterMsg('Debes aceptar la política de privacidad.');
      return;
    }
    try {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: newsletterEmail })
      });
      const data = await res.json();
      if (data.success) {
        setNewsletterMsg('¡Gracias por suscribirte!');
      } else {
        setNewsletterMsg(data.error || 'Error al suscribir.');
      }
    } catch (err) {
      setNewsletterMsg('Error de conexión. Intenta de nuevo.');
    }
  };

  return (
    <footer className="footer-main">

      <section className="newsletter-section">
        <h3 className="footer-logo-text" style={{ margin: 0, textAlign: 'center', fontFamily: 'var(--font-title)' }}>
          Suscríbete a la newsletter mágica
        </h3>
        <form onSubmit={handleNewsletter}>
          <input
            type="email"
            value={newsletterEmail}
            onChange={e => setNewsletterEmail(e.target.value)}
            placeholder="Tu email"
            required
            className="form-input"
          />
          <label>
            <input
              type="checkbox"
              checked={newsletterConsent}
              onChange={e => setNewsletterConsent(e.target.checked)}
              required
              style={{ marginRight: '7px' }}
            />
            He leído y acepto los <Link to="/terms" target="_blank">Términos y Condiciones</Link>, la <Link to="/privacy" target="_blank">Política de Privacidad</Link> y el <Link to="/disclaimer" target="_blank">Descargo de Responsabilidad</Link>.
          </label>
          <button type="submit" className="newsletter-cta-button" style={{ fontFamily: 'var(--font-btn)' }}>Unirme</button>
        </form>
        {newsletterMsg && <div className="newsletter-msg">{newsletterMsg}</div>}
        <p>
          Recibe rituales, ofertas y predicciones exclusivas.
        </p>
      </section>
      <nav className="footer-nav" aria-label="Enlaces legales">
        {items.map((item) => (
          <Link key={item.to} to={item.to} className="footer-link menu-link" aria-label={item.txt} style={{ fontFamily: 'var(--font-base)' }}>
            <span aria-hidden="true" style={{ marginRight: '6px' }}>{item.icon}</span>
            {item.txt}
          </Link>
        ))}
      </nav>
      <div className="footer-logo" style={{ marginTop: '1.5rem' }}>
        <span className="footer-logo-symbol" aria-label="Nebulosa Mágica">
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" style={{verticalAlign:'middle'}}>
            <circle cx="19" cy="19" r="16" fill="#8b5cf6" fillOpacity="0.18" />
            <path d="M19 6 L22 16 L32 19 L22 22 L19 32 L16 22 L6 19 L16 16 Z" stroke="#d4af37" strokeWidth="2.2" fill="#d4af37" fillOpacity="0.7" />
          </svg>
        </span>
        <span className="footer-logo-text" style={{ fontFamily: 'var(--font-title)' }}>Nebulosa Mágica</span>
      </div>
      <div className="footer-copyright" style={{ fontFamily: 'var(--font-sans)' }}>
        © {new Date().getFullYear()} Nebulosa Mágica · Todos los derechos reservados
      </div>
    </footer>
  );
}
