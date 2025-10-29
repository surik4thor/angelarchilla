import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin.jsx';


export default function DecksManager() {
  const { loading, error, setError, getDecks, createDeck, updateDeck, deleteDeck, uploadFile, getDeckCards, createDeckCard, updateDeckCard, deleteDeckCard, bulkCreateDeckCards } = useAdmin();

  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [deckCards, setDeckCards] = useState([]);
  const [cardEditorVisible, setCardEditorVisible] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [cardForm, setCardForm] = useState({ name: '', cardNumber: '', arcana: 'TAROT', suit: '', meaning: '', reversedMeaning: '', keywords: [], imageUrl: '' });
  const [bulkUploading, setBulkUploading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [showEditor, setShowEditor] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [deckForm, setDeckForm] = useState({ name: '', description: '', imageUrl: '', type: 'TAROT' });
  const [imageUploading, setImageUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => { loadDecks(); }, [pagination.page]);

  const loadDecks = async () => {
    try {
      const res = await getDecks(pagination.page, 20);
      setDecks(res.decks || []);
      setPagination(res.pagination || { page: 1, total: 0, pages: 0 });
    } catch (err) {
      console.error('Error loading decks:', err);
      setErrorMsg(err.message || 'Error cargando mazos');
    }
  };

  const openDeck = async (deck) => {
    setSelectedDeck(deck);
    try {
      const res = await getDeckCards(deck.id);
      setDeckCards(res.cards || []);
    } catch (err) {
      console.error('Error loading deck cards:', err);
    }
  };

  const openCardEditor = (card) => {
    setEditingCard(card || null);
    setCardForm(card ? { ...card, keywords: card.keywords || [] } : { name: '', cardNumber: '', arcana: 'TAROT', suit: '', meaning: '', reversedMeaning: '', keywords: [], imageUrl: '' });
    setCardEditorVisible(true);
  };

  const saveCard = async () => {
    try {
      if (editingCard) {
        await updateDeckCard(selectedDeck.id, editingCard.id, cardForm);
      } else {
        await createDeckCard(selectedDeck.id, cardForm);
      }
      const res = await getDeckCards(selectedDeck.id);
      setDeckCards(res.cards || []);
      setCardEditorVisible(false);
    } catch (err) {
      console.error('Error saving card:', err);
    }
  };

  const removeCard = async (cardId) => {
    if (!window.confirm('¿Eliminar esta carta?')) return;
    try {
      await deleteDeckCard(selectedDeck.id, cardId);
      const res = await getDeckCards(selectedDeck.id);
      setDeckCards(res.cards || []);
    } catch (err) { console.error('Error deleting card:', err); }
  };

  const handleBulkJSON = async (jsonText) => {
    try {
      const arr = JSON.parse(jsonText);
      if (!Array.isArray(arr)) throw new Error('JSON debe contener un array de cartas');
      setBulkUploading(true);
      await bulkCreateDeckCards(selectedDeck.id, arr);
      const res = await getDeckCards(selectedDeck.id);
      setDeckCards(res.cards || []);
    } catch (err) {
      alert('Error en bulk upload: ' + (err.message || err));
    } finally { setBulkUploading(false); }
  };

  const handleCreate = () => {
    setEditingDeck(null);
    setDeckForm({ name: '', description: '', imageUrl: '', type: 'TAROT' });
    setShowEditor(true);
  };

  const handleEdit = (deck) => {
    setEditingDeck(deck);
    setDeckForm({ name: deck.name || '', description: deck.description || '', imageUrl: deck.imageUrl || '', type: deck.type || 'TAROT' });
    setShowEditor(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...deckForm };
      if (editingDeck) {
        await updateDeck(editingDeck.id, payload);
        setMessage('Mazo actualizado correctamente');
      } else {
        await createDeck(payload);
        setMessage('Mazo creado correctamente');
      }
      setShowEditor(false);
      await loadDecks();
    } catch (err) {
      console.error('Error saving deck:', err);
      setErrorMsg(err.message || 'Error guardando mazo');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este mazo?')) return;
    try {
      await deleteDeck(id);
      setMessage('Mazo eliminado');
      await loadDecks();
    } catch (err) {
      console.error('Error deleting deck:', err);
      setErrorMsg(err.message || 'Error eliminando mazo');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const res = await uploadFile(file, 'cards');
      setDeckForm(prev => ({ ...prev, imageUrl: res.url || res.url || '' }));
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      setImageUploading(false);
    }
  };

  if (showEditor) {
    return (
      <div className="deck-editor">
        <div className="editor-header">
          <h2>{editingDeck ? 'Editar Mazo' : 'Nuevo Mazo'}</h2>
          <div className="editor-actions">
            <button onClick={handleSave} disabled={loading} className="save-btn">
              {loading ? <span role="img" aria-label="Cargando" className="emoji-spinner">⏳</span> : <span role="img" aria-label="Guardar">💾</span>} Guardar
            </button>
            <button onClick={() => setShowEditor(false)} className="cancel-btn">
              <span role="img" aria-label="Cancelar">❌</span> Cancelar
            </button>
          </div>
        </div>

        {error && (
          <div className="admin-alert admin-alert-error">
            {error}
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        <div className="editor-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre *</label>
              <input type="text" value={deckForm.name} onChange={(e) => setDeckForm(prev => ({ ...prev, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Tipo</label>
              <select value={deckForm.type} onChange={(e) => setDeckForm(prev=>({...prev,type:e.target.value}))}>
                <option value="TAROT">Tarot</option>
                <option value="RUNES">Runas</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea value={deckForm.description} onChange={(e) => setDeckForm(prev => ({ ...prev, description: e.target.value }))} rows="4" />
          </div>

          <div className="form-group">
            <label>Imagen</label>
            <div className="image-upload">
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={imageUploading} id="deck-image" />
              <label htmlFor="deck-image" className="upload-btn">
                {imageUploading ? <span role="img" aria-label="Cargando" className="emoji-spinner">⏳</span> : <span role="img" aria-label="Imagen">🖼️</span>} {imageUploading ? 'Subiendo...' : 'Subir Imagen'}
              </label>
              {deckForm.imageUrl && (
                <div className="image-preview"><img src={deckForm.imageUrl} alt="Preview" /></div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (selectedDeck) {
    return (
      <div className="deck-detail">
        <button onClick={() => setSelectedDeck(null)}>← Volver a Mazos</button>
        <h2>{selectedDeck.name}</h2>
        <p>{selectedDeck.description}</p>

        <div className="deck-cards-actions">
          <button onClick={() => openCardEditor(null)}>Nueva carta</button>
          <button onClick={() => document.getElementById('bulk-input')?.focus()}>Bulk JSON</button>
        </div>

        <div className="deck-cards-list">
          {deckCards.map(card => (
            <div key={card.id} className="deck-card-item">
              <div className="card-meta">
                <h4>{card.name}</h4>
                <p>{card.meaning?.slice(0,120)}</p>
              </div>
              <div className="card-actions">
                <button onClick={() => openCardEditor(card)}>Editar</button>
                <button onClick={() => removeCard(card.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>

        {cardEditorVisible && (
          <div className="card-editor">
            <h3>{editingCard ? 'Editar Carta' : 'Nueva Carta'}</h3>
            <input placeholder="Nombre" value={cardForm.name} onChange={e=>setCardForm(prev=>({...prev,name:e.target.value}))} />
            <input placeholder="Número" value={cardForm.cardNumber||''} onChange={e=>setCardForm(prev=>({...prev,cardNumber:e.target.value}))} />
            <textarea placeholder="Meaning" value={cardForm.meaning} onChange={e=>setCardForm(prev=>({...prev,meaning:e.target.value}))} />
            <div style={{display:'flex',gap:8}}>
              <button onClick={saveCard}>Guardar</button>
              <button onClick={()=>setCardEditorVisible(false)}>Cancelar</button>
            </div>
          </div>
        )}

        <div className="deck-bulk">
          <h4>Bulk upload (JSON array de cartas)</h4>
          <textarea id="bulk-input" placeholder='[ {"name":"...","meaning":"..."}, ... ]' style={{width:'100%',height:120}} />
          <div style={{marginTop:8}}>
            <button onClick={() => handleBulkJSON(document.getElementById('bulk-input').value)} disabled={bulkUploading}>{bulkUploading ? 'Subiendo...' : 'Subir JSON'}</button>
          </div>
        </div>
        <div className="deck-bulk-zip" style={{marginTop:16}}>
          <h4>Bulk upload CSV + ZIP (imagenes)</h4>
          <form id="bulk-zip-form" onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target;
            const csv = form.csv.files[0];
            const images = form.images.files[0];
            if (!csv) return alert('CSV requerido');
            const fd = new FormData(); fd.append('csv', csv); if (images) fd.append('images', images);
            try {
              setBulkUploading(true);
              const token = localStorage.getItem('arcanaToken') || localStorage.getItem('token');
              const res = await fetch(`/admin/decks/${selectedDeck.id}/cards/bulk-zip`, { credentials: 'include',
                method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Error en bulk upload');
              setMessage(`Se importaron ${data.createdCount} cartas`);
              const r = await getDeckCards(selectedDeck.id);
              setDeckCards(r.cards || []);
            } catch (err) { alert('Error: '+(err.message||err)); }
            finally { setBulkUploading(false); }
          }}>
            <div>
              <label>CSV (name,meaning,imageName,...)</label>
              <input type="file" name="csv" accept=".csv,text/csv" />
            </div>
            <div>
              <label>ZIP de imágenes (opcional)</label>
              <input type="file" name="images" accept=".zip" />
            </div>
            <div style={{marginTop:8}}>
              <button type="submit" disabled={bulkUploading}>{bulkUploading ? 'Subiendo...' : 'Importar CSV+ZIP'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  return (
    <div className="decks-manager">
      <div className="header">
        <h2>Gestión de Mazos</h2>
        <div className="controls">
          <div className="search-box"><span role="img" aria-label="Buscar">🔍</span><input placeholder="Buscar..." /></div>
          <button onClick={handleCreate} className="create-btn"><span role="img" aria-label="Nuevo">➕</span> Nuevo Mazo</button>
        </div>
      </div>
      {message && <div className="admin-alert admin-alert-success">{message} <button onClick={()=>setMessage('')}>×</button></div>}
      {errorMsg && <div className="admin-alert admin-alert-error">{errorMsg} <button onClick={()=>setErrorMsg('')}>×</button></div>}

      {/* Mazos de Tarot */}
      <h3 style={{marginTop:'1em'}}>Mazos de Tarot</h3>
      <div className="cards-grid">
        {loading ? (
          <div className="loading"><span role="img" aria-label="Cargando" className="emoji-spinner">⏳</span> Cargando...</div>
        ) : decks.filter(deck => deck.type === 'TAROT').length === 0 ? (
          <div className="empty">No hay mazos de tarot</div>
        ) : (
          decks.filter(deck => deck.type === 'TAROT').map(deck => (
            <div key={deck.id} className="deck-card">
              {deck.imageUrl && <div className="deck-image"><img src={deck.imageUrl} alt={deck.name} /></div>}
              <div className="deck-content">
                <h3>{deck.name}</h3>
                <p>{deck.description}</p>
                <div className="deck-actions">
                  <button onClick={() => handleEdit(deck)} className="action-btn edit"><span role="img" aria-label="Editar">✏️</span></button>
                  <button onClick={() => handleDelete(deck.id)} className="action-btn delete"><span role="img" aria-label="Eliminar">🗑️</span></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mazos de Runas */}
      <h3 style={{marginTop:'2em'}}>Mazos de Runas</h3>
      <div className="cards-grid">
        {loading ? (
          <div className="loading"><span role="img" aria-label="Cargando" className="emoji-spinner">⏳</span> Cargando...</div>
        ) : decks.filter(deck => deck.type === 'RUNES').length === 0 ? (
          <div className="empty">No hay mazos de runas</div>
        ) : (
          decks.filter(deck => deck.type === 'RUNES').map(deck => (
            <div key={deck.id} className="deck-card">
              {deck.imageUrl && <div className="deck-image"><img src={deck.imageUrl} alt={deck.name} /></div>}
              <div className="deck-content">
                <h3>{deck.name}</h3>
                <p>{deck.description}</p>
                <div className="deck-actions">
                  <button onClick={() => handleEdit(deck)} className="action-btn edit"><span role="img" aria-label="Editar">✏️</span></button>
                  <button onClick={() => handleDelete(deck.id)} className="action-btn delete"><span role="img" aria-label="Eliminar">🗑️</span></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">{Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => setPagination(prev => ({ ...prev, page: p }))} className={`page-btn ${p === pagination.page ? 'active' : ''}`}>{p}</button>
        ))}</div>
      )}
    </div>
  );
}
