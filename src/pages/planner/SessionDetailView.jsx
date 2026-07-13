import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MOCK_SESSION_DETAILS } from '../../data/mockPlanner';
import { ArrowLeft, Clock, Dumbbell, ChevronRight, Share, UploadCloud } from 'lucide-react';
import ExportSessionModal from '../../components/ExportSessionModal';

const INTENSITY_COLORS = {
  'Baja':   { bg: 'bg-green/15',   text: 'text-green'   },
  'Media':  { bg: 'bg-blue/15',    text: 'text-blue'    },
  'Alta':   { bg: 'bg-accent2/15', text: 'text-accent2' },
  'Máxima': { bg: 'bg-accent/15',  text: 'text-accent'  },
};

export default function SessionDetailView() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const session = state?.session;
  const [showExport, setShowExport] = React.useState(false);

  if (!session) {
    navigate('/plan');
    return null;
  }

  const detail = MOCK_SESSION_DETAILS[session.sessionId];
  const intCfg = INTENSITY_COLORS[session.intensity] || INTENSITY_COLORS['Media'];

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text">
      {/* HEADER */}
      <div
        className="px-5 pt-6 pb-5 sticky top-0 z-10"
        style={{
          background: `linear-gradient(135deg, ${session.icon ? '#1a1f2e' : '#1a1f2e'} 0%, #0f1117 100%)`,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted text-sm font-bold hover:text-text transition-colors"
          >
            <ArrowLeft size={18} /> Planificador
          </button>
          
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#FF6B00] bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm shadow-sm"
          >
            <UploadCloud size={14} /> Exportar
          </button>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center text-3xl shrink-0">
            {session.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted font-bold tracking-widest uppercase mb-1">{state.dayLabel}</p>
            <h1 className="font-condensed font-black text-2xl leading-tight">{session.name}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm text-muted">
                <Clock size={13} />
                <span>{session.duration} min</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted">
                <Dumbbell size={13} />
                <span>{session.exercises} ejercicios</span>
              </div>
              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${intCfg.bg} ${intCfg.text}`}>
                {session.intensity}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-4 py-5 space-y-3 pb-24">
        {/* Read-only banner */}
        <div className="flex items-center gap-2 bg-blue/10 border border-blue/20 rounded-xl px-4 py-3">
          <span className="text-xl">📋</span>
          <div>
            <p className="text-blue font-bold text-sm">Vista de Planificación</p>
            <p className="text-blue/70 text-xs">Solo lectura · Para ejecutar abre la sesión del día actual</p>
          </div>
        </div>

        {/* Exercise blocks */}
        {detail ? (
          <div className="space-y-2">
            {detail.blocks.map((block, i) => (
              <div key={i} className="bg-surface rounded-2xl border border-border p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-bg border border-border flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-muted">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[15px] leading-tight">{block.name}</h3>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-sm text-muted">
                        <span className="font-bold text-text">{block.sets}</span> series
                      </span>
                      <span className="text-muted">·</span>
                      <span className="text-sm text-muted">
                        <span className="font-bold text-text">{block.reps}</span> reps
                      </span>
                      {block.rest > 0 && (
                        <>
                          <span className="text-muted">·</span>
                          <span className="text-sm text-muted">
                            <span className="font-bold text-blue">{block.rest}s</span> rest
                          </span>
                        </>
                      )}
                    </div>
                    {block.notes && (
                      <p className="text-xs text-muted mt-1.5 italic">💡 {block.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface rounded-2xl border border-border p-8 text-center text-muted">
            <Dumbbell size={32} className="mx-auto opacity-30 mb-3" />
            <p className="font-bold">Sin detalle disponible</p>
            <p className="text-sm opacity-60 mt-1">El detalle de esta sesión se cargará cuando conectemos el backend</p>
          </div>
        )}
      </div>

      {showExport && (
        <ExportSessionModal 
          sessionData={session} 
          onClose={() => setShowExport(false)} 
        />
      )}
    </div>
  );
}
