import React, { useState, useEffect } from 'react';

export default function WhatsAppFloatingButton() {
  const phone = '+34613530642';
  const message = encodeURIComponent('¡Hola! Quiero contactar con Nebulosa Mágica.');
  const url = `https://wa.me/${phone.replace('+','')}/?text=${message}`;
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2500);
    }, 12000); // cada 12 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          zIndex: 9999,
          background: 'linear-gradient(135deg,#25d366 60%,#128c7e 100%)',
          color: '#fff',
          borderRadius: '50%',
          width: '64px',
          height: '64px',
          boxShadow: '0 4px 16px #128c7e88',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.2em',
          cursor: 'pointer',
          border: 'none',
          transition: 'box-shadow 0.2s',
        }}
        aria-label="Contactar por WhatsApp"
        title="Contactar por WhatsApp"
      >
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#25D366"/>
          <path d="M27.5 10.5C25.5 8.5 23.1 7.5 20.5 7.5C15.3 7.5 11 11.8 11 17C11 18.2 11.2 19.3 11.6 20.3L9.5 28.5L17.7 26.4C18.7 26.8 19.8 27 21 27C26.2 27 30.5 22.7 30.5 17.5C30.5 14.9 29.5 12.5 27.5 10.5ZM21 25C20 25 19.1 24.8 18.2 24.5L17.7 24.3L13.5 25.3L14.5 21.1L14.3 20.6C13.9 19.7 13.7 18.8 13.7 17.8C13.7 13.7 17.4 10 21.5 10C23.1 10 24.7 10.6 25.9 11.8C27.1 13 27.7 14.6 27.7 16.2C27.7 20.3 24 24 21 25Z" fill="white"/>
        </svg>
      </a>
      {showTooltip && (
        <div style={{
          position: 'fixed',
          bottom: '104px',
          right: '32px',
          zIndex: 10000,
          background: '#232946',
          color: '#fff',
          padding: '0.7em 1.2em',
          borderRadius: '12px',
          boxShadow: '0 2px 8px #23294688',
          fontSize: '1.08em',
          fontWeight: 500,
          pointerEvents: 'none',
          transition: 'opacity 0.3s',
        }}>
          ¿Tienes dudas? Contactar
        </div>
      )}
    </>
  );
}
