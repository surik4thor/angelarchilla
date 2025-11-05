import { useState, useCallback } from 'react';
import api from '../api/apiClient.js';

export function useReading() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentReading, setCurrentReading] = useState(null);


  const createReading = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/readings', payload);
      setCurrentReading(data.reading);
      return data.reading;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear lectura');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/readings/history');
      return data.history;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener historial');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear lectura completa (el backend se encarga de la interpretación automáticamente)
  const performReading = useCallback(async (readingData) => {
    setLoading(true);
    setError(null);
    try {
      // Usar endpoint centralizado para todas las lecturas
      const { data } = await api.post('/readings', {
        type: readingData.type,
        spreadType: readingData.spreadType,
        deckType: readingData.deckType,
        question: readingData.question,
        anonBirthDate: readingData.anonBirthDate,
        anonGender: readingData.anonGender
      });
      setCurrentReading(data.reading);
      return data.reading;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al crear la lectura';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener una lectura específica
  const getReading = useCallback(async (readingId) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await api.get(`/readings/${readingId}`);
      setCurrentReading(data.reading);
      return data.reading;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al obtener la lectura';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpiar estado
  const clearReading = useCallback(() => {
    setCurrentReading(null);
    setError(null);
  }, []);

  return { 
    loading, 
    error, 
    currentReading,
    createReading, 
    getHistory,
    performReading,
    getReading,
    clearReading
  };
}
