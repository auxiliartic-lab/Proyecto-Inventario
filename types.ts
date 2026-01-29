
import 'react';

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
  peripheralType?: string; 
}

// NUEVA INTERFAZ PARA HISTORIAL
export interface EquipmentHistory {
  id: number;
  equipmentId: number;
  date: string; // ISO String
  actionType: 'CREATION' | 'ASSIGNMENT' | 'UNASSIGNMENT' | 'STATUS_CHANGE' | 'MAINTENANCE' | 'UPDATE';
  description: string;
  user?: string; // Quién realizó la acción (simulado como 'Admin')
}

// NUEVA INTERFAZ PARA ADJUNTOS
export interface Attachment {
  id: string;
  name: string;
  type: string; // mime type
  data: string; // Base64 string
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
  totalSlots: number; // Nuevo: Capacidad total de instalaciones
  assignedTo: number[]; // Nuevo: Array de IDs de Colaboradores
  assignedToEquipment: number[]; // Nuevo: Array de IDs de Equipos
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
  resolutionDetails?: string;
  resolutionDate?: string;
  deliveryStatus?: 'Pending' | 'Delivered';
  attachments?: Attachment[]; // Nuevo campo para evidencias
}

export interface Credential {
  id: number;
  companyId: number;
  service: string;
  username: string;
  password?: string;
  description: string;
  assignedTo?: number; // Asignación a Colaborador
  assignedToEquipment?: number; // Nueva: Asignación a Equipo
}

// Fix: Add explicit JSX.IntrinsicElements definition to suppress TS errors about HTML tags
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
