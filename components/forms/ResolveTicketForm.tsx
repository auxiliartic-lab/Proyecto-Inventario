import React, { useState } from 'react';
import { Equipment } from '../../types';

interface ResolveTicketFormProps {
  equipment: Equipment;
  onSubmit: (data: { details: string, date: string, specs?: Partial<Equipment>, markAsDelivered: boolean }) => void;
  onCancel: () => void;
}

const ResolveTicketForm: React.FC<ResolveTicketFormProps> = ({ equipment, onSubmit, onCancel }) => {
  const [resolveForm, setResolveForm] = useState({ 
    details: '', 
    date: new Date().toISOString().split('T')[0] 
  });
  
  const [markAsDelivered, setMarkAsDelivered] = useState<boolean>(false);

  // Estado para actualización de hardware
  const [specsForm, setSpecsForm] = useState({
    processor: equipment.processor || '',
    ram: equipment.ram || '',
    storage: equipment.storage || '',
    os: equipment.os || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Detectar cambios en hardware
    const hasHardwareChanges = 
      specsForm.processor !== (equipment.processor || '') ||
      specsForm.ram !== (equipment.ram || '') ||
      specsForm.storage !== (equipment.storage || '') ||
      specsForm.os !== (equipment.os || '');

    onSubmit({
      details: resolveForm.details,
      date: resolveForm.date,
      specs: hasHardwareChanges ? specsForm : undefined,
      markAsDelivered
    });
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
          <p className="text-xs text-blue-800 leading-relaxed">
            <i className="fa-solid fa-circle-info mr-2"></i>
            Al guardar, el ticket se cerrará y el equipo pasará a estado <strong>Activo</strong>. 
            <br/><span className="font-bold ml-5">Nota:</span> El equipo se mantendrá asignado al colaborador actual.
          </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUMNA IZQUIERDA: REPORTE */}
          <div className="space-y-5">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">
              <i className="fa-solid fa-clipboard-check mr-2 text-green-600"></i>
              Reporte de Solución
            </h3>
            
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Detalles de la Reparación</label>
                <textarea 
                    required
                    rows={8}
                    value={resolveForm.details}
                    onChange={(e) => setResolveForm({...resolveForm, details: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 resize-none transition-all text-sm"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Fecha de Resolución</label>
                <input 
                    required
                    type="date"
                    value={resolveForm.date}
                    onChange={(e) => setResolveForm({...resolveForm, date: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-all font-bold text-gray-700"
                />
            </div>

            <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
               <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${markAsDelivered ? 'bg-brand-blue-cyan border-brand-blue-cyan' : 'bg-white border-gray-300 group-hover:border-brand-blue-cyan'}`}>
                      {markAsDelivered && <i className="fa-solid fa-check text-white text-xs"></i>}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={markAsDelivered} 
                    onChange={(e) => setMarkAsDelivered(e.target.checked)} 
                  />
                  <div>
                    <span className="block text-sm font-bold text-gray-900">Entregar equipo al usuario ahora</span>
                    <span className="text-xs text-gray-500">Marcar si el equipo ya está en manos del usuario.</span>
                  </div>
               </label>
            </div>
          </div>

          {/* COLUMNA DERECHA: CAMBIOS DE HARDWARE */}
          <div className="space-y-5">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">
              <i className="fa-solid fa-microchip mr-2 text-brand-blue-cyan"></i>
              Actualización de Hardware
            </h3>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <p className="text-xs text-gray-500 mb-2">Si se realizaron cambios de componentes (Upgrade/Reemplazo), actualice los valores aquí:</p>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Procesador</label>
                  <input 
                    type="text" 
                    value={specsForm.processor}
                    onChange={(e) => setSpecsForm({...specsForm, processor: e.target.value})}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-bold text-gray-700 focus:border-brand-blue-cyan transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Memoria RAM</label>
                  <input 
                    type="text" 
                    value={specsForm.ram}
                    onChange={(e) => setSpecsForm({...specsForm, ram: e.target.value})}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-bold text-gray-700 focus:border-brand-blue-cyan transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Almacenamiento</label>
                  <input 
                    type="text" 
                    value={specsForm.storage}
                    onChange={(e) => setSpecsForm({...specsForm, storage: e.target.value})}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-bold text-gray-700 focus:border-brand-blue-cyan transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Sistema Operativo</label>
                  <input 
                    type="text" 
                    value={specsForm.os}
                    onChange={(e) => setSpecsForm({...specsForm, os: e.target.value})}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-bold text-gray-700 focus:border-brand-blue-cyan transition-colors"
                  />
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex gap-3 mt-4">
        <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all"
        >
          Cancelar
        </button>
        <button 
            type="submit"
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-check-circle"></i>
          Confirmar Solución
        </button>
      </div>
    </form>
  );
};

export default ResolveTicketForm;