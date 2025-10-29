import React from 'react';
import Menu from '../components/Menu.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/TermsDisclaimer.css';

export default function TermsDisclaimer() {
  return (
    <main className="terms-main">
      <h2 className="terms-title">📜 Términos Legales y Descargo de Responsabilidad</h2>
      <section className="terms-section-glass">
        <h3 className="terms-subtitle">Condiciones de Uso</h3>
        <ul className="terms-list">
          <li>El acceso y uso de Arcana Club implica la aceptación de estos términos y condiciones.</li>
          <li>Está prohibido el uso de la plataforma para fines ilícitos, fraudulentos o contrarios a la buena fe.</li>
          <li>Las compras y pagos se gestionan conforme a la legislación española y europea vigente, incluyendo la Ley de Servicios de la Sociedad de la Información (LSSI) y la Ley General para la Defensa de los Consumidores y Usuarios.</li>
          <li>Todos los precios incluyen impuestos aplicables (IVA) y los métodos de pago son seguros y cifrados.</li>
          <li>Para cualquier incidencia, reclamación o consulta, contacta con nuestro equipo de soporte.</li>
        </ul>
        <h3 className="terms-subtitle">Descargo de Responsabilidad</h3>
        <p className="terms-paragraph">
          Las lecturas, interpretaciones y productos ofrecidos en Arcana Club son de carácter espiritual y orientativo. No constituyen asesoramiento profesional médico, psicológico, legal o financiero.<br />
          El usuario asume la responsabilidad exclusiva sobre el uso de la información y servicios proporcionados.<br />
          Arcana Club no se responsabiliza por decisiones tomadas en base a los contenidos de la plataforma.<br />
          En caso de duda sobre salud, finanzas o asuntos legales, consulta siempre con un profesional acreditado.
        </p>
        <h3 className="terms-subtitle">Propiedad Intelectual</h3>
        <p className="terms-paragraph">
          Todos los contenidos, textos, imágenes, algoritmos y diseños de Arcana Club están protegidos por derechos de autor y propiedad intelectual. Queda prohibida su reproducción total o parcial sin autorización expresa.
        </p>
      </section>
    </main>
  );
}
