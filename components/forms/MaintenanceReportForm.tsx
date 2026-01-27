import React, { useState } from 'react';
import { MaintenanceSeverity } from '../../types';

interface MaintenanceReportFormProps {
  onSubmit: (data: { title: string, description: string, severity: MaintenanceSeverity, date: string }) => void;
  onCancel: () => void;
}

const MaintenanceReportForm: React.FC<MaintenanceReportFormProps> = ({ onSubmit, onCancel }) => {
  const [maintenanceData, setMaintenanceData] = useState({
    title: '',
    description: '',
    severity: 'Moderate' as MaintenanceSeverity,
    date: new Date().toISOString().split('T')[0] // Default a hoy
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(maintenanceData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Problema (Título)</label>
            <input 
            required
            type="text" 
            value={maintenanceData.title}
            onChange={e => setMaintenanceData({...maintenanceData, title: e.target.value})}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-yellow" 
            />
        </div>
        <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Fecha del Incidente</label>
            <input 
            required
            type="date" 
            value={maintenanceData.date}
            onChange={e => setMaintenanceData({...maintenanceData, date: e.target.value})}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-yellow font-bold text-gray-700" 
            />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nivel de Severidad</label>
        <div className="grid grid-cols-3 gap-3">
           {(['Moderate', 'Severe', 'TotalLoss'] as const).map((sev) => (
             <button
               key={sev}
               type="button"
               onClick={() => setMaintenanceData({...maintenanceData, severity: sev})}
               className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider border-2 transition-all ${
                 maintenanceData.severity === sev
                   ? sev === 'Moderate' ? 'bg-yellow-50 border-yellow-400 text-yellow-700'
                   : sev === 'Severe' ? 'bg-red-50 border-red-500 text-red-700'
                   : 'bg-gray-800 border-gray-800 text-white'
                   : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
               }`}
             >
               {sev === 'Moderate' ? 'Moderado' : sev === 'Severe' ? 'Grave' : 'Pérdida Total'}
             </button>
           ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Descripción Detallada</label>
        <textarea 
          required
          rows={4}
          value={maintenanceData.description}
          onChange={e => setMaintenanceData({...maintenanceData, description: e.target.value})}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-yellow resize-none" 
        />
      </div>

      <div className="pt-4 flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all">
          Cancelar
        </button>
        <button type="submit" className="flex-1 py-3 bg-brand-yellow text-white font-bold rounded-xl shadow-lg shadow-yellow-500/20 hover:bg-yellow-500 transition-all">
          Reportar Falla
        </button>
      </div>
    </form>
  );
};

export default MaintenanceReportForm;