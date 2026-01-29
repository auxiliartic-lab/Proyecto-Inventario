
import React, { useState, useMemo } from 'react';
import { Company, Equipment, MaintenanceRecord, SoftwareLicense, Credential } from '../types';
import { useInventory } from '../context/InventoryContext';
import * as XLSX from 'xlsx';

interface ReportsModuleProps {
  company: Company;
}

type ReportType = 'equipment' | 'maintenance' | 'licenses' | 'credentials';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const ReportsModule: React.FC<ReportsModuleProps> = ({ company }) => {
  const { data } = useInventory();
  const [activeTab, setActiveTab] = useState<ReportType>('equipment');
  
  // Estado para filtros de fecha
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');

  // Generar lista de años disponibles (desde 2020 hasta actual)
  const availableYears = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => currentYear - i);

  // --- LÓGICA DE FILTRADO ---
  
  const filterByDate = (items: any[], dateField: string) => {
    if (selectedYear === 'all') return items;

    return items.filter(item => {
      if (!item[dateField]) return false;
      
      const parts = item[dateField].toString().split('-');
      if (parts.length < 3) return false;

      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Meses en JS son 0-11

      const yearMatch = year === selectedYear;
      const monthMatch = selectedMonth === 'all' || month === selectedMonth;

      return yearMatch && monthMatch;
    });
  };

  // Datos Base (Filtrados por Compañía)
  const rawEquipment = data.equipment.filter(e => e.companyId === company.id);
  const rawMaintenance = (data.maintenance || []).filter(m => m.companyId === company.id);
  const rawLicenses = data.licenses.filter(l => l.companyId === company.id);
  const rawCredentials = (data.credentials || []).filter(c => c.companyId === company.id);

  // Datos Filtrados por Tiempo
  const filteredEquipment = useMemo(() => filterByDate(rawEquipment, 'purchaseDate'), [rawEquipment, selectedYear, selectedMonth]);
  const filteredMaintenance = useMemo(() => filterByDate(rawMaintenance, 'date'), [rawMaintenance, selectedYear, selectedMonth]);
  const filteredLicenses = useMemo(() => filterByDate(rawLicenses, 'startDate'), [rawLicenses, selectedYear, selectedMonth]);
  // Las credenciales generalmente no tienen fecha de "compra", se exportan todas.
  const filteredCredentials = rawCredentials;

  // Texto descriptivo del periodo
  const periodLabel = selectedYear === 'all' 
    ? 'Histórico Completo' 
    : `${selectedMonth !== 'all' ? MONTHS[selectedMonth as number] : 'Todo el año'} ${selectedYear}`;


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
      alert("No hay datos para exportar en el periodo seleccionado.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Estilos
    const borderStyle = { style: "thin", color: { rgb: "BDBDBD" } };
    
    const headerStyle = {
      font: { name: "Arial", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "0072BC" } }, 
      border: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
      alignment: { vertical: "center", horizontal: "center", wrapText: true }
    };

    const rowStyleEven = {
      font: { name: "Arial", sz: 10, color: { rgb: "333333" } },
      fill: { fgColor: { rgb: "FFFFFF" } }, 
      border: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
      alignment: { vertical: "center", horizontal: "left" }
    };

    const rowStyleOdd = {
      font: { name: "Arial", sz: 10, color: { rgb: "333333" } },
      fill: { fgColor: { rgb: "F3F4F6" } }, 
      border: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
      alignment: { vertical: "center", horizontal: "left" }
    };

    const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1:A1");
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) worksheet[cellAddress] = { t: 's', v: '' }; 

        const cell = worksheet[cellAddress];

        if (R === 0) {
          cell.s = headerStyle;
        } else {
          cell.s = (R % 2 === 0) ? rowStyleEven : rowStyleOdd;
          if (cell.v && typeof cell.v === 'string' && cell.v.includes('-') && cell.v.length === 10) {
             cell.s = { ...cell.s, alignment: { vertical: "center", horizontal: "center" } };
          }
        }
      }
    }

    worksheet['!cols'] = autoFitColumns(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}_${selectedYear === 'all' ? 'Historico' : selectedYear}.xlsx`);
  };

  const exportEquipment = () => {
    const formattedData = filteredEquipment.map(item => {
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
        'Fecha Ingreso': item.purchaseDate || '-'
      };
    });

    generateExcel(formattedData, "Reporte Equipos", `Equipos_${periodLabel.replace(/\s+/g, '_')}`);
  };

  const exportMaintenance = () => {
    const formattedData = filteredMaintenance.map(item => {
      const equip = data.equipment.find(e => e.id === item.equipmentId);
      const equipName = equip ? `${equip.type} ${equip.brand} ${equip.model}` : 'Equipo Eliminado';
      const equipSerial = equip ? equip.serialNumber : 'N/A';

      return {
        'ID Ticket': item.id,
        'Fecha Reporte': item.date,
        'Incidencia': item.title,
        'Descripción Falla': item.description,
        'Equipo Afectado': equipName,
        'Serie Equipo': equipSerial,
        'Severidad': item.severity === 'TotalLoss' ? 'Pérdida Total' : item.severity === 'Severe' ? 'Severa' : 'Moderada',
        'Estado': item.status === 'Open' ? 'Abierto' : 'Cerrado',
        'Solución Técnica': item.resolutionDetails || 'Pendiente',
        'Fecha Solución': item.resolutionDate || '-'
      };
    });

    generateExcel(formattedData, "Reporte Mantenimientos", `Mantenimiento_${periodLabel.replace(/\s+/g, '_')}`);
  };

  const exportLicenses = () => {
    const formattedData = filteredLicenses.map(item => {
      const today = new Date();
      const exp = new Date(item.expirationDate);
      const status = exp < today ? 'VENCIDA' : 'Activa';
      
      // Manejar múltiples asignaciones
      let assignedToText = 'Sin Asignar';
      
      if (item.assignedTo && item.assignedTo.length > 0) {
        const names = item.assignedTo.map(id => {
          const user = data.collaborators.find(c => c.id === id);
          return user ? `${user.firstName} ${user.lastName}` : '';
        }).filter(Boolean);
        assignedToText = names.join(', ');
      } else if (item.assignedToEquipment && item.assignedToEquipment.length > 0) {
        const names = item.assignedToEquipment.map(id => {
          const eq = data.equipment.find(e => e.id === id);
          return eq ? `${eq.brand} ${eq.model} (${eq.serialNumber})` : '';
        }).filter(Boolean);
        assignedToText = names.join(', ');
      }
      
      return {
        'ID': item.id,
        'Software': item.name,
        'Proveedor': item.vendor,
        'Tipo': item.type,
        'Asignado A': assignedToText,
        'Cupos Totales': item.totalSlots || 1,
        'Cupos Usados': (item.assignedTo?.length || 0) + (item.assignedToEquipment?.length || 0),
        'Clave / Serial': item.key,
        'Inicio Contrato': item.startDate,
        'Vencimiento': item.expirationDate,
        'Estado': status
      };
    });

    generateExcel(formattedData, "Reporte Licencias", `Licencias_${periodLabel.replace(/\s+/g, '_')}`);
  };

  const exportCredentials = () => {
    const formattedData = filteredCredentials.map(item => {
      const assignedUser = item.assignedTo ? data.collaborators.find(c => c.id === item.assignedTo) : null;
      const userName = assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : 'Sin Asignar';

      return {
        'ID': item.id,
        'Servicio / Plataforma': item.service,
        'Asignado A': userName,
        'Usuario': item.username,
        'Contraseña': item.password,
        'Notas': item.description
      };
    });

    generateExcel(formattedData, "Reporte Credenciales", `Credenciales_${company.name.replace(/\s+/g, '_')}`);
  };

  const handleExport = () => {
    switch(activeTab) {
      case 'equipment': exportEquipment(); break;
      case 'maintenance': exportMaintenance(); break;
      case 'licenses': exportLicenses(); break;
      case 'credentials': exportCredentials(); break;
    }
  };

  // --- COMPONENTES VISUALES UI ---

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
          <p className="text-gray-500">Genera reportes históricos y de control para {company.name}.</p>
        </div>
        
        <button 
          onClick={handleExport}
          className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-3 shadow-lg shadow-green-700/20 transition-all active:scale-95"
        >
          <i className="fa-solid fa-file-excel"></i>
          <span>Exportar {
            activeTab === 'equipment' ? 'Equipos' : 
            activeTab === 'maintenance' ? 'Mantenimiento' : 
            activeTab === 'licenses' ? 'Licencias' : 'Credenciales'
          }</span>
        </button>
      </div>

      {/* BARRA DE FILTROS DE TIEMPO (Solo visible si no es Credenciales) */}
      {activeTab !== 'credentials' && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-bold uppercase tracking-wider shrink-0">
              <i className="fa-solid fa-filter"></i>
              Filtrar Periodo:
          </div>

          <div className="flex flex-1 gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-48">
                  <span className="absolute top-2 left-3 text-[10px] font-bold text-gray-400 uppercase">Año</span>
                  <select 
                    value={selectedYear}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedYear(val === 'all' ? 'all' : Number(val));
                    }}
                    className="w-full pt-5 pb-2 px-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan font-bold text-sm"
                  >
                    <option value="all">Todo el Historial</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
              </div>

              <div className="relative w-full md:w-48">
                  <span className="absolute top-2 left-3 text-[10px] font-bold text-gray-400 uppercase">Mes</span>
                  <select 
                    value={selectedMonth}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedMonth(val === 'all' ? 'all' : Number(val));
                    }}
                    disabled={selectedYear === 'all'}
                    className={`w-full pt-5 pb-2 px-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue-cyan font-bold text-sm transition-all ${selectedYear === 'all' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="all">Todo el Año</option>
                    {MONTHS.map((month, idx) => (
                      <option key={idx} value={idx}>{month}</option>
                    ))}
                  </select>
              </div>
          </div>
          
          <div className="text-right shrink-0">
              <span className="block text-xs text-gray-400 font-bold uppercase tracking-wider">Periodo Visualizado</span>
              <span className="block font-black text-brand-blue-dark">{periodLabel}</span>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="flex p-1 bg-gray-200/50 rounded-xl mb-8 w-fit overflow-x-auto">
         <button 
           onClick={() => setActiveTab('equipment')}
           className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'equipment' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
         >
           Ingreso Equipos
         </button>
         <button 
           onClick={() => setActiveTab('maintenance')}
           className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'maintenance' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
         >
           Mantenimientos
         </button>
         <button 
           onClick={() => setActiveTab('licenses')}
           className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'licenses' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
         >
           Licencias
         </button>
         <button 
           onClick={() => setActiveTab('credentials')}
           className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'credentials' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
         >
           Credenciales
         </button>
      </div>

      {/* CONTENIDO (VISTA PREVIA HTML) */}
      
      {activeTab === 'equipment' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Ingresados en Periodo" value={filteredEquipment.length} icon="fa-cart-plus" color="bg-brand-blue-cyan" />
              <StatCard label="Asignados" value={filteredEquipment.filter(e => e.assignedTo).length} icon="fa-user-check" color="bg-brand-green-dark" />
              <StatCard label="En Mantenimiento" value={filteredEquipment.filter(e => e.status === 'Mantenimiento').length} icon="fa-screwdriver-wrench" color="bg-brand-yellow" />
              <StatCard label="Costo/Baja" value={filteredEquipment.filter(e => e.status === 'Retirado' || e.status === 'Perdido').length} icon="fa-ban" color="bg-red-500" />
           </div>
           
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              {filteredEquipment.length > 0 ? (
                <>
                  <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <i className="fa-solid fa-table text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Datos Listos para Exportar</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">Se encontraron {filteredEquipment.length} equipos ingresados o registrados en <strong>{periodLabel}</strong>.</p>
                  <button onClick={exportEquipment} className="text-brand-blue-cyan font-bold hover:underline">Descargar Excel</button>
                </>
              ) : (
                <div className="py-10">
                   <i className="fa-solid fa-folder-open text-4xl text-gray-200 mb-4"></i>
                   <p className="text-gray-400 font-bold">No se encontraron ingresos en {periodLabel}</p>
                </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Tickets Generados" value={filteredMaintenance.length} icon="fa-ticket" color="bg-brand-blue-dark" />
              <StatCard label="Aún Abiertos" value={filteredMaintenance.filter(m => m.status === 'Open').length} icon="fa-clock" color="bg-brand-yellow" />
              <StatCard label="Críticos del Mes" value={filteredMaintenance.filter(m => m.severity === 'Severe' || m.severity === 'TotalLoss').length} icon="fa-fire" color="bg-red-500" />
           </div>
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              {filteredMaintenance.length > 0 ? (
                <>
                  <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <i className="fa-solid fa-table text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Datos Listos para Exportar</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">Se encontraron {filteredMaintenance.length} reportes de mantenimiento creados en <strong>{periodLabel}</strong>.</p>
                  <button onClick={exportMaintenance} className="text-brand-blue-cyan font-bold hover:underline">Descargar Excel</button>
                </>
              ) : (
                 <div className="py-10">
                   <i className="fa-solid fa-check-circle text-4xl text-green-200 mb-4"></i>
                   <p className="text-gray-400 font-bold">Sin incidencias reportadas en {periodLabel}</p>
                </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'licenses' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Contratadas" value={filteredLicenses.length} icon="fa-file-signature" color="bg-brand-blue-cyan" />
              <StatCard label="Por Vencer (30 días)" value={filteredLicenses.filter(l => {
                    const diff = new Date(l.expirationDate).getTime() - new Date().getTime();
                    const days = diff / (1000 * 3600 * 24);
                    return days > 0 && days <= 30;
                 }).length} icon="fa-hourglass-half" color="bg-brand-orange" />
              <StatCard label="Ya Vencidas" value={filteredLicenses.filter(l => new Date(l.expirationDate) < new Date()).length} icon="fa-triangle-exclamation" color="bg-red-500" />
           </div>
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              {filteredLicenses.length > 0 ? (
                <>
                  <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <i className="fa-solid fa-table text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Datos Listos para Exportar</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">Se encontraron {filteredLicenses.length} licencias iniciadas en <strong>{periodLabel}</strong>.</p>
                  <button onClick={exportLicenses} className="text-brand-blue-cyan font-bold hover:underline">Descargar Excel</button>
                </>
              ) : (
                <div className="py-10">
                   <i className="fa-solid fa-folder-open text-4xl text-gray-200 mb-4"></i>
                   <p className="text-gray-400 font-bold">No hay registros de contratación en {periodLabel}</p>
                </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'credentials' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
           <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4 text-center">
              <p className="text-blue-800 text-sm font-bold">
                <i className="fa-solid fa-info-circle mr-2"></i>
                Nota: El reporte de credenciales exporta todas las contraseñas actuales visibles.
              </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <StatCard label="Total Credenciales Activas" value={filteredCredentials.length} icon="fa-key" color="bg-brand-blue-dark" />
           </div>

           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              {filteredCredentials.length > 0 ? (
                <>
                  <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <i className="fa-solid fa-file-shield text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Datos Listos para Exportar</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">Se encontraron {filteredCredentials.length} credenciales almacenadas para esta compañía.</p>
                  <button onClick={exportCredentials} className="text-brand-blue-cyan font-bold hover:underline">Descargar Excel</button>
                </>
              ) : (
                <div className="py-10">
                   <i className="fa-solid fa-folder-open text-4xl text-gray-200 mb-4"></i>
                   <p className="text-gray-400 font-bold">No hay credenciales registradas</p>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default ReportsModule;
