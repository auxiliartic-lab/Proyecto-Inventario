
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppData, loadData, saveFullData } from '../services/inventoryService';
import { Equipment, Collaborator, SoftwareLicense, MaintenanceRecord, EquipmentStatus, Credential, EquipmentHistory, User } from '../types';

interface RedirectTarget {
  type: 'equipment' | 'license' | 'credential';
  id: number;
}

interface InventoryContextType {
  data: AppData;
  loading: boolean;
  
  // Navigation & Highlighting
  redirectTarget: RedirectTarget | null;
  setRedirectTarget: (target: RedirectTarget | null) => void;

  // Equipment Actions
  addEquipment: (data: Omit<Equipment, 'id'>, performedBy?: string) => void;
  updateEquipment: (data: Equipment, performedBy?: string) => void;
  deleteEquipment: (id: number, performedBy?: string) => void;
  saveEquipmentWithLicenses: (equipData: Equipment | Omit<Equipment, 'id'>, licenseIds: number[], isEditing: boolean, performedBy?: string) => void;

  // Collaborator Actions
  addCollaborator: (data: Omit<Collaborator, 'id'>) => void;
  bulkAddCollaborators: (collabs: Omit<Collaborator, 'id'>[]) => void;
  updateCollaborator: (data: Collaborator) => void;
  deleteCollaborator: (id: number) => void;
  toggleCollaboratorStatus: (id: number) => void;

  // License Actions
  addLicense: (data: Omit<SoftwareLicense, 'id'>) => void;
  updateLicense: (data: SoftwareLicense) => void;
  deleteLicense: (id: number) => void;

  // Maintenance Actions
  addMaintenanceRecord: (data: Omit<MaintenanceRecord, 'id'>, performedBy?: string) => void;
  resolveTicket: (id: number, details: string, date: string, updatedSpecs?: Partial<Equipment>, markAsDelivered?: boolean, performedBy?: string) => void;
  toggleMaintenanceDelivery: (id: number) => void;

  // Credential Actions
  addCredential: (data: Omit<Credential, 'id'>) => void;
  updateCredential: (data: Credential) => void;
  deleteCredential: (id: number) => void;

  // User Actions (NUEVO)
  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (userData: User) => void;
  deleteUser: (id: number) => void;

  // System
  factoryReset: () => void;
  exportDatabase: () => void; // New Security Feature
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData | null>(null);
  const [redirectTarget, setRedirectTarget] = useState<RedirectTarget | null>(null);

  useEffect(() => {
    // Cargar datos iniciales
    const loadedData = loadData();
    setData(loadedData);
  }, []);

  // Función helper para actualizar estado y localStorage
  const updateState = (newData: AppData) => {
    setData(newData);
    saveFullData(newData);
  };

  // Helper interno para crear registro de historial
  const createHistoryRecord = (
      currentHistory: EquipmentHistory[], 
      equipId: number, 
      action: EquipmentHistory['actionType'], 
      desc: string,
      user: string = 'System'
    ): EquipmentHistory[] => {
      const newId = currentHistory.length > 0 ? Math.max(...currentHistory.map(h => h.id)) + 1 : 1;
      return [...currentHistory, {
        id: newId,
        equipmentId: equipId,
        date: new Date().toISOString(),
        actionType: action,
        description: desc,
        user: user
      }];
  };

  // --- ATOMIC SAVE FUNCTION ---
  const saveEquipmentWithLicenses = (
    equipData: Equipment | Omit<Equipment, 'id'>, 
    licenseIds: number[], 
    isEditing: boolean,
    performedBy: string = 'Admin'
  ) => {
    setData(prevData => {
        if (!prevData) return null;

        let newEquipmentList = [...prevData.equipment];
        let newHistory = [...(prevData.history || [])];
        let currentEquipId: number;

        // 1. EQUIPO Y HISTORIAL
        if (isEditing) {
            const eq = equipData as Equipment;
            currentEquipId = eq.id;
            const oldEquip = prevData.equipment.find(e => e.id === eq.id);
            
            if (oldEquip) {
                if (oldEquip.assignedTo !== eq.assignedTo) {
                    if (eq.assignedTo) {
                        const user = prevData.collaborators.find(c => c.id === eq.assignedTo);
                        newHistory = createHistoryRecord(newHistory, eq.id, 'ASSIGNMENT', `Asignado a: ${user ? user.firstName + ' ' + user.lastName : 'Usuario ID ' + eq.assignedTo}`, performedBy);
                    } else {
                        newHistory = createHistoryRecord(newHistory, eq.id, 'UNASSIGNMENT', 'Equipo devuelto a stock (Desasignado)', performedBy);
                    }
                }
                if (oldEquip.status !== eq.status) {
                    newHistory = createHistoryRecord(newHistory, eq.id, 'STATUS_CHANGE', `Estado cambiado de ${oldEquip.status} a ${eq.status}`, performedBy);
                }
                if (oldEquip.location !== eq.location) {
                    newHistory = createHistoryRecord(newHistory, eq.id, 'UPDATE', `Ubicación actualizada: ${eq.location}`, performedBy);
                }
            }
            newEquipmentList = newEquipmentList.map(e => e.id === eq.id ? eq : e);

        } else {
            // Nuevo Equipo
            const maxId = newEquipmentList.length > 0 ? Math.max(...newEquipmentList.map(e => e.id)) : 0;
            currentEquipId = maxId + 1;
            const newEquip = { ...equipData, id: currentEquipId } as Equipment;
            
            newEquipmentList.push(newEquip);
            newHistory = createHistoryRecord(newHistory, currentEquipId, 'CREATION', `Equipo ingresado al inventario en ${newEquip.location}`, performedBy);
        }

        // 2. LICENCIAS (Vinculación)
        const newLicenses = prevData.licenses.map(lic => {
            const isSelected = licenseIds.includes(lic.id);
            const currentAssignments = lic.assignedToEquipment || [];
            const isCurrentlyAssigned = currentAssignments.includes(currentEquipId);

            if (isSelected && !isCurrentlyAssigned) {
                return { ...lic, assignedToEquipment: [...currentAssignments, currentEquipId] };
            } else if (!isSelected && isCurrentlyAssigned) {
                return { ...lic, assignedToEquipment: currentAssignments.filter(id => id !== currentEquipId) };
            }
            return lic;
        });

        // 3. CONSOLIDAR ESTADO
        const newState = {
            ...prevData,
            equipment: newEquipmentList,
            licenses: newLicenses,
            history: newHistory
        };

        saveFullData(newState);
        return newState;
    });
  };

  const addEquipment = (equipData: Omit<Equipment, 'id'>, performedBy: string = 'Admin') => {
    saveEquipmentWithLicenses(equipData, [], false, performedBy);
  };

  const updateEquipment = (equipData: Equipment, performedBy: string = 'Admin') => {
    if (!data) return;
    
    const oldEquip = data.equipment.find(e => e.id === equipData.id);
    let updatedHistory = [...(data.history || [])];

    if (oldEquip) {
       if (oldEquip.assignedTo !== equipData.assignedTo) {
          if (equipData.assignedTo) {
             const user = data.collaborators.find(c => c.id === equipData.assignedTo);
             updatedHistory = createHistoryRecord(updatedHistory, equipData.id, 'ASSIGNMENT', `Asignado a: ${user ? user.firstName + ' ' + user.lastName : 'Usuario ID ' + equipData.assignedTo}`, performedBy);
          } else {
             updatedHistory = createHistoryRecord(updatedHistory, equipData.id, 'UNASSIGNMENT', 'Equipo devuelto a stock (Desasignado)', performedBy);
          }
       }
       if (oldEquip.status !== equipData.status) {
          updatedHistory = createHistoryRecord(updatedHistory, equipData.id, 'STATUS_CHANGE', `Estado cambiado de ${oldEquip.status} a ${equipData.status}`, performedBy);
       }
       if (oldEquip.location !== equipData.location) {
          updatedHistory = createHistoryRecord(updatedHistory, equipData.id, 'UPDATE', `Ubicación actualizada: ${equipData.location}`, performedBy);
       }
    }

    const updatedList = data.equipment.map(e => e.id === equipData.id ? equipData : e);
    
    updateState({ 
        ...data, 
        equipment: updatedList,
        history: updatedHistory
    });
  };

  const deleteEquipment = (id: number, performedBy: string = 'Admin') => {
    if (!data) return;
    
    const updatedMaintenance = (data.maintenance || []).filter(m => m.equipmentId !== id);
    const updatedHistory = (data.history || []).filter(h => h.equipmentId !== id); 
    
    const updatedLicenses = data.licenses.map(l => ({
        ...l,
        assignedToEquipment: (l.assignedToEquipment || []).filter(eid => eid !== id)
    }));

    const updatedEquipment = data.equipment.filter(e => e.id !== id);
    
    updateState({
      ...data,
      equipment: updatedEquipment,
      maintenance: updatedMaintenance,
      history: updatedHistory,
      licenses: updatedLicenses
    });
  };

  const addCollaborator = (collabData: Omit<Collaborator, 'id'>) => {
    if (!data) return;
    const newId = data.collaborators.length > 0 ? Math.max(...data.collaborators.map(c => c.id)) + 1 : 1;
    const newCollab = { ...collabData, id: newId };
    updateState({
      ...data,
      collaborators: [...data.collaborators, newCollab]
    });
  };

  const bulkAddCollaborators = (collabs: Omit<Collaborator, 'id'>[]) => {
    if (!data) return;
    let currentId = data.collaborators.length > 0 ? Math.max(...data.collaborators.map(c => c.id)) : 0;
    
    const newCollabs = collabs.map(c => {
        currentId++;
        return { ...c, id: currentId };
    });

    updateState({
      ...data,
      collaborators: [...data.collaborators, ...newCollabs]
    });
  };

  const updateCollaborator = (collabData: Collaborator) => {
    if (!data) return;
    const updatedList = data.collaborators.map(c => c.id === collabData.id ? collabData : c);
    updateState({ ...data, collaborators: updatedList });
  };

  const deleteCollaborator = (id: number) => {
    if (!data) return;

    let updatedHistory = [...(data.history || [])];
    
    const updatedEquipment = data.equipment.map(e => {
      if (e.assignedTo === id) {
          updatedHistory = createHistoryRecord(updatedHistory, e.id, 'UNASSIGNMENT', 'Desasignación automática por eliminación de colaborador', 'System');
          return { ...e, assignedTo: undefined };
      }
      return e;
    });

    const updatedCollaborators = data.collaborators.filter(c => c.id !== id);
    
    const updatedLicenses = data.licenses.map(l => ({
        ...l,
        assignedTo: (l.assignedTo || []).filter(uid => uid !== id)
    }));

    updateState({
      ...data,
      equipment: updatedEquipment,
      collaborators: updatedCollaborators,
      history: updatedHistory,
      licenses: updatedLicenses
    });
  };

  const toggleCollaboratorStatus = (id: number) => {
    if (!data) return;
    const updatedList = data.collaborators.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    updateState({ ...data, collaborators: updatedList });
  };

  const addLicense = (licenseData: Omit<SoftwareLicense, 'id'>) => {
    if (!data) return;
    const newId = data.licenses.length > 0 ? Math.max(...data.licenses.map(l => l.id)) + 1 : 1;
    const newLicense = { ...licenseData, id: newId };
    updateState({
      ...data,
      licenses: [...data.licenses, newLicense]
    });
  };

  const updateLicense = (licenseData: SoftwareLicense) => {
    if (!data) return;
    const updatedList = data.licenses.map(l => l.id === licenseData.id ? licenseData : l);
    updateState({ ...data, licenses: updatedList });
  };

  const deleteLicense = (id: number) => {
    if (!data) return;
    updateState({
      ...data,
      licenses: data.licenses.filter(l => l.id !== id)
    });
  };

  const addMaintenanceRecord = (recordData: Omit<MaintenanceRecord, 'id'>, performedBy: string = 'Admin') => {
    if (!data) return;
    const maintenanceList = data.maintenance || [];
    const newId = maintenanceList.length > 0 ? Math.max(...maintenanceList.map(m => m.id)) + 1 : 1;
    const newRecord = { ...recordData, id: newId };
    
    let updatedHistory = [...(data.history || [])];

    const updatedEquipment = data.equipment.map(e => {
      if (e.id === recordData.equipmentId) {
        let newStatus = e.status;
        if (recordData.severity === 'TotalLoss') {
          newStatus = EquipmentStatus.RETIRED;
          updatedHistory = createHistoryRecord(updatedHistory, e.id, 'STATUS_CHANGE', 'Equipo retirado por Pérdida Total', performedBy);
          return { ...e, status: newStatus, assignedTo: undefined };
        } else {
          newStatus = EquipmentStatus.MAINTENANCE;
          updatedHistory = createHistoryRecord(updatedHistory, e.id, 'MAINTENANCE', `Ingreso a mantenimiento: ${recordData.title}`, performedBy);
          return { ...e, status: newStatus };
        }
      }
      return e;
    });

    updateState({
      ...data,
      maintenance: [...maintenanceList, newRecord],
      equipment: updatedEquipment,
      history: updatedHistory
    });
  };

  const resolveTicket = (id: number, details: string, date: string, updatedSpecs?: Partial<Equipment>, markAsDelivered: boolean = false, performedBy: string = 'Admin') => {
    if (!data) return;

    const ticket = data.maintenance.find(m => m.id === id);
    if (!ticket) return;
    
    let updatedHistory = [...(data.history || [])];
    
    updatedHistory = createHistoryRecord(updatedHistory, ticket.equipmentId, 'MAINTENANCE', `Mantenimiento finalizado: ${details}`, performedBy);

    const updatedMaintenance = data.maintenance.map(m => 
      m.id === id 
        ? { 
            ...m, 
            status: 'Closed' as const, 
            resolutionDetails: details, 
            resolutionDate: date,
            deliveryStatus: markAsDelivered ? ('Delivered' as const) : ('Pending' as const)
          }
        : m
    );

    const updatedEquipment = data.equipment.map(e => {
      if (e.id === ticket.equipmentId) {
        let updatedE = { ...e };
        if (e.status === EquipmentStatus.MAINTENANCE) {
          updatedE.status = EquipmentStatus.ACTIVE;
          updatedHistory = createHistoryRecord(updatedHistory, e.id, 'STATUS_CHANGE', 'Equipo reactivado tras mantenimiento', performedBy);
        }
        if (updatedSpecs) {
          updatedE = { ...updatedE, ...updatedSpecs };
          updatedHistory = createHistoryRecord(updatedHistory, e.id, 'UPDATE', 'Actualización de hardware realizada', performedBy);
        }
        return updatedE;
      }
      return e;
    });

    updateState({
      ...data,
      maintenance: updatedMaintenance,
      equipment: updatedEquipment,
      history: updatedHistory
    });
  };

  const toggleMaintenanceDelivery = (id: number) => {
    if (!data) return;

    const updatedMaintenance = data.maintenance.map(m => {
      if (m.id === id && m.status === 'Closed') {
        const newStatus = m.deliveryStatus === 'Delivered' ? 'Pending' : 'Delivered';
        return { ...m, deliveryStatus: newStatus as 'Pending' | 'Delivered' };
      }
      return m;
    });

    updateState({
      ...data,
      maintenance: updatedMaintenance
    });
  };

  const addCredential = (credData: Omit<Credential, 'id'>) => {
    if (!data) return;
    const currentCreds = data.credentials || [];
    const newId = currentCreds.length > 0 ? Math.max(...currentCreds.map(c => c.id)) + 1 : 1;
    const newCred = { ...credData, id: newId };

    updateState({
      ...data,
      credentials: [...currentCreds, newCred]
    });
  };

  const updateCredential = (credData: Credential) => {
    if (!data) return;
    const currentCreds = data.credentials || [];
    const updatedList = currentCreds.map(c => c.id === credData.id ? credData : c);
    updateState({ ...data, credentials: updatedList });
  };

  const deleteCredential = (id: number) => {
    if (!data) return;
    const currentCreds = data.credentials || [];
    updateState({
      ...data,
      credentials: currentCreds.filter(c => c.id !== id)
    });
  };

  // --- USER MANAGEMENT ACTIONS ---
  const addUser = (userData: Omit<User, 'id'>) => {
    if (!data) return;
    const currentUsers = data.users || [];
    const newId = currentUsers.length > 0 ? Math.max(...currentUsers.map(u => u.id)) + 1 : 1;
    const newUser = { ...userData, id: newId };
    
    updateState({
        ...data,
        users: [...currentUsers, newUser]
    });
  };

  const updateUser = (userData: User) => {
    if (!data) return;
    const currentUsers = data.users || [];
    const updatedList = currentUsers.map(u => u.id === userData.id ? userData : u);
    
    updateState({
        ...data,
        users: updatedList
    });
  };

  const deleteUser = (id: number) => {
    if (!data) return;
    
    // SECURITY GUARD: Prevent deleting Super Admin
    if (id === 1) {
        console.error("Critical Security Violation: Attempt to delete Super Admin (ID 1)");
        alert("Violación de Seguridad: No es posible eliminar al Administrador Principal.");
        return;
    }

    const updatedList = (data.users || []).filter(u => u.id !== id);
    
    updateState({
        ...data,
        users: updatedList
    });
  };

  const factoryReset = () => {
    localStorage.removeItem('equitrack_data_v1');
    window.location.reload();
  };

  // SECURITY FEATURE: BACKUP
  const exportDatabase = () => {
      if (!data) return;
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Backup_Inventory_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  if (!data) return <div className="p-10 text-center">Cargando sistema...</div>;

  return (
    <InventoryContext.Provider value={{
      data,
      loading: false,
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
      deleteUser, 
      factoryReset,
      exportDatabase // New
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
