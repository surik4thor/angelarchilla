import React, { useState, useEffect } from 'react';
import '../styles/NatalChart.css';

const NatalChart = ({ user }) => {
  const [natalChart, setNatalChart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    birthDate: user?.birthDate ? user.birthDate.split('T')[0] : '',
    birthTime: '12:00',
    birthLocation: {
      city: 'Madrid',
      country: 'España',
      lat: 40.4168,
      lon: -3.7038
    }
  });

  useEffect(() => {
    if (user && user.birthDate) {
      loadNatalChart();
    }
  }, [user]);

  const loadNatalChart = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/astrology/natal-chart', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('arcanaToken')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNatalChart(data.natalChart);
      } else if (response.status === 404) {
        setShowForm(true);
      } else {
        setError(data.error || 'Error cargando carta natal');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/astrology/natal-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('arcanaToken')}`
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNatalChart(data.natalChart);
        setShowForm(false);
      } else {
        setError(data.error || 'Error calculando carta natal');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        birthLocation: {
          ...prev.birthLocation,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const getZodiacIcon = (sign) => {
    const icons = {
      'Aries': '♈', 'Tauro': '♉', 'Géminis': '♊', 'Cáncer': '♋',
      'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Escorpio': '♏',
      'Sagitario': '♐', 'Capricornio': '♑', 'Acuario': '♒', 'Piscis': '♓'
    };
    return icons[sign] || '⭐';
  };

  const getPlanetIcon = (planet) => {
    const icons = {
      'Sol': '☉', 'Luna': '☽', 'Mercurio': '☿', 'Venus': '♀', 'Marte': '♂',
      'Júpiter': '♃', 'Saturno': '♄', 'Urano': '♅', 'Neptuno': '♆', 'Plutón': '♇'
    };
    return icons[planet] || '●';
  };

  if (loading) {
    return (
      <div className="natal-chart-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Calculando tu carta natal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="natal-chart-container">
        <div className="error-state">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <button onClick={() => setShowForm(true)} className="retry-btn">
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (showForm || !natalChart) {
    return (
      <div className="natal-chart-container">
        <div className="natal-form">
          <h3>🌟 Calcula tu Carta Natal</h3>
          <p>Necesitamos algunos datos para calcular tu carta natal personalizada:</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Fecha de nacimiento:</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Hora de nacimiento (opcional):</label>
              <input
                type="time"
                name="birthTime"
                value={formData.birthTime}
                onChange={handleInputChange}
              />
              <small>Si no conoces la hora exacta, se usará 12:00 PM</small>
            </div>
            
            <div className="form-group">
              <label>Ciudad de nacimiento:</label>
              <input
                type="text"
                name="location.city"
                value={formData.birthLocation.city}
                onChange={handleInputChange}
                placeholder="Madrid"
              />
            </div>
            
            <div className="form-group">
              <label>País:</label>
              <input
                type="text"
                name="location.country"
                value={formData.birthLocation.country}
                onChange={handleInputChange}
                placeholder="España"
              />
            </div>
            
            <button type="submit" className="calculate-btn" disabled={loading}>
              {loading ? 'Calculando...' : '✨ Calcular Carta Natal'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="natal-chart-container">
      <div className="chart-header">
        <h3>🌟 Tu Carta Natal</h3>
        <div className="birth-info">
          <span>{new Date(natalChart.birthDate).toLocaleDateString('es-ES')}</span>
          {natalChart.birthTime && <span>{natalChart.birthTime}</span>}
          <span>{natalChart.birthLocation.city}, {natalChart.birthLocation.country}</span>
        </div>
      </div>

      <div className="chart-content">
        {/* Signo Solar Principal */}
        <div className="main-sign">
          <div className="sign-icon">{getZodiacIcon(natalChart.zodiacSign)}</div>
          <div className="sign-info">
            <h4>{natalChart.zodiacSign}</h4>
            <p>Tu signo solar</p>
          </div>
        </div>

        {/* Planetas */}
        <div className="planets-section">
          <h4>🪐 Planetas en Signos</h4>
          <div className="planets-grid">
            {Object.entries(natalChart.planets).map(([planet, position]) => (
              <div key={planet} className="planet-item">
                <span className="planet-icon">{getPlanetIcon(planet)}</span>
                <div className="planet-info">
                  <span className="planet-name">{planet}</span>
                  <span className="planet-position">
                    {getZodiacIcon(position.sign)} {position.sign}
                    <small>{position.degrees.toFixed(1)}°</small>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Casas */}
        <div className="houses-section">
          <h4>🏠 Casas Astrológicas</h4>
          <div className="houses-info">
            <div className="ascendant">
              <strong>Ascendente: {getZodiacIcon(natalChart.houses.ascendant.sign)} {natalChart.houses.ascendant.sign}</strong>
              <small>Tu personalidad exterior</small>
            </div>
          </div>
        </div>

        {/* Aspectos */}
        {natalChart.aspects && natalChart.aspects.length > 0 && (
          <div className="aspects-section">
            <h4>⭐ Aspectos Principales</h4>
            <div className="aspects-list">
              {natalChart.aspects.slice(0, 5).map((aspect, index) => (
                <div key={index} className="aspect-item">
                  <span className="aspect-planets">
                    {getPlanetIcon(aspect.planet1)} {aspect.planet1} {getAspectSymbol(aspect.aspect)} {getPlanetIcon(aspect.planet2)} {aspect.planet2}
                  </span>
                  <span className="aspect-type">{aspect.aspect}</span>
                  <small>{aspect.degrees}°</small>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interpretación */}
        {natalChart.interpretation && (
          <div className="interpretation-section">
            <h4>📖 Interpretación</h4>
            <div className="interpretation-text">
              {natalChart.interpretation.split('\n').map((paragraph, index) => (
                paragraph.trim() && <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="chart-actions">
          <button onClick={() => setShowForm(true)} className="update-btn">
            🔄 Actualizar datos
          </button>
        </div>
      </div>
    </div>
  );
};

const getAspectSymbol = (aspect) => {
  const symbols = {
    'Conjunción': '☌',
    'Oposición': '☍',
    'Trígono': '△',
    'Cuadratura': '□',
    'Sextil': '⚹'
  };
  return symbols[aspect] || '◊';
};

export default NatalChart;