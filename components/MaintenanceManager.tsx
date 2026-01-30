
import React, { useState } from 'react';
import { Company, MaintenanceRecord, Equipment, Attachment } from '../types';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext'; // Import Auth
import ResolveTicketForm from './forms/ResolveTicketForm';

interface MaintenanceManagerProps {
  company: Company;
}

const MaintenanceManager: React.FC<MaintenanceManagerProps> = ({ company }) => {
  const { data, resolveTicket, toggleMaintenanceDelivery } = useInventory();
  const { user } = useAuth(); // Get user
  const records = (data.maintenance || []).filter(m => m.companyId === company.id);
  
  const [filterType, setFilterType] = useState<string>('Todos');
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
  
  // Estado para el modal de detalles (Solo lectura)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Estado para el modal de RESOLUCIÓN (Cierre de ticket)
  const [isResolveModalOpen, setIsResolveModalOpen] = useState<boolean>(false);
  const [ticketToResolve, setTicketToResolve] = useState<MaintenanceRecord | null>(null);

  // Estado para Galería de Evidencias
  const [evidenceModalOpen, setEvidenceModalOpen] = useState<boolean>(false);
  const [selectedAttachments, setSelectedAttachments] = useState<{title: string, images: Attachment[]} | null>(null);
  const [previewImage, setPreviewImage] = useState<Attachment | null>(null); // Para ver en grande

  // Helper para obtener datos del equipo usando el contexto
  const getEquipmentInfo = (equipId: number) => {
    return data.equipment.find(e => e.id === equipId);
  };

  // Helper para Iconos Dinámicos
  const getIconForType = (type: string) => {
    switch (type) {
      case 'Laptop': return 'fa-laptop';
      case 'Desktop': return 'fa-desktop';
      case 'Servidor': return 'fa-server';
      case 'Tablet': return 'fa-tablet-screen-button';
      case 'Smartphone': return 'fa-mobile-screen-button';
      case 'Periférico': return 'fa-keyboard';
      default: return 'fa-box';
    }
  };

  // Abrir modal de detalles del equipo
  const handleViewDetails = (equipId: number) => {
    const equip = getEquipmentInfo(equipId);
    if (equip) {
      setSelectedEquipment(equip);
      setIsDetailsModalOpen(true);
    }
  };

  // Abrir modal de resolución
  const handleOpenResolve = (record: MaintenanceRecord) => {
    setTicketToResolve(record);
    setIsResolveModalOpen(true);
  };

  const handleResolveSubmit = (data: { details: string, date: string, specs?: Partial<Equipment>, markAsDelivered: boolean }) => {
    if (ticketToResolve) {
      // USAR user.name PARA EL HISTORIAL
      resolveTicket(ticketToResolve.id, data.details, data.date, data.specs, data.markAsDelivered, user?.name || user?.username);
      setIsResolveModalOpen(false);
      setTicketToResolve(null);
    }
  };

  const handleViewEvidence = (title: string, attachments: Attachment[]) => {
    setSelectedAttachments({ title, images: attachments });
    setPreviewImage(attachments.length > 0 ? attachments[0] : null); // Preseleccionar la primera
    setEvidenceModalOpen(true);
  };

  const downloadImage = (att: Attachment) => {
      const link = document.createElement('a');
      link.href = att.data;
      link.download = `Evidencia_${att.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // Filtrado
  const filteredRecords = records.filter(rec => {
    // Filtro por Estado (Tab)
    const statusMatch = activeTab === 'open' ? rec.status === 'Open' : rec.status === 'Closed';
    if (!statusMatch) return false;

    // Filtro por Tipo Equipo
    if (filterType === 'Todos') return true;
    const equip = getEquipmentInfo(rec.equipmentId);
    return equip?.type === filterType;
  });

  const getEquipmentTypes = () => {
    const types = new Set<string>();
    records.forEach(rec => {
      const equip = getEquipmentInfo(rec.equipmentId);
      if (equip) types.add(equip.type);
    });
    return ['Todos', ...Array.from(types)];
  };

  const getSeverityStyles = (severity: MaintenanceRecord['severity']) => {
    switch (severity) {
      case 'Moderate':
        return {
          card: 'border-l-4 border-brand-yellow bg-white',
          badge: 'bg-brand-yellow/10 text-yellow-700',
          icon: 'fa-triangle-exclamation text-brand-yellow'
        };
      case 'Severe':
        return {
          card: 'border-l-4 border-red-500 bg-white',
          badge: 'bg-red-50 text-red-700',
          icon: 'fa-temperature-arrow-up text-red-500'
        };
      case 'TotalLoss':
        return {
          card: 'border-l-4 border-gray-900 bg-gray-900 text-white',
          badge: 'bg-white/20 text-white',
          icon: 'fa-skull text-white'
        };
      default:
        return { card: '', badge: '', icon: '' };
    }
  };

  // Helper seguro para renderizar nombre de colaborador
  const renderAssignedName = (assignedTo?: number) => {
    if (!assignedTo) return '-- Sin Asignar --';
    const collaborator = data.collaborators.find(c => c.id === assignedTo);
    if (!collaborator) return 'Colaborador no encontrado';
    return `${collaborator.firstName} ${collaborator.lastName}`;
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Mantenimiento y Garantías</h1>
          </div>
          <p className="text-gray-500">Gestione reportes de fallas y seguimiento técnico.</p>
        </div>

        {/* TABS REDISEÑADOS */}
        <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200 shadow-inner w-full md:w-auto">
           <button 
             onClick={() => setActiveTab('open')}
             className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'open' ? 'bg-white text-brand-blue-cyan shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
           >
             <i className="fa-solid fa-fire"></i>
             En Curso
             <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'open' ? 'bg-brand-blue-cyan text-white' : 'bg-gray-300 text-gray-600'}`}>
                {records.filter(r => r.status === 'Open').length}
             </span>
           </button>
           <button 
             onClick={() => setActiveTab('closed')}
             className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'closed' ? 'bg-white text-green-600 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
           >
             <i className="fa-solid fa-box-archive"></i>
             Historial Cerrado
           </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 custom-scrollbar">
        {getEquipmentTypes().map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
              filterType === type 
                ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredRecords.map(rec => {
           const equip = getEquipmentInfo(rec.equipmentId);
           if (!equip) return null;
           const styles = getSeverityStyles(rec.severity);
           
           return (
             <div key={rec.id} className={`rounded-2xl p-6 shadow-sm border border-gray-100 relative group transition-all hover:shadow-md ${styles.card}`}>
                <div className="flex flex-col md:flex-row gap-6">
                   <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center gap-3">
                            <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-mono font-bold">#{rec.id}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${styles.badge}`}>
                               <i className={`fa-solid ${styles.icon}`}></i> {rec.severity === 'TotalLoss' ? 'Pérdida Total' : rec.severity === 'Severe' ? 'Grave' : 'Moderado'}
                            </span>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-bold text-gray-400">{rec.date}</p>
                         </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{rec.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{rec.description}</p>
                      
                      <div className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                         <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-400 border border-gray-200 shadow-sm">
                             <i className={`fa-solid ${getIconForType(equip.type)}`}></i>
                         </div>
                         <div>
                            <p className="text-xs font-bold text-gray-900">{equip.brand} {equip.model}</p>
                            <p className="text-[10px] text-gray-400 font-mono">SN: {equip.serialNumber}</p>
                         </div>
                         <div className="flex-1 text-right">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Responsable</p>
                            <p className="text-xs font-bold text-gray-700">{renderAssignedName(equip.assignedTo)}</p>
                         </div>
                      </div>

                      {/* Botones de Acción y Evidencia */}
                      <div className="flex flex-wrap items-center gap-3 mt-4">
                          {rec.attachments && rec.attachments.length > 0 && (
                            <button 
                                onClick={() => handleViewEvidence(rec.title, rec.attachments || [])}
                                className="flex items-center gap-2 px-4 py-2 bg-brand-blue-cyan text-white text-xs font-bold rounded-lg shadow-md shadow-brand-blue-cyan/20 hover:bg-brand-blue-dark transition-all"
                            >
                                <i className="fa-solid fa-images"></i>
                                Ver Evidencia ({rec.attachments.length})
                            </button>
                          )}
                          
                          {activeTab === 'open' && (
                             <button 
                               onClick={() => handleOpenResolve(rec)}
                               className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-green-600/20 flex items-center gap-2"
                             >
                                <i className="fa-solid fa-check"></i>
                                Solucionar Ticket
                             </button>
                          )}
                      </div>
                   </div>

                   {/* Si está cerrado, mostrar detalles de solución */}
                   {activeTab === 'closed' && (
                       <div className="md:w-1/3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center bg-gray-50/30 rounded-r-xl">
                          <h4 className="text-xs font-bold text-green-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <i className="fa-solid fa-circle-check"></i> Resuelto
                          </h4>
                          <p className="text-xs text-gray-600 mb-2 italic">"{rec.resolutionDetails}"</p>
                          <p className="text-[10px] text-gray-400 font-bold mb-4">Fecha: {rec.resolutionDate}</p>
                          
                          <div className="mt-auto">
                              {rec.deliveryStatus === 'Delivered' ? (
                                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                                      <i className="fa-solid fa-handshake"></i>
                                      <span className="text-xs font-bold">Equipo Entregado</span>
                                      <button onClick={() => toggleMaintenanceDelivery(rec.id)} className="ml-auto text-[10px] underline text-gray-400 hover:text-gray-600">Cambiar</button>
                                  </div>
                              ) : (
                                  <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100">
                                      <i className="fa-solid fa-clock"></i>
                                      <span className="text-xs font-bold">Pendiente de Entrega</span>
                                      <button onClick={() => toggleMaintenanceDelivery(rec.id)} className="ml-auto text-[10px] font-black bg-white px-2 py-0.5 rounded border shadow-sm hover:bg-gray-50">Entregar</button>
                                  </div>
                              )}
                          </div>
                       </div>
                   )}
                </div>
             </div>
           );
        })}

        {filteredRecords.length === 0 && (
           <div className="text-center py-12">
              <i className="fa-solid fa-clipboard-check text-4xl text-gray-200 mb-3"></i>
              <p className="text-gray-400 font-medium">No hay tickets {activeTab === 'open' ? 'pendientes' : 'cerrados'} en esta categoría.</p>
           </div>
        )}
      </div>

      {/* MODAL RESOLUCIÓN */}
      {isResolveModalOpen && ticketToResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-hidden">
           <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                 <div>
                    <h2 className="text-xl font-black text-gray-900">Finalizar Mantenimiento</h2>
                    <p className="text-xs text-gray-500">Ticket #{ticketToResolve.id} - {ticketToResolve.title}</p>
                 </div>
                 <button onClick={() => setIsResolveModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <i className="fa-solid fa-times text-xl"></i>
                 </button>
              </div>
              
              <div className="flex-1 overflow-hidden">
                 {getEquipmentInfo(ticketToResolve.equipmentId) && (
                    <ResolveTicketForm 
                        equipment={getEquipmentInfo(ticketToResolve.equipmentId)!}
                        onSubmit={handleResolveSubmit}
                        onCancel={() => setIsResolveModalOpen(false)}
                    />
                 )}
              </div>
           </div>
        </div>
      )}

      {/* MODAL EVIDENCIAS (MEJORADO CON PREVISUALIZACIÓN Y DESCARGA) */}
      {evidenceModalOpen && selectedAttachments && (
          <div className="fixed inset-0 z-[60] overflow-y-auto">
              <div className="fixed inset-0 bg-black/95 backdrop-blur-md transition-opacity" onClick={() => setEvidenceModalOpen(false)}></div>
              <div className="flex min-h-full items-center justify-center p-4">
                  <div className="relative w-full max-w-6xl bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-gray-800">
                      
                      {/* Header Modal */}
                      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900 shrink-0">
                          <div>
                              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                  <i className="fa-solid fa-camera"></i> Evidencia Fotográfica
                              </h2>
                              <p className="text-xs text-gray-400">{selectedAttachments.title} - {selectedAttachments.images.length} Archivos</p>
                          </div>
                          <div className="flex items-center gap-3">
                              {previewImage && (
                                  <button 
                                    onClick={() => downloadImage(previewImage)}
                                    className="px-4 py-2 bg-brand-blue-cyan text-white text-xs font-bold rounded-lg hover:bg-brand-blue-dark transition-colors flex items-center gap-2"
                                  >
                                      <i className="fa-solid fa-download"></i> Descargar
                                  </button>
                              )}
                              <button onClick={() => setEvidenceModalOpen(false)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full transition-all">
                                  <i className="fa-solid fa-times text-xl"></i>
                              </button>
                          </div>
                      </div>

                      <div className="flex flex-col md:flex-row flex-1 overflow-hidden h-full">
                          
                          {/* Columna Izquierda: Galería de Miniaturas */}
                          <div className="w-full md:w-1/4 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto custom-scrollbar flex flex-row md:flex-col gap-3 shrink-0 h-32 md:h-auto">
                              {selectedAttachments.images.map((att) => (
                                  <div 
                                    key={att.id} 
                                    onClick={() => setPreviewImage(att)}
                                    className={`relative rounded-lg overflow-hidden aspect-square cursor-pointer border-2 transition-all ${previewImage?.id === att.id ? 'border-brand-blue-cyan ring-2 ring-brand-blue-cyan/30' : 'border-gray-700 hover:border-gray-500'}`}
                                  >
                                      <img src={att.data} alt="thumb" className="w-full h-full object-cover" />
                                  </div>
                              ))}
                          </div>

                          {/* Columna Derecha: Visor Principal */}
                          <div className="flex-1 bg-black flex items-center justify-center relative p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                              {previewImage ? (
                                  <div className="relative max-w-full max-h-full">
                                      <img 
                                        src={previewImage.data} 
                                        alt="Preview" 
                                        className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl" 
                                      />
                                      <div className="absolute top-4 right-4 flex gap-2">
                                          <button 
                                            onClick={() => window.open(previewImage.data, '_blank')}
                                            className="w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/80 backdrop-blur-sm transition-colors"
                                            title="Abrir en pestaña nueva"
                                          >
                                              <i className="fa-solid fa-expand"></i>
                                          </button>
                                      </div>
                                      <p className="mt-4 text-center text-gray-400 text-sm font-mono bg-black/50 py-1 px-4 rounded-full mx-auto w-fit backdrop-blur-sm">
                                          {previewImage.name}
                                      </p>
                                  </div>
                              ) : (
                                  <div className="text-gray-500 text-center">
                                      <i className="fa-regular fa-image text-5xl mb-4 opacity-50"></i>
                                      <p>Seleccione una imagen</p>
                                  </div>
                              )}
                          </div>

                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default MaintenanceManager;
