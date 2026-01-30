
import axios from 'axios';
import { 
  User, Equipment, Collaborator, SoftwareLicense, 
  MaintenanceRecord, Credential, Company 
} from '../types';

// Configuración base
const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Necesario para Laravel Sanctum
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Sesión expirada o no autorizada');
      localStorage.removeItem('inventory_user_session');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

// --- AUTHENTICATION ---
export const authService = {
  login: (username: string, pin: string) => api.post('/login', { username, pin }),
  logout: () => api.post('/logout'),
  me: () => api.get<User>('/user'),
};

// --- EQUIPMENT ---
export const equipmentService = {
  getAll: (companyId: number) => api.get<Equipment[]>(`/companies/${companyId}/equipment`),
  getOne: (id: number) => api.get<Equipment>(`/equipment/${id}`),
  create: (data: Omit<Equipment, 'id'>) => api.post<Equipment>('/equipment', data),
  update: (id: number, data: Partial<Equipment>) => api.put<Equipment>(`/equipment/${id}`, data),
  delete: (id: number) => api.delete(`/equipment/${id}`),
  // Assign license to equipment
  attachLicense: (equipmentId: number, licenseId: number) => api.post(`/equipment/${equipmentId}/licenses`, { license_id: licenseId }),
  detachLicense: (equipmentId: number, licenseId: number) => api.delete(`/equipment/${equipmentId}/licenses/${licenseId}`),
};

// --- COLLABORATORS ---
export const collaboratorService = {
  getAll: (companyId: number) => api.get<Collaborator[]>(`/companies/${companyId}/collaborators`),
  create: (data: Omit<Collaborator, 'id'>) => api.post<Collaborator>('/collaborators', data),
  update: (id: number, data: Partial<Collaborator>) => api.put<Collaborator>(`/collaborators/${id}`, data),
  delete: (id: number) => api.delete(`/collaborators/${id}`),
  toggleStatus: (id: number) => api.patch(`/collaborators/${id}/toggle-status`),
  importBulk: (data: Omit<Collaborator, 'id'>[]) => api.post('/collaborators/bulk', { collaborators: data }),
};

// --- LICENSES ---
export const licenseService = {
  getAll: (companyId: number) => api.get<SoftwareLicense[]>(`/companies/${companyId}/licenses`),
  create: (data: Omit<SoftwareLicense, 'id'>) => api.post<SoftwareLicense>('/licenses', data),
  update: (id: number, data: Partial<SoftwareLicense>) => api.put<SoftwareLicense>(`/licenses/${id}`, data),
  delete: (id: number) => api.delete(`/licenses/${id}`),
};

// --- MAINTENANCE ---
export const maintenanceService = {
  getAll: (companyId: number) => api.get<MaintenanceRecord[]>(`/companies/${companyId}/maintenance`),
  create: (data: Omit<MaintenanceRecord, 'id'>) => api.post<MaintenanceRecord>('/maintenance', data),
  resolve: (id: number, data: { resolutionDetails: string, resolutionDate: string, deliveryStatus?: string }) => 
    api.put<MaintenanceRecord>(`/maintenance/${id}/resolve`, data),
  toggleDelivery: (id: number) => api.patch(`/maintenance/${id}/toggle-delivery`),
};

// --- CREDENTIALS ---
export const credentialService = {
  getAll: (companyId: number) => api.get<Credential[]>(`/companies/${companyId}/credentials`),
  create: (data: Omit<Credential, 'id'>) => api.post<Credential>('/credentials', data),
  update: (id: number, data: Partial<Credential>) => api.put<Credential>(`/credentials/${id}`, data),
  delete: (id: number) => api.delete(`/credentials/${id}`),
};

// --- USERS (SYSTEM ACCESS) ---
export const userService = {
  getAll: () => api.get<User[]>('/users'),
  create: (data: Omit<User, 'id'>) => api.post<User>('/users', data),
  update: (id: number, data: Partial<User>) => api.put<User>(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

// --- HISTORY & REPORTS ---
export const historyService = {
  getEquipmentHistory: (equipmentId: number) => api.get(`/equipment/${equipmentId}/history`),
  exportDatabase: () => api.get('/system/export', { responseType: 'blob' }),
};

export default api;
