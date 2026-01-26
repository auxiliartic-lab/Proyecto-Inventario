
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppData, loadData, saveFullData } from '../services/inventoryService';
import { Equipment, Collaborator, SoftwareLicense, MaintenanceRecord, EquipmentStatus } from '../types';

interface InventoryContextType {
  data: AppData;
  loading: boolean;
  
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

  // System
  factoryReset: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData | null>(null);

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

  const addEquipment = (equipData: Omit<Equipment, 'id'>) => {
    if (!data) return;
    const newId = data.equipment.length > 0 ? Math.max(...data.equipment.map(e => e.id)) + 1 : 1;
    const newEquip = { ...equipData, id: newId };
    
    updateState({
      ...data,
      equipment: [...data.equipment, newEquip]
    });
  };

  const updateEquipment = (equipData: Equipment) => {
    if (!data) return;
    const updatedList = data.equipment.map(e => e.id === equipData.id ? equipData : e);
    updateState({ ...data, equipment: updatedList });
  };

  const deleteEquipment = (id: number) => {
    if (!data) return;
    
    // 1. LIMPIEZA EN CASCADA: Eliminar historial de mantenimientos de este equipo
    // Esto previene errores de "Equipo no encontrado" en el módulo de mantenimiento
    const updatedMaintenance = (data.maintenance || []).filter(m => m.equipmentId !== id);

    // 2. Eliminar el equipo de la lista principal
    const updatedEquipment = data.equipment.filter(e => e.id !== id);
    
    updateState({
      ...data,
      equipment: updatedEquipment,
      maintenance: updatedMaintenance
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

    // 1. LIMPIEZA EN CASCADA: Desvincular equipos asignados a este colaborador
    // Los equipos asignados pasan a estado "Sin Asignar" (stock)
    const updatedEquipment = data.equipment.map(e => 
      e.assignedTo === id ? { ...e, assignedTo: undefined } : e
    );

    // 2. Eliminar al colaborador
    const updatedCollaborators = data.collaborators.filter(c => c.id !== id);

    updateState({
      ...data,
      equipment: updatedEquipment,
      collaborators: updatedCollaborators
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

    // Actualizar estado del equipo según la severidad
    const updatedEquipment = data.equipment.map(e => {
      if (e.id === recordData.equipmentId) {
        if (recordData.severity === 'TotalLoss') {
          return { ...e, status: EquipmentStatus.RETIRED, assignedTo: undefined };
        } else {
          return { ...e, status: EquipmentStatus.MAINTENANCE };
        }
      }
      return e;
    });

    updateState({
      ...data,
      maintenance: [...maintenanceList, newRecord],
      equipment: updatedEquipment
    });
  };

  const resolveTicket = (id: number, details: string, date: string, updatedSpecs?: Partial<Equipment>, markAsDelivered: boolean = false) => {
    if (!data) return;

    // 1. Encontrar el ticket
    const ticket = data.maintenance.find(m => m.id === id);
    if (!ticket) return;

    // 2. Actualizar el Ticket a Cerrado
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

    // 3. Restaurar estado del equipo a Activo y actualizar specs si existen
    const updatedEquipment = data.equipment.map(e => {
      if (e.id === ticket.equipmentId) {
        let updatedE = { ...e };
        // Si no fue pérdida total, volver a activo
        if (e.status === EquipmentStatus.MAINTENANCE) {
          updatedE.status = EquipmentStatus.ACTIVE;
          // NOTA: Se mantiene la asignación al usuario (e.assignedTo no se toca)
        }
        // Aplicar cambios de hardware si los hay
        if (updatedSpecs) {
          updatedE = { ...updatedE, ...updatedSpecs };
        }
        return updatedE;
      }
      return e;
    });

    updateState({
      ...data,
      maintenance: updatedMaintenance,
      equipment: updatedEquipment
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

  const factoryReset = () => {
    localStorage.removeItem('equitrack_data_v1');
    window.location.reload();
  };

  if (!data) return <div className="p-10 text-center">Cargando sistema...</div>;

  return (
    <InventoryContext.Provider value={{
      data,
      loading: false,
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
