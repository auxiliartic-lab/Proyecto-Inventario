import React, { useState } from 'react';
import { Company, Credential } from '../types';
import { useInventory } from '../context/InventoryContext';
import CredentialForm from './forms/CredentialForm';

interface CredentialVaultProps {
  company: Company;
}

const CredentialVault: React.FC<CredentialVaultProps> = ({ company }) => {
  const { data, addCredential, updateCredential, deleteCredential } = useInventory();
  
  // Datos Globales
  const credentials = (data.credentials || []).filter(c => c.companyId === company.id);
  const collaborators = data.collaborators.filter(c => c.companyId === company.id);

  // Estados UI
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: number | null}>({ isOpen: false, id: null });
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  // Estado para el formulario (cuando se edita)
  const [selectedCred, setSelectedCred] = useState<Partial<Credential> | undefined>(undefined);

  // --- GESTIÓN DE CREDENCIALES ---

  const toggleVisibility = (id: number) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const requestDelete = (id: number) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      deleteCredential(deleteConfirm.id);
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setSelectedCred(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (cred: Credential) => {
    setEditingId(cred.id);
    setSelectedCred(cred);
    setIsModalOpen(true);
  };

  const handleSubmit = (formData: Partial<Credential>) => {
    if (!formData.service || !formData.username || !formData.password) return;

    if (editingId) {
      updateCredential({
        ...formData as Credential,
        id: editingId,
        companyId: company.id
      });
    } else {
      addCredential({
        ...formData as Omit<Credential, 'id'>,
        companyId: company.id
      });
    }

    setIsModalOpen(false);
    setEditingId(null);
    setSelectedCred(undefined);
  };

  return (
    <div className="animate-in fade-in duration-300 pb-20">
      
      {/* Header Informativo (Sin botón de bloqueo) */}
      <div className="mb-6 p-4 bg-white border border-gray-100 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-blue-cyan flex items-center justify-center border border-blue-100">
             <i className="fa-solid fa-key"></i>
           </div>
           <div>
             <h2 className="font-bold text-sm uppercase tracking-wider text-gray-900">Gestor de Contraseñas</h2>
             <p className="text-xs text-gray-500">Acceso a credenciales de {company.name}</p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
           <div>
             <h3 className="font-bold text-gray-900 text-lg">Credenciales Almacenadas</h3>
             <p className="text-xs text-gray-400 font-mono mt-1">
                Total: {credentials.length} registros
             </p>
           </div>
           <button 
             onClick={handleOpenCreate}
             className="w-full sm:w-auto bg-brand-blue-cyan hover:bg-brand-blue-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-blue-cyan/20"
           >
              <i className="fa-solid fa-plus"></i>
              Agregar
           </button>
        </div>
        
        <div className="divide-y divide-gray-100">
          {credentials.map(cred => {
            const assignedUser = cred.assignedTo ? collaborators.find(c => c.id === cred.assignedTo) : null;

            return (
            <div key={cred.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50 transition-colors group">
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
                    <i className="fa-solid fa-server text-xl"></i>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        {cred.service}
                        {assignedUser && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                                <i className="fa-solid fa-user mr-1"></i> {assignedUser.firstName}
                            </span>
                        )}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">User:</span>
                        <code className="text-sm text-gray-600 font-mono bg-gray-100 px-2 rounded border border-gray-200">
                            {cred.username}
                        </code>
                    </div>
                    {cred.description && <p className="text-xs text-gray-400 mt-2 italic border-l-2 border-gray-200 pl-2">{cred.description}</p>}
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  {/* Zona de Password */}
                  <div className="flex-1 lg:flex-none flex items-center gap-2 bg-slate-900 p-1.5 pl-4 rounded-xl border border-slate-800 shadow-inner min-w-[280px]">
                      <div className="flex-1 overflow-hidden">
                        {showPassword[cred.id] ? (
                            <span className="font-mono text-sm text-green-400 font-bold tracking-wide truncate block">
                                {cred.password}
                            </span>
                        ) : (
                            <div className="flex gap-1">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                                ))}
                            </div>
                        )}
                      </div>

                      <div className="flex gap-1 border-l border-slate-700 pl-1">
                        <button 
                            type="button"
                            onClick={() => toggleVisibility(cred.id)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title={showPassword[cred.id] ? "Ocultar" : "Mostrar"}
                        >
                            <i className={`fa-solid ${showPassword[cred.id] ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                        <button 
                            type="button"
                            onClick={() => handleCopyToClipboard(cred.password || '', cred.id)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${copiedId === cred.id ? 'text-green-400 bg-green-400/10' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                            title="Copiar al portapapeles"
                        >
                            <i className={`fa-solid ${copiedId === cred.id ? 'fa-check' : 'fa-copy'}`}></i>
                        </button>
                      </div>
                  </div>
                  
                  {/* Botones CRUD */}
                  <div className="flex gap-1 ml-2 border-l border-gray-200 pl-3">
                    <button 
                        type="button"
                        onClick={() => handleEdit(cred)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-brand-yellow/10 hover:text-brand-yellow transition-all"
                        title="Editar"
                    >
                        <i className="fa-solid fa-pen"></i>
                    </button>

                    <button 
                        type="button"
                        onClick={() => requestDelete(cred.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                        title="Eliminar"
                    >
                        <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
               </div>
            </div>
          );
          })}

          {credentials.length === 0 && (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <i className="fa-solid fa-folder-open text-gray-300 text-3xl"></i>
              </div>
              <p className="text-gray-500 font-medium">Sin credenciales</p>
              <p className="text-gray-400 text-xs mt-1">Agregue accesos a servidores, paneles o servicios.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL NUEVA / EDITAR CREDENCIAL (Usando componente separado) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-black text-gray-900">
                    {editingId ? 'Editar Credencial' : 'Nueva Credencial'}
                    </h2>
                    <p className="text-xs text-gray-500">Gestión de accesos seguros.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>

              <CredentialForm 
                initialData={selectedCred}
                onSubmit={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                collaborators={collaborators}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CONFIRMACION ELIMINAR --- */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all scale-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Eliminar Credencial</h3>
            <p className="text-sm text-gray-500 mb-6">
              Esta acción eliminará permanentemente la entrada.
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
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CredentialVault;