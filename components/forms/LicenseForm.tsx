import * as React from 'react';
import { useState } from 'react';
import { SoftwareLicense, Collaborator } from '../../types';

interface LicenseFormProps {
  initialData?: Partial<SoftwareLicense>;
  onSubmit: (data: Partial<SoftwareLicense>) => void;
  onCancel: () => void;
  isEditing: boolean;
  collaborators: Collaborator[];
}

const LicenseForm: React.FC<LicenseFormProps> = ({ initialData, onSubmit, onCancel, isEditing, collaborators }) => {
  const defaultData: Partial<SoftwareLicense> = {
    name: '',
    vendor: '',
    key: '',
    type: 'Suscripción',
    startDate: '',
    expirationDate: '',
    assignedTo: undefined
  };

  const [formData, setFormData] = useState<Partial<SoftwareLicense>>(initialData || defaultData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nombre del Software</label>
        <input 
          required
          type="text" 
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan" 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Proveedor</label>
            <input 
              required
              type="text" 
              value={formData.vendor}
              onChange={e => setFormData({...formData, vendor: e.target.value})}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tipo</label>
            <select 
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan appearance-none" 
            >
              <option value="Suscripción">Suscripción</option>
              <option value="Perpetua">Perpetua</option>
              <option value="Anual">Anual</option>
              <option value="Gratuita">Gratuita/Open Source</option>
            </select>
          </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Clave / Serial</label>
        <input 
          type="text" 
          value={formData.key}
          onChange={e => setFormData({...formData, key: e.target.value})}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan font-mono text-sm" 
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Asignar A (Usuario Final)</label>
        <select 
          value={formData.assignedTo || ''}
          onChange={(e) => setFormData({...formData, assignedTo: e.target.value ? Number(e.target.value) : undefined})}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan appearance-none"
        >
          <option value="">-- Sin Asignar --</option>
          {collaborators.map(c => (
            <option key={c.id} value={c.id}>{c.firstName} {c.lastName} | {c.cargo}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Fecha Inicio</label>
          <input 
            required
            type="date" 
            value={formData.startDate}
            onChange={e => setFormData({...formData, startDate: e.target.value})}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Fecha Expiración</label>
          <input 
            required
            type="date" 
            value={formData.expirationDate}
            onChange={e => setFormData({...formData, expirationDate: e.target.value})}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan" 
          />
        </div>
      </div>

      <div className="pt-4 flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all">
          Cancelar
        </button>
        <button type="submit" className="flex-1 py-3 bg-brand-blue-cyan hover:bg-brand-blue-dark text-white font-bold rounded-xl shadow-lg shadow-brand-blue-cyan/20 transition-all">
          {isEditing ? 'Guardar Cambios' : 'Registrar'}
        </button>
      </div>
    </form>
  );
};

export default LicenseForm;