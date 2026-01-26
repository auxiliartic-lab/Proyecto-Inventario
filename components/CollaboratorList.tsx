
import React, { useState, useRef, useEffect } from 'react';
import { Company, Collaborator } from '../types';
import { useInventory } from '../context/InventoryContext';

interface CollaboratorListProps {
  company: Company;
}

const AVATAR_MALE = "https://cdn-icons-png.flaticon.com/512/4042/4042356.png";
const AVATAR_FEMALE = "https://cdn-icons-png.flaticon.com/512/4042/4042422.png";

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
  
  // Estado para datos
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  
  const collaborators = data.collaborators.filter(c => c.companyId === company.id);

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
        <button 
          type="button"
          onClick={handleOpenCreate}
          className="w-full md:w-auto bg-brand-blue-cyan text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-blue-dark transition-all shadow-lg shadow-brand-blue-cyan/10 flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-user-plus"></i>
          Añadir Colaborador
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {collaborators.map((c) => (
          <div key={c.id} className={`bg-white p-6 rounded-2xl border ${c.isActive ? 'border-gray-100 shadow-sm' : 'border-gray-200 bg-gray-50/50 opacity-75'} flex gap-5 items-start transition-all group overflow-visible relative`}>
             <div className="relative shrink-0">
                <img 
                  src={c.sex === 'Female' ? AVATAR_FEMALE : AVATAR_MALE} 
                  className={`w-20 h-20 rounded-full object-cover ring-4 ${c.isActive ? 'ring-brand-blue-cyan/10' : 'ring-gray-200 grayscale'}`} 
                  alt="collaborator" 
                />
                <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white ${c.isActive ? 'bg-brand-green-dark' : 'bg-gray-400'}`}></div>
             </div>
             <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900 text-lg truncate">{c.firstName} {c.lastName}</h3>
                </div>
                <p className={`text-sm font-semibold ${c.isActive ? 'text-brand-blue-dark' : 'text-gray-500'}`}>{c.cargo}</p>
                <p className="text-gray-400 text-xs mt-0.5 italic">{c.area}</p>
                
                <div className="mt-4 flex flex-col gap-1">
                   <div className="flex items-center gap-2 text-xs text-gray-600">
                      <i className="fa-solid fa-envelope w-4"></i>
                      <span className="break-all">{c.email}</span>
                   </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between relative">
                   <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => handleToggleStatus(c.id)}
                        className={`text-[10px] font-bold px-3 py-1 rounded-lg transition-colors ${c.isActive ? 'bg-brand-yellow/10 text-brand-yellow hover:bg-brand-yellow/20' : 'bg-brand-green-light/10 text-brand-green-dark hover:bg-brand-green-light/20'}`}
                      >
                        {c.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => requestDelete(c.id, e)}
                        className="text-[10px] font-bold px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Eliminar
                      </button>
                   </div>
                   
                   {/* Botón de Menú (Tres puntos) */}
                   <div className="relative">
                     <button 
                       type="button"
                       onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                       className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-brand-blue-cyan hover:bg-brand-blue-cyan/10 transition-colors"
                     >
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                     </button>

                     {/* Dropdown Menu */}
                     {openMenuId === c.id && (
                       <div 
                         ref={menuRef}
                         className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl z-20 border border-gray-100 animate-in fade-in zoom-in-95 duration-100 overflow-hidden"
                       >
                         <div className="py-1">
                           <button 
                             type="button"
                             onClick={() => handleViewDetails(c)}
                             className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-blue-cyan font-medium flex items-center gap-2 transition-colors"
                           >
                             <i className="fa-solid fa-eye text-xs w-5 text-center"></i>
                             Ver Detalles
                           </button>
                           <button 
                             type="button"
                             onClick={() => handleEdit(c)}
                             className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-yellow font-medium flex items-center gap-2 transition-colors"
                           >
                             <i className="fa-solid fa-pen text-xs w-5 text-center"></i>
                             Editar Datos
                           </button>
                           <div className="border-t border-gray-100 my-1"></div>
                           <button 
                             type="button"
                             onClick={(e) => requestDelete(c.id, e)}
                             className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 transition-colors"
                           >
                             <i className="fa-solid fa-trash-can text-xs w-5 text-center"></i>
                             Eliminar
                           </button>
                         </div>
                       </div>
                     )}
                   </div>
                </div>
             </div>
          </div>
        ))}

        {collaborators.length === 0 && (
          <div className="col-span-full py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
             <i className="fa-solid fa-users-slash text-5xl mb-4"></i>
             <p className="font-bold">No hay colaboradores registrados</p>
             <button onClick={handleOpenCreate} className="mt-4 text-brand-blue-cyan font-bold hover:underline">Registrar el primero</button>
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

      {/* MODAL VER DETALLES */}
      {viewModalOpen && selectedCollaborator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
            {/* Header decorativo */}
            <div className="h-24 bg-gradient-to-r from-brand-blue-cyan to-brand-blue-dark"></div>
            
            <div className="px-8 pb-8 -mt-12 relative">
               {/* ... contenido tarjeta ... */}
               <div className="flex justify-center mb-4">
                  <img 
                    src={selectedCollaborator.sex === 'Female' ? AVATAR_FEMALE : AVATAR_MALE} 
                    className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white" 
                    alt="Avatar" 
                  />
               </div>

               <div className="text-center mb-6">
                  <h2 className="text-2xl font-black text-gray-900 leading-tight">
                    {selectedCollaborator.firstName} {selectedCollaborator.lastName}
                  </h2>
                  <p className="text-brand-blue-dark font-bold">{selectedCollaborator.cargo}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                     <span className={`w-2.5 h-2.5 rounded-full ${selectedCollaborator.isActive ? 'bg-brand-green-dark' : 'bg-gray-400'}`}></span>
                     <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                       {selectedCollaborator.isActive ? 'Activo' : 'Inactivo'}
                     </span>
                  </div>
               </div>

               <div className="space-y-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-blue-cyan shadow-sm">
                       <i className="fa-solid fa-envelope text-xs"></i>
                     </div>
                     <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Correo</p>
                        <p className="text-sm font-semibold text-gray-700 truncate">{selectedCollaborator.email}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-orange shadow-sm">
                       <i className="fa-solid fa-briefcase text-xs"></i>
                     </div>
                     <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Departamento</p>
                        <p className="text-sm font-semibold text-gray-700">{selectedCollaborator.area}</p>
                     </div>
                  </div>
               </div>

               <button 
                 onClick={() => setViewModalOpen(false)}
                 className="w-full mt-6 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all"
               >
                 Cerrar Tarjeta
               </button>
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
