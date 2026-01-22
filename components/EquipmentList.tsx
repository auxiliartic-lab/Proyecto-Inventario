
import React, { useState, useEffect } from 'react';
import { Company, Equipment, EquipmentStatus, UserRole } from '../types';
import { getEquipmentByCompany, addEquipment } from '../services/inventoryService';

interface EquipmentListProps {
  company: Company;
  role: UserRole;
}

const EquipmentList: React.FC<EquipmentListProps> = ({ company, role }) => {
  const [items, setItems] = useState<Equipment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setItems(getEquipmentByCompany(company.id));
  }, [company]);

  const filteredItems = items.filter(item => 
    item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: EquipmentStatus) => {
    switch (status) {
      case EquipmentStatus.ACTIVE: return 'bg-emerald-100 text-emerald-700';
      case EquipmentStatus.MAINTENANCE: return 'bg-amber-100 text-amber-700';
      case EquipmentStatus.RETIRED: return 'bg-gray-100 text-gray-700';
      case EquipmentStatus.LOST: return 'bg-red-100 text-red-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario de Equipos</h1>
          <p className="text-gray-500">Gestión de activos tecnológicos para {company.name}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              type="text" 
              placeholder="Buscar por serie o modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl shadow-lg shadow-emerald-900/20 font-semibold transition-all"
          >
            <i className="fa-solid fa-plus"></i>
            <span className="hidden sm:inline">Nuevo Equipo</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Equipo</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Marca / Modelo</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">No. Serie</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Asignado</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                        <i className={`fa-solid ${item.type === 'Servidor' ? 'fa-server' : 'fa-laptop'}`}></i>
                      </div>
                      <span className="font-semibold text-gray-900">{item.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900 font-medium">{item.brand}</p>
                    <p className="text-sm text-gray-500">{item.model}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-emerald-600">{item.serialNumber}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.assignedTo ? (
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white">BR</div>
                         <span className="text-sm text-gray-700">Bayron Ramos</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No asignado</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Editar">
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors" title="Mantenimiento">
                        <i className="fa-solid fa-screwdriver-wrench"></i>
                      </button>
                      <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Eliminar">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <i className="fa-solid fa-folder-open text-4xl mb-4 block"></i>
                    No se encontraron equipos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simple Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Nuevo Registro</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>
              
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Equipo</label>
                  <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500">
                    <option>Laptop</option>
                    <option>Desktop</option>
                    <option>Servidor</option>
                    <option>Switch/Router</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Marca</label>
                    <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej: Dell" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Modelo</label>
                    <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej: Latitude 5420" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Número de Serie</label>
                  <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="XXXX-XXXX" />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-colors">
                    Registrar Equipo
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

export default EquipmentList;
