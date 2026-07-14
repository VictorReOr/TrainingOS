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
        border-b border-border transition-all duration-200
        ${isDone
          ? 'bg-bg/40 opacity-70'
          : isActive
          ? 'bg-card border-l-4 border-l-signal-orange'
          : 'bg-card hover:bg-bg/25 active:bg-bg/40'
        }
      `}
    >
      {/* Checkbox */}
      <div
        className={`w-7 h-7 flex-shrink-0 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all duration-300 ${
          isDone
            ? 'border-signal-orange bg-signal-orange'
            : 'border-border bg-transparent'
        }`}
      >
        {isDone && <Check size={14} strokeWidth={3} className="text-ink" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[9px] text-muted tracking-widest uppercase mb-1">
          {exercise.orderNumber}
        </div>
        <div
          className={`font-condensed font-black text-[17px] uppercase tracking-wide leading-tight transition-all duration-200 flex items-center gap-2 flex-wrap ${
            isDone ? 'text-muted line-through opacity-70' : 'text-ink'
          }`}
        >
          <span>{exercise.name}</span>
          {exercise.isTest && (
            <span className="font-mono text-[8px] font-bold text-corner-red border border-corner-red/40 px-1.5 py-0.5 rounded tracking-widest inline-block leading-none uppercase">
              TEST {exercise.testType || 'AMRAP'}
            </span>
          )}
        </div>

        {/* Pills — solo borde técnico */}
        <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
          {exercise.series && exercise.reps && (
            <span className="inline-block border border-border text-muted text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-md tracking-wider uppercase">
              {exercise.series} × {exercise.reps}
            </span>
          )}
          {exercise.tempo && (
            <span className="inline-block border border-border text-muted text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-md tracking-wider uppercase">
              TEMPO: {exercise.tempo}
            </span>
          )}
          {exercise.restSeconds && (
            <span className="inline-block border border-border text-muted text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-md tracking-wider uppercase">
              REST: {exercise.restSeconds}s
            </span>
          )}
          {exercise.notes && (
            <span className="inline-block border border-border text-muted text-[10px] font-sans font-medium px-2.5 py-0.5 rounded-md tracking-wide break-words max-w-full">
              {exercise.notes}
            </span>
          )}
          {hasHistory && (
            <span className={`inline-flex items-center gap-0.5 border text-[9px] font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
              isDeloadSuggested
                ? 'border-corner-red/25 text-corner-red bg-corner-red/5'
                : weeklyImprovePct > 0
                ? 'border-success-green/25 text-success-green bg-success-green/5'
                : 'border-corner-blue/25 text-corner-blue bg-corner-blue/5'
            }`}>
              {isDeloadSuggested ? (
                <>DESCARGA</>
              ) : (
                <>
                  {trendDirection === 'up' || weeklyImprovePct > 0 ? '▲' : trendDirection === 'down' ? '▼' : '■'}{' '}
                  {weeklyImprovePct > 0 ? `+${weeklyImprovePct}%` : 'ESTABLE'}
                </>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
