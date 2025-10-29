import api from './apiClient.js';

// Obtiene el usuario actual del localStorage (sin llamada al backend)
export function getCurrentUser() {
  return new Promise((resolve) => {
    const stored = localStorage.getItem('authUser')
    resolve(stored ? JSON.parse(stored) : null)
  })
}

export async function register({ email, password, username, birthDate, zodiacSign, role, acceptLegal, acceptNewsletter }) {
  const { data } = await api.post('/api/auth/register', {
    email, password, username, birthDate, role, acceptLegal, acceptNewsletter
  });
  localStorage.setItem('arcanaToken', data.token);
  return data.user; 
}

export async function login({ email, password }) {
  const { data } = await api.post('/api/auth/login', { email, password });
  localStorage.setItem('arcanaToken', data.token);
  return data.user;
}

export async function logout() {
  await api.post('/auth/logout');
  localStorage.removeItem('arcanaToken');
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data.member; 
}

export async function updateProfile(updates) {
  const { data } = await api.put('/auth/profile', updates);
  return data.member;
}

// ==========================================
// FUNCIONES DE ADMINISTRACIÓN
// ==========================================

export const adminAPI = {
  // Obtener todos los usuarios
  async getAllUsers() {
    const { data } = await api.get('/admin/users');
    return data;
  },

  // Obtener estadísticas del sistema
  async getStats() {
    const { data } = await api.get('/admin/stats');
    return data;
  },

  // Eliminar usuario
  async deleteUser(userId) {
    const { data } = await api.delete(`/admin/users/${userId}`);
    return data;
  },

  // Actualizar rol de usuario
  async updateUserRole(userId, role) {
    const { data } = await api.put(`/admin/users/${userId}/role`, { role });
    return data;
  },

  // Actualizar plan de suscripción
  async updateUserPlan(userId, plan) {
    const { data } = await api.put(`/admin/users/${userId}/plan`, { plan });
    return data;
  },

  // Obtener logs de actividad
  async getLogs(page = 1, limit = 50) {
    const { data } = await api.get(`/admin/logs?page=${page}&limit=${limit}`);
    return data;
  },

  // Verificar estado del sistema
  async getSystemStatus() {
    const { data } = await api.get('/admin/system/status');
    return data;
  },

  // Backup de base de datos
  async createBackup() {
    const { data } = await api.post('/admin/system/backup');
    return data;
  },

  // Restaurar backup
  async restoreBackup(backupId) {
    const { data } = await api.post(`/admin/system/restore/${backupId}`);
    return data;
  }
};
