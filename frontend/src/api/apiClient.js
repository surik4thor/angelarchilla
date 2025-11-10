import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || (
    import.meta.env.DEV ? 'http://localhost:5050' : 'https://nebulosamagica.com'
  ),
  withCredentials: true,            // Envía cookies (JWT)
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adjuntar token manual
api.interceptors.request.use(config => {
  const token = localStorage.getItem('arcanaToken');
  
  // Solo agregar Authorization header si hay token
  if (token && token.trim() !== '') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Agregar timestamp para debugging
  config.metadata = { requestTime: Date.now() };
  
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor de respuesta para manejar errores 401
api.interceptors.response.use(
  response => {
    // Log exitoso para debugging
    if (response.config.metadata) {
      const duration = Date.now() - response.config.metadata.requestTime;
      console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    return response;
  },
  error => {
    // Log error para debugging
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
    const url = error.config?.url || 'unknown-url';
    const status = error.response?.status || 'NO_RESPONSE';
    
    console.error(`❌ API Error: ${method} ${url} - Status: ${status}`, {
      error: error.response?.data,
      headers: error.config?.headers
    });

    if (error.response?.status === 401) {
      console.warn('🔐 Token inválido - limpiando autenticación');
      
      // Token inválido o expirado - limpiar localStorage
      localStorage.removeItem('arcanaToken');
      localStorage.removeItem('authUser');
      
      // Disparar evento personalizado para que AuthProvider se entere
      window.dispatchEvent(new CustomEvent('auth-cleared'));
      
      // Solo redirigir si no estamos ya en login/registro y no es una petición de auth
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register') &&
          !url.includes('/auth/')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
