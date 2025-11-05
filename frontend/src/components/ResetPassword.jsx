import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/apiClient.js';
import '../styles/Auth.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Extraer token de la URL
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      validateToken(tokenFromUrl);
    } else {
      setError('Token de recuperación no encontrado en la URL');
      setIsValidating(false);
    }
  }, [searchParams]);

  // Validar token al cargar
  const validateToken = async (tokenToValidate) => {
    try {
      const response = await api.get(`/api/auth/validate-reset-token/${tokenToValidate}`);
      setTokenValid(true);
      setUserEmail(response.data.email);
    } catch (error) {
      console.error('Error validando token:', error);
      if (error.response?.data?.expired) {
        setError('El enlace de recuperación ha expirado. Solicita uno nuevo.');
      } else {
        setError('El enlace de recuperación no es válido. Solicita uno nuevo.');
      }
      setTokenValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    // Validaciones
    if (!password || !confirmPassword) {
      setError('Todos los campos son obligatorios');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    // Validación de seguridad de contraseña
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    if (!hasNumber || !hasLetter) {
      setError('La contraseña debe contener al menos una letra y un número');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/reset-password', {
        token,
        password
      });
      
      setMessage(response.data.message);
      setIsSuccess(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login', { 
          state: { message: '¡Contraseña restablecida! Ya puedes iniciar sesión.' }
        });
      }, 3000);
      
    } catch (error) {
      console.error('Error restableciendo contraseña:', error);
      
      if (error.response?.data?.expired) {
        setError('El enlace de recuperación ha expirado. Solicita uno nuevo.');
      } else {
        setError(error.response?.data?.error || 'Error restableciendo contraseña. Inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-loading">
            <span className="spinner"></span>
            <p>Validando enlace de recuperación...</p>
          </div>
        </div>
      </div>
    );
  }

  // Token invalid or expired
  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-error-state">
            <div className="error-icon">❌</div>
            <h3>Enlace no válido</h3>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              <Link to="/forgot-password" className="btn-primary">
                Solicitar nuevo enlace
              </Link>
              <Link to="/login" className="btn-secondary">
                Volver al login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">🔐</div>
          <h1>Nueva Contraseña</h1>
          <p>
            Creando nueva contraseña para: <strong>{userEmail}</strong>
          </p>
        </div>

        {/* Success Message */}
        {isSuccess ? (
          <div className="auth-success">
            <div className="success-icon">✅</div>
            <h3>¡Contraseña restablecida!</h3>
            <p className="success-message">{message}</p>
            <p className="success-redirect">
              Redirigiendo al login en 3 segundos...
            </p>
            <Link to="/login" className="btn-primary">
              Ir al Login ahora
            </Link>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="password">Nueva Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className={error ? 'error' : ''}
              />
              <small className="form-hint">
                Debe contener al menos una letra y un número
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                required
                className={error ? 'error' : ''}
              />
            </div>

            {/* Password strength indicator */}
            {password && (
              <div className="password-strength">
                <div className="strength-checks">
                  <div className={`check ${password.length >= 6 ? 'valid' : 'invalid'}`}>
                    {password.length >= 6 ? '✅' : '❌'} Al menos 6 caracteres
                  </div>
                  <div className={`check ${/[a-zA-Z]/.test(password) ? 'valid' : 'invalid'}`}>
                    {/[a-zA-Z]/.test(password) ? '✅' : '❌'} Contiene letras
                  </div>
                  <div className={`check ${/\d/.test(password) ? 'valid' : 'invalid'}`}>
                    {/\d/.test(password) ? '✅' : '❌'} Contiene números
                  </div>
                  {confirmPassword && (
                    <div className={`check ${password === confirmPassword ? 'valid' : 'invalid'}`}>
                      {password === confirmPassword ? '✅' : '❌'} Las contraseñas coinciden
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="auth-error">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className={`auth-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Restableciendo...
                </>
              ) : (
                <>
                  🔐 Restablecer Contraseña
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="auth-footer">
          <p>
            ¿Recordaste tu contraseña?{' '}
            <Link to="/login" className="auth-link">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;