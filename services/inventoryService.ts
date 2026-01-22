
import { Equipment, Collaborator, SoftwareLicense, MaintenanceRecord, Credential, EquipmentStatus } from '../types';

// Initial Mock Data
let equipment: Equipment[] = [
  { id: 1, companyId: 1, siteId: 1, type: 'Laptop', brand: 'Dell', model: 'Latitude 5420', serialNumber: 'DL5420-X1', status: EquipmentStatus.ACTIVE, location: 'Oficina Central', assignedTo: 1, purchaseDate: '2023-01-15', processor: 'Intel i7', ram: '16GB', storage: '512GB SSD', os: 'Windows 11' },
  { id: 2, companyId: 1, siteId: 1, type: 'Servidor', brand: 'HP', model: 'ProLiant DL380', serialNumber: 'HP-SRV-99', status: EquipmentStatus.ACTIVE, location: 'Data Center 1', assignedTo: undefined, purchaseDate: '2022-05-10' },
  { id: 3, companyId: 2, siteId: 2, type: 'Laptop', brand: 'Apple', model: 'MacBook Pro M2', serialNumber: 'MBP-M2-001', status: EquipmentStatus.MAINTENANCE, location: 'Sede Caldas', assignedTo: 2, purchaseDate: '2023-11-20' }
];

let collaborators: Collaborator[] = [
  { id: 1, companyId: 1, siteId: 1, firstName: 'Bayron', lastName: 'Ramos', email: 'bayron@ecovitta.com', area: 'TIC', cargo: 'Líder Infraestructura' },
  { id: 2, companyId: 2, siteId: 2, firstName: 'Maria', lastName: 'Gomez', email: 'm.gomez@caldas.com', area: 'Producción', cargo: 'Operadora' }
];

let licenses: SoftwareLicense[] = [
  { id: 1, companyId: 1, name: 'Office 365 Business', key: 'XXXXX-XXXXX-XXXXX', expirationDate: '2026-12-31', type: 'Suscripción', status: 'Active' },
  { id: 2, companyId: 1, name: 'Adobe Creative Cloud', key: 'ADOBE-9922', expirationDate: '2025-02-15', type: 'Suscripción', status: 'Expiring Soon' }
];

export const getEquipmentByCompany = (companyId: number) => equipment.filter(e => e.companyId === companyId);
export const getCollaboratorsByCompany = (companyId: number) => collaborators.filter(c => c.companyId === companyId);
export const getLicensesByCompany = (companyId: number) => licenses.filter(l => l.companyId === companyId);

export const addEquipment = (data: Omit<Equipment, 'id'>) => {
  const newId = equipment.length > 0 ? Math.max(...equipment.map(e => e.id)) + 1 : 1;
  const newEquip = { ...data, id: newId };
  equipment.push(newEquip);
  return newEquip;
};

export const deleteEquipment = (id: number) => {
  equipment = equipment.filter(e => e.id !== id);
};
