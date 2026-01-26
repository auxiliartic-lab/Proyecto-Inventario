
import React, { useState } from 'react';
import { Collaborator } from '../../types';

// Lista de cargos ordenada alfabéticamente
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
