import React, { useState, useEffect } from 'react'
import { fetchPersonalizedHoroscope } from '../api/horoscope.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import AdModal from '../components/AdModal.jsx';
import CanvasExporter from '../components/CanvasExporter.jsx';
import '../styles/HoroscopeDaily.css'

export default function HoroscopeDaily({ user }) {
  const [showAdModal, setShowAdModal] = useState(false);
  const [horoscope, setHoroscope] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [exportTrigger, setExportTrigger] = useState(false);
  const [exportedImage, setExportedImage] = useState(null);

  useEffect(() => {
    if (user) {
      loadPersonalizedHoroscope()
    }
  }, [user])

  const loadPersonalizedHoroscope = async () => {
    if (!user) {
      setError('Debes iniciar sesión para ver tu horóscopo personalizado')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const data = await fetchPersonalizedHoroscope()
      setHoroscope(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error cargando horóscopo:', err)
      setError('No se pudo cargar tu horóscopo. Intenta más tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  const getZodiacIcon = (sign) => {
    const icons = {
      aries: '♈', tauro: '♉', geminis: '♊', cancer: '♋',
      leo: '♌', virgo: '♍', libra: '♎', escorpio: '♏',
      sagitario: '♐', capricornio: '♑', acuario: '♒', piscis: '♓'
    }
    return icons[sign?.toLowerCase()] || '⭐'
  }

  const formatDate = (date) =>
    date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

  const handleExport = () => {
    setExportTrigger(true);
  };
  React.useEffect(() => {
    if (exportedImage) {
      if (navigator.share) {
        navigator.share({
          title: 'Mi horóscopo diario',
          text: 'Mira mi horóscopo premium en ArcanaClub',
          files: [dataURLtoFile(exportedImage, 'horoscopo-diario.png')]
        });
      } else {
        const link = document.createElement('a');
        link.href = exportedImage;
        link.download = 'horoscopo-diario.png';
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

  if (!user) {
    return (
      <div className="horoscope-container">
        <div className="glass-card">
          <div className="login-prompt">
            <h2>🔮 Horóscopo Personalizado</h2>
            <p>Inicia sesión para acceder a tu horóscopo diario personalizado</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="horoscope-container">
      <AdModal visible={showAdModal} onClose={() => setShowAdModal(false)} />
      <div className="glass-card">
        <div className="horoscope-header">
          <h1>🌟 Tu Horóscopo Personal</h1>
          <div className="date-display">
            <p className="current-date">{formatDate(new Date())}</p>
            {lastUpdated && (
              <p className="last-updated">
                Actualizado: {lastUpdated.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="loading-section">
            <LoadingSpinner />
            <p>Consultando las estrellas para ti...</p>
            {/* Mostrar anuncio solo si el usuario no es adepto/maestro */}
            {(!user.subscriptionPlan || !['ADEPTO', 'MAESTRO'].includes(user.subscriptionPlan.toUpperCase())) && !showAdModal && setShowAdModal(true)}
          </div>
        ) : error ? (
          <div className="error-section">
            <div className="error-message">{error}</div>
            <button onClick={loadPersonalizedHoroscope} className="retry-btn">
              Intentar de nuevo
            </button>
          </div>
        ) : horoscope && (
          <div className="horoscope-content">
            <div className="zodiac-section">
              <div className="zodiac-sign">
                <span className="zodiac-icon">{getZodiacIcon(user.zodiacSign)}</span>
                <h2>{user.zodiacSign || 'Tu Signo'}</h2>
              </div>
            </div>

            <div className="horoscope-text">
              <div className="daily-message">
                <h3>Mensaje del Día</h3>
                <p className="main-message">{horoscope.mainMessage}</p>
              </div>

              <div className="areas-grid">
                <div className="area-card love">
                  <h4>💕 Amor</h4>
                  <p>{horoscope.love}</p>
                </div>
                <div className="area-card work">
                  <h4>💼 Trabajo</h4>
                  <p>{horoscope.work}</p>
                </div>
                <div className="area-card health">
                  <h4>🌿 Salud</h4>
                  <p>{horoscope.health}</p>
                </div>
                <div className="area-card spirituality">
                  <h4>✨ Espiritualidad</h4>
                  <p>{horoscope.spirituality}</p>
                </div>
              </div>

              <div className="daily-advice">
                <h3>Consejo Místico del Día</h3>
                <p className="mystical-advice">{horoscope.mysticalAdvice}</p>
              </div>

              {horoscope.personalizedMessage && (
                <div className="personalized-section">
                  <h3>Mensaje Personalizado</h3>
                  <p className="personalized-message">
                    {horoscope.personalizedMessage}
                  </p>
                </div>
              )}

              <div className="daily-affirmation">
                <h3>Afirmación del Día</h3>
                <p className="affirmation">"{horoscope.affirmation}"</p>
              </div>
            </div>

            <div className="horoscope-footer">
              <div className="energy-level">
                <h4>Nivel de Energía</h4>
                <div className="energy-bar">
                  <div
                    className="energy-fill"
                    style={{ '--energy-width': `${horoscope.energyLevel || 75}%` }}
                  />
                </div>
                <p>
                  {horoscope.energyLevel || 75}% - {horoscope.energyDescription}
                </p>
              </div>
              <button onClick={loadDailyHoroscope} className="refresh-btn">
                🔄 Actualizar Horóscopo
              </button>
            </div>
            <button className="share-btn" onClick={handleExport}>
              <span role="img" aria-label="compartir">⭐</span> Compartir como imagen
            </button>
            <CanvasExporter
              exportTrigger={exportTrigger}
              onExported={setExportedImage}
              logoSrc="/logo.png"
            >
              {`Horóscopo Premium\nSigno: ${user?.zodiacSign}\nMensaje: ${horoscope.mainMessage}\nAmor: ${horoscope.love}\nTrabajo: ${horoscope.work}\nSalud: ${horoscope.health}\nEspiritualidad: ${horoscope.spirituality}`}
            </CanvasExporter>
          </div>
        )}
        {/* Si no hay horóscopo, muestra el resto del flujo */}
        {!horoscope && (
          <>
            {error && (
              <div className="error-section">
                <div className="error-message">{error}</div>
                <button onClick={loadPersonalizedHoroscope} className="retry-btn">
                  Intentar de nuevo
                </button>
              </div>
            )}
            {!error && (
              <div className="loading-section">
                <LoadingSpinner />
                <p>Consultando las estrellas para ti...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
