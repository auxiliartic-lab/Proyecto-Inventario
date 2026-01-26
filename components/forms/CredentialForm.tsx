
import React, { useState } from 'react';
import { Credential } from '../../types';

interface CredentialFormProps {
  initialData?: Partial<Credential>;
  onSubmit: (data: Partial<Credential>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const CredentialForm: React.FC<CredentialFormProps> = ({ initialData, onSubmit, onCancel, isEditing }) => {
  const defaultData: Partial<Credential> = {
    service: '',
    username: '',
    password: '',
    description: ''
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
        <button type="button" onClick={onCancel} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all">
          Cancelar
        </button>
        <button type="submit" className="flex-1 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg shadow-gray-900/20 transition-all">
          {isEditing ? 'Actualizar' : 'Guardar Seguro'}
        </button>
      </div>
    </form>
  );
};

export default CredentialForm;
