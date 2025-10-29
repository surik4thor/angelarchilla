import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useReading } from '../hooks/useReading.js';
import TarotSpread from '../components/TarotSpread.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import AdModal from '../components/AdModal.jsx';
import '../styles/Reading.css';
import CanvasExporter from '../components/CanvasExporter.jsx';

const TAROT_SPREADS = {
  'una-carta': { name: 'Una Carta', description: 'Respuesta directa y concisa', positions: 1 },
  'tres-cartas': { name: 'Tres Cartas', description: 'Pasado, Presente y Futuro', positions: 3 },
  'cruz-celta': { name: 'Cruz Celta', description: 'Análisis profundo y completo', positions: 10 },
  'herradura': { name: 'Herradura', description: 'Visión panorámica de la situación', positions: 7 },
  'amor': { name: 'Tirada del Amor', description: 'Especializada en relaciones', positions: 5 },
  'trabajo': { name: 'Tirada del Trabajo', description: 'Enfoque profesional y carrera', positions: 4 }
};

const TAROT_DECKS = {
  'rider-waite': {
    name: 'Rider-Waite',
    description: 'Clásico y tradicional',
    meditation: 'Cierra los ojos y conecta con la tradición y el simbolismo del Rider-Waite. Visualiza las escenas vibrantes y deja que los arquetipos universales te hablen. Siente la energía clásica y la guía espiritual que este mazo ofrece desde hace más de un siglo.'
  },
  'marsella': {
    name: 'Tarot de Marsella',
    description: 'Histórico y simbólico',
    meditation: 'Respira profundo y conecta con la historia ancestral del Tarot de Marsella. Imagina los trazos antiguos y la sabiduría de siglos de tradición europea. Permite que la simbología pura y directa de este mazo te inspire claridad y verdad.'
  }
};


export default function TarotReading() {
  // Estados exclusivos para tarot
  const [spreadType, setSpreadType] = useState('');
  const [deckType, setDeckType] = useState('rider-waite');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLimited, setIsLimited] = useState(null);
  const [limitMessage, setLimitMessage] = useState('');
  const [loadingLimit, setLoadingLimit] = useState(false);
  const [showMeditation, setShowMeditation] = useState(false);
  const [decks, setDecks] = useState(TAROT_DECKS);
  const [showAdModal, setShowAdModal] = useState(false);
  const [exportTrigger, setExportTrigger] = useState(false);
  const [exportedImage, setExportedImage] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { performReading, loading, error } = useReading();

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

  // Consulta límite tarot al cargar
  useEffect(() => {
    setLoadingLimit(true);
    const token = localStorage.getItem('arcanaToken');
    // Si el usuario es MAESTRO o está en periodo TRIAL, nunca hay límite
    const isMaestro = user && (user.subscriptionPlan || '').toUpperCase() === 'MAESTRO';
    const isTrial = user && user.trialActive && user.trialExpiry && new Date() < new Date(user.trialExpiry);
    if (isMaestro || isTrial) {
      setIsLimited(false);
      setLimitMessage('');
      setLoadingLimit(false);
      return;
    }
  fetch('/api/readings/limit-status?type=tarot', {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(json => {
        setIsLimited(!!json.limited);
        setLimitMessage(json.limited ? (json.message || 'Has alcanzado el límite de lecturas de tarot para tu plan.') : '');
      })
      .catch(() => setIsLimited(false))
      .finally(() => setLoadingLimit(false));
  }, [user]);

  const handleSpreadSelect = (spread) => {
  if (isLimited) return;
  setSpreadType(spread);
  setDeckType('');
  setShowMeditation(false);
  };

  const handleDeckSelect = (deck) => {
  if (isLimited) return;
  setDeckType(deck);
  setShowMeditation(false);
  };

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    if (isLimited) return;
    if (question.trim().length < 10) {
      setLimitMessage('La pregunta debe tener al menos 10 caracteres.');
      setIsLimited(true);
      return;
    }
    setShowResult(false);
    executeReading();
  };

  const executeReading = async () => {
    setIsCreating(true);
    try {
      const payload = {
        type: 'TAROT',
        spreadType: spreadType.toLowerCase(),
        deckType,
        question
      };
      const readingData = await performReading(payload);
      setResult(readingData);
      setShowResult(true);
    } catch (err) {
      setLimitMessage('Error al crear la lectura. Por favor, inténtalo de nuevo.');
      setIsLimited(true);
    } finally {
      setIsCreating(false);
    }
  };

  const resetReading = () => {
    setSpreadType('');
    setDeckType('rider-waite');
    setQuestion('');
    setResult(null);
    setShowResult(false);
    setLimitMessage('');
    setIsLimited(null);
    setShowMeditation(false);
  };

  const showAds = !user || !['ADEPTO', 'MAESTRO'].includes((user.subscriptionPlan || '').toUpperCase());
  useEffect(() => {
    if (showAds) setShowAdModal(true);
  }, [showAds]);

  // Botón y lógica para compartir/descargar imagen
  const handleExport = () => {
    setExportTrigger(true);
  };
  React.useEffect(() => {
    if (exportedImage) {
      if (navigator.share) {
        navigator.share({
          title: 'Mi lectura de Tarot',
          text: 'Mira mi lectura premium en ArcanaClub',
          files: [dataURLtoFile(exportedImage, 'lectura-tarot.png')]
        });
      } else {
        const link = document.createElement('a');
        link.href = exportedImage;
        link.download = 'lectura-tarot.png';
        link.click();
      }
      setExportTrigger(false);
      setExportedImage(null);
    }
  }, [exportedImage]);

  function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1].replace(/\s/g, '')),
      n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){ u8arr[n] = bstr.charCodeAt(n); }
    return new File([u8arr], filename, {type:mime});
  }

  if (loading || isCreating || loadingLimit || isLimited === null) {
    return (
      <>
        {showAds && <AdModal visible={showAdModal} onClose={() => setShowAdModal(false)} />}
        <div className="reading-loading">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  return (
    <main className="reading-container">
      <div className="reading-header">
        <h1>Lectura de Tarot Premium</h1>
        <p>Conecta con la sabiduría ancestral del tarot y recibe una guía personalizada.</p>
      </div>
      <div className="reading-content">
        {/* Mensaje de límite si corresponde */}
        {isLimited === true && !loadingLimit && (
          <div className="step-container limit-reached">
            <div className="limit-message-block center-text">
              <span className="limit-icon" role="img" aria-label="pregunta">❓</span>
              <h2 className="limit-title">Has alcanzado tu límite de lecturas de tarot</h2>
              <p className="limit-desc tarot-bg">{limitMessage || 'Ya no puedes realizar más lecturas de tarot hoy con tu plan actual.'}</p>
              <button className="subscribe-btn" onClick={()=>navigate('/planes')}>
                <span className="mr-half" role="img" aria-label="estrella">⭐</span>
                Ver Planes y Suscribirse
              </button>
              <div className="limit-actions">
                <button className="new-reading-btn" onClick={resetReading}>
                  <span role="img" aria-label="volver">⬅️</span>
                  Volver a inicio
                </button>
                {user && (
                  <button className="view-history-btn" onClick={() => navigate('/profile')}>
                    <span role="img" aria-label="historial">📜</span>
                    Ver Historial
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {/* El flujo solo si NO está limitado */}
        {/* Secuencia premium única, sin duplicados */}
        {isLimited === false && !showResult && (
          <>
            {/* Paso 1: Seleccionar tirada */}
            {!spreadType && (
              <div className="step-container select-spread">
                <h3 className="tarot-color">Selecciona la tirada de tarot</h3>
                <p className="spread-desc">Cada tirada ofrece una perspectiva diferente. Elige la que mejor se adapte a tu consulta.</p>
                <div className="spread-options">
                  {Object.entries(TAROT_SPREADS).map(([key, spread]) => (
                    <button key={key} className="spread-card tarot-btn" onClick={()=>handleSpreadSelect(key)}>
                      <h3>{spread.name}</h3>
                      <div className="spread-description">{spread.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Paso 2: Seleccionar baraja */}
            {spreadType && !deckType && (
              <div className="step-container select-deck">
                <h3 className="tarot-color">Selecciona la baraja</h3>
                <p className="deck-desc">Cada baraja tiene su propia energía y simbolismo.</p>
                <div className="deck-options-flex">
                  {Object.entries(decks).map(([key, deck]) => (
                    <button key={key} className="main-btn tarot-btn deck-btn" onClick={()=>{setDeckType(key);}}>
                      {deck.name}
                      <div className="deck-description">{deck.description}</div>
                    </button>
                  ))}
                </div>
                <button className="main-btn back-btn" onClick={()=>setSpreadType('')}>
                  <span role="img" aria-label="volver">⬅️</span> Volver a tirada
                </button>
              </div>
            )}
            {/* Paso 3: Meditación */}
            {spreadType && deckType && !showMeditation && (
              <div className="step-container meditation-step center-text">
                <h3 className="tarot-color">Tómate un momento de meditación</h3>
                <p className="meditation-desc">
                  {deckType && decks[deckType] && decks[deckType].meditation ? (
                    decks[deckType].meditation
                  ) : (
                    <>Antes de formular tu pregunta, cierra los ojos, respira profundo y conecta con tu interior.<br/>Siente el respeto por el tarot y las energías universales.<br/>Cuando estés preparado/a, continúa.</>
                  )}
                </p>
                <button className="main-btn meditation-btn tarot-btn" onClick={()=>setShowMeditation(true)}>
                  ❤️ Hecho, continuar
                </button>
              </div>
            )}
            {/* Paso 4: Formulario de pregunta premium */}
            {spreadType && deckType && showMeditation && (
              <div className="step-container ask-question">
                <h3 className="tarot-color">Haz tu pregunta al tarot</h3>
                <div className="tarot-explainer premium-box" style={{background:'#232946',color:'#eebc1d',borderRadius:'14px',padding:'1.5em',margin:'1.2em 0',boxShadow:'0 2px 12px #23294688',fontSize:'1.12em',fontFamily:'var(--font-base)'}}>
                  <h4 style={{color:'#d4af37',marginBottom:'0.7em'}}>¿Cómo funciona la consulta?</h4>
                  <ul style={{marginLeft:'1.2em',marginBottom:'0.7em'}}>
                    <li>Formula tu pregunta con respeto y apertura, conectando con la energía universal y los guías ancestrales.</li>
                    <li>El tarot es un oráculo mágico que responde desde la sabiduría de dioses, diosas y arquetipos.</li>
                    <li>La interpretación combina tradición, magia y tecnología para ofrecerte una guía profunda y personalizada.</li>
                    <li>Recuerda que la respuesta es una orientación espiritual, no un diagnóstico.</li>
                  </ul>
                  <div style={{marginTop:'0.7em',color:'#fff'}}>Tu consulta es privada y respetuosa con la magia que te rodea.</div>
                </div>
                <form onSubmit={handleQuestionSubmit} className="question-form">
                  <label htmlFor="question">Tu pregunta para el tarot:</label>
                  <textarea
                    id="question"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="¿Qué deseas preguntar? Escribe tu consulta aquí, con respeto y claridad..."
                    rows={4}
                    minLength={10}
                    maxLength={500}
                    required
                  />
                  <div className="char-count">{question.length}/500 caracteres</div>
                  <button type="submit" className="main-btn submit-btn tarot-btn" style={{marginTop:'1.2em'}}>
                    <span className="mr-half" role="img" aria-label="consultar">🔮</span> Consultar
                  </button>
                  <button className="main-btn back-btn" style={{marginTop:'1em'}} onClick={()=>setShowMeditation(false)} type="button">
                    <span role="img" aria-label="volver">⬅️</span> Volver a meditación
                  </button>
                </form>
              </div>
            )}
          </>
        )}
        {error && (
          <div className="error-message">
            <span role="img" aria-label="pregunta">❓</span>
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
