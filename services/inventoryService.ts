
import { Equipment, Collaborator, SoftwareLicense, EquipmentStatus, MaintenanceRecord } from '../types';

const STORAGE_KEY = 'equitrack_data_v1';

// Definición de datos iniciales (Seed Data)
const initialEquipment: Equipment[] = [
  { id: 1, companyId: 1, siteId: 1, type: 'Laptop', brand: 'Dell', model: 'Latitude 5420', serialNumber: 'DL5420-X1', status: EquipmentStatus.ACTIVE, location: 'Oficina Central', assignedTo: 1, purchaseDate: '2023-01-15', processor: 'Intel i7', ram: '16GB', storage: '512GB SSD', os: 'Windows 11' },
  { id: 2, companyId: 1, siteId: 1, type: 'Servidor', brand: 'HP', model: 'ProLiant DL380', serialNumber: 'HP-SRV-99', status: EquipmentStatus.ACTIVE, location: 'Data Center 1', assignedTo: undefined, purchaseDate: '2022-05-10' },
  { id: 3, companyId: 2, siteId: 2, type: 'Laptop', brand: 'Apple', model: 'MacBook Pro M2', serialNumber: 'MBP-M2-001', status: EquipmentStatus.MAINTENANCE, location: 'Sede Caldas', assignedTo: 2, purchaseDate: '2023-11-20' },
  
  // Equipos Química Básica
  { id: 4, companyId: 3, siteId: 3, type: 'Laptop', brand: 'Lenovo', model: 'ThinkPad T14', serialNumber: 'LN-TP14-001', status: EquipmentStatus.ACTIVE, location: 'Oficina Compras', assignedTo: 4, purchaseDate: '2023-03-10', processor: 'AMD Ryzen 5', ram: '16GB', storage: '512GB SSD', os: 'Windows 11 Pro' },
  { id: 5, companyId: 3, siteId: 3, type: 'Laptop', brand: 'Dell', model: 'Latitude 7420', serialNumber: 'DL-7420-002', status: EquipmentStatus.ACTIVE, location: 'Oficina Planta', assignedTo: 5, purchaseDate: '2023-01-20', processor: 'Intel i7', ram: '32GB', storage: '1TB SSD', os: 'Windows 10 Pro' },
  { id: 6, companyId: 3, siteId: 3, type: 'Desktop', brand: 'HP', model: 'ProDesk 400', serialNumber: 'HP-PD400-003', status: EquipmentStatus.ACTIVE, location: 'Contabilidad', assignedTo: 6, purchaseDate: '2022-11-05', processor: 'Intel i5', ram: '16GB', storage: '256GB SSD', os: 'Windows 10' },
  { id: 7, companyId: 3, siteId: 3, type: 'Laptop', brand: 'Apple', model: 'MacBook Air M1', serialNumber: 'MBA-M1-004', status: EquipmentStatus.ACTIVE, location: 'Nuevos Negocios', assignedTo: 7, purchaseDate: '2023-06-15', processor: 'M1', ram: '8GB', storage: '256GB SSD', os: 'macOS Monterey' },
  { id: 8, companyId: 3, siteId: 3, type: 'Laptop', brand: 'Lenovo', model: 'ThinkPad X1 Carbon', serialNumber: 'LN-X1-005', status: EquipmentStatus.ACTIVE, location: 'RRHH', assignedTo: 8, purchaseDate: '2023-02-01', processor: 'Intel i7', ram: '16GB', storage: '512GB SSD', os: 'Windows 11' },
  { id: 9, companyId: 3, siteId: 3, type: 'Tablet', brand: 'Samsung', model: 'Galaxy Tab S8', serialNumber: 'SM-TABS8-006', status: EquipmentStatus.ACTIVE, location: 'Planta - Calidad', assignedTo: 9, purchaseDate: '2023-08-20', storage: '128GB', os: 'Android 13' },
  { id: 10, companyId: 3, siteId: 3, type: 'Smartphone', brand: 'Apple', model: 'iPhone 13', serialNumber: 'IP13-007', status: EquipmentStatus.ACTIVE, location: 'Seguridad', assignedTo: 10, purchaseDate: '2023-05-10', storage: '128GB', os: 'iOS 16' },
  { id: 11, companyId: 3, siteId: 3, type: 'Laptop', brand: 'Dell', model: 'Vostro 3510', serialNumber: 'DL-VS3510-008', status: EquipmentStatus.MAINTENANCE, location: 'Mantenimiento', assignedTo: 11, purchaseDate: '2022-09-30', processor: 'Intel i5', ram: '8GB', storage: '1TB HDD', os: 'Windows 10' },
  { id: 12, companyId: 3, siteId: 3, type: 'Desktop', brand: 'Lenovo', model: 'ThinkCentre Neo', serialNumber: 'LN-TC-009', status: EquipmentStatus.ACTIVE, location: 'Recepción', assignedTo: 12, purchaseDate: '2023-04-12', processor: 'Intel i3', ram: '8GB', storage: '256GB SSD', os: 'Windows 11' },
  { id: 13, companyId: 3, siteId: 3, type: 'Periférico', brand: 'Zebra', model: 'Barcode Scanner', serialNumber: 'ZB-SCN-010', status: EquipmentStatus.ACTIVE, location: 'Almacén', assignedTo: 13, purchaseDate: '2023-01-05' },
  { id: 14, companyId: 3, siteId: 3, type: 'Servidor', brand: 'Dell', model: 'PowerEdge T440', serialNumber: 'DL-PE-T440', status: EquipmentStatus.ACTIVE, location: 'Cuarto de Servidores', assignedTo: undefined, purchaseDate: '2021-12-15', processor: 'Xeon Silver', ram: '64GB', storage: '4TB RAID', os: 'Windows Server 2019' },
  { id: 15, companyId: 3, siteId: 3, type: 'Laptop', brand: 'HP', model: 'EliteBook 840', serialNumber: 'HP-EB840-011', status: EquipmentStatus.ACTIVE, location: 'Logística', assignedTo: 14, purchaseDate: '2023-07-01', processor: 'Intel i5', ram: '16GB', storage: '512GB SSD', os: 'Windows 11' }
];

const initialCollaborators: Collaborator[] = [
  // Datos originales
  { id: 1, companyId: 1, siteId: 1, firstName: 'Bayron', lastName: 'Ramos', email: 'bayron@ecovitta.com', area: 'TIC', cargo: 'Líder Infraestructura', sex: 'Male', isActive: true },
  { id: 2, companyId: 2, siteId: 2, firstName: 'Maria', lastName: 'Gomez', email: 'm.gomez@caldas.com', area: 'Producción', cargo: 'Operadora', sex: 'Female', isActive: true },
  { id: 3, companyId: 1, siteId: 1, firstName: 'Juan', lastName: 'Perez', email: 'j.perez@ecovitta.com', area: 'RRHH', cargo: 'Analista', sex: 'Male', isActive: false },
  
  // Nuevos Colaboradores (Química Básica)
  { id: 4, companyId: 3, siteId: 3, firstName: 'Jhon Eduard', lastName: 'Ruiz Medina', email: 'jhoneduard.ruiz@qbasica.com', area: 'Compras', cargo: 'Jefe de Compras y Almacén', sex: 'Male', isActive: true },
  { id: 5, companyId: 3, siteId: 3, firstName: 'Cesar Humberto', lastName: 'Cardona Forero', email: 'cesar.cardona@gquimicas.com', area: 'Planta', cargo: 'Gerente de planta', sex: 'Male', isActive: true },
  { id: 6, companyId: 3, siteId: 3, firstName: 'Lina Marcela', lastName: 'Viveros', email: 'lina.viveros@gquimicas.com', area: 'Contabilidad', cargo: 'Analista Contable', sex: 'Female', isActive: true },
  { id: 7, companyId: 3, siteId: 3, firstName: 'Carolina', lastName: 'Angarita Lugo', email: 'carolina.angarita@qbasica.com', area: 'Comercial', cargo: 'Gerente Desarrollo de Nuevos Negocios', sex: 'Female', isActive: true },
  { id: 8, companyId: 3, siteId: 3, firstName: 'Anabell', lastName: 'Lua Sánchez', email: 'anabell.lua@qbasica.com', area: 'RRHH', cargo: 'Gerente General de Recursos Humanos', sex: 'Female', isActive: true },
  { id: 9, companyId: 3, siteId: 3, firstName: 'Enrique', lastName: 'Priego Hernández', email: 'enrique.priego@gquimicas.com', area: 'Calidad', cargo: 'Jefe de Calidad', sex: 'Male', isActive: true },
  { id: 10, companyId: 3, siteId: 3, firstName: 'Ana Isabel', lastName: 'Mejía Calixtro', email: 'anaisabel.mejia@gquimicas.com', area: 'Seguridad', cargo: 'Coordinador de Seguridad e Higiene y Ambiental', sex: 'Female', isActive: true },
  { id: 11, companyId: 3, siteId: 3, firstName: 'Abraham', lastName: 'Rivera Córdova', email: 'abraham.rivera@gquimicas.com', area: 'Mantenimiento', cargo: 'Planeador de Mantenimiento', sex: 'Male', isActive: true },
  { id: 12, companyId: 3, siteId: 3, firstName: 'Carimy', lastName: 'Urban Montoya', email: 'carimy.urban@gquimicas.com', area: 'Administración', cargo: 'Auxiliar Administrativo', sex: 'Female', isActive: true },
  { id: 13, companyId: 3, siteId: 3, firstName: 'Ariel Roberto', lastName: 'Elizalde Ramírez', email: 'ariel.elizarde@gquimicas.com', area: 'Logística', cargo: 'Jefe de Despachos', sex: 'Male', isActive: true },
  { id: 14, companyId: 3, siteId: 3, firstName: 'Itzain', lastName: 'Jiménez Silvestre', email: 'coordcomprasyalmacen@gquimicas.com', area: 'Compras', cargo: 'Coordinador de Compras y Almacén', sex: 'Male', isActive: true },
  { id: 15, companyId: 3, siteId: 3, firstName: 'Víctor Alfonso', lastName: 'Bermúdez Cuartas', email: 'victor.bermudez@gquimicas.com', area: 'Mantenimiento', cargo: 'Jefe de Mantenimiento', sex: 'Male', isActive: true },
  { id: 16, companyId: 3, siteId: 3, firstName: 'Alberto', lastName: 'Cabrera Aviles', email: 'alberto.cabrera@gquimicas.com', area: 'Instrumentación', cargo: 'Instrumentista', sex: 'Male', isActive: true },
  { id: 17, companyId: 3, siteId: 3, firstName: 'Daniela', lastName: 'Grajales Villa', email: 'daniela.grajales@qbasica.com', area: 'Administración', cargo: 'Asistente Ejecutiva', sex: 'Female', isActive: true }
];

const initialLicenses: SoftwareLicense[] = [
  { id: 1, companyId: 1, name: 'Office 365 Business', vendor: 'Microsoft', key: 'XXXXX-XXXXX-XXXXX', startDate: '2023-01-01', expirationDate: '2026-12-31', type: 'Suscripción' },
  { id: 2, companyId: 1, name: 'Adobe Creative Cloud', vendor: 'Adobe Systems', key: 'ADOBE-9922', startDate: '2024-02-15', expirationDate: '2025-02-15', type: 'Suscripción' },
  { id: 3, companyId: 1, name: 'Antivirus ESET', vendor: 'ESET', key: 'ESET-AV-2024', startDate: '2023-05-01', expirationDate: '2023-05-01', type: 'Anual' } // Ejemplo vencido
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

// Función para reiniciar datos (Factory Reset)
export const resetToFactory = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
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

export const addLicense = (data: Omit<SoftwareLicense, 'id'>): SoftwareLicense => {
  const newId = currentData.licenses.length > 0 ? Math.max(...currentData.licenses.map(l => l.id)) + 1 : 1;
  const newLicense: SoftwareLicense = { ...data, id: newId };
  currentData.licenses.push(newLicense);
  saveData();
  return newLicense;
};

export const deleteLicense = (id: number): void => {
  currentData.licenses = currentData.licenses.filter(l => l.id !== id);
  saveData();
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
