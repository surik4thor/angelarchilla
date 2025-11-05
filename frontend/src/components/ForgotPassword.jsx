import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/apiClient.js';
import '../styles/Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (!email) {
      setError('Por favor, introduce tu email');
      setIsLoading(false);
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, introduce un email válido');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      
      setMessage(response.data.message);
      setIsSuccess(true);
      
    } catch (error) {
      console.error('Error solicitud recuperación:', error);
      
      if (error.response?.status === 429) {
        setError(error.response.data.error);
      } else {
        setError('Error enviando solicitud. Inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">🔮</div>
          <h1>Recuperar Contraseña</h1>
          <p>Introduce tu email y te enviaremos un enlace para restablecer tu contraseña</p>
        </div>

        {/* Success Message */}
        {isSuccess ? (
          <div className="auth-success">
            <div className="success-icon">✅</div>
            <h3>¡Enlace enviado!</h3>
            <p className="success-message">{message}</p>
            <div className="success-actions">
              <Link to="/login" className="btn-secondary">
                Volver al Login
              </Link>
              <button 
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                  setMessage('');
                }} 
                className="btn-link"
              >
                Enviar a otro email
              </button>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className={error ? 'error' : ''}
              />
            </div>

            {error && (
              <div className="auth-error">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {message && !isSuccess && (
              <div className="auth-info">
                <span className="info-icon">ℹ️</span>
                {message}
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
                  Enviando...
                </>
              ) : (
                <>
                  📧 Enviar enlace de recuperación
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
          <p>
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="auth-link">
              Registrarse
            </Link>
          </p>
        </div>

        {/* Help */}
        <div className="auth-help">
          <details>
            <summary>¿Necesitas ayuda?</summary>
            <div className="help-content">
              <h4>Problemas comunes:</h4>
              <ul>
                <li><strong>No recibo el email:</strong> Revisa tu carpeta de spam</li>
                <li><strong>El enlace no funciona:</strong> Asegúrate de usar el más reciente</li>
                <li><strong>El enlace expiró:</strong> Solicita uno nuevo (expiran en 1 hora)</li>
              </ul>
              <p>
                <strong>¿Sigues teniendo problemas?</strong><br/>
                Contacta con soporte: <a href="mailto:soporte@nebulosamagica.com">soporte@nebulosamagica.com</a>
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;