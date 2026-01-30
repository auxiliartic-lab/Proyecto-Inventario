
import React from 'react';

export enum UserRole {
  ADMIN = 'Administrador',
  CONSULTANT = 'Consultor'
}

export enum EquipmentStatus {
  ACTIVE = 'Activo',
  MAINTENANCE = 'Mantenimiento',
  RETIRED = 'Retirado',
  LOST = 'Perdido'
}

export type MaintenanceSeverity = 'Moderate' | 'Severe' | 'TotalLoss';

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
  pin?: string; // Contraseña/PIN de acceso
  collaboratorId?: number; // Vínculo con la ficha de colaborador (Datos reales, equipos, etc.)
}

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

export interface EquipmentHistory {
  id: number;
  equipmentId: number;
  date: string; // ISO String
  actionType: 'CREATION' | 'ASSIGNMENT' | 'UNASSIGNMENT' | 'STATUS_CHANGE' | 'MAINTENANCE' | 'UPDATE';
  description: string;
  user?: string; // Quién realizó la acción
}

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

// Global augmentation to fix missing JSX.IntrinsicElements definitions
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
      div: any;
      span: any;
      p: any;
      i: any;
      b: any;
      strong: any;
      button: any;
      a: any;
      img: any;
      h1: any;
      h2: any;
      h3: any;
      h4: any;
      h5: any;
      h6: any;
      input: any;
      label: any;
      select: any;
      option: any;
      textarea: any;
      form: any;
      table: any;
      thead: any;
      tbody: any;
      tr: any;
      th: any;
      td: any;
      ul: any;
      li: any;
      nav: any;
      header: any;
      main: any;
      footer: any;
      aside: any;
      section: any;
      code: any;
      br: any;
      style: any;
      datalist: any;
      svg: any;
      path: any;
      circle: any;
    }
  }
}
