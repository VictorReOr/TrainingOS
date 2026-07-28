import React from 'react';
import { useAthlete } from '../../context/AthleteContext';

const PRIORITY_STYLES = {
  critical: { bg: 'bg-[#e8412a]/10', text: 'text-[#e8412a]', border: 'border-[#e8412a]/20' },
  high:     { bg: 'bg-[#FF5A00]/10', text: 'text-[#FF5A00]', border: 'border-[#FF5A00]/20' },
  medium:   { bg: 'bg-[#f5a623]/10', text: 'text-[#f5a623]', border: 'border-[#f5a623]/20' },
  low:      { bg: 'bg-[#6B7280]/10', text: 'text-[#6B7280]', border: 'border-[#6B7280]/20' },
};

const PRIORITY_LABELS = {
  critical: 'CRÍTICO', high: 'ALTA', medium: 'MEDIA', low: 'BAJA'
};

export default function RecommendationCard({ recommendation, onApprove, onReject, readOnly = true }) {
  const { athlete } = useAthlete();
  const canAct = !readOnly && (athlete?.role === 'coach' || athlete?.role === 'both');
  const { type, priority = 'medium', title, message, action, confidence = 0.8 } = recommendation;
  const styles = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.medium;

  return (
    <div className={`bg-white border ${styles.border} rounded-2xl p-4 flex flex-col gap-3 shadow-sm`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="font-condensed font-black text-base text-[#111827] leading-snug flex-1">{title}</p>
        <span className={`${styles.bg} ${styles.text} font-mono font-bold text-[9px] px-2 py-0.5 rounded-lg uppercase tracking-wider shrink-0`}>
          {PRIORITY_LABELS[priority]}
        </span>
      </div>

      {/* Message */}
      <p className="font-sans text-xs text-[#6B7280] leading-relaxed">{message}</p>

      {/* Action */}
      {action && (
        <div className="bg-[#F3F4F6] rounded-xl p-3">
          <p className="font-mono text-[10px] text-[#111827] font-bold uppercase tracking-wider mb-0.5">Acción sugerida</p>
          <p className="font-sans text-xs text-[#6B7280]">{action}</p>
        </div>
      )}

      {/* Confidence bar */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] text-[#6B7280] uppercase tracking-wider shrink-0">Confianza</span>
        <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#FF5A00]"
            style={{ width: `${Math.round(confidence * 100)}%` }}
          />
        </div>
        <span className="font-mono text-[9px] text-[#6B7280] shrink-0">{Math.round(confidence * 100)}%</span>
      </div>

      {/* Coach actions */}
      {canAct && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onApprove?.(recommendation)}
            className="flex-1 py-2 bg-[#27ae60] text-white font-mono font-bold text-[10px] uppercase tracking-wider rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
          >
            ✓ Aprobar
          </button>
          <button
            onClick={() => onReject?.(recommendation)}
            className="flex-1 py-2 border border-[#E5E7EB] text-[#6B7280] font-mono font-bold text-[10px] uppercase tracking-wider rounded-xl hover:border-[#111827] transition-colors cursor-pointer"
          >
            ✗ Ajustar
          </button>
        </div>
      )}
    </div>
  );
}
