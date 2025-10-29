import React from 'react';
import Menu from '../components/Menu.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/TermsDisclaimer.css';

export default function Methodology() {
  return (
    <main className="terms-main">
      <h2 className="terms-title">✨ Metodología y Filosofía</h2>
      <section className="terms-section-glass">
        <h3 className="terms-subtitle">Compromiso Ético y Profesional</h3>
        <p className="terms-paragraph">
          En Nebulosa Mágica, la ética, la privacidad y el bienestar del usuario son nuestra máxima prioridad. Todas las consultas se tratan con respeto, confidencialidad y sin juicios. Nuestra misión es inspirar el autoconocimiento y el crecimiento personal, combinando tradición ancestral y tecnología avanzada.
        </p>
        <ul className="terms-list">
          <li>Las lecturas y horóscopos integran inteligencia artificial y principios tradicionales de tarot, runas y astrología.</li>
          <li>El usuario elige libremente el tipo de tirada o consulta, adaptada a sus necesidades.</li>
          <li>Las cartas y runas se seleccionan de forma aleatoria, justa y transparente.</li>
          <li>La interpretación se basa en algoritmos, experiencia ancestral y personalización según el historial del usuario.</li>
          <li>La plataforma cumple con la normativa española y europea sobre protección de datos y servicios digitales.</li>
          <li>Respetamos las tradiciones espirituales mientras innovamos con responsabilidad tecnológica.</li>
        </ul>
        <h3 className="terms-subtitle">Nuestros Servicios Especializados</h3>
        <p className="terms-paragraph">
          Combinamos la sabiduría ancestral del tarot y las runas con inteligencia artificial avanzada para ofrecer lecturas personalizadas. Nuestro sistema de horóscopos ultra-personalizados utiliza cálculos astrológicos precisos basados en tu carta natal única.
        </p>
        <ul className="terms-list">
          <li><strong>Tarot Inteligente:</strong> Lecturas con IA especializada que considera tu historial y contexto personal.</li>
          <li><strong>Runas Ancestrales:</strong> Interpretaciones basadas en la tradición nórdica antigua.</li>
          <li><strong>Astrología Personalizada:</strong> Horóscopos únicos calculados con tu carta natal y tránsitos actuales.</li>
          <li><strong>Diario de Sueños:</strong> Interpretación de sueños con simbolismo jungiano y tradiciones esotéricas.</li>
        </ul>
        <h3 className="terms-subtitle">Transparencia y Responsabilidad</h3>
        <p className="terms-paragraph">
          Si tienes dudas sobre nuestros métodos, principios éticos, privacidad o legalidad, contacta con nuestro equipo. Estamos para apoyarte y garantizar que tu experiencia sea segura, enriquecedora y conforme a la ley española y europea vigente.
        </p>
      </section>
    </main>
  );
}
