import { useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiCall = useCallback(async (endpoint, options = {}) => {
  const token = localStorage.getItem('arcanaToken');
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      ...options
    };

    if (options.body && typeof options.body !== 'string') {
      defaultOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error en la petición');
    }

    return response.json();
  }, []);

  // Blog Management
  const getBlogPosts = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError('');
    try {
      return await apiCall(`/admin/blog/posts?page=${page}&limit=${limit}`);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const createBlogPost = useCallback(async (postData) => {
    setLoading(true);
    setError('');
    try {
      return await apiCall('/admin/blog/posts', {
        method: 'POST',
        body: postData
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const updateBlogPost = useCallback(async (postId, postData) => {
    setLoading(true);
    setError('');
    try {
      return await apiCall(`/admin/blog/posts/${postId}`, {
        method: 'PUT',
        body: postData
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const deleteBlogPost = useCallback(async (postId) => {
    setLoading(true);
    setError('');
    try {
      return await apiCall(`/admin/blog/posts/${postId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Shop Management
  const getProducts = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError('');
    try {
      return await apiCall(`/admin/shop/products?page=${page}&limit=${limit}`);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const createProduct = useCallback(async (productData) => {
    setLoading(true);
    setError('');
    try {
      return await apiCall('/admin/shop/products', {
        method: 'POST',
        body: productData
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const updateProduct = useCallback(async (productId, productData) => {
    setLoading(true);
    setError('');
    try {
      return await apiCall(`/admin/shop/products/${productId}`, {
        method: 'PUT',
        body: productData
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const deleteProduct = useCallback(async (productId) => {
    setLoading(true);
    setError('');
    try {
      return await apiCall(`/admin/shop/products/${productId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Stripe Management
  const getStripeStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      return await apiCall('/admin/stripe/stats');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const getStripeCustomers = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    setError('');
    try {
      return await apiCall(`/admin/stripe/customers?page=${page}&limit=${limit}`);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const getStripeSubscriptions = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    setError('');
    try {
      return await apiCall(`/admin/stripe/subscriptions?page=${page}&limit=${limit}`);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const getStripePayments = useCallback(async (page = 1, limit = 20, dateRange) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit });
      if (dateRange?.from) params.append('from', dateRange.from);
      if (dateRange?.to) params.append('to', dateRange.to);
      
      return await apiCall(`/admin/stripe/payments?${params}`);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Cashflow Management
  const getCashflowStats = useCallback(async (period = 'month') => {
    setLoading(true);
    setError('');
    try {
      return await apiCall(`/admin/cashflow/stats?period=${period}`);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const getIncomeData = useCallback(async (page = 1, limit = 20, dateRange) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit });
      if (dateRange?.from) params.append('from', dateRange.from);
      if (dateRange?.to) params.append('to', dateRange.to);
      
      return await apiCall(`/admin/cashflow/income?${params}`);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const getExpenseData = useCallback(async (page = 1, limit = 20, dateRange) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit });
      if (dateRange?.from) params.append('from', dateRange.from);
      if (dateRange?.to) params.append('to', dateRange.to);
      
      return await apiCall(`/admin/cashflow/expenses?${params}`);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const addExpense = useCallback(async (expenseData) => {
    setLoading(true);
    setError('');
    try {
      return await apiCall('/admin/cashflow/expenses', {
        method: 'POST',
        body: expenseData
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const updateExpense = useCallback(async (expenseId, expenseData) => {
    setLoading(true);
    setError('');
    try {
      return await apiCall(`/admin/cashflow/expenses/${expenseId}`, {
        method: 'PUT',
        body: expenseData
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const deleteExpense = useCallback(async (expenseId) => {
    setLoading(true);
    setError('');
    try {
      return await apiCall(`/admin/cashflow/expenses/${expenseId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // File Upload
  const uploadFile = useCallback(async (file, type = 'general') => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error subiendo archivo');
      }

      return response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Decks Management
  const getDecks = useCallback(async (page = 1, limit = 50) => {
    setLoading(true);
    setError('');
    try {
      return await apiCall(`/admin/decks?page=${page}&limit=${limit}`);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const createDeck = useCallback(async (deckData) => {
    setLoading(true);
    setError('');
    try {
      return await apiCall('/admin/decks', { method: 'POST', body: deckData });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const updateDeck = useCallback(async (deckId, deckData) => {
    setLoading(true);
    setError('');
    try {
      return await apiCall(`/admin/decks/${deckId}`, { method: 'PUT', body: deckData });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const deleteDeck = useCallback(async (deckId) => {
    setLoading(true);
    setError('');
    try {
      return await apiCall(`/admin/decks/${deckId}`, { method: 'DELETE' });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Deck -> Cards Management
  const getDeckCards = useCallback(async (deckId) => {
    setLoading(true); setError('');
    try {
      return await apiCall(`/admin/decks/${deckId}/cards`);
    } catch (err) {
      setError(err.message); throw err;
    } finally { setLoading(false); }
  }, [apiCall]);

  const createDeckCard = useCallback(async (deckId, cardData) => {
    setLoading(true); setError('');
    try {
      return await apiCall(`/admin/decks/${deckId}/cards`, { method: 'POST', body: cardData });
    } catch (err) {
      setError(err.message); throw err;
    } finally { setLoading(false); }
  }, [apiCall]);

  const updateDeckCard = useCallback(async (deckId, cardId, cardData) => {
    setLoading(true); setError('');
    try {
      return await apiCall(`/admin/decks/${deckId}/cards/${cardId}`, { method: 'PUT', body: cardData });
    } catch (err) { setError(err.message); throw err; } finally { setLoading(false); }
  }, [apiCall]);

  const deleteDeckCard = useCallback(async (deckId, cardId) => {
    setLoading(true); setError('');
    try {
      return await apiCall(`/admin/decks/${deckId}/cards/${cardId}`, { method: 'DELETE' });
    } catch (err) { setError(err.message); throw err; } finally { setLoading(false); }
  }, [apiCall]);

  const bulkCreateDeckCards = useCallback(async (deckId, cardsArray) => {
    setLoading(true); setError('');
    try {
      return await apiCall(`/admin/decks/${deckId}/cards/bulk`, { method: 'POST', body: { cards: cardsArray } });
    } catch (err) { setError(err.message); throw err; } finally { setLoading(false); }
  }, [apiCall]);

  return {
    loading,
    error,
    setError,
    // Blog
    getBlogPosts,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    // Shop
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    // Stripe
    getStripeStats,
    getStripeCustomers,
    getStripeSubscriptions,
    getStripePayments,
    // Cashflow
    getCashflowStats,
    getIncomeData,
    getExpenseData,
    addExpense,
    updateExpense,
    deleteExpense,
    // Utils
    uploadFile
    ,
    // Decks
    getDecks,
    createDeck,
    updateDeck,
    deleteDeck
    ,
    // Deck cards
    getDeckCards,
    createDeckCard,
    updateDeckCard,
    deleteDeckCard,
    bulkCreateDeckCards
  };
};