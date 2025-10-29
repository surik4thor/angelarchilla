import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

export default function AuthModal({ isOpen, mode, error, loading, onClose, onSwitchMode, onSubmit }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [acceptLegal, setAcceptLegal] = useState(false)
  const [acceptNewsletter, setAcceptNewsletter] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setEmail('')
      setPassword('')
      setUsername('')
      setBirthDate('')
    }
  }, [isOpen, mode])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'signup' && !acceptLegal) {
      setFormError('Debes aceptar los términos legales para registrarte.');
      return;
    }
    if (mode === 'signup' && !acceptNewsletter) {
      setFormError('Debes aceptar la recepción de newsletter/promociones para registrarte.');
      return;
    }
    setFormError('');
    const result = await onSubmit({
      email,
      password,
      username,
      birthDate,
      acceptLegal,
      acceptNewsletter
    });
    // Si el login fue exitoso, navega al perfil
    if (result && result.success !== false) {
      navigate('/profile');
      onClose();
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" role="dialog" style={{fontFamily: 'var(--font-base)', background: 'linear-gradient(135deg, #2d186c 0%, #18121e 100%)', border: '2px solid #d4af37', borderRadius: '18px', boxShadow: '0 0 32px #8b5cf6'}}>
        <div className="modal-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <h2 style={{fontFamily: 'var(--font-title)', color: '#d4af37', fontWeight: 700, fontSize: '1.7rem', letterSpacing: '2px', textShadow: '0 0 12px #8b5cf6'}}>
            <span style={{verticalAlign:'middle',marginRight:'0.5em'}}>
              <svg width="28" height="28" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="19" cy="19" r="16" fill="#8b5cf6" fillOpacity="0.18" />
                <path d="M19 6 L22 16 L32 19 L22 22 L19 32 L16 22 L6 19 L16 16 Z" stroke="#d4af37" strokeWidth="2.2" fill="#d4af37" fillOpacity="0.7" />
              </svg>
            </span>
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <button onClick={onClose} aria-label="Cerrar" style={{fontSize:'1.5em',color:'#d4af37',background:'none',border:'none',cursor:'pointer'}}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{marginTop:'1em'}}>
          <label style={{color:'#d4af37'}}>Email</label>
          <input
            type="email"
            required
            value={email}
            autoComplete="username"
            onChange={e => setEmail(e.target.value)}
            style={{border:'1.5px solid #8b5cf6',borderRadius:'8px',padding:'0.7em 1em',fontSize:'1.05rem',fontFamily:'var(--font-sans)',marginBottom:'0.7em',width:'100%',background:'#18121e',color:'#e6d7c3'}}
          />

          {mode === 'signup' && (
            <>
              <label style={{color:'#d4af37'}}>Usuario</label>
              <input
                type="text"
                value={username}
                autoComplete="username"
                onChange={e => setUsername(e.target.value)}
                style={{border:'1.5px solid #8b5cf6',borderRadius:'8px',padding:'0.7em 1em',fontSize:'1.05rem',fontFamily:'var(--font-sans)',marginBottom:'0.7em',width:'100%',background:'#18121e',color:'#e6d7c3'}}
              />
              <label style={{color:'#d4af37'}}>Fecha de nacimiento</label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                style={{border:'1.5px solid #8b5cf6',borderRadius:'8px',padding:'0.7em 1em',fontSize:'1.05rem',fontFamily:'var(--font-sans)',marginBottom:'0.7em',width:'100%',background:'#18121e',color:'#e6d7c3'}}
              />
              <div style={{marginTop:'1em'}}>
                <label style={{display:'flex',alignItems:'center',color:'#e6d7c3'}}>
                  <input
                    type="checkbox"
                    checked={acceptLegal}
                    onChange={e => setAcceptLegal(e.target.checked)}
                    required
                  />
                  <span style={{marginLeft:'0.5em'}}>
                    He leído y acepto los <a href="/terms" target="_blank" rel="noopener noreferrer" style={{color:'#d4af37'}}>Términos</a>, <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{color:'#d4af37'}}>Privacidad</a> y <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{color:'#d4af37'}}>Cookies</a>.
                  </span>
                </label>
                <label style={{display:'flex',alignItems:'center',marginTop:'0.5em',color:'#e6d7c3'}}>
                  <input
                    type="checkbox"
                    checked={acceptNewsletter}
                    onChange={e => setAcceptNewsletter(e.target.checked)}
                    required
                  />
                  <span style={{marginLeft:'0.5em'}}>
                    Consiento recibir la newsletter y promociones de Nebulosa Mágica.
                  </span>
                </label>
              </div>
            </>
          )}

          <label style={{color:'#d4af37'}}>Contraseña</label>
          <input
            type="password"
            required
            value={password}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            onChange={e => setPassword(e.target.value)}
            style={{border:'1.5px solid #8b5cf6',borderRadius:'8px',padding:'0.7em 1em',fontSize:'1.05rem',fontFamily:'var(--font-sans)',marginBottom:'0.7em',width:'100%',background:'#18121e',color:'#e6d7c3'}}
          />

          {error && <div className="error-msg" style={{color:'#ec4899',margin:'0.5em 0',fontFamily:'var(--font-title)'}}>{error}</div>}

          {formError && <div style={{color:'#ec4899',margin:'0.5em 0',fontFamily:'var(--font-title)'}}>{formError}</div>}
          <button type="submit" className="btn-primary" disabled={loading} style={{marginTop:'1em', fontFamily: 'var(--font-btn)'}}>
            {loading
              ? 'Procesando...'
              : mode === 'login'
              ? 'Entrar'
              : 'Registrarse'}
          </button>
        </form>
        <div className="switch-mode" style={{marginTop:'1.2em',textAlign:'center',color:'#b3bcdf',fontFamily:'var(--font-base)'}}>
          {mode === 'login' ? (
            <span onClick={() => onSwitchMode('signup')} style={{cursor:'pointer'}}>
              ¿No tienes cuenta? <b style={{color:'#d4af37'}}>Regístrate</b>
            </span>
          ) : (
            <span onClick={() => onSwitchMode('login')} style={{cursor:'pointer'}}>
              ¿Ya tienes cuenta? <b style={{color:'#d4af37'}}>Entra</b>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}