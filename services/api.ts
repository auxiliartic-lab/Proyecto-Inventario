
import axios from 'axios';

// Configuración base para conectar con Laravel
const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Necesario para Laravel Sanctum (Cookies CSRF)
});

// Interceptor para manejar errores globales (ej: Token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Lógica para redirigir a login si la sesión expira
      console.warn('Sesión expirada o no autorizada');
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;
