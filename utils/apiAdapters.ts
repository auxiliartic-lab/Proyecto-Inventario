
import { Equipment, Collaborator, SoftwareLicense, MaintenanceRecord, Credential, User, Company, EquipmentStatus, MaintenanceSeverity, UserRole } from '../types';

// --- HELPERS ---
const toDateString = (date: string | undefined) => date ? date.split('T')[0] : '';

// --- EQUIPMENT ADAPTERS ---
export const adaptEquipmentFromApi = (data: any): Equipment => ({
  id: data.id,
  companyId: data.company_id,
  siteId: data.site_id,
  type: data.type,
  brand: data.brand,
  model: data.model,
  serialNumber: data.serial_number,
  status: data.status as EquipmentStatus,
  location: data.location,
  assignedTo: data.assigned_to || undefined,
  purchaseDate: data.purchase_date,
  processor: data.processor,
  ram: data.ram,
  storage: data.storage,
  os: data.os,
  peripheralType: data.peripheral_type
});

export const adaptEquipmentToApi = (data: Partial<Equipment>): any => ({
  company_id: data.companyId,
  site_id: data.siteId || 1,
  assigned_to: data.assignedTo || null,
  type: data.type,
  brand: data.brand,
  model: data.model,
  serial_number: data.serialNumber,
  status: data.status,
  location: data.location,
  purchase_date: data.purchaseDate,
  processor: data.processor,
  ram: data.ram,
  storage: data.storage,
  os: data.os,
  peripheral_type: data.peripheralType
});

// --- COLLABORATOR ADAPTERS ---
export const adaptCollaboratorFromApi = (data: any): Collaborator => ({
  id: data.id,
  companyId: data.company_id,
  siteId: data.site_id,
  firstName: data.first_name,
  lastName: data.last_name,
  email: data.email,
  area: data.area,
  cargo: data.cargo,
  sex: data.sex,
  isActive: Boolean(data.is_active)
});

export const adaptCollaboratorToApi = (data: Partial<Collaborator>): any => ({
  company_id: data.companyId,
  site_id: data.siteId || 1,
  first_name: data.firstName,
  last_name: data.lastName,
  email: data.email,
  area: data.area,
  cargo: data.cargo,
  sex: data.sex,
  is_active: data.isActive
});

// --- LICENSE ADAPTERS ---
export const adaptLicenseFromApi = (data: any): SoftwareLicense => ({
  id: data.id,
  companyId: data.company_id,
  name: data.name,
  key: data.key,
  vendor: data.vendor,
  startDate: data.start_date,
  expirationDate: data.expiration_date,
  type: data.type,
  totalSlots: data.total_slots || 1,
  assignedTo: (data.collaborators || []).map((c: any) => c.id),
  assignedToEquipment: (data.equipment || []).map((e: any) => e.id)
});

export const adaptLicenseToApi = (data: Partial<SoftwareLicense>): any => ({
  company_id: data.companyId,
  name: data.name,
  key: data.key,
  vendor: data.vendor,
  start_date: data.startDate,
  expiration_date: data.expirationDate,
  type: data.type,
  total_slots: data.totalSlots,
  // Note: assignments are usually handled via separate endpoints or array of IDs depending on backend implementation
  collaborator_ids: data.assignedTo,
  equipment_ids: data.assignedToEquipment
});

// --- MAINTENANCE ADAPTERS ---
export const adaptMaintenanceFromApi = (data: any): MaintenanceRecord => ({
  id: data.id,
  companyId: data.company_id,
  equipmentId: data.equipment_id,
  date: data.date,
  title: data.title,
  description: data.description,
  severity: data.severity as MaintenanceSeverity,
  status: data.status,
  technician: data.technician,
  resolutionDetails: data.resolution_details,
  resolutionDate: data.resolution_date,
  deliveryStatus: data.delivery_status,
  attachments: data.attachments ? (typeof data.attachments === 'string' ? JSON.parse(data.attachments) : data.attachments) : []
});

export const adaptMaintenanceToApi = (data: Partial<MaintenanceRecord>): any => ({
  company_id: data.companyId,
  equipment_id: data.equipmentId,
  date: data.date,
  title: data.title,
  description: data.description,
  severity: data.severity,
  status: data.status,
  technician: data.technician,
  resolution_details: data.resolutionDetails,
  resolution_date: data.resolutionDate,
  delivery_status: data.deliveryStatus,
  attachments: data.attachments
});

// --- CREDENTIAL ADAPTERS ---
export const adaptCredentialFromApi = (data: any): Credential => ({
  id: data.id,
  companyId: data.company_id,
  service: data.service,
  username: data.username,
  password: data.password, // Ideally encrypted or omitted
  description: data.description,
  assignedTo: data.collaborator_id || undefined,
  assignedToEquipment: data.equipment_id || undefined
});

export const adaptCredentialToApi = (data: Partial<Credential>): any => ({
  company_id: data.companyId,
  service: data.service,
  username: data.username,
  password: data.password,
  description: data.description,
  collaborator_id: data.assignedTo || null,
  equipment_id: data.assignedToEquipment || null
});

// --- USER ADAPTERS ---
export const adaptUserFromApi = (data: any): User => ({
  id: data.id,
  username: data.username || data.email, // Prefer explicit username, fallback to email
  name: data.name,
  role: (data.role === 'Administrador' ? UserRole.ADMIN : UserRole.CONSULTANT),
  pin: data.pin || '', // Hide actual password in UI usually
  collaboratorId: data.collaborator_id,
  avatar: data.avatar
});

export const adaptUserToApi = (data: Partial<User>): any => ({
  name: data.name,
  username: data.username,
  email: data.username?.includes('@') ? data.username : `${data.username}@system.local`, // Fallback email if username provided without one
  password: data.pin, // Sending PIN as password
  role: data.role === UserRole.ADMIN ? 'Administrador' : 'Consultor',
  collaborator_id: data.collaboratorId
});
