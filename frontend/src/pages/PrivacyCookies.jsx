import React from 'react';
import Menu from '../components/Menu.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/TermsDisclaimer.css';

export default function PrivacyCookies() {
  return (
    <main className="terms-main">
      <h2 className="terms-title">🔏 Privacidad y Cookies</h2>
      <section className="terms-section-glass">
        <h3 className="terms-subtitle">Tu privacidad, nuestra prioridad</h3>
        <p className="terms-paragraph">
          En <b>nebulosamagica.es</b> cumplimos con el Reglamento General de Protección de Datos (RGPD), la Ley Orgánica de Protección de Datos y Garantía de Derechos Digitales (LOPDGDD), y la normativa europea y española sobre privacidad y cookies.
        </p>
        <h3 className="terms-subtitle">¿Qué datos recogemos?</h3>
        <ul className="terms-list">
          <li>Datos identificativos (nombre, email, usuario) para registro y acceso.</li>
          <li>Datos de navegación y uso (cookies, IP, preferencias).</li>
          <li>Datos de lectura y consultas espirituales para personalizar tu experiencia.</li>
          <li>Datos de pago solo si realizas suscripciones, gestionados de forma segura por Stripe.</li>
        </ul>
        <h3 className="terms-subtitle">¿Para qué usamos tus datos?</h3>
        <ul className="terms-list">
          <li>Prestar y mejorar los servicios de tarot, runas, astrología e interpretación de sueños.</li>
          <li>Comunicaciones relacionadas con tu cuenta y novedades espirituales.</li>
          <li>Personalización de lecturas y horóscopos según tu perfil astrológico.</li>
          <li>Analítica para mejorar la precisión de nuestras interpretaciones.</li>
        </ul>
        <h3 className="terms-subtitle">Tus derechos</h3>
        <ul className="terms-list">
          <li>Acceso, rectificación, supresión, portabilidad, limitación y oposición al tratamiento de tus datos.</li>
          <li>Puedes ejercerlos escribiendo a <a href="mailto:hola@nebulosamagica.com" style={{ color: '#d4af37', textDecoration: 'underline' }}>hola@nebulosamagica.com</a>.</li>
        </ul>
        <h3 className="terms-subtitle">Política de Cookies</h3>
        <p className="terms-paragraph">
          Utilizamos cookies propias y de terceros para mejorar tu experiencia espiritual:
        </p>
        <ul className="terms-list">
          <li><b>Cookies técnicas</b>: necesarias para el funcionamiento básico de la plataforma.</li>
          <li><b>Cookies de análisis</b>: nos ayudan a entender cómo usas nuestros servicios espirituales.</li>
          <li><b>Cookies de personalización</b>: adaptan las lecturas a tus preferencias astrológicas.</li>
        </ul>
        <p className="terms-paragraph">
          Puedes aceptar, rechazar o configurar las cookies desde el banner de consentimiento o tu navegador. Más información en <a href="mailto:hola@nebulosamagica.com" style={{ color: '#d4af37', textDecoration: 'underline' }}>hola@nebulosamagica.com</a>.
        </p>
        <h3 className="terms-subtitle">Seguridad y confidencialidad</h3>
        <ul className="terms-list">
          <li>Tus datos espirituales y personales se almacenan de forma segura y cifrada.</li>
          <li>No compartimos datos con terceros salvo obligación legal o consentimiento expreso.</li>
          <li>La plataforma implementa medidas técnicas avanzadas para proteger tu información.</li>
          <li>Tus consultas y lecturas son estrictamente confidenciales.</li>
        </ul>
        <p className="terms-paragraph">
          Para cualquier consulta sobre privacidad, protección de datos o el uso de cookies, contacta con <a href="mailto:hola@nebulosamagica.com" style={{ color: '#d4af37', textDecoration: 'underline' }}>hola@nebulosamagica.com</a>. Tu privacidad es nuestra prioridad absoluta.
        </p>
      </section>
    </main>
  );
}
