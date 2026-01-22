
import React, { useState, useEffect } from 'react';
import { COMPANIES, NAVIGATION_ITEMS } from './constants';
import { Company, UserRole } from './types';
import Dashboard from './components/Dashboard';
import EquipmentList from './components/EquipmentList';
import CollaboratorList from './components/CollaboratorList';
import LicenseManager from './components/LicenseManager';
import CredentialVault from './components/CredentialVault';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCompany, setSelectedCompany] = useState<Company>(COMPANIES[0]);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.ADMIN);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-gray-900 text-white transition-all duration-300 flex-shrink-0 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center gap-3 border-b border-gray-800">
          <div className="bg-emerald-500 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/50">
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
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {isSidebarOpen && (
          <div className="absolute bottom-0 w-64 p-6 border-t border-gray-800 bg-gray-900/50">
            <div className="flex items-center gap-3 mb-4">
              <img src={`https://picsum.photos/seed/${selectedCompany.name}/40/40`} className="rounded-full ring-2 ring-emerald-500" alt="avatar" />
              <div>
                <p className="text-sm font-semibold truncate">Bayron Ramos</p>
                <p className="text-xs text-emerald-400">{userRole}</p>
              </div>
            </div>
            <button className="w-full py-2 px-4 bg-gray-800 hover:bg-red-900/20 text-red-400 hover:text-red-300 rounded-lg transition-colors flex items-center justify-center gap-2">
              <i className="fa-solid fa-right-from-bracket"></i>
              Cerrar Sesión
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-emerald-600 transition-colors p-2 hover:bg-emerald-50 rounded-lg"
            >
              <i className={`fa-solid ${isSidebarOpen ? 'fa-bars-staggered' : 'fa-bars'} text-xl`}></i>
            </button>
            <div className="relative">
              <select 
                value={selectedCompany.id}
                onChange={(e) => setSelectedCompany(COMPANIES.find(c => c.id === Number(e.target.value))!)}
                className="appearance-none bg-gray-100 border-none rounded-full px-6 py-2 pr-10 font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
              >
                {COMPANIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col text-right">
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Empresa Activa</span>
                <span className={`text-sm font-bold ${selectedCompany.color.replace('bg-', 'text-')}`}>{selectedCompany.name}</span>
             </div>
             <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all relative">
                <i className="fa-solid fa-bell text-xl"></i>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
             </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <section className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default App;
