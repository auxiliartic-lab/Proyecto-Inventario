
import React, { useState } from 'react';
import { User, UserRole, Collaborator } from '../../types';

interface UserFormProps {
  initialData?: Partial<User>;
  existingUsers: User[];
  collaborators: Collaborator[];
  onSubmit: (data: Partial<User>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ initialData, existingUsers, collaborators, onSubmit, onCancel, isEditing }) => {
  const defaultData: Partial<User> = {
    username: '',
    name: '',
    role: UserRole.CONSULTANT,
    pin: '',
    collaboratorId: undefined
  };

  const [formData, setFormData] = useState<Partial<User>>(initialData || defaultData);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validar username único
    if (!isEditing || (initialData && initialData.username !== formData.username)) {
       const duplicate = existingUsers.find(u => u.username.toLowerCase() === formData.username?.toLowerCase());
       if (duplicate) {
           setError('El nombre de usuario ya existe.');
           return;
       }
    }

    if (!formData.username || !formData.name || !formData.pin) {
        setError('Todos los campos son obligatorios.');
        return;
    }

    // Si se selecciona un colaborador, actualizar el nombre del usuario para que coincida (Opcional, pero buena práctica)
    const finalData = { ...formData };
    if (finalData.collaboratorId) {
        const collab = collaborators.find(c => c.id === finalData.collaboratorId);
        if (collab && !isEditing) {
            // Solo sugerir nombre al crear, no sobrescribir al editar si el usuario ya lo personalizó
            finalData.name = `${collab.firstName} ${collab.lastName}`;
        }
    }

    onSubmit(finalData);
  };

  // Filtrar colaboradores que YA tienen usuario asignado (para evitar duplicados 1-a-1), 
  // EXCEPTO el que ya está asignado a este usuario actual.
  const availableCollaborators = collaborators.filter(c => {
      const isLinkedToOtherUser = existingUsers.some(u => u.collaboratorId === c.id && u.id !== initialData?.id);
      return !isLinkedToOtherUser && c.isActive;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
        </div>
      )}

      {/* SECCIÓN VINCULACIÓN */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <label className="block text-[10px] font-black text-blue-800 uppercase tracking-widest mb-2 flex items-center gap-2">
             <i className="fa-solid fa-link"></i> Vincular con Colaborador (TI / Staff)
          </label>
          <select
            value={formData.collaboratorId || ''}
            onChange={e => setFormData({...formData, collaboratorId: e.target.value ? Number(e.target.value) : undefined})}
            className="w-full p-2.5 bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue-cyan text-sm font-bold text-gray-700"
          >
            <option value="">-- Sin vinculación (Usuario Genérico) --</option>
            {availableCollaborators.map(c => (
                <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.cargo})
                </option>
            ))}
          </select>
          <p className="text-[10px] text-blue-600 mt-2 leading-tight">
             Al vincular, este usuario se asociará a la hoja de vida del colaborador, permitiendo ver sus equipos asignados y reportes.
          </p>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nombre para Mostrar</label>
        <input 
          required
          type="text" 
          placeholder="Ej: Juan Pérez"
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan" 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Usuario (Login)</label>
            <input 
              required
              type="text" 
              placeholder="Ej: jperez"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value.trim()})}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan font-bold" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Rol</label>
            <select
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan appearance-none font-medium"
            >
              <option value={UserRole.CONSULTANT}>Consultor (Solo Lectura)</option>
              <option value={UserRole.ADMIN}>Administrador (Control Total)</option>
            </select>
          </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            {isEditing ? 'Nueva Contraseña / PIN' : 'Contraseña / PIN'}
        </label>
        <div className="relative">
            <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"></i>
            <input 
                required={!isEditing} // Solo requerido al crear
                type="text" 
                placeholder={isEditing ? "Dejar en blanco para mantener actual" : "PIN o Contraseña"}
                value={formData.pin}
                onChange={e => setFormData({...formData, pin: e.target.value})}
                className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan font-mono tracking-widest" 
            />
        </div>
        {isEditing && <p className="text-[10px] text-gray-400 mt-1 italic">Solo escriba si desea cambiar la contraseña actual.</p>}
      </div>

      <div className="pt-4 flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all">
          Cancelar
        </button>
        <button type="submit" className="flex-1 py-3 bg-brand-blue-cyan hover:bg-brand-blue-dark text-white font-bold rounded-xl shadow-lg shadow-brand-blue-cyan/20 transition-all">
          {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
