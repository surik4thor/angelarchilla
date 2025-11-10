import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useReading } from '../hooks/useReading.js';
import RuneSpread from '../components/RuneSpread.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import AdModal from '../components/AdModal.jsx';
import '../styles/Reading.css';
import CanvasExporter from '../components/CanvasExporter.jsx';

const RUNE_SPREADS = {
  'runa-unica': { name: 'Runa Única', description: 'Guía espiritual directa', positions: 1 },
  'tres-runas': { name: 'Tres Runas', description: 'Pasado, Presente y Futuro', positions: 3 },
  'cinco-runas': { name: 'Cinco Runas', description: 'Análisis completo nórdico', positions: 5 }
};


export default function RunesReading() {
  // Estados exclusivos para runas
  const [spreadType, setSpreadType] = useState('');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLimited, setIsLimited] = useState(null);
  const [limitMessage, setLimitMessage] = useState('');
  const [loadingLimit, setLoadingLimit] = useState(false);
  const [showMeditation, setShowMeditation] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [exportTrigger, setExportTrigger] = useState(false);
  const [exportedImage, setExportedImage] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { performReading, loading, error } = useReading();

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

  // Verificar acceso Premium al cargar
  useEffect(() => {
    setLoadingLimit(true);
    const token = localStorage.getItem('arcanaToken');
    
    // Si es admin o tiene Premium activo, no hay límites
    const isAdmin = user && user.role === 'ADMIN';
    const hasPremium = user && user.subscriptionPlan === 'PREMIUM' && user.subscriptionStatus === 'ACTIVE';
    const hasTrial = user && user.trialActive && user.trialExpiry && new Date() < new Date(user.trialExpiry);
    
    if (isAdmin || hasPremium || hasTrial) {
      setIsLimited(false);
      setLimitMessage('');
      setLoadingLimit(false);
      return;
    }

    // Verificar estado de acceso
    fetch('/api/readings/access-status', {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(json => {
        setIsLimited(!json.hasAccess);
        setLimitMessage(!json.hasAccess ? (json.message || 'Necesitas Premium para acceder a las lecturas de runas') : '');
      })
      .catch(() => {
        setIsLimited(true);
        setLimitMessage('Necesitas Premium para acceder a las lecturas de runas');
      })
      .finally(() => setLoadingLimit(false));
  }, [user]);

  const handleSpreadSelect = (spread) => {
  if (isLimited) return;
  setSpreadType(spread);
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
        type: 'RUNES',
        spreadType: spreadType.toLowerCase(),
        deckType: 'elder-futhark',
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

  const handleExport = () => {
    setExportTrigger(true);
  };
  React.useEffect(() => {
    if (exportedImage) {
      if (navigator.share) {
        navigator.share({
          title: 'Mi lectura de Runas',
          text: 'Mira mi lectura premium en ArcanaClub',
          files: [dataURLtoFile(exportedImage, 'lectura-runas.png')]
        });
      } else {
        const link = document.createElement('a');
        link.href = exportedImage;
        link.download = 'lectura-runas.png';
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
        <h1>Lectura de Runas Premium</h1>
        <p>Conecta con la sabiduría ancestral nórdica y recibe la guía de las runas.</p>
      </div>
      <div className="reading-content">
        {/* Mensaje de límite si corresponde */}
        {isLimited === true && !loadingLimit && (
          <div className="step-container limit-reached">
            <div className="limit-message-block center-text">
              <span className="limit-icon" role="img" aria-label="pregunta">❓</span>
              <h2 className="limit-title">Has alcanzado tu límite de lecturas de runas</h2>
              <p className="limit-desc runes-bg">{limitMessage || 'Ya no puedes realizar más lecturas de runas hoy con tu plan actual.'}</p>
              <button className="subscribe-btn" onClick={()=>navigate('/planes')}>
                <span className="mr-half" role="img" aria-label="star">⭐</span>
                Ver Planes y Suscribirse
              </button>
              <div className="limit-actions">
                <button className="new-reading-btn" onClick={resetReading}>
                  <span role="img" aria-label="ArrowLeft">⬅️</span>
                  Volver a inicio
                </button>
                {user && (
                  <button className="view-history-btn" onClick={() => navigate('/profile')}>
                  <span role="img" aria-label="history">📜</span>
                    Ver Historial
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Paso 1: Seleccionar tirada */}
        {isLimited === false && !spreadType && !showMeditation && !showResult && (
          <div className="step-container select-spread">
            <h3 className="runes-color">Selecciona la tirada de runas</h3>
            <p className="spread-desc">Las runas revelan mensajes ancestrales. Elige la tirada que prefieras.</p>
            <div className="spread-options">
              {Object.entries(RUNE_SPREADS).map(([key, spread]) => (
                <button key={key} className="spread-card runes-btn" onClick={()=>handleSpreadSelect(key)}>
                  <h3>{spread.name}</h3>
                  <div className="spread-description">{spread.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Paso 2: Meditación */}
        {isLimited === false && spreadType && !showMeditation && !showResult && (
          <div className="step-container meditation-step center-text">
            <h3 className="runes-color">Tómate un momento de meditación</h3>
            <p className="meditation-desc">
              Cierra los ojos y siente la energía ancestral de las runas. Imagina los símbolos nórdicos brillando en tu mente, conecta con la sabiduría de los antiguos vikingos y permite que la magia de las runas te guíe en tu consulta.
            </p>
            <button className="main-btn meditation-btn runes-btn" onClick={()=>setShowMeditation(true)}>
              ❤️ Estoy preparado/a
            </button>
            <button className="main-btn back-btn" style={{marginTop:'1em'}} onClick={()=>setSpreadType('')}>
              <span role="img" aria-label="ArrowLeft">⬅️</span> Volver
            </button>
          </div>
        )}
        {/* Paso 3: Pregunta premium con explicación mágica */}
        {isLimited === false && spreadType && showMeditation && !showResult && (
          <div className="step-container ask-question">
            <h3 className="runes-color">Haz tu pregunta a las runas</h3>
            <div className="runes-explainer premium-box">
              <h4>¿Cómo funciona la consulta?</h4>
              <ul>
                <li>Formula tu pregunta con respeto y apertura, conectando con la energía nórdica y los guías ancestrales.</li>
                <li>Las runas son oráculos mágicos que transmiten mensajes de dioses, diosas y sabiduría vikinga.</li>
                <li>La interpretación une tradición, magia y tecnología para darte una guía profunda y personalizada.</li>
                <li>Recuerda que la respuesta es una orientación espiritual, no un diagnóstico.</li>
              </ul>
              <div>Tu consulta es privada y respetuosa con la magia nórdica que te rodea.</div>
            </div>
            <form onSubmit={handleQuestionSubmit} className="question-form">
              <label htmlFor="question">Tu pregunta para las runas:</label>
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
              <button type="submit" className="main-btn submit-btn runes-btn" style={{marginTop:'1.2em'}} disabled={isCreating}>
                <span role="img" aria-label="ArrowLeft" className="mr-half">➡️</span> Consultar
              </button>
              <button className="main-btn back-btn" style={{marginTop:'1em'}} onClick={()=>setShowMeditation(false)} type="button">
                <span role="img" aria-label="ArrowLeft">⬅️</span> Volver a meditación
              </button>
            </form>
          </div>
        )}
        {/* Paso 4: Realizando lectura */}
        {isCreating && (
          <div className="step-container performing-reading">
            <div className="reading-animation">
              <RuneSpread 
                spreadType={spreadType}
                isAnimating={true}
              />
            </div>
          </div>
        )}
        {/* Paso 5: Mostrar resultado */}
        {showResult && result && (
          <div className="step-container show-result">
            <div className="result-header">
              <h2>Tu lectura está completa</h2>
              <p>Las runas han hablado. Recibe este mensaje con gratitud y respeto.</p>
            </div>
            <div className="result-content">
              <RuneSpread 
                spreadType={spreadType}
                runes={result.cards}
                isRevealed={true}
              />
              <div className="interpretation-section">
                <h3 className="interpretation-header">
                  👁️ Interpretación
                </h3>
                <div className="interpretation-text">
                  <ReactMarkdown>{result.interpretation}</ReactMarkdown>
                </div>
              </div>
              <div className="reading-info">
                <div className="info-item">
                  <strong>Pregunta:</strong> {question}
                </div>
                <div className="info-item">
                  <strong>Fecha:</strong> {new Date().toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div className="gratitude-message">
                ❤️ Agradece a las runas y al universo por la guía recibida.
                Agradece a las runas y al universo por la guía recibida.
              </div>
            </div>
            <div className="result-actions">
              <button className="new-reading-btn" onClick={resetReading}>
                <span role="img" aria-label="Nueva Lectura" style={{fontSize:'1.2em'}}>⭐</span>
                Nueva Lectura
              </button>
              <button className="share-btn" onClick={handleExport}>
                <span role="img" aria-label="star">⭐</span>
 Compartir como imagen
              </button>
              {user && (
                <button className="view-history-btn" onClick={() => navigate('/profile')}>
                  <span role="img" aria-label="history">📜</span>
                  Ver Historial
                </button>
              )}
            </div>
            <CanvasExporter
              exportTrigger={exportTrigger}
              onExported={setExportedImage}
              logoSrc="/logo.png"
            >
              {`Lectura de Runas Premium\nPregunta: ${question}\nInterpretación: ${result.interpretation}`}
            </CanvasExporter>
          </div>
        )}
        {error && (
          <div className="error-message">
            <span role="img" aria-label="question">❓</span>
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
