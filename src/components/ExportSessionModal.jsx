import React, { useState, useEffect } from 'react';
import { X, Copy, Share2, Share } from 'lucide-react';
import { shareSession } from '../services/sheets';

const generateCode = (sessionData) => {
  const json = JSON.stringify(sessionData);
  const b64 = btoa(encodeURIComponent(json));
  return b64.slice(0, 8).toUpperCase();
};

export default function ExportSessionModal({ sessionData, onClose }) {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (sessionData) {
      const generated = generateCode(sessionData);
      setCode(generated);
      // Trigger side-effect
      shareSession({ code: generated, sessionData }).catch(console.error);
    }
  }, [sessionData]);

  const shareUrl = `${window.location.origin}/import/${code}`;
  
  const shareText = `Aquí tienes tu sesión de TrainingOS 🏋️\nCódigo: *${code}*\nÁbrela en tu app: ${shareUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
       <div className="bg-white rounded-3xl w-full max-w-sm relative overflow-hidden animate-scale-in">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-[#6E6E73] bg-[#F5F5F0] rounded-full hover:bg-[#E8E8E4]">
             <X size={20} />
          </button>
          
          <div className="pt-8 pb-6 px-6 text-center">
             <div className="w-16 h-16 rounded-full bg-[#FFF3EC] mx-auto flex items-center justify-center mb-4">
                <Share size={28} className="text-[#FF6B00]" />
             </div>
             
             <h2 className="font-condensed font-black text-2xl text-[#1C1C1E] mb-1">Sesión Exportada</h2>
             <p className="text-[#6E6E73] text-sm leading-tight mb-6">
               Comparte este código con tu atleta para que importe la sesión directamente a su planificador.
             </p>
             
             <div className="bg-[#FFF3EC] border border-[#FF6B00]/30 rounded-2xl py-4 mb-6 relative">
                 <span className="font-condensed font-black text-[#FF6B00] text-5xl tracking-[0.2em]">{code}</span>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={handleCopy}
                   className="py-3 px-2 bg-[#F5F5F0] border border-[#E8E8E4] rounded-xl font-condensed font-bold text-[#1C1C1E] flex items-center justify-center gap-2 active:scale-95 transition-all text-sm uppercase tracking-wide"
                 >
                   {copied ? <div className="text-green-600 font-black">¡COPIADO!</div> : <><Copy size={16} /> Copiar</>}
                 </button>
                 <button 
                   onClick={handleWhatsApp}
                   className="py-3 px-2 bg-[#25D366] text-white rounded-xl font-condensed font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_4px_12px_rgba(37,211,102,0.3)]"
                 >
                   <Share2 size={16} fill="white" /> WhatsApp
                 </button>
             </div>
          </div>
       </div>
    </div>
  );
}
