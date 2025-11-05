import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || (
    import.meta.env.DEV ? 'http://localhost:5050' : ''
  ),
  withCredentials: true,            // Envía cookies (JWT)
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adjuntar token manual
api.interceptors.request.use(config => {
  const token = localStorage.getItem('arcanaToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
