import React, { createContext, useContext, useState, useEffect } from 'react'
import { getMe, login as apiLogin, register as apiRegister } from '../api/auth.js'
import api from '../api/apiClient.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('arcanaToken');
        const storedUser = localStorage.getItem('authUser');
        
        console.log('🔍 Verificando autenticación...', { hasToken: !!token, hasStoredUser: !!storedUser });
        
        if (!token) {
          console.log('❌ No hay token - usuario no autenticado');
          setUser(null);
          return;
        }

        // Si hay usuario guardado, usarlo inicialmente
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            console.log('📱 Usuario desde localStorage:', parsed.email);
            setUser(parsed);
          } catch (e) {
            console.warn('⚠️ Error parseando usuario guardado:', e);
            localStorage.removeItem('authUser');
          }
        }

        // Verificar con el backend
        console.log('🌐 Verificando usuario con backend...');
        const userData = await getMe();
        if (!userData || typeof userData !== 'object') {
          console.error('❌ Respuesta inválida del backend:', userData);
          localStorage.removeItem('arcanaToken');
          localStorage.removeItem('authUser');
          setUser(null);
        } else {
          console.log('✅ Usuario autenticado:', userData.email);
          setUser(userData);
          localStorage.setItem('authUser', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('❌ Error en verificación de auth:', error);
        // Si hay error 401, limpiar tokens inválidos
        if (error?.response?.status === 401) {
          localStorage.removeItem('arcanaToken');
          localStorage.removeItem('authUser');
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Listener para evento personalizado de limpieza de auth
    const handleAuthCleared = () => {
      console.log('🔄 Auth cleared event - resetting user');
      setUser(null);
    };

    window.addEventListener('auth-cleared', handleAuthCleared);
    checkAuth();

    return () => {
      window.removeEventListener('auth-cleared', handleAuthCleared);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true)
    try {
      const userData = await apiLogin({ email, password })
      setUser(userData)
      // Guardar usuario en localStorage para persistencia
      localStorage.setItem('authUser', JSON.stringify(userData))
      return userData
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

    const register = async (formData) => {
    setLoading(true)
    try {
        const userData = await apiRegister(formData)
      setUser(userData)
      return userData
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('arcanaToken');
    localStorage.removeItem('authUser');
    setUser(null);
  }

  // Actualizar perfil
  const updateProfile = async (profileData) => {
    try {
      const { data } = await api.put('/api/auth/profile', profileData)
      setUser(data.member)
      return data.member
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar el perfil')
    }
  }

  // Cambiar contraseña
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/api/auth/password', { currentPassword, newPassword })
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cambiar la contraseña')
    }
  }

  // Actualizar preferencias de notificación
  const updateNotifications = async (notifications) => {
    try {
      const { data } = await api.put('/api/auth/notifications', { preferences: notifications })
      setUser(data.user)
      return data.user
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar las notificaciones')
    }
  }

  // Subir avatar
  const uploadAvatar = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      // No sobreescribas Authorization, el interceptor lo añade
      const { data } = await api.post('/api/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser(data.member);
      return data.member;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al subir la imagen');
    }
  }

  // Eliminar avatar
  const deleteAvatar = async () => {
    try {
      const { data } = await api.delete('/api/auth/avatar')
      setUser(data.user)
      return data.user
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar la imagen')
    }
  }

  // Eliminar cuenta
  const deleteAccount = async () => {
    try {
      await api.delete('/api/auth/account')
      setUser(null)
      localStorage.removeItem('arcanaToken')
      window.location.href = '/'
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar la cuenta')
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      setUser,
      updateProfile,
      updatePassword,
      updateNotifications,
      uploadAvatar,
      deleteAvatar,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}