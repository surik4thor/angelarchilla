import React, { useEffect, useState } from 'react';

export default function BlogAdminList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  const handleEdit = post => {
    setSelected(post);
    fetch(`/content/posts/${post.slug}.md`)
      .then(res => res.text())
      .then(md => setEditContent(md));
  };

  const handleSave = async () => {
    setMessage("");
    try {
      const res = await fetch(`/api/admin/blog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: selected.slug, content: editContent })
      });
      if (!res.ok) throw new Error('Error al guardar el artículo');
      setMessage("Artículo actualizado correctamente");
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (loading) return <p>Cargando artículos...</p>;

  return (
    <div style={{maxWidth:800,margin:'2rem auto'}}>
      <h2>Listado de artículos del blog</h2>
      <ul style={{listStyle:'none',padding:0}}>
        {posts.map(post => (
          <li key={post.slug} style={{marginBottom:'1rem',background:'#f9f9f9',padding:'1rem',borderRadius:'8px'}}>
            <strong>{post.title}</strong> <span style={{color:'#888'}}>{post.date}</span>
            <button style={{marginLeft:'1rem'}} onClick={() => handleEdit(post)}>Editar</button>
            <button style={{marginLeft:'1rem',color:'red'}} onClick={async () => {
              if(window.confirm('¿Seguro que quieres eliminar este artículo?')) {
                const res = await fetch(`/api/admin/blog/${post.slug}`, { method: 'DELETE' });
                if(res.ok) setPosts(posts.filter(p => p.slug !== post.slug));
              }
            }}>Eliminar</button>
          </li>
        ))}
      </ul>
      {selected && (
        <div style={{marginTop:'2rem',background:'#fff',padding:'2rem',borderRadius:'12px',boxShadow:'0 2px 16px #8b5cf633'}}>
          <h3>Editar artículo: {selected.title}</h3>
          <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={16} style={{width:'100%',marginBottom:'1rem'}} />
          <button onClick={handleSave} style={{padding:'0.5rem 2rem',background:'#8b5cf6',color:'#fff',border:'none',borderRadius:'8px'}}>Guardar cambios</button>
          {message && <p style={{marginTop:'1rem',color:message.includes('correctamente')?'green':'red'}}>{message}</p>}
        </div>
      )}
    </div>
  );
}
