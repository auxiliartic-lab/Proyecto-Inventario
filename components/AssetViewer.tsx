
import React from 'react';
import { Equipment, EquipmentStatus, Attachment } from '../types';
import { useInventory } from '../context/InventoryContext';

interface AssetViewerProps {
  equipment: Equipment;
  onClose: () => void;
}

const AssetViewer: React.FC<AssetViewerProps> = ({ equipment, onClose }) => {
  const { data } = useInventory();
  
  const activeTicket = (data.maintenance || []).find(m => m.equipmentId === equipment.id && m.status === 'Open');
  const assignedUser = equipment.assignedTo ? data.collaborators.find(c => c.id === equipment.assignedTo) : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case EquipmentStatus.ACTIVE: return 'bg-green-100 text-green-700 border-green-200';
      case EquipmentStatus.MAINTENANCE: return 'bg-brand-yellow/10 text-yellow-700 border-yellow-200';
      case EquipmentStatus.RETIRED: return 'bg-gray-100 text-gray-500 border-gray-200';
      case EquipmentStatus.LOST: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto">
      <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header con Estado */}
            <div className="p-6 bg-gray-50 border-b border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(equipment.status)}`}>
                    {equipment.status}
                </span>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm hover:shadow transition-all">
                    <i className="fa-solid fa-times text-lg"></i>
                </button>
            </div>
            <h2 className="text-2xl font-black text-gray-900">{equipment.brand} {equipment.model}</h2>
            <p className="text-sm text-gray-500 font-mono mt-1">SN: {equipment.serialNumber}</p>
            </div>

            <div className="flex-1 p-6 space-y-6">
                
                {/* ALERTA MANTENIMIENTO */}
                {activeTicket && (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-200 animate-pulse-slow">
                        <div className="flex items-center gap-2 mb-2">
                            <i className="fa-solid fa-triangle-exclamation text-red-500"></i>
                            <h4 className="text-sm font-black text-red-700 uppercase">Mantenimiento Activo</h4>
                        </div>
                        <p className="font-bold text-gray-900 text-sm">{activeTicket.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{activeTicket.description}</p>
                    </div>
                )}

                {/* Asignación */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${assignedUser ? 'bg-brand-blue-dark' : 'bg-gray-300'}`}>
                    <i className={`fa-solid ${assignedUser ? 'fa-user' : 'fa-box-open'} text-lg`}></i>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {assignedUser ? 'Asignado A' : 'Estado'}
                    </p>
                    <p className="font-bold text-gray-900">
                        {assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : 'En Stock / Disponible'}
                    </p>
                    {assignedUser && <p className="text-xs text-gray-500">{assignedUser.area} - {assignedUser.cargo}</p>}
                </div>
                </div>

                {/* Specs Simplificadas */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="block text-[10px] text-gray-400 font-bold uppercase">Tipo</span>
                        <span className="font-bold text-gray-700">{equipment.type}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="block text-[10px] text-gray-400 font-bold uppercase">Ubicación</span>
                        <span className="font-bold text-gray-700 truncate">{equipment.location}</span>
                    </div>
                    {equipment.processor && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="block text-[10px] text-gray-400 font-bold uppercase">CPU</span>
                            <span className="font-bold text-gray-700 truncate">{equipment.processor}</span>
                        </div>
                    )}
                    {equipment.ram && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="block text-[10px] text-gray-400 font-bold uppercase">RAM</span>
                            <span className="font-bold text-gray-700 truncate">{equipment.ram}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button onClick={onClose} className="w-full py-3 bg-brand-blue-cyan text-white font-bold rounded-xl shadow-lg shadow-brand-blue-cyan/20 hover:bg-brand-blue-dark transition-all">
                    Cerrar Vista
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AssetViewer;
