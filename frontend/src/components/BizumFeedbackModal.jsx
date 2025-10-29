import React, { useState } from 'react';

export default function BizumFeedbackModal({ visible, onClose, onSubmit }) {
  const [opinion, setOpinion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!visible) return null;

  const handleSend = () => {
    if (opinion.trim().length < 3) return;
    setSubmitted(true);
    if (onSubmit) onSubmit(opinion);
    setTimeout(() => {
      setSubmitted(false);
      setOpinion('');
      onClose();
    }, 2000);
  };

  return (
    <div className="ad-modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="ad-modal-content" style={{
        background: '#fff', borderRadius: 16, padding: '2em', boxShadow: '0 4px 32px #0005', maxWidth: 420, textAlign: 'center', position: 'relative'
      }}>
        <h2 style={{ color: '#16a34a', marginBottom: '1em' }}>¿Te gustaría pagar con Bizum?</h2>
        <p style={{ marginBottom: '1em', color: '#232946' }}>
          Cuéntanos si prefieres Bizum como método de pago. ¡Tu opinión nos ayuda!
        </p>
        {submitted ? (
          <p style={{ color: '#16a34a', fontWeight: 'bold' }}>¡Gracias por tu opinión!</p>
        ) : (
          <>
            <textarea
              value={opinion}
              onChange={e => setOpinion(e.target.value)}
              rows={3}
              style={{ width: '100%', borderRadius: 8, padding: 8, marginBottom: 12 }}
              placeholder="Escribe tu opinión..."
              disabled={submitted}
            />
            <button
              onClick={handleSend}
              disabled={opinion.trim().length < 3 || submitted}
              style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7em 1.5em', fontWeight: 'bold', cursor: 'pointer' }}
            >Enviar opinión</button>
          </>
        )}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}
        >×</button>
      </div>
    </div>
  );
}
