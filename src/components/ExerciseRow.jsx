import React from 'react';
import { Check } from 'lucide-react';
import { useProgressiveOverload } from '../hooks/useProgressiveOverload';

export default function ExerciseRow({ exercise, sessionType = 'gym', isDone, isActive, onToggle }) {
  const { weeklyImprovePct, isDeloadSuggested, trendDirection, hasHistory } = useProgressiveOverload(
    exercise.id,
    exercise.name,
    exercise.reps || exercise.targetReps,
    sessionType
  );

  return (
    <div
      onClick={onToggle}
      className={`
        flex items-start gap-4 px-4 py-4 cursor-pointer select-none
        border-b border-[#E8E8E4] transition-all duration-200
        ${isDone
          ? 'bg-[#F5F5F0] opacity-60'
          : isActive
          ? 'bg-white border-l-4 border-l-[#FF6B00]'
          : 'bg-white hover:bg-[#FAFAFA] active:bg-[#F5F5F0]'
        }
      `}
    >
      {/* Checkbox */}
      <div
        className={`w-7 h-7 flex-shrink-0 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all duration-300 ${
          isDone
            ? 'border-[#FF6B00] bg-[#FF6B00]'
            : 'border-[#E8E8E4] bg-transparent'
        }`}
      >
        {isDone && <Check size={14} strokeWidth={3} color="#1C1C1E" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-condensed font-bold text-[10px] text-[#6E6E73] tracking-widest uppercase mb-1">
          {exercise.orderNumber}
        </div>
        <div
          className={`font-sans font-semibold text-sm leading-snug transition-all duration-200 flex items-center gap-1.5 flex-wrap ${
            isDone ? 'text-[#6E6E73] line-through' : 'text-[#1C1C1E]'
          }`}
        >
          <span>{exercise.name}</span>
          {exercise.isTest && (
            <span className="bg-[#FF6B00] text-[#1C1C1E] text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest inline-block leading-none">
              🏆 TEST {exercise.testType || 'AMRAP'}
            </span>
          )}
        </div>

        {/* Pills — solo borde, sin relleno */}
        <div className="mt-2 flex flex-wrap gap-1.5 items-center">
          {exercise.series && exercise.reps && (
            <span className="inline-block border border-[#E8E8E4] text-[#6E6E73] text-xs font-sans font-medium px-2.5 py-0.5 rounded-md tracking-wide">
              {exercise.series} × {exercise.reps}
            </span>
          )}
          {exercise.tempo && (
            <span className="inline-block border border-[#E8E8E4] text-[#6E6E73] text-xs font-sans font-medium px-2.5 py-0.5 rounded-md tracking-wide">
              {exercise.tempo}
            </span>
          )}
          {exercise.restSeconds && (
            <span className="inline-block border border-[#E8E8E4] text-[#6E6E73] text-xs font-sans font-medium px-2.5 py-0.5 rounded-md tracking-wide">
              ⏱ {exercise.restSeconds}s
            </span>
          )}
          {exercise.notes && (
            <span className="inline-block border border-[#E8E8E4] text-[#6E6E73] text-xs font-sans font-medium px-2.5 py-0.5 rounded-md tracking-wide break-words max-w-full">
              {exercise.notes}
            </span>
          )}
          {hasHistory && (
            <span className={`inline-flex items-center gap-0.5 border text-[11px] font-sans font-bold px-2 py-0.5 rounded-md ${
              isDeloadSuggested
                ? 'border-red-200 text-red-500 bg-red-50'
                : weeklyImprovePct > 0
                ? 'border-green-200 text-green-600 bg-green-50'
                : 'border-blue-200 text-blue-500 bg-blue-50'
            }`}>
              {isDeloadSuggested ? (
                <>🔄 Descarga</>
              ) : (
                <>
                  {trendDirection === 'up' || weeklyImprovePct > 0 ? '↗' : trendDirection === 'down' ? '↘' : '→'}{' '}
                  {weeklyImprovePct > 0 ? `+${weeklyImprovePct}%` : 'Estable'}
                </>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
