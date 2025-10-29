import React, { useState, useEffect } from 'react'
import '../styles/RuneSpread.css'

const RUNE_SPREAD_LAYOUTS = {
  'runa-unica': {
    name: 'Runa Única',
    positions: [
      { id: 1, x: 50, y: 50, label: 'Guía Espiritual' }
    ]
  },
  'tres-runas': {
    name: 'Tres Runas',
    positions: [
      { id: 1, x: 25, y: 50, label: 'Pasado (Urð)' },
      { id: 2, x: 50, y: 50, label: 'Presente (Verðandi)' },
      { id: 3, x: 75, y: 50, label: 'Futuro (Skuld)' }
    ]
  },
  'cinco-runas': {
    name: 'Cinco Runas',
    positions: [
      { id: 1, x: 50, y: 20, label: 'Situación' },
      { id: 2, x: 20, y: 50, label: 'Desafío' },
      { id: 3, x: 50, y: 50, label: 'Curso de Acción' },
      { id: 4, x: 80, y: 50, label: 'Sacrificio' },
      { id: 5, x: 50, y: 80, label: 'Nuevo Comienzo' }
    ]
  }
}

const RuneStone = ({ rune, position, isRevealed, isAnimating, onClick }) => {
  const [isFlipping, setIsFlipping] = useState(false)
  const [showFront, setShowFront] = useState(false)

  useEffect(() => {
    if (isRevealed && !showFront && !isAnimating) {
      const timer = setTimeout(() => {
        setIsFlipping(true)
        setTimeout(() => {
          setShowFront(true)
          setIsFlipping(false)
        }, 400)
      }, position.id * 300) // Delay más largo para efecto dramático
      
      return () => clearTimeout(timer)
    }
  }, [isRevealed, showFront, isAnimating, position.id])

  const stoneStyle = {
    left: `${position.x}%`,
    top: `${position.y}%`,
    transform: `translate(-50%, -50%) ${isFlipping ? 'rotateY(180deg)' : ''}`,
    zIndex: position.id
  }

  return (
    <div 
      className={`rune-stone-container ${isAnimating ? 'animating' : ''} ${showFront ? 'revealed' : ''}`}
      style={stoneStyle}
      onClick={onClick}
    >
      <div className="rune-stone">
        {/* Reverso de la runa (piedra sin tallar) */}
        <div className="stone-back">
          <div className="stone-texture">
            <div className="stone-pattern">
              <div className="stone-grain"></div>
              <div className="stone-shadows"></div>
            </div>
          </div>
        </div>

        {/* Frente de la runa */}
        {rune && (
          <div className="stone-front">
            <div className={`rune-content ${rune.reversed ? 'reversed' : ''}`}>
              <div className="rune-symbol-container">
                <div className="rune-symbol">
                  {rune.symbol}
                </div>
                {rune.reversed && (
                  <div className="reversed-indicator">
                    🛡️
                    Merkstave
                  </div>
                )}
              </div>
              
              <div className="rune-name">
                <h4>{rune.name}</h4>
              </div>

              <div className="rune-keywords">
                {rune.keywords?.slice(0, 2).map((keyword, index) => (
                  <span key={index} className="rune-keyword">{keyword}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="position-label">
        <span role="img" aria-label="Dragón">🐉</span>
        <span>{position.label}</span>
      </div>
    </div>
  )
}

export default function RuneSpread({ 
  spreadType = 'tres-runas', 
  runes = [], 
  isRevealed = false,
  isAnimating = false,
  onRuneClick = () => {}
}) {
  const [selectedRune, setSelectedRune] = useState(null)
  const spread = RUNE_SPREAD_LAYOUTS[spreadType]

  if (!spread) {
    return (
      <div className="rune-spread-error">
        <p>Tipo de tirada no encontrada: {spreadType}</p>
      </div>
    )
  }

  const handleRuneClick = (rune, position) => {
    setSelectedRune({ rune, position })
    onRuneClick(rune, position)
  }

  return (
    <div className="rune-spread-container">
      <div className="spread-header">
        <h3>
          <span role="img" aria-label="Dragón">🐉</span>
          {spread.name}
        </h3>
        {isAnimating && (
          <div className="spread-status">
            <span role="img" aria-label="Rayo" className="emoji-spinner">⚡</span>
            Las runas despiertan...
          </div>
        )}
      </div>

      <div className="rune-cloth">
        <div className="cloth-pattern"></div>
        <div className="spread-layout">
          {spread.positions.map((position, index) => (
            <RuneStone
              key={position.id}
              rune={runes[index]}
              position={position}
              isRevealed={isRevealed}
              isAnimating={isAnimating}
              onClick={() => runes[index] && handleRuneClick(runes[index], position)}
            />
          ))}
        </div>

        {isAnimating && (
          <div className="animation-overlay">
            <div className="mystical-energy">
              {Array.from({length: 15}, (_, i) => (
                <div key={i} className="energy-wisp" style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`
                }}>⚡</div>
              ))}
            </div>
            <div className="ancient-circle">
              <div className="circle-runes">
                <span>ᚠ</span>
                <span>ᚢ</span>
                <span>ᚦ</span>
                <span>ᚨ</span>
                <span>ᚱ</span>
                <span>ᚲ</span>
                <span>ᚷ</span>
                <span>ᚹ</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedRune && (
        <div className="rune-modal-overlay" onClick={() => setSelectedRune(null)}>
          <div className="rune-modal">
            <div className="modal-header">
              <div className="modal-rune-symbol">{selectedRune.rune.symbol}</div>
              <div className="modal-title">
                <h3>{selectedRune.rune.name}</h3>
                <p>Runa del Elder Futhark</p>
              </div>
              <button className="close-modal" onClick={() => setSelectedRune(null)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="rune-position">
                <span role="img" aria-label="Dragón">🐉</span>
                <strong>Posición:</strong> {selectedRune.position.label}
              </div>
              
              <div className="rune-meaning">
                <strong>Significado:</strong>
                <p>{selectedRune.rune.meaning}</p>
              </div>

              {selectedRune.rune.keywords && (
                <div className="rune-keywords-full">
                  <strong>Energías asociadas:</strong>
                  <div className="keywords-list">
                    {selectedRune.rune.keywords.map((keyword, index) => (
                      <span key={index} className="keyword-tag norse">{keyword}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedRune.rune.reversed && (
                <div className="merkstave-meaning">
                  🛡️
                  <strong>Merkstave (Invertida):</strong> 
                  <p>La energía de esta runa está bloqueada o requiere precaución en su interpretación.</p>
                </div>
              )}

              <div className="rune-lore">
                <strong>Sabiduría Ancestral:</strong>
                <p>Esta runa fue tallada por los antiguos vikingos como un canal de comunicación con los dioses y las fuerzas de la naturaleza.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRevealed && runes.length > 0 && (
        <div className="spread-summary">
          <div className="runes-revealed">
            ❤️
            {runes.length} runa{runes.length !== 1 ? 's' : ''} revelada{runes.length !== 1 ? 's' : ''}
          </div>
          <p className="spread-description">
            Los antiguos símbolos nórdicos han hablado. Haz clic en cualquier runa para profundizar en su sabiduría.
          </p>
        </div>
      )}

      <div className="norse-blessing">
        <div className="blessing-text">
          <span role="img" aria-label="Dragón">🐉</span>
          <em>"Que la sabiduría de Odín guíe tu camino"</em>
        </div>
      </div>
    </div>
  )
}