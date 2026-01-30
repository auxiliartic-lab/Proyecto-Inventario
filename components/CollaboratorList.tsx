
import React, { useState, useEffect, useRef } from 'react';
import { Company, Collaborator, Equipment, EquipmentStatus, SoftwareLicense, Credential } from '../types';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import CollaboratorForm from './forms/CollaboratorForm';
import { generateHandoverPDF, generateLicenseHandoverPDF } from '../utils/pdfGenerator';
import { useToast } from '../context/ToastContext';
import * as XLSX from 'xlsx';

interface CollaboratorListProps {
  company: Company;
  onNavigate: (tab: string) => void;
}

// --- AVATARES CORPORATIVOS (SVG PURO) ---
const BusinessAvatar: React.FC<{ gender: 'Male' | 'Female', className?: string }> = ({ gender, className }) => {
  const isFemale = gender === 'Female';
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" fill="none">
      <circle cx="50" cy="50" r="50" fill="#f1f5f9" /> 
      <path 
        d={isFemale 
          ? "M50 25C42 25 36 31 36 40C36 48 42 54 50 54C58 54 64 48 64 40C64 31 58 25 50 25ZM28 84C28 70 38 62 50 62C62 62 72 70 72 84"
          : "M50 28C43 28 38 33 38 41C38 49 43 54 50 54C57 54 62 49 62 41C62 33 57 28 50 28ZM28 84C28 70 38 60 50 60C62 60 72 70 72 84"
        }
        fill="#334155" 
        opacity="0.8"
      />
      <path 
        d={isFemale 
            ? "M28 84H72C72 73 62 68 50 68C38 68 28 73 28 84Z"
            : "M28 84H72C72 72 62 66 50 66C38 66 28 72 28 84Z"
        } 
        fill="#0072BC" 
        opacity="0.6" 
      />
    </svg>
  );
};

const CollaboratorList: React.FC<CollaboratorListProps> = ({ company, onNavigate }) => {
  const { data, addCollaborator, bulkAddCollaborators, updateCollaborator, deleteCollaborator, toggleCollaboratorStatus, setRedirectTarget } = useInventory();
  const { hasPermission } = useAuth();
  const { addToast } = useToast();
  
  // States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: number | null}>({ isOpen: false, id: null });
  const [selectedCollab, setSelectedCollab] = useState<Collaborator | null>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  
  // Bulk Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Estado para Tabs del Modal
  const [detailTab, setDetailTab] = useState<'equipment' | 'licenses' | 'credentials'>('equipment');

  // Close menu on click outside
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const collaborators = data.collaborators.filter(c => c.companyId === company.id);

  const filteredCollaborators = collaborators.filter(c => 
    c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingId(null);
    setSelectedCollab(null);
    setIsFormOpen(true);
    setActiveMenu(null);
  };

  const handleEdit = (collab: Collaborator) => {
    setEditingId(collab.id);
    setSelectedCollab(collab);
    setIsFormOpen(true);
    setActiveMenu(null);
  };

  const handleViewProfile = (collab: Collaborator) => {
    setSelectedCollab(collab);
    setDetailTab('equipment'); 
    setIsDetailOpen(true);
    setActiveMenu(null);
  };

  const requestDelete = (id: number) => {
    setDeleteConfirm({ isOpen: true, id });
    setActiveMenu(null);
  };

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      deleteCollaborator(deleteConfirm.id);
      setDeleteConfirm({ isOpen: false, id: null });
      addToast('Colaborador eliminado correctamente', 'success');
    }
  };

  const handleSubmit = (formData: Partial<Collaborator>) => {
    if (editingId && selectedCollab) {
        updateCollaborator({ ...selectedCollab, ...formData } as Collaborator);
        addToast('Colaborador actualizado', 'success');
    } else {
        addCollaborator({ ...formData, companyId: company.id, siteId: 1 } as Omit<Collaborator, 'id'>);
        addToast('Nuevo colaborador registrado', 'success');
    }
    setIsFormOpen(false);
    setEditingId(null);
    setSelectedCollab(null);
  };

  // --- BULK IMPORT LOGIC ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws);

        // Transformación y Validación
        const importedCollabs: Omit<Collaborator, 'id'>[] = [];
        
        rawData.forEach((row: any) => {
           // Mapeo simple: asume columnas Nombre, Apellido, Email, Cargo, Area, Sexo
           if (row['Nombre'] && row['Apellido'] && row['Email']) {
              importedCollabs.push({
                  companyId: company.id,
                  siteId: 1, // Default por ahora
                  firstName: row['Nombre'],
                  lastName: row['Apellido'],
                  email: row['Email'],
                  cargo: row['Cargo'] || 'Sin Cargo',
                  area: row['Area'] || 'General',
                  sex: (row['Sexo'] === 'Femenino' || row['Sexo'] === 'F') ? 'Female' : 'Male',
                  isActive: true
              });
           }
        });

        if (importedCollabs.length > 0) {
            bulkAddCollaborators(importedCollabs);
            addToast(`Se importaron ${importedCollabs.length} colaboradores exitosamente`, 'success');
        } else {
            addToast('No se encontraron datos válidos en el archivo', 'warning');
        }

      } catch (error) {
        console.error("Error parsing Excel", error);
        addToast('Error al procesar el archivo. Verifique el formato.', 'error');
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleLocateItem = (type: 'equipment' | 'license' | 'credential', id: number) => {
    setRedirectTarget({ type, id });
    const targetTab = type === 'equipment' ? 'equipment' : type === 'license' ? 'licenses' : 'credentials';
    onNavigate(targetTab);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Copiado al portapapeles', 'success');
  };

  const handleToggleStatus = (collab: Collaborator) => {
      toggleCollaboratorStatus(collab.id);
      setActiveMenu(null);
      addToast(`Colaborador ${collab.isActive ? 'desactivado' : 'activado'}`, 'info');
  };

  const handleDownloadLicensePDF = (license: SoftwareLicense, collab: Collaborator) => {
      generateLicenseHandoverPDF(company, license, collab, 'person');
  };

  // --- DATA GETTERS ---
  const getAssignedEquipment = (collabId: number) => data.equipment.filter(e => e.assignedTo === collabId);
  
  const getAssignedLicenses = (collabId: number) => {
      // 1. Equipos del usuario
      const userEquipmentIds = data.equipment
        .filter(e => e.assignedTo === collabId)
        .map(e => e.id);

      // 2. Licencias donde:
      // a) El usuario está en 'assignedTo' (Directa)
      // b) O alguno de sus equipos está en 'assignedToEquipment' (Indirecta)
      return data.licenses.filter(l => {
          const isDirect = (l.assignedTo || []).includes(collabId);
          const isViaEquipment = (l.assignedToEquipment || []).some(eqId => userEquipmentIds.includes(eqId));
          return isDirect || isViaEquipment;
      });
  };
  
  const getAssignedCredentials = (collabId: number) => (data.credentials || []).filter(c => c.assignedTo === collabId);

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

  // Permisos
  const canCreate = hasPermission('create');
  const canEdit = hasPermission('edit');
  const canDelete = hasPermission('delete');

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Colaboradores</h1>
            <span className="bg-brand-blue-cyan/10 text-brand-blue-cyan px-3 py-1 rounded-full text-xs font-bold border border-brand-blue-cyan/20 whitespace-nowrap">
                {collaborators.length} Registrados
            </span>
          </div>
          <p className="text-gray-500">Gestión de asignaciones y perfiles.</p>
        </div>
        
        <div className="flex flex-row gap-3 w-full md:w-auto">
          <div className="relative group flex-1 sm:w-64">
             <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue-cyan transition-colors"></i>
             <input 
               type="text" 
               placeholder="Buscar persona..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan transition-all text-sm font-medium h-[42px]"
             />
          </div>
          
          {canCreate && (
            <>
                {/* Botón Importar CSV */}
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 shrink-0 w-auto active:scale-95 touch-manipulation h-[42px]"
                    title="Importar desde Excel"
                >
                    {isImporting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-file-csv"></i>}
                    <span className="hidden lg:inline">Importar</span>
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".xlsx, .xls, .csv" 
                    onChange={handleFileUpload}
                />

                <button 
                    onClick={handleCreate}
                    className="bg-brand-blue-cyan text-white px-4 py-2.5 rounded-xl font-bold hover:bg-brand-blue-dark transition-all shadow-lg shadow-brand-blue-cyan/10 flex items-center justify-center gap-2 shrink-0 w-auto active:scale-95 touch-manipulation h-[42px]"
                >
                    <i className="fa-solid fa-plus"></i>
                    <span className="hidden sm:inline">Nuevo</span>
                </button>
            </>
          )}
        </div>
      </div>

      {/* LISTA CORPORATIVA */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredCollaborators.map(collab => {
            return (
                <div key={collab.id} className={`group bg-white rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all relative flex items-center p-5 gap-4 ${collab.isActive ? 'border-l-brand-blue-cyan border-y border-r border-gray-100' : 'border-l-gray-300 border-y border-r border-gray-100 opacity-70'}`}>
                    
                    {/* Actions Menu */}
                    <div className="absolute top-2 right-2 z-10">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(activeMenu === collab.id ? null : collab.id);
                            }}
                            className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-all"
                        >
                            <i className="fa-solid fa-ellipsis"></i>
                        </button>
                        
                        {/* Dropdown RBAC */}
                        {activeMenu === collab.id && (
                            <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <button onClick={() => handleViewProfile(collab)} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex gap-2"><i className="fa-solid fa-eye w-5 text-center"></i> Ver Perfil</button>
                                {canEdit && (
                                    <>
                                        <button onClick={() => handleEdit(collab)} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex gap-2 border-t border-gray-50"><i className="fa-solid fa-pen w-5 text-center"></i> Editar</button>
                                        <button onClick={() => handleToggleStatus(collab)} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex gap-2 border-t border-gray-50"><i className={`fa-solid ${collab.isActive ? 'fa-ban text-red-400' : 'fa-check text-green-500'} w-5 text-center`}></i> {collab.isActive ? 'Desactivar' : 'Activar'}</button>
                                    </>
                                )}
                                {canDelete && (
                                    <button onClick={() => requestDelete(collab.id)} className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 flex gap-2 border-t border-gray-50"><i className="fa-solid fa-trash-can w-5 text-center"></i> Eliminar</button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="shrink-0 relative">
                        <BusinessAvatar gender={collab.sex} className="w-14 h-14 rounded-full border border-gray-100 bg-gray-50" />
                        <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${collab.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{collab.firstName} {collab.lastName}</h3>
                        <p className="text-xs font-medium text-brand-blue-dark truncate mb-0.5">{collab.cargo}</p>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500">
                             <span className="truncate"><i className="fa-solid fa-building mr-1 text-gray-300"></i>{collab.area}</span>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      {/* MODAL PERFIL DETALLADO */}
      {isDetailOpen && selectedCollab && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden">
                  
                  {/* Header Profile */}
                  <div className="bg-gray-900 p-6 text-white shrink-0 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <BusinessAvatar gender={selectedCollab.sex} className="w-16 h-16 rounded-full bg-white border-2 border-gray-700" />
                          <div>
                              <h2 className="text-xl font-bold">{selectedCollab.firstName} {selectedCollab.lastName}</h2>
                              <p className="text-brand-blue-cyan font-medium text-sm">{selectedCollab.cargo}</p>
                              <div className="flex gap-4 mt-1 text-xs text-gray-400">
                                  <span><i className="fa-solid fa-building mr-1"></i> {selectedCollab.area}</span>
                                  <button 
                                    onClick={() => handleCopy(selectedCollab.email)}
                                    className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer group"
                                    title="Click para copiar correo"
                                  >
                                    <i className="fa-solid fa-envelope group-hover:text-brand-blue-cyan mr-1 transition-colors"></i> 
                                    <span>{selectedCollab.email}</span>
                                  </button>
                              </div>
                          </div>
                      </div>
                      <button onClick={() => setIsDetailOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all">
                          <i className="fa-solid fa-times"></i>
                      </button>
                  </div>

                  {/* TABS NAVIGATION */}
                  <div className="flex border-b border-gray-200 bg-gray-50 px-6 overflow-x-auto">
                      <button 
                        onClick={() => setDetailTab('equipment')}
                        className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${detailTab === 'equipment' ? 'border-brand-blue-cyan text-brand-blue-dark bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                      >
                          <i className="fa-solid fa-laptop"></i> Equipos
                      </button>
                      <button 
                        onClick={() => setDetailTab('licenses')}
                        className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${detailTab === 'licenses' ? 'border-brand-blue-cyan text-brand-blue-dark bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                      >
                          <i className="fa-solid fa-certificate"></i> Licencias
                      </button>
                      <button 
                        onClick={() => setDetailTab('credentials')}
                        className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${detailTab === 'credentials' ? 'border-brand-blue-cyan text-brand-blue-dark bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                      >
                          <i className="fa-solid fa-key"></i> Credenciales
                      </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
                      
                      {/* --- TAB EQUIPOS --- */}
                      {detailTab === 'equipment' && (() => {
                          const allEquip = getAssignedEquipment(selectedCollab.id);
                          const maintenanceEquip = allEquip.filter(e => e.status === EquipmentStatus.MAINTENANCE);
                          const activeEquip = allEquip.filter(e => e.status !== EquipmentStatus.MAINTENANCE);

                          return (
                            <div className="space-y-6">
                                {/* SECCIÓN 1: EN TALLER (MANTENIMIENTO) */}
                                {maintenanceEquip.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-black text-yellow-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <i className="fa-solid fa-triangle-exclamation"></i> Equipos en Reparación
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {maintenanceEquip.map(eq => (
                                                <div key={eq.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex justify-between items-center shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
                                                            <i className="fa-solid fa-screwdriver-wrench"></i>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm">{eq.brand} {eq.model}</p>
                                                            <p className="text-xs text-yellow-700 font-medium">Estado: Mantenimiento Activo</p>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleLocateItem('equipment', eq.id)}
                                                        className="text-xs font-bold text-yellow-700 hover:text-yellow-900 bg-yellow-200/50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                                                    >
                                                        <i className="fa-solid fa-crosshairs"></i> Localizar
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* SECCIÓN 2: ACTIVOS */}
                                <div>
                                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <i className="fa-solid fa-check-circle text-green-500"></i> Equipos Activos
                                    </h3>
                                    {activeEquip.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {activeEquip.map(eq => (
                                                <div key={eq.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-brand-blue-cyan transition-colors">
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 border border-gray-100">
                                                            <i className={`fa-solid ${getIconForType(eq.type)}`}></i>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-800 text-sm">{eq.brand} {eq.model}</p>
                                                            <p className="text-xs text-gray-400 font-mono">SN: {eq.serialNumber}</p>
                                                            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded uppercase font-bold">{eq.type}</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-2 border-t border-gray-50 pt-3 flex items-center justify-between">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); generateHandoverPDF(company, eq, selectedCollab); }}
                                                            className="flex-1 mr-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <i className="fa-solid fa-file-pdf text-red-500"></i> PDF
                                                        </button>
                                                        
                                                        <button 
                                                            onClick={() => handleLocateItem('equipment', eq.id)}
                                                            className="py-2 px-3 bg-brand-blue-cyan/10 text-brand-blue-cyan hover:bg-brand-blue-cyan hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                                                        >
                                                            <i className="fa-solid fa-crosshairs"></i> Localizar
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-lg text-center border border-dashed border-gray-200">
                                            No tiene equipos activos asignados.
                                        </div>
                                    )}
                                </div>
                            </div>
                          );
                      })()}

                      {/* --- TAB LICENCIAS --- */}
                      {detailTab === 'licenses' && (() => {
                          const userLicenses = getAssignedLicenses(selectedCollab.id);
                          
                          if (userLicenses.length === 0) {
                              return (
                                  <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                      <i className="fa-solid fa-certificate text-3xl mb-2 opacity-50"></i>
                                      <p className="text-sm font-medium">No tiene licencias asignadas.</p>
                                  </div>
                              );
                          }

                          return (
                              <div className="space-y-3">
                                  {userLicenses.map(license => {
                                      // Verificar tipo de asignación
                                      const isDirect = (license.assignedTo || []).includes(selectedCollab.id);
                                      
                                      // Buscar si es vía equipo
                                      const bridgingEquipment = data.equipment.filter(e => 
                                          e.assignedTo === selectedCollab.id && 
                                          (license.assignedToEquipment || []).includes(e.id)
                                      );

                                      return (
                                          <div key={license.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3 hover:border-brand-blue-cyan transition-all group">
                                              <div className="flex justify-between items-start">
                                                  <div>
                                                      <h4 className="font-bold text-gray-900 text-sm">{license.name}</h4>
                                                      <p className="text-xs text-gray-500">{license.vendor}</p>
                                                  </div>
                                                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${isDirect ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                                      {isDirect ? 'Asignación Directa' : 'Vía Equipo'}
                                                  </span>
                                              </div>

                                              {/* Detalles */}
                                              <div className="flex items-center gap-4 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                      <i className="fa-solid fa-key text-gray-400"></i>
                                                      <span className="font-mono bg-white px-1.5 rounded border border-gray-200 truncate block w-full">{license.key}</span>
                                                  </div>
                                                  <div className="flex items-center gap-1.5 ml-auto whitespace-nowrap">
                                                      <i className="fa-regular fa-calendar text-gray-400"></i>
                                                      <span>Vence: {new Date(license.expirationDate).toLocaleDateString()}</span>
                                                  </div>
                                              </div>

                                              {/* Badge de Equipo Puente (Si es indirecta) */}
                                              {bridgingEquipment.length > 0 && (
                                                  <div className="flex flex-wrap gap-2 mt-1">
                                                      {bridgingEquipment.map(eq => (
                                                          <div key={eq.id} className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-50 border border-purple-100 rounded text-[10px] text-purple-700 font-bold">
                                                              <i className="fa-solid fa-link"></i>
                                                              Vinculado a: {eq.type} {eq.brand} ({eq.serialNumber})
                                                          </div>
                                                      ))}
                                                  </div>
                                              )}
                                              
                                              {/* Footer con Botones */}
                                              <div className="mt-1 pt-3 border-t border-gray-50 flex justify-between items-center">
                                                   <button 
                                                      onClick={() => handleLocateItem('license', license.id)}
                                                      className="text-[10px] font-bold text-gray-400 hover:text-brand-blue-cyan flex items-center gap-1.5"
                                                   >
                                                      <i className="fa-solid fa-arrow-up-right-from-square"></i> Ver Licencia
                                                   </button>

                                                   <button 
                                                      onClick={() => handleDownloadLicensePDF(license, selectedCollab)}
                                                      className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                                                  >
                                                      <i className="fa-solid fa-file-pdf"></i> Acta de Entrega
                                                  </button>
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          );
                      })()}

                      {/* --- TAB CREDENCIALES --- */}
                      {detailTab === 'credentials' && (() => {
                          const userCredentials = getAssignedCredentials(selectedCollab.id);

                          if (userCredentials.length === 0) {
                              return (
                                  <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                      <i className="fa-solid fa-key text-3xl mb-2 opacity-50"></i>
                                      <p className="text-sm font-medium">No tiene credenciales asignadas.</p>
                                  </div>
                              );
                          }

                          return (
                              <div className="space-y-3">
                                  {userCredentials.map(cred => (
                                      <div key={cred.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2 hover:border-brand-blue-cyan transition-all">
                                          <div className="flex justify-between items-start">
                                              <div className="flex items-center gap-3">
                                                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                                      <i className="fa-solid fa-shield-halved"></i>
                                                  </div>
                                                  <div>
                                                      <h4 className="font-bold text-gray-900 text-sm">{cred.service}</h4>
                                                      <p className="text-xs text-gray-500">Usuario: <span className="font-mono text-gray-700">{cred.username}</span></p>
                                                  </div>
                                              </div>
                                              <button 
                                                  onClick={() => handleLocateItem('credential', cred.id)}
                                                  className="text-xs font-bold text-brand-blue-cyan hover:bg-brand-blue-cyan/10 px-3 py-1.5 rounded-lg transition-colors"
                                              >
                                                  Ver Password
                                              </button>
                                          </div>
                                          {cred.description && (
                                              <p className="text-[10px] text-gray-400 italic border-l-2 border-gray-100 pl-2 mt-1">
                                                  {cred.description}
                                              </p>
                                          )}
                                      </div>
                                  ))}
                              </div>
                          );
                      })()}

                  </div>
                  
                  <div className="p-4 bg-gray-50 border-t border-gray-200 text-right">
                      <button onClick={() => setIsDetailOpen(false)} className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-lg transition-colors shadow-sm text-sm">
                          Cerrar Perfil
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL FORMULARIO */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="p-8">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-black text-gray-900">{editingId ? 'Editar Colaborador' : 'Nuevo Colaborador'}</h2>
                 <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                   <i className="fa-solid fa-times text-xl"></i>
                 </button>
               </div>
               <CollaboratorForm 
                 initialData={selectedCollab || undefined} 
                 onSubmit={handleSubmit} 
                 onCancel={() => setIsFormOpen(false)} 
                 isEditing={!!editingId}
               />
             </div>
          </div>
        </div>
      )}

      {/* CONFIRMACION ELIMINAR */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl">
              <i className="fa-solid fa-user-xmark"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Eliminar Colaborador</h3>
            <p className="text-sm text-gray-500 mb-6">
              Se desvincularán automáticamente todos los equipos asignados a esta persona.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm({ isOpen: false, id: null })} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition-colors">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaboratorList;
