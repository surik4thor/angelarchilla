
// src/pages/Reading.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useReading } from '../hooks/useReading.js'
import TarotSpread from '../components/TarotSpread.jsx'
import RuneSpread from '../components/RuneSpread.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import AdModal from '../components/AdModal.jsx'
import '../styles/Reading.css'
import '../styles/Reading.css'

const TAROT_SPREADS = {
  'una-carta': { name: 'Una Carta', description: 'Respuesta directa y concisa', positions: 1 },
  'tres-cartas': { name: 'Tres Cartas', description: 'Pasado, Presente y Futuro', positions: 3 },
  'cruz-celta': { name: 'Cruz Celta', description: 'Análisis profundo y completo', positions: 10 },
  'herradura': { name: 'Herradura', description: 'Visión panorámica de la situación', positions: 7 },
  'amor': { name: 'Tirada del Amor', description: 'Especializada en relaciones', positions: 5 },
  'trabajo': { name: 'Tirada del Trabajo', description: 'Enfoque profesional y carrera', positions: 4 }
}

const RUNE_SPREADS = {
  'runa-unica': { name: 'Runa Única', description: 'Guía espiritual directa', positions: 1 },
  'tres-runas': { name: 'Tres Runas', description: 'Pasado, Presente y Futuro', positions: 3 },
  'cinco-runas': { name: 'Cinco Runas', description: 'Análisis completo nórdico', positions: 5 }
}

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
}

export default function Reading() {
  // Estados principales y de UI
  const [readingType, setReadingType] = useState('');
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
  const [decks, setDecks] = useState({});
  const [showAdModal, setShowAdModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { performReading, loading, error } = useReading();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

  // Log de depuración
  useEffect(() => {
    console.log('[DEBUG] isLimited:', isLimited, 'readingType:', readingType, 'spreadType:', spreadType);
  }, [isLimited, readingType, spreadType]);

  // Cargar decks
  useEffect(() => {
    async function loadDecks(){
      try{
        const res = await fetch('/api/decks');
        const json = await res.json();
        if(json && json.success && Array.isArray(json.decks) && json.decks.length > 0){
          const map = json.decks.reduce((acc,d)=>{ acc[d.slug] = d; return acc }, {});
          setDecks(map);
        } else {
          setDecks(TAROT_DECKS);
        }
      }catch(e){
        setDecks(TAROT_DECKS);
      }
    }
    loadDecks();
  }, []);

  // Selección de tipo: consulta límite
  const handleTypeSelect = (type) => {
    setReadingType(type);
    setSpreadType('');
    setDeckType('rider-waite');
    setResult(null);
    setShowResult(false);
    setIsLimited(null);
    setLimitMessage('');
    setLoadingLimit(true);
    const apiType = type === 'runes' ? 'runes' : 'tarot';
    const token = localStorage.getItem('arcanaToken');
    // Si el usuario es MAESTRO, nunca hay límite
    if (user && (user.subscriptionPlan || '').toUpperCase() === 'MAESTRO') {
      setIsLimited(false);
      setLimitMessage('');
      setLoadingLimit(false);
      return;
    }
    fetch(`/api/readings/limit-status?type=${apiType}`, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(json => {
        setIsLimited(!!json.limited);
        setLimitMessage(json.limited ? (json.message || 'Has alcanzado el límite de lecturas para tu plan.') : '');
      })
      .catch(() => setIsLimited(false))
      .finally(() => setLoadingLimit(false));
  }

  const handleSpreadSelect = (spread) => {
    if (isLimited) return;
    setSpreadType(spread)
  }

  const handleDeckSelect = (deck) => {
    if (isLimited) return;
    setDeckType(deck)
  }

  const handleQuestionSubmit = (e) => {
    e.preventDefault()
    if (isLimited) return;
    if (question.trim().length < 10) {
      setLimitMessage('La pregunta debe tener al menos 10 caracteres.')
      setIsLimited(true);
      return
    }
    setShowResult(false)
    executeReading()
  }

  const executeReading = async () => {
    setIsCreating(true)
    try {
      const payload = {
        type: readingType.toUpperCase(),
        spreadType: spreadType.toLowerCase(),
        deckType: readingType === 'tarot' ? deckType : 'elder-futhark',
        question
      }
      const readingData = await performReading(payload)
      setResult(readingData)
      setShowResult(true)
    } catch (err) {
      setLimitMessage('Error al crear la lectura. Por favor, inténtalo de nuevo.')
      setIsLimited(true);
    } finally {
      setIsCreating(false)
    }
  }

  const resetReading = () => {
    setReadingType('')
    setSpreadType('')
    setDeckType('rider-waite')
    setQuestion('')
    setResult(null)
    setShowResult(false)
    setLimitMessage('')
    setIsLimited(null);
  }

  const showAds = !user || !['ADEPTO', 'MAESTRO'].includes((user.subscriptionPlan || '').toUpperCase());
  useEffect(() => {
    if (showAds) setShowAdModal(true);
  }, [showAds]);

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
      {/* DEBUG VISUAL: tipo, límite y spread */}
      <div className="debug-visual">
        <div>readingType: <b>{readingType}</b></div>
        <div>isLimited: <b>{String(isLimited)}</b></div>
        <div>spreadType: <b>{spreadType}</b></div>
      </div>
      <div className="reading-header">
        {/* ...existing code... */}
      </div>
      <div className="reading-content">
        {/* Selector de tipo siempre visible si no hay tipo seleccionado */}
        {!readingType && (
          <div className="step-container select-type">
            <h2>Selecciona el tipo de lectura</h2>
            <p className="reading-type-desc">
              Elige con el corazón: <span className="tarot-color">el tarot</span> te conecta con arquetipos y emociones profundas; <span className="runes-color">las runas</span> canalizan la sabiduría ancestral y la magia nórdica.
            </p>
            <div className="reading-type-selector">
              <button className="type-option tarot-btn" onClick={()=>handleTypeSelect('tarot')}>
                <span className="type-icon">🎴</span>
                <h3>Tarot</h3>
                <p>Arquetipos, emociones y guía espiritual profunda.</p>
              </button>
              <button className="type-option runes-btn" onClick={()=>handleTypeSelect('runes')}>
                <span className="type-icon">⭐</span>
                <h3>Runas</h3>
                <p>Sabiduría nórdica, respuestas directas y magia ancestral.</p>
              </button>
            </div>
          </div>
        )}
        {/* Mensaje de límite si corresponde. Si isLimited === true, bloquea el flujo completamente para cualquier tipo */}
        {readingType && isLimited === true && !loadingLimit && (
          <div className="step-container limit-reached">
            <div className="limit-message-block center-text">
              <span role="img" aria-label="Límite" className="limit-icon" style={{fontSize:'1.3em'}}>❓</span>
              <h2 className="limit-title">Has alcanzado tu límite de lecturas</h2>
              <p className={`limit-desc ${readingType==='tarot' ? 'tarot-bg' : 'runes-bg'}`}>{limitMessage || 'Ya no puedes realizar más lecturas hoy con tu plan actual.'}</p>
              <button className="subscribe-btn" onClick={()=>navigate('/planes')}>
                <span role="img" aria-label="Premium" className="mr-half" style={{fontSize:'1.2em'}}>⭐</span>
                Ver Planes y Suscribirse
              </button>
              <div className="limit-actions">
                <button className="new-reading-btn" onClick={resetReading}>
                  <span role="img" aria-label="volver">⬅️</span>
                  Volver a inicio
                </button>
                {user && (
                  <button className="view-history-btn" onClick={() => navigate('/profile')}>
                    <span role="img" aria-label="Historial" style={{fontSize:'1.2em'}}>📜</span>
                    Ver Historial
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {/* El resto del flujo solo si NO está limitado */}
        {readingType && isLimited === false && !showResult && (
          <>
            {/* Paso 2: Seleccionar tirada */}
            {readingType === 'tarot' && !spreadType && (
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
            {/* ÚNICO bloque para runas */}
            {readingType === 'runes' && !spreadType && (
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
            {/* Paso 3: Seleccionar baraja (solo para tarot) */}
            {readingType === 'tarot' && spreadType && !deckType && (
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
            {/* Paso 4: Meditación después de elegir baraja (solo tarot) o después de elegir tirada (runes) */}
            {((readingType === 'tarot' && spreadType && deckType && !showMeditation) || (readingType === 'runes' && spreadType && !showMeditation)) && (
              <div className="step-container meditation-step center-text">
                <h3 className={readingType==='tarot' ? 'tarot-color' : 'runes-color'}>Tómate un momento de meditación</h3>
                <p className="meditation-desc">
                  {readingType==='tarot' && deckType && decks[deckType] && decks[deckType].meditation ? (
                    decks[deckType].meditation
                  ) : readingType==='runes' ? (
                    <>Cierra los ojos y siente la energía ancestral de las runas. Imagina los símbolos nórdicos brillando en tu mente, conecta con la sabiduría de los antiguos vikingos y permite que la magia de las runas te guíe en tu consulta.</>
                  ) : (
                    <>Antes de formular tu pregunta, cierra los ojos, respira profundo y conecta con tu interior.<br/>Siente el respeto por el tarot, las runas y las energías universales.<br/>Cuando estés preparado/a, continúa.</>
                  )}
                </p>
                <button className={`main-btn meditation-btn ${readingType==='tarot' ? 'tarot-btn' : 'runes-btn'}`} onClick={()=>setShowMeditation(true)}>
                  ❤️ Estoy preparado/a
                </button>
                <button className="main-btn back-btn" style={{marginTop:'1em'}} onClick={()=>{
                  if (readingType==='tarot') setDeckType('');
                  else setSpreadType('');
                }}>
                  <span role="img" aria-label="volver">⬅️</span> Volver
                </button>
              </div>
            )}
            {/* Paso 5: Hacer pregunta */}
            {showMeditation && ((readingType === 'tarot' && spreadType && deckType) || (readingType === 'runes' && spreadType)) && (
              <div className="step-container ask-question">
                <h3 className={readingType==='tarot' ? 'tarot-color' : 'runes-color'}>Haz tu pregunta</h3>
                <p className="question-desc">Formula tu pregunta de manera clara y específica para obtener la mejor orientación.</p>
                <form onSubmit={handleQuestionSubmit} className="question-form">
                  <textarea
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    rows={4}
                    className={`question-textarea ${readingType==='tarot' ? 'tarot-border' : 'runes-border'}`}
                    placeholder="Escribe aquí tu pregunta..."
                    required
                  />
                  <button type="submit" className={`main-btn submit-btn ${readingType==='tarot' ? 'tarot-btn' : 'runes-btn'}`} disabled={isCreating}>
                    <span role="img" aria-label="Consultar" className="mr-half" style={{fontSize:'1.2em'}}>🔮</span> Consultar
                  </button>
                </form>
                <button className="main-btn back-btn" onClick={()=>{setShowMeditation(false);}}>
                  <span role="img" aria-label="volver">⬅️</span> Volver a meditación
                </button>
              </div>
            )}
          </>
        )}
        {/* Paso 5: Realizando lectura */}
        {isCreating && (
          <div className="step-container performing-reading">
            <div className="reading-animation">
              {readingType === 'tarot' ? (
                <TarotSpread 
                  spreadType={spreadType}
                  isAnimating={true}
                />
              ) : (
                <RuneSpread 
                  spreadType={spreadType}
                  isAnimating={true}
                />
              )}
            </div>
          </div>
        )}
        {/* Paso 6: Mostrar resultado */}
        {showResult && result && (
          <div className="step-container show-result">
            <div className="result-header">
              <h2>Tu lectura está completa</h2>
              <p>El universo ha hablado. Recibe este mensaje con gratitud y respeto.</p>
            </div>
            <div className="result-content">
              {readingType === 'tarot' ? (
                <TarotSpread 
                  spreadType={spreadType}
                  cards={result.cards ? result.cards.map(c => c.card) : []}
                  isRevealed={true}
                />
              ) : (
                <RuneSpread 
                  spreadType={spreadType}
                  runes={result.cards}
                  isRevealed={true}
                />
              )}
              <div className="interpretation-section">
                <h3 className="interpretation-header">
                  👁️Interpretación
                </h3>
                <div className="interpretation-text">
                  {result.interpretation}
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
                ❤️ Agradece al tarot, a las runas y al universo por la guía recibida.
              </div>
            </div>
            <div className="result-actions">
              <button className="new-reading-btn" onClick={resetReading}>
                🎴 Nueva Lectura
                Nueva Lectura
              </button>
            </div>
          </div>
        )}
        {/* Formulario de lectura si no está limitado y hay tipo seleccionado */}
        {readingType && isLimited === false && !showResult && (
          <>
            {/* Paso 2: Seleccionar tirada */}
            {readingType === 'tarot' && !spreadType && (
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
            {readingType === 'runes' && !spreadType && (
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
            {/* Paso 3: Seleccionar baraja (solo para tarot) */}
            {readingType === 'tarot' && spreadType && !deckType && (
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
            {/* Paso 4: Meditación después de elegir baraja (solo tarot) o después de elegir tirada (runes) */}
            {(((readingType === 'tarot' && spreadType && deckType && !showMeditation) || (readingType === 'runes' && spreadType && !showMeditation))) && (
              <div className="step-container meditation-step center-text">
                <h3 className={readingType==='tarot' ? 'tarot-color' : 'runes-color'}>Tómate un momento de meditación</h3>
                <p className="meditation-desc">
                  {readingType==='tarot' && deckType && decks[deckType] && decks[deckType].meditation ? (
                    decks[deckType].meditation
                  ) : readingType==='runes' ? (
                    <>Cierra los ojos y siente la energía ancestral de las runas. Imagina los símbolos nórdicos brillando en tu mente, conecta con la sabiduría de los antiguos vikingos y permite que la magia de las runas te guíe en tu consulta.</>
                  ) : (
                    <>Antes de formular tu pregunta, cierra los ojos, respira profundo y conecta con tu interior.<br/>Siente el respeto por el tarot, las runas y las energías universales.<br/>Cuando estés preparado/a, continúa.</>
                  )}
                </p>
                <button className={`main-btn meditation-btn ${readingType==='tarot' ? 'tarot-btn' : 'runes-btn'}`} onClick={()=>setShowMeditation(true)}>
                  ❤️ Estoy preparado/a
                </button>
                <button className="main-btn back-btn" style={{marginTop:'1em'}} onClick={()=>{
                  if (readingType==='tarot') setDeckType('');
                  else setSpreadType('');
                }}>
                  <span role="img" aria-label="volver">⬅️</span> Volver
                </button>
              </div>
            )}
            {/* Paso 5: Hacer pregunta */}
            {showMeditation && ((readingType === 'tarot' && spreadType && deckType) || (readingType === 'runes' && spreadType)) && (
              <div className="step-container ask-question">
                <h3 className={readingType==='tarot' ? 'tarot-color' : 'runes-color'}>Haz tu pregunta</h3>
                <p className="question-desc">Formula tu pregunta de manera clara y específica para obtener la mejor orientación.</p>
                <form onSubmit={handleQuestionSubmit} className="question-form">
                  <textarea
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    rows={4}
                    className={`question-textarea ${readingType==='tarot' ? 'tarot-border' : 'runes-border'}`}
                    placeholder="Escribe aquí tu pregunta..."
                    required
                  />
                  <button type="submit" className={`main-btn submit-btn ${readingType==='tarot' ? 'tarot-btn' : 'runes-btn'}`} disabled={isCreating}>
                    <span role="img" aria-label="Consultar" className="mr-half" style={{fontSize:'1.2em'}}>🔮</span> Consultar
                  </button>
                </form>
                <button className="main-btn back-btn" onClick={()=>{setShowMeditation(false);}}>
                  <span role="img" aria-label="volver">⬅️</span> Volver a meditación
                </button>
              </div>
            )}
            {/* Paso 4: Hacer pregunta */}
            {showMeditation && ((readingType === 'tarot' && spreadType && deckType) || (readingType === 'runes' && spreadType)) && (
              <div className="step-container ask-question">
                <h3 className={readingType==='tarot' ? 'tarot-color' : 'runes-color'}>Haz tu pregunta</h3>
                <p className="question-desc">Formula tu pregunta de manera clara y específica para obtener la mejor orientación.</p>
                <form onSubmit={handleQuestionSubmit} className="question-form">
                  <textarea
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    rows={4}
                    className={`question-textarea ${readingType==='tarot' ? 'tarot-border' : 'runes-border'}`}
                    placeholder="Escribe aquí tu pregunta..."
                    required
                  />
                  <button type="submit" className={`main-btn submit-btn ${readingType==='tarot' ? 'tarot-btn' : 'runes-btn'}`} disabled={isCreating}>
                    <span role="img" aria-label="Consultar" className="mr-half" style={{fontSize:'1.2em'}}>🔮</span> Consultar
                  </button>
                </form>
                <button className="main-btn back-btn" onClick={()=>{setShowMeditation(false);}}>
                  <span role="img" aria-label="volver">⬅️</span> Volver a meditación
                </button>
              </div>
            )}
          </>
        )}
// Estado para mostrar el paso de meditación
  const [showMeditation, setShowMeditation] = useState(false);
        {/* Paso 5: Realizando lectura */}
        {isCreating && (
          <div className="step-container performing-reading">
            <div className="reading-animation">
              {readingType === 'tarot' ? (
                <TarotSpread 
                  spreadType={spreadType}
                  isAnimating={true}
                />
              ) : (
                <RuneSpread 
                  spreadType={spreadType}
                  isAnimating={true}
                />
              )}
            </div>
          </div>
        )}
        {/* Paso 6: Mostrar resultado */}
        {showResult && result && (
          <div className="step-container show-result">
            <div className="result-header">
              <h2>Tu lectura está completa</h2>
              <p>El universo ha hablado. Recibe este mensaje con gratitud y respeto.</p>
            </div>
            <div className="result-content">
              {readingType === 'tarot' ? (
                <TarotSpread 
                  spreadType={spreadType}
                  cards={result.cards ? result.cards.map(c => c.card) : []}
                  isRevealed={true}
                />
              ) : (
                <RuneSpread 
                  spreadType={spreadType}
                  runes={result.cards}
                  isRevealed={true}
                />
              )}
              <div className="interpretation-section">
                <h3 className="interpretation-header">
                  👁️ Interpretación
                </h3>
                <div className="interpretation-text">
                  {result.interpretation}
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
                ❤️ Agradece al tarot, a las runas y al universo por la guía recibida.
                Agradece al tarot, a las runas y al universo por la guía recibida.
              </div>
            </div>
            <div className="result-actions">
              <button className="new-reading-btn" onClick={resetReading}>
                🎴 Nueva Lectura
                Nueva Lectura
              </button>
              {user && (
                <button className="view-history-btn" onClick={() => navigate('/profile')}>
                  <span role="img" aria-label="Historial" style={{fontSize:'1.2em'}}>📜</span>
                  Ver Historial
                </button>
              )}
            </div>
          </div>
        )}
        {error && (
          <div className="error-message">
            <span role="img" aria-label="Error" style={{fontSize:'1.2em'}}>❓</span>
            {error}
          </div>
        )}
      </div>
    </main>
  )
}