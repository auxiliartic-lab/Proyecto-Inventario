
import React from 'react';
import { Company, EquipmentStatus } from '../types';
import { useInventory } from '../context/InventoryContext';

interface DashboardProps {
  company: Company;
}

const Dashboard: React.FC<DashboardProps> = ({ company }) => {
  const { data, factoryReset } = useInventory();
  
  // --- LÓGICA DE DATOS REALES ---

  // 1. Filtrar datos por empresa
  const equipment = data.equipment.filter(e => e.companyId === company.id);
  const licenses = data.licenses.filter(l => l.companyId === company.id);
  const maintenance = (data.maintenance || []).filter(m => m.companyId === company.id && m.status === 'Open');

  // 2. Cálculos de KPIs
  const totalEquipos = equipment.length;
  const equiposAsignados = equipment.filter(e => e.assignedTo).length;
  const equiposStock = totalEquipos - equiposAsignados;
  const porcentajeAsignacion = totalEquipos > 0 ? Math.round((equiposAsignados / totalEquipos) * 100) : 0;

  // 3. Lógica de Licencias (Vencen en próximos 60 días)
  const expiringLicenses = licenses
    .filter(l => {
      const days = Math.ceil((new Date(l.expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return days <= 60; // Mostrar vencidas o por vencer en 2 meses
    })
    .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime())
    .slice(0, 5); // Top 5

  // 4. Mantenimientos Críticos
  const criticalMaintenance = maintenance
    .filter(m => m.severity === 'Severe' || m.severity === 'TotalLoss')
    .slice(0, 3);

  // 5. Últimos equipos agregados (Basado en ID más alto como proxy de "reciente" o fecha compra)
  const recentEquipment = [...equipment]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  const handleReset = () => {
    if (confirm('¡Atención! Esto borrará todos los datos y restaurará el estado inicial de fábrica. ¿Confirmar?')) {
      factoryReset();
    }
  };

  // --- COMPONENTES UI INTERNOS ---

  const KpiCard = ({ label, value, subtext, icon, colorClass, trend }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-full relative overflow-hidden group">
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
          <p className="text-gray-500 mt-1">Visión general operativa de <span className="font-bold text-gray-800">{company.name}</span></p>
        </div>
        <div className="text-right hidden md:block">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Última actualización</p>
           <p className="text-sm font-mono text-gray-600">{new Date().toLocaleTimeString()} (Tiempo Real)</p>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard 
          label="Total Equipos" 
          value={totalEquipos} 
          subtext={`${equiposStock} en stock disponible`}
          icon="fa-laptop" 
          colorClass="bg-brand-blue-dark from-brand-blue-dark to-brand-blue-cyan"
        />
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-full relative overflow-hidden">
           <div className="flex justify-between items-start mb-2">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg bg-brand-green-dark">
                 <i className="fa-solid fa-chart-pie text-xl"></i>
              </div>
              <span className="text-2xl font-black text-brand-green-dark">{porcentajeAsignacion}%</span>
           </div>
           <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Tasa de Asignación</p>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                 <div className="h-full bg-brand-green-dark transition-all duration-1000" style={{ width: `${porcentajeAsignacion}%` }}></div>
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
          subtext={`${expiringLicenses.length} requieren atención`}
          icon="fa-certificate" 
          colorClass="bg-brand-blue-cyan from-brand-blue-cyan to-cyan-300"
          trend={expiringLicenses.length > 0 ? "Alertas" : "OK"}
        />

        <KpiCard 
          label="Mantenimientos" 
          value={maintenance.length} 
          subtext={`${criticalMaintenance.length} casos críticos`}
          icon="fa-screwdriver-wrench" 
          colorClass="bg-brand-yellow from-brand-yellow to-orange-400"
          trend={maintenance.length > 0 ? "En proceso" : "Sin casos"}
        />
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* COLUMNA IZQUIERDA (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* ÚLTIMOS INGRESOS */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <i className="fa-solid fa-box-open text-brand-blue-cyan"></i>
                Últimos Equipos Ingresados
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {recentEquipment.length > 0 ? recentEquipment.map((item) => {
                 const assignee = data.collaborators.find(c => c.id === item.assignedTo);
                 return (
                  <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-brand-blue-cyan group-hover:text-white transition-colors">
                        <i className={`fa-solid ${item.type === 'Laptop' ? 'fa-laptop' : 'fa-desktop'}`}></i>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{item.type} {item.brand} {item.model}</p>
                        <p className="text-xs text-gray-500">Serie: <span className="font-mono">{item.serialNumber}</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                       {assignee ? (
                         <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Asignado a</span>
                            <span className="text-xs font-bold text-brand-blue-dark">{assignee.firstName} {assignee.lastName}</span>
                         </div>
                       ) : (
                         <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-[10px] font-bold uppercase">En Stock</span>
                       )}
                    </div>
                  </div>
                 );
              }) : (
                <div className="p-8 text-center text-gray-400 text-sm">No hay equipos registrados aún.</div>
              )}
            </div>
          </div>

          {/* MANTENIMIENTOS CRÍTICOS */}
          {criticalMaintenance.length > 0 && (
            <div className="bg-red-50 rounded-2xl border border-red-100 overflow-hidden">
              <div className="p-6 border-b border-red-100 flex items-center gap-3">
                 <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white animate-pulse">
                   <i className="fa-solid fa-bell"></i>
                 </div>
                 <h3 className="font-bold text-red-900">Mantenimientos Críticos Pendientes</h3>
              </div>
              <div className="p-4 space-y-3">
                {criticalMaintenance.map(m => {
                   const equip = data.equipment.find(e => e.id === m.equipmentId);
                   return (
                     <div key={m.id} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                           <p className="font-black text-gray-900">{m.title}</p>
                           <p className="text-sm text-gray-600">{m.description}</p>
                           <p className="text-xs text-red-500 font-bold mt-1 uppercase">
                             {equip ? `${equip.type} ${equip.brand}` : 'Equipo desconocido'}
                           </p>
                        </div>
                        <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:justify-center">
                           <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                             {m.severity === 'TotalLoss' ? 'Pérdida Total' : 'Severo'}
                           </span>
                           <span className="text-[10px] text-gray-400 font-mono">{m.date}</span>
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
               <i className="fa-solid fa-clock text-brand-yellow"></i>
               Vencimientos (60 días)
            </h3>
            
            <div className="space-y-4">
              {expiringLicenses.length > 0 ? expiringLicenses.map(l => {
                 const today = new Date();
                 const exp = new Date(l.expirationDate);
                 const diffTime = exp.getTime() - today.getTime();
                 const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                 const isExpired = days < 0;

                 return (
                   <div key={l.id} className={`p-4 rounded-xl border-l-4 ${isExpired ? 'bg-red-50 border-red-500' : days <= 30 ? 'bg-orange-50 border-orange-400' : 'bg-yellow-50 border-yellow-400'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-gray-900 text-sm">{l.name}</p>
                        {isExpired ? (
                           <span className="text-[10px] font-black text-red-600 uppercase">Vencida</span>
                        ) : (
                           <span className="text-[10px] font-black text-gray-500">{days} días</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{l.vendor}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-1">{l.expirationDate}</p>
                   </div>
                 );
              }) : (
                 <div className="text-center py-8">
                    <i className="fa-solid fa-check-circle text-4xl text-green-200 mb-2"></i>
                    <p className="text-sm text-gray-500 font-medium">No hay licencias próximas a vencer.</p>
                 </div>
              )}
            </div>
          </div>

          {/* ACCIONES RÁPIDAS / DATA ZONE */}
          <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200">
             <h3 className="font-bold text-gray-700 text-sm uppercase tracking-widest mb-4">Zona de Datos</h3>
             <p className="text-xs text-gray-500 mb-4 leading-relaxed">
               Los datos se guardan automáticamente en tu navegador. Si necesitas limpiar la base de datos para pruebas, usa el siguiente botón.
             </p>
             <button 
               onClick={handleReset}
               className="w-full py-3 bg-white border border-gray-300 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
             >
               <i className="fa-solid fa-rotate-right"></i>
               Reset de Fábrica
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
