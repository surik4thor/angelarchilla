import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import AdModal from '../components/AdModal.jsx';
import '../styles/Reading.css';
import '../styles/DreamInterpretation.css';
import CanvasExporter from '../components/CanvasExporter.jsx';

const FEELINGS = [
  { key: 'calma', label: 'Calma' },
  { key: 'tristeza', label: 'Tristeza' },
  { key: 'alegria', label: 'Alegría' },
  { key: 'miedo', label: 'Miedo' },
  { key: 'preocupacion', label: 'Preocupación' },
  { key: 'otros', label: 'Otros' }
];

export default function DreamInterpretation() {

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
  const { user } = useAuth();
  const [dreamText, setDreamText] = useState('');
  const [dreamDate, setDreamDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [feelings, setFeelings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [result, setResult] = useState(null);
  const [limitMessage, setLimitMessage] = useState('');
  const [isLimited, setIsLimited] = useState(null);
  const [loadingLimit, setLoadingLimit] = useState(false);
  const [exportTrigger, setExportTrigger] = useState(false);
  const [exportedImage, setExportedImage] = useState(null);

  // Chequeo de límite premium para sueños
  useEffect(() => {
    setLoadingLimit(true);
    const token = localStorage.getItem('arcanaToken');
  fetch('/api/readings/limit-status?type=dreams', {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(json => {
        setIsLimited(!!json.limited);
        setLimitMessage(json.limited ? (json.message || 'Has alcanzado el límite de interpretaciones de sueños para tu plan.') : '');
      })
      .catch(() => setIsLimited(false))
      .finally(() => setLoadingLimit(false));
  }, []);

  const handleFeelingChange = (key) => {
    setFeelings(f => f.includes(key) ? f.filter(x => x !== key) : [...f, key]);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLimited) return;
    if (dreamText.trim().length < 10) {
      setLimitMessage('Describe tu sueño con al menos 10 caracteres.');
      setIsLimited(true);
      return;
    }
    setLoading(true);
    const showAds = !user || !['ADEPTO', 'MAESTRO'].includes((user.subscriptionPlan || '').toUpperCase());
    if (showAds) setShowAdModal(true);
    try {
      // Llamada premium: endpoint exclusivo sueños
      const payload = {
        text: dreamText,
        feelings: feelings.join(','),
        date: new Date(dreamDate).toISOString()
      };
      const res = await fetch('/api/dreams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('arcanaToken') ? { Authorization: `Bearer ${localStorage.getItem('arcanaToken')}` } : {})
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      const json = await res.json();
      if (json.dream && json.dream.interpretation) {
        setResult(json.dream.interpretation);
      } else {
        setResult('No se pudo obtener interpretación.');
      }
      setLoading(false);
      setShowAdModal(false);
    } catch (err) {
      setLoading(false);
      setShowAdModal(false);
      setResult('Error al interpretar el sueño. Intenta de nuevo.');
    }
  };

  const handleExport = () => {
    setExportTrigger(true);
  };
  React.useEffect(() => {
    if (exportedImage) {
      const file = dataURLtoFile(exportedImage, 'interpretacion-sueno.png');
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          title: 'Mi interpretación de Sueño',
          text: 'Mira mi interpretación premium en ArcanaClub',
          files: [file]
        }).catch(() => {
          // Si falla el share, descarga la imagen
          const link = document.createElement('a');
          link.href = exportedImage;
          link.download = 'interpretacion-sueno.png';
          link.click();
        });
      } else {
        // Si no soporta share, descarga la imagen
        const link = document.createElement('a');
        link.href = exportedImage;
        link.download = 'interpretacion-sueno.png';
        link.click();
        alert('Tu navegador no soporta compartir imágenes directamente. La imagen se ha descargado.');
      }
      setExportTrigger(false);
      setExportedImage(null);
    }
  }, [exportedImage]);

  function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1].replace(/\s/g, '')),
      n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){ u8arr[n] = bstr.charCodeAt(n); }
    return new File([u8arr], filename, {type:mime});
  }

  const showAds = !user || !['ADEPTO', 'MAESTRO'].includes((user?.subscriptionPlan || '').toUpperCase());
  if (loading || loadingLimit || isLimited === null) {
    return (
      <>
        {showAds && <AdModal visible={showAdModal} onClose={() => setShowAdModal(false)} />}
        <div className="reading-loading">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  return (
    <main className="reading-container">
      <div className="reading-header">
        <h1>Interpretación de Sueños Premium</h1>
        <p>Descubre el mensaje oculto de tu subconsciente con ayuda de la IA y la sabiduría onírica.</p>
      </div>
      <div className="reading-content">
        {isLimited === true ? (
          <div className="step-container limit-reached">
            <div className="limit-message-block center-text">
              <span role="img" aria-label="Límite" className="limit-icon" style={{fontSize:'1.3em'}}>❓</span>
              <h2 className="limit-title">Has alcanzado tu límite de interpretaciones de sueños</h2>
              <p className="limit-desc dream-bg">
                {!user ? 'Debes iniciar sesión para interpretar sueños.' : limitMessage}
              </p>
              <button className="subscribe-btn" onClick={()=>window.location.href='/planes'}>
                <span role="img" aria-label="Premium" className="mr-half" style={{fontSize:'1.2em'}}>⭐</span>
                Ver Planes y Suscribirse
              </button>
            </div>
          </div>
        ) : (
          result ? (
            <section className="dream-result premium-box dream-result-box">
              <h3 className="dream-result-title">Interpretación de tu sueño</h3>
              <p>{result}</p>
              <button className="share-btn" onClick={handleExport}>
                <span role="img" aria-label="Compartir" style={{fontSize:'1.2em'}}>⭐</span> Compartir como imagen
              </button>
              <CanvasExporter
                exportTrigger={exportTrigger}
                onExported={setExportedImage}
                logoSrc="/logo.png"
              >
                {`Interpretación de Sueño Premium\nFecha: ${dreamDate}\nSensaciones: ${feelings.join(', ')}\nInterpretación: ${result}`}
              </CanvasExporter>
            </section>
          ) : (
            <form className="dream-form premium-form" onSubmit={handleSubmit}>
              <div className="dream-explainer premium-box" style={{background:'#232946',color:'#eebc1d',borderRadius:'14px',padding:'1.5em',margin:'1.2em 0',boxShadow:'0 2px 12px #23294688',fontSize:'1.12em',fontFamily:'var(--font-base)'}}>
                <h4 style={{color:'#d4af37',marginBottom:'0.7em'}}>¿Cómo funciona la interpretación?</h4>
                <ul style={{marginLeft:'1.2em',marginBottom:'0.7em'}}>
                  <li>Describe tu sueño con sinceridad y apertura, conectando con la magia onírica y los guías ancestrales.</li>
                  <li>La interpretación une sabiduría ancestral, dioses, diosas y tecnología para darte un mensaje profundo y personalizado.</li>
                  <li>Selecciona las emociones que sentiste al despertar: esto ayuda a la IA a conectar con tu estado interior.</li>
                  <li>Recuerda que la respuesta es una orientación espiritual, no un diagnóstico.</li>
                </ul>
                <div style={{marginTop:'0.7em',color:'#fff'}}>Tu experiencia es privada y respetuosa con la magia de los sueños.</div>
              </div>
              <label htmlFor="dreamDate" className="dream-label">Fecha del sueño:</label>
              <input
                type="date"
                id="dreamDate"
                value={dreamDate}
                onChange={e => setDreamDate(e.target.value)}
                className="dream-input"
                required
              />
              <label htmlFor="dreamText" className="dream-label">Describe tu sueño:</label>
              <textarea
                id="dreamText"
                value={dreamText}
                onChange={e => setDreamText(e.target.value)}
                rows={5}
                className="dream-textarea"
                placeholder="Escribe aquí tu sueño, con respeto y apertura..."
                required
              />
              <div className="dream-feelings-block">
                <span className="dream-feelings-label">¿Qué sensación te transmitía?</span>
                <div className="dream-feelings-list">
                  {FEELINGS.map(f => (
                    <label key={f.key} className="dream-feeling-item">
                      <input
                        type="checkbox"
                        checked={feelings.includes(f.key)}
                        onChange={() => handleFeelingChange(f.key)}
                      />
                      {f.label}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="main-btn dream-submit-btn" disabled={loading}>Interpretar sueño</button>
            </form>
          )
        )}
        {loading && <LoadingSpinner />}
        {showAdModal && <AdModal visible={showAdModal} onClose={() => setShowAdModal(false)} />}
      </div>
    </main>
  );
}
