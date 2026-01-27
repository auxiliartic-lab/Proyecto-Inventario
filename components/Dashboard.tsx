import React, { useState, useMemo } from 'react';
import { Company } from '../types';
import { useInventory } from '../context/InventoryContext';

interface DashboardProps {
  company: Company;
}

const Dashboard: React.FC<DashboardProps> = ({ company }) => {
  const { data } = useInventory();
  
  // Estados de Interacción
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [equipmentView, setEquipmentView] = useState<'recent' | 'stock'>('recent');

  // Filtros Base
  const allEquipment = data.equipment.filter(e => e.companyId === company.id);
  const licenses = data.licenses.filter(l => l.companyId === company.id);
  const maintenance = (data.maintenance || []).filter(m => m.companyId === company.id && m.status === 'Open');

  // --- LÓGICA DE DATOS ---

  // 1. Calcular Totales Globales
  const totalEquipos = allEquipment.length;
  const equiposAsignados = allEquipment.filter(e => e.assignedTo).length;
  const equiposStock = totalEquipos - equiposAsignados;
  const porcentajeAsignacion = totalEquipos > 0 ? Math.round((equiposAsignados / totalEquipos) * 100) : 0;

  // 2. Calcular Distribución por Categoría
  const distribution = useMemo(() => {
    const counts: Record<string, number> = {};
    allEquipment.forEach(e => {
      counts[e.type] = (counts[e.type] || 0) + 1;
    });
    // Convertir a array y ordenar
    return Object.entries(counts)
      .map(([type, count]) => ({ type, count, percentage: Math.round((count / totalEquipos) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [allEquipment, totalEquipos]);

  // 3. Filtrar Equipos según interacción (Click en gráfica)
  const displayedEquipment = useMemo(() => {
    let list = allEquipment;
    
    // Filtro por categoría seleccionada
    if (selectedCategory !== 'All') {
      list = list.filter(e => e.type === selectedCategory);
    }

    // Filtro por Vista (Reciente vs Stock)
    if (equipmentView === 'recent') {
      return [...list].sort((a, b) => b.id - a.id).slice(0, 5);
    } else {
      return list.filter(e => !e.assignedTo).slice(0, 5);
    }
  }, [allEquipment, selectedCategory, equipmentView]);

  // 4. Mantenimientos Críticos
  const criticalMaintenance = maintenance
    .filter(m => m.severity === 'Severe' || m.severity === 'TotalLoss')
    .slice(0, 3);

  // 5. Licencias por Vencer
  const expiringLicenses = licenses
    .filter(l => {
      const days = Math.ceil((new Date(l.expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return days <= 60;
    })
    .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime())
    .slice(0, 5);

  // Componente de Tarjeta KPI
  const KpiCard = ({ label, value, subtext, icon, colorClass, trend }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-md transition-all">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClass} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${colorClass}`}>
          <i className={`fa-solid ${icon} text-xl`}></i>
        </div>
        {trend && (
           <span className="bg-gray-50 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
             {trend}
           </span>
        )}
      </div>
      
      <div className="relative z-10">
        <h3 className="text-3xl font-black text-gray-900 mb-1">{value}</h3>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">{label}</p>
        {subtext && <p className="text-xs text-gray-400 mt-2 font-medium">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tablero de Control</h1>
          <p className="text-gray-500 mt-1">Visión general operativa de <span className="font-bold text-gray-900">{company.name}</span></p>
        </div>
        <div className="hidden md:flex flex-col items-end">
           <div className="bg-white border border-gray-200 rounded-lg p-1 flex items-center gap-2 text-xs font-bold text-gray-500">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded">
                <i className="fa-solid fa-server mr-1"></i> Sistema Activo
              </span>
              <span className="px-3">v1.2.0</span>
           </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard 
          label="Total Equipos" 
          value={totalEquipos} 
          subtext={`${equiposStock} en stock`}
          icon="fa-laptop" 
          colorClass="bg-brand-blue-dark from-brand-blue-dark to-brand-blue-cyan"
        />
        
        {/* KPI Tasa de Asignación */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-md transition-all">
           <div className="flex justify-between items-start mb-2">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg bg-green-600">
                 <i className="fa-solid fa-chart-pie text-xl"></i>
              </div>
              <span className="text-2xl font-black text-green-600">{porcentajeAsignacion}%</span>
           </div>
           <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Tasa de Asignación</p>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                 <div className="h-full bg-green-600 transition-all duration-1000 group-hover:bg-green-500" style={{ width: `${porcentajeAsignacion}%` }}></div>
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase">
                 <span>{equiposAsignados} Asignados</span>
                 <span>{totalEquipos} Total</span>
              </div>
           </div>
        </div>

        <KpiCard 
          label="Licencias Activas" 
          value={licenses.length} 
          subtext="Control de software"
          icon="fa-certificate" 
          colorClass="bg-brand-blue-cyan"
          trend="Monitor"
        />

        <KpiCard 
          label="Mantenimientos" 
          value={maintenance.length} 
          subtext={`${criticalMaintenance.length} críticos`}
          icon="fa-screwdriver-wrench" 
          colorClass="bg-brand-yellow"
          trend="Activos"
        />
      </div>

      {/* SECCIÓN INTERACTIVA: DISTRIBUCIÓN */}
      <div className="mb-8">
         <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-lg">Distribución de Inventario</h3>
            {selectedCategory !== 'All' && (
                <button 
                  onClick={() => setSelectedCategory('All')} 
                  className="text-xs font-bold text-brand-blue-cyan hover:underline flex items-center gap-1"
                >
                    <i className="fa-solid fa-times"></i> Quitar Filtro
                </button>
            )}
         </div>
         
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            {distribution.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {distribution.map((item) => (
                        <button
                            key={item.type}
                            onClick={() => setSelectedCategory(selectedCategory === item.type ? 'All' : item.type)}
                            className={`flex flex-col p-4 rounded-xl border transition-all text-left group relative overflow-hidden ${
                                selectedCategory === item.type 
                                ? 'bg-brand-blue-cyan/10 border-brand-blue-cyan ring-2 ring-brand-blue-cyan/20' 
                                : 'bg-gray-50 border-gray-100 hover:border-brand-blue-cyan/50 hover:bg-white'
                            }`}
                        >
                            <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                                selectedCategory === item.type ? 'text-brand-blue-dark' : 'text-gray-400'
                            }`}>
                                {item.type}
                            </span>
                            <span className="text-2xl font-black text-gray-800 group-hover:scale-105 transition-transform origin-left">
                                {item.count}
                            </span>
                            
                            {/* Barra Visual */}
                            <div className="absolute bottom-0 left-0 h-1 bg-gray-200 w-full">
                                <div 
                                    className={`h-full ${selectedCategory === item.type ? 'bg-brand-blue-cyan' : 'bg-gray-400'}`} 
                                    style={{ width: `${item.percentage}%` }}
                                ></div>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-400">Sin datos de inventario disponibles.</div>
            )}
         </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* COLUMNA IZQUIERDA (2/3): LISTA DINÁMICA */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header con Tabs */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <i className={`fa-solid ${equipmentView === 'recent' ? 'fa-clock-rotate-left' : 'fa-box-open'} text-brand-blue-cyan`}></i>
                {equipmentView === 'recent' ? 'Ingresos Recientes' : 'Stock Disponible'}
                {selectedCategory !== 'All' && <span className="text-gray-400 font-normal text-sm ml-1">({selectedCategory})</span>}
              </h3>
              
              <div className="flex bg-gray-100 p-1 rounded-lg">
                 <button 
                    onClick={() => setEquipmentView('recent')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${equipmentView === 'recent' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    Recientes
                 </button>
                 <button 
                    onClick={() => setEquipmentView('stock')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${equipmentView === 'stock' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    En Stock
                 </button>
              </div>
            </div>

            {/* Lista */}
            <div className="divide-y divide-gray-100">
              {displayedEquipment.length > 0 ? displayedEquipment.map((item) => {
                 const assignee = data.collaborators.find(c => c.id === item.assignedTo);
                 return (
                  <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${item.status === 'Mantenimiento' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-50 text-gray-400 group-hover:bg-brand-blue-cyan group-hover:text-white'}`}>
                        <i className={`fa-solid ${item.type === 'Laptop' ? 'fa-laptop' : item.type === 'Desktop' ? 'fa-desktop' : item.type === 'Smartphone' ? 'fa-mobile' : 'fa-server'}`}></i>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{item.brand} {item.model}</p>
                        <p className="text-xs text-gray-500">
                           <span className="font-bold uppercase tracking-wider text-[10px] mr-2 text-gray-400">{item.type}</span>
                           SN: <span className="font-mono">{item.serialNumber}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                       {assignee ? (
                         <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Asignado a</span>
                            <span className="text-xs font-bold text-brand-blue-dark">{assignee.firstName} {assignee.lastName}</span>
                         </div>
                       ) : (
                         <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase tracking-wide">
                            Disponible
                         </span>
                       )}
                    </div>
                  </div>
                 );
              }) : (
                <div className="p-12 text-center text-gray-400 text-sm flex flex-col items-center">
                    <i className="fa-solid fa-box-open text-3xl mb-3 opacity-30"></i>
                    <p>No hay equipos para mostrar en esta vista.</p>
                </div>
              )}
            </div>
            
            {/* Footer de Lista */}
            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Mostrando {displayedEquipment.length} resultados</span>
            </div>
          </div>

          {/* MANTENIMIENTOS CRÍTICOS */}
          {criticalMaintenance.length > 0 && (
            <div className="bg-red-50 rounded-2xl border border-red-100 overflow-hidden">
              <div className="p-6 border-b border-red-100 flex items-center gap-3">
                 <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white animate-pulse">
                   <i className="fa-solid fa-bell"></i>
                 </div>
                 <h3 className="font-bold text-red-900">Atención Requerida</h3>
              </div>
              <div className="p-4 space-y-3">
                {criticalMaintenance.map(m => {
                   const equip = data.equipment.find(e => e.id === m.equipmentId);
                   return (
                     <div key={m.id} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex flex-col sm:flex-row justify-between gap-4 transition-transform hover:-translate-y-1">
                        <div>
                           <p className="font-black text-gray-900">{m.title}</p>
                           <p className="text-sm text-gray-500 mb-2">{m.description}</p>
                           <p className="text-xs text-red-500 font-bold uppercase bg-red-50 w-fit px-2 py-0.5 rounded">
                             {equip ? `${equip.type}: ${equip.brand} ${equip.model}` : 'Equipo desconocido'}
                           </p>
                        </div>
                        <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:justify-center">
                           <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                             {m.severity === 'TotalLoss' ? 'Pérdida Total' : 'Severo'}
                           </span>
                           <span className="text-[10px] text-gray-400">{m.date}</span>
                        </div>
                     </div>
                   );
                })}
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA (1/3) */}
        <div className="space-y-8">
          
          {/* PRÓXIMOS VENCIMIENTOS (LICENCIAS) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
               <i className="fa-solid fa-clock text-brand-orange"></i>
               Vencimientos (60 días)
            </h3>
            
            <div className="space-y-4">
              {expiringLicenses.length > 0 ? expiringLicenses.map(l => {
                 const today = new Date();
                 const exp = new Date(l.expirationDate);
                 const diffTime = exp.getTime() - today.getTime();
                 const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                 const isExpired = days < 0;

                 // Cálculo para barra de progreso inversa
                 const totalDays = 365; // Asumimos ciclo anual para visualización
                 const progress = Math.max(0, Math.min(100, (days / totalDays) * 100));
                 const barColor = isExpired ? 'bg-red-500' : days < 30 ? 'bg-brand-orange' : 'bg-brand-blue-cyan';

                 return (
                   <div key={l.id} className="group cursor-default">
                      <div className="flex justify-between items-end mb-1">
                        <p className="font-bold text-gray-900 text-sm truncate w-2/3">{l.name}</p>
                        <span className={`text-[10px] font-black uppercase ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>
                           {isExpired ? 'Vencida' : `${days} días`}
                        </span>
                      </div>
                      
                      {/* Progress Bar Visual */}
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                         <div 
                            className={`h-full ${barColor} transition-all duration-500`} 
                            style={{ width: `${isExpired ? 100 : 100 - progress}%` }} 
                         ></div>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 truncate">{l.vendor}</p>
                   </div>
                 );
              }) : (
                 <div className="text-center py-8">
                    <i className="fa-solid fa-check-circle text-4xl text-green-200 mb-2"></i>
                    <p className="text-sm text-gray-400 font-medium">Todas las licencias están al día.</p>
                 </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;