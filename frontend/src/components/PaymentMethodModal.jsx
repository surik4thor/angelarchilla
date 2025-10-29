import React, { useState, useEffect } from 'react';
import './PaymentMethodModal.css';

export default function PaymentMethodModal({ isOpen, onClose, onSelect, planName, period = 'monthly', price = null }) {
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [selectedPrice, setSelectedPrice] = useState(price);

  useEffect(() => {
    setSelectedPeriod(period);
    setSelectedPrice(price);
  }, [period, price]);

  // Si price es objeto, extraer mensual/anual
  const priceMonthly = typeof price === 'object' ? price?.monthly : price;
  const priceAnnual = typeof price === 'object' ? price?.annual : price;

  if (!isOpen) return null;
  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <h3 style={{fontFamily: 'var(--font-title)'}}>Selecciona tu suscripción</h3>
        <p style={{fontFamily: 'var(--font-base)'}}>Suscripción a: <b>{planName}</b></p>
        <div style={{ display: 'flex', gap: '1em', justifyContent: 'center', margin: '1em 0' }}>
          <button
            className={`period-btn${selectedPeriod === 'monthly' ? ' selected' : ''}`}
            onClick={() => { setSelectedPeriod('monthly'); setSelectedPrice(priceMonthly); }}
            style={{ padding: '0.5em 1.2em', borderRadius: '8px', border: selectedPeriod === 'monthly' ? '2px solid #8b5cf6' : '1px solid #ccc', background: selectedPeriod === 'monthly' ? '#f6f2ff' : '#fff', fontWeight: 500, fontFamily: 'var(--font-btn)' }}
          >
            Mensual
            {priceMonthly && <span style={{ marginLeft: 8, color: '#232946', fontFamily: 'var(--font-base)' }}>({priceMonthly} €/mes)</span>}
          </button>
          <button
            className={`period-btn${selectedPeriod === 'annual' ? ' selected' : ''}`}
            onClick={() => { setSelectedPeriod('annual'); setSelectedPrice(priceAnnual); }}
            style={{ padding: '0.5em 1.2em', borderRadius: '8px', border: selectedPeriod === 'annual' ? '2px solid #f4d03f' : '1px solid #ccc', background: selectedPeriod === 'annual' ? '#fffbe6' : '#fff', fontWeight: 500, fontFamily: 'var(--font-btn)' }}
          >
            Anual <span style={{ color: '#f4d03f', fontWeight: 600 }}>-17%</span>
            {priceAnnual && <span style={{ marginLeft: 8, color: '#232946', fontFamily: 'var(--font-base)' }}>({priceAnnual} €/año)</span>}
          </button>
        </div>
        {selectedPeriod === 'annual' && (
          <div style={{ color: '#f4d03f', fontWeight: 600, textAlign: 'center', marginBottom: '0.7em', fontFamily: 'var(--font-base)' }}>
            ¡Ahorra 17% pagando anual!
          </div>
        )}
        <div className="payment-options">
          <button className="payment-btn stripe" onClick={() => onSelect('stripe', selectedPeriod)} style={{fontFamily: 'var(--font-btn)'}}>
            Pagar con Stripe ({selectedPrice} € {selectedPeriod === 'annual' ? '/año' : '/mes'})
          </button>
        </div>
        <button className="close-btn" onClick={onClose} style={{fontFamily: 'var(--font-btn)'}}>Cancelar</button>
      </div>
    </div>
  );
}