// Horóscopo diario personalizado IA
export async function fetchPersonalizedHoroscope() {
  const token = localStorage.getItem('arcanaToken');
  const { data } = await api.get('/api/horoscope/personalized', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return data.horoscope;
}
import api from './apiClient.js'

export async function fetchAnonymousHoroscope({ fechaNac, genero }) {
  const { data } = await api.get('/api/horoscope', {
    params: { fechaNac, genero }
  })
  return data  // { signo, mensaje }
}