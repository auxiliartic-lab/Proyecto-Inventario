
import React, { useState } from 'react';
import { MaintenanceSeverity } from '../../types';

interface MaintenanceReportFormProps {
  onSubmit: (data: { title: string, description: string, severity: MaintenanceSeverity }) => void;
  onCancel: () => void;
}

const MaintenanceReportForm: React.FC<MaintenanceReportFormProps> = ({ onSubmit, onCancel }) => {
  const [maintenanceData, setMaintenanceData] = useState({
    title: '',
    description: '',
    severity: 'Moderate' as MaintenanceSeverity
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(maintenanceData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Problema (Título)</label>
        <input 
          required
          type="text" 
          value={maintenanceData.title}
          onChange={e => setMaintenanceData({...maintenanceData, title: e.target.value})}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-yellow" 
          placeholder="Ej: Pantalla rota, No enciende..."
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Descripción Detallada</label>
        <textarea 
          required
          value={maintenanceData.description}
          onChange={e => setMaintenanceData({...maintenanceData, description: e.target.value})}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-yellow h-24 resize-none" 
          placeholder="Describa cómo ocurrió la falla..."
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Gravedad del Daño</label>
        <div className="grid grid-cols-1 gap-3">
          <label className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-4 transition-all ${maintenanceData.severity === 'Moderate' ? 'border-brand-yellow bg-brand-yellow/5' : 'border-gray-100 hover:bg-gray-50'}`}>
              <input 
                type="radio" 
                name="severity" 
                value="Moderate" 
                checked={maintenanceData.severity === 'Moderate'}
                onChange={() => setMaintenanceData({...maintenanceData, severity: 'Moderate'})}
                className="hidden" 
              />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${maintenanceData.severity === 'Moderate' ? 'bg-brand-yellow text-white' : 'bg-gray-200 text-gray-400'}`}>
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <p className="font-bold text-gray-900">Moderado</p>
                <p className="text-xs text-gray-500">Mantenimiento preventivo o fallas leves.</p>
              </div>
          </label>
          <label className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-4 transition-all ${maintenanceData.severity === 'Severe' ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:bg-gray-50'}`}>
              <input 
                type="radio" 
                name="severity" 
                value="Severe" 
                checked={maintenanceData.severity === 'Severe'}
                onChange={() => setMaintenanceData({...maintenanceData, severity: 'Severe'})}
                className="hidden" 
              />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${maintenanceData.severity === 'Severe' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                <i className="fa-solid fa-temperature-arrow-up"></i>
              </div>
              <div>
                <p className="font-bold text-gray-900">Severo</p>
                <p className="text-xs text-gray-500">El equipo no funciona o riesgo de seguridad.</p>
              </div>
          </label>
          <label className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-4 transition-all ${maintenanceData.severity === 'TotalLoss' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-100 hover:bg-gray-50'}`}>
              <input 
                type="radio" 
                name="severity" 
                value="TotalLoss" 
                checked={maintenanceData.severity === 'TotalLoss'}
                onChange={() => setMaintenanceData({...maintenanceData, severity: 'TotalLoss'})}
                className="hidden" 
              />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${maintenanceData.severity === 'TotalLoss' ? 'bg-white text-gray-900' : 'bg-gray-200 text-gray-400'}`}>
                <i className="fa-solid fa-skull"></i>
              </div>
              <div>
                <p className={`font-bold ${maintenanceData.severity === 'TotalLoss' ? 'text-white' : 'text-gray-900'}`}>Pérdida Total</p>
                <p className={`text-xs ${maintenanceData.severity === 'TotalLoss' ? 'text-gray-400' : 'text-gray-500'}`}>Equipo irrecuperable. Se dará de baja.</p>
              </div>
          </label>
        </div>
      </div>

      <div className="pt-2 flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all">
          Cancelar
        </button>
        <button type="submit" className="flex-1 py-3 bg-brand-blue-cyan hover:bg-brand-blue-dark text-white font-bold rounded-xl shadow-lg shadow-brand-blue-cyan/20 transition-all">
          Enviar Reporte
        </button>
      </div>
    </form>
  );
};

export default MaintenanceReportForm;
