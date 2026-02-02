
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  equipmentService, collaboratorService, licenseService, 
  maintenanceService, credentialService, userService 
} from '../services/api';
import { AppData } from '../services/inventoryService'; 
import { Equipment, Collaborator, SoftwareLicense, MaintenanceRecord, Credential, EquipmentHistory, User } from '../types';
import { useAuth } from './AuthContext';

interface RedirectTarget {
  type: 'equipment' | 'license' | 'credential';
  id: number;
}

interface InventoryContextType {
  data: AppData;
  loading: boolean;
  
  redirectTarget: RedirectTarget | null;
  setRedirectTarget: (target: RedirectTarget | null) => void;

  addEquipment: (data: Omit<Equipment, 'id'>, performedBy?: string) => void;
  updateEquipment: (data: Equipment, performedBy?: string) => void;
  deleteEquipment: (id: number, performedBy?: string) => void;
  saveEquipmentWithLicenses: (equipData: Equipment | Omit<Equipment, 'id'>, licenseIds: number[], isEditing: boolean, performedBy?: string) => void;

  addCollaborator: (data: Omit<Collaborator, 'id'>) => void;
  bulkAddCollaborators: (collabs: Omit<Collaborator, 'id'>[]) => void;
  updateCollaborator: (data: Collaborator) => void;
  deleteCollaborator: (id: number) => void;
  toggleCollaboratorStatus: (id: number) => void;

  addLicense: (data: Omit<SoftwareLicense, 'id'>) => void;
  updateLicense: (data: SoftwareLicense) => void;
  deleteLicense: (id: number) => void;

  addMaintenanceRecord: (data: Omit<MaintenanceRecord, 'id'>, performedBy?: string) => void;
  resolveTicket: (id: number, details: string, date: string, updatedSpecs?: Partial<Equipment>, markAsDelivered?: boolean, performedBy?: string) => void;
  toggleMaintenanceDelivery: (id: number) => void;

  addCredential: (data: Omit<Credential, 'id'>) => void;
  updateCredential: (data: Credential) => void;
  deleteCredential: (id: number) => void;

  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (userData: User) => void;
  deleteUser: (id: number) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  const [data, setData] = useState<AppData>({
    equipment: [],
    collaborators: [],
    licenses: [],
    maintenance: [],
    credentials: [],
    history: [],
    users: []
  });
  
  const [loading, setLoading] = useState(true);
  const [redirectTarget, setRedirectTarget] = useState<RedirectTarget | null>(null);

  // Fetch data on mount or when auth changes
  const fetchData = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const [equip, collabs, lics, maint, creds, users] = await Promise.all([
        equipmentService.getAll(),
        collaboratorService.getAll(),
        licenseService.getAll(),
        maintenanceService.getAll(),
        credentialService.getAll(),
        userService.getAll()
      ]);

      setData({
        equipment: equip,
        collaborators: collabs,
        licenses: lics,
        maintenance: maint,
        credentials: creds,
        history: [], 
        users: users
      });
    } catch (error) {
      console.error("Error fetching inventory data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // --- ACTIONS ---

  const saveEquipmentWithLicenses = async (
    equipData: Equipment | Omit<Equipment, 'id'>, 
    licenseIds: number[], 
    isEditing: boolean,
    performedBy: string = 'Admin'
  ) => {
    try {
      if (isEditing) {
        const id = (equipData as Equipment).id;
        await equipmentService.update(id, equipData);
      } else {
        await equipmentService.create(equipData as Omit<Equipment, 'id'>);
      }
      await fetchData(); 
    } catch (error) {
      console.error("Error saving equipment", error);
      alert("Error al guardar el equipo. Verifique los datos.");
    }
  };

  const addEquipment = (data: Omit<Equipment, 'id'>) => saveEquipmentWithLicenses(data, [], false);
  const updateEquipment = (data: Equipment) => saveEquipmentWithLicenses(data, [], true);
  
  const deleteEquipment = async (id: number) => {
    await equipmentService.delete(id);
    fetchData();
  };

  const addCollaborator = async (data: Omit<Collaborator, 'id'>) => {
    await collaboratorService.create(data);
    fetchData();
  };

  const bulkAddCollaborators = async (collabs: Omit<Collaborator, 'id'>[]) => {
    await collaboratorService.importBulk(collabs);
    fetchData();
  };

  const updateCollaborator = async (data: Collaborator) => {
    await collaboratorService.update(data.id, data);
    fetchData();
  };

  const deleteCollaborator = async (id: number) => {
    await collaboratorService.delete(id);
    fetchData();
  };

  const toggleCollaboratorStatus = async (id: number) => {
    await collaboratorService.toggleStatus(id);
    fetchData();
  };

  const addLicense = async (data: Omit<SoftwareLicense, 'id'>) => {
    await licenseService.create(data);
    fetchData();
  };

  const updateLicense = async (data: SoftwareLicense) => {
    await licenseService.update(data.id, data);
    fetchData();
  };

  const deleteLicense = async (id: number) => {
    await licenseService.delete(id);
    fetchData();
  };

  const addMaintenanceRecord = async (data: Omit<MaintenanceRecord, 'id'>) => {
    await maintenanceService.create(data);
    fetchData();
  };

  const resolveTicket = async (id: number, details: string, date: string, updatedSpecs?: Partial<Equipment>, markAsDelivered?: boolean) => {
    await maintenanceService.resolve(id, {
        resolutionDetails: details,
        resolutionDate: date,
        deliveryStatus: markAsDelivered ? 'Delivered' : 'Pending'
    });
    if (updatedSpecs && updatedSpecs.id) {
        await equipmentService.update(updatedSpecs.id, updatedSpecs);
    }
    fetchData();
  };

  const toggleMaintenanceDelivery = async (id: number) => {
    await maintenanceService.toggleDelivery(id);
    fetchData();
  };

  const addCredential = async (data: Omit<Credential, 'id'>) => {
    await credentialService.create(data);
    fetchData();
  };

  const updateCredential = async (data: Credential) => {
    await credentialService.update(data.id, data);
    fetchData();
  };

  const deleteCredential = async (id: number) => {
    await credentialService.delete(id);
    fetchData();
  };

  const addUser = async (userData: Omit<User, 'id'>) => {
    await userService.create(userData);
    fetchData();
  };

  const updateUser = async (userData: User) => {
    await userService.update(userData.id, userData);
    fetchData();
  };

  const deleteUser = async (id: number) => {
    await userService.delete(id);
    fetchData();
  };

  return (
    <InventoryContext.Provider value={{
      data,
      loading,
      redirectTarget,
      setRedirectTarget,
      addEquipment,
      updateEquipment,
      deleteEquipment,
      saveEquipmentWithLicenses,
      addCollaborator,
      bulkAddCollaborators,
      updateCollaborator,
      deleteCollaborator,
      toggleCollaboratorStatus,
      addLicense,
      updateLicense,
      deleteLicense,
      addMaintenanceRecord,
      resolveTicket,
      toggleMaintenanceDelivery,
      addCredential,
      updateCredential,
      deleteCredential,
      addUser, 
      updateUser, 
      deleteUser
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
