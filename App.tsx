
import React, { useState, useEffect, useRef } from 'react';
import { COMPANIES, NAVIGATION_ITEMS } from './appData';
import { Company, UserRole } from './types';
import Dashboard from './components/Dashboard';
import EquipmentList from './components/EquipmentList';
import CollaboratorList from './components/CollaboratorList';
import LicenseManager from './components/LicenseManager';
import CredentialVault from './components/CredentialVault';
import MaintenanceManager from './components/MaintenanceManager';
import ReportsModule from './components/ReportsModule';
import UserManagement from './components/UserManagement'; // New
import { useInventory, InventoryProvider } from './context/InventoryContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';

// Componente interno para renderizar los Toasts
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-[110] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`pointer-events-auto min-w-[300px] max-w-sm bg-white rounded-xl shadow-2xl border-l-4 p-4 flex items-start gap-3 transform transition-all duration-300 animate-enter ${
            toast.type === 'success' ? 'border-green-500' : 
            toast.type === 'error' ? 'border-red-500' : 
            toast.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'
          }`}
        >
          <div className={`mt-0.5 ${
             toast.type === 'success' ? 'text-green-500' : 
             toast.type === 'error' ? 'text-red-500' : 
             toast.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
          }`}>
            <i className={`fa-solid ${
              toast.type === 'success' ? 'fa-circle-check' : 
              toast.type === 'error' ? 'fa-circle-xmark' : 
              toast.type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-info'
            }`}></i>
          </div>
          <div className="flex-1">
             <p className="text-sm font-bold text-gray-800">{toast.message}</p>
          </div>
          <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

const AuthenticatedApp = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  // Estado de Navegación y Datos
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCompany, setSelectedCompany] = useState<Company>(COMPANIES[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(window.innerWidth >= 768);

  // Inactividad
  const idleTimerRef = useRef<any>(null);
  const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutos

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      logout();
      addToast('Sesión cerrada por inactividad', 'warning');
    }, INACTIVITY_LIMIT_MS);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetIdleTimer();

    events.forEach(event => window.addEventListener(event, handleActivity));
    resetIdleTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard company={selectedCompany} />;
      case 'equipment': return <EquipmentList company={selectedCompany} role={user?.role} />; 
      case 'collaborators': return <CollaboratorList company={selectedCompany} onNavigate={setActiveTab} />;
      case 'licenses': return <LicenseManager company={selectedCompany} />;
      case 'maintenance': return <MaintenanceManager company={selectedCompany} />;
      case 'credentials': return user?.role === UserRole.ADMIN ? <CredentialVault company={selectedCompany} /> : <div className="p-8 text-center text-red-500">Acceso Denegado</div>;
      case 'reports': return <ReportsModule company={selectedCompany} />;
      case 'users': return user?.role === UserRole.ADMIN ? <UserManagement /> : <div className="p-8 text-center text-red-500">Acceso Denegado</div>;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      
      <div 
        className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside 
        className={`fixed md:relative inset-y-0 left-0 z-50 h-full flex flex-col bg-gray-900 text-white shadow-2xl transition-all duration-300 ease-in-out w-sidebar
          ${isSidebarOpen ? 'translate-x-0 w-80' : '-translate-x-full md:translate-x-0 w-80 md:w-24'}
        `}
      >
        <div className={`flex flex-col items-center border-b border-gray-800 transition-all duration-300 ${isSidebarOpen ? 'p-6 gap-4' : 'p-4 justify-center'}`}>
          <div className={`bg-gray-800 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 mx-auto ${isSidebarOpen ? 'w-16 h-16' : 'w-10 h-10'}`}>
              <i className={`fa-solid fa-folder-tree text-white ${isSidebarOpen ? 'text-2xl' : 'text-sm'}`}></i>
          </div>
          <div className={`text-center transition-all duration-300 ${isSidebarOpen ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'}`}>
              <span className="block font-bold text-xl tracking-tight text-white whitespace-nowrap">Inventory</span>
              <span className="block text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-0.5 whitespace-nowrap">Gestión Multisede</span>
          </div>
        </div>

        <nav className="mt-6 space-y-1.5 px-4 flex-1 overflow-y-auto custom-scrollbar">
          {NAVIGATION_ITEMS.map((item) => {
            // Filtrar ítems exclusivos de Admin
            if ((item as any).adminOnly && user?.role !== UserRole.ADMIN) return null;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all whitespace-nowrap group relative overflow-hidden ${
                  activeTab === item.id 
                    ? `${selectedCompany.color} text-white shadow-lg` 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                } ${!isSidebarOpen && 'md:justify-center md:px-0'}`}
                title={!isSidebarOpen ? item.label : ''}
              >
                <i className={`fa-solid ${item.icon} w-6 text-center text-lg shrink-0 ${!isSidebarOpen && activeTab !== item.id && 'group-hover:text-white'}`}></i>
                <span className={`font-medium text-sm transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className={`border-t border-gray-800 transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'p-6 bg-gray-900/50' : 'py-6'}`}>
          {isSidebarOpen ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-3 px-2 mb-2">
                 <div className="w-8 h-8 rounded-full bg-brand-blue-cyan text-white flex items-center justify-center font-bold text-xs">
                    {user?.username.charAt(0).toUpperCase()}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{user?.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{user?.role}</p>
                 </div>
              </div>
              <button onClick={logout} className="w-full py-3 px-4 bg-gray-800 hover:bg-red-900/20 text-red-400 hover:text-red-300 rounded-xl transition-colors flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-wider">
                <i className="fa-solid fa-right-from-bracket text-sm"></i> Cerrar Sesión
              </button>
            </div>
          ) : (
              <div className="flex flex-col items-center gap-6">
                <button onClick={logout} className="text-gray-500 hover:text-red-400 transition-colors" title="Cerrar Sesión"><i className="fa-solid fa-right-from-bracket text-lg"></i></button>
              </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 w-full h-full relative bg-gray-50">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm gap-4 h-header transition-all">
          <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-xl active:scale-95 transform duration-100 shrink-0"
            >
              <i className={`fa-solid ${isSidebarOpen ? 'fa-bars-staggered' : 'fa-bars'} text-xl`}></i>
            </button>
            
            <div className="relative group flex items-center flex-1 min-w-0 max-w-full md:max-w-xs">
              <i className="fa-solid fa-building absolute left-3 z-10 text-gray-400 text-xs pointer-events-none"></i>
              <select 
                value={selectedCompany.id}
                onChange={(e) => {
                  const company = COMPANIES.find(c => c.id === Number(e.target.value));
                  if (company) {
                    setSelectedCompany(company);
                    addToast(`Organización cambiada a ${company.name}`, 'info');
                  }
                }}
                className="appearance-none bg-gray-100 border-none rounded-xl pl-9 pr-8 py-2.5 font-bold text-xs sm:text-sm text-gray-700 focus:ring-2 focus:ring-brand-blue-cyan transition-all cursor-pointer w-full hover:bg-gray-200 truncate"
              >
                {COMPANIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 text-gray-400 pointer-events-none text-[10px]"></i>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6 shrink-0 ml-2">
              <div className="hidden md:flex flex-col items-end border-l border-gray-200 pl-6">
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1">Organización Actual</span>
                <img src={selectedCompany.logo} alt={selectedCompany.name} className="h-10 object-contain object-right" />
              </div>
              <div className="md:hidden w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                <img src={selectedCompany.logo} alt="Logo" className="w-5 h-5 object-contain" />
              </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar w-full">
          <div className="max-w-[1920px] mx-auto w-full">
            {renderContent()}
          </div>
        </section>
      </main>
      
      <ToastContainer />
    </div>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <InventoryProvider>
          <AuthenticatedApp />
        </InventoryProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
