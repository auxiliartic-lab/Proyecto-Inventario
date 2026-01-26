
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
import SecurityLock from './components/SecurityLock';

// Configuración de Seguridad
const INACTIVITY_LIMIT_MS = 5 * 60 * 1000; // 5 minutos

// ==========================================
// 🔐 SEGURIDAD: CAMBIA LA CONTRASEÑA AQUÍ
// ==========================================
const MASTER_PIN = '1234'; 
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
      // Ajuste automático al redimensionar: 
      // Si bajamos de 768px, cerramos sidebar. Si subimos, lo abrimos.
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
      case 'reports':
        return <ReportsModule company={selectedCompany} />;
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
          
          {/* 
             OVERLAY PARA MÓVILES (Backdrop)
             - Solo visible en móvil (< md) cuando el sidebar está abierto.
             - Z-index 40 para estar debajo del sidebar (Z-50) pero sobre el contenido.
          */}
          <div 
            className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
              isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* 
             SIDEBAR RESPONSIVE 
             - Mobile: Fixed, inset-y-0, left-0. Funciona como Drawer.
             - Desktop: Relative. Funciona como columna colapsable.
             - Clases dinámicas: Usamos translate para moverlo fuera de pantalla en móvil.
          */}
          <aside 
            className={`fixed md:relative inset-y-0 left-0 z-50 h-full flex flex-col bg-gray-900 text-white shadow-2xl transition-all duration-300 ease-in-out
              ${isSidebarOpen 
                ? 'translate-x-0 w-80' /* Abierto: Posición original, ancho completo */
                : '-translate-x-full md:translate-x-0 w-80 md:w-24' /* Cerrado: Fuera en móvil, Ancho mini en Desktop */
              }
            `}
          >
            {/* Header del Sidebar con Logo de Carpeta (Inventory) */}
            <div className={`flex flex-col items-center border-b border-gray-800 transition-all duration-300 ${isSidebarOpen ? 'p-6 gap-4' : 'p-4 justify-center'}`}>
              
              {/* Contenedor del Logo */}
              <div className={`bg-gradient-to-br from-brand-blue-cyan to-brand-blue-dark rounded-full flex items-center justify-center shadow-lg shadow-brand-blue-cyan/20 transition-all duration-300 mx-auto ${
                  isSidebarOpen 
                    ? 'w-16 h-16' 
                    : 'w-10 h-10' 
                }`}>
                 <i className={`fa-solid fa-folder-tree text-white ${isSidebarOpen ? 'text-2xl' : 'text-sm'}`}></i>
              </div>

              {/* Título de la App (Solo visible si abierto) */}
              <div className={`text-center transition-all duration-300 ${isSidebarOpen ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                  <span className="block font-bold text-xl tracking-tight text-white whitespace-nowrap">Inventory</span>
                  <span className="block text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-0.5 whitespace-nowrap">Gestión Multisede v2.0</span>
              </div>
            </div>

            {/* Navegación */}
            <nav className="mt-6 space-y-1.5 px-4 flex-1 overflow-y-auto custom-scrollbar">
              {NAVIGATION_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    // En móvil, cerramos el menú al seleccionar una opción
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all whitespace-nowrap group relative overflow-hidden ${
                    activeTab === item.id 
                      ? 'bg-brand-blue-cyan text-white shadow-lg shadow-brand-blue-cyan/20' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  } ${!isSidebarOpen && 'md:justify-center md:px-0'}`}
                  title={!isSidebarOpen ? item.label : ''}
                >
                  <i className={`fa-solid ${item.icon} w-6 text-center text-lg shrink-0 ${!isSidebarOpen && activeTab !== item.id && 'group-hover:text-brand-blue-cyan'}`}></i>
                  
                  {/* Texto del botón con transición de opacidad para el modo colapsado */}
                  <span className={`font-medium text-sm transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>

            {/* Footer del Sidebar */}
            <div className={`border-t border-gray-800 transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'p-6 bg-gray-900/50' : 'py-6'}`}>
              {isSidebarOpen ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                 <div className="flex flex-col items-center gap-6">
                    <button onClick={handleLockSession} className="text-gray-500 hover:text-brand-yellow transition-colors" title="Bloquear"><i className="fa-solid fa-lock text-lg"></i></button>
                    <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors" title="Salir"><i className="fa-solid fa-right-from-bracket text-lg"></i></button>
                 </div>
              )}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0 w-full h-full relative bg-gray-50">
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm gap-4">
              
              {/* Left Side: Hamburger + Company Selector */}
              {/* Contenedor flexible que toma el espacio disponible en móvil */}
              <div className="flex items-center gap-2 md:gap-6 flex-1 md:flex-none max-w-full md:max-w-[60%] min-w-0">
                {/* Botón Hamburguesa */}
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="text-gray-500 hover:text-brand-blue-cyan transition-colors p-2 hover:bg-brand-blue-cyan/5 rounded-xl active:scale-95 transform duration-100 shrink-0"
                  aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
                >
                  <i className={`fa-solid ${isSidebarOpen ? 'fa-bars-staggered' : 'fa-bars'} text-xl`}></i>
                </button>
                
                {/* Selector de Empresa Responsive */}
                <div className="relative group flex items-center flex-1 min-w-0 max-w-full">
                  <i className="fa-solid fa-building absolute left-3 z-10 text-gray-400 text-xs pointer-events-none"></i>
                  <select 
                    value={selectedCompany.id}
                    onChange={(e) => {
                      const company = COMPANIES.find(c => c.id === Number(e.target.value));
                      if (company) setSelectedCompany(company);
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

              {/* Right Side: Logo Only */}
              <div className="flex items-center gap-3 md:gap-8 shrink-0">
                 {/* Company Logo Display (Desktop) */}
                 <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1">Organización Actual</span>
                    <img 
                      src={selectedCompany.logo} 
                      alt={selectedCompany.name} 
                      className="h-10 object-contain object-right" 
                    />
                 </div>
                 
                 {/* Mobile Logo (Icon only) - Para optimizar espacio en móviles */}
                 <div className="md:hidden w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                    <img src={selectedCompany.logo} alt="Logo" className="w-5 h-5 object-contain" />
                 </div>
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
