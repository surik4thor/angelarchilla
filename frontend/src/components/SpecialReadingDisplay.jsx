import React from 'react';
import ReactMarkdown from 'react-markdown';
import '../styles/SpecialReadings.css';

const AngelReading = ({ reading }) => {
  if (!reading || !reading.cards) return null;

  const parsedReading = typeof reading === 'string' ? JSON.parse(reading) : reading;

  return (
    <div className="angel-reading-container">
      <div className="angel-reading-header">
        <h2>✨ {parsedReading.description}</h2>
        <div className="angel-light-beam"></div>
      </div>

      <div className="angel-cards-grid">
        {parsedReading.cards.map((card, index) => (
          <div key={index} className="angel-card">
            <div className="angel-card-header">
              <h3 className="angel-position">{card.position}</h3>
              <h4 className="angel-name">👼 {card.angel}</h4>
            </div>

            <div className="angel-message">
              <ReactMarkdown>{card.message}</ReactMarkdown>
            </div>

            {card.guidance && (
              <div className="angel-guidance">
                <h5>🌟 Guía Angelical:</h5>
                <ReactMarkdown>{card.guidance}</ReactMarkdown>
              </div>
            )}

            {card.affirmation && (
              <div className="angel-affirmation">
                <h5>💫 Afirmación:</h5>
                <p>"{card.affirmation}"</p>
              </div>
            )}

            {card.energy && (
              <div className="angel-energy">
                <span className="energy-label">Energía: </span>
                <span className="energy-color-text">{card.energy}</span>
              </div>
            )}

            {card.symbol && (
              <div className="angel-symbol">
                <h5>🔮 Símbolo o Señal:</h5>
                <p>{card.symbol}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {parsedReading.overallMessage && (
        <div className="overall-angel-message">
          <h3>💫 Mensaje General de los Ángeles</h3>
          <ReactMarkdown>{parsedReading.overallMessage}</ReactMarkdown>
        </div>
      )}

      {parsedReading.angelicBlessing && (
        <div className="angelical-blessing">
          <h3>🙏 Bendición Angelical</h3>
          <p className="blessing-text">{parsedReading.angelicBlessing}</p>
        </div>
      )}
    </div>
  );
};

const EgyptianReading = ({ reading }) => {
  if (!reading || !reading.cards) return null;

  const parsedReading = typeof reading === 'string' ? JSON.parse(reading) : reading;

  return (
    <div className="egyptian-reading-container">
      <div className="egyptian-reading-header">
        <h2>𓋹 {parsedReading.description} 𓋹</h2>
        <p className="temple-name">Desde el {parsedReading.temple || 'Templo de Karnak'}</p>
      </div>

      <div className="egyptian-cards-grid">
        {parsedReading.cards.map((card, index) => (
          <div key={index} className="egyptian-card">
            <div className="egyptian-card-header">
              <h3 className="egyptian-position">{card.position}</h3>
              <h4 className="egyptian-deity">⚱️ {card.deity}</h4>
              {card.symbol && (
                <p className="egyptian-symbol">🏺 {card.symbol}</p>
              )}
            </div>

            <div className="egyptian-planes">
              {card.upperPlane && (
                <div className="egyptian-plane upper-plane">
                  <h5>☀️ Plano Superior (Divino)</h5>
                  <p>{card.upperPlane}</p>
                </div>
              )}

              {card.centerPlane && (
                <div className="egyptian-plane center-plane">
                  <h5>👁️ Plano Central (Humano)</h5>
                  <p>{card.centerPlane}</p>
                </div>
              )}

              {card.lowerPlane && (
                <div className="egyptian-plane lower-plane">
                  <h5>🐍 Plano Inferior (Instintivo)</h5>
                  <p>{card.lowerPlane}</p>
                </div>
              )}
            </div>

            {card.integratedMessage && (
              <div className="egyptian-integrated">
                <h5>⚖️ Mensaje Integrado:</h5>
                <ReactMarkdown>{card.integratedMessage}</ReactMarkdown>
              </div>
            )}

            {card.priestAdvice && (
              <div className="egyptian-advice">
                <h5>🏛️ Consejo del Sacerdote:</h5>
                <ReactMarkdown>{card.priestAdvice}</ReactMarkdown>
              </div>
            )}

            {card.meditationSymbol && (
              <div className="egyptian-meditation">
                <h5>𓂀 Símbolo para Meditar:</h5>
                <ReactMarkdown>{card.meditationSymbol}</ReactMarkdown>
              </div>
            )}
          </div>
        ))}
      </div>

      {parsedReading.overallReading && (
        <div className="overall-egyptian-message">
          <h3>𓊃 Lectura General del Oráculo 𓊃</h3>
          <ReactMarkdown>{parsedReading.overallReading}</ReactMarkdown>
        </div>
      )}

      {parsedReading.maat && (
        <div className="maat-teaching">
          <h3>⚖️ Enseñanza del Ma'at</h3>
          <ReactMarkdown>{parsedReading.maat}</ReactMarkdown>
        </div>
      )}

      {parsedReading.pharaohBlessing && (
        <div className="pharaoh-blessing">
          <h3>👑 Bendición del Faraón</h3>
          <p className="blessing-text">{parsedReading.pharaohBlessing}</p>
        </div>
      )}
    </div>
  );
};

const SpecialReadingDisplay = ({ reading, deckType }) => {
  if (!reading) return null;

  switch (deckType) {
    case 'tarot-angeles':
      return <AngelReading reading={reading} />;
    case 'tarot-egipcio':
      return <EgyptianReading reading={reading} />;
    default:
      return null;
  }
};

export default SpecialReadingDisplay;