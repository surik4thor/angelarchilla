import React, { useEffect, useState } from 'react';
import Pagination from './Pagination.jsx';
import '../styles/BlogList.css';
import { fetchPosts } from '../api/blog';

export default function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetchPosts()
      .then(data => {
        setPosts(data || []);
        setPageCount(1);
        setLoading(false);
      })
      .catch(() => {
        setError('Error cargando posts');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando posts...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="blog-list">
      <ul>
        {posts.map(post => (
          <li key={post.slug} style={{
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
          }}>
            <a href={`/blog/${post.slug}`} style={{textDecoration:'none'}}>
              <h3 style={{margin: '0 0 0.5rem 0', color: '#1a1a2e'}}>{post.title}</h3>
            </a>
            <div dangerouslySetInnerHTML={{__html: post.html}} />
            <div className="blog-fallback" aria-label="Sin imagen">📝</div>
            <small style={{color:'#888'}}>{post.date}</small>
          </li>
        ))}
      </ul>
      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
    </div>
  );
}
