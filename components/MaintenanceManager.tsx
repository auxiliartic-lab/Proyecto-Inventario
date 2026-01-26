
import React, { useState } from 'react';
import { Company, MaintenanceRecord, Equipment } from '../types';
import { useInventory } from '../context/InventoryContext';
import ResolveTicketForm from './forms/ResolveTicketForm';

interface MaintenanceManagerProps {
  company: Company;
}

const MaintenanceManager: React.FC<MaintenanceManagerProps> = ({ company }) => {
  const { data, resolveTicket, toggleMaintenanceDelivery } = useInventory();
  const records = (data.maintenance || []).filter(m => m.companyId === company.id);
  
  const [filterType, setFilterType] = useState<string>('Todos');
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
  
  // Estado para el modal de detalles (Solo lectura)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Estado para el modal de RESOLUCIÓN (Cierre de ticket)
  const [isResolveModalOpen, setIsResolveModalOpen] = useState<boolean>(false);
  const [ticketToResolve, setTicketToResolve] = useState<MaintenanceRecord | null>(null);

  // Helper para obtener datos del equipo usando el contexto
  const getEquipmentInfo = (equipId: number) => {
    return data.equipment.find(e => e.id === equipId);
  };

  // Abrir modal de detalles del equipo
  const handleViewDetails = (equipId: number) => {
    const equip = getEquipmentInfo(equipId);
    if (equip) {
      setSelectedEquipment(equip);
      setIsDetailsModalOpen(true);
    }
  };

  // Abrir modal de resolución
  const handleOpenResolve = (record: MaintenanceRecord) => {
    setTicketToResolve(record);
    setIsResolveModalOpen(true);
  };

  const handleResolveSubmit = (data: { details: string, date: string, specs?: Partial<Equipment>, markAsDelivered: boolean }) => {
    if (ticketToResolve) {
      resolveTicket(ticketToResolve.id, data.details, data.date, data.specs, data.markAsDelivered);
      setIsResolveModalOpen(false);
      setTicketToResolve(null);
    }
  };

  // Filtrado
  const filteredRecords = records.filter(rec => {
    // Filtro por Estado (Tab)
    const statusMatch = activeTab === 'open' ? rec.status === 'Open' : rec.status === 'Closed';
    if (!statusMatch) return false;

    // Filtro por Tipo Equipo
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
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Mantenimiento</h1>
          <p className="text-gray-500">Seguimiento de incidencias, reparaciones y arreglos.</p>
        </div>
        
        <div className="flex gap-4">
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
      </div>

      {/* TABS DE ESTADO */}
      <div className="flex p-1 bg-gray-200/50 rounded-xl mb-6 w-fit">
         <button 
           onClick={() => setActiveTab('open')}
           className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'open' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
         >
           <i className="fa-solid fa-screwdriver-wrench"></i>
           Pendientes
           <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{records.filter(r => r.status === 'Open').length}</span>
         </button>
         <button 
           onClick={() => setActiveTab('closed')}
           className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'closed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
         >
           <i className="fa-solid fa-clipboard-check"></i>
           Histórico Reparaciones
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRecords.map((record) => {
          const equip = getEquipmentInfo(record.equipmentId);
          const styles = getSeverityStyles(record.severity);
          const isDark = record.severity === 'TotalLoss';
          const isClosed = record.status === 'Closed';

          return (
            <div key={record.id} className={`rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group flex flex-col h-full ${isClosed ? 'bg-gray-50 border-gray-200 opacity-90' : styles.card}`}>
               
               {/* Badge de Estado */}
               <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isClosed ? 'bg-green-100 text-green-600' : (isDark ? 'bg-white/10' : 'bg-gray-50')}`}>
                    <i className={`fa-solid ${isClosed ? 'fa-check' : styles.icon}`}></i>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-1 ${isClosed ? 'bg-green-100 text-green-700' : styles.badge}`}>
                        {isClosed ? 'Reparado / Cerrado' : (record.severity === 'TotalLoss' ? 'Pérdida Total' : record.severity === 'Severe' ? 'Severo' : 'Moderado')}
                    </span>
                    <span className={`text-[10px] font-mono ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>{record.date}</span>
                  </div>
               </div>

               <h3 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{record.title}</h3>
               <p className={`text-sm mb-4 line-clamp-2 flex-grow ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{record.description}</p>

               {/* Equipo Info */}
               <div className={`p-4 rounded-xl mb-4 ${isClosed ? 'bg-white border border-gray-200' : (isDark ? 'bg-white/10' : 'bg-gray-50')}`}>
                  <div className="flex items-center gap-3">
                     <i className={`fa-solid fa-laptop ${isClosed ? 'text-gray-400' : (isDark ? 'text-gray-400' : 'text-gray-400')}`}></i>
                     <div>
                        <p className={`text-xs font-bold uppercase ${isClosed ? 'text-gray-400' : (isDark ? 'text-gray-400' : 'text-gray-400')}`}>Equipo Afectado</p>
                        <p className={`font-bold text-sm ${isClosed ? 'text-gray-800' : (isDark ? 'text-white' : 'text-gray-800')}`}>
                          {equip ? `${equip.brand} ${equip.model}` : 'Equipo Desconocido'}
                        </p>
                        <p className={`text-xs ${isClosed ? 'text-gray-500' : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>Serie: {equip?.serialNumber}</p>
                     </div>
                  </div>
               </div>
               
               {/* Sección de Solución (Solo si está cerrado) */}
               {isClosed && record.resolutionDetails && (
                   <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-4">
                       <p className="text-[10px] font-black text-green-700 uppercase mb-1 flex items-center gap-1">
                           <i className="fa-solid fa-screwdriver-wrench"></i> Solución Técnica
                       </p>
                       <p className="text-sm text-green-900">{record.resolutionDetails}</p>
                       <p className="text-[10px] text-green-600 mt-2 text-right">Fecha: {record.resolutionDate}</p>
                   </div>
               )}

               {/* ESTADO DE ENTREGA (Solo para Cerrados) */}
               {isClosed && (
                 <div className={`mt-4 p-4 rounded-xl border-2 border-dashed flex flex-col gap-3 transition-all ${record.deliveryStatus === 'Delivered' ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                    
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${record.deliveryStatus === 'Delivered' ? 'bg-blue-500' : 'bg-orange-400'}`}>
                            <i className={`fa-solid ${record.deliveryStatus === 'Delivered' ? 'fa-hand-holding-hand' : 'fa-box-open'}`}></i>
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest opacity-60">Logística de Entrega</p>
                            <p className={`font-bold ${record.deliveryStatus === 'Delivered' ? 'text-blue-700' : 'text-orange-700'}`}>
                                {record.deliveryStatus === 'Delivered' ? 'Equipo Entregado al Usuario' : 'Pendiente de Entrega'}
                            </p>
                        </div>
                    </div>

                    <button 
                      onClick={() => toggleMaintenanceDelivery(record.id)}
                      className={`w-full py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 ${
                          record.deliveryStatus === 'Delivered' 
                          ? 'bg-white text-blue-500 hover:bg-blue-100 border border-blue-200' 
                          : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-200'
                      }`}
                    >
                      {record.deliveryStatus === 'Delivered' ? (
                          <>
                            <i className="fa-solid fa-rotate-left"></i> Deshacer Entrega
                          </>
                      ) : (
                          <>
                            <i className="fa-solid fa-check-double"></i> Marcar como Entregado
                          </>
                      )}
                    </button>
                 </div>
               )}

               {/* Acciones */}
               <div className={`flex justify-between items-center text-xs border-t pt-4 mt-auto ${isDark ? 'border-white/10 text-gray-400' : 'border-gray-100 text-gray-500'}`}>
                  <button 
                    onClick={() => handleViewDetails(record.equipmentId)}
                    className={`font-bold hover:underline ${isDark ? 'text-brand-blue-cyan' : 'text-brand-blue-cyan'}`}
                  >
                    Ver Ficha Equipo
                  </button>
                  
                  {!isClosed && (
                      <button 
                        onClick={() => handleOpenResolve(record)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-sm flex items-center gap-2"
                      >
                        <i className="fa-solid fa-check"></i>
                        Reparar
                      </button>
                  )}
               </div>
            </div>
          );
        })}

        {filteredRecords.length === 0 && (
          <div className="col-span-full py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
             <i className={`fa-solid ${activeTab === 'open' ? 'fa-check-circle' : 'fa-clipboard-list'} text-5xl mb-4 ${activeTab === 'open' ? 'text-green-200' : 'text-gray-200'}`}></i>
             <p className="font-bold">
                 {activeTab === 'open' ? 'No hay reparaciones pendientes' : 'No hay historial de reparaciones'}
             </p>
             <p className="text-sm">Todo parece estar en orden bajo este filtro.</p>
          </div>
        )}
      </div>

      {/* MODAL DETALLES DE EQUIPO (SOLO LECTURA) */}
      {isDetailsModalOpen && selectedEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Detalles del Activo</h2>
                  <p className="text-sm text-gray-500 font-medium">Información técnica en modo de solo lectura.</p>
                </div>
                <button onClick={() => setIsDetailsModalOpen(false)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
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
                    onClick={() => setIsDetailsModalOpen(false)} 
                    className="py-3 px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black text-xs uppercase tracking-widest rounded-xl transition-all"
                  >
                    Cerrar
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RESOLVER TICKET */}
      {isResolveModalOpen && ticketToResolve && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-200 h-auto max-h-[90vh] flex flex-col">
                <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-6 shrink-0">
                        <div>
                            <h2 className="text-xl font-black text-gray-900">Finalizar Mantenimiento</h2>
                            <p className="text-sm text-gray-500">Ticket #{ticketToResolve.id}: {ticketToResolve.title}</p>
                        </div>
                        <button onClick={() => setIsResolveModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <i className="fa-solid fa-times text-xl"></i>
                        </button>
                    </div>

                    {/* Formulario Rediseñado */}
                    <ResolveTicketForm 
                      equipment={getEquipmentInfo(ticketToResolve.equipmentId)!}
                      onSubmit={handleResolveSubmit}
                      onCancel={() => setIsResolveModalOpen(false)}
                    />
                </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default MaintenanceManager;
