import React, { useMemo } from 'react';
import { RotateCcw } from 'lucide-react';

const MESSAGES = [
  { min: 0,   max: 1,   text: '¡Arranca fuerte!' },
  { min: 1,   max: 30,  text: 'Calentando motores…' },
  { min: 30,  max: 60,  text: 'A buen ritmo 💪' },
  { min: 60,  max: 85,  text: '¡Ya casi! No pares.' },
  { min: 85,  max: 99,  text: 'Último esfuerzo 🔥' },
  { min: 99,  max: 101, text: '💥 ¡COMPLETADO!' },
];

export default function ProgressBar({ percentage, onReset }) {
  const isComplete = percentage >= 100;

  const message = useMemo(() => {
    return MESSAGES.find(m => percentage >= m.min && percentage < m.max)?.text || '💥 ¡COMPLETADO!';
  }, [percentage]);

  return (
    <div className="mb-6 px-0">
      {/* Row: label + percentage + reset */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#6E6E73] font-medium">{message}</span>
        <div className="flex items-center gap-3">
          <span
            className={`font-condensed font-black text-2xl leading-none tabular-nums ${
              isComplete ? 'text-[#FF6B00]' : 'text-[#1C1C1E]'
            }`}
          >
            {percentage}%
          </span>
          <button
            onClick={onReset}
            className="flex items-center gap-1 border border-[#E8E8E4] text-[#6E6E73] text-xs px-2.5 py-1.5 rounded-lg hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors"
          >
            <RotateCcw size={12} />
            <span className="font-sans font-medium">Reset</span>
          </button>
        </div>
      </div>

      {/* Track */}
      <div className="h-3 bg-[#E8E8E4] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isComplete ? 'flash-green' : ''
          }`}
          style={{
            width: `${percentage}%`,
            background: isComplete
              ? '#FF6B00'
              : 'linear-gradient(90deg, #E85D04 0%, #FF6B00 100%)',
          }}
        />
      </div>
    </div>
  );
}
