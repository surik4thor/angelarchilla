import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/TutorialDetail.css';
import CuponModal from './CuponModal';

const TutorialDetail = ({ user }) => {
  const { slug } = useParams();
  const [tutorial, setTutorial] = useState(null);
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponData, setCouponData] = useState(null);

  // Mapeo de tutoriales con contenido
  const tutorialsContent = {
    'tarot-rider-waite-guia': {
      title: 'Guía Completa del Tarot Rider-Waite',
      content: `
        <h2>🎴 Introducción al Tarot Rider-Waite</h2>
        <p>El tarot Rider-Waite, creado por Arthur Edward Waite y ilustrado por Pamela Colman Smith, es el mazo de tarot más popular y reconocible del mundo. Su simbolismo rico y accesible lo convierte en la herramienta perfecta para principiantes y expertos.</p>

        <h3>✨ Historia y Origen</h3>
        <p>Publicado por primera vez en 1909, este mazo revolucionó el mundo del tarot al incluir imágenes detalladas en todas las cartas, incluyendo los arcanos menores. Esto facilita enormemente la interpretación intuitiva.</p>

        <h3>🃏 Estructura del Mazo</h3>
        <ul>
          <li><strong>22 Arcanos Mayores:</strong> El viaje del alma desde El Loco hasta El Mundo</li>
          <li><strong>56 Arcanos Menores:</strong> Divididos en cuatro palos (Copas, Espadas, Bastos, Oros)</li>
          <li><strong>16 Cartas de la Corte:</strong> Sota, Caballero, Reina y Rey de cada palo</li>
        </ul>

        <h3>🌟 Los Arcanos Mayores</h3>
        <p>Representan las lecciones importantes de la vida y los arquetipos universales:</p>
        <ul>
          <li><strong>0 - El Loco:</strong> Nuevos comienzos, aventura, potencial ilimitado</li>
          <li><strong>1 - El Mago:</strong> Manifestación, poder personal, habilidad</li>
          <li><strong>2 - La Suma Sacerdotisa:</strong> Intuición, misterio, sabiduría oculta</li>
          <li><strong>21 - El Mundo:</strong> Realización, completud, éxito</li>
        </ul>

        <h3>🔮 Interpretación Intuitiva</h3>
        <p>La belleza del Rider-Waite radica en que puedes interpretar las cartas basándote en lo que ves:</p>
        <ul>
          <li>Observa los colores y su simbolismo</li>
          <li>Presta atención a los números y su significado</li>
          <li>Nota las expresiones y posturas de los personajes</li>
          <li>Conecta con tu intuición y sentimientos</li>
        </ul>

        <div class="tutorial-cta">
          <h3>🎯 ¡Practica Ahora!</h3>
          <p>¿Listo para comenzar tu primera lectura? Nuestro sistema de tarot digital utiliza la sabiduría del Rider-Waite para brindarte interpretaciones precisas y personalizadas.</p>
        </div>
      `,
      hasCoupon: true,
      coupon: {
        code: 'TAROT7DIAS',
        title: '🎁 ¡Cupón de Bienvenida!',
        description: '7 días gratuitos del Plan MAESTRO',
        benefits: [
          'Lecturas ilimitadas de tarot y runas',
          'Interpretación de sueños premium',
          'Cartas natales personalizadas',
          'Horóscopos avanzados',
          'Acceso completo al historial'
        ]
      }
    },
    'cruz-celta-tarot': {
      title: 'La Cruz Celta: Tirada Sagrada',
      content: `
        <h2>✨ La Cruz Celta: La Tirada Más Poderosa</h2>
        <p>La Cruz Celta es considerada la tirada de tarot más completa y reveladora. Te ofrece una visión profunda de cualquier situación, explorando el pasado, presente y futuro desde múltiples perspectivas.</p>

        <h3>🎯 Estructura de la Tirada</h3>
        <p>La Cruz Celta consta de 10 posiciones, cada una con un significado específico:</p>
        
        <div class="card-position">
          <h4>1. Situación Actual</h4>
          <p>El corazón del asunto, lo que está sucediendo ahora</p>
        </div>

        <div class="card-position">
          <h4>2. Desafío/Cruz</h4>
          <p>Lo que se cruza en tu camino, obstáculos o influencias</p>
        </div>

        <div class="card-position">
          <h4>3. Pasado Distante</h4>
          <p>Fundamentos que llevaron a la situación actual</p>
        </div>

        <div class="card-position">
          <h4>4. Pasado Reciente</h4>
          <p>Eventos recientes que influyen en el presente</p>
        </div>

        <div class="card-position">
          <h4>5. Futuro Posible</h4>
          <p>Lo que podría suceder si no cambias nada</p>
        </div>

        <div class="card-position">
          <h4>6. Futuro Inmediato</h4>
          <p>Lo que sucederá en un futuro próximo</p>
        </div>

        <h3>🔮 Cómo Realizar la Tirada</h3>
        <ol>
          <li>Centra tu mente y formula una pregunta clara</li>
          <li>Baraja las cartas mientras te concentras</li>
          <li>Coloca las cartas en cruz siguiendo el patrón tradicional</li>
          <li>Interpreta cada posición en relación con las demás</li>
        </ol>

        <div class="tutorial-cta">
          <h3>🎴 ¡Prueba la Cruz Celta Ahora!</h3>
          <p>Experimenta el poder de esta tirada ancestral con nuestro sistema inteligente de interpretación.</p>
        </div>
      `,
      hasCoupon: false
    },
    'rituales-lunares-2025': {
      title: 'Rituales Lunares para 2025',
      content: `
        <h2>🌙 El Poder de los Ciclos Lunares</h2>
        <p>La Luna ha sido durante milenios una guía espiritual para la humanidad. Sus fases influyen en nuestras emociones, energía y capacidad de manifestación. Aprende a sincronizarte con sus ciclos para potenciar tu crecimiento personal.</p>

        <h3>🌑 Luna Nueva - Nuevos Comienzos</h3>
        <p><strong>Energía:</strong> Introspección, planificación, siembra de intenciones</p>
        <p><strong>Ritual Sugerido:</strong></p>
        <ul>
          <li>Enciende una vela blanca</li>
          <li>Escribe tus intenciones para el nuevo ciclo</li>
          <li>Medita en silencio durante 10-15 minutos</li>
          <li>Guarda tus intenciones en un lugar sagrado</li>
        </ul>

        <h3>🌓 Cuarto Creciente - Acción y Momentum</h3>
        <p><strong>Energía:</strong> Construcción, perseverancia, superación de obstáculos</p>
        <p><strong>Ritual Sugerido:</strong></p>
        <ul>
          <li>Usa cristales de cuarzo o amatista</li>
          <li>Realiza afirmaciones de poder personal</li>
          <li>Toma acciones concretas hacia tus metas</li>
          <li>Practica ejercicios de visualización</li>
        </ul>

        <h3>🌕 Luna Llena - Culminación y Gratitud</h3>
        <p><strong>Energía:</strong> Manifestación, celebración, liberación</p>
        <p><strong>Ritual de Luna Llena:</strong></p>
        <ol>
          <li>Crea un altar con elementos de los 4 elementos</li>
          <li>Enciende incienso de lavanda o sándalo</li>
          <li>Agradece por lo manifestado</li>
          <li>Libera lo que ya no te sirve</li>
          <li>Carga tus cristales bajo la luz lunar</li>
        </ol>

        <h3>🌗 Cuarto Menguante - Liberación y Limpieza</h3>
        <p><strong>Energía:</strong> Soltar, perdonar, limpiar energías</p>
        <p><strong>Ritual de Liberación:</strong></p>
        <ul>
          <li>Escribe lo que deseas liberar</li>
          <li>Quema el papel de forma segura</li>
          <li>Toma un baño purificador con sal marina</li>
          <li>Practica técnicas de perdón y soltar</li>
        </ul>

        <h3>📅 Calendario Lunar 2025</h3>
        <p>Principales fechas lunares para tus rituales:</p>
        <ul>
          <li><strong>Enero:</strong> Luna Nueva (29), Luna Llena (13)</li>
          <li><strong>Febrero:</strong> Luna Nueva (27), Luna Llena (12)</li>
          <li><strong>Marzo:</strong> Luna Nueva (29), Luna Llena (14)</li>
          <li><strong>Y así sucesivamente...</strong></li>
        </ul>

        <div class="tutorial-cta">
          <h3>🌙 ¡Conecta con la Luna!</h3>
          <p>Utiliza nuestro calendario lunar integrado para no perderte ninguna fase importante y maximizar tu conexión cósmica.</p>
        </div>
      `,
      hasCoupon: true,
      coupon: {
        code: 'LUNA7DIAS',
        title: '🌙 ¡Cupón Lunar Especial!',
        description: '7 días gratuitos del Plan MAESTRO',
        benefits: [
          'Calendario lunar personalizado',
          'Guías de rituales según tu signo',
          'Alertas de fases lunares importantes',
          'Meditaciones guiadas lunares',
          'Lecturas especiales de luna llena'
        ]
      }
    }
  };

  useEffect(() => {
    const tutorialData = tutorialsContent[slug];
    if (tutorialData) {
      setTutorial(tutorialData);
      
      // Mostrar cupón automáticamente si el tutorial lo tiene
      if (tutorialData.hasCoupon) {
        setTimeout(() => {
          setCouponData(tutorialData.coupon);
          setShowCoupon(true);
        }, 3000); // Mostrar después de 3 segundos de lectura
      }
    }
  }, [slug]);

  const handleClaimCoupon = async (couponCode) => {
    try {
      // Aquí implementarías la lógica para aplicar el cupón
      console.log('Aplicando cupón:', couponCode);
      // Llamada a la API para aplicar el cupón
      setShowCoupon(false);
    } catch (error) {
      console.error('Error aplicando cupón:', error);
    }
  };

  if (!tutorial) {
    return (
      <div className="tutorial-not-found">
        <h2>Tutorial no encontrado</h2>
        <Link to="/tutoriales" className="back-btn">
          ← Volver a Tutoriales
        </Link>
      </div>
    );
  }

  return (
    <div className="tutorial-detail">
      {/* Header */}
      <div className="tutorial-detail-header">
        <Link to="/tutoriales" className="back-btn">
          ← Volver a Tutoriales
        </Link>
        <h1>{tutorial.title}</h1>
        {tutorial.hasCoupon && (
          <div className="coupon-badge">
            🎁 Contiene cupón especial
          </div>
        )}
      </div>

      {/* Contenido */}
      <div 
        className="tutorial-content"
        dangerouslySetInnerHTML={{ __html: tutorial.content }}
      />

      {/* Call to action buttons */}
      <div className="tutorial-actions">
        <Link to="/tarot" className="cta-btn primary">
          🎴 Hacer Lectura de Tarot
        </Link>
        <Link to="/runes" className="cta-btn secondary">
          ®️ Consultar Runas
        </Link>
        <Link to="/suenos" className="cta-btn tertiary">
          🌙 Interpretar Sueños
        </Link>
      </div>

      {/* Modal de cupón */}
      {showCoupon && couponData && (
        <CuponModal
          isOpen={showCoupon}
          onClose={() => setShowCoupon(false)}
          couponData={couponData}
          onClaim={handleClaimCoupon}
          user={user}
        />
      )}
    </div>
  );
};

export default TutorialDetail;