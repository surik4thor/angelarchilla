import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NewsletterConfirm.css';

export default function NewsletterConfirm() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="newsletter-confirm-container">
      <h1 className="newsletter-confirm-title">¡Gracias por suscribirte a nuestra newsletter!</h1>
      <p className="newsletter-confirm-text">Pronto recibirás novedades, consejos y contenido exclusivo en tu correo.</p>
      <p className="newsletter-confirm-text">Serás redirigido a la página principal en unos segundos...</p>
    </div>
  );
}
