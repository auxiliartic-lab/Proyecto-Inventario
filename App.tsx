
import React, { useState, useEffect, useRef } from 'react';
import { COMPANIES, NAVIGATION_ITEMS } from './appData';
import { Company, UserRole } from './types';
import Dashboard from './components/Dashboard';
import EquipmentList from './components/EquipmentList';
import CollaboratorList from './components/CollaboratorList';
import LicenseManager from './components/LicenseManager';
import CredentialVault from './components/CredentialVault';
import MaintenanceManager from './components/MaintenanceManager';
import SecurityLock from './components/SecurityLock';

// Configuración de Seguridad
const INACTIVITY_LIMIT_MS = 5 * 60 * 1000; // 5 minutos

// ==========================================
// 🔐 SEGURIDAD: CAMBIA LA CONTRASEÑA AQUÍ
// ==========================================
const MASTER_PIN = '0000'; 
// ==========================================

const App: React.FC = () => {
  // Estado de Navegación y Datos
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCompany, setSelectedCompany] = useState<Company>(COMPANIES[0]);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.ADMIN);
  // Sidebar cerrado por defecto en móviles, abierto en desktop
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(window.innerWidth >= 768);

  // Estado de Seguridad
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- LÓGICA DE SEGURIDAD ---

  // 1. Manejo del Login / Desbloqueo
  const handleUnlock = (pin: string): boolean => {
    if (pin === MASTER_PIN) {
      setIsAuthenticated(true);
      setIsLocked(false);
      resetIdleTimer();
      return true;
    }
    return false;
  };

  // 2. Bloqueo Manual
  const handleLockSession = () => {
    setIsLocked(true);
  };

  // 3. Logout (Reinicio total)
  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsLocked(false);
    setActiveTab('dashboard'); // Reset tab
  };

  // 4. Temporizador de Inactividad
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isAuthenticated && !isLocked) {
      idleTimerRef.current = setTimeout(() => {
        setIsLocked(true);
      }, INACTIVITY_LIMIT_MS);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Eventos que reinician el timer
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => resetIdleTimer();

    if (isAuthenticated && !isLocked) {
      events.forEach(event => window.addEventListener(event, handleActivity));
      resetIdleTimer(); // Iniciar timer
    }

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isAuthenticated, isLocked]);

  // --- RENDERIZADO ---

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
    <>
      {/* Componente de Seguridad (Overlay) */}
      <SecurityLock 
        isLocked={isLocked} 
        isAuthenticated={isAuthenticated} 
        onUnlock={handleUnlock} 
      />

      {/* Aplicación Principal */}
      {isAuthenticated && (
        <div className={`flex h-screen w-full overflow-hidden bg-gray-50 ${isLocked ? 'blur-sm brightness-50 pointer-events-none select-none' : ''}`}>
          
          {/* Sidebar Overlay para Móviles */}
          {isSidebarOpen && window.innerWidth < 768 && (
            <div 
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside 
            className={`bg-gray-900 text-white transition-all duration-300 z-40 flex flex-col fixed md:relative h-full shadow-2xl
            ${isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 md:w-24 -translate-x-full md:translate-x-0'}
            `}
          >
            {/* Header del Sidebar con Logo de Carpeta (Inventory) */}
            <div className={`flex flex-col items-center border-b border-gray-800 transition-all duration-300 ${isSidebarOpen ? 'p-6 gap-4' : 'p-4 justify-center'}`}>
              
              {/* Contenedor del Logo: Carpeta estilizada - TAMAÑO REDUCIDO */}
              <div className={`bg-gradient-to-br from-brand-blue-cyan to-brand-blue-dark rounded-full flex items-center justify-center shadow-lg shadow-brand-blue-cyan/20 transition-all duration-300 mx-auto ${
                  isSidebarOpen 
                    ? 'w-16 h-16' // Reducido de w-32 a w-16 (64px)
                    : 'w-10 h-10' 
                }`}>
                 <i className={`fa-solid fa-folder-tree text-white ${isSidebarOpen ? 'text-2xl' : 'text-sm'}`}></i>
              </div>

              {/* Título de la App (Solo visible si abierto) */}
              {isSidebarOpen && (
                <div className="text-center animate-in fade-in slide-in-from-top-2">
                  <span className="block font-bold text-xl tracking-tight text-white">Inventory</span>
                  <span className="block text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-0.5">Gestión Multisede v2.0</span>
                </div>
              )}
            </div>

            <nav className="mt-6 space-y-1.5 px-4 flex-1 overflow-y-auto custom-scrollbar">
              {NAVIGATION_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all whitespace-nowrap group ${
                    activeTab === item.id 
                      ? 'bg-brand-blue-cyan text-white shadow-lg shadow-brand-blue-cyan/20' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  } ${!isSidebarOpen && 'md:justify-center md:px-0'}`}
                  title={!isSidebarOpen ? item.label : ''}
                >
                  <i className={`fa-solid ${item.icon} w-6 text-center text-lg ${!isSidebarOpen && activeTab !== item.id && 'group-hover:text-brand-blue-cyan'}`}></i>
                  {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                </button>
              ))}
            </nav>

            {isSidebarOpen ? (
              <div className="p-6 border-t border-gray-800 bg-gray-900/50 space-y-3">
                <button 
                  onClick={handleLockSession}
                  className="w-full py-3 px-4 bg-gray-800 hover:bg-brand-yellow/10 text-gray-300 hover:text-brand-yellow rounded-xl transition-colors flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-wider"
                >
                  <i className="fa-solid fa-lock text-sm"></i>
                  Bloquear Sesión
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full py-3 px-4 bg-gray-800 hover:bg-red-900/20 text-red-400 hover:text-red-300 rounded-xl transition-colors flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-wider"
                >
                  <i className="fa-solid fa-right-from-bracket text-sm"></i>
                  Cerrar Sistema
                </button>
              </div>
            ) : (
               /* Iconos footer cuando sidebar colapsado */
               <div className="py-6 flex flex-col items-center gap-6 border-t border-gray-800">
                  <button onClick={handleLockSession} className="text-gray-500 hover:text-brand-yellow transition-colors" title="Bloquear"><i className="fa-solid fa-lock text-lg"></i></button>
                  <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors" title="Salir"><i className="fa-solid fa-right-from-bracket text-lg"></i></button>
               </div>
            )}
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0 w-full h-full relative bg-gray-50">
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4 md:gap-6 max-w-[60%]">
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="text-gray-500 hover:text-brand-blue-cyan transition-colors p-2.5 hover:bg-brand-blue-cyan/5 rounded-xl"
                >
                  <i className={`fa-solid ${isSidebarOpen ? 'fa-bars-staggered' : 'fa-bars'} text-xl`}></i>
                </button>
                <div className="relative group flex items-center flex-1 min-w-0">
                  <i className="fa-solid fa-building absolute left-4 z-10 text-gray-400 text-xs"></i>
                  <select 
                    value={selectedCompany.id}
                    onChange={(e) => {
                      const company = COMPANIES.find(c => c.id === Number(e.target.value));
                      if (company) setSelectedCompany(company);
                    }}
                    className="appearance-none bg-gray-100 border-none rounded-full pl-10 pr-10 py-2.5 font-bold text-sm text-gray-700 focus:ring-2 focus:ring-brand-blue-cyan transition-all cursor-pointer w-full md:w-auto truncate hover:bg-gray-200"
                  >
                    {COMPANIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                    ))}
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 text-gray-400 pointer-events-none text-[10px]"></i>
                </div>
              </div>

              <div className="flex items-center gap-4 md:gap-8 shrink-0">
                 {/* Company Logo Display (Desktop) - REDUCIDO */}
                 <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1">Organización Actual</span>
                    <img 
                      src={selectedCompany.logo} 
                      alt={selectedCompany.name} 
                      className="h-10 object-contain object-right" 
                    />
                 </div>
                 <div className="w-px h-10 bg-gray-200 hidden md:block"></div>
                 <button className="p-3 text-gray-400 hover:text-brand-blue-cyan hover:bg-brand-blue-cyan/5 rounded-xl transition-all relative">
                    <i className="fa-solid fa-bell text-xl"></i>
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-brand-orange rounded-full ring-2 ring-white"></span>
                 </button>
              </div>
            </header>

            <section className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar w-full">
              <div className="max-w-7xl mx-auto w-full">
                {renderContent()}
              </div>
            </section>
          </main>
        </div>
      )}
    </>
  );
};

export default App;
