import React, { useState } from 'react';
import '../styles/Home.css';
import '../styles/LandingSoon.css';

export default function LandingSoon() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [contactMsg, setContactMsg] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    // Aquí iría la lógica real de suscripción (API, etc)
    setSubmitted(true);
  };

  const handleContact = e => {
    e.preventDefault();
    setContactMsg('¡Gracias! Te contactaremos pronto.');
  };

  return (
    <main className="landing-main">
      <section className="landing-card">
        <h1 className="landing-title">¡Arcana Club está en camino!</h1>
        <p className="landing-desc">
          Prepárate para descubrir una experiencia esotérica única.<br />
          Lecturas de tarot, runas, horóscopos personalizados, rituales y mucho más.<br />
          ¿Listo para desvelar los misterios? ¡Déjanos tu email y sé el primero en enterarte!
        </p>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="landing-form">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Tu email para la lista de espera"
              required
              className="landing-input"
            />
            <button type="submit" className="menu-link btn-anim landing-btn">
              Unirme a la lista de espera
            </button>
          </form>
        ) : (
          <div className="landing-thankyou">
            ¡Gracias por tu interés! Pronto recibirás novedades mágicas.
          </div>
        )}
      </section>
      <section className="landing-card">
        <h2 className="landing-contact-title">¿Quieres contactar?</h2>
        <form onSubmit={handleContact} className="landing-form">
          <input
            type="text"
            placeholder="Tu mensaje o consulta"
            required
            className="landing-input"
          />
          <button type="submit" className="menu-link btn-anim landing-btn landing-btn-alt">
            Enviar mensaje
          </button>
        </form>
        {contactMsg && <div className="landing-contact-msg">{contactMsg}</div>}
        <div className="landing-contact-mail">
          También puedes escribirnos a <a href="mailto:hola@nebulosamagica.com">hola@nebulosamagica.com</a>
        </div>
      </section>
    </main>
  );
}
