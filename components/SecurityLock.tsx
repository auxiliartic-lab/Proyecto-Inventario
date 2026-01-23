
import React, { useState, useEffect } from 'react';

interface SecurityLockProps {
  onUnlock: (pin: string) => boolean;
  isLocked: boolean;
  isAuthenticated: boolean;
}

const SecurityLock: React.FC<SecurityLockProps> = ({ onUnlock, isLocked, isAuthenticated }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Referencias para auto-focus
  const inputs = React.useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Resetear PIN al aparecer
    setPin(['', '', '', '']);
    setError(false);
    if (inputs.current[0]) inputs.current[0].focus();
  }, [isLocked, isAuthenticated]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Solo un dígito

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);

    // Mover foco al siguiente
    if (value !== '' && index < 3) {
      inputs.current[index + 1]?.focus();
    }

    // Si llenamos el último, intentar desbloquear
    if (index === 3 && value !== '') {
      const fullPin = newPin.join('');
      // Pequeño delay para visual
      setTimeout(() => {
        const success = onUnlock(fullPin);
        if (!success) {
          setError(true);
          setAttempts(p => p + 1);
          setPin(['', '', '', '']);
          inputs.current[0]?.focus();
        }
      }, 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && pin[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  if (!isLocked && isAuthenticated) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
      
      <div className="mb-8 flex flex-col items-center">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-4 transition-all duration-500 ${error ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-shake' : 'bg-brand-blue-cyan shadow-lg shadow-brand-blue-cyan/30'}`}>
          <i className={`fa-solid ${error ? 'fa-lock' : 'fa-shield-halved'}`}></i>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          {isAuthenticated ? 'Sesión Bloqueada' : 'Inventory'}
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          {error 
            ? 'Código incorrecto. Intente nuevamente.' 
            : isAuthenticated 
              ? 'Ingrese su PIN de seguridad para continuar' 
              : 'Identifíquese como Administrador'}
        </p>
      </div>

      <div className="flex gap-4 mb-8">
        {pin.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => { inputs.current[idx] = el; }}
            type="password"
            inputMode="numeric"
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className={`w-14 h-16 rounded-xl bg-slate-800 border-2 text-center text-3xl font-bold outline-none transition-all ${
              error 
                ? 'border-red-500 text-red-500 focus:border-red-400' 
                : 'border-slate-700 focus:border-brand-blue-cyan focus:shadow-[0_0_20px_rgba(0,174,239,0.3)]'
            }`}
          />
        ))}
      </div>

      <div className="text-center">
         <p className="text-xs text-slate-500 mb-2 uppercase tracking-widest font-bold">PIN por defecto: 0000</p>
         {isAuthenticated && (
           <p className="text-slate-500 text-sm">
             ¿No eres tú? <button onClick={() => window.location.reload()} className="text-white font-bold hover:underline">Cerrar Sesión</button>
           </p>
         )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SecurityLock;
