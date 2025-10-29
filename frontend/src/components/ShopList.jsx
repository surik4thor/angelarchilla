import React, { useEffect, useState } from 'react';
import { useCart } from '../hooks/useCart.js';
import Pagination from './Pagination.jsx';
import '../styles/ShopList.css';
// import { fetchProducts } from '../api/shopify';

export default function ShopList() {
  const { addItem } = useCart();
  const [addedId, setAddedId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    setLoading(true);
    // Aquí irá la nueva lógica para obtener productos del sistema propio
    setProducts([]);
    setPageCount(1);
    setLoading(false);
  }, []);

  if (loading) return <p>Cargando productos...</p>;

  return (
    <div className="shop-list">
      <ul>
        {products.map(product => (
          <li key={product.id}
            style={{
              background:'rgba(34,24,46,0.97)',
              borderRadius:'12px',
              boxShadow:'0 2px 16px #8b5cf633',
              padding:'1rem',
              marginBottom:'2rem',
              minWidth:'250px',
              maxWidth:'350px',
              display:'flex',
              flexDirection:'column',
              alignItems:'flex-start',
              color:'var(--color-text)',
              position:'relative',
              transition:'transform .18s, box-shadow .18s',
              cursor:'pointer'
            }}
            onMouseEnter={e => {e.currentTarget.style.transform='scale(1.04)';e.currentTarget.style.boxShadow='0 8px 32px #d4af3766';}}
            onMouseLeave={e => {e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 2px 16px #8b5cf633';}}
          >
            {/* Shopify no expone stock por defecto, se puede omitir o mostrar "Disponible" */}
            {product.images?.[0]?.src && (
              <img src={product.images[0].src} alt={product.title} style={{width:'100%',borderRadius:'8px',marginBottom:'0.5rem'}} />
            )}
            <a href={`/shop/${product.id}`} style={{textDecoration:'none'}}>
              <h3 style={{margin:'0 0 0.5rem 0',color:'var(--color-gold)',fontWeight:'bold'}}>{product.title}</h3>
            </a>
            <span style={{color:'var(--color-muted)',fontSize:'0.95em'}}>{product.vendor || ''}</span>
            <p style={{color:'var(--color-text)'}}>{product.description}</p>
            <strong style={{color:'var(--color-gold)',fontSize:'1.1em',marginBottom:'0.5rem',display:'block'}}>
              <span style={{marginRight:'0.5em'}}>💰</span>{product.variants?.[0]?.price || ''} €
            </strong>
            <span style={{color:'var(--color-muted)'}}>Disponible</span><br/>
            <button
              style={{marginTop:'1rem',background:'var(--color-gold)',color:'#1a1a2e',border:'none',borderRadius:'8px',padding:'0.7rem 1.2rem',cursor:'pointer',fontWeight:'bold',fontSize:'1em',boxShadow:'0 2px 8px #d4af374d',transition:'background .18s'}}
              onMouseDown={e => {e.currentTarget.style.background='#f4e4bc';}}
              onMouseUp={e => {e.currentTarget.style.background='var(--color-gold)';}}
              onClick={() => {
                addItem(product, 1);
                setAddedId(product.id);
                setTimeout(() => setAddedId(null), 1200);
              }}
            >Añadir al carrito</button>
            <button
              style={{marginTop:'0.5rem',background:'var(--color-purple)',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem 1.2rem',cursor:'pointer',fontWeight:'bold',fontSize:'1em',boxShadow:'0 2px 8px #8b5cf666',transition:'background .18s'}}
              onMouseDown={e => {e.currentTarget.style.background='#a78bfa';}}
              onMouseUp={e => {e.currentTarget.style.background='var(--color-purple)';}}
              onClick={() => {
                addItem(product, 1);
                window.location.href = '/checkout';
              }}
            >Comprar ahora</button>
            {addedId === product.id && <span style={{color:'#27ae60',marginTop:'0.5rem'}}>¡Añadido!</span>}
          </li>
        ))}
      </ul>
      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
    </div>
  );
}
