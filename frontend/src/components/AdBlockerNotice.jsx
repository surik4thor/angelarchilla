import React, { useEffect, useState } from 'react';

export default function AdBlockerNotice() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    // Creamos un elemento "bait" que los adblockers suelen ocultar
    const bait = document.createElement('div');
    bait.className = 'adsbox';
    bait.style.height = '1px';
    bait.style.position = 'absolute';
    bait.style.left = '-9999px';
    document.body.appendChild(bait);
    setTimeout(() => {
      if (window.getComputedStyle(bait).display === 'none' || bait.offsetParent === null) {
        setBlocked(true);
      }
      document.body.removeChild(bait);
    }, 500);
  }, []);

  if (!blocked) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      background: '#f4d03f',
      color: '#232946',
      zIndex: 99999,
      padding: '1.2rem 1rem',
      boxShadow: '0 2px 12px #0002',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'var(--font-base)',
      fontSize: '1.1rem'
    }}>
      <span>
        ¡Hola! Parece que tienes un bloqueador de anuncios activado.<br />
        En <b>Nebulosa Mágica</b> los anuncios nos ayudan a ofrecerte la experiencia gratuita.<br />
        Si prefieres navegar sin anuncios, puedes suscribirte a un plan premium.<br />
        ¡Gracias por apoyar el proyecto!
      </span>
    </div>
  );
}
