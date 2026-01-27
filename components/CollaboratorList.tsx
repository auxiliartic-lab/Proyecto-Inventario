
import React, { useState, useRef, useEffect } from 'react';
import { Company, Collaborator, Equipment } from '../types';
import { useInventory } from '../context/InventoryContext';

interface CollaboratorListProps {
  company: Company;
}

// AVATARES LOCALES (SVG Base64) - Ya no dependen de internet
const AVATAR_MALE = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2UzZjJZmQiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4NSIgcj0iNDUiIGZpbGw9IiMzYjgyZjYiLz4KICA8cGF0aCBkPSJNNDAuMiAxNjlDNDYuNSAxNDQuNiA3MS4zIDEyNy41IDEwMCAxMjcuNWMyOC43IDAgNTMuNSAxNy4xIDU5LjggNDEuNUgxMDAgNDAuMnoiIGZpbGw9IiMzYjgyZjYiLz4KPC9zdmc+";
const AVATAR_FEMALE = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2ZmZTRlNiIvPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9Ijg1IiByPSI0NSIgZmlsbD0iI2VjNDg5OSIvPgogIDxwYXRoIGQ9Ik00MC4yIDE2OUM0Ni41IDE0NC42IDcxLjMgMTI3LjUgMTAwIDEyNy41YzI4LjcgMCA1My41IDE3LjEgNTkuOCA0MS41SDEwMCA0MC4yeiIgZmlsbD0iI2VjNDg5OSIvPgo8L3N2Zz4=";

// Lista de cargos ordenada alfabéticamente por abreviatura
const JOB_TITLES = [
  { label: 'Analista Contable', value: 'Analista Contable' },
  { label: 'Asist. Ejec.', value: 'Asistente Ejecutiva' },
  { label: 'Aux. Admin.', value: 'Auxiliar Administrativo' },
  { label: 'Coord. Comp. y Alm.', value: 'Coordinador de Compras y Almacén' },
  { label: 'Coord. Seg. Hig. Amb.', value: 'Coordinador de Seguridad e Higiene y Ambiental' },
  { label: 'Gte. Gral. RR.HH.', value: 'Gerente General de Recursos Humanos' },
  { label: 'Gte. Nuevos Neg.', value: 'Gerente Desarrollo de Nuevos Negocios' },
  { label: 'Gte. Planta', value: 'Gerente de planta' },
  { label: 'Instrumentista', value: 'Instrumentista' },
  { label: 'Jef. Calidad', value: 'Jefe de Calidad' },
  { label: 'Jef. Comp. y Alm.', value: 'Jefe de Compras y Almacén' },
  { label: 'Jef. Despachos', value: 'Jefe de Despachos' },
  { label: 'Jef. Mant.', value: 'Jefe de Mantenimiento' },
  { label: 'Plan. Mant.', value: 'Planeador de Mantenimiento' }
];

const CollaboratorList: React.FC<CollaboratorListProps> = ({ company }) => {
  const { data, addCollaborator, updateCollaborator, deleteCollaborator, toggleCollaboratorStatus } = useInventory();
  
  // Estados para modales y menús
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: number | null}>({ isOpen: false, id: null });
  
  // Estados de Filtro y Búsqueda (NUEVO)
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Estado para datos
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  
  const collaborators = data.collaborators.filter(c => c.companyId === company.id);

  // Lógica de Filtrado
  const filteredCollaborators = collaborators.filter(c => {
    // 1. Filtro por Estado
    if (statusFilter === 'active' && !c.isActive) return false;
    if (statusFilter === 'inactive' && c.isActive) return false;

    // 2. Filtro por Búsqueda (Nombre, Cargo, Área, Email)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      return (
        fullName.includes(term) ||
        c.cargo.toLowerCase().includes(term) ||
        c.area.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
      );
    }

    return true;
  });

  // Referencia para cerrar menús al hacer clic fuera
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initialFormData: Partial<Collaborator> = {
    firstName: '',
    lastName: '',
    email: '',
    cargo: '',
    area: '',
    sex: 'Male',
    isActive: true
  };

  const [formData, setFormData] = useState<Partial<Collaborator>>(initialFormData);

  // Helper: Obtener equipos asignados
  const getAssignedAssets = (collaboratorId: number) => {
    return data.equipment.filter(e => e.assignedTo === collaboratorId);
  };

  // Helper: Icono por tipo
  const getAssetIcon = (type: string) => {
     switch(type) {
        case 'Laptop': return 'fa-laptop';
        case 'Desktop': return 'fa-desktop';
        case 'Smartphone': return 'fa-mobile-screen';
        case 'Tablet': return 'fa-tablet-screen-button';
        case 'Periférico': return 'fa-keyboard';
        default: return 'fa-box';
     }
  };

  // Manejadores de Acción
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleEdit = (collab: Collaborator) => {
    setEditingId(collab.id);
    setFormData({ ...collab });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleViewDetails = (collab: Collaborator) => {
    setSelectedCollaborator(collab);
    setViewModalOpen(true);
    setOpenMenuId(null);
  };

  const handleToggleStatus = (id: number) => {
    toggleCollaboratorStatus(id);
    setOpenMenuId(null);
  };

  const requestDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({ isOpen: true, id });
    setOpenMenuId(null);
  };

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      deleteCollaborator(deleteConfirm.id);
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      // Actualizar
      updateCollaborator({
        ...formData as Collaborator,
        id: editingId,
        companyId: company.id
      });
    } else {
      // Crear
      addCollaborator({
        ...formData as Omit<Collaborator, 'id'>,
        companyId: company.id,
        siteId: 1
      });
    }
    setIsModalOpen(false);
    setFormData(initialFormData);
    setEditingId(null);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Personal</h1>
          <p className="text-gray-500">Administra los colaboradores responsables de activos en {company.name}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* BARRA DE BÚSQUEDA */}
          <div className="relative group w-full sm:w-64">
             <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue-cyan transition-colors"></i>
             <input 
               type="text" 
               placeholder="Buscar por nombre, cargo..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan transition-all text-sm font-medium"
             />
          </div>

          <button 
            type="button"
            onClick={handleOpenCreate}
            className="w-full md:w-auto bg-brand-blue-cyan text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-blue-dark transition-all shadow-lg shadow-brand-blue-cyan/10 flex items-center justify-center gap-2 shrink-0"
          >
            <i className="fa-solid fa-user-plus"></i>
            Añadir
          </button>
        </div>
      </div>

      {/* FILTROS TABS */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 custom-scrollbar">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
            statusFilter === 'all' 
              ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
            statusFilter === 'active' 
              ? 'bg-brand-green-dark text-white border-brand-green-dark shadow-md' 
              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Activos
        </button>
        <button
          onClick={() => setStatusFilter('inactive')}
          className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
            statusFilter === 'inactive' 
              ? 'bg-gray-400 text-white border-gray-400 shadow-md' 
              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Inactivos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCollaborators.map((c) => {
          const assignedAssets = getAssignedAssets(c.id);
          const assetCount = assignedAssets.length;

          return (
            <div key={c.id} className={`bg-white rounded-2xl border ${c.isActive ? 'border-gray-100 shadow-sm hover:shadow-md' : 'border-gray-200 bg-gray-50/50 opacity-75'} transition-all group overflow-visible relative flex flex-col`}>
               
               <div className="p-6 flex gap-5 items-start">
                  <div className="relative shrink-0">
                      <img 
                        src={c.sex === 'Female' ? AVATAR_FEMALE : AVATAR_MALE} 
                        className={`w-16 h-16 rounded-full object-cover ring-4 bg-gray-50 ${c.isActive ? 'ring-brand-blue-cyan/10' : 'ring-gray-200 grayscale'}`} 
                        alt="collaborator" 
                      />
                      <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${c.isActive ? 'bg-brand-green-dark' : 'bg-gray-400'}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 text-lg truncate pr-6">{c.firstName} {c.lastName}</h3>
                        
                        {/* Menú Tres Puntos */}
                        <div className="relative -mt-1 -mr-2">
                          <button 
                            type="button"
                            onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-brand-blue-cyan hover:bg-brand-blue-cyan/10 transition-colors"
                          >
                              <i className="fa-solid fa-ellipsis-vertical"></i>
                          </button>
                          {openMenuId === c.id && (
                            <div 
                              ref={menuRef}
                              className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl z-20 border border-gray-100 animate-in fade-in zoom-in-95 duration-100 overflow-hidden"
                            >
                              <div className="py-1">
                                <button onClick={() => handleViewDetails(c)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-blue-cyan font-medium flex items-center gap-2"><i className="fa-solid fa-eye text-xs w-5 text-center"></i> Ver Perfil</button>
                                <button onClick={() => handleEdit(c)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-yellow font-medium flex items-center gap-2"><i className="fa-solid fa-pen text-xs w-5 text-center"></i> Editar Datos</button>
                                <button onClick={() => handleToggleStatus(c.id)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-2"><i className={`fa-solid ${c.isActive ? 'fa-toggle-off' : 'fa-toggle-on'} text-xs w-5 text-center`}></i> {c.isActive ? 'Desactivar' : 'Activar'}</button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button onClick={(e) => requestDelete(c.id, e)} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"><i className="fa-solid fa-trash-can text-xs w-5 text-center"></i> Eliminar</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className={`text-sm font-bold ${c.isActive ? 'text-brand-blue-dark' : 'text-gray-500'}`}>{c.cargo}</p>
                      <p className="text-gray-400 text-xs mb-3">{c.area}</p>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg w-fit max-w-full">
                          <i className="fa-solid fa-envelope text-gray-400"></i>
                          <span className="truncate">{c.email}</span>
                      </div>
                  </div>
               </div>

               {/* Resumen de Activos (Footer) */}
               <div className="mt-auto px-6 py-4 bg-gray-50/50 border-t border-gray-50 rounded-b-2xl">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Custodia</span>
                     <span className={`text-xs font-bold ${assetCount > 0 ? 'text-brand-blue-cyan' : 'text-gray-400'}`}>
                        {assetCount} {assetCount === 1 ? 'Activo' : 'Activos'}
                     </span>
                  </div>
                  
                  {assetCount > 0 ? (
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-1 no-scrollbar">
                       {/* Mostrar iconos únicos de tipos de equipos que tiene */}
                       {Array.from(new Set(assignedAssets.map(a => a.type))).slice(0, 5).map(type => (
                          <div key={type} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm shrink-0" title={type}>
                             <i className={`fa-solid ${getAssetIcon(type)} text-xs`}></i>
                          </div>
                       ))}
                       {Array.from(new Set(assignedAssets.map(a => a.type))).length > 5 && (
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-bold shrink-0">
                             +
                          </div>
                       )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-2 italic">Sin equipos asignados</p>
                  )}
               </div>
            </div>
          );
        })}

        {filteredCollaborators.length === 0 && (
          <div className="col-span-full py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
             <i className="fa-solid fa-magnifying-glass text-4xl mb-4 text-gray-300"></i>
             <p className="font-bold">
               {searchTerm ? `No se encontraron resultados para "${searchTerm}"` : 'No hay colaboradores en esta categoría'}
             </p>
             {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="mt-2 text-sm text-brand-blue-cyan font-bold hover:underline">
                  Limpiar búsqueda
                </button>
             )}
          </div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              {/* ... formulario ... */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Editar Colaborador' : 'Nuevo Colaborador'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>
              
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nombre</label>
                    <input 
                      required
                      type="text" 
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan" 
                      placeholder="Ej: Ana"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Apellido</label>
                    <input 
                      required
                      type="text" 
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan" 
                      placeholder="Ej: Silva"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Correo Electrónico</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan" 
                      placeholder="ana.silva@empresa.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Sexo</label>
                    <select
                      value={formData.sex}
                      onChange={e => setFormData({...formData, sex: e.target.value as 'Male' | 'Female'})}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan appearance-none"
                    >
                      <option value="Male">Hombre</option>
                      <option value="Female">Mujer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Cargo</label>
                    <select
                      required
                      value={formData.cargo}
                      onChange={e => setFormData({...formData, cargo: e.target.value})}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan appearance-none" 
                    >
                      <option value="">-- Seleccionar --</option>
                      {JOB_TITLES.map((job) => (
                        <option key={job.value} value={job.value}>
                          {job.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Área</label>
                    <input 
                      required
                      type="text" 
                      value={formData.area}
                      onChange={e => setFormData({...formData, area: e.target.value})}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan" 
                      placeholder="Ej: Finanzas"
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-3 bg-brand-blue-cyan hover:bg-brand-blue-dark text-white font-bold rounded-xl shadow-lg shadow-brand-blue-cyan/20 transition-all">
                    {editingId ? 'Guardar Cambios' : 'Crear Registro'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VER DETALLES (PERFIL COMPLETO) */}
      {viewModalOpen && selectedCollaborator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden flex flex-col md:flex-row h-auto max-h-[90vh]">
            
            {/* COLUMNA IZQUIERDA: PERFIL */}
            <div className="w-full md:w-1/3 bg-gray-50 p-8 border-r border-gray-100 flex flex-col items-center text-center">
               <div className="mb-6 relative">
                  <img 
                    src={selectedCollaborator.sex === 'Female' ? AVATAR_FEMALE : AVATAR_MALE} 
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white" 
                    alt="Avatar" 
                  />
                  <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-white ${selectedCollaborator.isActive ? 'bg-brand-green-dark' : 'bg-gray-400'}`}></div>
               </div>
               
               <h2 className="text-2xl font-black text-gray-900 leading-tight mb-2">
                 {selectedCollaborator.firstName} <br/> {selectedCollaborator.lastName}
               </h2>
               <p className="text-brand-blue-dark font-bold text-sm mb-1">{selectedCollaborator.cargo}</p>
               <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-6">{selectedCollaborator.area}</p>

               <div className="w-full space-y-3">
                  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 text-left">
                     <div className="w-8 h-8 rounded-full bg-brand-blue-cyan/10 flex items-center justify-center text-brand-blue-cyan">
                       <i className="fa-solid fa-envelope text-xs"></i>
                     </div>
                     <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Correo</p>
                        <p className="text-xs font-semibold text-gray-700 truncate" title={selectedCollaborator.email}>{selectedCollaborator.email}</p>
                     </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 text-left">
                     <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                       <i className="fa-solid fa-user-tag text-xs"></i>
                     </div>
                     <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Estado</p>
                        <p className={`text-xs font-bold ${selectedCollaborator.isActive ? 'text-brand-green-dark' : 'text-gray-500'}`}>
                           {selectedCollaborator.isActive ? 'Empleado Activo' : 'Inactivo'}
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            {/* COLUMNA DERECHA: ACTIVOS */}
            <div className="w-full md:w-2/3 p-8 flex flex-col">
               <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Activos en Custodia</h3>
                    <p className="text-sm text-gray-500">Equipos asignados actualmente.</p>
                  </div>
                  <button onClick={() => setViewModalOpen(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                      <i className="fa-solid fa-times text-lg"></i>
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  {getAssignedAssets(selectedCollaborator.id).length > 0 ? (
                    <div className="space-y-3">
                      {getAssignedAssets(selectedCollaborator.id).map(asset => (
                        <div key={asset.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-brand-blue-cyan/30 hover:bg-brand-blue-cyan/5 transition-all group">
                           <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-brand-blue-cyan shadow-sm group-hover:scale-110 transition-transform">
                              <i className={`fa-solid ${getAssetIcon(asset.type)} text-xl`}></i>
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{asset.type}</p>
                              <p className="font-bold text-gray-900 text-sm">{asset.brand} {asset.model}</p>
                              <p className="text-xs text-gray-500 font-mono mt-0.5">SN: {asset.serialNumber}</p>
                           </div>
                           <div className="text-right">
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-lg">Asignado</span>
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                        <i className="fa-solid fa-box-open text-4xl mb-3"></i>
                        <p className="font-medium text-sm">Sin equipos asignados</p>
                    </div>
                  )}
               </div>

               <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                   <p className="text-xs font-bold text-gray-400 uppercase">Total Items: <span className="text-gray-900 text-sm ml-1">{getAssignedAssets(selectedCollaborator.id).length}</span></p>
                   <button 
                     onClick={() => setViewModalOpen(false)}
                     className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg text-sm transition-colors"
                   >
                     Cerrar
                   </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CONFIRMACION ELIMINAR --- */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all scale-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Estás seguro?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Esta acción eliminará al colaborador y desvinculará todos sus equipos asignados.
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
    </div>
  );
};

export default CollaboratorList;
