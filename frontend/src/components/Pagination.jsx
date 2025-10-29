import React from 'react';

export default function Pagination({ page, pageCount, onPageChange }) {
  if (pageCount <= 1) return null;
  return (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', margin: '2rem 0' }}>
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}>
        &laquo; Anterior
      </button>
      {[...Array(pageCount)].map((_, i) => (
        <button
          key={i + 1}
          onClick={() => onPageChange(i + 1)}
          style={{ fontWeight: page === i + 1 ? 'bold' : 'normal' }}
        >
          {i + 1}
        </button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page === pageCount}>
        Siguiente &raquo;
      </button>
    </div>
  );
}
