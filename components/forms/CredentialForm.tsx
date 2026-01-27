import * as React from 'react';
import { useState } from 'react';
import { Credential, Collaborator } from '../../types';

interface CredentialFormProps {
  initialData?: Partial<Credential>;
  onSubmit: (data: Partial<Credential>) => void;
  onCancel: () => void;
  collaborators: Collaborator[];
}

const CredentialForm: React.FC<CredentialFormProps> = ({ initialData, onSubmit, onCancel, collaborators }) => {
  const defaultData: Partial<Credential> = {
    service: '',
    username: '',
    password: '',
    description: '',
    assignedTo: undefined
  };

  const [formData, setFormData] = useState<Partial<Credential>>(initialData || defaultData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Servicio / Plataforma</label>
        <div className="relative">
          <i className="fa-solid fa-server absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"></i>
          <input 
              required
              type="text" 
              value={formData.service}
              onChange={e => setFormData({...formData, service: e.target.value})}
              className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan transition-all" 
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Usuario / ID</label>
        <div className="relative">
          <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"></i>
          <input 
              required
              type="text" 
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
              className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan transition-all" 
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Contraseña</label>
        <div className="relative group">
          <i className="fa-solid fa-key absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-blue-cyan"></i>
          <input 
            required
            type="text" 
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
            className="w-full pl-9 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan transition-all font-mono" 
            autoComplete="off"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">
              <i className="fa-solid fa-lock"></i>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Asignado A (Opcional)</label>
        <div className="relative">
          <i className="fa-solid fa-user-tag absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"></i>
          <select 
            value={formData.assignedTo || ''}
            onChange={(e) => setFormData({...formData, assignedTo: e.target.value ? Number(e.target.value) : undefined})}
            className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan transition-all appearance-none"
          >
            <option value="">-- Credencial General / Sin Asignar --</option>
            {collaborators.map(c => (
              <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">
              <i className="fa-solid fa-chevron-down"></i>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Notas (Opcional)</label>
        <textarea 
          rows={2}
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan transition-all resize-none" 
        />
      </div>

      <div className="pt-4 flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all">
          Cancelar
        </button>
        <button type="submit" className="flex-1 py-3 bg-brand-blue-cyan hover:bg-brand-blue-dark text-white font-bold rounded-xl shadow-lg shadow-brand-blue-cyan/20 transition-all flex items-center justify-center gap-2">
          <i className="fa-solid fa-save"></i>
          Guardar
        </button>
      </div>
    </form>
  );
};

export default CredentialForm;