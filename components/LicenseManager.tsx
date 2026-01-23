
import React, { useState, useEffect } from 'react';
import { Company, SoftwareLicense } from '../types';
import { getLicensesByCompany, addLicense, deleteLicense } from '../services/inventoryService';

interface LicenseManagerProps {
  company: Company;
}

type LicenseStatus = 'Active' | 'Warning' | 'Critical';

const LicenseManager: React.FC<LicenseManagerProps> = ({ company }) => {
  const [licenses, setLicenses] = useState<SoftwareLicense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<'All' | 'Priority'>('All');
  
  const [formData, setFormData] = useState<Partial<SoftwareLicense>>({
    name: '',
    vendor: '',
    key: '',
    type: 'Suscripción',
    startDate: '',
    expirationDate: ''
  });

  useEffect(() => {
    setLicenses(getLicensesByCompany(company.id));
  }, [company]);

  // Lógica del Semáforo
  const calculateStatus = (expirationDate: string): LicenseStatus => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) return 'Critical';
    if (diffDays <= 30) return 'Warning';
    return 'Active';
  };

  const getStatusConfig = (status: LicenseStatus) => {
    switch (status) {
      case 'Active': 
        return { label: 'Activo', classes: 'bg-green-100 text-green-700 border-green-200', icon: 'fa-check-circle' };
      case 'Warning': 
        return { label: 'Alerta Preventiva', classes: 'bg-yellow-100 text-yellow-700 border-yellow-200 animate-pulse', icon: 'fa-triangle-exclamation' };
      case 'Critical': 
        return { label: 'Vencido / Crítico', classes: 'bg-red-100 text-red-700 border-red-200', icon: 'fa-circle-xmark' };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.expirationDate && formData.vendor) {
      addLicense({
        companyId: company.id,
        name: formData.name,
        vendor: formData.vendor,
        key: formData.key || 'N/A',
        type: formData.type || 'Suscripción',
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        expirationDate: formData.expirationDate
      } as Omit<SoftwareLicense, 'id'>);
      
      setLicenses(getLicensesByCompany(company.id));
      setIsModalOpen(false);
      setFormData({ name: '', vendor: '', key: '', type: 'Suscripción', startDate: '', expirationDate: '' });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Eliminar esta licencia?')) {
      deleteLicense(id);
      setLicenses(getLicensesByCompany(company.id));
    }
  };

  const filteredLicenses = licenses.filter(license => {
    if (filterMode === 'All') return true;
    const status = calculateStatus(license.expirationDate);
    return status === 'Critical' || status === 'Warning';
  });

  return (
    <div className="animate-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Licencias de Software</h1>
          <p className="text-gray-500">Control de expiraciones y claves para {company.name}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
           <div className="bg-white border border-gray-200 rounded-xl p-1 flex w-full md:w-auto">
              <button 
                onClick={() => setFilterMode('All')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterMode === 'All' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Todas
              </button>
              <button 
                onClick={() => setFilterMode('Priority')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${filterMode === 'Priority' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <i className="fa-solid fa-bell"></i>
                Vencimientos
              </button>
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="w-full md:w-auto bg-brand-blue-cyan text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-blue-dark transition-all shadow-lg shadow-brand-blue-cyan/10 flex items-center justify-center gap-2 shrink-0"
           >
             <i className="fa-solid fa-plus"></i>
             <span>Nueva Licencia</span>
           </button>
        </div>
      </div>

      {/* VISTA ESCRITORIO (TABLA) */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Software / Proveedor</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Clave</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vigencia</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLicenses.map((license) => {
                const status = calculateStatus(license.expirationDate);
                const statusConfig = getStatusConfig(status);

                return (
                  <tr key={license.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <div>
                         <p className="font-bold text-gray-900 text-sm">{license.name}</p>
                         <p className="text-xs text-gray-500">{license.vendor}</p>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                         <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-600 break-all max-w-[200px]">{license.key}</code>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-xs">
                          <p className="text-gray-400 mb-0.5">Expira:</p>
                          <p className={`font-bold ${status === 'Critical' ? 'text-red-600' : 'text-gray-800'}`}>
                            {new Date(license.expirationDate).toLocaleDateString()}
                          </p>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig.classes}`}>
                          <i className={`fa-solid ${statusConfig.icon} text-xs`}></i>
                          <span className="text-[10px] font-black uppercase tracking-tight">{statusConfig.label}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => handleDelete(license.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <i className="fa-solid fa-trash-can"></i>
                       </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* VISTA MÓVIL (TARJETAS) */}
      <div className="md:hidden space-y-4">
         {filteredLicenses.map((license) => {
            const status = calculateStatus(license.expirationDate);
            const statusConfig = getStatusConfig(status);

            return (
              <div key={license.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-gray-900">{license.name}</p>
                      <p className="text-xs text-gray-500">{license.vendor}</p>
                    </div>
                    <button onClick={() => handleDelete(license.id)} className="text-gray-300 hover:text-red-500 p-1">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                 </div>

                 <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Serial / Key</p>
                      {/* break-all fuerza el salto de línea en claves largas */}
                      <code className="bg-gray-50 block p-2 rounded text-xs font-mono text-gray-700 break-all">{license.key}</code>
                    </div>
                    
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                       <div className="text-xs">
                          <p className="text-gray-400">Vence</p>
                          <p className={`font-bold ${status === 'Critical' ? 'text-red-600' : 'text-gray-800'}`}>
                            {new Date(license.expirationDate).toLocaleDateString()}
                          </p>
                       </div>
                       <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig.classes}`}>
                          <i className={`fa-solid ${statusConfig.icon} text-xs`}></i>
                          <span className="text-[10px] font-black uppercase tracking-tight">{statusConfig.label}</span>
                       </div>
                    </div>
                 </div>
              </div>
            );
         })}
      </div>

      {filteredLicenses.length === 0 && (
           <div className="p-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                 <i className="fa-solid fa-check text-2xl"></i>
              </div>
              <p className="text-gray-500 font-medium">No hay licencias que mostrar con este filtro.</p>
           </div>
      )}

      {/* MODAL NUEVA LICENCIA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900">Registrar Licencia</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nombre del Software</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan" 
                    placeholder="Ej: Microsoft Office 365"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Proveedor</label>
                      <input 
                        required
                        type="text" 
                        value={formData.vendor}
                        onChange={e => setFormData({...formData, vendor: e.target.value})}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan" 
                        placeholder="Ej: Microsoft"
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tipo</label>
                      <select 
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan appearance-none" 
                      >
                        <option value="Suscripción">Suscripción</option>
                        <option value="Perpetua">Perpetua</option>
                        <option value="Anual">Anual</option>
                        <option value="Gratuita">Gratuita/Open Source</option>
                      </select>
                   </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Clave / Serial</label>
                  <input 
                    type="text" 
                    value={formData.key}
                    onChange={e => setFormData({...formData, key: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan font-mono text-sm" 
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Fecha Inicio</label>
                    <input 
                      required
                      type="date" 
                      value={formData.startDate}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Fecha Expiración</label>
                    <input 
                      required
                      type="date" 
                      value={formData.expirationDate}
                      onChange={e => setFormData({...formData, expirationDate: e.target.value})}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan" 
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-3 bg-brand-blue-cyan hover:bg-brand-blue-dark text-white font-bold rounded-xl shadow-lg shadow-brand-blue-cyan/20 transition-all">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicenseManager;
