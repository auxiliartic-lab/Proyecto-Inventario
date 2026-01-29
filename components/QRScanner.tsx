
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ]
          },
          (decodedText) => {
            scanner.stop().then(() => {
                onScan(decodedText);
            }).catch(err => console.error(err));
          },
          (errorMessage) => {
            // Ignorar errores de frame vacío
          }
        );
      } catch (err) {
        console.error("Error starting scanner", err);
        setError("No se pudo acceder a la cámara. Verifique los permisos.");
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="flex justify-between items-center p-4 bg-black/50 absolute top-0 w-full z-10">
         <h2 className="text-white font-bold text-lg">Escanear Activo</h2>
         <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-md">
            <i className="fa-solid fa-times"></i>
         </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-black">
         <div id="reader" className="w-full max-w-md h-full overflow-hidden bg-black"></div>
         {error && (
             <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                 <div className="bg-red-500/90 text-white p-6 rounded-2xl backdrop-blur-md">
                     <i className="fa-solid fa-camera-slash text-4xl mb-4"></i>
                     <p>{error}</p>
                     <button onClick={onClose} className="mt-4 px-4 py-2 bg-white text-red-500 font-bold rounded-lg">Cerrar</button>
                 </div>
             </div>
         )}
         
         {/* Overlay visual para guiar al usuario */}
         {!error && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-64 h-64 border-2 border-brand-blue-cyan rounded-2xl relative opacity-50">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-brand-blue-cyan -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-brand-blue-cyan -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-brand-blue-cyan -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-brand-blue-cyan -mb-1 -mr-1"></div>
                </div>
                <p className="mt-8 text-white/80 text-sm font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                    Apunte el código QR dentro del cuadro
                </p>
            </div>
         )}
      </div>
    </div>
  );
};

export default QRScanner;
