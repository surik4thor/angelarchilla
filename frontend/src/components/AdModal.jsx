import React, { useEffect } from 'react';

// Modal de anuncio para mostrar durante la carga de interpretación
export default function AdModal({ visible, onClose }) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      onClose();
    }, 10000); // 10 segundos
    return () => clearTimeout(timer);
  }, [visible, onClose]);

  if (!visible) return null;
  return (
    <div className="ad-modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="ad-modal-content" style={{
        background: '#fff', borderRadius: 16, padding: '2em', boxShadow: '0 4px 32px #0005', maxWidth: 420, textAlign: 'center', position: 'relative'
      }}>
        <h2 style={{ color: '#8b5cf6', marginBottom: '1em' }}>Publicidad</h2>
        {/* Aquí va el anuncio de AdSense, puedes personalizar el slot */}
        <ins className="adsbygoogle"
          style={{ display: 'block', minHeight: 90 }}
          data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
          data-ad-slot="1234567890"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>
        <p style={{ marginTop: '1.2em', color: '#232946' }}>
          Tu interpretación estará lista en unos segundos...
        </p>
      </div>
    </div>
  );
}
