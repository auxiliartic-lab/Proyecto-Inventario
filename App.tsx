
import React, { useState } from 'react';
import { COMPANIES, NAVIGATION_ITEMS } from './appData';
import { Company, UserRole } from './types';
import Dashboard from './components/Dashboard';
import EquipmentList from './components/EquipmentList';
import CollaboratorList from './components/CollaboratorList';
import LicenseManager from './components/LicenseManager';
import CredentialVault from './components/CredentialVault';
import MaintenanceManager from './components/MaintenanceManager';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCompany, setSelectedCompany] = useState<Company>(COMPANIES[0]);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.ADMIN);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard company={selectedCompany} />;
      case 'equipment':
        return <EquipmentList company={selectedCompany} role={userRole} />;
      case 'collaborators':
        return <CollaboratorList company={selectedCompany} />;
      case 'licenses':
        return <LicenseManager company={selectedCompany} />;
      case 'maintenance':
        return <MaintenanceManager company={selectedCompany} />;
      case 'credentials':
        return <CredentialVault company={selectedCompany} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <i className="fa-solid fa-person-digging text-6xl mb-4"></i>
            <h2 className="text-2xl font-semibold">Módulo en construcción</h2>
            <p>Estamos trabajando para traerte esta funcionalidad pronto.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className={`bg-gray-900 text-white transition-all duration-300 flex-shrink-0 z-40 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center gap-3 border-b border-gray-800">
          <div className="bg-brand-blue-cyan w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-brand-blue-cyan/30 shrink-0">
            <i className="fa-solid fa-server text-white text-xl"></i>
          </div>
          {isSidebarOpen && <span className="font-bold text-xl tracking-tight">EquiTrack</span>}
        </div>

        <nav className="mt-8 space-y-1 px-3">
          {NAVIGATION_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-brand-blue-cyan text-white shadow-lg shadow-brand-blue-cyan/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
              {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        {isSidebarOpen && (
          <div className="absolute bottom-0 w-64 p-6 border-t border-gray-800 bg-gray-900/50">
            <div className="flex items-center gap-3 mb-4">
              <img src={`https://picsum.photos/seed/${selectedCompany.name}/40/40`} className="w-10 h-10 rounded-full ring-2 ring-brand-blue-cyan" alt="avatar" />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">Bayron Ramos</p>
                <p className="text-[10px] text-brand-blue-cyan font-bold uppercase">{userRole}</p>
              </div>
            </div>
            <button className="w-full py-2 px-4 bg-gray-800 hover:bg-red-900/20 text-red-400 hover:text-red-300 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs font-bold">
              <i className="fa-solid fa-right-from-bracket"></i>
              Cerrar Sesión
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-brand-blue-cyan transition-colors p-2 hover:bg-brand-blue-cyan/5 rounded-lg"
            >
              <i className={`fa-solid ${isSidebarOpen ? 'fa-bars-staggered' : 'fa-bars'} text-xl`}></i>
            </button>
            <div className="relative group flex items-center">
              <i className="fa-solid fa-building absolute left-4 z-10 text-gray-400 text-xs"></i>
              <select 
                value={selectedCompany.id}
                onChange={(e) => {
                  const company = COMPANIES.find(c => c.id === Number(e.target.value));
                  if (company) setSelectedCompany(company);
                }}
                className="appearance-none bg-gray-100 border-none rounded-full pl-10 pr-10 py-2 font-bold text-xs text-gray-700 focus:ring-2 focus:ring-brand-blue-cyan transition-all cursor-pointer min-w-[180px]"
              >
                {COMPANIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-4 text-gray-400 pointer-events-none text-[10px]"></i>
            </div>
          </div>

          <div className="flex items-center gap-6">
             {/* Company Logo Display */}
             <div className="hidden md:flex flex-col items-end">
                <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1.5">Organización</span>
                <img 
                  src={selectedCompany.logo} 
                  alt={selectedCompany.name} 
                  className="h-8 object-contain max-w-[150px]" 
                />
             </div>
             <div className="w-px h-8 bg-gray-200 hidden md:block"></div>
             <button className="p-2.5 text-gray-400 hover:text-brand-blue-cyan hover:bg-brand-blue-cyan/5 rounded-xl transition-all relative">
                <i className="fa-solid fa-bell text-xl"></i>
                <span className="absolute top-2 right-2 w-2 h-2 bg-brand-orange rounded-full ring-2 ring-white"></span>
             </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
