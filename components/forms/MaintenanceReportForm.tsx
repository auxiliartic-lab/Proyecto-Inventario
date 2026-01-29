
import React, { useState, useRef } from 'react';
import { MaintenanceSeverity, Attachment } from '../../types';

interface MaintenanceReportFormProps {
  onSubmit: (data: { title: string, description: string, severity: MaintenanceSeverity, date: string, attachments: Attachment[] }) => void;
  onCancel: () => void;
}

const MaintenanceReportForm: React.FC<MaintenanceReportFormProps> = ({ onSubmit, onCancel }) => {
  const [maintenanceData, setMaintenanceData] = useState({
    title: '',
    description: '',
    severity: 'Moderate' as MaintenanceSeverity,
    date: new Date().toISOString().split('T')[0] // Default a hoy
  });

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Función para comprimir imagen antes de convertir a Base64
  const processImage = (file: File): Promise<Attachment> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Comprimir a JPEG calidad 0.7
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          resolve({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: 'image/jpeg',
            data: compressedDataUrl
          });
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      // Explicitly type the array from FileList to File[] to avoid 'unknown' type inference
      const newFiles: File[] = Array.from(e.target.files);
      const processedAttachments: Attachment[] = [];

      for (const file of newFiles) {
        // Solo procesar imágenes
        if (file.type.startsWith('image/')) {
            try {
                const attachment = await processImage(file);
                processedAttachments.push(attachment);
            } catch (error) {
                console.error("Error processing image", error);
            }
        }
      }

      setAttachments(prev => [...prev, ...processedAttachments]);
      setIsProcessing(false);
      // Limpiar input para permitir subir el mismo archivo de nuevo si se borró
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
        ...maintenanceData,
        attachments
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Problema (Título)</label>
            <input 
            required
            type="text" 
            value={maintenanceData.title}
            onChange={e => setMaintenanceData({...maintenanceData, title: e.target.value})}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-yellow" 
            />
        </div>
        <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Fecha del Incidente</label>
            <input 
            required
            type="date" 
            value={maintenanceData.date}
            onChange={e => setMaintenanceData({...maintenanceData, date: e.target.value})}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-yellow font-bold text-gray-700" 
            />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nivel de Severidad</label>
        <div className="grid grid-cols-3 gap-3">
           {(['Moderate', 'Severe', 'TotalLoss'] as const).map((sev) => (
             <button
               key={sev}
               type="button"
               onClick={() => setMaintenanceData({...maintenanceData, severity: sev})}
               className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider border-2 transition-all ${
                 maintenanceData.severity === sev
                   ? sev === 'Moderate' ? 'bg-yellow-50 border-yellow-400 text-yellow-700'
                   : sev === 'Severe' ? 'bg-red-50 border-red-500 text-red-700'
                   : 'bg-gray-800 border-gray-800 text-white'
                   : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
               }`}
             >
               {sev === 'Moderate' ? 'Moderado' : sev === 'Severe' ? 'Grave' : 'Pérdida Total'}
             </button>
           ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Descripción Detallada</label>
        <textarea 
          required
          rows={3}
          value={maintenanceData.description}
          onChange={e => setMaintenanceData({...maintenanceData, description: e.target.value})}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-yellow resize-none" 
        />
      </div>

      {/* SECCIÓN DE EVIDENCIAS (FOTOS) */}
      <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
         <div className="flex justify-between items-center mb-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-camera"></i> Evidencia Fotográfica
            </label>
            <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-lg transition-colors"
                disabled={isProcessing}
            >
                {isProcessing ? 'Procesando...' : '+ Agregar Fotos'}
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                multiple 
                onChange={handleFileChange}
            />
         </div>

         {/* Grid de Previsualización */}
         {attachments.length > 0 ? (
             <div className="grid grid-cols-4 gap-3">
                 {attachments.map((att) => (
                     <div key={att.id} className="relative group aspect-square bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                         <img src={att.data} alt="preview" className="w-full h-full object-cover" />
                         <button 
                            type="button"
                            onClick={() => removeAttachment(att.id)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                         >
                             <i className="fa-solid fa-times text-xs"></i>
                         </button>
                     </div>
                 ))}
             </div>
         ) : (
             <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-24 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100/50 rounded-lg transition-colors"
             >
                 <i className="fa-solid fa-cloud-arrow-up text-2xl mb-1"></i>
                 <span className="text-xs font-medium">Click para subir evidencia</span>
             </div>
         )}
      </div>

      <div className="pt-4 flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all">
          Cancelar
        </button>
        <button type="submit" disabled={isProcessing} className="flex-1 py-3 bg-brand-yellow text-white font-bold rounded-xl shadow-lg shadow-yellow-500/20 hover:bg-yellow-500 transition-all disabled:opacity-50">
          Reportar Falla
        </button>
      </div>
    </form>
  );
};

export default MaintenanceReportForm;
