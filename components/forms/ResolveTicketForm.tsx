
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
    
    // Detectar cambios en hardware solo si NO es periférico
    const isPeripheral = equipment.type === 'Periférico';
    let hasHardwareChanges = false;

    if (!isPeripheral) {
        hasHardwareChanges = 
        specsForm.processor !== (equipment.processor || '') ||
        specsForm.ram !== (equipment.ram || '') ||
        specsForm.storage !== (equipment.storage || '') ||
        specsForm.os !== (equipment.os || '');
    }

    onSubmit({
      details: resolveForm.details,
      date: resolveForm.date,
      specs: hasHardwareChanges ? specsForm : undefined,
      markAsDelivered
    });
  };

  const isPeripheral = equipment.type === 'Periférico';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white">
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-1 custom-scrollbar space-y-6 pb-4 p-2">
        
        {/* Aviso Informativo */}
        <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
               <i className="fa-solid fa-clipboard-check"></i>
            </div>
            <div className="text-xs text-blue-900">
              <p className="font-bold">Cierre de Ticket</p>
              <p className="opacity-80">El equipo <strong>{equipment.brand} {equipment.model}</strong> volverá a estado <span className="font-bold text-green-600">ACTIVO</span>.</p>
            </div>
        </div>

        {/* Sección 1: Detalles de la Solución */}
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Diagnóstico y Solución</label>
                <textarea 
                    required
                    rows={4}
                    placeholder="Describa el procedimiento realizado, repuestos cambiados, pruebas efectuadas..."
                    value={resolveForm.details}
                    onChange={(e) => setResolveForm({...resolveForm, details: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan focus:bg-white transition-all text-sm resize-none shadow-sm"
                />
            </div>

            <div className="flex items-center gap-4">
               <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Fecha Cierre</label>
                  <input 
                      required
                      type="date"
                      value={resolveForm.date}
                      onChange={(e) => setResolveForm({...resolveForm, date: e.target.value})}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan transition-all font-bold text-gray-700"
                  />
               </div>
               {/* Checkbox de Entrega Estilizado */}
               <div className="flex-1 pt-6">
                 <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${markAsDelivered ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${markAsDelivered ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}>
                        {markAsDelivered && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={markAsDelivered} 
                      onChange={(e) => setMarkAsDelivered(e.target.checked)} 
                    />
                    <span className={`text-xs font-bold ${markAsDelivered ? 'text-green-700' : 'text-gray-600'}`}>Entregar Inmediatamente</span>
                 </label>
               </div>
            </div>
        </div>

        {/* Sección 2: Hardware (Condicional) - Diseño Tarjeta */}
        {!isPeripheral && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 relative mt-2">
                <div className="absolute -top-3 left-4 bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-slate-300">
                    <i className="fa-solid fa-screwdriver-wrench mr-1"></i> Actualización Hardware
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Procesador</label>
                      <input 
                          type="text" 
                          value={specsForm.processor}
                          onChange={(e) => setSpecsForm({...specsForm, processor: e.target.value})}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-bold focus:border-brand-blue-cyan transition-colors"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Memoria RAM</label>
                      <input 
                          type="text" 
                          value={specsForm.ram}
                          onChange={(e) => setSpecsForm({...specsForm, ram: e.target.value})}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-bold focus:border-brand-blue-cyan transition-colors"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Almacenamiento</label>
                      <input 
                          type="text" 
                          value={specsForm.storage}
                          onChange={(e) => setSpecsForm({...specsForm, storage: e.target.value})}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-bold focus:border-brand-blue-cyan transition-colors"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sistema Operativo</label>
                      <input 
                          type="text" 
                          value={specsForm.os}
                          onChange={(e) => setSpecsForm({...specsForm, os: e.target.value})}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-bold focus:border-brand-blue-cyan transition-colors"
                      />
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="pt-4 mt-2 border-t border-gray-100 flex gap-3 bg-white shrink-0">
        <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all text-xs uppercase tracking-widest"
        >
          Cancelar
        </button>
        <button 
            type="submit"
            className="flex-1 py-3.5 bg-brand-blue-cyan hover:bg-brand-blue-dark text-white font-bold rounded-xl shadow-lg shadow-brand-blue-cyan/20 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
        >
          <i className="fa-solid fa-circle-check"></i>
          Confirmar Solución
        </button>
      </div>
    </form>
  );
};

export default ResolveTicketForm;
