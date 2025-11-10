import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { shareNebulosaMagica } from '../utils/shareUtils'
import '../styles/TarotSpread.css'

const SPREAD_LAYOUTS = {
  'una-carta': {
    name: 'Una Carta',
    positions: [
      { id: 1, x: 50, y: 50, label: 'Respuesta' }
    ]
  },
  'tres-cartas': {
    name: 'Tres Cartas',
    positions: [
      { id: 1, x: 20, y: 50, label: 'Pasado' },
      { id: 2, x: 50, y: 50, label: 'Presente' },
      { id: 3, x: 80, y: 50, label: 'Futuro' }
    ]
  },
  'cruz-celta': {
    name: 'Cruz Celta',
    positions: [
      { id: 1, x: 50, y: 40, label: 'Situación Actual' },
      { id: 2, x: 50, y: 40, label: 'Desafío', rotation: 90 },
      { id: 3, x: 50, y: 20, label: 'Pasado Distante' },
      { id: 4, x: 30, y: 40, label: 'Pasado Reciente' },
      { id: 5, x: 50, y: 60, label: 'Posible Futuro' },
      { id: 6, x: 70, y: 40, label: 'Futuro Inmediato' },
      { id: 7, x: 85, y: 75, label: 'Tu Enfoque' },
      { id: 8, x: 85, y: 60, label: 'Influencias Externas' },
      { id: 9, x: 85, y: 45, label: 'Esperanzas y Miedos' },
      { id: 10, x: 85, y: 30, label: 'Resultado Final' }
    ]
  },
  'herradura': {
    name: 'Herradura',
    positions: [
      { id: 1, x: 15, y: 70, label: 'Pasado' },
      { id: 2, x: 25, y: 40, label: 'Presente' },
      { id: 3, x: 45, y: 20, label: 'Influencias Ocultas' },
      { id: 4, x: 65, y: 20, label: 'Obstáculos' },
      { id: 5, x: 85, y: 40, label: 'Posible Resultado' },
      { id: 6, x: 95, y: 70, label: 'Futuro Inmediato' },
      { id: 7, x: 55, y: 80, label: 'Resultado Final' }
    ]
  },
  'amor': {
    name: 'Tirada del Amor',
    positions: [
      { id: 1, x: 50, y: 20, label: 'Tú' },
      { id: 2, x: 20, y: 50, label: 'Tu Pareja/Interés' },
      { id: 3, x: 50, y: 50, label: 'Relación Actual' },
      { id: 4, x: 80, y: 50, label: 'Obstáculos' },
      { id: 5, x: 50, y: 80, label: 'Potencial Futuro' }
    ]
  },
  'trabajo': {
    name: 'Tirada del Trabajo',
    positions: [
      { id: 1, x: 25, y: 30, label: 'Situación Actual' },
      { id: 2, x: 75, y: 30, label: 'Obstáculos' },
      { id: 3, x: 25, y: 70, label: 'Oportunidades' },
      { id: 4, x: 75, y: 70, label: 'Resultado' }
    ]
  }
}

const TarotCard = ({ card, position, isRevealed, isAnimating, onClick }) => {
  const [isFlipping, setIsFlipping] = useState(false)
  const [showFront, setShowFront] = useState(false)

  useEffect(() => {
    if (isRevealed && !showFront && !isAnimating) {
      const timer = setTimeout(() => {
        setIsFlipping(true)
        setTimeout(() => {
          setShowFront(true)
          setIsFlipping(false)
        }, 300)
      }, position.id * 200) // Delay escalonado
      
      return () => clearTimeout(timer)
    }
  }, [isRevealed, showFront, isAnimating, position.id])

  const cardStyle = {
    left: `${position.x}%`,
    top: `${position.y}%`,
    transform: `translate(-50%, -50%) ${position.rotation ? `rotate(${position.rotation}deg)` : ''} ${isFlipping ? 'rotateY(180deg)' : ''}`,
    zIndex: position.id
  }

  return (
    <div 
      className={`tarot-card-container ${isAnimating ? 'animating' : ''} ${showFront ? 'revealed' : ''}`}
      style={cardStyle}
      onClick={onClick}
    >
      <div className="tarot-card">
        {/* Reverso de la carta */}
        <div className="card-back">
          <div className="card-back-design">
            <div className="mystical-pattern">
              🎴
              <div className="arcane-symbols">
                <span>✦</span>
                <span>◆</span>
                <span>✧</span>
              </div>
            </div>
          </div>
        </div>

        {/* Frente de la carta */}
        {card && (
          <div className="card-front">
            <div className={`card-content ${card.reversed ? 'reversed' : ''}`}>
              <div className="card-header">
                <h4 className="card-name">{card.name}</h4>
                {card.arcana && (
                  <span className={`arcana-badge ${card.arcana.toLowerCase()}`}>
                    {card.arcana}
                  </span>
                )}
              </div>
              
              <div className="card-image-container">
                {card.imageUrl ? (
                  <img 
                    src={card.imageUrl} 
                    alt={card.name}
                    className="card-image"
                    onError={e => { e.target.style.display = 'none'; e.target.parentNode.querySelector('.card-placeholder').style.display = 'flex'; }}
                  />
                ) : null}
                <div className="card-placeholder" style={{ display: card.imageUrl ? 'none' : 'flex' }}>
                  <div className="placeholder-bg">
                    👁️
                  </div>
                  <span className="placeholder-label">Sin imagen</span>
                </div>
                {card.reversed && (
                  <div className="reversed-indicator">
                    <span role="img" aria-label="Invertida" style={{marginRight:'0.3em'}}>⭐</span>
                    Invertida
                  </div>
                )}
              </div>

              <div className="card-info">
                {card.suit && (
                  <span className="card-suit">{card.suit}</span>
                )}
                <div className="card-keywords">
                  {card.keywords?.slice(0, 3).map((keyword, index) => (
                    <span key={index} className="keyword">{keyword}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="position-label">
        <span>{position.label}</span>
      </div>
    </div>
  )
}

export default function TarotSpread({ 
  spreadType = 'tres-cartas', 
  cards = [], 
  interpretation = null,
  isRevealed = false,
  isAnimating = false,
  onCardClick = () => {}
}) {
  const [selectedCard, setSelectedCard] = useState(null)
  const spread = SPREAD_LAYOUTS[spreadType]

  if (!spread) {
    return (
      <div className="tarot-spread-error">
        <p>Tipo de tirada no encontrada: {spreadType}</p>
      </div>
    )
  }

  const handleCardClick = (card, position) => {
    setSelectedCard({ card, position })
    onCardClick(card, position)
  }

  return (
    <div className="tarot-spread-container">
      <div className="spread-header">
        <h3>
          🎴
          {spread.name}
        </h3>
        {isAnimating && (
          <div className="spread-status">
            <span role="img" aria-label="Mezclando" style={{animation:'spin 1s linear infinite',display:'inline-block'}}>⭐</span>
            Mezclando las cartas...
          </div>
        )}
      </div>

      <div className="spread-table">
        <div className="spread-layout">
          {spread.positions.map((position, index) => (
            <TarotCard
              key={position.id}
              card={cards[index]}
              position={position}
              isRevealed={isRevealed}
              isAnimating={isAnimating}
              onClick={() => cards[index] && handleCardClick(cards[index], position)}
            />
          ))}
        </div>

        {isAnimating && (
          <div className="animation-overlay">
            <div className="magical-particles">
              {Array.from({length: 20}, (_, i) => (
                <div key={i} className="particle" style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}>✨</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedCard && (
        <div className="card-modal-overlay" onClick={() => setSelectedCard(null)}>
          <div className="card-modal">
            <div className="modal-header">
              <h3>{selectedCard.card.name}</h3>
              <button className="close-modal" onClick={() => setSelectedCard(null)}>×</button>
            </div>
            <div className="modal-content">
              <div className="card-position">
                <strong>Posición:</strong> {selectedCard.position.label}
              </div>
              <div className="card-meaning">
                <strong>Significado:</strong>
                <p>{selectedCard.card.meaning}</p>
              </div>
              {selectedCard.card.keywords && (
                <div className="card-keywords-full">
                  <strong>Palabras clave:</strong>
                  <div className="keywords-list">
                    {selectedCard.card.keywords.map((keyword, index) => (
                      <span key={index} className="keyword-tag">{keyword}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedCard.card.reversed && (
                <div className="reversed-meaning">
                  <span role="img" aria-label="Invertida" style={{marginRight:'0.3em'}}>⭐</span>
                  <strong>Carta Invertida:</strong> La energía está bloqueada o en proceso de liberación.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isRevealed && cards.length > 0 && (
        <div className="spread-summary">
          <div className="cards-revealed">
            ❤️
            {cards.length} carta{cards.length !== 1 ? 's' : ''} revelada{cards.length !== 1 ? 's' : ''}
          </div>
          <p className="spread-description">
            Haz clic en cualquier carta para ver más detalles sobre su significado
          </p>
        </div>
      )}

      {/* Interpretación del tarot */}
      {interpretation && isRevealed && (
        <div className="interpretation-section">
          <div className="interpretation-header">
            <h3>
              🔮 Interpretación de tu Lectura
            </h3>
          </div>
          <div className="interpretation-content">
            <div className="interpretation-text">
              <ReactMarkdown className="interpretation-markdown">
                {interpretation}
              </ReactMarkdown>
            </div>
          </div>
          <div className="interpretation-actions">
            <button className="share-btn" onClick={() => shareNebulosaMagica('tarot')}>
              <span role="img" aria-label="compartir">📱</span>
              Compartir lectura
            </button>
          </div>
        </div>
      )}
    </div>
  )
}