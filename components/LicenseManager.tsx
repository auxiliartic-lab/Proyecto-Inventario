
import React, { useState, useEffect } from 'react';
import { Company, SoftwareLicense } from '../types';
import { getLicensesByCompany } from '../services/inventoryService';

interface LicenseManagerProps {
  company: Company;
}

const LicenseManager: React.FC<LicenseManagerProps> = ({ company }) => {
  const [licenses, setLicenses] = useState<SoftwareLicense[]>([]);

  useEffect(() => {
    setLicenses(getLicensesByCompany(company.id));
  }, [company]);

  const getStatusBadge = (status: SoftwareLicense['status']) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700';
      case 'Expiring Soon': return 'bg-amber-100 text-amber-700 animate-pulse';
      case 'Expired': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="animate-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Licencias de Software</h1>
        <p className="text-gray-500">Control de expiraciones y claves para {company.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {licenses.map((license) => (
          <div key={license.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className={`absolute top-0 right-0 p-4`}>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(license.status)}`}>
                {license.status}
              </span>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                 <i className="fa-solid fa-certificate text-2xl"></i>
               </div>
               <div>
                  <h3 className="font-bold text-gray-900 text-lg">{license.name}</h3>
                  <p className="text-sm text-gray-500">{license.type}</p>
               </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Clave de Activación</p>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold blur-[2px] group-hover:blur-none transition-all">{license.key}</span>
                  <button className="text-emerald-600 hover:text-emerald-700">
                    <i className="fa-solid fa-copy"></i>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                   <p className="text-[10px] uppercase font-bold text-gray-400">Expiración</p>
                   <p className="font-semibold text-gray-800">{new Date(license.expirationDate).toLocaleDateString()}</p>
                </div>
                <button className="text-sm font-bold text-emerald-600 hover:underline">Gestionar</button>
              </div>
            </div>
          </div>
        ))}
        
        <button className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-all gap-3 h-full min-h-[220px]">
          <i className="fa-solid fa-plus-circle text-3xl"></i>
          <span className="font-bold">Añadir Licencia</span>
        </button>
      </div>
    </div>
  );
};

export default LicenseManager;
