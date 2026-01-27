import React, { useState } from 'react';
import { Collaborator } from '../../types';

// Lista de cargos ordenada alfabéticamente con Nombres Completos
const JOB_TITLES = [
  { label: 'Analista Contable', value: 'Analista Contable' },
  { label: 'Asistente Ejecutiva', value: 'Asistente Ejecutiva' },
  { label: 'Auxiliar Administrativo', value: 'Auxiliar Administrativo' },
  { label: 'Coordinador de Compras y Almacén', value: 'Coordinador de Compras y Almacén' },
  { label: 'Coordinador de Seguridad e Higiene y Ambiental', value: 'Coordinador de Seguridad e Higiene y Ambiental' },
  { label: 'Gerente Desarrollo de Nuevos Negocios', value: 'Gerente Desarrollo de Nuevos Negocios' },
  { label: 'Gerente General de Recursos Humanos', value: 'Gerente General de Recursos Humanos' },
  { label: 'Gerente de Planta', value: 'Gerente de planta' },
  { label: 'Instrumentista', value: 'Instrumentista' },
  { label: 'Jefe de Calidad', value: 'Jefe de Calidad' },
  { label: 'Jefe de Compras y Almacén', value: 'Jefe de Compras y Almacén' },
  { label: 'Jefe de Despachos', value: 'Jefe de Despachos' },
  { label: 'Jefe de Mantenimiento', value: 'Jefe de Mantenimiento' },
  { label: 'Planeador de Mantenimiento', value: 'Planeador de Mantenimiento' }
];

interface CollaboratorFormProps {
  initialData?: Partial<Collaborator>;
  onSubmit: (data: Partial<Collaborator>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const CollaboratorForm: React.FC<CollaboratorFormProps> = ({ initialData, onSubmit, onCancel, isEditing }) => {
  const defaultData: Partial<Collaborator> = {
    firstName: '',
    lastName: '',
    email: '',
    cargo: '',
    area: '',
    sex: 'Male',
    isActive: true
  };

  const [formData, setFormData] = useState<Partial<Collaborator>>(initialData || defaultData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
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
          />
        </div>
      </div>

      <div className="pt-6 flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all">
          Cancelar
        </button>
        <button type="submit" className="flex-1 py-3 bg-brand-blue-cyan hover:bg-brand-blue-dark text-white font-bold rounded-xl shadow-lg shadow-brand-blue-cyan/20 transition-all">
          {isEditing ? 'Guardar Cambios' : 'Crear Registro'}
        </button>
      </div>
    </form>
  );
};

export default CollaboratorForm;