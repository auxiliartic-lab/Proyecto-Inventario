
import React, { useState, useEffect } from 'react';
import { Company, Equipment, EquipmentStatus, UserRole, Collaborator, MaintenanceSeverity } from '../types';
import { getEquipmentByCompany, addEquipment, updateEquipment, getCollaboratorsByCompany, addMaintenanceRecord } from '../services/inventoryService';

interface EquipmentListProps {
  company: Company;
  role: UserRole;
}

const EquipmentList: React.FC<EquipmentListProps> = ({ company, role }) => {
  const [items, setItems] = useState<Equipment[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Modal de Mantenimiento
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState<boolean>(false);
  const [maintenanceItem, setMaintenanceItem] = useState<Equipment | null>(null);
  const [maintenanceData, setMaintenanceData] = useState({
    title: '',
    description: '',
    severity: 'Moderate' as MaintenanceSeverity
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Estado inicial del formulario totalmente definido
  const initialFormData: Partial<Equipment> = {
    type: 'Laptop',
    brand: '',
    model: '',
    serialNumber: '',
    status: EquipmentStatus.ACTIVE,
    location: '',
    processor: '',
    ram: '',
    storage: '',
    os: '',
    assignedTo: undefined
  };

  const [formData, setFormData] = useState<Partial<Equipment>>(initialFormData);

  useEffect(() => {
    setItems(getEquipmentByCompany(company.id));
    setCollaborators(getCollaboratorsByCompany(company.id).filter(c => c.isActive));
  }, [company]);

  const filteredItems = items.filter(item => 
    item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: EquipmentStatus) => {
    switch (status) {
      case EquipmentStatus.ACTIVE: return 'bg-brand-green-light/20 text-brand-green-dark';
      case EquipmentStatus.MAINTENANCE: return 'bg-brand-yellow/20 text-amber-700';
      case EquipmentStatus.RETIRED: return 'bg-gray-100 text-gray-700';
      case EquipmentStatus.LOST: return 'bg-red-100 text-red-700';
      default: return 'bg-brand-blue-cyan/10 text-brand-blue-dark';
    }
  };

  const handleOpenModal = (item?: Equipment) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ ...item });
    } else {
      setEditingId(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const handleOpenMaintenance = (item: Equipment) => {
    setMaintenanceItem(item);
    setMaintenanceData({ title: '', description: '', severity: 'Moderate' });
    setIsMaintenanceModalOpen(true);
  };

  const handleSubmitMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceItem) return;

    addMaintenanceRecord({
      companyId: company.id,
      equipmentId: maintenanceItem.id,
      date: new Date().toISOString().split('T')[0],
      title: maintenanceData.title,
      description: maintenanceData.description,
      severity: maintenanceData.severity,
      status: 'Open',
      technician: role === UserRole.TECHNICIAN ? 'Técnico Actual' : 'Por Asignar'
    });

    // Refrescar lista de equipos porque el estado habrá cambiado
    setItems(getEquipmentByCompany(company.id));
    setIsMaintenanceModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brand || !formData.model || !formData.serialNumber) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    if (editingId) {
      // Logica de Actualización
      const updatedEquipment: Equipment = {
        ...(formData as Equipment),
        id: editingId,
        companyId: company.id
      };
      updateEquipment(updatedEquipment);
    } else {
      // Lógica de Creación
      const equipmentToSave: Omit<Equipment, 'id'> = {
        type: formData.type || 'Laptop',
        brand: formData.brand || '',
        model: formData.model || '',
        serialNumber: formData.serialNumber || '',
        status: formData.status || EquipmentStatus.ACTIVE,
        location: formData.location || '',
        processor: formData.processor,
        ram: formData.ram,
        storage: formData.storage,
        os: formData.os,
        assignedTo: formData.assignedTo,
        companyId: company.id,
        siteId: 1,
        purchaseDate: new Date().toISOString().split('T')[0]
      };
      addEquipment(equipmentToSave);
    }

    // Refrescar lista y cerrar modal
    setItems(getEquipmentByCompany(company.id));
    setIsModalOpen(false);
    setFormData(initialFormData);
    setEditingId(null);
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Inventario de Equipos</h1>
          <p className="text-gray-500 text-sm font-medium">Gestión de activos tecnológicos para {company.name}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              type="text" 
              placeholder="Buscar serie o modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-brand-blue-cyan/10 focus:border-brand-blue-cyan transition-all outline-none text-sm"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 bg-brand-blue-cyan hover:bg-brand-blue-dark text-white px-6 py-2.5 rounded-xl shadow-lg shadow-brand-blue-cyan/10 font-bold text-sm transition-all shrink-0"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Nuevo Equipo</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Activo</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Marca / Modelo</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell">Especificaciones</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">No. Serie</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asignado</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group text-sm">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 group-hover:bg-brand-blue-cyan/10 group-hover:text-brand-blue-cyan transition-colors">
                        <i className={`fa-solid ${item.type === 'Servidor' ? 'fa-server' : item.type === 'Laptop' ? 'fa-laptop' : 'fa-desktop'}`}></i>
                      </div>
                      <span className="font-bold text-gray-900">{item.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900 font-bold">{item.brand}</p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase">{item.model}</p>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="text-[10px] text-gray-500 space-y-0.5">
                      {item.processor && <p><span className="font-bold text-gray-400">CPU:</span> {item.processor}</p>}
                      {item.ram && <p><span className="font-bold text-gray-400">RAM:</span> {item.ram} | <span className="font-bold text-gray-400">SSD:</span> {item.storage}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-[11px] font-black text-brand-blue-dark bg-brand-blue-cyan/10 px-2 py-1 rounded-lg">{item.serialNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${getStatusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.assignedTo ? (
                      <div className="flex items-center gap-2">
                         <div className="w-7 h-7 rounded-full bg-brand-blue-dark flex items-center justify-center text-[10px] font-black text-white shadow-sm shrink-0">
                           {collaborators.find(c => c.id === item.assignedTo)?.firstName.charAt(0) || '?'}
                         </div>
                         <div className="min-w-0">
                           <p className="text-xs font-bold text-gray-700 truncate">
                             {collaborators.find(c => c.id === item.assignedTo)?.firstName} {collaborators.find(c => c.id === item.assignedTo)?.lastName}
                           </p>
                         </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider italic">No asignado</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(item)}
                        className="p-2 hover:bg-brand-blue-cyan/10 text-brand-blue-cyan rounded-xl transition-all" 
                        title="Editar Equipo"
                      >
                        <i className="fa-solid fa-pen-to-square text-sm"></i>
                      </button>
                      <button 
                        onClick={() => handleOpenMaintenance(item)}
                        className="p-2 hover:bg-brand-yellow/10 text-brand-yellow rounded-xl transition-all" 
                        title="Enviar a Mantenimiento"
                      >
                        <i className="fa-solid fa-screwdriver-wrench text-sm"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <i className="fa-solid fa-folder-open text-2xl text-gray-300"></i>
            </div>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">No se encontraron equipos</p>
          </div>
        )}
      </div>

      {/* MODAL DE MANTENIMIENTO */}
      {isMaintenanceModalOpen && maintenanceItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Reportar Falla</h2>
                    <p className="text-sm text-gray-500">Equipo: {maintenanceItem.brand} {maintenanceItem.model}</p>
                  </div>
                  <button onClick={() => setIsMaintenanceModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <i className="fa-solid fa-times text-xl"></i>
                  </button>
                </div>

                <form onSubmit={handleSubmitMaintenance} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Problema (Título)</label>
                    <input 
                      required
                      type="text" 
                      value={maintenanceData.title}
                      onChange={e => setMaintenanceData({...maintenanceData, title: e.target.value})}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-yellow" 
                      placeholder="Ej: Pantalla rota, No enciende..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Descripción Detallada</label>
                    <textarea 
                      required
                      value={maintenanceData.description}
                      onChange={e => setMaintenanceData({...maintenanceData, description: e.target.value})}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-yellow h-24 resize-none" 
                      placeholder="Describa cómo ocurrió la falla..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Gravedad del Daño</label>
                    <div className="grid grid-cols-1 gap-3">
                      
                      {/* Opción Moderado */}
                      <label className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-4 transition-all ${maintenanceData.severity === 'Moderate' ? 'border-brand-yellow bg-brand-yellow/5' : 'border-gray-100 hover:bg-gray-50'}`}>
                         <input 
                            type="radio" 
                            name="severity" 
                            value="Moderate" 
                            checked={maintenanceData.severity === 'Moderate'}
                            onChange={() => setMaintenanceData({...maintenanceData, severity: 'Moderate'})}
                            className="hidden" 
                         />
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${maintenanceData.severity === 'Moderate' ? 'bg-brand-yellow text-white' : 'bg-gray-200 text-gray-400'}`}>
                            <i className="fa-solid fa-triangle-exclamation"></i>
                         </div>
                         <div>
                            <p className="font-bold text-gray-900">Moderado</p>
                            <p className="text-xs text-gray-500">Mantenimiento preventivo o fallas leves.</p>
                         </div>
                      </label>

                      {/* Opción Severo */}
                      <label className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-4 transition-all ${maintenanceData.severity === 'Severe' ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                         <input 
                            type="radio" 
                            name="severity" 
                            value="Severe" 
                            checked={maintenanceData.severity === 'Severe'}
                            onChange={() => setMaintenanceData({...maintenanceData, severity: 'Severe'})}
                            className="hidden" 
                         />
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${maintenanceData.severity === 'Severe' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                            <i className="fa-solid fa-temperature-arrow-up"></i>
                         </div>
                         <div>
                            <p className="font-bold text-gray-900">Severo</p>
                            <p className="text-xs text-gray-500">El equipo no funciona o riesgo de seguridad.</p>
                         </div>
                      </label>

                      {/* Opción Pérdida Total */}
                      <label className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-4 transition-all ${maintenanceData.severity === 'TotalLoss' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-100 hover:bg-gray-50'}`}>
                         <input 
                            type="radio" 
                            name="severity" 
                            value="TotalLoss" 
                            checked={maintenanceData.severity === 'TotalLoss'}
                            onChange={() => setMaintenanceData({...maintenanceData, severity: 'TotalLoss'})}
                            className="hidden" 
                         />
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${maintenanceData.severity === 'TotalLoss' ? 'bg-white text-gray-900' : 'bg-gray-200 text-gray-400'}`}>
                            <i className="fa-solid fa-skull"></i>
                         </div>
                         <div>
                            <p className={`font-bold ${maintenanceData.severity === 'TotalLoss' ? 'text-white' : 'text-gray-900'}`}>Pérdida Total</p>
                            <p className={`text-xs ${maintenanceData.severity === 'TotalLoss' ? 'text-gray-400' : 'text-gray-500'}`}>Equipo irrecuperable. Se dará de baja.</p>
                         </div>
                      </label>

                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setIsMaintenanceModalOpen(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all">
                      Cancelar
                    </button>
                    <button type="submit" className="flex-1 py-3 bg-brand-blue-cyan hover:bg-brand-blue-dark text-white font-bold rounded-xl shadow-lg shadow-brand-blue-cyan/20 transition-all">
                      Enviar Reporte
                    </button>
                  </div>
                </form>
             </div>
          </div>
        </div>
      )}

      {/* MODAL DE REGISTRO / EDICION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {editingId ? 'Editar Equipo' : 'Registro de Equipo'}
                  </h2>
                  <p className="text-sm text-gray-500 font-medium">
                    {editingId ? 'Actualiza la información del activo.' : `Ingresa las especificaciones técnicas del activo para ${company.name}.`}
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Tipo de Equipo</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue-cyan/10 focus:border-brand-blue-cyan font-bold text-sm transition-all"
                    >
                      <option value="Laptop">Laptop</option>
                      <option value="Desktop">Desktop</option>
                      <option value="Servidor">Servidor</option>
                      <option value="Tablet">Tablet</option>
                      <option value="Smartphone">Smartphone</option>
                      <option value="Periférico">Periférico</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Número de Serie</label>
                    <input 
                      type="text" 
                      required
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue-cyan/10 focus:border-brand-blue-cyan font-bold text-sm transition-all" 
                      placeholder="DL-XXXXXXXX" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Marca</label>
                    <input 
                      type="text" 
                      required
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue-cyan/10 focus:border-brand-blue-cyan font-bold text-sm transition-all" 
                      placeholder="Dell, HP, Apple..." 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Modelo</label>
                    <input 
                      type="text" 
                      required
                      value={formData.model}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue-cyan/10 focus:border-brand-blue-cyan font-bold text-sm transition-all" 
                      placeholder="Latitude, ProLiant, etc." 
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                    <i className="fa-solid fa-microchip text-brand-blue-cyan"></i>
                    Características Técnicas
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5">Procesador</label>
                      <input 
                        type="text" 
                        value={formData.processor}
                        onChange={(e) => setFormData({...formData, processor: e.target.value})}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-bold" 
                        placeholder="i7-12700H" 
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5">Memoria RAM</label>
                      <input 
                        type="text" 
                        value={formData.ram}
                        onChange={(e) => setFormData({...formData, ram: e.target.value})}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-bold" 
                        placeholder="16GB DDR5" 
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5">Almacenamiento</label>
                      <input 
                        type="text" 
                        value={formData.storage}
                        onChange={(e) => setFormData({...formData, storage: e.target.value})}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-bold" 
                        placeholder="1TB NVMe" 
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5">Sist. Operativo</label>
                      <input 
                        type="text" 
                        value={formData.os}
                        onChange={(e) => setFormData({...formData, os: e.target.value})}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-bold" 
                        placeholder="Windows 11 Pro" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Estado</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as EquipmentStatus})}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue-cyan/10 focus:border-brand-blue-cyan font-bold text-sm transition-all"
                    >
                      <option value={EquipmentStatus.ACTIVE}>{EquipmentStatus.ACTIVE}</option>
                      <option value={EquipmentStatus.MAINTENANCE}>{EquipmentStatus.MAINTENANCE}</option>
                      <option value={EquipmentStatus.RETIRED}>{EquipmentStatus.RETIRED}</option>
                      <option value={EquipmentStatus.LOST}>{EquipmentStatus.LOST}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Asignar a Colaborador</label>
                    <select 
                      value={formData.assignedTo || ''}
                      onChange={(e) => setFormData({...formData, assignedTo: e.target.value ? Number(e.target.value) : undefined})}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue-cyan/10 focus:border-brand-blue-cyan font-bold text-sm transition-all"
                    >
                      <option value="">-- Sin Asignar (Equipo en Stock) --</option>
                      {collaborators.map(c => (
                        <option key={c.id} value={c.id}>{c.firstName} {c.lastName} | {c.cargo}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black text-xs uppercase tracking-widest rounded-xl transition-all">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-3.5 bg-brand-blue-cyan hover:bg-brand-blue-dark text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-brand-blue-cyan/20 transition-all">
                    {editingId ? 'Guardar Cambios' : 'Registrar Activo'}
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
