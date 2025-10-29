import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import '../styles/AuthModal.css';

export default function AuthModal({ isOpen, mode, onClose, onSwitchMode }) {
  const { login, register, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  // Reset form cuando cambia el modo
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        birthDate: ''
      });
      setErrors({});
      setSuccess('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, mode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validación de email
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Validación de contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validaciones específicas para registro
    if (mode === 'signup') {
      if (!formData.username) {
        newErrors.username = 'El nombre de usuario es requerido';
      } else if (formData.username.length < 3) {
        newErrors.username = 'El nombre debe tener al menos 3 caracteres';
      }

      if (!formData.birthDate) {
        newErrors.birthDate = 'La fecha de nacimiento es requerida';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirma tu contraseña';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setSuccess('');

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        setSuccess('¡Bienvenido de vuelta!');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        await register(formData.username, formData.email, formData.password, formData.birthDate);
        setSuccess('¡Cuenta creada exitosamente! Iniciando sesión...');
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      setErrors({
        general: error.message || 'Ha ocurrido un error. Por favor, inténtalo de nuevo.'
      });
    }
  };

  const switchMode = () => {
    const newMode = mode === 'login' ? 'signup' : 'login';
    onSwitchMode(newMode);
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header del modal */}
        <div className="auth-modal-header">
          <h2 className="auth-modal-title">
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <button 
            className="auth-modal-close"
            onClick={onClose}
            disabled={loading}
          >
            <span role="img" aria-label="Cancelar">❌</span>
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="auth-modal-body">
          {/* Mensaje de éxito */}
          {success && (
            <div className="auth-alert auth-alert-success">
              <span role="img" aria-label="Éxito">✅</span>
              {success}
            </div>
          )}

          {/* Error general */}
          {errors.general && (
            <div className="auth-alert auth-alert-error">
              <span role="img" aria-label="Error">⚠️</span>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Campo Username (solo en registro) */}
            {mode === 'signup' && (
              <>
                <div className="auth-form-group">
                  <label htmlFor="username" className="auth-form-label">
                    Nombre de Usuario
                  </label>
                  <div className="auth-input-container">
                    <span role="img" aria-label="Usuario" className="auth-input-icon">👤</span>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`auth-form-input ${errors.username ? 'auth-input-error' : ''}`}
                      placeholder="Tu nombre de usuario"
                      disabled={loading}
                    />
                  </div>
                  {errors.username && (
                    <span className="auth-error-message">{errors.username}</span>
                  )}
                </div>
              </>
            )}

            {/* Campo Email */}
            <div className="auth-form-group">
              <label htmlFor="email" className="auth-form-label">
                Email
              </label>
              <div className="auth-input-container">
                <span role="img" aria-label="Email" className="auth-input-icon">✉️</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`auth-form-input ${errors.email ? 'auth-input-error' : ''}`}
                  placeholder="tu@email.com"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <span className="auth-error-message">{errors.email}</span>
              )}
            </div>

            {/* Campo Contraseña */}
            <div className="auth-form-group">
              <label htmlFor="password" className="auth-form-label">
                Contraseña
              </label>
              <div className="auth-input-container">
                <span role="img" aria-label="Contraseña" className="auth-input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`auth-form-input ${errors.password ? 'auth-input-error' : ''}`}
                  placeholder="Tu contraseña"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <span role="img" aria-label={showPassword ? "Ocultar" : "Mostrar"}>{showPassword ? "🙈" : "👁️"}</span>
                </button>
              </div>
              {errors.password && (
                <span className="auth-error-message">{errors.password}</span>
              )}
            </div>

            {/* Campo Confirmar Contraseña (solo en registro) */}
            {mode === 'signup' && (
              <div className="auth-form-group">
                <label htmlFor="confirmPassword" className="auth-form-label">
                  Confirmar Contraseña
                </label>
                <div className="auth-input-container">
                  <span role="img" aria-label="Contraseña" className="auth-input-icon">🔒</span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`auth-form-input ${errors.confirmPassword ? 'auth-input-error' : ''}`}
                    placeholder="Confirma tu contraseña"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    <span role="img" aria-label={showConfirmPassword ? "Ocultar" : "Mostrar"}>{showConfirmPassword ? "🙈" : "👁️"}</span>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="auth-error-message">{errors.confirmPassword}</span>
                )}
              </div>
            )}

            {/* Botón Submit */}
            <button 
              type="submit" 
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span role="img" aria-label="Cargando" className="emoji-spinner">⏳</span>
                  {mode === 'login' ? 'Iniciando sesión...' : 'Creando cuenta...'}
                </>
              ) : (
                mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'
              )}
            </button>
          </form>
        </div>

        {/* Footer del modal */}
        <div className="auth-modal-footer">
          <p>
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button 
              className="auth-switch-button"
              onClick={switchMode}
              disabled={loading}
            >
              {mode === 'login' ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}