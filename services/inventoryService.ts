
import { Equipment, Collaborator, SoftwareLicense, MaintenanceRecord, Credential, EquipmentHistory, User } from '../types';

export interface AppData {
  equipment: Equipment[];
  collaborators: Collaborator[];
  licenses: SoftwareLicense[];
  maintenance: MaintenanceRecord[];
  credentials: Credential[];
  history: EquipmentHistory[];
  users: User[];
}

// Local storage logic has been removed to enforce API-only architecture.
