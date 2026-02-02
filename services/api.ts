
import axios from 'axios';
import * as Adapter from '../utils/apiAdapters';

// --- API CONFIGURATION ---
// CAMBIO CRITICO: Usamos la URL absoluta directa.
// Esto elimina el error "Invalid URL" porque Axios no tiene que adivinar el dominio.
// Asegúrate de que tu Laravel corre en el puerto 8000.
const API_URL = 'http://127.0.0.1:8000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 
    'Content-Type': 'application/json', 
    'Accept': 'application/json' 
  },
  withCredentials: true, // Crucial para Sanctum (Cookies/Session)
});

// REQUEST INTERCEPTOR: Attach Token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
      config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
    return Promise.reject(error);
});

// RESPONSE INTERCEPTOR: Handle Global Errors (like 401)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Debugging: Loggear error detallado en consola
    console.error("API Error:", error.response?.status, error.message, error.config?.url);

    // Si el error es 401 (No autorizado) y no es la petición de login, cerrar sesión
    if (error.response && error.response.status === 401 && !error.config.url.includes('/login')) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('inventory_user_session');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
         window.location.href = '/'; 
      }
    }
    return Promise.reject(error);
  }
);

// --- SERVICES ---

export const authService = {
  login: async (u: string, p: string) => (await axiosInstance.post('/login', { email: u, password: p })).data,
  logout: () => axiosInstance.post('/logout'),
  me: async () => Adapter.adaptUserFromApi((await axiosInstance.get('/user')).data)
};

export const equipmentService = {
  getAll: async () => (await axiosInstance.get('/equipment')).data.data.map(Adapter.adaptEquipmentFromApi),
  getOne: async (id: number) => Adapter.adaptEquipmentFromApi((await axiosInstance.get(`/equipment/${id}`)).data),
  create: async (d: any) => Adapter.adaptEquipmentFromApi((await axiosInstance.post('/equipment', Adapter.adaptEquipmentToApi(d))).data),
  update: async (id: number, d: any) => Adapter.adaptEquipmentFromApi((await axiosInstance.put(`/equipment/${id}`, Adapter.adaptEquipmentToApi(d))).data),
  delete: (id: number) => axiosInstance.delete(`/equipment/${id}`),
  attachLicense: (eid: number, lid: number) => axiosInstance.post(`/equipment/${eid}/licenses`, { license_id: lid }),
  detachLicense: (eid: number, lid: number) => axiosInstance.delete(`/equipment/${eid}/licenses/${lid}`),
};

export const collaboratorService = {
  getAll: async () => (await axiosInstance.get('/collaborators')).data.data.map(Adapter.adaptCollaboratorFromApi),
  create: async (d: any) => Adapter.adaptCollaboratorFromApi((await axiosInstance.post('/collaborators', Adapter.adaptCollaboratorToApi(d))).data),
  update: async (id: number, d: any) => Adapter.adaptCollaboratorFromApi((await axiosInstance.put(`/collaborators/${id}`, Adapter.adaptCollaboratorToApi(d))).data),
  delete: (id: number) => axiosInstance.delete(`/collaborators/${id}`),
  toggleStatus: async (id: number) => Adapter.adaptCollaboratorFromApi((await axiosInstance.patch(`/collaborators/${id}/toggle-status`)).data),
  importBulk: (d: any[]) => axiosInstance.post('/collaborators/bulk', { collaborators: d.map(Adapter.adaptCollaboratorToApi) }),
};

export const licenseService = {
  getAll: async () => (await axiosInstance.get('/licenses')).data.data.map(Adapter.adaptLicenseFromApi),
  create: async (d: any) => Adapter.adaptLicenseFromApi((await axiosInstance.post('/licenses', Adapter.adaptLicenseToApi(d))).data),
  update: async (id: number, d: any) => Adapter.adaptLicenseFromApi((await axiosInstance.put(`/licenses/${id}`, Adapter.adaptLicenseToApi(d))).data),
  delete: (id: number) => axiosInstance.delete(`/licenses/${id}`),
};

export const maintenanceService = {
  getAll: async () => (await axiosInstance.get('/maintenance')).data.data.map(Adapter.adaptMaintenanceFromApi),
  create: async (d: any) => Adapter.adaptMaintenanceFromApi((await axiosInstance.post('/maintenance', Adapter.adaptMaintenanceToApi(d))).data),
  resolve: async (id: number, d: any) => Adapter.adaptMaintenanceFromApi((await axiosInstance.put(`/maintenance/${id}`, { 
      resolution_details: d.resolutionDetails, resolution_date: d.resolutionDate, delivery_status: d.deliveryStatus, status: 'Closed' 
  })).data),
  toggleDelivery: async (id: number) => Adapter.adaptMaintenanceFromApi((await axiosInstance.patch(`/maintenance/${id}/toggle-delivery`)).data),
};

export const credentialService = {
  getAll: async () => (await axiosInstance.get('/credentials')).data.data.map(Adapter.adaptCredentialFromApi),
  create: async (d: any) => Adapter.adaptCredentialFromApi((await axiosInstance.post('/credentials', Adapter.adaptCredentialToApi(d))).data),
  update: async (id: number, d: any) => Adapter.adaptCredentialFromApi((await axiosInstance.put(`/credentials/${id}`, Adapter.adaptCredentialToApi(d))).data),
  delete: (id: number) => axiosInstance.delete(`/credentials/${id}`),
};

export const userService = {
  getAll: async () => (await axiosInstance.get('/users')).data.data.map(Adapter.adaptUserFromApi),
  create: async (d: any) => Adapter.adaptUserFromApi((await axiosInstance.post('/users', Adapter.adaptUserToApi(d))).data),
  update: async (id: number, d: any) => Adapter.adaptUserFromApi((await axiosInstance.put(`/users/${id}`, Adapter.adaptUserToApi(d))).data),
  delete: (id: number) => axiosInstance.delete(`/users/${id}`),
};

export default {
    authService,
    equipmentService,
    collaboratorService,
    licenseService,
    maintenanceService,
    credentialService,
    userService
};
