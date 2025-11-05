import React, { useState, useEffect } from 'react';
import api from '../api/api.js';

// Componente de calendario unificado
const CalendarioUnificado = ({ user }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, tarot, runes, dreams, astrology
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      // Obtener todos los eventos del mes
      const [tarotRes, runesRes, dreamsRes] = await Promise.all([
        api.get('/api/tarotReadings/history').catch(() => ({ data: [] })),
        api.get('/api/runesReadings/history').catch(() => ({ data: [] })),
        api.get('/api/dreams/history').catch(() => ({ data: [] }))
      ]);

      const allEvents = [];

      // Procesar lecturas de tarot
      if (tarotRes.data?.readings) {
        tarotRes.data.readings.forEach(reading => {
          const eventDate = new Date(reading.createdAt);
          if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
            allEvents.push({
              id: `tarot-${reading.id}`,
              type: 'tarot',
              title: 'Lectura de Tarot',
              date: eventDate,
              data: reading,
              icon: '🎴',
              color: '#d4af37'
            });
          }
        });
      }

      // Procesar lecturas de runas
      if (runesRes.data?.readings) {
        runesRes.data.readings.forEach(reading => {
          const eventDate = new Date(reading.createdAt);
          if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
            allEvents.push({
              id: `runes-${reading.id}`,
              type: 'runes',
              title: 'Lectura de Runas',
              date: eventDate,
              data: reading,
              icon: '®️',
              color: '#25d366'
            });
          }
        });
      }

      // Procesar interpretaciones de sueños
      if (dreamsRes.data?.dreams) {
        dreamsRes.data.dreams.forEach(dream => {
          const eventDate = new Date(dream.date || dream.createdAt);
          if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
            allEvents.push({
              id: `dream-${dream.id}`,
              type: 'dreams',
              title: 'Interpretación de Sueño',
              date: eventDate,
              data: dream,
              icon: '🌙',
              color: '#8b5cf6'
            });
          }
        });
      }

      // Agregar eventos astrológicos ficticios (pueden ser reemplazados por datos reales)
      const astrologicalEvents = generateAstrologicalEvents(year, month);
      allEvents.push(...astrologicalEvents);

      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generar eventos astrológicos para el mes
  const generateAstrologicalEvents = (year, month) => {
    const events = [];
    const moonPhases = [
      { day: 7, name: 'Luna Nueva', icon: '🌑' },
      { day: 14, name: 'Cuarto Creciente', icon: '🌓' },
      { day: 21, name: 'Luna Llena', icon: '🌕' },
      { day: 28, name: 'Cuarto Menguante', icon: '🌗' }
    ];

    moonPhases.forEach(phase => {
      if (phase.day <= new Date(year, month + 1, 0).getDate()) {
        events.push({
          id: `astro-${phase.name}-${month}`,
          type: 'astrology',
          title: phase.name,
          date: new Date(year, month, phase.day),
          data: { description: `Fase lunar: ${phase.name}` },
          icon: phase.icon,
          color: '#f59e0b'
        });
      }
    });

    return events;
  };

  // Filtrar eventos según el filtro seleccionado
  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.type === filter;
  });

  // Generar calendario
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDateObj = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dayEvents = filteredEvents.filter(event => 
        event.date.toDateString() === currentDateObj.toDateString()
      );

      days.push({
        date: new Date(currentDateObj),
        isCurrentMonth: currentDateObj.getMonth() === month,
        isToday: currentDateObj.toDateString() === new Date().toDateString(),
        events: dayEvents
      });

      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleDateClick = (day) => {
    setSelectedDate(day);
  };

  const calendarDays = generateCalendar();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div style={{
      fontFamily: 'var(--font-base)',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '1rem'
    }}>
      {/* Encabezado del calendario */}
      <div style={{
        background: 'linear-gradient(135deg, #232946 0%, #d4af37 100%)',
        padding: '1.5rem',
        borderRadius: '16px',
        color: 'white',
        marginBottom: '1rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <button
            onClick={() => navigateMonth(-1)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ← Anterior
          </button>
          
          <h2 style={{
            fontFamily: 'var(--font-title)',
            fontSize: '1.5rem',
            margin: 0,
            textAlign: 'center'
          }}>
            📅 {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={() => navigateMonth(1)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Siguiente →
          </button>
        </div>

        {/* Filtros */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          {[
            { key: 'all', label: 'Todos', icon: '📋' },
            { key: 'tarot', label: 'Tarot', icon: '🎴' },
            { key: 'runes', label: 'Runas', icon: '®️' },
            { key: 'dreams', label: 'Sueños', icon: '🌙' },
            { key: 'astrology', label: 'Astrología', icon: '🌟' }
          ].map(filterOption => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              style={{
                background: filter === filterOption.key 
                  ? 'rgba(255,255,255,0.3)' 
                  : 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: filter === filterOption.key ? 'bold' : 'normal'
              }}
            >
              {filterOption.icon} {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '2rem'}}>
          Cargando calendario...
        </div>
      ) : (
        <>
          {/* Días de la semana */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '1px',
            marginBottom: '1px',
            background: '#e5e7eb'
          }}>
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} style={{
                background: '#f3f4f6',
                padding: '0.75rem',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendario */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '1px',
            background: '#e5e7eb'
          }}>
            {calendarDays.map((day, index) => (
              <div
                key={index}
                onClick={() => handleDateClick(day)}
                style={{
                  background: day.isCurrentMonth ? 'white' : '#f9fafb',
                  minHeight: '100px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  border: day.isToday ? '2px solid #d4af37' : 'none',
                  opacity: day.isCurrentMonth ? 1 : 0.5,
                  position: 'relative'
                }}
              >
                <div style={{
                  fontWeight: day.isToday ? 'bold' : 'normal',
                  color: day.isToday ? '#d4af37' : '#374151',
                  marginBottom: '0.25rem'
                }}>
                  {day.date.getDate()}
                </div>
                
                {day.events.slice(0, 3).map((event, eventIndex) => (
                  <div
                    key={event.id}
                    style={{
                      fontSize: '0.7rem',
                      background: event.color,
                      color: 'white',
                      padding: '0.125rem 0.25rem',
                      borderRadius: '3px',
                      marginBottom: '0.125rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={event.title}
                  >
                    {event.icon} {event.title}
                  </div>
                ))}
                
                {day.events.length > 3 && (
                  <div style={{
                    fontSize: '0.6rem',
                    color: '#6b7280',
                    fontWeight: 'bold'
                  }}>
                    +{day.events.length - 3} más
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Detalles del día seleccionado */}
          {selectedDate && selectedDate.events.length > 0 && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontFamily: 'var(--font-title)',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                {selectedDate.date.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                {selectedDate.events.map(event => (
                  <div key={event.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    background: 'white',
                    borderRadius: '6px',
                    borderLeft: `4px solid ${event.color}`
                  }}>
                    <span style={{fontSize: '1.2rem'}}>{event.icon}</span>
                    <div>
                      <div style={{fontWeight: 'bold', color: '#374151'}}>
                        {event.title}
                      </div>
                      {event.data.question && (
                        <div style={{fontSize: '0.9rem', color: '#6b7280'}}>
                          Pregunta: {event.data.question}
                        </div>
                      )}
                      {event.data.dreamText && (
                        <div style={{fontSize: '0.9rem', color: '#6b7280'}}>
                          Sueño: {event.data.dreamText.substring(0, 50)}...
                        </div>
                      )}
                      {event.data.description && (
                        <div style={{fontSize: '0.9rem', color: '#6b7280'}}>
                          {event.data.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => setSelectedDate(null)}
                style={{
                  marginTop: '0.5rem',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Cerrar detalles
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CalendarioUnificado;