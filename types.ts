
export enum UserRole {
  ADMIN = 'Administrador',
  TECHNICIAN = 'Técnico',
  CONSULTANT = 'Consultor'
}

export enum EquipmentStatus {
  ACTIVE = 'Activo',
  MAINTENANCE = 'Mantenimiento',
  RETIRED = 'Retirado',
  LOST = 'Perdido'
}

export type MaintenanceSeverity = 'Moderate' | 'Severe' | 'TotalLoss';

export interface Company {
  id: number;
  name: string;
  color: string;
  logo: string;
}

export interface Site {
  id: number;
  companyId: number;
  name: string;
  address: string;
}

export interface Collaborator {
  id: number;
  companyId: number;
  siteId: number;
  firstName: string;
  lastName: string;
  email: string;
  area: string;
  cargo: string;
  sex: 'Male' | 'Female';
  isActive: boolean;
}

export interface Equipment {
  id: number;
  companyId: number;
  siteId: number;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  status: EquipmentStatus;
  location: string;
  assignedTo?: number;
  purchaseDate: string;
  processor?: string;
  ram?: string;
  storage?: string;
  os?: string;
}

export interface SoftwareLicense {
  id: number;
  companyId: number;
  name: string;
  key: string;
  vendor: string;
  startDate: string;
  expirationDate: string;
  type: string;
}

export interface MaintenanceRecord {
  id: number;
  equipmentId: number;
  companyId: number;
  date: string;
  title: string;
  description: string;
  severity: MaintenanceSeverity;
  status: 'Open' | 'Closed';
  technician?: string;
}

export interface Credential {
  id: number;
  companyId: number;
  service: string;
  username: string;
  password?: string;
  description: string;
}
