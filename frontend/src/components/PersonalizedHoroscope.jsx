import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import '../styles/PersonalizedHoroscope.css';

const PersonalizedHoroscope = () => {
  const { user } = useAuth();
  const [horoscope, setHoroscope] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasNatalChart, setHasNatalChart] = useState(false);

  useEffect(() => {
    checkNatalChart();
  }, [user]);

  const checkNatalChart = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/astrology/natal-chart', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('arcanaToken')}`
        }
      });
      
      if (response.ok) {
        setHasNatalChart(true);
        loadPersonalizedHoroscope();
      } else {
        setHasNatalChart(false);
      }
    } catch (err) {
      console.error('Error checking natal chart:', err);
      setHasNatalChart(false);
    }
  };

  const loadPersonalizedHoroscope = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/personalized-horoscope/generate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('arcanaToken')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setHoroscope(data.horoscope);
      } else {
        setError(data.error || 'Error cargando horóscopo personalizado');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
    }
    
    setLoading(false);
  };

  const getZodiacIcon = (sign) => {
    const icons = {
      'Aries': '♈', 'Tauro': '♉', 'Géminis': '♊', 'Cáncer': '♋',
      'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Escorpio': '♏',
      'Sagitario': '♐', 'Capricornio': '♑', 'Acuario': '♒', 'Piscis': '♓'
    };
    return icons[sign] || '⭐';
  };

  if (!user) {
    return (
      <div className="personalized-horoscope">
        <div className="auth-required">
          <h3>🔐 Acceso Requerido</h3>
          <p>Inicia sesión para acceder a tu horóscopo personalizado</p>
        </div>
      </div>
    );
  }

  if (!hasNatalChart) {
    return (
      <div className="personalized-horoscope">
        <div className="natal-chart-required">
          <h3>🌟 Carta Natal Requerida</h3>
          <p>Para obtener un horóscopo personalizado, primero necesitas calcular tu carta natal.</p>
          <p>Ve a tu perfil y completa los datos de tu carta natal para desbloquear horóscopos ultra-personalizados basados en tus posiciones planetarias únicas.</p>
          <button 
            onClick={() => window.location.href = '/profile#profile-natal-chart'} 
            className="natal-chart-btn"
          >
            📊 Ir a Carta Natal
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="personalized-horoscope">
        <div className="loading-horoscope">
          <div className="spinner"></div>
          <p>Consultando las estrellas para ti...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="personalized-horoscope">
        <div className="error-horoscope">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <button onClick={loadPersonalizedHoroscope} className="retry-btn">
            🔄 Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (!horoscope) {
    return (
      <div className="personalized-horoscope">
        <div className="generate-horoscope">
          <h3>✨ Horóscopo Personalizado</h3>
          <p>Genera tu horóscopo único basado en tu carta natal personal</p>
          <button onClick={loadPersonalizedHoroscope} className="generate-btn">
            🔮 Generar Horóscopo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="personalized-horoscope">
      <div className="horoscope-header">
        <div className="zodiac-info">
          <span className="zodiac-icon">{getZodiacIcon(horoscope.zodiacSign)}</span>
          <div className="zodiac-details">
            <h2>{horoscope.zodiacSign}</h2>
            <p className="horoscope-date">{new Date(horoscope.date).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
            <span className="personalized-badge">Personalizado</span>
          </div>
        </div>
      </div>

      <div className="horoscope-content">
        {horoscope.content.split('\n').map((paragraph, index) => (
          paragraph.trim() && (
            <p key={index} className="horoscope-paragraph">
              {paragraph.trim()}
            </p>
          )
        ))}
      </div>

      {horoscope.transits && horoscope.transits.length > 0 && (
        <div className="transits-section">
          <h4>🪐 Tránsitos Planetarios Actuales</h4>
          <div className="transits-list">
            {horoscope.transits.map((transit, index) => (
              <div key={index} className="transit-item">
                <div className="transit-aspect">{transit.aspect}</div>
                <div className="transit-description">{transit.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="horoscope-footer">
        <div className="personalized-info">
          <span className="premium-icon">✨</span>
          <span>Horóscopo ultra-personalizado basado en tu carta natal única</span>
        </div>
        <button onClick={loadPersonalizedHoroscope} className="refresh-btn">
          🔄 Actualizar
        </button>
      </div>
    </div>
  );
};

export default PersonalizedHoroscope;