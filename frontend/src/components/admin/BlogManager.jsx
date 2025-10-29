import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin.jsx';

export default function BlogManager() {
  const {
    loading,
    error,
    setError,
    getBlogPosts,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    uploadFile
  } = useAdmin();

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    status: 'draft',
    featuredImage: '',
    seoTitle: '',
    seoDescription: ''
  });
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [pagination.page]);

  const loadPosts = async () => {
    try {
      const response = await getBlogPosts(pagination.page, 10);
      setPosts(response.posts || []);
      setPagination(response.pagination || { page: 1, total: 0, pages: 0 });
    } catch (err) {
      console.error('Error loading posts:', err);
    }
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setPostForm({
      title: '',
      content: '',
      excerpt: '',
      tags: '',
      status: 'draft',
      featuredImage: '',
      seoTitle: '',
      seoDescription: ''
    });
    setShowEditor(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setPostForm({
      title: post.title || '',
      content: post.content || '',
      excerpt: post.excerpt || '',
      tags: post.tags?.join(', ') || '',
      status: post.status || 'draft',
      featuredImage: post.featuredImage || '',
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || ''
    });
    setShowEditor(true);
  };

  const handleSavePost = async () => {
    try {
      const postData = {
        ...postForm,
        tags: postForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (editingPost) {
        await updateBlogPost(editingPost.id, postData);
      } else {
        await createBlogPost(postData);
      }

      setShowEditor(false);
      await loadPosts();
    } catch (err) {
      console.error('Error saving post:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este post?')) {
      return;
    }

    try {
      await deleteBlogPost(postId);
      await loadPosts();
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const response = await uploadFile(file, 'blog');
      setPostForm(prev => ({ ...prev, featuredImage: response.url }));
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      setImageUploading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showEditor) {
    return (
      <div className="blog-editor">
        <div className="editor-header">
          <h2>{editingPost ? 'Editar Post' : 'Nuevo Post'}</h2>
          <div className="editor-actions">
            <button 
              onClick={handleSavePost} 
              disabled={loading}
              className="save-btn"
            >
              {loading ? (
                <span role="img" aria-label="Cargando" className="emoji-spinner">⏳</span>
              ) : (
                <span role="img" aria-label="Guardar">💾</span>
              )}
              Guardar
            </button>
            <button 
              onClick={() => setShowEditor(false)}
              className="cancel-btn"
            >
              <span role="img" aria-label="Cancelar">❌</span>
              Cancelar
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
              <label>Título *</label>
              <input
                type="text"
                value={postForm.title}
                onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título del post"
                required
              />
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select
                value={postForm.status}
                onChange={(e) => setPostForm(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="archived">Archivado</option>
              </select>
                      <span role="img" aria-label="Cargando" className="emoji-spinner">⏳</span>
          </div>

          <div className="form-group">
            <label>Extracto</label>
            <textarea
              value={postForm.excerpt}
              onChange={(e) => setPostForm(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Resumen breve del post..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Contenido *</label>
            <textarea
              value={postForm.content}
              onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Contenido del post en Markdown..."
              rows="15"
              className="content-editor"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tags</label>
              <input
                type="text"
                value={postForm.tags}
                onChange={(e) => setPostForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="tarot, astrología, espiritualidad..."
              />
            </div>
            <div className="form-group">
              <label>Imagen Destacada</label>
              <div className="image-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={imageUploading}
                  id="featured-image"
                />
                <label htmlFor="featured-image" className="upload-btn">
                  {imageUploading ? (
                    <span role="img" aria-label="Cargando" className="emoji-spinner">⏳</span>
                  ) : (
                    <span role="img" aria-label="Imagen">🖼️</span>
                  )}
                </label>
                {postForm.featuredImage && (
                  <div className="image-preview">
                    <img src={postForm.featuredImage} alt="Preview" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="seo-section">
            <h3>SEO</h3>
            <div className="form-group">
              <label>Título SEO</label>
              <input
                type="text"
                value={postForm.seoTitle}
                onChange={(e) => setPostForm(prev => ({ ...prev, seoTitle: e.target.value }))}
                placeholder="Título optimizado para SEO"
                maxLength="60"
              />
            </div>
            <div className="form-group">
              <label>Descripción SEO</label>
              <textarea
                value={postForm.seoDescription}
                onChange={(e) => setPostForm(prev => ({ ...prev, seoDescription: e.target.value }))}
                placeholder="Descripción meta para SEO"
                rows="3"
                maxLength="160"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-manager">
      <div className="blog-header">
        <h2>Gestión del Blog</h2>
        <div className="blog-controls">
          <div className="search-box">
            <span role="img" aria-label="Buscar">🔍</span>
            <input
              type="text"
              placeholder="Buscar posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={handleCreatePost} className="create-btn">
            <span role="img" aria-label="Nuevo">➕</span>
            Nuevo Post
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-alert admin-alert-error">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="posts-grid">
        {loading ? (
          <div className="loading-posts">
            <span role="img" aria-label="Cargando" className="emoji-spinner">⏳</span>
            <p>Cargando posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="no-posts">
            <p>No hay posts para mostrar</p>
            <button onClick={handleCreatePost} className="create-first-btn">
              <span role="img" aria-label="Nuevo">➕</span>
              Crear tu primer post
            </button>
          </div>
        ) : (
          filteredPosts.map(post => (
            <div key={post.id} className="post-card">
              {post.featuredImage && (
                <div className="post-image">
                  <img src={post.featuredImage} alt={post.title} />
                </div>
              )}
              <div className="post-content">
                <div className="post-header">
                  <h3>{post.title}</h3>
                  <span className={`status-badge ${post.status}`}>
                    {post.status === 'published' ? 'Publicado' : 
                     post.status === 'draft' ? 'Borrador' : 'Archivado'}
                  </span>
                </div>
                <p className="post-excerpt">{post.excerpt}</p>
                <div className="post-meta">
                  <span className="post-date">
                    <span role="img" aria-label="Fecha">📅</span>
                    {new Date(post.createdAt).toLocaleDateString('es-ES')}
                  </span>
                  {post.tags && post.tags.length > 0 && (
                    <div className="post-tags">
                      {post.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="post-actions">
                  <button
                    onClick={() => handleEditPost(post)}
                    className="action-btn edit"
                    title="Editar"
                  >
                    <span role="img" aria-label="Editar">✏️</span>
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="action-btn delete"
                    title="Eliminar"
                  >
                    <span role="img" aria-label="Eliminar">🗑️</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setPagination(prev => ({ ...prev, page }))}
              className={`page-btn ${page === pagination.page ? 'active' : ''}`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}