import React from 'react';
import Menu from '../components/Menu.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/TermsDisclaimer.css';

export default function Disclaimer() {
  return (
    <main className="terms-main">
      <h2 className="terms-title">⚠️ Descargo de Responsabilidad</h2>
      <section className="terms-section-glass">
        <h3 className="terms-subtitle">Naturaleza de Nuestros Servicios</h3>
        <p className="terms-paragraph">
          Los servicios ofrecidos en Nebulosa Mágica, incluyendo lecturas de tarot, runas, horóscopos personalizados e interpretación de sueños, son de carácter espiritual, orientativo y de entretenimiento. Estos servicios NO constituyen asesoramiento profesional médico, psicológico, legal, financiero o de cualquier otra índole profesional.
        </p>

        <h3 className="terms-subtitle">Responsabilidad del Usuario</h3>
        <ul className="terms-list">
          <li>El usuario asume la responsabilidad exclusiva sobre el uso de la información y servicios proporcionados en la plataforma.</li>
          <li>Las decisiones tomadas basándose en las lecturas, interpretaciones o consejos obtenidos son responsabilidad única y exclusiva del usuario.</li>
          <li>Recomendamos usar nuestros servicios como herramientas de reflexión personal y crecimiento espiritual, no como sustitutos del consejo profesional.</li>
          <li>El usuario debe tener 18 años o más para utilizar nuestros servicios de forma independiente.</li>
        </ul>

        <h3 className="terms-subtitle">Limitaciones de Responsabilidad</h3>
        <p className="terms-paragraph">
          Nebulosa Mágica NO se responsabiliza por:
        </p>
        <ul className="terms-list">
          <li>Decisiones personales, profesionales, financieras o de cualquier tipo tomadas en base a nuestros servicios.</li>
          <li>Resultados específicos o cambios en la vida del usuario derivados del uso de la plataforma.</li>
          <li>Daños directos, indirectos, incidentales o consecuenciales que puedan surgir del uso de nuestros servicios.</li>
          <li>La precisión absoluta de las predicciones, ya que el futuro está sujeto a múltiples variables y el libre albedrío.</li>
        </ul>

        <h3 className="terms-subtitle">Recomendaciones Importantes</h3>
        <p className="terms-paragraph">
          Para asuntos relacionados con:
        </p>
        <ul className="terms-list">
          <li><strong>Salud:</strong> Consulte siempre con profesionales médicos acreditados para diagnósticos, tratamientos o consejos de salud.</li>
          <li><strong>Finanzas:</strong> Consulte con asesores financieros profesionales para decisiones de inversión o económicas importantes.</li>
          <li><strong>Asuntos Legales:</strong> Consulte con abogados o profesionales del derecho para cuestiones jurídicas.</li>
          <li><strong>Salud Mental:</strong> En caso de crisis emocional o problemas psicológicos, busque ayuda de profesionales de la salud mental.</li>
        </ul>

        <h3 className="terms-subtitle">Servicios de Inteligencia Artificial</h3>
        <p className="terms-paragraph">
          Nuestras interpretaciones utilizan algoritmos de inteligencia artificial entrenados con conocimientos esotéricos tradicionales. Aunque nos esforzamos por ofrecer interpretaciones coherentes y útiles, la IA puede generar contenido impreciso o inapropiado ocasionalmente. El usuario debe ejercer su criterio personal al interpretar los resultados.
        </p>

        <h3 className="terms-subtitle">Contacto y Soporte</h3>
        <p className="terms-paragraph">
          Si tiene dudas sobre el alcance de nuestros servicios o necesita aclaraciones sobre este descargo de responsabilidad, puede contactar con nuestro equipo de soporte. Estamos comprometidos con la transparencia y el bienestar de nuestros usuarios dentro del marco legal aplicable.
        </p>
      </section>
    </main>
  );
}