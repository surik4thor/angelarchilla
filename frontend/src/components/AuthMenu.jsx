import React, { useState, useEffect } from 'react'
import { login, register, logout, getMe } from '../api/auth.js'
import AuthModal from './AuthModal.jsx'

export default function AuthMenu({ onLogout: parentLogout, onLoginClick, onLoginSuccess: parentLoginSuccess }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' o 'signup'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Al montar, intenta obtener el usuario desde el backend
    getMe()
      .then(user => {
        if (user) {
          setCurrentUser(user)
          parentLoginSuccess?.(user)
        }
      })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      setCurrentUser(null)
      parentLogout?.()
    } catch (e) {
      console.error('Logout failed', e)
    }
  }

  const handleAuth = async credentials => {
    setError('')
    setLoading(true)
    try {
      const user =
        authMode === 'login'
          ? await login(credentials)
          : await register(credentials)
      setCurrentUser(user)
      parentLoginSuccess?.(user)
      setShowModal(false)
    } catch (e) {
      setError(e.message || 'Error durante la operación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-menu">
      {currentUser ? (
        <>
          <span>Hola, {currentUser.username || currentUser.email}</span>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </>
      ) : (
        <button
          onClick={() => {
            setAuthMode('login')
            setShowModal(true)
            onLoginClick?.()
          }}
        >
          Entrar / Registrarse
        </button>
      )}

      <AuthModal
        isOpen={showModal}
        mode={authMode}
        error={error}
        loading={loading}
        onClose={() => setShowModal(false)}
        onSwitchMode={mode => setAuthMode(mode)}
        onSubmit={handleAuth}
      />
    </div>
  )
}