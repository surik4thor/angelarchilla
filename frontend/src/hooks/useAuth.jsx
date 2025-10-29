import React, { createContext, useContext, useState, useEffect } from 'react'
import { getMe, login as apiLogin, register as apiRegister } from '../api/auth.js'
import api from '../api/apiClient.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      let finished = false;
      try {
        const token = localStorage.getItem('arcanaToken');
        if (!token) {
          setUser(null);
          finished = true;
          return;
        }
        const userData = await getMe();
        // Si la respuesta es nula o inesperada, forzar usuario null
        if (!userData || typeof userData !== 'object') {
          setUser(null);
        } else {
          setUser(userData);
        }
      } catch (error) {
        // Si hay error 401, limpiar token inválido
        if (error?.response?.status === 401) {
          localStorage.removeItem('arcanaToken');
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true)
    try {
      const userData = await apiLogin({ email, password })
      setUser(userData)
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
    setUser(null);
  }

  // Actualizar perfil
  const updateProfile = async (profileData) => {
    try {
      const { data } = await api.put('/auth/profile', profileData)
      setUser(data.member)
      return data.member
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar el perfil')
    }
  }

  // Cambiar contraseña
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/password', { currentPassword, newPassword })
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cambiar la contraseña')
    }
  }

  // Actualizar notificaciones
  const updateNotifications = async (notifications) => {
    try {
      const { data } = await api.put('/auth/notifications', { preferences: notifications })
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
      const { data } = await api.post('/auth/avatar', formData, {
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
      const { data } = await api.delete('/auth/avatar')
      setUser(data.user)
      return data.user
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar la imagen')
    }
  }

  // Eliminar cuenta
  const deleteAccount = async () => {
    try {
      await api.delete('/auth/account')
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