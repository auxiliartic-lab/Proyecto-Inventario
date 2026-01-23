
import { Equipment, Collaborator, SoftwareLicense, EquipmentStatus, MaintenanceRecord } from '../types';

const STORAGE_KEY = 'equitrack_data_v1';

// Definición de datos iniciales (Seed Data)
const initialEquipment: Equipment[] = [
  { id: 1, companyId: 1, siteId: 1, type: 'Laptop', brand: 'Dell', model: 'Latitude 5420', serialNumber: 'DL5420-X1', status: EquipmentStatus.ACTIVE, location: 'Oficina Central', assignedTo: 1, purchaseDate: '2023-01-15', processor: 'Intel i7', ram: '16GB', storage: '512GB SSD', os: 'Windows 11' },
  { id: 2, companyId: 1, siteId: 1, type: 'Servidor', brand: 'HP', model: 'ProLiant DL380', serialNumber: 'HP-SRV-99', status: EquipmentStatus.ACTIVE, location: 'Data Center 1', assignedTo: undefined, purchaseDate: '2022-05-10' },
  { id: 3, companyId: 2, siteId: 2, type: 'Laptop', brand: 'Apple', model: 'MacBook Pro M2', serialNumber: 'MBP-M2-001', status: EquipmentStatus.MAINTENANCE, location: 'Sede Caldas', assignedTo: 2, purchaseDate: '2023-11-20' }
];

const initialCollaborators: Collaborator[] = [
  { id: 1, companyId: 1, siteId: 1, firstName: 'Bayron', lastName: 'Ramos', email: 'bayron@ecovitta.com', area: 'TIC', cargo: 'Líder Infraestructura', sex: 'Male', isActive: true },
  { id: 2, companyId: 2, siteId: 2, firstName: 'Maria', lastName: 'Gomez', email: 'm.gomez@caldas.com', area: 'Producción', cargo: 'Operadora', sex: 'Female', isActive: true },
  { id: 3, companyId: 1, siteId: 1, firstName: 'Juan', lastName: 'Perez', email: 'j.perez@ecovitta.com', area: 'RRHH', cargo: 'Analista', sex: 'Male', isActive: false }
];

const initialLicenses: SoftwareLicense[] = [
  { id: 1, companyId: 1, name: 'Office 365 Business', key: 'XXXXX-XXXXX-XXXXX', expirationDate: '2026-12-31', type: 'Suscripción', status: 'Active' },
  { id: 2, companyId: 1, name: 'Adobe Creative Cloud', key: 'ADOBE-9922', expirationDate: '2025-02-15', type: 'Suscripción', status: 'Expiring Soon' }
];

const initialMaintenance: MaintenanceRecord[] = [
  { id: 1, companyId: 2, equipmentId: 3, date: '2023-12-01', title: 'Falla de Pantalla', description: 'La pantalla parpadea intermitentemente.', severity: 'Moderate', status: 'Open', technician: 'Soporte Externo' }
];

interface AppData {
  equipment: Equipment[];
  collaborators: Collaborator[];
  licenses: SoftwareLicense[];
  maintenance: MaintenanceRecord[];
}

// Función para cargar datos del LocalStorage o usar los iniciales
const loadData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Si no hay datos guardados, guardamos los iniciales
  const initialData = {
    equipment: initialEquipment,
    collaborators: initialCollaborators,
    licenses: initialLicenses,
    maintenance: initialMaintenance
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
};

// Cargar datos en memoria
let currentData = loadData();

// Función auxiliar para guardar cambios
const saveData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
};

// --- FUNCIONES DE EQUIPOS ---
export const getEquipmentByCompany = (companyId: number): Equipment[] => {
  return currentData.equipment.filter(e => e.companyId === companyId);
};

export const getEquipmentById = (id: number): Equipment | undefined => {
  return currentData.equipment.find(e => e.id === id);
};

export const addEquipment = (data: Omit<Equipment, 'id'>): Equipment => {
  const newId = currentData.equipment.length > 0 ? Math.max(...currentData.equipment.map(e => e.id)) + 1 : 1;
  const newEquip: Equipment = { ...data, id: newId };
  currentData.equipment.push(newEquip);
  saveData();
  return newEquip;
};

export const updateEquipment = (updatedData: Equipment): void => {
  const index = currentData.equipment.findIndex(e => e.id === updatedData.id);
  if (index !== -1) {
    currentData.equipment[index] = updatedData;
    saveData();
  }
};

export const deleteEquipment = (id: number): void => {
  currentData.equipment = currentData.equipment.filter(e => e.id !== id);
  // También deberíamos eliminar mantenimientos asociados (opcional, por simplicidad no lo hacemos aquí)
  saveData();
};

// --- FUNCIONES DE COLABORADORES ---
export const getCollaboratorsByCompany = (companyId: number): Collaborator[] => {
  return currentData.collaborators.filter(c => c.companyId === companyId);
};

export const addCollaborator = (data: Omit<Collaborator, 'id'>): Collaborator => {
  const newId = currentData.collaborators.length > 0 ? Math.max(...currentData.collaborators.map(c => c.id)) + 1 : 1;
  const newColl: Collaborator = { ...data, id: newId };
  currentData.collaborators.push(newColl);
  saveData();
  return newColl;
};

export const deleteCollaborator = (id: number): void => {
  currentData.collaborators = currentData.collaborators.filter(c => c.id !== id);
  saveData();
};

export const toggleCollaboratorStatus = (id: number): void => {
  const coll = currentData.collaborators.find(c => c.id === id);
  if (coll) {
    coll.isActive = !coll.isActive;
    saveData();
  }
};

// --- FUNCIONES DE LICENCIAS ---
export const getLicensesByCompany = (companyId: number): SoftwareLicense[] => {
  return currentData.licenses.filter(l => l.companyId === companyId);
};

// --- FUNCIONES DE MANTENIMIENTO ---
export const getMaintenanceByCompany = (companyId: number): MaintenanceRecord[] => {
  return (currentData.maintenance || []).filter(m => m.companyId === companyId);
};

export const addMaintenanceRecord = (data: Omit<MaintenanceRecord, 'id'>): MaintenanceRecord => {
  // Asegurarse de que el array existe
  if (!currentData.maintenance) currentData.maintenance = [];
  
  const newId = currentData.maintenance.length > 0 ? Math.max(...currentData.maintenance.map(m => m.id)) + 1 : 1;
  const newRecord: MaintenanceRecord = { ...data, id: newId };
  currentData.maintenance.push(newRecord);

  // LOGICA AUTOMATICA: Actualizar estado del equipo basado en severidad
  const equipIndex = currentData.equipment.findIndex(e => e.id === data.equipmentId);
  if (equipIndex !== -1) {
    const equip = currentData.equipment[equipIndex];
    
    if (data.severity === 'TotalLoss') {
      equip.status = EquipmentStatus.RETIRED;
      // Opcional: Desasignar usuario
      equip.assignedTo = undefined; 
    } else {
      equip.status = EquipmentStatus.MAINTENANCE;
    }
  }

  saveData();
  return newRecord;
};
