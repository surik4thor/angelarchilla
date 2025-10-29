import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

import '../../styles/Profile.css';
import '../../styles/Calendar.css';

import ActivateTrialForm from '../../components/ActivateTrialForm.jsx';
import CalendarioDeSuenos from '../../components/CalendarioDeSuenos.jsx';
import DreamAnalytics from '../../components/DreamAnalytics.jsx';
import NatalChart from '../../components/NatalChart.jsx';
import PersonalizedHoroscope from '../../components/PersonalizedHoroscope.jsx';

// Componente visual de calendario mensual
function CalendarView({ events, month, year }) {
  const today = new Date();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();
  const weeks = [];
  let day = 1 - startDay;
  while (day <= daysInMonth) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      if (day > 0 && day <= daysInMonth) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const dayEvents = events.filter(e => e.date === dateStr);
        week.push(
          <div className={`calendar-day${today.getDate()===day&&today.getMonth()===month&&today.getFullYear()===year?' today':''}`} key={dateStr}>
            <span className="day-number">{day}</span>
            {dayEvents.map((ev, idx) => (
              <div className="event" key={idx} title={ev.title}>{ev.title}</div>
            ))}
          </div>
        );
      } else {
        week.push(<div className="calendar-day" key={i}></div>);
      }
      day++;
    }
    weeks.push(<React.Fragment key={day}>{week}</React.Fragment>);
  }
  return (
    <div>
      <div className="calendar-weekdays">
        {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => <span key={d}>{d}</span>)}
      </div>
      <div className="calendar-grid">{weeks}</div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const handlePlanesClick = (e) => {
    e.preventDefault();
    alert('Debes actualizar tu suscripción para acceder a esta función.');
    navigate('/planes');
  };
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const { user, logout, loading } = useAuth();
  const [readingsHistory, setReadingsHistory] = useState([]);
  const [stats, setStats] = useState({ readings: 0, purchases: 0, memberSince: null });
  const [dreams, setDreams] = useState([]);
  const [selectedReading, setSelectedReading] = useState(null);
  const [readingView, setReadingView] = useState('tabla');
  const [dreamView, setDreamView] = useState('tabla');
  // Simulación de horóscopo diario
  const horoscopeSummary = `Hoy tu energía está en alza. Aprovecha para tomar decisiones importantes y confiar en tu intuición.`;
  const horoscopeDetail = `Hoy es un día propicio para los nuevos comienzos. La alineación de los astros favorece la comunicación y la creatividad. Mantente abierto a las oportunidades inesperadas y no temas expresar tus ideas. Recuerda cuidar tu bienestar emocional y dedicar tiempo a tus pasiones.`;

  const isAdmin = user?.role === 'ADMIN' || user?.email === 'surik4thor@icloud.com';
  const getPlanColor = (plan) => {
    switch((plan || '').toUpperCase()) {
      case 'INVITADO': return '#95a5a6';
      case 'INICIADO': return '#3498db';
      case 'ADEPTO': return '#f4d03f';
      case 'MAESTRO': return '#e67e22';
      default: return '#ccc';
    }
  };
  const getPlanName = (plan) => {
    switch((plan || '').toUpperCase()) {
      case 'INVITADO': return 'Invitado';
      case 'INICIADO': return 'Iniciado';
      case 'ADEPTO': return 'Adeptho';
      case 'MAESTRO': return 'Maestro';
      default: return plan || 'Desconocido';
    }
  };
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString();
  };
  const zodiacIcons = {
    Aries: '♈', Tauro: '♉', Géminis: '♊', Cáncer: '♋', Leo: '♌', Virgo: '♍',
    Libra: '♎', Escorpio: '♏', Sagitario: '♐', Capricornio: '♑', Acuario: '♒', Piscis: '♓'
  };

  useEffect(() => {
    // Cargar historial de lecturas y sueños al montar o cambiar usuario
    async function fetchProfileData() {
      if (!user || !user.id) return;
      try {
        // Historial de lecturas
  const readingsRes = await fetch('/api/readings/history', { credentials: 'include' });
        const readingsJson = await readingsRes.json();
        if (readingsJson.success && Array.isArray(readingsJson.history)) {
          setReadingsHistory(readingsJson.history);
        }
        // Estadísticas (puedes ajustar según tu backend)
        setStats(s => ({ ...s, readings: readingsJson.history?.length || 0 }));
        // Historial de sueños
        const dreamsRes = await fetch('/api/dreams/history', { credentials: 'include' });
        const dreamsJson = await dreamsRes.json();
        if (Array.isArray(dreamsJson.dreams)) {
          setDreams(dreamsJson.dreams);
        }
      } catch (err) {
        console.error('Error cargando historial:', err);
      }
    }
    fetchProfileData();
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  // Acceso premium si es Maestro o está en periodo de prueba
  const planActivo = ['ADEPTO','MAESTRO'].includes((user?.subscriptionPlan || '').toUpperCase()) || (user?.trialActive && user?.trialExpiry && new Date() < new Date(user.trialExpiry));

  // Generar afirmación diferente cada día
  const affirmations = [
    'Confía en tu intuición, el universo te guía.',
    'Hoy es un buen día para avanzar hacia tus sueños.',
    'La magia está en tu interior, cree en ti.',
    'Cada paso cuenta, sigue adelante.',
    'Tu energía positiva atrae nuevas oportunidades.',
    'El cambio comienza contigo, da el primer paso.',
    'Eres más fuerte de lo que imaginas.',
    'La claridad llega cuando escuchas a tu corazón.',
    'Hoy es el día perfecto para empezar de nuevo.',
    'La gratitud transforma tu realidad.'
  ];
  const todayIdx = new Date().getDate() % affirmations.length;
  const dailyAffirmation = affirmations[todayIdx];

  return (
    <div className="profile-container">
      {/* Formulario de activación de periodo de prueba por cupón */}
      {user && !(user.trialActive && user.trialExpiry && new Date() < new Date(user.trialExpiry)) && (
        <div style={{maxWidth:500,margin:'0 auto'}}>
          <ActivateTrialForm />
        </div>
      )}
      {/* Header de perfil */}
      <div className="profile-header">
        <div className='profile-user-container'><div className="profile-avatar">
          <span role="img" aria-label="Usuario" style={{fontSize:'2em'}}>👤</span>
        </div>
        <div className="profile-info">
          <h1 className="profile-name">
            {user?.name || 'Usuario'}
            {(['ADEPTO','MAESTRO'].includes((user?.subscriptionPlan || '').toUpperCase()) || (user?.trialActive && user?.trialExpiry && new Date() < new Date(user.trialExpiry))) && (
              <span role="img" aria-label="Premium" style={{marginLeft:'0.5em',fontSize:'1.2em'}}>👑</span>
            )}
          </h1>
          <div className="profile-email">
            <span role="img" aria-label="correo">✉️</span> {user?.email}
          </div>
          <div className="profile-plan" style={{color:getPlanColor(user?.subscriptionPlan),fontWeight:'bold'}}>
            Plan: {getPlanName(user?.subscriptionPlan)}
          </div>
          <div className="profile-member-since">
             📅 Miembro desde: {formatDate(stats.memberSince)}
          </div>
        </div>
</div>
        <div className="profile-horoscope">
          <div className="horoscope-icon" style={{fontSize:'2em'}}>
            {zodiacIcons[user?.zodiacSign] || '🌟'}
          </div>
          <div className="horoscope-summary">{horoscopeSummary}</div>
        </div>
      </div>
      {/* Afirmación diaria */}
      <div className="profile-affirmation" style={{marginBottom:'1.5em', background:'#eebc1d', color:'#232946', borderRadius:'10px', padding:'1em', fontWeight:'bold', fontSize:'1.1em'}}>
        {dailyAffirmation}
      </div>
            {/* Accesos rápidos */}
      <div className="profile-quick-access">
        <h2 className="section-title">Accesos rápidos</h2>
        <div className="quick-access-grid">
          <Link to="/tarot" className="quick-access-btn premium-btn">
            <span role="img" aria-label="Tarot">🃏</span>
            <span>Tarot</span>
          </Link>
          <Link to="/runes" className="quick-access-btn premium-btn">
            <span role="img" aria-label="Runas">ᚱ</span>
            <span>Runas</span>
          </Link>
          <Link to="/dream-interpretation" className="quick-access-btn premium-btn">
            <span role="img" aria-label="Sueños">🌙</span>
            <span>Sueños</span>
          </Link>
          <Link to="/horoscope-daily" className="quick-access-btn premium-btn horoscope-btn">
            <span role="img" aria-label="Horóscopo">🔮</span>
            <span>Ver Horóscopo</span>
          </Link>
        </div>
      </div>
      {/* Estadísticas */}
      <div className="profile-stats">
        <h2 className="section-title">Estadísticas</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.readings}</div>
            <div className="stat-label">Lecturas Realizadas</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.purchases}</div>
            <div className="stat-label">Compras</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatDate(stats.memberSince)}</div>
            <div className="stat-label">Miembro desde</div>
          </div>
        </div>
      </div>

      {/* Historial de lecturas */}
      <div className="profile-history" id="profile-history">
        <h2 className="section-title">Historial de Lecturas</h2>
        {planActivo ? (
          <>
            <div className="view-selector" style={{marginBottom:'1em'}}>
              <button className="view-btn" style={{marginRight:'0.7em'}} onClick={() => setReadingView('tabla')}>Tabla</button>
              <button className="view-btn" onClick={() => setReadingView('calendario')}>Calendario</button>
            </div>
            {readingView === 'tabla' ? (
              readingsHistory.length === 0 ? (
                <div className="history-placeholder" style={{background:'#232946', borderRadius:'10px', padding:'1.2em', color:'#e0e0e0', marginBottom:'1em'}}>
                  <p>No tienes lecturas registradas.</p>
                </div>
              ) : (
                <div className="history-table-wrapper">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>Pregunta</th>
                        <th>Interpretación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {readingsHistory.map((reading, idx) => (
                        <React.Fragment key={idx}>
                          <tr className="history-row" style={{ cursor: 'pointer' }} onClick={() => setSelectedReading(selectedReading === idx ? null : idx)}>
                            <td>{formatDate(reading.createdAt)}</td>
                            <td>{reading.type}</td>
                            <td>{reading.question}</td>
                            <td>{reading.interpretation?.slice(0, 60) || ''}...</td>
                          </tr>
                          {selectedReading === idx && (
                            <tr className="expanded-row">
                              <td colSpan={4}>
                                <div className="reading-details">
                                  <h3>Detalles de la Lectura</h3>
                                  <p><strong>Fecha:</strong> {formatDate(reading.createdAt)}</p>
                                  <p><strong>Tipo:</strong> {reading.type}</p>
                                  <p><strong>Pregunta:</strong> {reading.question}</p>
                                  <p><strong>Interpretación:</strong></p>
                                  <div className="reading-interpretation-full">{reading.interpretation}</div>
                                  {reading.cards && (
                                    <div className="reading-cards">
                                      <strong>Cartas/Runas:</strong>
                                      <ul>
                                        {Array.isArray(reading.cards)
                                          ? reading.cards.map((card, i) => (
                                              typeof card === 'object' && card !== null
                                                ? <li key={i}>{Object.entries(card).map(([k, v]) => `${k}: ${v}`).join(', ')}</li>
                                                : <li key={i}>{card}</li>
                                            ))
                                          : (typeof reading.cards === 'object' && reading.cards !== null
                                              ? <li>{Object.entries(reading.cards).map(([k, v]) => `${k}: ${v}`).join(', ')}</li>
                                              : <li>{reading.cards}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <CalendarView
                events={readingsHistory.map(r => ({
                  date: r.createdAt.slice(0,10),
                  title: `${r.type}: ${r.question}`
                }))}
                month={new Date().getMonth()}
                year={new Date().getFullYear()}
              />
            )}
          </>
        ) : (
          <div style={{color:'#ff4136',fontWeight:'bold',margin:'1em 0',background:'#232946',borderRadius:'10px',padding:'1.2em'}}>
            El acceso al historial de lecturas es exclusivo para suscriptores <b>ADEPTO o MAESTRO</b>.<br/>
            Actualiza tu suscripción para desbloquear esta función.<br/>
            <a href="/planes" style={{color:'#eebc1d',textDecoration:'underline',cursor:'pointer'}} onClick={handlePlanesClick}>Ver planes disponibles</a>
          </div>
        )}
      </div>

      {/* Carta Natal */}
      {planActivo && (
        <div className="profile-natal-chart" id="profile-natal-chart">
          <h2 className="section-title">Carta Natal</h2>
          <NatalChart user={user} />
        </div>
      )}

      {/* Horóscopo Personalizado */}
      {planActivo && (
        <div className="profile-personalized-horoscope" id="profile-personalized-horoscope">
          <h2 className="section-title">Horóscopo Ultra-Personalizado</h2>
          <PersonalizedHoroscope />
        </div>
      )}

      {/* Diario de sueños */}
      <div className="profile-dream-diary" id="profile-dream-diary">
        <h2 className="section-title">Diario de Sueños</h2>
        {planActivo ? (
          <>
            {/* Análisis de patrones de sueños */}
            <DreamAnalytics dreams={dreams} />
          </>
        ) : null}
        {planActivo ? (
          <>
            <div className="view-selector" style={{marginBottom:'1em'}}>
              <button className="view-btn" style={{marginRight:'0.7em'}} onClick={() => setDreamView('tabla')}>Tabla</button>
              <button className="view-btn" onClick={() => setDreamView('calendario')}>Calendario</button>
            </div>
            {dreamView === 'tabla' ? (
              dreams.length === 0 ? (
                <div className="dream-diary-placeholder" style={{background:'#232946', borderRadius:'10px', padding:'1.2em', color:'#e0e0e0', marginBottom:'1em'}}>
                  <p>No tienes sueños registrados.</p>
                </div>
              ) : (
                <div className="history-table-wrapper">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Descripción</th>
                        <th>Interpretación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dreams.map((dream, idx) => (
                        <tr key={idx}>
                          <td>{dream.date?.slice(0,10)}</td>
                          <td>{dream.text?.slice(0,60)}...</td>
                          <td>{dream.interpretation?.slice(0,60) || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <CalendarioDeSuenos 
                dreams={dreams}
                onDayClick={(date) => navigate('/dream-interpretation')}
              />
            )}
          </>
        ) : (
          <div style={{color:'#ff4136',fontWeight:'bold',margin:'1em 0',background:'#232946',borderRadius:'10px',padding:'1.2em'}}>
            El acceso al diario de sueños es exclusivo para suscriptores <b>ADEPTO o MAESTRO</b>.<br/>
            Actualiza tu suscripción para desbloquear esta función.<br/>
            <a href="/planes" style={{color:'#eebc1d',textDecoration:'underline',cursor:'pointer'}} onClick={handlePlanesClick}>Ver planes disponibles</a>
          </div>
        )}
      </div>

      {/* Acciones al final */}
      <div className="profile-actions">
        <h2 className="section-title">Acciones</h2>
        <div className="actions-grid">
          <Link to="/account" className="action-button">
            <span role="img" aria-label="Configuración" style={{fontSize:'1.2em'}}>⚙️</span>
            Configuración
          </Link>
          <Link to="/edit-profile" className="action-button">
            <span role="img" aria-label="Editar">✏️</span>
            Editar Perfil
          </Link>
          {isAdmin && (
            <Link to="/admin-dashboard" className="action-button admin-button">
              <span role="img" aria-label="Admin" style={{fontSize:'1.2em'}}>🛡️</span>
              Panel Admin
            </Link>
          )}
          <button 
            onClick={handleLogout}
            className="action-button logout-button"
          >
            <span role="img" aria-label="Cerrar Sesión" style={{fontSize:'1.2em'}}>🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}