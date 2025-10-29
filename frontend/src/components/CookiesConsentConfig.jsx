import React, { useState, useEffect } from 'react';

const COOKIES_KEY = 'cookiesConsentConfig';

export default function CookiesConsentConfig() {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState({
    technical: true,
    analytics: false,
    personalization: false
  });
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(COOKIES_KEY);
    if (!saved) setVisible(true);
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIES_KEY, JSON.stringify({ technical: true, analytics: true, personalization: true }));
    setVisible(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem(COOKIES_KEY, JSON.stringify({ technical: true, analytics: false, personalization: false }));
    setVisible(false);
  };

  const handleSaveConfig = () => {
    localStorage.setItem(COOKIES_KEY, JSON.stringify(config));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className='cookies-consent'>
      <span>
        Utilizamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y personalizar el contenido. Puedes consultar nuestra <a href="/privacy" style={{ color: '#f4d03f', textDecoration: 'underline' }}>Política de Privacidad y Cookies</a>.
      </span>
      {!showConfig ? (
        <div style={{ marginTop: '0.7rem', display: 'flex', gap: '0.7rem' }}>
          <button onClick={handleAcceptAll} style={{ background: '#d4af37', color: '#232946', border: 'none', borderRadius: '6px', padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-btn)' }}>Aceptar todas</button>
          <button onClick={handleRejectAll} style={{ background: '#adb5bd', color: '#232946', border: 'none', borderRadius: '6px', padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-btn)' }}>Rechazar todas</button>
          <button onClick={() => setShowConfig(true)} style={{ background: '#232946', color: '#f4d03f', border: '1px solid #f4d03f', borderRadius: '6px', padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-btn)' }}>Configurar</button>
        </div>
      ) : (
        <div style={{ marginTop: '0.7rem', background: '#181a2a', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 8px #0002', minWidth: 260 }}>
          <label style={{ display: 'block', marginBottom: '0.7rem' }}>
            <input type="checkbox" checked disabled /> Cookies técnicas (siempre activas)
          </label>
          <label style={{ display: 'block', marginBottom: '0.7rem' }}>
            <input type="checkbox" checked={config.analytics} onChange={e => setConfig(c => ({ ...c, analytics: e.target.checked }))} /> Cookies de análisis
          </label>
          <label style={{ display: 'block', marginBottom: '0.7rem' }}>
            <input type="checkbox" checked={config.personalization} onChange={e => setConfig(c => ({ ...c, personalization: e.target.checked }))} /> Cookies de personalización
          </label>
          <div style={{ display: 'flex', gap: '0.7rem', marginTop: '0.7rem' }}>
            <button onClick={handleSaveConfig} style={{ background: '#d4af37', color: '#232946', border: 'none', borderRadius: '6px', padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-btn)' }}>Guardar configuración</button>
            <button onClick={() => setShowConfig(false)} style={{ background: '#adb5bd', color: '#232946', border: 'none', borderRadius: '6px', padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-btn)' }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
