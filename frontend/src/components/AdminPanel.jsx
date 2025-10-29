import React, { useState, useEffect, useRef } from 'react';
import api from '../api/apiClient.js';
import jsPDF from 'jspdf';
import { useAuth } from '../hooks/useAuth.jsx';
import DecksManager from './admin/DecksManager.jsx';
import PlanesIA from './admin/PlanesIA.jsx';
import '../styles/AdminPanel.css';

function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [objetivos, setObjetivos] = useState([]);
  const [objetivosEdit, setObjetivosEdit] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [stats, setStats] = useState({});
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportEmail, setReportEmail] = useState('');
  const [sectionIncome, setSectionIncome] = useState(true);
  const [sectionExpenses, setSectionExpenses] = useState(true);
  const [sectionSubscriptions, setSectionSubscriptions] = useState(true);
  const [sectionChurn, setSectionChurn] = useState(true);
  const [sectionProductMetrics, setSectionProductMetrics] = useState(true);
  const [sectionOpenAICosts, setSectionOpenAICosts] = useState(true);
  const [sectionForecasts, setSectionForecasts] = useState(true);
  const [includeEmailStats, setIncludeEmailStats] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [reportResult, setReportResult] = useState('');

  useEffect(() => {
    // Cargar usuarios y estadísticas
    async function fetchData() {
      try {
        const [usersRes, statsRes, objetivosRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/stats'),
          api.get('/objetivos')
        ]);
        setUsers(usersRes.data.users);
        setStats(statsRes.data.stats);
        setObjetivos(objetivosRes.data.objetivos);
        setObjetivosEdit(objetivosRes.data.objetivos.map(obj => ({ ...obj })));
      } catch (err) {
  setError('No se pudieron cargar los datos. Por favor, revisa tu conexión o contacta con soporte si el problema persiste.');
        setErrorType('conn');
      }
    }
    fetchData();
  }, []);

  const handleProponerObjetivos = async () => {
    try {
      const res = await api.get('/objetivos/proponer');
      setObjetivos(res.data.objetivos);
      setObjetivosEdit(res.data.objetivos.map(obj => ({ ...obj })));
      setEditMode(false);
    } catch (err) {
  setError('No se pudo generar una propuesta de objetivos automática. Intenta de nuevo más tarde o consulta con soporte.');
      setErrorType('backend');
    }
  };

  const handleEditObjetivos = () => {
    setObjetivosEdit(objetivos.map(obj => ({ ...obj })));
    setEditMode(true);
  };

  const handleSaveObjetivos = async () => {
    try {
      await api.put('/objetivos', { objetivos: objetivosEdit });
      setObjetivos(objetivosEdit.map(obj => ({ ...obj })));
      setEditMode(false);
    } catch (err) {
  setError('No se pudieron guardar los objetivos. Por favor, revisa los datos e inténtalo de nuevo.');
      setErrorType('backend');
    }
  };

  const getColor = (type, value) => {
    // Lógica de color para las tarjetas de estadísticas
    if (type === 'usuarios') return value > 100 ? '#eebc1d' : '#232946';
    if (type === 'admins') return value > 5 ? '#635bff' : '#232946';
    if (type === 'lecturas') return value > 1000 ? '#eebc1d' : '#232946';
    if (type === 'cartas') return value > 200 ? '#635bff' : '#232946';
    return '#232946';
  };

  // Parche: evitar error si users es undefined o no es array
  const filteredUsers = Array.isArray(users)
    ? users
        .filter(u => filterRole === 'ALL' || u.role === filterRole)
        .filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  // Asegura que stats siempre sea un objeto para evitar errores de acceso
  const safeStats = stats || {};
  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1 className="admin-title">
          <span role="img" aria-label="Administrador" style={{fontSize:'1.2em',marginRight:'0.4em'}}>🛡️</span> Panel de Administración
        </h1>
        <p className="admin-subtitle">Arcana Club - Sistema de gestión</p>
        <div style={{marginTop:'1em'}}>
          <button className="objetivos-btn" onClick={handleProponerObjetivos} style={{background:'#232946',color:'#fff',marginRight:10}}>
            Proponer objetivos con IA
          </button>
          <button className="objetivos-btn" onClick={handleEditObjetivos}>
            Editar objetivos manualmente
          </button>
        </div>
      </div>
      {error && (
        <div className="admin-alert admin-alert-error">
          {error}
          {errorType === 'conn' && (
            <>
              <br />
              <span>¿Solución? Verifica que el backend esté corriendo y la URL en el frontend sea correcta.</span>
            </>
          )}
          {errorType === 'auth' && (
            <>
              <br />
              <span>¿Solución? Cierra sesión y vuelve a iniciar. Si el problema persiste, revisa el token en localStorage.</span>
            </>
          )}
          {errorType === 'perm' && (
            <>
              <br />
              <span>¿Solución? Accede con una cuenta de administrador válida.</span>
            </>
          )}
          {errorType === 'backend' && (
            <>
              <br />
              <span>¿Solución? Revisa la configuración del backend y los endpoints.</span>
            </>
          )}
        </div>
      )}
      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <span role="img" aria-label="Dashboard" style={{fontSize:'1.1em',marginRight:'0.3em'}}>📊</span> Dashboard
        </button>
        <button className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          <span role="img" aria-label="Usuarios" style={{fontSize:'1.1em',marginRight:'0.3em'}}>👥</span> Usuarios
        </button>
        <button className={`admin-tab ${activeTab === 'decks' ? 'active' : ''}`} onClick={() => setActiveTab('decks')}>
          <span role="img" aria-label="Mazos" style={{fontSize:'1.1em',marginRight:'0.3em'}}>🃏</span> Mazos
        </button>
        <button className={`admin-tab ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')}>
          <span role="img" aria-label="Informe" style={{fontSize:'1.1em',marginRight:'0.3em'}}>📄</span> Informe
        </button>
        <button className={`admin-tab ${activeTab === 'planes' ? 'active' : ''}`} onClick={() => setActiveTab('planes')}>
          <span role="img" aria-label="Plan IA" style={{fontSize:'1.1em',marginRight:'0.3em'}}>🤖</span> Plan Comercial IA
        </button>
      </div>
      <div className="admin-content">
        {activeTab === 'dashboard' && (
          <div className="admin-dashboard">
            <div className="objetivos-section objetivos-mb">
              <h2>Objetivos del periodo</h2>
              {!editMode ? (
                <>
                  <div className="objetivos-list">
                    {(Array.isArray(objetivos) ? objetivos : []).map(obj => (
                      <div key={obj.clave} className="objetivo-card">
                        <b>{obj.descripcion || obj.clave}</b><br/>
                        <span>Meta: {obj.valor}</span>
                      </div>
                    ))}
                  </div>
                  <button className="objetivos-btn" onClick={handleEditObjetivos}>Editar objetivos</button>
                </>
              ) : (
                <>
                  <div className="objetivos-list">
                    {(Array.isArray(objetivosEdit) ? objetivosEdit : []).map((obj,idx) => (
                      <div key={obj.clave} className="objetivo-card">
                        <input value={obj.descripcion} onChange={e=>{
                          const arr=[...objetivosEdit];arr[idx].descripcion=e.target.value;setObjetivosEdit(arr);
                        }} placeholder="Descripción" className="objetivo-input mb4"/>
                        <input type="number" value={obj.valor} onChange={e=>{
                          const arr=[...objetivosEdit];arr[idx].valor=Number(e.target.value);setObjetivosEdit(arr);
                        }} className="objetivo-input"/>
                        <span className="objetivo-clave">Clave: {obj.clave}</span>
                      </div>
                    ))}
                  </div>
                  <button className="objetivos-btn" onClick={handleSaveObjetivos}>Guardar objetivos</button>
                  <button className="objetivos-btn cancel" onClick={()=>setEditMode(false)}>Cancelar</button>
                </>
              )}
            </div>
            <div className="stats-grid">
              <div className={`stat-card stat-usuarios`} style={{background:getColor('usuarios',safeStats.totalUsers||0)}}>
                <div className="stat-icon users">
                  <span role="img" aria-label="Usuarios">👥</span>
                </div>
                <div className="stat-info">
                  <h3>Total Usuarios</h3>
                  <span className="stat-number">{safeStats.totalUsers || 0}</span>
                </div>
              </div>
              <div className={`stat-card stat-admins`} style={{background:getColor('admins',safeStats.totalAdmins||0)}}>
                <div className="stat-icon admins">
                  <span role="img" aria-label="Admin">🛡️</span>
                </div>
                <div className="stat-info">
                  <h3>Administradores</h3>
                  <span className="stat-number">{safeStats.totalAdmins || 0}</span>
                </div>
              </div>
              <div className={`stat-card stat-lecturas`} style={{background:getColor('lecturas',safeStats.totalReadings||0)}}>
                <div className="stat-icon readings">
                  <span role="img" aria-label="Lecturas">📚</span>
                </div>
                <div className="stat-info">
                  <h3>Lecturas Totales</h3>
                  <span className="stat-number">{safeStats.totalReadings || 0}</span>
                </div>
              </div>
              <div className={`stat-card stat-cartas`} style={{background:getColor('cartas',safeStats.totalCards||180)}}>
                <div className="stat-icon cards">
                  <span role="img" aria-label="Cartas">🃏</span>
                </div>
                <div className="stat-info">
                  <h3>Cartas en BD</h3>
                  <span className="stat-number">{safeStats.totalCards || 180}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'users' && (
          <div className="admin-users">
            <div className="users-filters">
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                <option value="ALL">Todos</option>
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
              </select>
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <table className="users-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Plan</th>
                  <th>Alta</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(filteredUsers) ? filteredUsers : []).map((user, idx) => (
                  <React.Fragment key={user.id}>
                    <tr className="user-row" onClick={()=>setUsers(users=>users.map((u,i)=>i===idx?{...u,_expanded:!u._expanded}:u))}>
                      <td className="user-expand-cell">{user._expanded ? '▼' : '▶'}</td>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-small">
                            {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                          </div>
                          <span>{user.username || 'Sin username'}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role?.toLowerCase()}`}>{user.role || 'USER'}</span>
                      </td>
                      <td>
                        <select
                          value={user.subscriptionPlan}
                          onClick={e=>e.stopPropagation()}
                          onChange={async (e) => {
                            const newPlan = e.target.value;
                            try {
                              await api.put(`/admin/users/${user.id}/plan`, { plan: newPlan });
                              setUsers(users => users.map(u => u.id === user.id ? { ...u, subscriptionPlan: newPlan } : u));
                            } catch (err) {
                              alert('No se pudo actualizar el plan de este usuario. Por favor, revisa la conexión o contacta con soporte.');
                            }
                          }}
                          className="plan-select"
                        >
                          <option value="INVITADO">Invitado</option>
                          <option value="INICIADO">Iniciado</option>
                          <option value="ADEPTO">Adepto</option>
                          <option value="MAESTRO">Maestro</option>
                        </select>
                      </td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'N/A'}</td>
                    </tr>
                    {user._expanded && (
                      <tr>
                        <td colSpan={6} className="user-expanded-cell">
                          <div className="user-expanded-row">
                            <div>
                              <div><b>Lecturas:</b> {user.readingsCount || 0}</div>
                              <div><b>Prueba:</b> {user.trialActive ? 'Activa' : 'No'}</div>
                              <div><b>Bonos:</b> {user.readingBonus || 0}</div>
                              <div><b>Fin Plan:</b> {user.planEndDate ? new Date(user.planEndDate).toLocaleDateString('es-ES') : 'N/A'}</div>
                              <div><b>Renovación:</b> {user.renewalStatus || 'N/A'}</div>
                            </div>
                            <div>
                              <button className="user-action-btn pagos" onClick={async(e)=>{
                                e.stopPropagation();
                                try{
                                  const res = await api.get(`/admin/users/${user.id}/payments`);
                                  alert('Pagos:\n'+JSON.stringify(res.data.payments,null,2));
                                }catch(err){alert('No se pudieron consultar los pagos de este usuario. Intenta de nuevo más tarde.');}
                              }}>Pagos</button>
                              <button className="user-action-btn plan" onClick={async(e)=>{
                                e.stopPropagation();
                                try{
                                  const res = await api.get(`/admin/users/${user.id}/plan-status`);
                                  alert('Plan info:\n'+JSON.stringify(res.data.user,null,2));
                                }catch(err){alert('No se pudo consultar la información del plan de este usuario. Intenta de nuevo más tarde.');}
                              }}>Plan</button>
                              <button className="user-action-btn trial" onClick={async(e)=>{
                                e.stopPropagation();
                                try{
                                  await api.put(`/admin/users/${user.id}/trial`);
                                  setUsers(users => users.map(u => u.id === user.id ? { ...u, trialActive: true } : u));
                                  alert('Prueba activada');
                                }catch(err){alert('No se pudo activar la prueba gratuita para este usuario. Intenta de nuevo más tarde.');}
                              }}>{user.trialActive ? 'Desactivar prueba' : 'Activar prueba'}</button>
                              <button className="user-action-btn eliminar" style={{background:'#e74c3c',color:'#fff'}} onClick={async(e)=>{
                                e.stopPropagation();
                                if(window.confirm('¿Seguro que quieres eliminar este usuario?')){
                                  try{
                                    await api.delete(`/admin/users/${user.id}`);
                                    setUsers(users => users.filter(u => u.id !== user.id));
                                    alert('Usuario eliminado correctamente.');
                                  }catch(err){alert('No se pudo eliminar el usuario. Por favor, revisa la conexión o contacta con soporte.');}
                                }
                              }}>Eliminar</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'decks' && (
          <div className="admin-decks">
            <DecksManager />
          </div>
        )}
        {activeTab === 'report' && (
          <div className="admin-report">
            <h2>Generar Informe Estadístico</h2>
            <div className="admin-alert admin-alert-info">
              La función de generación de informes no está disponible actualmente.<br />
              Si necesitas un informe, contacta con soporte o revisa los datos manualmente.
            </div>
          </div>
        )}
        {activeTab === 'planes' && (
          <div className="admin-alert admin-alert-info">
            La propuesta de planes comerciales por IA no está disponible.<br />
            Consulta los planes existentes o contacta con soporte para nuevas estrategias.
          </div>
        )}
      </div>
    </div>
  );
}

// --- Menú de opciones para cada usuario ---
function UserOptionsMenu({ user, setUsers }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="user-options-menu" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="user-options-btn"
        title="Opciones"
      >
        ⋮
      </button>
      {open && (
        <div className="user-options-dropdown">
          <button
            onClick={async () => {
              setOpen(false);
              if (window.confirm('¿Seguro que quieres eliminar este usuario?')) {
                try {
                  await api.delete(`/admin/users/${user.id}`);
                  setUsers(users => users.filter(u => u.id !== user.id));
                } catch (err) {
                  alert('No se pudo eliminar el usuario. Por favor, revisa la conexión o contacta con soporte.');
                }
              }
            }}
            className="user-options-item delete"
          >
            Eliminar usuario
          </button>
          <button
            onClick={async () => {
              setOpen(false);
              try {
                await api.put(`/admin/users/${user.id}/trial`);
                const res = await api.get(`/admin/users/${user.id}/plan-status`);
                setUsers(users => users.map(u => u.id === user.id ? { ...u, trialActive: true, trialEndDate: res.data.user.trialEndDate } : u));
              } catch (err) {
                alert('No se pudo activar la prueba gratuita para este usuario. Intenta de nuevo más tarde.');
              }
            }}
            className="user-options-item trial"
          >
            {user.trialActive ? 'Desactivar prueba' : 'Activar prueba'}
          </button>
          <button
            onClick={async () => {
              setOpen(false);
              const bonus = prompt('Bonos de lecturas extra:', user.readingBonus || 0);
              try {
                await api.put(`/admin/users/${user.id}/bonus`, { bonus: Number(bonus) });
                setUsers(users => users.map(u => u.id === user.id ? { ...u, readingBonus: Number(bonus) } : u));
              } catch (err) {
                alert('No se pudieron asignar los bonos de lecturas extra. Intenta de nuevo más tarde.');
              }
            }}
            className="user-options-item bonus"
          >
            Bonos de lecturas
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;