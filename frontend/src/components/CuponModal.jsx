import React, { useState } from 'react';
import '../styles/CuponModal.css';

const CuponModal = ({ isOpen, onClose, couponData, onClaim, user }) => {
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const handleClaim = async () => {
    if (!user) {
      alert('Debes iniciar sesión para reclamar el cupón');
      return;
    }

    setClaiming(true);
    try {
      await onClaim(couponData.code);
      setClaimed(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      alert('Error al reclamar el cupón. Inténtalo de nuevo.');
    } finally {
      setClaiming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="coupon-modal-overlay" onClick={onClose}>
      <div className="coupon-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        <div className="coupon-header">
          <div className="coupon-icon">🎁</div>
          <h2>{couponData.title}</h2>
          <div className="coupon-code">
            Código: <span>{couponData.code}</span>
          </div>
        </div>

        <div className="coupon-description">
          <h3>{couponData.description}</h3>
          <p>¡Felicidades! Has encontrado un cupón especial que te otorga acceso completo a Nebulosa Mágica por una semana.</p>
        </div>

        <div className="coupon-benefits">
          <h4>✨ Lo que incluye tu prueba gratuita:</h4>
          <ul>
            {couponData.benefits.map((benefit, index) => (
              <li key={index}>✓ {benefit}</li>
            ))}
          </ul>
        </div>

        <div className="coupon-validity">
          <p>⏰ <strong>Válido por tiempo limitado</strong></p>
          <p>🔒 Solo para nuevos usuarios del Plan MAESTRO</p>
        </div>

        {!claimed ? (
          <div className="coupon-actions">
            {user ? (
              <button 
                className={`claim-btn ${claiming ? 'claiming' : ''}`}
                onClick={handleClaim}
                disabled={claiming}
              >
                {claiming ? '⏳ Activando...' : '🚀 Activar Cupón Ahora'}
              </button>
            ) : (
              <div className="login-required">
                <p>Inicia sesión para reclamar tu cupón</p>
                <a href="/login" className="login-btn">
                  Iniciar Sesión
                </a>
              </div>
            )}
            <button className="save-btn" onClick={() => navigator.clipboard?.writeText(couponData.code)}>
              📋 Copiar Código
            </button>
          </div>
        ) : (
          <div className="coupon-success">
            <div className="success-icon">🎉</div>
            <h3>¡Cupón Activado!</h3>
            <p>Tu prueba gratuita del Plan MAESTRO ha comenzado. ¡Disfruta de 7 días de acceso completo!</p>
          </div>
        )}

        <div className="coupon-footer">
          <small>
            * El cupón se aplica automáticamente a tu cuenta. 
            Los 7 días comienzan desde el momento de la activación.
          </small>
        </div>
      </div>
    </div>
  );
};

export default CuponModal;