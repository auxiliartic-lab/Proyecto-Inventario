
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, pin);
      if (success) {
        addToast('Bienvenido al sistema', 'success');
      } else {
        addToast('Credenciales incorrectas', 'error');
        setPin(''); // Limpiar solo el PIN
      }
    } catch (error: any) {
      console.error("Login component caught error:", error);
      
      if (error.response && error.response.status === 404) {
          addToast('Error: No se encuentra el servicio de autenticación (Ruta /api/login no encontrada).', 'error');
      } else if (error.response && error.response.status === 401) {
          addToast('Credenciales incorrectas.', 'error');
          setPin('');
      } else if (error.code === 'ERR_NETWORK') {
          addToast('Error de red: No se pudo conectar al servidor backend (127.0.0.1:8000).', 'error');
      } else {
          addToast('Error de conexión o servidor', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-4">
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-brand-blue-cyan/20 rounded-full blur-[100px]"></div>
         <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-brand-blue-dark/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-blue-cyan/10 text-brand-blue-cyan rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-blue-cyan/20">
               <i className="fa-solid fa-layer-group text-3xl"></i>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Inventory System</h1>
            <p className="text-gray-500 text-sm mt-2">Inicie sesión para acceder a la gestión.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Usuario</label>
              <div className="relative">
                <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan transition-all font-medium text-gray-700 placeholder-gray-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">PIN de Acceso</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input 
                  type="password" 
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan transition-all font-bold text-gray-700 placeholder-gray-400 tracking-widest"
                  placeholder="••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 bg-brand-blue-cyan hover:bg-brand-blue-dark text-white font-bold rounded-xl shadow-lg shadow-brand-blue-cyan/30 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <i className="fa-solid fa-circle-notch fa-spin"></i>
              ) : (
                <>
                  <i className="fa-solid fa-right-to-bracket"></i> Ingresar
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
