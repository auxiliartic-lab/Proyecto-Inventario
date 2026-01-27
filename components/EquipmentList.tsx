import React, { useState } from 'react';
import { Company, Equipment, EquipmentStatus, UserRole, MaintenanceSeverity } from '../types';
import { useInventory } from '../context/InventoryContext';
import EquipmentForm from './forms/EquipmentForm';
import MaintenanceReportForm from './forms/MaintenanceReportForm';

interface EquipmentListProps {
  company: Company;
  role: UserRole;
}

const EquipmentList: React.FC<EquipmentListProps> = ({ company, role }) => {
  const { data, addEquipment, updateEquipment, deleteEquipment, addMaintenanceRecord } = useInventory();
  
  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState<Equipment | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: number | null}>({ isOpen: false, id: null });

  // Filters
  const [filterType, setFilterType] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const equipmentList = data.equipment.filter(e => e.companyId === company.id);
  const collaborators = data.collaborators.filter(c => c.companyId === company.id);

  const filteredEquipment = equipmentList.filter(item => {
    const matchesType = filterType === 'Todos' || item.type === filterType;
    const matchesSearch = 
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.assignedTo && collaborators.find(c => c.id === item.assignedTo)?.firstName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const getEquipmentTypes = () => ['Todos', ...Array.from(new Set(equipmentList.map(e => e.type)))];

  const handleCreate = () => {
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (equip: Equipment) => {
    setEditingId(equip.id);
    setSelectedEquip(equip);
    setIsFormOpen(true);
  };

  const handleViewDetails = (equip: Equipment) => {
    setSelectedEquip(equip);
    setIsDetailsOpen(true);
  };

  const handleReportMaintenance = (equip: Equipment) => {
    setSelectedEquip(equip);
    setIsMaintenanceOpen(true);
  };

  const requestDelete = (id: number) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      deleteEquipment(deleteConfirm.id);
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const handleFormSubmit = (formData: Partial<Equipment>) => {
    if (editingId && selectedEquip) {
      updateEquipment({ ...selectedEquip, ...formData } as Equipment);
    } else {
      addEquipment({ ...formData, companyId: company.id, siteId: 1 } as Omit<Equipment, 'id'>);
    }
    setIsFormOpen(false);
    setEditingId(null);
    setSelectedEquip(null);
  };

  const handleMaintenanceSubmit = (reportData: { title: string, description: string, severity: MaintenanceSeverity, date: string }) => {
    if (selectedEquip) {
      addMaintenanceRecord({
        companyId: company.id,
        equipmentId: selectedEquip.id,
        date: reportData.date, // Usar la fecha seleccionada en el formulario
        status: 'Open',
        title: reportData.title,
        description: reportData.description,
        severity: reportData.severity
      });
      setIsMaintenanceOpen(false);
      setSelectedEquip(null);
    }
  };

  // Helper para asignar color al estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case EquipmentStatus.ACTIVE: return 'bg-green-100 text-green-700 border-green-200';
      case EquipmentStatus.MAINTENANCE: return 'bg-brand-yellow/10 text-yellow-700 border-yellow-200';
      case EquipmentStatus.RETIRED: return 'bg-gray-100 text-gray-500 border-gray-200';
      case EquipmentStatus.LOST: return 'bg-red-100 text-red-700 border-red-200';
      case 'Pendiente de Entrega': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Laptop': return 'fa-laptop';
      case 'Desktop': return 'fa-desktop';
      case 'Servidor': return 'fa-server';
      case 'Tablet': return 'fa-tablet-screen-button';
      case 'Smartphone': return 'fa-mobile-screen-button';
      case 'Periférico': return 'fa-keyboard';
      default: return 'fa-box';
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario de Equipos</h1>
          <p className="text-gray-500">Gestión de activos tecnológicos para {company.name}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative group w-full sm:w-64">
             <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue-cyan transition-colors"></i>
             <input 
               type="text" 
               placeholder="Buscar serial, marca..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan transition-all text-sm font-medium"
             />
          </div>
          
          <button 
            onClick={handleCreate}
            className="bg-brand-blue-cyan text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-blue-dark transition-all shadow-lg shadow-brand-blue-cyan/10 flex items-center justify-center gap-2 shrink-0"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Nuevo Equipo</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 custom-scrollbar">
        {getEquipmentTypes().map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
              filterType === type 
                ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEquipment.map(item => {
           const assignedUser = item.assignedTo ? collaborators.find(c => c.id === item.assignedTo) : null;
           
           // Lógica para detectar si tiene entrega pendiente
           const lastMaintenance = (data.maintenance || [])
             .filter(m => m.equipmentId === item.id && m.status === 'Closed')
             .sort((a, b) => b.id - a.id)[0];
           
           const isPendingDelivery = lastMaintenance?.deliveryStatus === 'Pending';
           const displayStatus = isPendingDelivery ? 'Pendiente de Entrega' : item.status;
           
           // Lógica de Ubicación: Si está asignado, mostrar Área del colaborador, sino Ubicación física
           const displayLocation = assignedUser ? assignedUser.area : item.location;
           const locationIcon = assignedUser ? 'fa-building-user' : 'fa-location-dot';

           return (
             <div key={item.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-white opacity-50 rounded-bl-full -mr-4 -mt-4 pointer-events-none`}></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                   <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-blue-cyan group-hover:text-white transition-colors">
                      <i className={`fa-solid ${getIconForType(item.type)} text-xl`}></i>
                   </div>
                   <div className="flex flex-col items-end max-w-[50%]">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap border mb-1 ${getStatusColor(displayStatus)}`}>
                        {displayStatus}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 font-bold">{item.serialNumber}</span>
                   </div>
                </div>

                <div className="mb-4 relative z-10">
                   <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{item.brand} {item.model}</h3>
                   <p className="text-xs text-gray-500 flex items-center gap-1.5">
                     <i className={`fa-solid ${locationIcon} text-gray-300`}></i>
                     {displayLocation}
                   </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 mb-4 flex items-center gap-3 border border-gray-100 relative z-10">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${assignedUser ? 'bg-brand-blue-dark' : 'bg-gray-300'}`}>
                      <i className={`fa-solid ${assignedUser ? 'fa-user' : 'fa-box'}`}></i>
                   </div>
                   <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                        {assignedUser ? 'Asignado a' : 'En Stock'}
                      </p>
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : 'Disponible'}
                      </p>
                   </div>
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 relative z-10">
                   <button 
                     onClick={() => handleViewDetails(item)}
                     className="text-xs font-bold text-gray-500 hover:text-brand-blue-cyan flex items-center gap-1.5 transition-colors"
                   >
                     <i className="fa-solid fa-eye"></i> Detalles
                   </button>

                   <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-brand-yellow/10 hover:text-brand-yellow transition-colors"
                        title="Editar"
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button 
                        onClick={() => handleReportMaintenance(item)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-brand-orange/10 hover:text-brand-orange transition-colors"
                        title="Reportar Falla"
                      >
                        <i className="fa-solid fa-screwdriver-wrench"></i>
                      </button>
                      <button 
                        onClick={() => requestDelete(item.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Eliminar"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                   </div>
                </div>
             </div>
           );
        })}
        
        {filteredEquipment.length === 0 && (
           <div className="col-span-full py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400">
              <i className="fa-solid fa-filter-circle-xmark text-4xl mb-4 text-gray-300"></i>
              <p className="font-medium">No se encontraron equipos</p>
              <button onClick={() => {setFilterType('Todos'); setSearchTerm('');}} className="mt-2 text-sm text-brand-blue-cyan font-bold hover:underline">
                 Limpiar filtros
              </button>
           </div>
        )}
      </div>

      {/* MODAL CREAR/EDITAR */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900">
                  {editingId ? 'Editar Equipo' : 'Nuevo Activo'}
                </h2>
                <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>
              
              <EquipmentForm 
                initialData={editingId && selectedEquip ? selectedEquip : undefined}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsFormOpen(false)}
                collaborators={collaborators}
                isEditing={!!editingId}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES (READ ONLY) */}
      {isDetailsOpen && selectedEquip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
           <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-8">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{selectedEquip.type}</p>
                      <h2 className="text-2xl font-black text-gray-900">{selectedEquip.brand} {selectedEquip.model}</h2>
                    </div>
                    <button onClick={() => setIsDetailsOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <i className="fa-solid fa-times text-xl"></i>
                    </button>
                 </div>

                 <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Serial</p>
                          <p className="font-mono font-bold text-gray-800">{selectedEquip.serialNumber}</p>
                       </div>
                       <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(selectedEquip.status)}`}>
                          {selectedEquip.status}
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                             {selectedEquip.assignedTo ? 'Área / Ubicación' : 'Ubicación Física'}
                          </p>
                          <p className="font-bold text-gray-700 text-sm">
                             {(() => {
                                const detailsAssignedUser = selectedEquip.assignedTo ? collaborators.find(c => c.id === selectedEquip.assignedTo) : null;
                                return detailsAssignedUser ? detailsAssignedUser.area : selectedEquip.location;
                             })()}
                          </p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fecha Ingreso</p>
                          <p className="font-bold text-gray-700 text-sm">{selectedEquip.purchaseDate || 'N/A'}</p>
                       </div>
                    </div>

                    {(selectedEquip.processor || selectedEquip.ram || selectedEquip.storage) && (
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-[10px] font-black text-brand-blue-cyan uppercase tracking-widest mb-3">Especificaciones</p>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                           {selectedEquip.processor && (
                             <div><span className="text-xs text-gray-400 block">Procesador</span><span className="text-sm font-bold text-gray-800">{selectedEquip.processor}</span></div>
                           )}
                           {selectedEquip.ram && (
                             <div><span className="text-xs text-gray-400 block">RAM</span><span className="text-sm font-bold text-gray-800">{selectedEquip.ram}</span></div>
                           )}
                           {selectedEquip.storage && (
                             <div><span className="text-xs text-gray-400 block">Almacenamiento</span><span className="text-sm font-bold text-gray-800">{selectedEquip.storage}</span></div>
                           )}
                           {selectedEquip.os && (
                             <div><span className="text-xs text-gray-400 block">Sistema Op.</span><span className="text-sm font-bold text-gray-800">{selectedEquip.os}</span></div>
                           )}
                        </div>
                      </div>
                    )}
                 </div>

                 <button onClick={() => setIsDetailsOpen(false)} className="w-full mt-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all">
                    Cerrar Ficha
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL REPORTE MANTENIMIENTO */}
      {isMaintenanceOpen && selectedEquip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
           <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-8">
                 <h2 className="text-xl font-black text-gray-900 mb-2">Reportar Falla o Avería</h2>
                 <p className="text-sm text-gray-500 mb-6">
                   Equipo: <span className="font-bold text-gray-800">{selectedEquip.brand} {selectedEquip.model}</span> ({selectedEquip.serialNumber})
                 </p>
                 
                 <MaintenanceReportForm 
                   onSubmit={handleMaintenanceSubmit}
                   onCancel={() => setIsMaintenanceOpen(false)}
                 />
              </div>
           </div>
        </div>
      )}

      {/* MODAL CONFIRMACION ELIMINAR */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all scale-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar Equipo?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Esta acción es irreversible. Se eliminará también el historial de mantenimiento asociado.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirm({ isOpen: false, id: null })}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-colors"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;