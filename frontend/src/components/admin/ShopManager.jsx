import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin.jsx';

export default function ShopManager() {
  const {
    loading,
    error,
    setError,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadFile
  } = useAdmin();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    sku: '',
    category: '',
    tags: '',
    status: 'active',
    inventory: '',
    weight: '',
    images: [],
  seoTitle: '',
  seoDescription: '',
  featured: false,
  newArrival: false
  });
  const [imageUploading, setImageUploading] = useState(false);

  // Estado para el plan comercial IA
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [businessPlan, setBusinessPlan] = useState(null);
  const [planError, setPlanError] = useState('');

  const categories = [
    'Cartas del Tarot',
    'Cristales y Gemas',
    'Libros Esotéricos',
    'Velas y Aromas',
    'Runas',
    'Pendulos',
    'Joyería Esotérica',
    'Decoración',
    'Cursos Online',
    'Lecturas Personalizadas'
  ];

  useEffect(() => {
    loadProducts();
  }, [pagination.page]);

  const loadProducts = async () => {
    try {
      const response = await getProducts(pagination.page, 12);
      setProducts(response.products || []);
      setPagination(response.pagination || { page: 1, total: 0, pages: 0 });
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      compareAtPrice: '',
      sku: '',
      category: '',
      tags: '',
      status: 'active',
      inventory: '',
      weight: '',
      images: [],
      seoTitle: '',
      seoDescription: ''
    });
    setShowEditor(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      compareAtPrice: product.compareAtPrice || '',
      sku: product.sku || '',
      category: product.category || '',
      tags: product.tags?.join(', ') || '',
      status: product.status || 'active',
      inventory: product.inventory || '',
      weight: product.weight || '',
      images: product.images || [],
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || '',
      featured: !!product.featured,
      newArrival: !!product.newArrival
    });
    setShowEditor(true);
  };

  const handleSaveProduct = async () => {
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        compareAtPrice: productForm.compareAtPrice ? parseFloat(productForm.compareAtPrice) : null,
        inventory: parseInt(productForm.inventory) || 0,
        weight: productForm.weight ? parseFloat(productForm.weight) : null,
        tags: productForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        featured: !!productForm.featured,
        newArrival: !!productForm.newArrival
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }

      setShowEditor(false);
      await loadProducts();
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      await deleteProduct(productId);
      await loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setImageUploading(true);
    try {
      const uploadPromises = files.map(file => uploadFile(file, 'products'));
      const responses = await Promise.all(uploadPromises);
      const newImages = responses.map(response => response.url);
      
      setProductForm(prev => ({ 
        ...prev, 
        images: [...prev.images, ...newImages] 
      }));
    } catch (err) {
      console.error('Error uploading images:', err);
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (index) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para lanzar el plan comercial IA
  const handleGenerateBusinessPlan = async () => {
    setGeneratingPlan(true);
    setPlanError('');
    setBusinessPlan(null);
    try {
      const token = localStorage.getItem('token'); // O usa tu sistema de auth
      const res = await fetch('/api/admin/business-plan/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setBusinessPlan(data.plan);
      } else {
        setPlanError(data.message || 'Error generando el plan comercial');
      }
    } catch (err) {
      setPlanError('Error de red o servidor');
    } finally {
      setGeneratingPlan(false);
    }
  };

  if (showEditor) {
    return (
      <div className="product-editor">
        <div className="editor-header">
          <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <div className="editor-actions">
            <button 
              onClick={handleSaveProduct} 
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
              <label>Nombre del Producto *</label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del producto"
                required
              />
            </div>
            <div className="form-group">
              <label>SKU</label>
              <input
                type="text"
                value={productForm.sku}
                onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="Código único del producto"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={productForm.description}
              onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción detallada del producto..."
              rows="5"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Precio *</label>
              <div className="price-input">
                <span role="img" aria-label="Euro">💶</span>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Precio de Comparación</label>
              <div className="price-input">
                <span role="img" aria-label="Euro">💶</span>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.compareAtPrice}
                  onChange={(e) => setProductForm(prev => ({ ...prev, compareAtPrice: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Categoría</label>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select
                value={productForm.status}
                onChange={(e) => setProductForm(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="active">Activo</option>
                <option value="draft">Borrador</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Inventario</label>
              <input
                type="number"
                value={productForm.inventory}
                onChange={(e) => setProductForm(prev => ({ ...prev, inventory: e.target.value }))}
                placeholder="Cantidad disponible"
              />
            </div>
            <div className="form-group">
              <label>Peso (kg)</label>
              <input
                type="number"
                step="0.01"
                value={productForm.weight}
                onChange={(e) => setProductForm(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Tags</label>
            <input
              type="text"
              value={productForm.tags}
              onChange={(e) => setProductForm(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="tarot, cristales, esoterico..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <input type="checkbox" checked={!!productForm.featured} onChange={e => setProductForm(prev => ({ ...prev, featured: e.target.checked }))} />
                <span style={{marginLeft:'0.5em'}}>Destacado</span>
              </label>
            </div>
            <div className="form-group">
              <label>
                <input type="checkbox" checked={!!productForm.newArrival} onChange={e => setProductForm(prev => ({ ...prev, newArrival: e.target.checked }))} />
                <span style={{marginLeft:'0.5em'}}>Novedad</span>
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Imágenes del Producto</label>
            <div className="image-upload-multiple">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={imageUploading}
                id="product-images"
              />
              <label htmlFor="product-images" className="upload-btn">
                {imageUploading ? (
                  <span role="img" aria-label="Cargando" className="emoji-spinner">⏳</span>
                ) : (
                  <span role="img" aria-label="Imagen">🖼️</span>
                )}
                {imageUploading ? 'Subiendo...' : 'Subir Imágenes'}
              </label>
              
              {productForm.images.length > 0 && (
                <div className="images-preview">
                  {productForm.images.map((image, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={image} alt={`Preview ${index + 1}`} />
                      <button 
                        type="button"
                        onClick={() => removeImage(index)}
                        className="remove-image"
                      >
                        <span role="img" aria-label="Cancelar">❌</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="seo-section">
            <h3>SEO</h3>
            <div className="form-group">
              <label>Título SEO</label>
              <input
                type="text"
                value={productForm.seoTitle}
                onChange={(e) => setProductForm(prev => ({ ...prev, seoTitle: e.target.value }))}
                placeholder="Título optimizado para SEO"
                maxLength="60"
              />
            </div>
            <div className="form-group">
              <label>Descripción SEO</label>
              <textarea
                value={productForm.seoDescription}
                onChange={(e) => setProductForm(prev => ({ ...prev, seoDescription: e.target.value }))}
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
    <div className="shop-manager">
      <div className="shop-header">
        <h2>Gestión de la Tienda</h2>
        <div className="shop-controls">
          <div className="search-box">
            <span role="img" aria-label="Buscar">🔍</span>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={handleCreateProduct} className="create-btn">
            <span role="img" aria-label="Nuevo">➕</span>
            Nuevo Producto
          </button>
          <button
            onClick={handleGenerateBusinessPlan}
            disabled={generatingPlan}
            className="plan-btn"
            style={{ marginLeft: '1em', background: '#2d3436', color: '#fff', borderRadius: '6px', padding: '0.5em 1em' }}
          >
            {generatingPlan ? 'Generando...' : 'Generar Plan Comercial IA'}
          </button>
        </div>
      </div>

      {/* Notificación y resultado del plan comercial IA */}
      {planError && (
        <div className="admin-alert admin-alert-error">
          {planError}
          <button onClick={() => setPlanError('')}>×</button>
        </div>
      )}
      {businessPlan && (
        <div className="admin-alert admin-alert-success" style={{ whiteSpace: 'pre-wrap', margin: '1em 0' }}>
          <strong>Plan Comercial IA generado:</strong>
          <div>{typeof businessPlan === 'string' ? businessPlan : JSON.stringify(businessPlan, null, 2)}</div>
        </div>
      )}

      {error && (
        <div className="admin-alert admin-alert-error">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="products-grid">
        {loading ? (
          <div className="loading-products">
            <span role="img" aria-label="Cargando" className="emoji-spinner">⏳</span>
            <p>Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-products">
            <span role="img" aria-label="Caja">📦</span>
            <p>No hay productos para mostrar</p>
            <button onClick={handleCreateProduct} className="create-first-btn">
              <span role="img" aria-label="Nuevo">➕</span>
              Crear tu primer producto
            </button>
          </div>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.name} />
                ) : (
                  <div className="no-image">
                    <span role="img" aria-label="Caja">📦</span>
                  </div>
                )}
                <div className="product-status">
                  <span role="img" aria-label={product.status === 'active' ? 'Activo' : 'Inactivo'}>{product.status === 'active' ? '🟢' : '🔴'}</span>
                  {product.featured && <span className="product-featured" title="Destacado" style={{marginLeft:'0.5em',color:'#d4af37',fontWeight:700}}>★</span>}
                  {product.newArrival && <span className="product-new" title="Novedad" style={{marginLeft:'0.5em',color:'#27ae60',fontWeight:700}}>Nuevo</span>}
                </div>
              </div>
              
              <div className="product-content">
                <div className="product-header">
                  <h3>{product.name}</h3>
                  <div className="product-price">
                    <span className="current-price">€{product.price}</span>
                    {product.compareAtPrice && (
                      <span className="compare-price">€{product.compareAtPrice}</span>
                    )}
                  </div>
                </div>
                
                <p className="product-description">{product.description}</p>
                
                <div className="product-meta">
                  {product.category && (
                    <span className="product-category">{product.category}</span>
                  )}
                  {product.sku && (
                    <span className="product-sku">SKU: {product.sku}</span>
                  )}
                  <span className="product-inventory">
                    Stock: {product.inventory || 0}
                  </span>
                </div>
                
                <div className="product-actions">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="action-btn edit"
                    title="Editar"
                  >
                    <span role="img" aria-label="Editar">✏️</span>
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
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