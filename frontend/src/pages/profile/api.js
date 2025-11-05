export async function getDreamHistory() {
  const res = await api.get('/api/dreams/history');
  return res.data.dreams || [];
}
export async function fetchHoroscope(fechaNac, genero) {
  // Consulta horóscopo diario a la IA si no hay caché
  const res = await api.get(`/api/horoscope?fechaNac=${fechaNac}&genero=${genero}`);
  return res.data.mensaje;
}
import api from '../../api/apiClient.js';

export async function getReadingStatsAndHistory() {
  // Obtiene estadísticas y el historial de lecturas del usuario autenticado
  const statsPromise = api.get('/api/auth/me');
  const historyPromise = api.get('/api/readings/history');
  const [statsRes, historyRes] = await Promise.all([statsPromise, historyPromise]);
  return {
    user: statsRes.data.member,
    readingsHistory: historyRes.data.history || []
  };
}
