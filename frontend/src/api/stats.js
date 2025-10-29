import api from './apiClient.js'

export async function saveAnonUserStats({ fechaNac, genero }) {
  const { data } = await api.post('/stats', { fechaNac, genero })
  return data
}