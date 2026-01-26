
import React, { useState } from 'react';
import { Company, Equipment, MaintenanceRecord, SoftwareLicense } from '../types';
import { useInventory } from '../context/InventoryContext';
// Cambiamos a importación por defecto que es compatible con xlsx-js-style
import XLSX from 'xlsx';

interface ReportsModuleProps {
  company: Company;
}

type ReportType = 'equipment' | 'maintenance' | 'licenses';

const ReportsModule: React.FC<ReportsModuleProps> = ({ company }) => {
  const { data } = useInventory();
  const [activeTab, setActiveTab] = useState<ReportType>('equipment');

  // Filtros de datos por compañía actual
  const equipment = data.equipment.filter(e => e.companyId === company.id);
  const maintenance = (data.maintenance || []).filter(m => m.companyId === company.id);
  const licenses = data.licenses.filter(l => l.companyId === company.id);

  // --- LÓGICA DE EXPORTACIÓN A EXCEL CON ESTILOS ---

  const autoFitColumns = (json: any[]) => {
    const objectMaxLength: number[] = [];
    const keys = Object.keys(json[0] || {});
    
    keys.forEach((key) => {
      objectMaxLength.push(
        Math.max(
          key.length,
          ...json.map((row) => (row[key] ? row[key].toString().length : 0))
        )
      );
    });

    return objectMaxLength.map((w) => ({ wch: w + 5 }));
  };

  const generateExcel = (dataToExport: any[], sheetName: string, fileName: string) => {
    if (dataToExport.length === 0) {
      alert("No hay datos para exportar en esta sección.");
      return;
    }

    // 1. Crear Worksheet básico
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // 2. Definir Estilos Corporativos
    const borderStyle = { style: "thin", color: { rgb: "BDBDBD" } }; // Borde gris suave
    
    const headerStyle = {
      font: { name: "Arial", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "0072BC" } }, // Azul Corporativo (brand-blue-dark)
      border: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
      alignment: { vertical: "center", horizontal: "center", wrapText: true }
    };

    const rowStyleEven = {
      font: { name: "Arial", sz: 10, color: { rgb: "333333" } },
      fill: { fgColor: { rgb: "FFFFFF" } }, // Blanco
      border: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
      alignment: { vertical: "center", horizontal: "left" }
    };

    const rowStyleOdd = {
      font: { name: "Arial", sz: 10, color: { rgb: "333333" } },
      fill: { fgColor: { rgb: "F3F4F6" } }, // Gris muy claro (zebra striping)
      border: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
      alignment: { vertical: "center", horizontal: "left" }
    };

    // 3. Aplicar estilos celda por celda
    const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1:A1");
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        
        // Asegurar que la celda existe, si no, crearla vacía para ponerle borde
        if (!worksheet[cellAddress]) {
            worksheet[cellAddress] = { t: 's', v: '' }; 
        }

        const cell = worksheet[cellAddress];

        // Header (Fila 0)
        if (R === 0) {
          cell.s = headerStyle;
        } else {
          // Datos (Filas 1+)
          cell.s = (R % 2 === 0) ? rowStyleEven : rowStyleOdd;
          
          // Detectar fechas para alinearlas al centro
          if (cell.v && typeof cell.v === 'string' && cell.v.includes('-') && cell.v.length === 10) {
             cell.s = { ...cell.s, alignment: { vertical: "center", horizontal: "center" } };
          }
        }
      }
    }

    // 4. Ajustar ancho columnas
    worksheet['!cols'] = autoFitColumns(dataToExport);

    // 5. Crear Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 6. Descargar
    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportEquipment = () => {
    const formattedData = equipment.map(item => {
      const assignedUser = item.assignedTo ? data.collaborators.find(c => c.id === item.assignedTo) : null;
      const userName = assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : 'En Stock / Sin Asignar';
      
      return {
        'ID Activo': item.id,
        'Tipo': item.type,
        'Marca': item.brand,
        'Modelo': item.model,
        'Número de Serie': item.serialNumber,
        'Procesador': item.processor || '-',
        'RAM': item.ram || '-',
        'Almacenamiento': item.storage || '-',
        'Sistema Operativo': item.os || '-',
        'Estado': item.status,
        'Ubicación': item.location,
        'Asignado A': userName,
        'Cargo': assignedUser ? assignedUser.cargo : '-',
        'Fecha Compra': item.purchaseDate || '-'
      };
    });

    generateExcel(formattedData, "Inventario de Equipos", `Inventario_${company.name.replace(/\s+/g, '_')}`);
  };

  const exportMaintenance = () => {
    const formattedData = maintenance.map(item => {
      const equip = data.equipment.find(e => e.id === item.equipmentId);
      const equipName = equip ? `${equip.type} ${equip.brand} ${equip.model}` : 'Equipo Eliminado';
      const equipSerial = equip ? equip.serialNumber : 'N/A';

      return {
        'ID Ticket': item.id,
        'Fecha': item.date,
        'Incidencia': item.title,
        'Descripción Detallada': item.description,
        'Equipo Afectado': equipName,
        'Serie Equipo': equipSerial,
        'Severidad': item.severity === 'TotalLoss' ? 'Pérdida Total' : item.severity === 'Severe' ? 'Severa' : 'Moderada',
        'Estado': item.status === 'Open' ? 'Abierto' : 'Cerrado',
        'Técnico': item.technician || 'Pendiente'
      };
    });

    generateExcel(formattedData, "Registro Mantenimientos", `Mantenimiento_${company.name.replace(/\s+/g, '_')}`);
  };

  const exportLicenses = () => {
    const formattedData = licenses.map(item => {
      const today = new Date();
      const exp = new Date(item.expirationDate);
      const status = exp < today ? 'VENCIDA' : 'Activa';
      
      return {
        'ID': item.id,
        'Software': item.name,
        'Proveedor': item.vendor,
        'Tipo': item.type,
        'Clave / Serial': item.key,
        'Inicio': item.startDate,
        'Vencimiento': item.expirationDate,
        'Estado': status
      };
    });

    generateExcel(formattedData, "Control de Licencias", `Licencias_${company.name.replace(/\s+/g, '_')}`);
  };

  const handleExport = () => {
    switch(activeTab) {
      case 'equipment': exportEquipment(); break;
      case 'maintenance': exportMaintenance(); break;
      case 'licenses': exportLicenses(); break;
    }
  };

  // --- COMPONENTES VISUALES UI (Sin cambios) ---

  const StatCard = ({ label, value, icon, color }: { label: string, value: string | number, icon: string, color: string }) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
       <div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-black text-gray-900">{value}</p>
       </div>
       <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${color}`}>
          <i className={`fa-solid ${icon} text-xl`}></i>
       </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centro de Reportes</h1>
          <p className="text-gray-500">Genera y exporta información detallada de la organización.</p>
        </div>
        
        <button 
          onClick={handleExport}
          className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-3 shadow-lg shadow-green-700/20 transition-all active:scale-95"
        >
          <i className="fa-solid fa-file-excel"></i>
          <span>Descargar Reporte Excel</span>
        </button>
      </div>

      {/* TABS */}
      <div className="flex p-1 bg-gray-200/50 rounded-xl mb-8 w-fit">
         <button 
           onClick={() => setActiveTab('equipment')}
           className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'equipment' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
         >
           Equipos
         </button>
         <button 
           onClick={() => setActiveTab('maintenance')}
           className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'maintenance' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
         >
           Mantenimientos
         </button>
         <button 
           onClick={() => setActiveTab('licenses')}
           className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'licenses' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
         >
           Licencias
         </button>
      </div>

      {/* CONTENIDO (VISTA PREVIA HTML) */}
      
      {activeTab === 'equipment' && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Activos" value={equipment.length} icon="fa-computer" color="bg-brand-blue-cyan" />
              <StatCard label="Asignados" value={equipment.filter(e => e.assignedTo).length} icon="fa-user-check" color="bg-brand-green-dark" />
              <StatCard label="En Mantenimiento" value={equipment.filter(e => e.status === 'Mantenimiento').length} icon="fa-screwdriver-wrench" color="bg-brand-yellow" />
              <StatCard label="Retirados/Baja" value={equipment.filter(e => e.status === 'Retirado' || e.status === 'Perdido').length} icon="fa-ban" color="bg-red-500" />
           </div>
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <i className="fa-solid fa-table text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Vista Previa de Datos</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">La tabla contiene {equipment.length} registros listos para exportar con formato corporativo.</p>
              <button onClick={exportEquipment} className="text-brand-blue-cyan font-bold hover:underline">Descargar ahora</button>
           </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Tickets Totales" value={maintenance.length} icon="fa-ticket" color="bg-brand-blue-dark" />
              <StatCard label="Casos Abiertos" value={maintenance.filter(m => m.status === 'Open').length} icon="fa-clock" color="bg-brand-yellow" />
              <StatCard label="Casos Críticos" value={maintenance.filter(m => m.severity === 'Severe' || m.severity === 'TotalLoss').length} icon="fa-fire" color="bg-red-500" />
           </div>
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <i className="fa-solid fa-table text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Vista Previa de Datos</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">La tabla contiene {maintenance.length} registros listos para exportar con formato corporativo.</p>
              <button onClick={exportMaintenance} className="text-brand-blue-cyan font-bold hover:underline">Descargar ahora</button>
           </div>
        </div>
      )}

      {activeTab === 'licenses' && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Licencias Totales" value={licenses.length} icon="fa-certificate" color="bg-brand-blue-cyan" />
              <StatCard label="Por Vencer (30 días)" value={licenses.filter(l => {
                    const diff = new Date(l.expirationDate).getTime() - new Date().getTime();
                    const days = diff / (1000 * 3600 * 24);
                    return days > 0 && days <= 30;
                 }).length} icon="fa-hourglass-half" color="bg-brand-orange" />
              <StatCard label="Vencidas" value={licenses.filter(l => new Date(l.expirationDate) < new Date()).length} icon="fa-triangle-exclamation" color="bg-red-500" />
           </div>
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <i className="fa-solid fa-table text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Vista Previa de Datos</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">La tabla contiene {licenses.length} registros listos para exportar con formato corporativo.</p>
              <button onClick={exportLicenses} className="text-brand-blue-cyan font-bold hover:underline">Descargar ahora</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ReportsModule;
