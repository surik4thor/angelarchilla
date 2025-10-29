import React, { useState } from 'react';
import { useReading } from '../hooks/useReading.js';
import LoadingSpinner from './LoadingSpinner.jsx';
import '../styles/FirstReading.css';

const FirstReading = ({ user, isFirstTime=true }) => {
  const [type, setType] = useState('');
  const [deck, setDeck] = useState('rider-waite');
  const [availableDecks, setAvailableDecks] = useState([]);
  const [spread, setSpread] = useState('');
  const [question, setQuestion] = useState('');
  const { createReading, loading, error } = useReading();
  const [cards, setCards] = useState([]);
  const [interpret, setInterpret] = useState('');

  React.useEffect(() => {
    async function load(){
      try{
        const res = await fetch('/api/decks');
        const json = await res.json();
        if(json.success && Array.isArray(json.decks)) setAvailableDecks(json.decks);
      }catch(e){
        console.warn('Could not load decks', e);
      }
    }
    load();
  }, []);

  const handle = async () => {
    if (!type||!spread||!question.trim()) {
      return;
    }
    try {
      const reading = await createReading({
        type: type.toUpperCase(),
        spreadType: spread === 'three-card' ? 'tres-cartas' : spread === 'single-rune' ? 'runa-unica' : spread,
        // enviar slug del mazo (ej. 'rider-waite' o 'marseille') para que el backend lo normalice
        deckType: deck,
        question,
        anonBirthDate: isFirstTime && !user ? null : undefined,
        anonGender: isFirstTime && !user ? null : undefined
      });
      const items = reading.cards||reading.runes;
      setCards(items);
      setInterpret(reading.interpretation);
    } catch(e) {
      console.error('Error creating reading:', e);
    }
  };

  return (
    <div className="first-reading-container">
      <div className="glass-card">
        {!interpret ? (
          <>
            <h2>{isFirstTime?'Tu Primera Lectura':'Nueva Lectura'}</h2>
            <div>
              <button onClick={()=>{setType('tarot');setSpread('');}}>Tarot</button>
              <button onClick={()=>{setType('runes');setSpread('');}}>Runas</button>
            </div>
            {type==='tarot'&&(
              <select value={deck} onChange={e => setDeck(e.target.value)}>
                {availableDecks.length ? availableDecks.filter(d => d.type === 'tarot').map(d => (
                  <option key={d.slug} value={d.slug}>{d.name}</option>
                )) : (
                  <>
                    <option value="rider-waite">Rider-Waite</option>
                    <option value="marseille">Marsella</option>
                  </>
                )}
              </select>
            )}
            {type&&(
              <div>{
                (type==='tarot'?[
                  {id:'three-card',name:'3 Cartas'}
                ]:[
                  {id:'single-rune',name:'1 Runa'}
                ]).map(s=>(
                  <button
                    key={s.id}
                    onClick={()=>setSpread(s.id)}
                  >{s.name}</button>
                ))
              }</div>
            )}
            {spread&&(
              <>
                <textarea
                  value={question}
                  onChange={e=>setQuestion(e.target.value)}
                  placeholder="Pregunta..."
                />
                <button onClick={handle} disabled={loading}>
                  {loading?'Conectando...':'Comenzar Lectura'}
                </button>
                {error&&<div className="error">{error}</div>}
              </>
            )}
          </>
        ):(
          <div>
            <h2>Interpretación</h2>
            <div>{
              cards.map((c,i)=>(
                <div key={i}>
                  {c.image&&<img src={c.image} alt={c.name}/>}
                  <p>{c.name} {c.position}</p>
                </div>
              ))
            }</div>
            <div className="interpret-text">{interpret}</div>
            <button onClick={()=>window.location.reload()}>Nueva Lectura</button>
          </div>
        )}
      </div>
      {loading&&<LoadingSpinner/>}
    </div>
  );
};

export default FirstReading;
