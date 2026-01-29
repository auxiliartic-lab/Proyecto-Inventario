
import React, { useState, useEffect } from 'react';
import { Company, Equipment, EquipmentStatus, UserRole, MaintenanceSeverity, Attachment } from '../types';
import { useInventory } from '../context/InventoryContext';
import EquipmentForm from './forms/EquipmentForm';
import MaintenanceReportForm from './forms/MaintenanceReportForm';
import { generateHandoverPDF } from '../utils/pdfGenerator';

interface EquipmentListProps {
  company: Company;
  role: UserRole;
}

const EquipmentList: React.FC<EquipmentListProps> = ({ company, role }) => {
  const { data, addEquipment, updateEquipment, deleteEquipment, addMaintenanceRecord, redirectTarget, setRedirectTarget } = useInventory();
  
  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState<Equipment | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: number | null}>({ isOpen: false, id: null });

  // EVIDENCE MODAL STATES
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<{title: string, images: Attachment[]} | null>(null);

  // Filters
  const [filterType, setFilterType] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // DETAILS MODAL TABS (Removed QR)
  const [detailTab, setDetailTab] = useState<'info' | 'history'>('info');

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

  // --- REDIRECT HANDLER ---
  useEffect(() => {
    if (redirectTarget && redirectTarget.type === 'equipment') {
      // 1. Limpiar filtros si es necesario para asegurar que el item se muestre
      setFilterType('Todos');
      setSearchTerm('');
      
      // 2. Esperar al renderizado y hacer scroll
      setTimeout(() => {
          const element = document.getElementById(`equip-${redirectTarget.id}`);
          if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Añadir clase temporal para resaltado
              element.classList.add('ring-4', 'ring-brand-blue-cyan', 'animate-pulse');
              
              // Quitar resaltado después de 3 segundos
              setTimeout(() => {
                  element.classList.remove('ring-4', 'ring-brand-blue-cyan', 'animate-pulse');
                  setRedirectTarget(null); // Limpiar redirect
              }, 3000);
          }
      }, 300);
    }
  }, [redirectTarget, setRedirectTarget]);


  const getEquipmentTypes = () => ['Todos', ...Array.from(new Set(equipmentList.map(e => e.type)))];

  // Helpers para obtener vinculados (ACTUALIZADO PARA ARRAYS)
  const getLinkedLicenses = (equipId: number) => {
    return data.licenses.filter(l => (l.assignedToEquipment || []).includes(equipId));
  };

  const getLinkedCredentials = (equipId: number) => {
    return (data.credentials || []).filter(c => c.assignedToEquipment === equipId);
  };

  // Helper para Historial
  const getHistory = (equipId: number) => {
    return (data.history || [])
        .filter(h => h.equipmentId === equipId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Helper para Mantenimiento Activo
  const getActiveTicket = (equipId: number) => {
    return (data.maintenance || []).find(m => m.equipmentId === equipId && m.status === 'Open');
  };

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
    setDetailTab('info');
    setIsDetailsOpen(true);
  };

  const handleReportMaintenance = (equip: Equipment) => {
    setSelectedEquip(equip);
    setIsMaintenanceOpen(true);
  };

  const handleViewEvidence = (title: string, attachments: Attachment[]) => {
    setSelectedEvidence({ title, images: attachments });
    setEvidenceModalOpen(true);
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

  const handleFormSubmit = (formData: Partial<Equipment>, generatePdf?: boolean) => {
    if (editingId && selectedEquip) {
      updateEquipment({ ...selectedEquip, ...formData } as Equipment);
    } else {
      addEquipment({ ...formData, companyId: company.id, siteId: 1 } as Omit<Equipment, 'id'>);
    }

    // --- LÓGICA DE GENERACIÓN PDF AUTOMÁTICA ---
    if (generatePdf && formData.assignedTo) {
        const user = collaborators.find(c => c.id === formData.assignedTo);
        if (user) {
            // Construir un objeto temporal con la data del formulario combinada
            // Nota: Para equipos nuevos, el ID será generado por el contexto, pero el PDF no lo necesita estrictamente.
            const pdfEquip = { 
                ...selectedEquip, 
                ...formData, 
                companyId: company.id 
            } as Equipment;
            
            // Generar PDF
            generateHandoverPDF(company, pdfEquip, user);
        }
    }

    setIsFormOpen(false);
    setEditingId(null);
    setSelectedEquip(null);
  };

  const handleMaintenanceSubmit = (reportData: { title: string, description: string, severity: MaintenanceSeverity, date: string, attachments: Attachment[] }) => {
    if (selectedEquip) {
      addMaintenanceRecord({
        companyId: company.id,
        equipmentId: selectedEquip.id,
        date: reportData.date,
        status: 'Open',
        title: reportData.title,
        description: reportData.description,
        severity: reportData.severity,
        attachments: reportData.attachments
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

  const getActionIcon = (type: string) => {
    switch(type) {
        case 'CREATION': return 'fa-plus-circle text-blue-500';
        case 'ASSIGNMENT': return 'fa-user-check text-green-500';
        case 'UNASSIGNMENT': return 'fa-user-xmark text-gray-500';
        case 'STATUS_CHANGE': return 'fa-rotate text-orange-500';
        case 'MAINTENANCE': return 'fa-screwdriver-wrench text-red-500';
        default: return 'fa-pen-to-square text-gray-400';
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Inventario de Equipos</h1>
            <span className="bg-brand-blue-cyan/10 text-brand-blue-cyan px-3 py-1 rounded-full text-xs font-bold border border-brand-blue-cyan/20 whitespace-nowrap">
                {equipmentList.length} Activos
            </span>
          </div>
          <p className="text-gray-500">Gestión de activos tecnológicos para {company.name}</p>
        </div>
        
        {/* Mobile-Optimized Control Group */}
        <div className="flex flex-row gap-3 w-full md:w-auto">
          <div className="relative group flex-1 sm:w-64">
             <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue-cyan transition-colors"></i>
             <input 
               type="text" 
               placeholder="Buscar serial, marca..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan transition-all text-sm font-medium h-[42px]"
             />
          </div>
          
          <button 
            onClick={handleCreate}
            className="bg-brand-blue-cyan text-white px-4 py-2.5 rounded-xl font-bold hover:bg-brand-blue-dark transition-all shadow-lg shadow-brand-blue-cyan/10 flex items-center justify-center gap-2 shrink-0 w-auto active:scale-95 touch-manipulation h-[42px]"
            title="Nuevo Equipo"
          >
            <i className="fa-solid fa-plus"></i>
            <span className="hidden sm:inline">Nuevo Equipo</span>
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

      {/* Grid: Actualizado para 4 columnas en 2xl y mayor espaciado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
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
             <div 
                id={`equip-${item.id}`}
                key={item.id} 
                className="bg-white rounded-2xl p-6 2xl:p-7 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between"
             >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-white opacity-50 rounded-bl-full -mr-4 -mt-4 pointer-events-none`}></div>
                
                <div>
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
                    
                    {/* VISUALIZAR TIPO ESPECÍFICO DE PERIFÉRICO */}
                    {item.type === 'Periférico' && item.peripheralType && (
                        <p className="text-xs font-bold text-brand-blue-cyan mb-1.5 flex items-center gap-1.5">
                            <i className="fa-solid fa-puzzle-piece text-[10px]"></i>
                            {item.peripheralType}
                        </p>
                    )}

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
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 relative z-10 flex-wrap gap-2">
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

      {/* MODAL CREAR/EDITAR - RESPONSIVE SCROLL FIX */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsFormOpen(false)}></div>
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-2xl">
                <div className="p-6 md:p-8">
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
                    existingEquipment={equipmentList} 
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    collaborators={collaborators}
                    isEditing={!!editingId}
                  />
                </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES - RESPONSIVE SCROLL FIX */}
      {isDetailsOpen && selectedEquip && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
           <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsDetailsOpen(false)}></div>
           <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-lg flex flex-col max-h-[90vh]">
                  <div className="p-8 flex-shrink-0">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{selectedEquip.type}</p>
                          <h2 className="text-2xl font-black text-gray-900">{selectedEquip.brand} {selectedEquip.model}</h2>
                        </div>
                        <button onClick={() => setIsDetailsOpen(false)} className="text-gray-400 hover:text-gray-600">
                          <i className="fa-solid fa-times text-xl"></i>
                        </button>
                     </div>

                     {/* TABS HEADER - QR REMOVED */}
                     <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-1 overflow-x-auto">
                        <button 
                            onClick={() => setDetailTab('info')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${detailTab === 'info' ? 'bg-brand-blue-cyan text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            Información
                        </button>
                        <button 
                            onClick={() => setDetailTab('history')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${detailTab === 'history' ? 'bg-brand-blue-cyan text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            Historial
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${detailTab === 'history' ? 'bg-white text-brand-blue-cyan' : 'bg-gray-200 text-gray-500'}`}>
                                {getHistory(selectedEquip.id).length}
                            </span>
                        </button>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-8">
                     {/* --- TAB INFO --- */}
                     {detailTab === 'info' && (
                         <div className="space-y-6">
                            
                            {/* SECCIÓN MANTENIMIENTO ACTIVO */}
                            {(() => {
                                const activeTicket = getActiveTicket(selectedEquip.id);
                                if (activeTicket) {
                                    return (
                                        <div className="bg-red-50 p-4 rounded-xl border border-red-200 animate-pulse-slow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-sm font-black text-red-700 uppercase flex items-center gap-2">
                                                    <i className="fa-solid fa-triangle-exclamation"></i> Mantenimiento en Curso
                                                </h4>
                                                <span className="text-[10px] font-bold bg-white text-red-600 px-2 py-0.5 rounded shadow-sm">
                                                    Ticket #{activeTicket.id}
                                                </span>
                                            </div>
                                            <p className="font-bold text-gray-900 text-sm mb-1">{activeTicket.title}</p>
                                            <p className="text-xs text-gray-600 mb-3">{activeTicket.description}</p>
                                            
                                            {activeTicket.attachments && activeTicket.attachments.length > 0 && (
                                                <button 
                                                    onClick={() => handleViewEvidence(activeTicket.title, activeTicket.attachments || [])}
                                                    className="w-full py-2 bg-white border border-red-200 text-red-600 font-bold text-xs rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <i className="fa-solid fa-paperclip"></i>
                                                    Ver Evidencia ({activeTicket.attachments.length})
                                                </button>
                                            )}
                                            {(!activeTicket.attachments || activeTicket.attachments.length === 0) && (
                                                <p className="text-[10px] text-red-400 italic text-center">Sin evidencia adjunta</p>
                                            )}
                                        </div>
                                    );
                                }
                                return null;
                            })()}

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

                            {/* VINCULACIONES DE SOFTWARE Y CREDENCIALES */}
                            <div className="border-t border-gray-100 pt-4">
                                <p className="text-[10px] font-black text-brand-blue-cyan uppercase tracking-widest mb-3">Recursos Vinculados</p>
                                <div className="space-y-2">
                                    {/* Licencias */}
                                    {getLinkedLicenses(selectedEquip.id).map(l => (
                                        <div key={l.id} className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-100 text-sm">
                                            <i className="fa-solid fa-certificate text-yellow-600"></i>
                                            <span className="font-bold text-gray-700">{l.name}</span>
                                            <span className="text-xs text-gray-400">({l.type})</span>
                                        </div>
                                    ))}
                                    {/* Credenciales */}
                                    {getLinkedCredentials(selectedEquip.id).map(c => (
                                        <div key={c.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100 text-sm">
                                            <i className="fa-solid fa-key text-blue-600"></i>
                                            <span className="font-bold text-gray-700">{c.service}</span>
                                            <span className="text-xs text-gray-400">({c.username})</span>
                                        </div>
                                    ))}
                                    {getLinkedLicenses(selectedEquip.id).length === 0 && getLinkedCredentials(selectedEquip.id).length === 0 && (
                                        <p className="text-xs text-gray-400 italic">No hay recursos vinculados directamente a este equipo.</p>
                                    )}
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
                     )}

                     {/* --- TAB HISTORIAL --- */}
                     {detailTab === 'history' && (
                         <div className="relative border-l-2 border-gray-100 ml-3 space-y-6 pl-6 py-2">
                            {getHistory(selectedEquip.id).map(h => (
                                <div key={h.id} className="relative group">
                                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-gray-300 group-hover:border-brand-blue-cyan transition-colors"></div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1">
                                            <i className={`fa-solid ${getActionIcon(h.actionType)} text-xs`}></i>
                                            <span className="text-xs font-bold text-gray-500">{new Date(h.date).toLocaleDateString()} {new Date(h.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">{h.description}</p>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">Por: {h.user || 'Sistema'}</p>
                                    </div>
                                </div>
                            ))}
                            {getHistory(selectedEquip.id).length === 0 && (
                                <div className="text-gray-400 text-sm italic">No hay historial registrado para este equipo.</div>
                            )}
                         </div>
                     )}
                  </div>
                  
                  <div className="p-8 pt-0 flex-shrink-0">
                    <button onClick={() => setIsDetailsOpen(false)} className="w-full mt-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all">
                        Cerrar Ficha
                    </button>
                  </div>
              </div>
           </div>
        </div>
      )}

      {/* MODAL REPORTE MANTENIMIENTO - RESPONSIVE SCROLL FIX */}
      {isMaintenanceOpen && selectedEquip && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
           <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMaintenanceOpen(false)}></div>
           <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-lg">
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
        </div>
      )}

      {/* MODAL EVIDENCIAS (GALERÍA) */}
      {evidenceModalOpen && selectedEvidence && (
          <div className="fixed inset-0 z-[60] overflow-y-auto">
              <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md transition-opacity" onClick={() => setEvidenceModalOpen(false)}></div>
              <div className="flex min-h-full items-center justify-center p-4">
                  <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                      <div className="p-8">
                          <div className="flex justify-between items-center mb-6">
                              <div>
                                  <h2 className="text-xl font-black text-gray-900">Evidencia Adjunta</h2>
                                  <p className="text-sm text-gray-500">Ticket: {selectedEvidence.title}</p>
                              </div>
                              <button onClick={() => setEvidenceModalOpen(false)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-all">
                                  <i className="fa-solid fa-times text-xl"></i>
                              </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                              {selectedEvidence.images.map((att) => (
                                  <div key={att.id} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                                      <img src={att.data} alt="Evidencia" className="w-full h-auto object-contain" />
                                      <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white p-2 text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                          {att.name}
                                      </div>
                                  </div>
                              ))}
                          </div>
                          
                          <div className="mt-6 flex justify-end">
                              <button onClick={() => setEvidenceModalOpen(false)} className="px-6 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all">
                                  Cerrar Galería
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL CONFIRMACION ELIMINAR */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setDeleteConfirm({ isOpen: false, id: null })}></div>
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-sm p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">¿Eliminar Equipo?</h3>
              <p className="text-sm text-gray-500 mb-6 text-center">
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
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
