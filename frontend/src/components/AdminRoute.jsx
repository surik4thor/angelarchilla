import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import '../styles/AdminRoute.css';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras verifica la autenticación
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-container">
          <span role="img" aria-label="Cargando" className="emoji-spinner">⏳</span>
          <h2>Verificando permisos...</h2>
          <p>Validando acceso administrativo</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar si el usuario tiene permisos de admin
  const isAdmin = user.role === 'ADMIN' || user.email === 'surik4thor@icloud.com';

  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <div className="access-denied-container">
          <span role="img" aria-label="Candado" className="denied-icon">🔒</span>
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para acceder al panel de administración.</p>
          <div className="required-permissions">
            <span role="img" aria-label="Escudo">🛡️</span>
            <span>Se requieren permisos de administrador</span>
          </div>
          <button 
            onClick={() => window.history.back()} 
            className="back-button"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Si todo está bien, renderizar el componente hijo
  return children;
}