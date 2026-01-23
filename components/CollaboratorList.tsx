
import React, { useState, useEffect } from 'react';
import { Company, Collaborator } from '../types';
import { getCollaboratorsByCompany, addCollaborator, deleteCollaborator, toggleCollaboratorStatus } from '../services/inventoryService';

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
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Collaborator>>({
    firstName: '',
    lastName: '',
    email: '',
    cargo: '',
    area: '',
    sex: 'Male',
    isActive: true
  });

  useEffect(() => {
    setCollaborators(getCollaboratorsByCompany(company.id));
  }, [company]);

  const handleToggleStatus = (id: number) => {
    toggleCollaboratorStatus(id);
    setCollaborators([...getCollaboratorsByCompany(company.id)]);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar a este colaborador? Se perderá el historial de asignaciones.')) {
      deleteCollaborator(id);
      setCollaborators(getCollaboratorsByCompany(company.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCollaborator({
      ...formData as Omit<Collaborator, 'id'>,
      companyId: company.id,
      siteId: 1
    });
    setCollaborators(getCollaboratorsByCompany(company.id));
    setIsModalOpen(false);
    setFormData({ firstName: '', lastName: '', email: '', cargo: '', area: '', sex: 'Male', isActive: true });
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Personal</h1>
          <p className="text-gray-500">Administra los colaboradores responsables de activos en {company.name}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto bg-brand-blue-cyan text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-blue-dark transition-all shadow-lg shadow-brand-blue-cyan/10 flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-user-plus"></i>
          Añadir Colaborador
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {collaborators.map((c) => (
          <div key={c.id} className={`bg-white p-6 rounded-2xl border ${c.isActive ? 'border-gray-100 shadow-sm' : 'border-gray-200 bg-gray-50/50 opacity-75'} flex gap-5 items-start transition-all group overflow-hidden`}>
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
                      {/* break-all: fuerza el salto de línea en correos largos en móvil */}
                      <span className="break-all">{c.email}</span>
                   </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                   <div className="flex gap-2">
                      <button 
                        onClick={() => handleToggleStatus(c.id)}
                        className={`text-[10px] font-bold px-3 py-1 rounded-lg transition-colors ${c.isActive ? 'bg-brand-yellow/10 text-brand-yellow hover:bg-brand-yellow/20' : 'bg-brand-green-light/10 text-brand-green-dark hover:bg-brand-green-light/20'}`}
                      >
                        {c.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="text-[10px] font-bold px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Eliminar
                      </button>
                   </div>
                   <button className="text-gray-400 hover:text-brand-blue-cyan transition-colors">
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                   </button>
                </div>
             </div>
          </div>
        ))}

        {collaborators.length === 0 && (
          <div className="col-span-full py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
             <i className="fa-solid fa-users-slash text-5xl mb-4"></i>
             <p className="font-bold">No hay colaboradores registrados</p>
             <button onClick={() => setIsModalOpen(true)} className="mt-4 text-brand-blue-cyan font-bold hover:underline">Registrar el primero</button>
          </div>
        )}
      </div>

      {/* MODAL NUEVO COLABORADOR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Nuevo Colaborador</h2>
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
                    Crear Registro
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaboratorList;
