
import React, { useState, useEffect } from 'react';
import { Company, SoftwareLicense, Collaborator, Equipment } from '../types';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import LicenseForm from './forms/LicenseForm';
import { generateLicenseHandoverPDF } from '../utils/pdfGenerator';

interface LicenseManagerProps {
  company: Company;
}

type LicenseStatus = 'Active' | 'Warning' | 'Critical';

const LicenseManager: React.FC<LicenseManagerProps> = ({ company }) => {
  const { data, addLicense, updateLicense, deleteLicense, redirectTarget, setRedirectTarget } = useInventory();
  const { hasPermission } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado para edición
  const [editingId, setEditingId] = useState<number | null>(null);

  // Estado para el modal de detalles
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<SoftwareLicense | null>(null);
  
  // Estado para Confirmación de Borrado
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: number | null}>({ isOpen: false, id: null });

  // Estado para Confirmación de Desvinculación Equipo
  const [unlinkConfirm, setUnlinkConfirm] = useState<{isOpen: boolean, equipmentId: number | null}>({ isOpen: false, equipmentId: null });

  // Estado para Confirmación de Desvinculación Usuario Directo
  const [unlinkUserConfirm, setUnlinkUserConfirm] = useState<{isOpen: boolean, userId: number | null}>({ isOpen: false, userId: null });

  const [filterMode, setFilterMode] = useState<'All' | 'Priority'>('All');
  
  const licenses = data.licenses.filter(l => l.companyId === company.id);
  const collaborators = data.collaborators.filter(c => c.companyId === company.id);
  // Filtramos equipos de la compañía actual
  const equipmentList = data.equipment.filter(e => e.companyId === company.id);

  // Estado temporal para formulario
  const [formInitialData, setFormInitialData] = useState<Partial<SoftwareLicense> | undefined>(undefined);

  // Permisos
  const canCreate = hasPermission('create');
  const canEdit = hasPermission('edit');
  const canDelete = hasPermission('delete');

  // --- REDIRECT HANDLER ---
  useEffect(() => {
    if (redirectTarget && redirectTarget.type === 'license') {
      setFilterMode('All'); // Resetear filtro
      setTimeout(() => {
          const element = document.getElementById(`license-${redirectTarget.id}`);
          if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add('ring-4', 'ring-brand-blue-cyan', 'animate-pulse');
              setTimeout(() => {
                  element.classList.remove('ring-4', 'ring-brand-blue-cyan', 'animate-pulse');
                  setRedirectTarget(null);
              }, 3000);
          }
      }, 300);
    }
  }, [redirectTarget, setRedirectTarget]);


  // Lógica del Semáforo
  const calculateStatus = (expirationDate: string): LicenseStatus => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) return 'Critical';
    if (diffDays <= 30) return 'Warning';
    return 'Active';
  };

  const getStatusConfig = (status: LicenseStatus) => {
    switch (status) {
      case 'Active': 
        return { label: 'Activo', classes: 'bg-green-100 text-green-700 border-green-200', icon: 'fa-check-circle' };
      case 'Warning': 
        return { label: 'Alerta Preventiva', classes: 'bg-yellow-100 text-yellow-700 border-yellow-200 animate-pulse', icon: 'fa-triangle-exclamation' };
      case 'Critical': 
        return { label: 'Vencido / Crítico', classes: 'bg-red-100 text-red-700 border-red-200', icon: 'fa-circle-xmark' };
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormInitialData(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (license: SoftwareLicense) => {
    setEditingId(license.id);
    setFormInitialData(license);
    setIsModalOpen(true);
  };

  const handleSubmit = (formData: Partial<SoftwareLicense>) => {
    if (formData.name && formData.expirationDate && formData.vendor) {
      
      if (editingId) {
        // Actualizar
        updateLicense({
          ...formData as SoftwareLicense,
          id: editingId,
          companyId: company.id
        });
      } else {
        // Crear
        addLicense({
          ...formData as Omit<SoftwareLicense, 'id'>,
          companyId: company.id,
          key: formData.key || 'N/A',
          type: formData.type || 'Suscripción',
          startDate: formData.startDate || new Date().toISOString().split('T')[0],
          totalSlots: formData.totalSlots || 1,
          assignedTo: formData.assignedTo || [],
          assignedToEquipment: formData.assignedToEquipment || []
        });
      }
      
      setIsModalOpen(false);
      setEditingId(null);
      setFormInitialData(undefined);
    }
  };

  const requestDelete = (id: number) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      deleteLicense(deleteConfirm.id);
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  // --- LOGICA DESVINCULAR EQUIPO ---
  const requestUnlinkEquipment = (equipmentId: number) => {
      setUnlinkConfirm({ isOpen: true, equipmentId });
  };

  const confirmUnlinkEquipment = () => {
      if (selectedLicense && unlinkConfirm.equipmentId) {
          const updatedEquipmentList = (selectedLicense.assignedToEquipment || []).filter(id => id !== unlinkConfirm.equipmentId);
          const updatedLicense = { ...selectedLicense, assignedToEquipment: updatedEquipmentList };
          
          updateLicense(updatedLicense);
          setSelectedLicense(updatedLicense); 
          setUnlinkConfirm({ isOpen: false, equipmentId: null });
      }
  };

  // --- LOGICA DESVINCULAR USUARIO DIRECTO ---
  const requestUnlinkUser = (userId: number) => {
      setUnlinkUserConfirm({ isOpen: true, userId });
  };

  const confirmUnlinkUser = () => {
      if (selectedLicense && unlinkUserConfirm.userId) {
          const updatedUserList = (selectedLicense.assignedTo || []).filter(id => id !== unlinkUserConfirm.userId);
          const updatedLicense = { ...selectedLicense, assignedTo: updatedUserList };
          
          updateLicense(updatedLicense);
          setSelectedLicense(updatedLicense);
          setUnlinkUserConfirm({ isOpen: false, userId: null });
      }
  };

  const handleViewDetails = (license: SoftwareLicense) => {
    setSelectedLicense(license);
    setViewModalOpen(true);
  };

  // GENERAR PDF DE LICENCIA (SOLO PERSONAS)
  const handleGeneratePDF = (assignee: Collaborator | Equipment, type: 'person' | 'equipment') => {
      if (!selectedLicense) return;
      // Validacion extra por seguridad, aunque el boton no se muestre para equipos
      if (type === 'equipment') return; 
      generateLicenseHandoverPDF(company, selectedLicense, assignee, type);
  };

  const filteredLicenses = licenses.filter(license => {
    if (filterMode === 'All') return true;
    const status = calculateStatus(license.expirationDate);
    return status === 'Critical' || status === 'Warning';
  });

  return (
    <div className="animate-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Licencias de Software</h1>
            <span className="bg-brand-blue-cyan/10 text-brand-blue-cyan px-3 py-1 rounded-full text-xs font-bold border border-brand-blue-cyan/20 whitespace-nowrap">
                {licenses.length} Licencias
            </span>
          </div>
          <p className="text-gray-500">Control de expiraciones y claves para {company.name}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
           {/* ... botones filtro ... */}
           <div className="bg-white border border-gray-200 rounded-xl p-1 flex w-full md:w-auto h-[42px]">
              <button 
                onClick={() => setFilterMode('All')}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterMode === 'All' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Todas
              </button>
              <button 
                onClick={() => setFilterMode('Priority')}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${filterMode === 'Priority' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <i className="fa-solid fa-bell"></i>
                Vencimientos
              </button>
           </div>
           
           {canCreate && (
             <button 
               onClick={handleOpenCreate}
               className="w-full md:w-auto bg-brand-blue-cyan text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-blue-dark transition-all shadow-lg shadow-brand-blue-cyan/10 flex items-center justify-center gap-2 shrink-0 active:scale-95 touch-manipulation h-[42px]"
             >
               <i className="fa-solid fa-plus"></i>
               <span>Nueva Licencia</span>
             </button>
           )}
        </div>
      </div>

      {/* VISTA ESCRITORIO (TABLA) */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Software / Proveedor</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Uso de Cupos</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Clave</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vigencia</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLicenses.map((license) => {
                const status = calculateStatus(license.expirationDate);
                const statusConfig = getStatusConfig(status);
                
                const totalUsed = (license.assignedTo?.length || 0) + (license.assignedToEquipment?.length || 0);
                const totalSlots = license.totalSlots || 1;
                
                return (
                  <tr 
                    id={`license-${license.id}`}
                    key={license.id} 
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                       <div>
                         <p className="font-bold text-gray-900 text-sm">{license.name}</p>
                         <p className="text-xs text-gray-500">{license.vendor}</p>
                       </div>
                    </td>
                    <td className="px-6 py-4 w-48">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-gray-600">{totalUsed} Asignados</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                            <div className="h-full bg-brand-blue-cyan" style={{width: `${Math.min(100, ((totalUsed) / totalSlots) * 100)}%`}}></div>
                        </div>
                        <p className="text-[9px] text-gray-400 mt-1">Capacidad: {totalSlots} Cupos Total</p>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                         <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-600 break-all max-w-[200px]">{license.key}</code>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-xs">
                          <p className="text-gray-400 mb-0.5">Expira:</p>
                          <p className={`font-bold ${status === 'Critical' ? 'text-red-600' : 'text-gray-800'}`}>
                            {new Date(license.expirationDate).toLocaleDateString()}
                          </p>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig.classes}`}>
                          <i className={`fa-solid ${statusConfig.icon} text-xs`}></i>
                          <span className="text-[10px] font-black uppercase tracking-tight">{statusConfig.label}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <button 
                            type="button"
                            onClick={() => handleViewDetails(license)} 
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-brand-blue-cyan hover:bg-brand-blue-cyan/10 transition-colors" 
                            title="Ver Detalles"
                         >
                            <i className="fa-solid fa-eye"></i>
                         </button>
                         {canEdit && (
                           <button 
                              type="button"
                              onClick={() => handleEdit(license)} 
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-brand-yellow hover:bg-brand-yellow/10 transition-colors" 
                              title="Editar"
                           >
                              <i className="fa-solid fa-pen"></i>
                           </button>
                         )}
                         {canDelete && (
                           <button 
                              type="button"
                              onClick={() => requestDelete(license.id)} 
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" 
                              title="Eliminar"
                           >
                              <i className="fa-solid fa-trash-can"></i>
                           </button>
                         )}
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* VISTA MÓVIL (TARJETAS) */}
      <div className="md:hidden space-y-4">
         {filteredLicenses.map((license) => {
            const status = calculateStatus(license.expirationDate);
            const statusConfig = getStatusConfig(status);
            const totalUsed = (license.assignedTo?.length || 0) + (license.assignedToEquipment?.length || 0);
            const totalSlots = license.totalSlots || 1;

            return (
              <div id={`license-${license.id}`} key={license.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-gray-900">{license.name}</p>
                      <p className="text-xs text-gray-500">{license.vendor}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleViewDetails(license)} className="text-gray-300 hover:text-brand-blue-cyan p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      {canEdit && (
                        <button onClick={() => handleEdit(license)} className="text-gray-300 hover:text-brand-yellow p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <i className="fa-solid fa-pen"></i>
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => requestDelete(license.id)} className="text-gray-300 hover:text-red-500 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      )}
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-gray-500 uppercase">Cupos ({totalSlots} c/u)</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full flex">
                            <div className="h-full bg-brand-blue-cyan" style={{width: `${Math.min(100, (totalUsed / totalSlots) * 100)}%`}}></div>
                        </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Serial / Key</p>
                      <code className="bg-gray-50 block p-2 rounded text-xs font-mono text-gray-700 break-all">{license.key}</code>
                    </div>
                    
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                       <div className="text-xs">
                          <p className="text-gray-400">Vence</p>
                          <p className={`font-bold ${status === 'Critical' ? 'text-red-600' : 'text-gray-800'}`}>
                            {new Date(license.expirationDate).toLocaleDateString()}
                          </p>
                       </div>
                       <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig.classes}`}>
                          <i className={`fa-solid ${statusConfig.icon} text-xs`}></i>
                          <span className="text-[10px] font-black uppercase tracking-tight">{statusConfig.label}</span>
                       </div>
                    </div>
                 </div>
              </div>
            );
         })}
      </div>

      {/* MODAL DETALLES DE LICENCIA (AMPLIADO) */}
      {viewModalOpen && selectedLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
             
             {/* Header */}
             <div className="p-8 pb-4 shrink-0 border-b border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                   <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <i className="fa-solid fa-building"></i>
                        {selectedLicense.vendor}
                      </p>
                      <h2 className="text-3xl font-black text-gray-900 leading-tight">{selectedLicense.name}</h2>
                      <div className="flex items-center gap-4 mt-2">
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wide border border-gray-200">
                              {selectedLicense.type}
                          </span>
                          {(() => {
                             const status = calculateStatus(selectedLicense.expirationDate);
                             const config = getStatusConfig(status);
                             return (
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-bold uppercase tracking-wide ${config.classes}`}>
                                   <i className={`fa-solid ${config.icon}`}></i>
                                   {config.label}
                                </span>
                             );
                          })()}
                      </div>
                   </div>
                   <button onClick={() => setViewModalOpen(false)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all shrink-0">
                      <i className="fa-solid fa-times text-xl"></i>
                   </button>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                
                {/* 1. SECCIÓN DE ESTADÍSTICAS Y BARRA DE PROGRESO */}
                {(() => {
                    const directUserIds = selectedLicense.assignedTo || [];
                    const linkedEquipmentIds = selectedLicense.assignedToEquipment || [];
                    
                    // Buscar usuarios derivados de equipos
                    const userEquipment = [];
                    linkedEquipmentIds.forEach(id => {
                        const eq = equipmentList.find(e => e.id === id);
                        if (eq && eq.assignedTo) {
                             const user = collaborators.find(c => c.id === eq.assignedTo);
                             if (user) userEquipment.push({ equipment: eq, user });
                        }
                    });

                    // CÁLCULO DE CUPOS:
                    // Usuarios = Directos + Indirectos (vía equipo)
                    const displayUsersCount = directUserIds.length + userEquipment.length;
                    
                    // Equipos = Todos los equipos vinculados (aunque tengan usuario, ocupan licencia de equipo)
                    const displayDevicesCount = linkedEquipmentIds.length;
                    
                    const totalSlots = selectedLicense.totalSlots || 1;
                    
                    const userPercentage = Math.min(100, Math.round((displayUsersCount / totalSlots) * 100));
                    const devicePercentage = Math.min(100, Math.round((displayDevicesCount / totalSlots) * 100));
                    
                    return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Barra Usuarios (Directos + Equipos con Usuario) */}
                            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 relative overflow-hidden">
                                <div className="flex justify-between items-end mb-2 relative z-10">
                                    <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-blue-600"><i className="fa-solid fa-users"></i></div>
                                        Cupos Usuarios
                                    </h3>
                                    <span className="text-2xl font-black text-blue-900">{displayUsersCount} <span className="text-sm text-blue-300 font-bold">/ {totalSlots}</span></span>
                                </div>
                                <div className="w-full h-3 bg-blue-100 rounded-full overflow-hidden relative z-10">
                                    <div 
                                        className={`h-full transition-all duration-500 ${userPercentage >= 100 ? 'bg-red-500' : 'bg-brand-blue-cyan'}`} 
                                        style={{width: `${userPercentage}%`}}
                                    ></div>
                                </div>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-bl-full -mr-6 -mt-6 opacity-20"></div>
                            </div>

                            {/* Barra Equipos (Todos los vinculados) */}
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 relative overflow-hidden">
                                <div className="flex justify-between items-end mb-2 relative z-10">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600"><i className="fa-solid fa-laptop"></i></div>
                                        Cupos Equipos
                                    </h3>
                                    <span className="text-2xl font-black text-slate-800">{displayDevicesCount} <span className="text-sm text-slate-300 font-bold">/ {totalSlots}</span></span>
                                </div>
                                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden relative z-10">
                                    <div 
                                        className={`h-full transition-all duration-500 ${devicePercentage >= 100 ? 'bg-red-500' : 'bg-slate-500'}`} 
                                        style={{width: `${devicePercentage}%`}}
                                    ></div>
                                </div>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-200 rounded-bl-full -mr-6 -mt-6 opacity-20"></div>
                            </div>
                        </div>
                    );
                })()}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* 2. COLUMNA IZQUIERDA: COLABORADORES (Directos + Vía Equipo) */}
                    <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
                            Colaboradores Asignados
                        </h3>
                        <div className="space-y-2">
                            {/* --- USUARIOS DIRECTOS --- */}
                            {(selectedLicense.assignedTo || []).map(id => {
                                const user = collaborators.find(c => c.id === id);
                                if (!user) return null;
                                return (
                                    <div key={`u-${id}`} className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-center justify-between gap-3 group hover:bg-blue-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-brand-blue-cyan border border-blue-100 shadow-sm text-xs font-bold shrink-0">
                                                {user.firstName[0]}{user.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm leading-tight">{user.firstName} {user.lastName}</p>
                                                <p className="text-[10px] text-gray-500 uppercase">{user.cargo}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => handleGeneratePDF(user, 'person')}
                                                className="w-8 h-8 flex items-center justify-center text-red-500 bg-white border border-red-100 hover:bg-red-50 rounded-lg shadow-sm transition-all"
                                                title="Generar Acta de Entrega"
                                            >
                                                <i className="fa-solid fa-file-pdf"></i>
                                            </button>
                                            {canEdit && (
                                              <button 
                                                  onClick={() => requestUnlinkUser(id)}
                                                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-all"
                                                  title="Desvincular Usuario"
                                              >
                                                  <i className="fa-solid fa-times"></i>
                                              </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* --- USUARIOS INDIRECTOS (VÍA EQUIPO) --- */}
                            {(selectedLicense.assignedToEquipment || []).map(eqId => {
                                const eq = equipmentList.find(e => e.id === eqId);
                                if (!eq || !eq.assignedTo) return null; // Solo equipos CON usuario asignado
                                const user = collaborators.find(c => c.id === eq.assignedTo);
                                if (!user) return null;

                                return (
                                    <div key={`ue-${eqId}`} className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between gap-3 group hover:border-gray-300 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-500 border border-gray-200 shadow-sm text-xs font-bold shrink-0">
                                                    {user.firstName[0]}{user.lastName[0]}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-200 rounded-full flex items-center justify-center border border-white text-[8px] text-slate-600" title={`Vía Equipo: ${eq.serialNumber}`}>
                                                    <i className="fa-solid fa-laptop"></i>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm leading-tight">{user.firstName} {user.lastName}</p>
                                                <p className="text-[9px] text-gray-400 font-bold flex items-center gap-1">
                                                    <span className="bg-slate-200 px-1 rounded">Vía {eq.brand} {eq.model}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {/* Botón PDF */}
                                            <button 
                                                onClick={() => handleGeneratePDF(user, 'person')}
                                                className="w-8 h-8 flex items-center justify-center text-red-500 bg-white border border-red-100 hover:bg-red-50 rounded-lg shadow-sm transition-all"
                                                title="Generar Acta de Entrega"
                                            >
                                                <i className="fa-solid fa-file-pdf"></i>
                                            </button>
                                            {/* El botón de desvincular equipo está en la columna derecha */}
                                        </div>
                                    </div>
                                );
                            })}

                            {(selectedLicense.assignedTo || []).length === 0 && (selectedLicense.assignedToEquipment || []).every(eqId => !equipmentList.find(e => e.id === eqId)?.assignedTo) && (
                                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <i className="fa-solid fa-user-slash text-2xl mb-2 opacity-50"></i>
                                    <p className="text-xs">No hay usuarios asignados</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. COLUMNA DERECHA: TODOS LOS EQUIPOS VINCULADOS */}
                    <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
                            Equipos Vinculados (Total)
                        </h3>
                        <div className="space-y-2">
                            {(selectedLicense.assignedToEquipment || []).map(id => {
                                const eq = equipmentList.find(e => e.id === id);
                                if (!eq) return null;
                                const assignedUser = eq.assignedTo ? collaborators.find(c => c.id === eq.assignedTo) : null;
                                
                                return (
                                    <div key={id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 group hover:border-brand-blue-cyan transition-colors shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${assignedUser ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-500'}`}>
                                                <i className={`fa-solid ${assignedUser ? 'fa-user-check' : 'fa-laptop'} text-xs`}></i>
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm leading-tight">{eq.brand} {eq.model}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] text-gray-500 uppercase font-mono">SN: {eq.serialNumber}</p>
                                                    {assignedUser && (
                                                        <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">En uso</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {canEdit && (
                                          <button 
                                              onClick={() => requestUnlinkEquipment(id)}
                                              className="w-8 h-8 flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                              title="Desvincular Licencia del Equipo"
                                          >
                                              <i className="fa-solid fa-link-slash text-xs"></i>
                                          </button>
                                        )}
                                    </div>
                                );
                            })}

                            {(selectedLicense.assignedToEquipment || []).length === 0 && (
                                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <i className="fa-solid fa-box-open text-2xl mb-2 opacity-50"></i>
                                    <p className="text-xs">No hay equipos vinculados</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Key Section & Dates */}
                <div className="mt-8 border-t border-gray-100 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center relative overflow-hidden">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Clave de Licencia</p>
                            <code className="text-sm font-mono font-bold text-slate-800 break-all select-all block">
                                {selectedLicense.key}
                            </code>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Inicio</p>
                                <p className="font-bold text-gray-700">
                                    {new Date(selectedLicense.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Vencimiento</p>
                                <p className={`font-bold ${calculateStatus(selectedLicense.expirationDate) === 'Critical' ? 'text-red-600' : 'text-gray-700'}`}>
                                    {new Date(selectedLicense.expirationDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
             </div>

             {/* Footer */}
             <div className="p-8 pt-0 mt-auto">
                <button 
                    onClick={() => setViewModalOpen(false)} 
                    className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg shadow-gray-900/20 transition-all text-sm"
                >
                    Cerrar Ventana
                </button>
             </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVA / EDITAR LICENCIA */}
      {isModalOpen && canCreate && ( // Double check permission
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900">
                  {editingId ? 'Editar Licencia' : 'Registrar Licencia'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>

              <LicenseForm 
                initialData={formInitialData}
                existingLicenses={licenses} // Pasar licencias existentes para validación
                onSubmit={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                isEditing={!!editingId}
                collaborators={collaborators}
                equipmentList={equipmentList}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CONFIRMACION ELIMINAR LICENCIA --- */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all scale-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Estás seguro?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Esta licencia se eliminará permanentemente del registro de la compañía.
            </p>
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => setDeleteConfirm({ isOpen: false, id: null })}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-colors"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CONFIRMACION DESVINCULAR EQUIPO --- */}
      {unlinkConfirm.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all scale-100">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600 text-2xl">
              <i className="fa-solid fa-link-slash"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Desvincular Equipo?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Esta acción liberará el cupo de la licencia para este equipo. 
              <br/>
              <span className="font-bold text-gray-800 block mt-2">Nota: Para volver a vincularlo, deberá hacerlo desde el módulo de Equipos.</span>
            </p>
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => setUnlinkConfirm({ isOpen: false, equipmentId: null })}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={confirmUnlinkEquipment}
                className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow-lg shadow-yellow-500/30 transition-colors"
              >
                Desvincular
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CONFIRMACION DESVINCULAR USUARIO --- */}
      {unlinkUserConfirm.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all scale-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl">
              <i className="fa-solid fa-user-xmark"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Desvincular Usuario?</h3>
            <p className="text-sm text-gray-500 mb-6">
              El colaborador perderá el acceso asignado a esta licencia.
            </p>
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => setUnlinkUserConfirm({ isOpen: false, userId: null })}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={confirmUnlinkUser}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-colors"
              >
                Desvincular
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicenseManager;
