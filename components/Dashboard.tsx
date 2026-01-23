
import React from 'react';
import { Company } from '../types';
import { useInventory } from '../context/InventoryContext';

interface DashboardProps {
  company: Company;
}

const Dashboard: React.FC<DashboardProps> = ({ company }) => {
  const { data, factoryReset } = useInventory();
  
  const equipCount = data.equipment.filter(e => e.companyId === company.id).length;
  const licenseCount = data.licenses.filter(l => l.companyId === company.id).length;
  const maintenanceCount = (data.maintenance || []).filter(m => m.companyId === company.id && m.status === 'Open').length;

  const stats = [
    { label: 'Total Equipos', value: equipCount, icon: 'fa-laptop', color: 'bg-brand-blue-dark' },
    { label: 'Licencias Activas', value: licenseCount, icon: 'fa-certificate', color: 'bg-brand-green-dark' },
    { label: 'Mantenimientos Pendientes', value: maintenanceCount, icon: 'fa-tools', color: 'bg-brand-yellow' },
    { label: 'Alertas Críticas', value: '1', icon: 'fa-circle-exclamation', color: 'bg-brand-mexico' }
  ];

  const handleReset = () => {
    if (confirm('¡Atención! Esto borrará todos los datos que has ingresado (Equipos, Licencias, Colaboradores) y restaurará la base de datos al estado inicial de fábrica. ¿Estás seguro?')) {
      factoryReset();
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Bienvenido, {company.name}</h1>
        <p className="text-gray-500 mt-2">Resumen operativo del parque tecnológico de hoy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              </div>
              <div className={`${stat.color} p-3 rounded-xl shadow-lg shadow-gray-200`}>
                <i className={`fa-solid ${stat.icon} text-white text-xl`}></i>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-green-dark">
              <i className="fa-solid fa-arrow-up"></i>
              <span>8% desde el mes pasado</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Actividad Reciente</h3>
            <button className="text-sm text-brand-blue-cyan font-semibold hover:underline">Ver todo</button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border-l-4 border-brand-blue-cyan">
                <div className="bg-brand-blue-cyan/10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-plus text-brand-blue-cyan"></i>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Nuevo equipo registrado</p>
                  <p className="text-sm text-gray-600">Dell Latitude 5420 asignado a Bayron Ramos.</p>
                  <p className="text-xs text-gray-400 mt-1 italic">Hace 2 horas</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Próximos Vencimientos</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-50 border border-red-100">
              <p className="font-bold text-red-900">Adobe Creative Cloud</p>
              <p className="text-sm text-red-700">Expira en 4 días</p>
              <button className="mt-3 w-full py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors">
                Renovar Ahora
              </button>
            </div>
            <div className="p-4 rounded-xl bg-brand-yellow/10 border border-brand-yellow/20">
              <p className="font-bold text-gray-900">Garantía Server HP</p>
              <p className="text-sm text-gray-600">Expira en 15 días</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Zone for Data Persistence Testing */}
      <div className="bg-gray-100 rounded-2xl p-6 border-2 border-dashed border-gray-300">
        <h3 className="text-lg font-bold text-gray-700 mb-2 flex items-center gap-2">
          <i className="fa-solid fa-database"></i>
          Zona de Datos (Entorno de Pruebas)
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Esta aplicación utiliza el <strong>almacenamiento local del navegador</strong> para simular una base de datos. 
          Los datos que ingreses se guardarán automáticamente. Ahora usamos <strong>React Context</strong> para asegurar que los datos estén sincronizados en toda la app.
        </p>
        <button 
          onClick={handleReset}
          className="bg-white border border-gray-300 text-red-600 hover:bg-red-50 hover:border-red-200 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-rotate-left"></i>
          Restaurar Datos de Fábrica (Borrar mis cambios)
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
