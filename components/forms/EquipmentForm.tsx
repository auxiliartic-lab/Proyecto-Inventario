
import React, { useState, useEffect } from 'react';
import { Equipment, EquipmentStatus, Collaborator } from '../../types';

// Datos de sugerencias (Movidos desde EquipmentList)
const SUGGESTIONS_DB = {
  brands: {
    Computer: ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer', 'Microsoft', 'Samsung', 'MSI'],
    Server: ['Dell', 'HP', 'Lenovo', 'Cisco', 'IBM', 'Huawei', 'Supermicro'],
    Mobile: ['Apple', 'Samsung', 'Xiaomi', 'Motorola', 'Huawei', 'Google', 'Zebra', 'Oppo'],
    Peripheral: ['Logitech', 'Genius', 'Microsoft', 'Epson', 'Zebra', 'Cisco', 'Sony', 'LG', 'ViewSonic', 'HP', 'Canon', 'Jabra', 'Poly']
  },
  processors: {
    Computer: [
      'Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 
      'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9',
      'Apple M1', 'Apple M1 Pro', 'Apple M1 Max', 
      'Apple M2', 'Apple M2 Pro', 'Apple M2 Max',
      'Apple M3', 'Apple M3 Pro', 'Apple M3 Max'
    ],
    Server: [
        'Intel Xeon E-2300', 'Intel Xeon Silver 4310', 'Intel Xeon Gold 5317', 'Intel Xeon Platinum', 
        'AMD EPYC 7003', 'AMD EPYC 9004', 'Intel Xeon Scalable'
    ],
    Mobile: [
        'Apple A14 Bionic', 'Apple A15 Bionic', 'Apple A16 Bionic', 'Apple A17 Pro',
        'Snapdragon 8 Gen 2', 'Snapdragon 8 Gen 1', 'Snapdragon 778G', 'Snapdragon 680',
        'Samsung Exynos 2200', 'Google Tensor G2', 'MediaTek Dimensity 9000'
    ]
  },
  os: {
    Computer: [
        'Windows 10 Pro', 'Windows 11 Pro', 'Windows 11 Home', 
        'macOS Sonoma', 'macOS Ventura', 'macOS Monterey',
        'Ubuntu 22.04 LTS', 'Linux Mint'
    ],
    Server: [
        'Windows Server 2016', 'Windows Server 2019', 'Windows Server 2022', 
        'Red Hat Enterprise Linux 8', 'Red Hat Enterprise Linux 9', 
        'Ubuntu Server 22.04', 'Debian 11', 'VMware ESXi'
    ],
    Mobile: [
        'Android 12', 'Android 13', 'Android 14', 
        'iOS 15', 'iOS 16', 'iOS 17', 
        'iPadOS 16', 'iPadOS 17'
    ]
  },
  ram: {
      Computer: ['8GB', '16GB', '32GB', '64GB'],
      Server: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB ECC'],
      Mobile: ['4GB', '6GB', '8GB', '12GB']
  },
  storage: {
      Computer: ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'],
      Server: ['2x 480GB SSD RAID1', '3x 960GB SSD RAID5', '4TB HDD', '8TB HDD'],
      Mobile: ['64GB', '128GB', '256GB', '512GB', '1TB']
  },
  peripheralTypes: [
    'Monitor', 'Teclado', 'Mouse', 'Headset', 'Webcam', 
    'Impresora', 'Scanner', 'Docking Station', 'Proyector', 
    'Disco Externo', 'Hub USB', 'Parlantes', 'Micrófono'
  ]
};

interface EquipmentFormProps {
  initialData?: Partial<Equipment>;
  onSubmit: (data: Partial<Equipment>) => void;
  onCancel: () => void;
  collaborators: Collaborator[];
  isEditing: boolean;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  collaborators, 
  isEditing 
}) => {
  const defaultData: Partial<Equipment> = {
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
    assignedTo: undefined,
    peripheralType: ''
  };

  const [formData, setFormData] = useState<Partial<Equipment>>(initialData || defaultData);

  const getCategoryFromType = (type: string): 'Computer' | 'Server' | 'Mobile' | 'Peripheral' => {
     if (['Laptop', 'Desktop'].includes(type)) return 'Computer';
     if (type === 'Servidor') return 'Server';
     if (['Tablet', 'Smartphone'].includes(type)) return 'Mobile';
     return 'Peripheral';
  };

  const currentCategory = getCategoryFromType(formData.type || 'Laptop');
  
  const activeBrands = SUGGESTIONS_DB.brands[currentCategory];
  const activeProcessors = currentCategory !== 'Peripheral' ? SUGGESTIONS_DB.processors[currentCategory] : [];
  const activeOs = currentCategory !== 'Peripheral' ? SUGGESTIONS_DB.os[currentCategory] : [];
  const activeRam = currentCategory !== 'Peripheral' ? SUGGESTIONS_DB.ram[currentCategory] : [];
  const activeStorage = currentCategory !== 'Peripheral' ? SUGGESTIONS_DB.storage[currentCategory] : [];

  const showComputerSpecs = ['Laptop', 'Desktop', 'Servidor'].includes(formData.type || 'Laptop');
  const showMobileSpecs = ['Tablet', 'Smartphone'].includes(formData.type || 'Laptop');
  const showSpecsSection = showComputerSpecs || showMobileSpecs;
  const showPeripheralSpecs = formData.type === 'Periférico';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Limpieza de datos según el tipo
    const cleanedData = { ...formData };
    if (formData.type === 'Periférico') {
      cleanedData.processor = '';
      cleanedData.ram = '';
      cleanedData.storage = '';
      cleanedData.os = '';
    } else {
      cleanedData.peripheralType = '';
    }
    onSubmit(cleanedData);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <datalist id="brandsOptions">
        {activeBrands.map(b => <option key={b} value={b} />)}
      </datalist>
      <datalist id="processorsOptions">
        {activeProcessors.map(p => <option key={p} value={p} />)}
      </datalist>
      <datalist id="ramOptions">
        {activeRam.map(r => <option key={r} value={r} />)}
      </datalist>
      <datalist id="storageOptions">
        {activeStorage.map(s => <option key={s} value={s} />)}
      </datalist>
      <datalist id="osOptions">
        {activeOs.map(o => <option key={o} value={o} />)}
      </datalist>
      <datalist id="peripheralTypeOptions">
        {SUGGESTIONS_DB.peripheralTypes.map(p => <option key={p} value={p} />)}
      </datalist>

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
            list="brandsOptions"
            required
            value={formData.brand}
            onChange={(e) => setFormData({...formData, brand: e.target.value})}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue-cyan/10 focus:border-brand-blue-cyan font-bold text-sm transition-all" 
            placeholder="Seleccionar o escribir..." 
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

      {showPeripheralSpecs && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
            <i className="fa-solid fa-keyboard text-brand-blue-cyan"></i>
            Detalles del Dispositivo
          </h3>
          <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5">Tipo de Periférico</label>
              <input 
                type="text"
                list="peripheralTypeOptions"
                value={formData.peripheralType}
                onChange={(e) => setFormData({...formData, peripheralType: e.target.value})}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-bold focus:border-brand-blue-cyan transition-colors" 
                placeholder="Ej: Mouse, Monitor, Teclado..." 
              />
          </div>
        </div>
      )}

      {showSpecsSection && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
            <i className="fa-solid fa-microchip text-brand-blue-cyan"></i>
            Características Técnicas
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {showComputerSpecs && (
              <>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5">Procesador</label>
                  <input 
                    type="text"
                    list="processorsOptions"
                    value={formData.processor}
                    onChange={(e) => setFormData({...formData, processor: e.target.value})}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-bold focus:border-brand-blue-cyan transition-colors" 
                    placeholder="Seleccionar o escribir..." 
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5">Memoria RAM</label>
                  <input 
                    type="text"
                    list="ramOptions"
                    value={formData.ram}
                    onChange={(e) => setFormData({...formData, ram: e.target.value})}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-bold focus:border-brand-blue-cyan transition-colors" 
                    placeholder="Ej: 16GB" 
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5">Almacenamiento</label>
              <input 
                type="text"
                list="storageOptions"
                value={formData.storage}
                onChange={(e) => setFormData({...formData, storage: e.target.value})}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-bold focus:border-brand-blue-cyan transition-colors" 
                placeholder="Ej: 512GB SSD" 
              />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5">Sist. Operativo</label>
              <input 
                type="text"
                list="osOptions"
                value={formData.os}
                onChange={(e) => setFormData({...formData, os: e.target.value})}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-bold focus:border-brand-blue-cyan transition-colors" 
                placeholder="Seleccionar o escribir..." 
              />
            </div>
          </div>
        </div>
      )}

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
        <button type="button" onClick={onCancel} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black text-xs uppercase tracking-widest rounded-xl transition-all">
          Cancelar
        </button>
        <button type="submit" className="flex-1 py-3.5 bg-brand-blue-cyan hover:bg-brand-blue-dark text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-brand-blue-cyan/20 transition-all">
          {isEditing ? 'Guardar Cambios' : 'Registrar Activo'}
        </button>
      </div>
    </form>
  );
};

export default EquipmentForm;
