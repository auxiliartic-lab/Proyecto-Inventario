
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import UserForm from './forms/UserForm';

const UserManagement: React.FC = () => {
  const { data, addUser, updateUser, deleteUser } = useInventory();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: number | null}>({ isOpen: false, id: null });

  // Estado para el desafío de seguridad (Super Admin)
  const [securityChallenge, setSecurityChallenge] = useState<{isOpen: boolean, targetUser: User | null}>({ isOpen: false, targetUser: null });
  const [masterCodeInput, setMasterCodeInput] = useState('');
  
  // CONSTANTES DE SEGURIDAD
  const SUPER_ADMIN_ID = 1; // El ID del administrador principal
  const MASTER_EDIT_CODE = 'MASTER-2025'; // Código duro para editar al principal si no eres él

  const users = data.users || [];
  const collaborators = data.collaborators || [];

  const handleCreate = () => {
    setEditingId(null);
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEditRequest = (u: User) => {
    if (u.id === SUPER_ADMIN_ID) {
        if (currentUser?.id === SUPER_ADMIN_ID) {
            startEdit(u);
        } else {
            setMasterCodeInput('');
            setSecurityChallenge({ isOpen: true, targetUser: u });
        }
    } else {
        startEdit(u);
    }
  };

  const verifyMasterCode = (e: React.FormEvent) => {
      e.preventDefault();
      if (masterCodeInput === MASTER_EDIT_CODE) {
          addToast('Acceso de edición concedido', 'success');
          setSecurityChallenge({ isOpen: false, targetUser: null });
          if (securityChallenge.targetUser) {
              startEdit(securityChallenge.targetUser);
          }
      } else {
          addToast('Código de acceso incorrecto', 'error');
          setMasterCodeInput('');
      }
  };

  const startEdit = (u: User) => {
    setEditingId(u.id);
    setSelectedUser(u);
    setIsFormOpen(true);
  };

  const handleSubmit = (formData: Partial<User>) => {
    if (editingId && selectedUser) {
        const finalPin = formData.pin ? formData.pin : selectedUser.pin;
        updateUser({ ...selectedUser, ...formData, pin: finalPin } as User);
        addToast('Usuario actualizado correctamente', 'success');
    } else {
        addUser(formData as Omit<User, 'id'>);
        addToast('Usuario creado correctamente', 'success');
    }
    setIsFormOpen(false);
  };

  const requestDelete = (id: number) => {
    if (id === SUPER_ADMIN_ID) {
        addToast('No es posible eliminar al Administrador Principal.', 'error');
        return;
    }
    if (currentUser?.id === id) {
        addToast('No puedes eliminar tu propia cuenta.', 'error');
        return;
    }
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      deleteUser(deleteConfirm.id);
      setDeleteConfirm({ isOpen: false, id: null });
      addToast('Usuario eliminado', 'success');
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-500">Administra el acceso y roles del sistema.</p>
        </div>
        <button 
            onClick={handleCreate}
            className="bg-brand-blue-cyan text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-blue-dark transition-all shadow-lg shadow-brand-blue-cyan/10 flex items-center gap-2"
        >
            <i className="fa-solid fa-user-plus"></i>
            Nuevo Usuario
        </button>
      </div>

      {/* USER LIST */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Usuario</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre / Colaborador</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rol</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {users.map(u => {
                        const linkedCollaborator = u.collaboratorId ? collaborators.find(c => c.id === u.collaboratorId) : null;
                        const isSuperAdmin = u.id === SUPER_ADMIN_ID;

                        return (
                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${u.role === UserRole.ADMIN ? 'bg-purple-600' : 'bg-brand-blue-cyan'} ${isSuperAdmin ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}>
                                        {u.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-700 block">{u.username}</span>
                                        {isSuperAdmin && <span className="text-[9px] text-yellow-600 font-bold bg-yellow-50 px-1 rounded border border-yellow-200">PRINCIPAL</span>}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                <div className="font-bold">{u.name}</div>
                                {linkedCollaborator && (
                                    <div className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                                        <i className="fa-solid fa-link text-[10px]"></i>
                                        {linkedCollaborator.cargo}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                                    u.role === UserRole.ADMIN 
                                    ? 'bg-purple-50 text-purple-700 border-purple-100' 
                                    : 'bg-blue-50 text-blue-700 border-blue-100'
                                }`}>
                                    {u.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => handleEditRequest(u)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-brand-blue-cyan hover:bg-brand-blue-cyan/10 transition-all"
                                        title={isSuperAdmin ? "Requiere Código Maestro" : "Editar"}
                                    >
                                        <i className={`fa-solid ${isSuperAdmin && currentUser?.id !== SUPER_ADMIN_ID ? 'fa-lock' : 'fa-pen-to-square'}`}></i>
                                    </button>
                                    
                                    {currentUser?.id !== u.id && u.id !== SUPER_ADMIN_ID && (
                                        <button 
                                            onClick={() => requestDelete(u.id)}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                            title="Eliminar Usuario"
                                        >
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
      </div>

      {/* MODAL FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900">
                  {editingId ? 'Editar Usuario' : 'Crear Usuario'}
                </h2>
                <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>
              
              <UserForm 
                initialData={selectedUser || undefined}
                existingUsers={users}
                collaborators={collaborators}
                onSubmit={handleSubmit}
                onCancel={() => setIsFormOpen(false)}
                isEditing={!!editingId}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl">
              <i className="fa-solid fa-user-xmark"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar Usuario?</h3>
            <p className="text-sm text-gray-500 mb-6">
              El usuario perderá el acceso al sistema inmediatamente.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm({ isOpen: false, id: null })} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SEGURIDAD (SUPER ADMIN CHALLENGE) */}
      {securityChallenge.isOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/80 backdrop-blur-md p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-yellow-400"></div>
                  <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-500 text-3xl border border-yellow-200 shadow-sm">
                      <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-1">Acceso Restringido</h3>
                  <p className="text-xs text-gray-500 mb-6">
                      El perfil del <strong>Administrador Principal</strong> está protegido. Ingrese el Código Maestro para continuar.
                  </p>
                  
                  <form onSubmit={verifyMasterCode}>
                      <input 
                        type="password" 
                        autoFocus
                        placeholder="Código Maestro"
                        value={masterCodeInput}
                        onChange={(e) => setMasterCodeInput(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-yellow-400 text-center font-bold tracking-widest text-lg mb-4"
                      />
                      <div className="flex gap-3">
                          <button type="button" onClick={() => setSecurityChallenge({isOpen: false, targetUser: null})} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl">Cancelar</button>
                          <button type="submit" className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-xl shadow-lg">Desbloquear</button>
                      </div>
                  </form>
                  <p className="text-[10px] text-gray-300 mt-4 font-mono">CODE: {MASTER_EDIT_CODE}</p>
              </div>
          </div>
      )}

    </div>
  );
};

export default UserManagement;
