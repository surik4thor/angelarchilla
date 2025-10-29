import React, { useState, useEffect } from 'react';
import '../styles/CalendarioDeSuenos.css';

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const CalendarioDeSuenos = ({ dreams = [], onDayClick = null }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDream, setSelectedDream] = useState(null);

  // Obtener primer y último día del mes actual
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Obtener día de la semana del primer día (0 = domingo, 1 = lunes, etc.)
  const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Convertir a lunes = 0
  const daysInMonth = lastDay.getDate();

  // Crear un mapa de sueños por fecha para fácil acceso
  const dreamsByDate = dreams.reduce((acc, dream) => {
    const dreamDate = new Date(dream.date || dream.createdAt);
    const dateKey = `${dreamDate.getFullYear()}-${String(dreamDate.getMonth() + 1).padStart(2, '0')}-${String(dreamDate.getDate()).padStart(2, '0')}`;
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(dream);
    return acc;
  }, {});

  // Generar array de días para mostrar
  const generateCalendarDays = () => {
    const days = [];
    
    // Días vacíos del mes anterior
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayDreams = dreamsByDate[dateKey] || [];
      const isToday = isDateToday(currentDate.getFullYear(), currentDate.getMonth(), day);
      
      days.push({
        day,
        dateKey,
        dreams: dayDreams,
        isToday,
        hasDreams: dayDreams.length > 0
      });
    }
    
    return days;
  };

  const isDateToday = (year, month, day) => {
    const today = new Date();
    return today.getFullYear() === year && 
           today.getMonth() === month && 
           today.getDate() === day;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (dayData) => {
    if (dayData && dayData.hasDreams) {
      setSelectedDream(dayData.dreams[0]); // Mostrar el primer sueño del día
    } else if (onDayClick) {
      onDayClick(dayData?.dateKey);
    }
  };

  const closeModal = () => {
    setSelectedDream(null);
  };

  const formatDreamDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="calendario-suenos">
      {/* Header del calendario */}
      <div className="calendario-header">
        <button 
          className="nav-btn" 
          onClick={handlePrevMonth}
          aria-label="Mes anterior"
        >
          ◀
        </button>
        <h3 className="calendario-title">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button 
          className="nav-btn" 
          onClick={handleNextMonth}
          aria-label="Mes siguiente"
        >
          ▶
        </button>
      </div>

      {/* Días de la semana */}
      <div className="calendario-weekdays">
        {dayNames.map(day => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="calendario-grid">
        {calendarDays.map((dayData, index) => {
          if (!dayData) {
            return <div key={`empty-${index}`} className="calendario-day empty"></div>;
          }

          return (
            <div
              key={dayData.dateKey}
              className={`calendario-day ${dayData.isToday ? 'today' : ''} ${dayData.hasDreams ? 'has-dreams' : ''}`}
              onClick={() => handleDayClick(dayData)}
              title={dayData.hasDreams ? `${dayData.dreams.length} sueño(s)` : 'Sin sueños'}
            >
              <span className="day-number">{dayData.day}</span>
              {dayData.hasDreams && (
                <div className="dream-indicators">
                  {dayData.dreams.slice(0, 3).map((_, i) => (
                    <div key={i} className="dream-dot"></div>
                  ))}
                  {dayData.dreams.length > 3 && (
                    <span className="more-dreams">+{dayData.dreams.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="calendario-leyenda">
        <div className="leyenda-item">
          <div className="dream-dot"></div>
          <span>Día con sueños</span>
        </div>
        <div className="leyenda-item">
          <div className="today-indicator"></div>
          <span>Hoy</span>
        </div>
      </div>

      {/* Modal para mostrar detalles del sueño */}
      {selectedDream && (
        <div className="dream-modal-overlay" onClick={closeModal}>
          <div className="dream-modal" onClick={e => e.stopPropagation()}>
            <div className="dream-modal-header">
              <h4>Sueño del {formatDreamDate(selectedDream.date || selectedDream.createdAt)}</h4>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="dream-modal-content">
              <div className="dream-section">
                <h5>📖 Descripción</h5>
                <p>{selectedDream.dreamText || selectedDream.text}</p>
              </div>
              
              {selectedDream.feelings && selectedDream.feelings.length > 0 && (
                <div className="dream-section">
                  <h5>💭 Sentimientos</h5>
                  <div className="feelings-tags">
                    {selectedDream.feelings.map((feeling, i) => (
                      <span key={i} className="feeling-tag">{feeling}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedDream.interpretation && (
                <div className="dream-section">
                  <h5>🔮 Interpretación</h5>
                  <div className="dream-interpretation">
                    {selectedDream.interpretation}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioDeSuenos;