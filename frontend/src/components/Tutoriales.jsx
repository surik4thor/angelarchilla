import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Tutoriales.css';

const Tutoriales = ({ user }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const tutoriales = [
    {
      id: 1,
      title: 'Guía Completa del Tarot Rider-Waite',
      category: 'tarot',
      description: 'Aprende los fundamentos del tarot más popular del mundo',
      icon: '🎴',
      difficulty: 'Principiante',
      readTime: '15 min',
      color: '#d4af37',
      slug: 'tarot-rider-waite-guia'
    },
    {
      id: 2,
      title: 'La Cruz Celta: Tirada Sagrada',
      category: 'tarot',
      description: 'Domina la tirada de tarot más poderosa y completa',
      icon: '✨',
      difficulty: 'Intermedio',
      readTime: '12 min',
      color: '#d4af37',
      slug: 'cruz-celta-tarot'
    },
    {
      id: 3,
      title: 'Cómo Hacer Preguntas Efectivas al Tarot',
      category: 'tarot',
      description: 'Aprende a formular preguntas que te den respuestas claras',
      icon: '❓',
      difficulty: 'Principiante',
      readTime: '8 min',
      color: '#d4af37',
      slug: 'preguntas-tarot'
    },
    {
      id: 4,
      title: 'Runas Elder Futhark: Sabiduría Ancestral',
      category: 'runas',
      description: 'Descubre el poder de las runas nórdicas antiguas',
      icon: '®️',
      difficulty: 'Principiante',
      readTime: '20 min',
      color: '#25d366',
      slug: 'runas-elder-futhark'
    },
    {
      id: 5,
      title: 'Rituales Lunares para 2025',
      category: 'rituales',
      description: 'Conecta con las fases lunares y su energía',
      icon: '🌙',
      difficulty: 'Intermedio',
      readTime: '25 min',
      color: '#8b5cf6',
      slug: 'rituales-lunares-2025'
    },
    {
      id: 6,
      title: 'Ética en el Tarot y Consultas',
      category: 'etica',
      description: 'Principios fundamentales para una práctica responsable',
      icon: '⚖️',
      difficulty: 'Todos',
      readTime: '10 min',
      color: '#f59e0b',
      slug: 'etica-tarot'
    },
    {
      id: 7,
      title: 'Protección Energética y Limpieza',
      category: 'proteccion',
      description: 'Técnicas esenciales para proteger tu energía',
      icon: '🛡️',
      difficulty: 'Principiante',
      readTime: '15 min',
      color: '#ef4444',
      slug: 'proteccion-energetica'
    },
    {
      id: 8,
      title: 'Numerología Esencial',
      category: 'numerologia',
      description: 'Los números y su significado místico',
      icon: '🔢',
      difficulty: 'Principiante',
      readTime: '18 min',
      color: '#06b6d4',
      slug: 'numerologia-esencial'
    },
    {
      id: 9,
      title: 'El Camino del Iniciado',
      category: 'espiritual',
      description: 'Tu desarrollo espiritual paso a paso',
      icon: '🌟',
      difficulty: 'Avanzado',
      readTime: '30 min',
      color: '#8b5cf6',
      slug: 'camino-iniciado'
    },
    {
      id: 10,
      title: 'Horóscopo Inteligente y Personalizado',
      category: 'astrologia',
      description: 'Más allá del horóscopo tradicional',
      icon: '🌌',
      difficulty: 'Intermedio',
      readTime: '22 min',
      color: '#f59e0b',
      slug: 'horoscopo-inteligente'
    },
    {
      id: 11,
      title: 'Brujería Celta y Nórdica',
      category: 'brujeria',
      description: 'Tradiciones mágicas ancestrales',
      icon: '🌿',
      difficulty: 'Avanzado',
      readTime: '35 min',
      color: '#10b981',
      slug: 'brujeria-celta-nordica'
    },
    {
      id: 12,
      title: 'Recursos de Ocultismo y Esoterismo',
      category: 'recursos',
      description: 'Biblioteca completa de conocimiento oculto',
      icon: '📚',
      difficulty: 'Todos',
      readTime: '15 min',
      color: '#6b7280',
      slug: 'recursos-ocultismo'
    }
  ];

  const categories = [
    { key: 'all', label: 'Todos', icon: '📚' },
    { key: 'tarot', label: 'Tarot', icon: '🎴' },
    { key: 'runas', label: 'Runas', icon: '®️' },
    { key: 'astrologia', label: 'Astrología', icon: '🌌' },
    { key: 'rituales', label: 'Rituales', icon: '🌙' },
    { key: 'proteccion', label: 'Protección', icon: '🛡️' },
    { key: 'espiritual', label: 'Espiritual', icon: '🌟' },
    { key: 'etica', label: 'Ética', icon: '⚖️' }
  ];

  const filteredTutoriales = tutoriales.filter(tutorial => {
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    const matchesSearch = tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Principiante': return '#10b981';
      case 'Intermedio': return '#f59e0b';
      case 'Avanzado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="tutoriales-container">
      {/* Header */}
      <div className="tutoriales-header">
        <div className="header-content">
          <h1>📚 Biblioteca de Conocimiento Místico</h1>
          <p>Aprende las artes esotéricas con nuestras guías completas y descubre cupones especiales</p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="tutoriales-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar tutoriales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`filter-btn ${selectedCategory === category.key ? 'active' : ''}`}
            >
              {category.icon} {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de tutoriales */}
      <div className="tutoriales-grid">
        {filteredTutoriales.map(tutorial => (
          <div key={tutorial.id} className="tutorial-card">
            <div 
              className="tutorial-header"
              style={{ background: `linear-gradient(135deg, ${tutorial.color}20, ${tutorial.color}40)` }}
            >
              <div className="tutorial-icon" style={{ color: tutorial.color }}>
                {tutorial.icon}
              </div>
              <div className="tutorial-meta">
                <span 
                  className="difficulty-badge"
                  style={{ backgroundColor: getDifficultyColor(tutorial.difficulty) }}
                >
                  {tutorial.difficulty}
                </span>
                <span className="read-time">⏱️ {tutorial.readTime}</span>
              </div>
            </div>

            <div className="tutorial-content">
              <h3>{tutorial.title}</h3>
              <p>{tutorial.description}</p>
              
              <div className="tutorial-actions">
                <Link 
                  to={`/tutoriales/${tutorial.slug}`}
                  className="read-btn"
                  style={{ backgroundColor: tutorial.color }}
                >
                  Leer Tutorial
                </Link>
                {tutorial.category === 'tarot' && (
                  <Link 
                    to="/tarot"
                    className="practice-btn"
                  >
                    🎴 Practicar
                  </Link>
                )}
                {tutorial.category === 'runas' && (
                  <Link 
                    to="/runes"
                    className="practice-btn"
                  >
                    ®️ Consultar
                  </Link>
                )}
              </div>
            </div>

            {/* Indicador de cupón */}
            {[1, 5, 9, 11].includes(tutorial.id) && (
              <div className="coupon-indicator">
                🎁 ¡Contiene cupón especial!
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Banner promocional */}
      <div className="promo-banner">
        <div className="promo-content">
          <h2>🎁 ¡Encuentra Cupones Especiales!</h2>
          <p>
            Algunos tutoriales contienen cupones de bienvenida que te otorgan 
            <strong> 7 días gratuitos del Plan MAESTRO</strong>. 
            ¡Lee nuestras guías y descúbrelos!
          </p>
        </div>
      </div>

      {filteredTutoriales.length === 0 && (
        <div className="no-results">
          <h3>No se encontraron tutoriales</h3>
          <p>Prueba con otros términos de búsqueda o categorías</p>
        </div>
      )}
    </div>
  );
};

export default Tutoriales;