
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppData, loadData, saveFullData } from '../services/inventoryService';
import { Equipment, Collaborator, SoftwareLicense, MaintenanceRecord, EquipmentStatus, Credential, EquipmentHistory } from '../types';

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
  addEquipment: (data: Omit<Equipment, 'id'>) => void;
  updateEquipment: (data: Equipment) => void;
  deleteEquipment: (id: number) => void;

  // Collaborator Actions
  addCollaborator: (data: Omit<Collaborator, 'id'>) => void;
  updateCollaborator: (data: Collaborator) => void;
  deleteCollaborator: (id: number) => void;
  toggleCollaboratorStatus: (id: number) => void;

  // License Actions
  addLicense: (data: Omit<SoftwareLicense, 'id'>) => void;
  updateLicense: (data: SoftwareLicense) => void;
  deleteLicense: (id: number) => void;

  // Maintenance Actions
  addMaintenanceRecord: (data: Omit<MaintenanceRecord, 'id'>) => void;
  resolveTicket: (id: number, details: string, date: string, updatedSpecs?: Partial<Equipment>, markAsDelivered?: boolean) => void;
  toggleMaintenanceDelivery: (id: number) => void;

  // Credential Actions
  addCredential: (data: Omit<Credential, 'id'>) => void;
  updateCredential: (data: Credential) => void;
  deleteCredential: (id: number) => void;

  // System
  factoryReset: () => void;
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
      desc: string
    ): EquipmentHistory[] => {
      const newId = currentHistory.length > 0 ? Math.max(...currentHistory.map(h => h.id)) + 1 : 1;
      return [...currentHistory, {
        id: newId,
        equipmentId: equipId,
        date: new Date().toISOString(),
        actionType: action,
        description: desc,
        user: 'Admin'
      }];
  };

  const addEquipment = (equipData: Omit<Equipment, 'id'>) => {
    if (!data) return;
    const newId = data.equipment.length > 0 ? Math.max(...data.equipment.map(e => e.id)) + 1 : 1;
    const newEquip = { ...equipData, id: newId };
    
    // Agregar Historial de Creación
    const updatedHistory = createHistoryRecord(
      data.history || [], 
      newId, 
      'CREATION', 
      `Equipo ingresado al inventario con estado: ${newEquip.status}`
    );

    updateState({
      ...data,
      equipment: [...data.equipment, newEquip],
      history: updatedHistory
    });
  };

  const updateEquipment = (equipData: Equipment) => {
    if (!data) return;
    
    const oldEquip = data.equipment.find(e => e.id === equipData.id);
    let updatedHistory = [...(data.history || [])];

    // Detectar cambios importantes para el historial
    if (oldEquip) {
       // 1. Cambio de Asignación
       if (oldEquip.assignedTo !== equipData.assignedTo) {
          if (equipData.assignedTo) {
             const user = data.collaborators.find(c => c.id === equipData.assignedTo);
             updatedHistory = createHistoryRecord(updatedHistory, equipData.id, 'ASSIGNMENT', `Asignado a: ${user ? user.firstName + ' ' + user.lastName : 'Usuario ID ' + equipData.assignedTo}`);
          } else {
             updatedHistory = createHistoryRecord(updatedHistory, equipData.id, 'UNASSIGNMENT', 'Equipo devuelto a stock (Desasignado)');
          }
       }
       // 2. Cambio de Estado
       if (oldEquip.status !== equipData.status) {
          updatedHistory = createHistoryRecord(updatedHistory, equipData.id, 'STATUS_CHANGE', `Estado cambiado de ${oldEquip.status} a ${equipData.status}`);
       }
       // 3. Cambio de Ubicación (si no está asignado)
       if (!equipData.assignedTo && oldEquip.location !== equipData.location) {
          updatedHistory = createHistoryRecord(updatedHistory, equipData.id, 'UPDATE', `Ubicación actualizada: ${equipData.location}`);
       }
    }

    const updatedList = data.equipment.map(e => e.id === equipData.id ? equipData : e);
    
    updateState({ 
        ...data, 
        equipment: updatedList,
        history: updatedHistory
    });
  };

  const deleteEquipment = (id: number) => {
    if (!data) return;
    
    // 1. LIMPIEZA EN CASCADA
    const updatedMaintenance = (data.maintenance || []).filter(m => m.equipmentId !== id);
    const updatedHistory = (data.history || []).filter(h => h.equipmentId !== id); 

    // 2. Eliminar el equipo
    const updatedEquipment = data.equipment.filter(e => e.id !== id);
    
    updateState({
      ...data,
      equipment: updatedEquipment,
      maintenance: updatedMaintenance,
      history: updatedHistory
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

  const updateCollaborator = (collabData: Collaborator) => {
    if (!data) return;
    const updatedList = data.collaborators.map(c => c.id === collabData.id ? collabData : c);
    updateState({ ...data, collaborators: updatedList });
  };

  const deleteCollaborator = (id: number) => {
    if (!data) return;

    // 1. LIMPIEZA EN CASCADA: Desvincular equipos asignados
    let updatedHistory = [...(data.history || [])];
    
    const updatedEquipment = data.equipment.map(e => {
      if (e.assignedTo === id) {
          updatedHistory = createHistoryRecord(updatedHistory, e.id, 'UNASSIGNMENT', 'Desasignación automática por eliminación de colaborador');
          return { ...e, assignedTo: undefined };
      }
      return e;
    });

    const updatedCollaborators = data.collaborators.filter(c => c.id !== id);

    updateState({
      ...data,
      equipment: updatedEquipment,
      collaborators: updatedCollaborators,
      history: updatedHistory
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

  const addMaintenanceRecord = (recordData: Omit<MaintenanceRecord, 'id'>) => {
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
          updatedHistory = createHistoryRecord(updatedHistory, e.id, 'STATUS_CHANGE', 'Equipo retirado por Pérdida Total');
          return { ...e, status: newStatus, assignedTo: undefined };
        } else {
          newStatus = EquipmentStatus.MAINTENANCE;
          updatedHistory = createHistoryRecord(updatedHistory, e.id, 'MAINTENANCE', `Ingreso a mantenimiento: ${recordData.title}`);
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

  const resolveTicket = (id: number, details: string, date: string, updatedSpecs?: Partial<Equipment>, markAsDelivered: boolean = false) => {
    if (!data) return;

    const ticket = data.maintenance.find(m => m.id === id);
    if (!ticket) return;
    
    let updatedHistory = [...(data.history || [])];
    
    updatedHistory = createHistoryRecord(updatedHistory, ticket.equipmentId, 'MAINTENANCE', `Mantenimiento finalizado: ${details}`);

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
          updatedHistory = createHistoryRecord(updatedHistory, e.id, 'STATUS_CHANGE', 'Equipo reactivado tras mantenimiento');
        }
        if (updatedSpecs) {
          updatedE = { ...updatedE, ...updatedSpecs };
          updatedHistory = createHistoryRecord(updatedHistory, e.id, 'UPDATE', 'Actualización de hardware realizada');
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

  const factoryReset = () => {
    localStorage.removeItem('equitrack_data_v1');
    window.location.reload();
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
      addCollaborator,
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
      factoryReset
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
