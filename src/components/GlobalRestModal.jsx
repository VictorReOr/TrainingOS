import React from 'react';
import { useTimer } from '../context/TimerContext';
import { X, FastForward, Square } from 'lucide-react';

const formatTime = (ms) => {
  const totalS = Math.floor(ms / 1000);
  const minutes = Math.floor(totalS / 60).toString().padStart(2, '0');
  const seconds = (totalS % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export default function GlobalRestModal() {
  const { status, timeMs, showRestModal, setShowRestModal, stopTimer, startRest } = useTimer();

  if (!showRestModal) return null;

  const isLastSeconds = timeMs <= 3000 && timeMs > 0 && status === 'running';

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[70] transition-opacity duration-300"
        onClick={() => setShowRestModal(false)}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-sm z-[80] animate-fade-in">
        <div
          className={`bg-white rounded-3xl overflow-hidden shadow-2xl border-2 transition-all duration-300 ${
            isLastSeconds ? 'border-red-400' : 'border-[#FF6B00]'
          }`}
        >
          {/* Header */}
          <div className={`px-6 pt-6 pb-4 flex items-center justify-between border-b border-[#E8E8E4] ${
            isLastSeconds ? 'bg-red-50' : 'bg-[#FFF3EC]'
          }`}>
            <div>
              <p className="text-[10px] font-condensed font-bold tracking-widest uppercase text-[#6E6E73] mb-0.5">
                {status === 'running' ? 'DESCANSANDO' : 'TIEMPO DE DESCANSO'}
              </p>
              <h3 className={`font-condensed font-black text-xl ${isLastSeconds ? 'text-red-500' : 'text-[#E85D04]'}`}>
                {status === 'running' ? 'Recupera energía' : 'Elige tu descanso'}
              </h3>
            </div>
            <button
              onClick={() => setShowRestModal(false)}
              className="p-2 bg-white border border-[#E8E8E4] text-[#6E6E73] rounded-full hover:text-[#1C1C1E] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-6 py-6">
            {status === 'running' ? (
              <>
                {/* Countdown */}
                <div className={`text-center mb-6 py-4 rounded-2xl ${isLastSeconds ? 'bg-red-50 animate-pulse' : 'bg-[#F5F5F0]'}`}>
                  <div className={`font-condensed font-black leading-none tracking-tighter tabular-nums ${
                    isLastSeconds ? 'text-red-500 text-[72px]' : 'text-[#1C1C1E] text-[80px]'
                  }`}>
                    {formatTime(timeMs)}
                  </div>
                  {isLastSeconds && (
                    <p className="text-red-400 font-condensed font-bold text-sm tracking-wider mt-1">
                      ¡PREPÁRATE!
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={stopTimer}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-[#E8E8E4] text-[#6E6E73] rounded-2xl font-condensed font-bold tracking-wide hover:border-[#1C1C1E] hover:text-[#1C1C1E] transition-colors"
                  >
                    <Square size={16} /> PARAR
                  </button>
                  <button
                    onClick={() => { stopTimer(); setShowRestModal(false); }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#FF6B00] text-white rounded-2xl font-condensed font-black tracking-wide shadow-[0_4px_12px_rgba(255,107,0,0.3)] active:scale-95 transition-transform"
                  >
                    <FastForward size={16} /> SALTAR
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {[30, 60, 90, 120, 150, 180].map(s => (
                  <button
                    key={s}
                    onClick={() => startRest(s)}
                    className="py-4 bg-[#F5F5F0] rounded-2xl border-2 border-[#E8E8E4] font-condensed font-black text-2xl text-[#1C1C1E] hover:border-[#FF6B00] hover:bg-[#FFF3EC] hover:text-[#E85D04] transition-all active:scale-95"
                  >
                    {s}s
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
