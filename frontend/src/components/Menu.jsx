import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import AuthModal from './AuthModal.jsx';
import '../styles/Menu.css';
// FontAwesome eliminado, ahora solo emojis

// Este archivo es el menú principal mejorado
export default function Menu() {
  const { user, logout, loading, login, register } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowUserDropdown(false);
    navigate('/');
  };

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setAuthError('');
    setShowAuthModal(true);
  };

  const handleAuthSubmit = async (formData) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
      setShowAuthModal(false);
    } catch (error) {
      setAuthError(error.response?.data?.error || error.message || 'Error en la autenticación');
    } finally {
      setAuthLoading(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.email === 'surik4thor@icloud.com';

  return (
    <>
      <nav className="menu-container nebulosa-bg">
        <div className="menu-left">
          <Link to="/" className="menu-logo nebulosa-logo">
          <img src="/logo.png" alt="Nebulosa Mágica" style={{height:'38px',verticalAlign:'middle',marginRight:'0.7em'}} />
          </Link>
        </div>
        <div className="menu-right">
          {loading ? (
            <div className="menu-loading">
              <div className="loading-spinner"></div>
            </div>
          ) : !user ? (
            <div className="menu-auth-buttons">
              <button 
                className="menu-button menu-button-primary"
                onClick={() => openAuthModal('login')}
              >
                Acceder
              </button>
            </div>
          ) : (
            <div className="menu-user-section">
              {/* Botón de carrito solo si hay productos */}
              {/* TODO: Reemplazar 0 por la variable real de cantidad de productos en el carrito */}
              {0 > 0 && (
                <Link to="/cart" className="menu-icon-button" title="Carrito">
                  <span role="img" aria-label="Carrito" style={{fontSize:'1.3em'}}>🛒</span>
                  <span className="cart-badge">0</span>
                </Link>
              )}

              {/* Dropdown de usuario */}
              <div className="user-dropdown" ref={dropdownRef}>
                <button 
                  className="user-dropdown-trigger"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  title={`Hola, ${user.username || user.email}`}
                >
                  <div className="user-avatar">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <span role="img" aria-label="Usuario" style={{fontSize:'1em'}}>👤</span>
                    )}
                  </div>
                  <div className="user-info">
                    <span className="user-name">
                      {user.username || user.email?.split('@')[0]}
                    </span>
                    <span className="user-role">
                      {isAdmin ? 'Administrador' : user.subscriptionPlan || 'Invitado'}
                    </span>
                  </div>
                  <span role="img" aria-label="Desplegar" style={{fontSize:'1.1em'}}>
                    {showUserDropdown ? '⬆️' : '⬇️'}
                  </span>
                </button>

                {showUserDropdown && (
                  <div className="user-dropdown-menu">
                    <div className="dropdown-header">
                      <div className="user-avatar-large">
                        {user?.avatar ? (
                          <img src={user.avatar} alt="Avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <span role="img" aria-label="Usuario" style={{fontSize:'1em'}}>👤</span>
                        )}
                      </div>
                      <div>
                        <div className="dropdown-user-name">
                          {user.username || user.email?.split('@')[0]}
                        </div>
                        <div className="dropdown-user-email">{user.email}</div>
                      </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <span role="img" aria-label="Perfil" style={{fontSize:'1em'}}>👤</span>
                      Mi Perfil
                    </Link>

                    <Link 
                      to="/account" 
                      className="dropdown-item"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <span role="img" aria-label="Configuración" style={{fontSize:'1em'}}>⚙️</span>
                      Configuración
                    </Link>

                    {isAdmin && (
                      <>
                        <div className="dropdown-divider"></div>
                        <Link 
                          to="/admin" 
                          className="dropdown-item admin-item"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <span role="img" aria-label="Admin" style={{fontSize:'1em'}}>🛡️</span>
                          Panel Admin
                        </Link>
                      </>
                    )}

                    <div className="dropdown-divider"></div>

                    <button 
                      className="dropdown-item logout-item"
                      onClick={handleLogout}
                    >
                      <span role="img" aria-label="Cerrar Sesión" style={{fontSize:'1em'}}>🚪</span>
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
      {/* Modal de autenticación mejorado */}
      <AuthModal
        isOpen={showAuthModal}
        mode={authMode}
        error={authError}
        loading={authLoading}
        onClose={() => setShowAuthModal(false)}
        onSwitchMode={setAuthMode}
        onSubmit={handleAuthSubmit}
      />
    </>
  );
}
