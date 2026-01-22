
import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// --- DEFINICIONES DE TIPOS (Sincronizado con types.ts) ---
type Tab = 'dashboard' | 'equipment' | 'collaborators' | 'licenses' | 'maintenance' | 'credentials';

interface Company { id: number; name: string; color: string; }
interface Site { id: number; companyId: number; name: string; address: string; }

interface Equipment {
  id: number;
  companyId: number;
  siteId: number;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  status: 'Activo' | 'Mantenimiento' | 'Retirado' | 'Perdido';
  location: string;
  assignedTo?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  os?: string;
  purchaseDate: string;
}

interface MaintenanceRecord {
  id: number;
  equipmentId: number;
  date: string;
  type: 'Preventivo' | 'Correctivo';
  description: string;
  performedBy: string;
}

// --- MOCK DATA (Simulando respuesta de Laravel/MySQL) ---
const COMPANIES: Company[] = [
  { id: 1, name: 'Ecovitta', color: 'emerald' },
  { id: 2, name: 'Industrias Caldas', color: 'blue' },
  { id: 3, name: 'Química Básica', color: 'indigo' }
];

const SITES: Site[] = [
  { id: 1, companyId: 1, name: 'Planta Principal', address: 'Calle 100 #10-20' },
  { id: 2, companyId: 1, name: 'Centro Logístico', address: 'Av. Industrial 50' },
  { id: 3, companyId: 2, name: 'Sede Manizales', address: 'Cra 23 #45' }
];

const MOCK_EQUIPMENT: Equipment[] = [
  { 
    id: 1, companyId: 1, siteId: 1, type: 'Laptop', brand: 'Dell', model: 'Latitude 5420', 
    serialNumber: 'DL5420-X1', status: 'Activo', location: 'Oficina 201', assignedTo: 'Bayron Ramos',
    processor: 'Intel Core i7 11th Gen', ram: '16GB DDR4', storage: '512GB NVMe', os: 'Windows 11 Pro',
    purchaseDate: '2023-05-12'
  },
  { 
    id: 2, companyId: 1, siteId: 2, type: 'Servidor', brand: 'HPE', model: 'ProLiant DL380 Gen10', 
    serialNumber: 'HP-SRV-992', status: 'Activo', location: 'Data Center A',
    processor: 'Dual Intel Xeon Silver', ram: '128GB ECC', storage: '4TB RAID 5', os: 'VMware ESXi',
    purchaseDate: '2022-11-20'
  }
];

const MOCK_MAINTENANCE: MaintenanceRecord[] = [
  { id: 1, equipmentId: 1, date: '2024-01-15', type: 'Preventivo', description: 'Limpieza física y cambio de pasta térmica', performedBy: 'Soporte Externo' }
];

// --- COMPONENTES MODULARES ---

const StatusBadge = ({ status }: { status: Equipment['status'] }) => {
  const colors = {
    'Activo': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Mantenimiento': 'bg-amber-100 text-amber-700 border-amber-200',
    'Retirado': 'bg-slate-100 text-slate-700 border-slate-200',
    'Perdido': 'bg-red-100 text-red-700 border-red-200'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${colors[status]}`}>{status}</span>;
};

const DashboardView = ({ company, equipment }: { company: Company, equipment: Equipment[] }) => (
  <div className="animate-enter space-y-8">
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
      <p className="text-slate-500 font-medium">Resumen tecnológico de {company.name}</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[
        { label: 'Total Equipos', val: equipment.length, icon: 'fa-laptop', col: 'bg-indigo-600' },
        { label: 'En Servicio', val: equipment.filter(e => e.status === 'Activo').length, icon: 'fa-check-circle', col: 'bg-emerald-600' },
        { label: 'Mantenimientos', val: '4', icon: 'fa-screwdriver-wrench', col: 'bg-amber-600' },
        { label: 'Alertas', val: '1', icon: 'fa-bell', col: 'bg-rose-600' }
      ].map((s, i) => (
        <div key={i} className="glass-card p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className={`${s.col} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              <i className={`fa-solid ${s.icon} text-xl`}></i>
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">{s.val}</h3>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="glass-card p-8 rounded-3xl shadow-sm">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-3">
          <i className="fa-solid fa-clock-rotate-left text-indigo-500"></i>
          Eventos Recientes
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl flex gap-4 border border-slate-100">
             <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
               <i className="fa-solid fa-plus"></i>
             </div>
             <div>
               <p className="text-sm font-bold">Ingreso de Activo</p>
               <p className="text-xs text-slate-500">Dell Latitude 5420 asignado a Bayron Ramos.</p>
               <p className="text-[10px] text-slate-400 mt-1 font-bold">HACE 2 HORAS</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const InventoryView = ({ company, equipment }: { company: Company, equipment: Equipment[] }) => {
  const [search, setSearch] = useState('');
  const filtered = equipment.filter(e => e.serialNumber.toLowerCase().includes(search.toLowerCase()) || e.brand.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-enter space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Inventario Tecnológico</h2>
          <p className="text-slate-500 text-sm font-medium">Control detallado de activos y especificaciones.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Buscar por serie o marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm w-full md:w-72 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
          <button className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all">
            + Nuevo
          </button>
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Activo</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Espec. Técnicas</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Serie</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sede / Ubicación</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <i className={`fa-solid ${item.type === 'Servidor' ? 'fa-server' : 'fa-laptop'} text-lg`}></i>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{item.brand} {item.model}</p>
                        <p className="text-xs text-slate-400 font-medium">Asignado: {item.assignedTo || 'Libre'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-[11px] space-y-0.5">
                      <p><span className="text-slate-400 font-bold uppercase">CPU:</span> {item.processor}</p>
                      <p><span className="text-slate-400 font-bold uppercase">RAM:</span> {item.ram} | <span className="text-slate-400 font-bold uppercase">SSD:</span> {item.storage}</p>
                      <p><span className="text-slate-400 font-bold uppercase">OS:</span> {item.os}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-mono text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{item.serialNumber}</span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-slate-700">{SITES.find(s => s.id === item.siteId)?.name}</p>
                    <p className="text-[10px] text-slate-400">{item.location}</p>
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- APLICACIÓN PRINCIPAL ---

const App = () => {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [companyId, setCompanyId] = useState(1);
  
  const selectedCompany = COMPANIES.find(c => c.id === companyId) || COMPANIES[0];
  const companyEquipment = useMemo(() => MOCK_EQUIPMENT.filter(e => e.companyId === companyId), [companyId]);

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: 'fa-house' },
    { id: 'equipment', label: 'Inventario', icon: 'fa-laptop-code' },
    { id: 'collaborators', label: 'Colaboradores', icon: 'fa-users-gear' },
    { id: 'maintenance', label: 'Mantenimientos', icon: 'fa-screwdriver-wrench' },
    { id: 'credentials', label: 'Bóveda Claves', icon: 'fa-vault' }
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar de alta fidelidad */}
      <aside className={`bg-slate-900 text-white transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-24'} flex flex-col z-20 shadow-2xl shadow-slate-900/40`}>
        <div className="p-8 border-b border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <i className="fa-solid fa-microchip text-2xl"></i>
          </div>
          {sidebarOpen && (
            <div className="animate-enter">
              <span className="font-black text-xl tracking-tighter block leading-none">EquiTrack</span>
              <span className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em]">SISTEMA DE ACTIVOS</span>
            </div>
          )}
        </div>

        <nav className="mt-10 flex-1 px-5 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as Tab)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group ${tab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <i className={`fa-solid ${item.icon} text-lg w-6 text-center group-hover:scale-110 transition-transform`}></i>
              {sidebarOpen && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="p-6 m-5 bg-slate-800/50 rounded-3xl border border-slate-700/50">
             <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">Sesión Activa</p>
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-500/20">BR</div>
               <div className="min-w-0">
                 <p className="text-sm font-bold truncate">Bayron Ramos</p>
                 <p className="text-[10px] text-indigo-400 font-bold uppercase">Líder IT</p>
               </div>
             </div>
          </div>
        )}
      </aside>

      {/* Área de trabajo */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-10 py-5 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-8">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-indigo-600 transition-colors p-2 hover:bg-slate-100 rounded-xl">
              <i className="fa-solid fa-bars-staggered text-xl"></i>
            </button>
            <div className="relative group">
              <i className="fa-solid fa-building absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors"></i>
              <select 
                value={companyId}
                onChange={(e) => setCompanyId(Number(e.target.value))}
                className="bg-slate-100 pl-11 pr-10 py-2.5 text-xs font-black outline-none cursor-pointer hover:bg-slate-200 transition-all border-none rounded-2xl appearance-none shadow-inner"
              >
                {COMPANIES.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none"></i>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sede Central</span>
                <span className="text-xs font-bold text-slate-900">Barranquilla, CO</span>
             </div>
             <div className="w-px h-8 bg-slate-200"></div>
             <button className="relative w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all group">
                <i className="fa-solid fa-bell text-lg"></i>
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
             </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50/30">
          {tab === 'dashboard' && <DashboardView company={selectedCompany} equipment={companyEquipment} />}
          {tab === 'equipment' && <InventoryView company={selectedCompany} equipment={companyEquipment} />}
          
          {['collaborators', 'maintenance', 'credentials'].includes(tab) && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-enter opacity-60">
               <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                 <i className="fa-solid fa-person-digging text-4xl"></i>
               </div>
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Construyendo Módulo</h3>
               <p className="text-sm font-medium mt-2">La funcionalidad de {tab.toUpperCase()} estará disponible para {selectedCompany.name} próximamente.</p>
               <button onClick={() => setTab('dashboard')} className="mt-8 text-indigo-600 font-bold hover:underline">Volver al Dashboard</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

// Renderizado con seguridad ante entornos sin root
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
