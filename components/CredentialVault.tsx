
import React, { useState } from 'react';
import { Company } from '../types';

interface CredentialVaultProps {
  company: Company;
}

const CredentialVault: React.FC<CredentialVaultProps> = ({ company }) => {
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({});

  const toggleVisibility = (id: number) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const credentials = [
    { id: 1, service: 'Consola AWS', user: 'admin_it', pass: '*********' },
    { id: 2, service: 'Panel Hosting', user: 'webmaster', pass: '*********' },
    { id: 3, service: 'Router Principal', user: 'root', pass: '*********' }
  ];

  return (
    <div className="animate-in zoom-in-95 duration-500">
      <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-6">
        <div className="bg-red-500 w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-200">
          <i className="fa-solid fa-shield-halved text-2xl"></i>
        </div>
        <div>
           <h2 className="text-red-900 font-bold text-lg">Zona de Alta Seguridad</h2>
           <p className="text-red-700 text-sm">El acceso a estas credenciales está auditado. Solo personal autorizado debe ver esta información.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
           <h3 className="font-bold text-gray-900">Almacén de Credenciales</h3>
           <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
              <i className="fa-solid fa-key"></i>
              Nueva Credencial
           </button>
        </div>
        
        <div className="divide-y divide-gray-100">
          {credentials.map(cred => (
            <div key={cred.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                    <i className="fa-solid fa-vault"></i>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{cred.service}</p>
                    <p className="text-sm text-gray-500">Usuario: <span className="font-semibold">{cred.user}</span></p>
                  </div>
               </div>

               <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-xl border border-gray-200">
                  <span className={`font-mono text-sm px-4 ${showPassword[cred.id] ? 'text-gray-900' : 'text-gray-400 select-none'}`}>
                    {showPassword[cred.id] ? 'SafeP@ss2026!' : '••••••••••••'}
                  </span>
                  <button 
                    onClick={() => toggleVisibility(cred.id)}
                    className="p-2 hover:bg-white rounded-lg transition-all text-emerald-600"
                  >
                    <i className={`fa-solid ${showPassword[cred.id] ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CredentialVault;
