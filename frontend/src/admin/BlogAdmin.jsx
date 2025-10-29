import React, { useState } from 'react';

function getDefaultFrontmatter() {
  return `---\ntitle: ""\ndate: "${new Date().toISOString().slice(0,10)}"\nauthor: ""\ndescription: ""\ntags: []\nimage: ""\npublished: false\n---\n`;
}

export default function BlogAdmin() {
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState(getDefaultFrontmatter());
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/blog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, content })
      });
      if (!res.ok) throw new Error('Error al guardar el artículo');
      setMessage("Artículo guardado correctamente");
    } catch (err) {
      setMessage(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{maxWidth:600,margin:'2rem auto',background:'#fff',padding:'2rem',borderRadius:'12px',boxShadow:'0 2px 16px #8b5cf633'}}>
      <h2>Crear nuevo artículo del blog</h2>
      <label>Slug (YYYY-MM-titulo):
        <input type="text" value={slug} onChange={e => setSlug(e.target.value)} style={{width:'100%',marginBottom:'1rem'}} />
      </label>
      <label>Contenido Markdown:
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={16} style={{width:'100%',marginBottom:'1rem'}} />
      </label>
      <button onClick={handleSave} disabled={loading || !slug || !content} style={{padding:'0.5rem 2rem',background:'#8b5cf6',color:'#fff',border:'none',borderRadius:'8px'}}>Guardar</button>
      {message && <p style={{marginTop:'1rem',color:message.includes('correctamente')?'green':'red'}}>{message}</p>}
    </div>
  );
}
