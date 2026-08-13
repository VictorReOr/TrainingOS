import React from 'react';
import { RotateCcw, Play } from 'lucide-react';

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'hace unos segundos';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return `hace ${Math.floor(diff / 86400)}d`;
}

function countDoneSets(exerciseLogs) {
  let done = 0, total = 0;
  Object.values(exerciseLogs || {}).forEach(sets => {
    sets.forEach(s => { total++; if (s.done) done++; });
  });
  return { done, total };
}

export default function DraftRecoveryModal({ draft, currentSessionName, onContinue, onDiscard }) {
  if (!draft) return null;

  const draftName = draft.activeSession?.name || 'Sesión';
  const { done, total } = countDoneSets(draft.exerciseLogs);
  const ago = draft.savedAt ? timeAgo(draft.savedAt) : '';

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end md:justify-center md:items-center bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full md:max-w-md bg-card rounded-t-2xl md:rounded-2xl border-t border-l border-r md:border border-border px-6 pt-5 pb-[calc(1.5rem+var(--safe-bottom))] shadow-lg relative animate-slide-up">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5 md:hidden" />

        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-mono text-[8px] text-signal-orange font-bold tracking-widest uppercase border border-signal-orange/40 px-1.5 py-0.5 rounded">
            SESIÓN SIN TERMINAR
          </span>
        </div>

        <h3 className="font-display font-black text-2xl text-ink mb-1 uppercase tracking-wide">
          {draftName}
        </h3>

        <p className="font-mono text-[10px] text-muted uppercase tracking-wider leading-relaxed mb-5">
          {ago} · {done}/{total} series completadas
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onContinue}
            className="w-full py-3.5 bg-signal-orange text-ink font-display font-black text-xl rounded-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
          >
            <Play size={18} /> Continuar Sesión
          </button>
          <button
            onClick={onDiscard}
            className="w-full py-2.5 text-muted font-mono font-bold text-xs uppercase tracking-wider hover:text-ink transition-colors cursor-pointer flex items-center justify-center gap-1"
          >
            <RotateCcw size={12} /> Empezar de Nuevo
          </button>
        </div>
      </div>
    </div>
  );
}
