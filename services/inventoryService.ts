
import { Equipment, Collaborator, SoftwareLicense, EquipmentStatus, MaintenanceRecord, Credential, EquipmentHistory, User, UserRole } from '../types';
import { initialEquipment, initialCollaborators, initialLicenses, initialMaintenance, initialCredentials } from '../data/seedData';

const STORAGE_KEY = 'equitrack_data_v1';

export interface AppData {
  equipment: Equipment[];
  collaborators: Collaborator[];
  licenses: SoftwareLicense[];
  maintenance: MaintenanceRecord[];
  credentials: Credential[];
  history: EquipmentHistory[];
  users: User[]; // Nueva entidad
}

// Función pura para cargar datos
export const loadData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    
    // Migraciones simples
    if (!parsed.credentials) parsed.credentials = [];
    if (!parsed.history) parsed.history = [];
    
    // Migración Usuarios: Si no existen, creamos el admin por defecto
    if (!parsed.users || parsed.users.length === 0) {
        parsed.users = [{
            id: 1,
            username: 'admin',
            name: 'Administrador Principal',
            role: UserRole.ADMIN,
            pin: '0000',
            collaboratorId: 1 // Link to Bayron Ramos (Seed ID 1)
        }];
    }
    
    return parsed;
  }

  // Datos Iniciales (Seed)
  const initialData: AppData = {
    equipment: initialEquipment,
    collaborators: initialCollaborators,
    licenses: initialLicenses,
    maintenance: initialMaintenance,
    credentials: initialCredentials,
    history: [],
    users: [
        { 
            id: 1, 
            username: 'admin', 
            name: 'Administrador Principal', 
            role: UserRole.ADMIN, 
            pin: '0000',
            collaboratorId: 1 // Link to Bayron Ramos (IT Lead)
        },
        { 
            id: 2, 
            username: 'consultor', 
            name: 'Auditor Externo', 
            role: UserRole.CONSULTANT, 
            pin: '1234' 
        }
    ]
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
