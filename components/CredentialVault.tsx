
import React, { useState } from 'react';
import { Company, Credential } from '../types';

interface CredentialVaultProps {
  company: Company;
}

const CredentialVault: React.FC<CredentialVaultProps> = ({ company }) => {
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Estado para Confirmación de Borrado
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: number | null}>({ isOpen: false, id: null });

  // Estado local para las credenciales (Simulación de base de datos)
  const [credentials, setCredentials] = useState<Credential[]>([
    { id: 1, companyId: company.id, service: 'Consola AWS', username: 'admin_it', password: 'SafePassword123!', description: 'Acceso root a infraestructura' },
    { id: 2, companyId: company.id, service: 'Panel Hosting', username: 'webmaster', password: 'HostingPass2024', description: 'Cpanel principal' },
    { id: 3, companyId: company.id, service: 'Router Principal', username: 'root', password: 'RouterPass99', description: 'Acceso físico al rack' }
  ]);

  const initialFormData: Partial<Credential> = {
    service: '',
    username: '',
    password: '',
    description: ''
  };

  const [formData, setFormData] = useState<Partial<Credential>>(initialFormData);

  const toggleVisibility = (id: number) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const requestDelete = (id: number) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      setCredentials(prev => prev.filter(c => c.id !== deleteConfirm.id));
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleEdit = (cred: Credential) => {
    setEditingId(cred.id);
    setFormData({
      service: cred.service,
      username: cred.username,
      password: cred.password || '',
      description: cred.description
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.service || !formData.username || !formData.password) return;

    if (editingId) {
      // Actualizar existente
      setCredentials(prev => prev.map(c => c.id === editingId ? {
        ...c,
        service: formData.service!,
        username: formData.username!,
        password: formData.password!,
        description: formData.description || ''
      } : c));
    } else {
      // Crear nueva
      const newCredential: Credential = {
        id: Date.now(), // ID temporal único
        companyId: company.id,
        service: formData.service,
        username: formData.username,
        password: formData.password,
        description: formData.description || ''
      };
      setCredentials([...credentials, newCredential]);
    }

    setIsModalOpen(false);
    setFormData(initialFormData);
    setEditingId(null);
  };

  return (
    <div className="animate-in zoom-in-95 duration-500 pb-20">
      <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="bg-red-500 w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-200">
          <i className="fa-solid fa-shield-halved text-2xl"></i>
        </div>
        <div>
           <h2 className="text-red-900 font-bold text-lg">Zona de Alta Seguridad</h2>
           <p className="text-red-700 text-sm">El acceso a estas credenciales está auditado. Solo personal autorizado debe ver esta información.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <div>
             <h3 className="font-bold text-gray-900 text-lg">Almacén de Credenciales</h3>
             <p className="text-xs text-gray-400">Total guardado: {credentials.length}</p>
           </div>
           <button 
             onClick={handleOpenCreate}
             className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-gray-900/20"
           >
              <i className="fa-solid fa-key"></i>
              Nueva Credencial
           </button>
        </div>
        
        <div className="divide-y divide-gray-100">
          {credentials.map(cred => (
            <div key={cred.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-gray-50 transition-colors group">
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600 shrink-0">
                    <i className="fa-solid fa-vault text-xl"></i>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{cred.service}</p>
                    <p className="text-sm text-gray-500 font-mono bg-gray-100 inline-block px-2 py-0.5 rounded mt-1">
                      <i className="fa-solid fa-user text-xs mr-2 text-gray-400"></i>
                      {cred.username}
                    </p>
                    {cred.description && <p className="text-xs text-gray-400 mt-1 italic">{cred.description}</p>}
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  <div className="flex-1 lg:flex-none flex items-center justify-between gap-4 bg-gray-100 p-2 pl-4 rounded-xl border border-gray-200">
                      <span className={`font-mono text-sm ${showPassword[cred.id] ? 'text-brand-blue-dark font-bold' : 'text-gray-400 select-none tracking-widest'}`}>
                        {showPassword[cred.id] ? cred.password : '••••••••••••'}
                      </span>
                      <button 
                        type="button"
                        onClick={() => toggleVisibility(cred.id)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-brand-blue-cyan transition-colors"
                        title={showPassword[cred.id] ? "Ocultar" : "Mostrar"}
                      >
                        <i className={`fa-solid ${showPassword[cred.id] ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                  </div>
                  
                  {/* Botón Editar */}
                  <button 
                    type="button"
                    onClick={() => handleEdit(cred)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-300 hover:bg-brand-yellow/10 hover:text-brand-yellow transition-all"
                    title="Editar Credencial"
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>

                  <button 
                    type="button"
                    onClick={() => requestDelete(cred.id)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all"
                    title="Eliminar Credencial"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
               </div>
            </div>
          ))}

          {credentials.length === 0 && (
            <div className="p-10 text-center text-gray-400">
              <i className="fa-solid fa-folder-open text-3xl mb-3 opacity-30"></i>
              <p>No hay credenciales guardadas</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL NUEVA / EDITAR CREDENCIAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          {/* ... formulario crear/editar ... */}
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900">
                  {editingId ? 'Editar Credencial' : 'Guardar Credencial'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Servicio / Plataforma</label>
                  <input 
                    required
                    type="text" 
                    value={formData.service}
                    onChange={e => setFormData({...formData, service: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900 transition-all" 
                    placeholder="Ej: AWS Console, GoDaddy..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Usuario / Email</label>
                  <input 
                    required
                    type="text" 
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900 transition-all" 
                    placeholder="admin@empresa.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Contraseña</label>
                  <div className="relative">
                    <input 
                      required
                      type="text" 
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900 transition-all font-mono" 
                      placeholder="••••••••"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                       <i className="fa-solid fa-lock"></i>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Descripción (Opcional)</label>
                  <textarea 
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900 transition-all resize-none" 
                    placeholder="Notas adicionales..."
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg shadow-gray-900/20 transition-all">
                    {editingId ? 'Actualizar' : 'Guardar Seguro'}
                  </button>
                </div>
              </form>
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
              Esta credencial se eliminará permanentemente de la bóveda segura.
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

export default CredentialVault;
