
import React, { useState } from 'react';
import { Company, MaintenanceRecord, Equipment } from '../types';
import { useInventory } from '../context/InventoryContext';

interface MaintenanceManagerProps {
  company: Company;
}

const MaintenanceManager: React.FC<MaintenanceManagerProps> = ({ company }) => {
  const { data } = useInventory();
  const records = (data.maintenance || []).filter(m => m.companyId === company.id);
  
  const [filterType, setFilterType] = useState<string>('Todos');
  
  // Estado para el modal de detalles
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Helper para obtener datos del equipo usando el contexto
  const getEquipmentInfo = (equipId: number) => {
    return data.equipment.find(e => e.id === equipId);
  };

  // Abrir modal de detalles
  const handleViewDetails = (equipId: number) => {
    const equip = getEquipmentInfo(equipId);
    if (equip) {
      setSelectedEquipment(equip);
      setIsModalOpen(true);
    }
  };

  // Filtrado
  const filteredRecords = records.filter(rec => {
    if (filterType === 'Todos') return true;
    const equip = getEquipmentInfo(rec.equipmentId);
    return equip?.type === filterType;
  });

  const getEquipmentTypes = () => {
    const types = new Set<string>();
    records.forEach(rec => {
      const equip = getEquipmentInfo(rec.equipmentId);
      if (equip) types.add(equip.type);
    });
    return ['Todos', ...Array.from(types)];
  };

  const getSeverityStyles = (severity: MaintenanceRecord['severity']) => {
    switch (severity) {
      case 'Moderate':
        return {
          card: 'border-l-4 border-brand-yellow bg-white',
          badge: 'bg-brand-yellow/10 text-yellow-700',
          icon: 'fa-triangle-exclamation text-brand-yellow'
        };
      case 'Severe':
        return {
          card: 'border-l-4 border-red-500 bg-white',
          badge: 'bg-red-50 text-red-700',
          icon: 'fa-temperature-arrow-up text-red-500'
        };
      case 'TotalLoss':
        return {
          card: 'border-l-4 border-gray-900 bg-gray-900 text-white',
          badge: 'bg-white/20 text-white',
          icon: 'fa-skull text-white'
        };
      default:
        return { card: '', badge: '', icon: '' };
    }
  };

  // Helper seguro para renderizar nombre de colaborador
  const renderAssignedName = (assignedTo?: number) => {
    if (!assignedTo) return '-- Sin Asignar --';
    const collaborator = data.collaborators.find(c => c.id === assignedTo);
    if (!collaborator) return 'Colaborador no encontrado';
    return `${collaborator.firstName} ${collaborator.lastName}`;
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Mantenimiento</h1>
          <p className="text-gray-500">Seguimiento de incidencias y reparaciones activas.</p>
        </div>
        
        {/* Filtro por Tipo */}
        <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <span className="pl-3 text-xs font-bold text-gray-400 uppercase">Filtrar:</span>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-2 text-sm font-bold text-gray-700 bg-transparent border-none outline-none cursor-pointer"
          >
            {getEquipmentTypes().map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRecords.map((record) => {
          const equip = getEquipmentInfo(record.equipmentId);
          const styles = getSeverityStyles(record.severity);
          const isDark = record.severity === 'TotalLoss';

          return (
            <div key={record.id} className={`rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group ${styles.card}`}>
               <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-gray-50'}`}>
                    <i className={`fa-solid ${styles.icon}`}></i>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${styles.badge}`}>
                    {record.severity === 'TotalLoss' ? 'Pérdida Total' : record.severity === 'Severe' ? 'Severo' : 'Moderado'}
                  </span>
               </div>

               <h3 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{record.title}</h3>
               <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{record.description}</p>

               <div className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-white/10' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                     <i className={`fa-solid fa-laptop ${isDark ? 'text-gray-400' : 'text-gray-400'}`}></i>
                     <div>
                        <p className={`text-xs font-bold uppercase ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Equipo Afectado</p>
                        <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {equip ? `${equip.brand} ${equip.model}` : 'Equipo Desconocido'}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Serie: {equip?.serialNumber}</p>
                     </div>
                  </div>
               </div>

               <div className={`flex justify-between items-center text-xs border-t pt-4 ${isDark ? 'border-white/10 text-gray-400' : 'border-gray-100 text-gray-500'}`}>
                  <p>Reportado: {record.date}</p>
                  <button 
                    onClick={() => handleViewDetails(record.equipmentId)}
                    className={`font-bold hover:underline ${isDark ? 'text-brand-blue-cyan' : 'text-brand-blue-cyan'}`}
                  >
                    Ver Detalles
                  </button>
               </div>
            </div>
          );
        })}

        {filteredRecords.length === 0 && (
          <div className="col-span-full py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
             <i className="fa-solid fa-check-circle text-5xl mb-4 text-green-200"></i>
             <p className="font-bold">Todo operando correctamente</p>
             <p className="text-sm">No hay mantenimientos activos bajo este filtro.</p>
          </div>
        )}
      </div>

      {/* MODAL DETALLES DE EQUIPO (SOLO LECTURA) */}
      {isModalOpen && selectedEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Detalles del Activo</h2>
                  <p className="text-sm text-gray-500 font-medium">Información técnica en modo de solo lectura.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>
              
              <div className="space-y-6 opacity-90 pointer-events-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Tipo de Equipo</label>
                    <input 
                      type="text" 
                      readOnly
                      value={selectedEquipment.type}
                      className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl outline-none font-bold text-sm text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Número de Serie</label>
                    <input 
                      type="text" 
                      readOnly
                      value={selectedEquipment.serialNumber}
                      className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl outline-none font-bold text-sm text-gray-600" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Marca</label>
                    <input 
                      type="text" 
                      readOnly
                      value={selectedEquipment.brand}
                      className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl outline-none font-bold text-sm text-gray-600" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Modelo</label>
                    <input 
                      type="text" 
                      readOnly
                      value={selectedEquipment.model}
                      className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl outline-none font-bold text-sm text-gray-600" 
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                    <i className="fa-solid fa-microchip text-brand-blue-cyan"></i>
                    Características Técnicas
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5">Procesador</label>
                      <input 
                        type="text" 
                        readOnly
                        value={selectedEquipment.processor || '-'}
                        className="w-full p-2.5 bg-gray-100 border border-slate-200 rounded-lg outline-none text-xs font-bold text-gray-600" 
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5">Memoria RAM</label>
                      <input 
                        type="text" 
                        readOnly
                        value={selectedEquipment.ram || '-'}
                        className="w-full p-2.5 bg-gray-100 border border-slate-200 rounded-lg outline-none text-xs font-bold text-gray-600" 
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5">Almacenamiento</label>
                      <input 
                        type="text" 
                        readOnly
                        value={selectedEquipment.storage || '-'}
                        className="w-full p-2.5 bg-gray-100 border border-slate-200 rounded-lg outline-none text-xs font-bold text-gray-600" 
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5">Sist. Operativo</label>
                      <input 
                        type="text" 
                        readOnly
                        value={selectedEquipment.os || '-'}
                        className="w-full p-2.5 bg-gray-100 border border-slate-200 rounded-lg outline-none text-xs font-bold text-gray-600" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Estado</label>
                    <div className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl font-bold text-sm text-gray-600">
                      {selectedEquipment.status}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Asignado a Colaborador</label>
                    <div className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl font-bold text-sm text-gray-600">
                       {/* Uso del helper seguro */}
                       {renderAssignedName(selectedEquipment.assignedTo)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="py-3 px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black text-xs uppercase tracking-widest rounded-xl transition-all"
                  >
                    Cerrar
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceManager;
