
import { Equipment, Collaborator, SoftwareLicense, EquipmentStatus, MaintenanceRecord } from '../types';
import { initialEquipment, initialCollaborators, initialLicenses, initialMaintenance } from '../data/seedData';

const STORAGE_KEY = 'equitrack_data_v1';

export interface AppData {
  equipment: Equipment[];
  collaborators: Collaborator[];
  licenses: SoftwareLicense[];
  maintenance: MaintenanceRecord[];
}

// Función pura para cargar datos (sin estado global mutable expuesto)
export const loadData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Si no hay datos guardados, retornamos los iniciales
  const initialData: AppData = {
    equipment: initialEquipment,
    collaborators: initialCollaborators,
    licenses: initialLicenses,
    maintenance: initialMaintenance
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

// --- HELPERS (Deprecated for direct use, prefer Context, but kept for compatibility) ---
// Estos helpers ahora leen directamente de localStorage para evitar desincronización
// si se usan fuera del contexto, aunque se recomienda usar el Contexto.

const getCurrentData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : loadData();
};

export const getEquipmentByCompany = (companyId: number): Equipment[] => {
  return getCurrentData().equipment.filter(e => e.companyId === companyId);
};

export const getEquipmentById = (id: number): Equipment | undefined => {
  return getCurrentData().equipment.find(e => e.id === id);
};

export const getCollaboratorsByCompany = (companyId: number): Collaborator[] => {
  return getCurrentData().collaborators.filter(c => c.companyId === companyId);
};

export const getLicensesByCompany = (companyId: number): SoftwareLicense[] => {
  return getCurrentData().licenses.filter(l => l.companyId === companyId);
};

export const getMaintenanceByCompany = (companyId: number): MaintenanceRecord[] => {
  return (getCurrentData().maintenance || []).filter(m => m.companyId === companyId);
};

// Las funciones de escritura (add, update, delete) se han eliminado de aquí
// para forzar el uso del Contexto y asegurar que la UI se actualice.
// Si se necesitan aquí por compatibilidad, deberían implementarse leyendo/escribiendo
// y despachando un evento, pero por ahora migraremos al Contexto.

// Stub functions for compatibility while migrating components
export const addEquipment = (data: Omit<Equipment, 'id'>): Equipment => {
  const current = getCurrentData();
  const newId = current.equipment.length > 0 ? Math.max(...current.equipment.map(e => e.id)) + 1 : 1;
  const newEquip = { ...data, id: newId };
  current.equipment.push(newEquip);
  saveFullData(current);
  return newEquip;
};

export const updateEquipment = (updatedData: Equipment): void => {
  const current = getCurrentData();
  const index = current.equipment.findIndex(e => e.id === updatedData.id);
  if (index !== -1) {
    current.equipment[index] = updatedData;
    saveFullData(current);
  }
};

export const deleteEquipment = (id: number): void => {
  const current = getCurrentData();
  current.equipment = current.equipment.filter(e => e.id !== id);
  saveFullData(current);
};

export const addCollaborator = (data: Omit<Collaborator, 'id'>): Collaborator => {
  const current = getCurrentData();
  const newId = current.collaborators.length > 0 ? Math.max(...current.collaborators.map(c => c.id)) + 1 : 1;
  const newColl = { ...data, id: newId };
  current.collaborators.push(newColl);
  saveFullData(current);
  return newColl;
};

export const deleteCollaborator = (id: number): void => {
  const current = getCurrentData();
  current.collaborators = current.collaborators.filter(c => c.id !== id);
  saveFullData(current);
};

export const toggleCollaboratorStatus = (id: number): void => {
  const current = getCurrentData();
  const coll = current.collaborators.find(c => c.id === id);
  if (coll) {
    coll.isActive = !coll.isActive;
    saveFullData(current);
  }
};

export const addLicense = (data: Omit<SoftwareLicense, 'id'>): SoftwareLicense => {
  const current = getCurrentData();
  const newId = current.licenses.length > 0 ? Math.max(...current.licenses.map(l => l.id)) + 1 : 1;
  const newLicense = { ...data, id: newId };
  current.licenses.push(newLicense);
  saveFullData(current);
  return newLicense;
};

export const deleteLicense = (id: number): void => {
  const current = getCurrentData();
  current.licenses = current.licenses.filter(l => l.id !== id);
  saveFullData(current);
};

export const addMaintenanceRecord = (data: Omit<MaintenanceRecord, 'id'>): MaintenanceRecord => {
  const current = getCurrentData();
  if (!current.maintenance) current.maintenance = [];
  
  const newId = current.maintenance.length > 0 ? Math.max(...current.maintenance.map(m => m.id)) + 1 : 1;
  const newRecord = { ...data, id: newId };
  current.maintenance.push(newRecord);

  const equipIndex = current.equipment.findIndex(e => e.id === data.equipmentId);
  if (equipIndex !== -1) {
    const equip = current.equipment[equipIndex];
    if (data.severity === 'TotalLoss') {
      equip.status = EquipmentStatus.RETIRED;
      equip.assignedTo = undefined; 
    } else {
      equip.status = EquipmentStatus.MAINTENANCE;
    }
  }

  saveFullData(current);
  return newRecord;
};
