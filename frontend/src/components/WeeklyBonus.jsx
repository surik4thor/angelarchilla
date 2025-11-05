import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import './WeeklyBonus.css';

/**
 * Componente para manejar bonos semanales de 8.99€
 * Permite acceso completo al plan Maestro por 7 días
 */
export default function WeeklyBonus() {
  const { user } = useAuth();
  const [bonusInfo, setBonusInfo] = useState(null);
  const [bonusStatus, setBonusStatus] = useState(null);
  const [userBonuses, setUserBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      loadBonusData();
    }
  }, [user]);

  const loadBonusData = async () => {
    try {
      setLoading(true);
      
      // Cargar información general sobre bonos
      const infoResponse = await fetch('/api/weekly-bonus/info');
      const infoData = await infoResponse.json();
      setBonusInfo(infoData.weeklyBonus);

      // Cargar estado de bonos del usuario
      const statusResponse = await fetch('/api/weekly-bonus/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setBonusStatus(statusData.bonusStatus);
      }

      // Cargar lista de bonos del usuario
      const listResponse = await fetch('/api/weekly-bonus/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (listResponse.ok) {
        const listData = await listResponse.json();
        setUserBonuses(listData.bonuses);
      }

    } catch (error) {
      console.error('Error cargando datos de bonos:', error);
      setError('Error al cargar información de bonos');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseBonus = async () => {
    if (!user) {
      setError('Debes iniciar sesión para comprar bonos');
      return;
    }

    try {
      setPurchasing(true);
      setError('');

      const response = await fetch('/api/weekly-bonus/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          paymentMethod: 'bizum'
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('¡Bono comprado exitosamente! Ahora puedes activarlo cuando desees.');
        await loadBonusData(); // Recargar datos
      } else {
        setError(data.message || 'Error al comprar el bono');
      }

    } catch (error) {
      console.error('Error comprando bono:', error);
      setError('Error al procesar la compra');
    } finally {
      setPurchasing(false);
    }
  };

  const handleActivateBonus = async (bonusId) => {
    try {
      setActivating(true);
      setError('');

      const response = await fetch(`/api/weekly-bonus/activate/${bonusId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('¡Bono activado! Ahora tienes acceso completo por una semana.');
        await loadBonusData(); // Recargar datos
      } else {
        setError(data.message || 'Error al activar el bono');
      }

    } catch (error) {
      console.error('Error activando bono:', error);
      setError('Error al activar el bono');
    } finally {
      setActivating(false);
    }
  };

  const formatTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;

    if (diff <= 0) return 'Expirado';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="weekly-bonus-container">
        <div className="loading">Cargando información de bonos...</div>
      </div>
    );
  }

  return (
    <div className="weekly-bonus-container">
      <div className="weekly-bonus-header">
        <h2>🎯 Bono Semanal Maestro</h2>
        <p className="bonus-subtitle">Acceso completo por solo {bonusInfo?.price}€ durante 7 días</p>
      </div>

      {error && (
        <div className="error-message">
          <span role="img" aria-label="error">❌</span> {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <span role="img" aria-label="success">✅</span> {success}
        </div>
      )}

      {/* Bono activo actual */}
      {bonusStatus?.hasActiveBonus && (
        <div className="active-bonus-card">
          <div className="active-bonus-header">
            <h3>🌟 Bono Activo</h3>
            <div className="bonus-badge active">ACTIVO</div>
          </div>
          <div className="active-bonus-info">
            <p><strong>Tiempo restante:</strong> {formatTimeRemaining(bonusStatus.activeBonus.expiresAt)}</p>
            <p><strong>Expira:</strong> {new Date(bonusStatus.activeBonus.expiresAt).toLocaleString()}</p>
            <div className="bonus-features">
              <span className="feature-tag">✨ Lecturas Ilimitadas</span>
              <span className="feature-tag">🔮 Todas las Barajas</span>
              <span className="feature-tag">🧠 IA Premium</span>
            </div>
          </div>
        </div>
      )}

      {/* Información del bono semanal */}
      {bonusInfo && (
        <div className="bonus-info-card">
          <h3>¿Qué incluye el Bono Semanal?</h3>
          <div className="bonus-price">
            <span className="price">{bonusInfo.price}€</span>
            <span className="duration">por {bonusInfo.duration}</span>
          </div>
          
          <div className="bonus-features-list">
            {bonusInfo.features.map((feature, index) => (
              <div key={index} className="feature-item">
                <span className="feature-icon">✅</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {!bonusStatus?.hasActiveBonus && (
            <button 
              className="purchase-bonus-btn"
              onClick={handlePurchaseBonus}
              disabled={purchasing}
            >
              {purchasing ? 'Procesando...' : `Comprar Bono por ${bonusInfo.price}€`}
            </button>
          )}
        </div>
      )}

      {/* Bonos comprados pero no activados */}
      {userBonuses.filter(b => b.status === 'PURCHASED').length > 0 && (
        <div className="purchased-bonuses">
          <h3>Bonos Disponibles para Activar</h3>
          {userBonuses
            .filter(b => b.status === 'PURCHASED')
            .map(bonus => (
              <div key={bonus.id} className="bonus-card purchased">
                <div className="bonus-card-header">
                  <span className="bonus-amount">{bonus.amount}€</span>
                  <span className="bonus-badge purchased">COMPRADO</span>
                </div>
                <p>Comprado: {new Date(bonus.purchaseDate).toLocaleDateString()}</p>
                <button 
                  className="activate-bonus-btn"
                  onClick={() => handleActivateBonus(bonus.id)}
                  disabled={activating || bonusStatus?.hasActiveBonus}
                >
                  {activating ? 'Activando...' : 'Activar Ahora'}
                </button>
                {bonusStatus?.hasActiveBonus && (
                  <p className="activation-note">
                    Espera a que expire tu bono actual para activar este
                  </p>
                )}
              </div>
            ))
          }
        </div>
      )}

      {/* Historial de bonos */}
      {userBonuses.length > 0 && (
        <div className="bonus-history">
          <h3>Historial de Bonos</h3>
          <div className="bonus-list">
            {userBonuses.map(bonus => (
              <div key={bonus.id} className={`bonus-card ${bonus.status.toLowerCase()}`}>
                <div className="bonus-card-header">
                  <span className="bonus-amount">{bonus.amount}€</span>
                  <span className={`bonus-badge ${bonus.status.toLowerCase()}`}>
                    {bonus.status}
                  </span>
                </div>
                <div className="bonus-details">
                  <p><strong>Comprado:</strong> {new Date(bonus.purchaseDate).toLocaleDateString()}</p>
                  {bonus.activatedAt && (
                    <p><strong>Activado:</strong> {new Date(bonus.activatedAt).toLocaleDateString()}</p>
                  )}
                  {bonus.expiresAt && (
                    <p><strong>Expira:</strong> {new Date(bonus.expiresAt).toLocaleDateString()}</p>
                  )}
                  <p><strong>Pago:</strong> {bonus.paymentMethod}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to action si no tiene bonos */}
      {!bonusStatus?.hasActiveBonus && userBonuses.length === 0 && (
        <div className="cta-card">
          <h3>🚀 ¡Desbloquea todo el potencial de Nebulosa Mágica!</h3>
          <p>Con el Bono Semanal tendrás acceso completo a todas las funciones premium durante 7 días completos.</p>
          <ul>
            <li>🔮 Todas las barajas de tarot (Ángeles, Egipcio, Rider-Waite, Marsella)</li>
            <li>♾️ Lecturas ilimitadas</li>
            <li>🧠 Interpretaciones premium con IA avanzada</li>
            <li>⭐ Soporte prioritario</li>
          </ul>
          <p className="cta-price">Todo por solo <strong>{bonusInfo?.price}€</strong></p>
        </div>
      )}
    </div>
  );
}