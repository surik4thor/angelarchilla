// src/pages/AccountSettings.jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
// Eliminado FontAwesome, se usan emojis
import '../styles/AccountSettings.css'

export default function AccountSettings() {
  const { user, updatePassword, updateNotifications, deleteAccount } = useAuth()
  const [activeTab, setActiveTab] = useState('security')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Estados para notificaciones
  const [notifications, setNotifications] = useState({
    newsletter: user?.preferences?.newsletter || false,
    readingReminders: user?.preferences?.readingReminders || true,
    promotions: user?.preferences?.promotions || false,
    accountUpdates: user?.preferences?.accountUpdates || true,
    newFeatures: user?.preferences?.newFeatures || false
  })

  // Estados para privacidad
  const [privacy, setPrivacy] = useState({
    profilePublic: user?.preferences?.profilePublic || false,
    shareReadings: user?.preferences?.shareReadings || false,
    analytics: user?.preferences?.analytics || true
  })

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' })
      return
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' })
      return
    }

    setLoading(true)
    try {
      await updatePassword(passwordData.currentPassword, passwordData.newPassword)
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Error al cambiar la contraseña' })
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationsUpdate = async () => {
    setLoading(true)
    try {
      // Sincronizar consentimiento legal y baja
    if (notifications.newsletter) {
  await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/newsletter/consentimiento-newsletter`, { credentials: 'include',
          method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email: user.email }),
           // credentials: 'include' // Eliminado duplicado
        });
    } else {
  await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/newsletter/baja`, { credentials: 'include',
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           // credentials: 'include' // Eliminado duplicado
        });
      }
      await updateNotifications(notifications);
  setMessage({ type: 'success', text: 'Preferencias de notificación actualizadas' });
  window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar las preferencias' });
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteAccount = async () => {
    const confirmText = 'ELIMINAR MI CUENTA'
    const userInput = prompt(
      `⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE.\n\nSe eliminarán permanentemente:\n- Tu cuenta y perfil\n- Todas tus lecturas\n- Tu historial de compras\n- Todas tus configuraciones\n\nEscribe "${confirmText}" para confirmar:`
    )
    
    if (userInput === confirmText) {
      setLoading(true)
      try {
        await deleteAccount()
        setMessage({ type: 'success', text: '✅ Tu cuenta ha sido eliminada correctamente. Serás redirigido al inicio.' })
        setLoading(false)
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Error al eliminar la cuenta' })
        setLoading(false)
      }
    }
  }

  const tabs = [
  { id: 'security', name: 'Seguridad', icon: '🛡️' },
  { id: 'notifications', name: 'Notificaciones', icon: '🔔' },
  { id: 'privacy', name: 'Privacidad', icon: '🕵️' }
  ]

  return (
    <div className="account-settings-container">
      <div className="settings-header">
        <Link to="/profile" className="back-button">
          <span role="img" aria-label="Volver">◀️</span>
          Volver al Perfil
        </Link>
        <h1>Configuración de Cuenta</h1>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          <span role="img" aria-label={message.type === 'success' ? 'Éxito' : 'Advertencia'}>{message.type === 'success' ? '✅' : '⚠️'}</span>
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
        </div>
      )}

      <div className="settings-content">
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span role="img" aria-label={tab.name}>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        <div className="settings-panel">
          {activeTab === 'security' && (
            <div className="security-panel">
              <h2>
                <span role="img" aria-label="Seguridad">🛡️</span>
                Seguridad de la Cuenta
              </h2>

              <div className="security-section">
                <h3>Cambiar Contraseña</h3>
                <form onSubmit={handlePasswordChange} className="password-form">
                  <div className="form-group">
                    <label>Contraseña Actual</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        required
                        minLength={6}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      >
                        <span role="img" aria-label="Mostrar/ocultar">
                          {showPasswords.current ? '🙈' : '👁️'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Nueva Contraseña</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        required
                        minLength={6}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      >
                        <span role="img" aria-label="Mostrar/ocultar">
                          {showPasswords.new ? '🙈' : '👁️'}
                        </span>
                      </button>
                    </div>
                    <small>Mínimo 6 caracteres</small>
                  </div>

                  <div className="form-group">
                    <label>Confirmar Nueva Contraseña</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        minLength={6}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        <span role="img" aria-label="Mostrar/ocultar">
                          {showPasswords.confirm ? '🙈' : '👁️'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="update-button" disabled={loading}>
                    <span role="img" aria-label="Clave">🔑</span>
                    {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                  </button>
                </form>
              </div>

              <div className="danger-zone">
                <h3>
                  <span role="img" aria-label="Peligro">⚠️</span>
                  Zona de Peligro
                </h3>
                <p>Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, ten cuidado.</p>
                <button 
                  className="delete-account-button" 
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  <span role="img" aria-label="Eliminar">🗑️</span>
                  Eliminar Cuenta
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="notifications-panel">
              <h2>
                <span role="img" aria-label="Notificación">🔔</span>
                Preferencias de Notificación
              </h2>
              <div className="notification-groups">
                <div className="notification-group">
                  <h3>Email Marketing</h3>
                  <div className="notification-item">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={notifications.newsletter}
                        onChange={(e) => setNotifications(prev => ({ ...prev, newsletter: e.target.checked }))}
                      />
                      <span className="toggle-slider"></span>
                      <div className="notification-info">
                        <strong>Newsletter Semanal</strong>
                        <p>Recibe consejos esotéricos, noticias y contenido exclusivo</p>
                      </div>
                    </label>
                  </div>
                  <div className="notification-item">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={notifications.promotions}
                        onChange={(e) => setNotifications(prev => ({ ...prev, promotions: e.target.checked }))}
                      />
                      <span className="toggle-slider"></span>
                      <div className="notification-info">
                        <strong>Ofertas y Promociones</strong>
                        <p>Descuentos especiales en lecturas y productos</p>
                      </div>
                    </label>
                  </div>
                </div>
                {/* Sección de baja de newsletter */}
                <div className="notification-group notification-group-newsletter">
                  <h3>Baja de Newsletter</h3>
                  {notifications.newsletter ? (
                    <>
                      <span>¿Quieres dejar de recibir la newsletter y promociones?</span><br/>
                      <button onClick={async()=>{
                        setLoading(true);
                        try {
                          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/newsletter/unsubscribe`, { credentials: 'include',
                            method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email: user.email }),
                              // credentials: 'include' // Eliminado duplicado
                          });
                          const data = await res.json();
                          if(data.success){
                            setNotifications(prev=>({...prev,newsletter:false}));
                            setMessage({type:'success',text:'Te has dado de baja correctamente.'});
                          }else{
                            setMessage({type:'error',text:'No se pudo procesar la baja.'});
                          }
                        }catch(e){
                          setMessage({type:'error',text:'Error al conectar con el servidor.'});
                        }
                        setLoading(false);
                      }} disabled={loading} className="newsletter-unsubscribe-btn">Darse de baja</button>
                    </>
                  ) : (
                    <span className="newsletter-unsubscribed">No estás suscrito a la newsletter.</span>
                  )}
                </div>
                <div className="notification-group">
                  <h3>Actividad de la Cuenta</h3>
                  <div className="notification-item">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={notifications.readingReminders}
                        onChange={(e) => setNotifications(prev => ({ ...prev, readingReminders: e.target.checked }))}
                      />
                      <span className="toggle-slider"></span>
                      <div className="notification-info">
                        <strong>Recordatorios de Lectura</strong>
                        <p>Te recordamos cuando es buen momento para una nueva consulta</p>
                      </div>
                    </label>
                  </div>
                  <div className="notification-item">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={notifications.accountUpdates}
                        onChange={(e) => setNotifications(prev => ({ ...prev, accountUpdates: e.target.checked }))}
                      />
                      <span className="toggle-slider"></span>
                      <div className="notification-info">
                        <strong>Actualizaciones de Cuenta</strong>
                        <p>Cambios de seguridad, facturación y configuración</p>
                      </div>
                    </label>
                  </div>
                </div>
                <div className="notification-group">
                  <h3>Novedades</h3>
                  <div className="notification-item">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={notifications.newFeatures}
                        onChange={(e) => setNotifications(prev => ({ ...prev, newFeatures: e.target.checked }))}
                      />
                      <span className="toggle-slider"></span>
                      <div className="notification-info">
                        <strong>Nuevas Funcionalidades</strong>
                        <p>Sé el primero en conocer las nuevas herramientas y servicios</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              <button 
                className="save-button" 
                onClick={handleNotificationsUpdate}
                disabled={loading}
              >
                Guardar Preferencias
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}