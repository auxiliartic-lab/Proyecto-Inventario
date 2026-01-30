
import * as React from 'react';
import { useState, useEffect } from 'react';
import { SoftwareLicense, Collaborator, Equipment } from '../../types';

interface LicenseFormProps {
  initialData?: Partial<SoftwareLicense>;
  existingLicenses: SoftwareLicense[]; 
  onSubmit: (data: Partial<SoftwareLicense>) => void;
  onCancel: () => void;
  isEditing: boolean;
  collaborators: Collaborator[];
  equipmentList: Equipment[];
}

const SOFTWARE_SUGGESTIONS = [
  'Microsoft Office 2016 Home & Business',
  'Microsoft Office 2019 Professional',
  'Microsoft Office 2021 LTSC',
  'Microsoft 365 Business Standard',
  'Microsoft 365 Apps for Enterprise',
  'Windows 10 Pro License',
  'Windows 11 Pro License',
  'Antivirus ESET Endpoint Security',
  'Antivirus Kaspersky Small Office',
  'Antivirus Bitdefender GravityZone',
  'Antivirus McAfee Enterprise',
  'Adobe Creative Cloud All Apps',
  'Adobe Acrobat Pro DC',
  'AutoCAD LT 2024',
  'Zoom Pro',
  'Slack Business',
  'WinRAR Corporate',
  'TeamViewer Tensor'
];

const LicenseForm: React.FC<LicenseFormProps> = ({ 
  initialData, 
  existingLicenses,
  onSubmit, 
  onCancel, 
  isEditing, 
  collaborators
}) => {
  const defaultData: Partial<SoftwareLicense> = {
    name: '',
    vendor: '',
    key: '',
    type: 'Suscripción',
    startDate: '',
    expirationDate: '',
    totalSlots: 1,
    assignedTo: [],
    assignedToEquipment: []
  };

  const [formData, setFormData] = useState<Partial<SoftwareLicense>>(initialData || defaultData);
  
  // Si initialData.assignedTo era undefined/null, asegurar que es array
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        assignedTo: prev.assignedTo || [],
        assignedToEquipment: prev.assignedToEquipment || [],
        totalSlots: prev.totalSlots || 1
      }));
    }
  }, [initialData]);

  const [error, setError] = useState<string | null>(null);

  // Helper para contar total de asignaciones (SOLO USUARIOS en este form)
  const usersAssignedCount = formData.assignedTo?.length || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación: Clave (Key) Única
    if (formData.key && formData.key !== 'N/A' && formData.key !== '') {
        const duplicate = existingLicenses.find(l => 
            l.key === formData.key && 
            l.id !== formData.id // Ignorar si se está editando la misma licencia
        );

        if (duplicate) {
            setError(`La clave de licencia "${formData.key}" ya está registrada.`);
            return;
        }
    }

    // Validación de cupos (Solo Usuarios, ya que cupos equipos son independientes)
    if (usersAssignedCount > (formData.totalSlots || 1)) {
        setError(`No puede asignar más usuarios que la cantidad de cupos disponibles (${formData.totalSlots}).`);
        return;
    }

    // Enviar datos
    onSubmit(formData);
  };

  // Handlers para agregar/quitar asignaciones (SOLO PERSONAS)
  const addAssignment = (idStr: string) => {
    if (!idStr) return;
    const id = Number(idStr);
    
    // Verificar cupos totales
    if (usersAssignedCount >= (formData.totalSlots || 1)) {
       setError("No hay cupos de usuarios disponibles. Aumente el total de cupos.");
       return;
    }

    if (!formData.assignedTo?.includes(id)) {
        setFormData({...formData, assignedTo: [...(formData.assignedTo || []), id]});
        setError(null);
    }
  };

  const removeAssignment = (id: number) => {
     setFormData({...formData, assignedTo: (formData.assignedTo || []).filter(aid => aid !== id)});
  };

  // Limpiar error al cambiar la key
  useEffect(() => {
    if (error) setError(null);
  }, [formData.key, formData.totalSlots]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* DATALIST SUGGESTIONS */}
      <datalist id="softwareSuggestions">
        {SOFTWARE_SUGGESTIONS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-1">
            <i className="fa-solid fa-circle-exclamation text-lg"></i>
            {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nombre del Software</label>
        <input 
          required
          type="text" 
          list="softwareSuggestions"
          placeholder="Ej: Office 2019, Antivirus..."
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

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Clave / Serial</label>
            <input 
            type="text" 
            value={formData.key}
            onChange={e => setFormData({...formData, key: e.target.value})}
            className={`w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 font-mono text-sm ${error ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:ring-brand-blue-cyan'}`}
            />
        </div>
        <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Cupos Totales</label>
            <input 
            required
            type="number"
            min="1"
            value={formData.totalSlots}
            onChange={e => setFormData({...formData, totalSlots: parseInt(e.target.value) || 1})}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan font-bold text-center" 
            title="Cupos disponibles independientemente para Usuarios y Equipos"
            />
        </div>
      </div>

      {/* SECCIÓN DE ASIGNACIÓN (SOLO COLABORADORES) */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
         <div className="flex gap-4 mb-4 border-b border-gray-200 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
               <i className="fa-solid fa-user"></i> Asignar Colaboradores
            </h4>
            <span className="text-[10px] text-gray-400 font-bold bg-white px-2 py-1 rounded border border-gray-200">
                Ocupado: {usersAssignedCount} / {formData.totalSlots}
            </span>
         </div>

         {/* Aviso sobre Equipos */}
         <div className="mb-3 bg-blue-50 border border-blue-100 p-2 rounded text-[10px] text-blue-700 flex gap-2 items-center">
            <i className="fa-solid fa-info-circle"></i>
            <span>Para asignar licencias a <b>Equipos</b>, hágalo desde el módulo de <b>Equipos</b>.</span>
         </div>

         {/* Selector de Asignación */}
         <div className="mb-3">
            <div className="relative">
                <i className="fa-solid fa-user-plus absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <select 
                    value=""
                    onChange={(e) => addAssignment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-blue-cyan appearance-none text-sm font-bold text-gray-600"
                >
                    <option value="">Seleccionar colaborador...</option>
                    {collaborators
                        .filter(c => c.isActive) // Solo activos pueden asignarse
                        .filter(c => !(formData.assignedTo || []).includes(c.id))
                        .map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} | {c.cargo}</option>)
                    }
                </select>
            </div>
         </div>

         {/* Lista de Chips/Tags */}
         <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
             {/* Personas Asignadas */}
             {(formData.assignedTo || []).map(id => {
                 const c = collaborators.find(col => col.id === id);
                 if (!c) return null;
                 return (
                     <div key={`p-${id}`} className="bg-white border border-gray-200 rounded-full pl-3 pr-1 py-1 flex items-center gap-2 shadow-sm animate-in zoom-in-95 duration-200">
                         <div className="w-5 h-5 bg-brand-blue-cyan/10 text-brand-blue-cyan rounded-full flex items-center justify-center text-[10px] font-bold">
                             {c.firstName[0]}{c.lastName[0]}
                         </div>
                         <span className="text-xs font-bold text-gray-700">{c.firstName} {c.lastName}</span>
                         <button type="button" onClick={() => removeAssignment(id)} className="w-5 h-5 rounded-full hover:bg-red-50 hover:text-red-500 text-gray-400 flex items-center justify-center transition-colors">
                             <i className="fa-solid fa-times text-[10px]"></i>
                         </button>
                     </div>
                 );
             })}

             {/* Equipos Asignados (Solo lectura) */}
             {(formData.assignedToEquipment || []).map(id => {
                 return (
                    <div key={`e-${id}`} className="bg-gray-100 border border-gray-300 rounded-full pl-3 pr-3 py-1 flex items-center gap-2 opacity-70 cursor-not-allowed" title="Gestione equipos desde el módulo Equipos">
                        <i className="fa-solid fa-laptop text-gray-500 text-xs"></i>
                        <span className="text-xs font-bold text-gray-500">Equipo #{id} (Vinculado)</span>
                    </div>
                 );
             })}

             {usersAssignedCount === 0 && (
                 <span className="text-xs text-gray-400 italic w-full text-center py-2">No hay asignaciones.</span>
             )}
         </div>
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
