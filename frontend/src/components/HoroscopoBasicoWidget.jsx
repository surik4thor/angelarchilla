import React, { useState } from 'react';
import '../styles/HoroscopoBasicoWidget.css';

const HoroscopoBasicoWidget = () => {
  const [selectedSign, setSelectedSign] = useState('');
  const [horoscope, setHoroscope] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);

  const zodiacSigns = [
    { key: 'aries', name: 'Aries', symbol: '♈', dates: '21 Mar - 19 Abr' },
    { key: 'tauro', name: 'Tauro', symbol: '♉', dates: '20 Abr - 20 May' },
    { key: 'geminis', name: 'Géminis', symbol: '♊', dates: '21 May - 20 Jun' },
    { key: 'cancer', name: 'Cáncer', symbol: '♋', dates: '21 Jun - 22 Jul' },
    { key: 'leo', name: 'Leo', symbol: '♌', dates: '23 Jul - 22 Ago' },
    { key: 'virgo', name: 'Virgo', symbol: '♍', dates: '23 Ago - 22 Sep' },
    { key: 'libra', name: 'Libra', symbol: '♎', dates: '23 Sep - 22 Oct' },
    { key: 'escorpio', name: 'Escorpio', symbol: '♏', dates: '23 Oct - 21 Nov' },
    { key: 'sagitario', name: 'Sagitario', symbol: '♐', dates: '22 Nov - 21 Dic' },
    { key: 'capricornio', name: 'Capricornio', symbol: '♑', dates: '22 Dic - 19 Ene' },
    { key: 'acuario', name: 'Acuario', symbol: '♒', dates: '20 Ene - 18 Feb' },
    { key: 'piscis', name: 'Piscis', symbol: '♓', dates: '19 Feb - 20 Mar' }
  ];

  const handleGetHoroscope = async () => {
    if (!selectedSign) {
      alert('Por favor selecciona tu signo zodiacal');
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/horoscopo/${selectedSign}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fecha: today })
      });

      if (response.ok) {
        const data = await response.json();
        setHoroscope(data);
        setShowRegisterPrompt(true);
      } else {
        throw new Error('Error al obtener el horóscopo');
      }
    } catch (error) {
      alert('Error al obtener tu horóscopo. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const selectedSignData = zodiacSigns.find(sign => sign.key === selectedSign);

  return (
    <section className="horoscopo-basico-widget">
      <div className="widget-container">
        <div className="widget-header">
          <h2>🔮 Tu Horóscopo Diario Gratuito</h2>
          <p>Descubre qué te deparan los astros hoy. Selecciona tu signo y conoce tu predicción.</p>
        </div>

        <div className="zodiac-grid">
          {zodiacSigns.map(sign => (
            <button
              key={sign.key}
              className={`zodiac-button ${selectedSign === sign.key ? 'selected' : ''}`}
              onClick={() => setSelectedSign(sign.key)}
              title={`${sign.name} (${sign.dates})`}
            >
              <div className="sign-symbol">{sign.symbol}</div>
              <div className="sign-name">{sign.name}</div>
            </button>
          ))}
        </div>

        <div className="widget-actions">
          <button 
            className="get-horoscope-btn" 
            onClick={handleGetHoroscope}
            disabled={!selectedSign || loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Generando tu horóscopo...
              </>
            ) : (
              <>🌟 Ver Mi Horóscopo</>
            )}
          </button>
        </div>

        {horoscope && (
          <div className="horoscope-result">
            <div className="result-header">
              <h3>
                {horoscope.simbolo} {selectedSignData?.name} - Hoy {new Date().toLocaleDateString('es-ES')}
              </h3>
            </div>
            <div className="result-content">
              <div className="horoscope-message">
                <p><strong>Predicción del día:</strong> {horoscope.horoscopo?.mensaje || horoscope.mensaje}</p>
              </div>
              {(horoscope.horoscopo?.consejo || horoscope.consejo) && (
                <div className="horoscope-advice">
                  <p><strong>Consejo místico:</strong> {horoscope.horoscopo?.consejo || horoscope.consejo}</p>
                </div>
              )}
              {(horoscope.horoscopo?.numerosSuerte || horoscope.numerosSuerte) && (
                <div className="lucky-numbers">
                  <p><strong>Números de la suerte:</strong> {Array.isArray(horoscope.horoscopo?.numerosSuerte || horoscope.numerosSuerte) 
                    ? (horoscope.horoscopo?.numerosSuerte || horoscope.numerosSuerte).join(', ') 
                    : (horoscope.horoscopo?.numerosSuerte || horoscope.numerosSuerte)}</p>
                </div>
              )}
              {(horoscope.horoscopo?.colorDia || horoscope.colorDia) && (
                <div className="color-day">
                  <p><strong>Color del día:</strong> {horoscope.horoscopo?.colorDia || horoscope.colorDia}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {showRegisterPrompt && (
          <div className="register-prompt">
            <div className="prompt-header">
              <h3>✨ ¿Te ha gustado tu horóscopo?</h3>
              <p>Únete a Nebulosa Mágica y desbloquea experiencias místicas exclusivas</p>
            </div>

            <div className="benefits-grid">
              <div className="benefit-item">
                <span className="benefit-icon">🎴</span>
                <span>Lecturas de Tarot personalizadas</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">®️</span>
                <span>Consultas de Runas ancestrales</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🌙</span>
                <span>Interpretación de sueños</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">📊</span>
                <span>Cartas natales completas</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">📅</span>
                <span>Horóscopos personalizados diarios</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">📚</span>
                <span>Acceso a tutoriales exclusivos</span>
              </div>
            </div>

            <div className="cta-buttons">
              <button 
                className="cta-primary"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                🌟 Comenzar Gratis
              </button>
              <button 
                className="cta-secondary"
                onClick={() => setShowRegisterPrompt(false)}
              >
                Continuar explorando
              </button>
            </div>

            <div className="social-proof">
              <p>
                <strong>+10,000 personas</strong> ya confían en Nebulosa Mágica para guiar su destino
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HoroscopoBasicoWidget;