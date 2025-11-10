import React from 'react';
import { useAuth } from '../hooks/useAuth.jsx';

// Componente que protege rutas y evita peticiones no autorizadas
export function AuthGuard({ children, fallback = null, requireAuth = false }) {
  const { user, loading } = useAuth();

  // Si está cargando, mostrar fallback o nada
  if (loading) {
    return fallback || <div>Verificando autenticación...</div>;
  }

  // Si requiere autenticación y no hay usuario, mostrar fallback
  if (requireAuth && !user) {
    return fallback || <div>Acceso no autorizado</div>;
  }

  // Si todo está bien, renderizar children
  return children;
}

// Hook para componentes que necesitan verificar autenticación antes de hacer peticiones
export function useAuthGuard() {
  const { user, loading } = useAuth();
  
  return {
    isAuthenticated: !!user,
    isLoading: loading,
    canMakeRequests: !loading && !!user,
    user
  };
}

export default AuthGuard;