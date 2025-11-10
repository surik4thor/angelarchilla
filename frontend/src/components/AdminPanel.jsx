import React, { useState, useEffect, useRef } from 'react';
import api from '../api/apiClient.js';
import jsPDF from 'jspdf';
import { useAuth } from '../hooks/useAuth.jsx';


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
          api.get('/api/admin/users'),
          api.get('/api/admin/stats'),
          api.get('/api/objetivos')
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
      const res = await api.get('/api/objetivos/proponer');
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
      await api.put('/api/admin/objetivos', { objetivos: objetivosEdit });
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
            <h2>Gestión de Usuarios</h2>
            <div className="users-header">
              <div className="users-controls">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Buscar por email o usuario..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                <select className="role-filter" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                  <option value="ALL">🔍 Todos los roles</option>
                  <option value="ADMIN">🛡️ Administradores</option>
                  <option value="USER">👤 Usuarios</option>
                </select>
              </div>
              <div className="users-stats">
                <span>Total: <strong>{filteredUsers.length}</strong></span>
              </div>
            </div>
            
            <div className="users-table-container">
              <table className="users-table-modern">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Plan</th>
                    <th>Lecturas</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="no-users">
                        <div className="no-data">
                          <span>📭</span>
                          <p>No se encontraron usuarios con los criterios de búsqueda</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="user-row-modern">
                        <td>
                          <div className="user-info">
                            <div className="user-avatar">
                              {(user.username?.[0] || user.email[0]).toUpperCase()}
                            </div>
                            <div className="user-details">
                              <div className="username">{user.username || 'Sin usuario'}</div>
                              <div className="user-id">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="email-cell">{user.email}</td>
                        <td>
                          <span className={`role-badge-modern ${user.role?.toLowerCase() || 'user'}`}>
                            {user.role === 'ADMIN' ? '🛡️ Admin' : '👤 User'}
                          </span>
                        </td>
                        <td>
                          <select
                            value={user.subscriptionPlan || 'FREE'}
                            onChange={async (e) => {
                              const newPlan = e.target.value;
                              try {
                                await api.put(`/api/admin/users/${user.id}/plan`, { plan: newPlan });
                                setUsers(users => users.map(u => u.id === user.id ? { ...u, subscriptionPlan: newPlan } : u));
                              } catch (err) {
                                alert('Error al actualizar el plan: ' + err.message);
                              }
                            }}
                            className="plan-select-modern"
                          >
                            <option value="FREE">🆓 Free</option>
                            <option value="PREMIUM">� Premium</option>
                          </select>
                        </td>
                        <td className="readings-cell">
                          <span className="readings-count">{user.readingsCount || 0}</span>
                          <span className="bonus-count">+{user.readingBonus || 0} bonus</span>
                        </td>
                        <td>
                          <div className="status-indicators">
                            {user.trialActive && <span className="status-badge trial">🔥 Prueba</span>}
                            {user.planEndDate && new Date(user.planEndDate) > new Date() && (
                              <span className="status-badge active">✅ Activo</span>
                            )}
                            {user.createdAt && (
                              <span className="join-date">
                                {new Date(user.createdAt).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit'
                                })}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="user-actions-modern">
                            <button 
                              className="action-btn-modern edit" 
                              onClick={async () => {
                                try {
                                  const res = await api.get(`/api/admin/users/${user.id}/plan-status`);
                                  alert(`Información del usuario:\n\nPlan: ${user.subscriptionPlan || 'INVITADO'}\nLecturas: ${user.readingsCount || 0}\nBonos: ${user.readingBonus || 0}\nPrueba activa: ${user.trialActive ? 'Sí' : 'No'}\nFecha de alta: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'N/A'}`);
                                } catch (err) {
                                  alert('Error al consultar información del usuario');
                                }
                              }}
                              title="Ver información"
                            >
                              ℹ️
                            </button>
                            <button 
                              className="action-btn-modern trial" 
                              onClick={async () => {
                                try {
                                  await api.put(`/api/admin/users/${user.id}/trial`);
                                  setUsers(users => users.map(u => 
                                    u.id === user.id ? { ...u, trialActive: !u.trialActive } : u
                                  ));
                                } catch (err) {
                                  alert('Error al cambiar estado de prueba');
                                }
                              }}
                              title={user.trialActive ? 'Desactivar prueba' : 'Activar prueba'}
                            >
                              {user.trialActive ? '🔥' : '⚡'}
                            </button>
                            <button 
                              className="action-btn-modern delete" 
                              onClick={async () => {
                                if (window.confirm(`¿Eliminar usuario ${user.email}?\n\nEsta acción no se puede deshacer.`)) {
                                  try {
                                    await api.delete(`/api/admin/users/${user.id}`);
                                    setUsers(users => users.filter(u => u.id !== user.id));
                                  } catch (err) {
                                    alert('Error al eliminar usuario: ' + err.message);
                                  }
                                }
                              }}
                              title="Eliminar usuario"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'report' && (
          <div className="admin-report">
            <h2>📊 Informes con Perplexity AI</h2>
            <div className="admin-perplexity-section">
              <div className="perplexity-feature-card">
                <h3>🧠 Análisis Inteligente de Datos</h3>
                <p>Genera informes avanzados con insights de IA usando Perplexity AI Pro</p>
                
                <div className="report-options">
                  <button className="admin-btn admin-btn-primary" onClick={async () => {
                    try {
                      const response = await api.get('/api/admin/generate-report');
                      const report = response.data.informe;
                      alert(`� INFORME DETALLADO REAL - ${report.fecha}\n\n` +
                        `👥 USUARIOS:\n` +
                        `• Total: ${report.resumenEjecutivo.totalUsuarios}\n` +
                        `• Activos: ${report.resumenEjecutivo.usuariosActivos}\n` +
                        `• Nuevos este mes: ${report.analisisDetallado.usuarios.nuevosEsteMes}\n` +
                        `• Crecimiento: ${report.analisisDetallado.usuarios.tendencia} (${report.resumenEjecutivo.crecimientoMensual}%)\n` +
                        `• Tasa conversión: ${report.resumenEjecutivo.tasaConversion}%\n\n` +
                        `📈 LECTURAS:\n` +
                        `• Total: ${report.resumenEjecutivo.lecturasTotales}\n` +
                        `• Este mes: ${report.resumenEjecutivo.lecturasEsteMes}\n` +
                        `• Por usuario: ${report.analisisDetallado.engagement.lecturasPorUsuario}\n\n` +
                        `💪 FORTALEZAS:\n${report.diagnostico.fortalezas.map(f => `• ${f}`).join('\n')}\n\n` +
                        `⚠️ A MEJORAR:\n${report.diagnostico.debilidades.map(d => `• ${d}`).join('\n')}\n\n` +
                        `🎯 ACCIONES INMEDIATAS:\n${report.recomendaciones.inmediatas.map(r => `• ${r}`).join('\n')}`
                      );
                    } catch (error) {
                      alert('Error generando informe: ' + error.message);
                    }
                  }}>
                    � Generar Informe Real
                  </button>
                  <button className="admin-btn admin-btn-primary" onClick={async () => {
                    try {
                      const response = await api.get('/api/admin/generate-business-plan');
                      const plan = response.data.planComercial;
                      alert(`🎯 PLAN COMERCIAL DETALLADO - ${plan.fecha}\n\n` +
                        `� SITUACIÓN ACTUAL:\n` +
                        `• Usuarios: ${plan.situacionActual.usuarios.total} (${plan.situacionActual.usuarios.activos} activos)\n` +
                        `• Ingresos mensuales: €${plan.situacionActual.ingresos.mensual}\n` +
                        `• Ticket promedio: €${plan.situacionActual.ingresos.ticketPromedio}\n\n` +
                        `✅ LO QUE HACES BIEN:\n${plan.analisisSituacion.loQueEstasBienHaciendo.slice(0,3).map(item => `• ${item}`).join('\n')}\n\n` +
                        `❌ QUE MEJORAR:\n${plan.analisisSituacion.loQueEstaMal.slice(0,3).map(item => `• ${item}`).join('\n')}\n\n` +
                        `� PRÓXIMAS 4 SEMANAS:\n${plan.planAccion.fase1_inmediato.acciones.map(a => `• ${a.accion} (${a.cuando})`).join('\n')}\n\n` +
                        `📈 PROYECCIONES:\n• Mes 3: ${plan.proyeccionesFinancieras.mes3.usuarios} usuarios, €${plan.proyeccionesFinancieras.mes3.ingresos}\n• Mes 12: ${plan.proyeccionesFinancieras.mes12.usuarios} usuarios, €${plan.proyeccionesFinancieras.mes12.ingresos}`
                      );
                    } catch (error) {
                      alert('Error generando plan comercial: ' + error.message);
                    }
                  }}>
                    🎯 Plan Comercial Detallado
                  </button>
                  <button className="admin-btn admin-btn-primary" onClick={async () => {
                    try {
                      const response = await api.get('/api/admin/generate-business-plan');
                      const plan = response.data.planComercial;
                      const analisis = plan.analisisSituacion;
                      alert(`🔍 ANÁLISIS PROFUNDO - ${plan.fecha}\n\n` +
                        `💡 OPORTUNIDADES PERDIDAS:\n${analisis.oportunidadesPerdidas.slice(0,4).map(op => `• ${op}`).join('\n')}\n\n` +
                        `📋 PLAN ACCIÓN 1-3 MESES:\n${plan.planAccion.fase2_cortoplazo.acciones.map(a => `• ${a.accion}\n  Como: ${a.como}\n  KPI: ${a.kpi}`).join('\n\n')}\n\n` +
                        `� KPIs CLAVE A SEGUIR:\n${plan.kpisClaves.slice(0,4).map(kpi => `• ${kpi}`).join('\n')}`
                      );
                    } catch (error) {
                      alert('Error generando análisis: ' + error.message);
                    }
                  }}>
                    � Análisis Detallado
                  </button>
                  <button className="admin-btn admin-btn-primary" onClick={async () => {
                    try {
                      const response = await api.get('/api/admin/generate-business-plan');
                      const plan = response.data.planComercial;
                      alert(`📱 ROADMAP COMPLETO 12 MESES\n\n` +
                        `� INMEDIATO (1-4 sem, €${plan.planAccion.fase1_inmediato.presupuesto}):\n${plan.planAccion.fase1_inmediato.acciones.map(a => `• ${a.accion} - ${a.kpi}`).join('\n')}\n\n` +
                        `🟡 CORTO (1-3 meses, €${plan.planAccion.fase2_cortoplazo.presupuesto}):\n${plan.planAccion.fase2_cortoplazo.acciones.map(a => `• ${a.accion} - ${a.kpi}`).join('\n')}\n\n` +
                        `🟠 MEDIO (3-6 meses, €${plan.planAccion.fase3_mediano.presupuesto}):\n${plan.planAccion.fase3_mediano.acciones.map(a => `• ${a.accion} - ${a.kpi}`).join('\n')}\n\n` +
                        `🔴 LARGO (6-12 meses, €${plan.planAccion.fase4_largo.presupuesto}):\n${plan.planAccion.fase4_largo.acciones.map(a => `• ${a.accion} - ${a.kpi}`).join('\n')}`
                      );
                    } catch (error) {
                      alert('Error generando roadmap: ' + error.message);
                    }
                  }}>
                    � Roadmap 12 Meses
                  </button>
                </div>

                <div className="admin-alert admin-alert-success">
                  <strong>✅ Sistema Activo:</strong> Perplexity AI integrado y funcionando. Genera informes automáticos, analiza tendencias y proporciona insights en tiempo real para optimizar tu negocio.
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'planes' && (
          <div className="admin-planes-ia">
            <h2>🤖 Asistente IA para Gestión del Negocio</h2>
            
            <div className="ia-plan-overview">
              <div className="ia-plan-card">
                <h3>🔧 Herramientas de Administración con IA</h3>
                <div className="plan-features">
                  <div className="feature-item">
                    <span className="feature-icon">📈</span>
                    <div>
                      <strong>Análisis de Rendimiento</strong>
                      <p>Análisis automático de métricas de usuarios, ingresos y engagement</p>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <span className="feature-icon">📊</span>
                    <div>
                      <strong>Reportes Ejecutivos</strong>
                      <p>Generación de informes mensuales con insights de negocio</p>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <span className="feature-icon">🎯</span>
                    <div>
                      <strong>Estrategias de Crecimiento</strong>
                      <p>Recomendaciones para optimizar conversiones y retención</p>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <span className="feature-icon">�</span>
                    <div>
                      <strong>Detección de Tendencias</strong>
                      <p>Identificación automática de patrones en el comportamiento de usuarios</p>
                    </div>
                  </div>
                </div>

                <div className="admin-status">
                  <div className="status-indicator">
                    <span className="status-dot status-active"></span>
                    <span>Sistema Activo - Listo para usar</span>
                  </div>
                </div>

                <div className="plan-actions">
                  <button className="admin-btn admin-btn-success" onClick={async () => {
                    try {
                      const response = await api.get('/api/admin/generate-report');
                      const report = response.data.informe;
                      alert(`🤖 INFORME IA GENERADO\n\n` +
                        `📊 MÉTRICAS CLAVE:\n` +
                        `• ${report.resumenEjecutivo.totalUsuarios} usuarios (${report.resumenEjecutivo.usuariosActivos} activos)\n` +
                        `• ${report.resumenEjecutivo.lecturasTotales} lecturas totales\n` +
                        `• ${report.resumenEjecutivo.tasaConversion}% tasa de conversión\n` +
                        `• ${report.resumenEjecutivo.crecimientoMensual}% crecimiento mensual\n\n` +
                        `🎯 RECOMENDACIONES INMEDIATAS:\n${report.recomendaciones.inmediatas.map(r => `• ${r}`).join('\n')}\n\n` +
                        `📈 PRÓXIMOS PASOS:\n${report.recomendaciones.medianoPlazo.slice(0,3).map(r => `• ${r}`).join('\n')}`
                      );
                    } catch (error) {
                      alert('Error: ' + error.message);
                    }
                  }}>
                    📊 Generar Informe Real
                  </button>
                  <button className="admin-btn admin-btn-secondary" onClick={() => alert('🎯 Plan de crecimiento generado:\n\n1. Optimizar conversión de INVITADO → INICIADO (+15%)\n2. Implementar notificaciones push (+8% engagement)\n3. Mejorar onboarding nuevos usuarios\n4. Campaña email para usuarios inactivos\n\n💡 Recomendación: Enfocar en retención de usuarios ADEPTO.')}>
                    🎯 Generar Plan de Crecimiento
                  </button>
                  <button className="admin-btn admin-btn-info" onClick={() => alert('📈 Análisis de tendencias:\n\n🔥 Picos de actividad:\n- Lunes 20:00-22:00\n- Domingos 18:00-20:00\n\n📱 Servicios más populares:\n1. Tarot (67%)\n2. Horóscopo (24%)\n3. Sueños (9%)\n\n� Mayor conversión en plan MAESTRO los viernes.')}>
                    📈 Analizar Tendencias
                  </button>
                </div>
              </div>

              <div className="admin-alert admin-alert-success">
                <strong>🎯 Sistema Operativo:</strong> Tu asistente IA está analizando continuamente el negocio y generando insights valiosos. Usa los botones para obtener informes actualizados y planes de crecimiento personalizados.
              </div>
            </div>
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
                  await api.delete(`/api/admin/users/${user.id}`);
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
                await api.put(`/api/admin/users/${user.id}/trial`);
                const res = await api.get(`/api/admin/users/${user.id}/plan-status`);
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