
import { Equipment, Collaborator, SoftwareLicense, EquipmentStatus, MaintenanceRecord, Credential, EquipmentHistory } from '../types';
import { initialEquipment, initialCollaborators, initialLicenses, initialMaintenance, initialCredentials } from '../data/seedData';

const STORAGE_KEY = 'equitrack_data_v1';

export interface AppData {
  equipment: Equipment[];
  collaborators: Collaborator[];
  licenses: SoftwareLicense[];
  maintenance: MaintenanceRecord[];
  credentials: Credential[];
  history: EquipmentHistory[]; // Nuevo campo
}

// Función pura para cargar datos (sin estado global mutable expuesto)
export const loadData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    // Migración simple: asegurar que existan los arrays nuevos si vienen de una versión vieja
    if (!parsed.credentials) parsed.credentials = [];
    if (!parsed.history) parsed.history = []; // Migración para historial
    return parsed;
  }
  // Si no hay datos guardados, retornamos los iniciales
  const initialData: AppData = {
    equipment: initialEquipment,
    collaborators: initialCollaborators,
    licenses: initialLicenses,
    maintenance: initialMaintenance,
    credentials: initialCredentials,
    history: [] // Inicialmente vacío o podrías generar uno fake en seedData
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
};

// Guardar datos completos
export const saveFullData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Función para reiniciar datos (Factory Reset)
export const resetToFactory = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};
