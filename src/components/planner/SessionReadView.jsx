import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { usePlanner } from '../../context/PlannerContext';
import { useRole } from '../../hooks/useRole';
import { MOCK_SESSION_DETAILS } from '../../data/mockPlanner';
import { MOCK_SESSION } from '../../data/mockSession';
import { X, Play, Clock, Dumbbell, UploadCloud } from 'lucide-react';
import ExportSessionModal from '../ExportSessionModal';
import FeedbackSection from '../FeedbackSection';

const INTENSITY_COLORS = {
  'Baja':   { bg: 'rgba(39,174,96,0.15)',   text: '#27ae60' },
  'Media':  { bg: 'rgba(61,125,212,0.15)',  text: '#3d7dd4' },
  'Alta':   { bg: 'rgba(245,166,35,0.15)',  text: '#f5a623' },
  'Máxima': { bg: 'rgba(232,65,42,0.15)',   text: '#e8412a' },
};

const isPastDay = (dayDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dayDate);
  d.setHours(0, 0, 0, 0);
  return d < today;
};

const isTodayDate = (dayDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dayDate);
  d.setHours(0, 0, 0, 0);
  return d.getTime() === today.getTime();
};

const formatFullDate = (date) => {
  const months = ['enero','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const d = new Date(date);
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
};

export default function SessionReadView({ session, dayDate, dayLabel, onClose }) {
  const navigate = useNavigate();
  const { loadSession } = useSession();
  const { sessionTemplates } = usePlanner();
  const { isCoach } = useRole();
  const [isVisible, setIsVisible] = useState(false);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // Find the real session blocks
  const template = sessionTemplates.find(t => t.id === session.sessionId);
  let finalBlocks = [];
  
  if (template && template.blocks) {
    finalBlocks = template.blocks;
  } else if (MOCK_SESSION_DETAILS[session.sessionId]?.blocks) {
    // Transform mock detail into Session.jsx-compatible format
    finalBlocks = [{
      id: 'blk-plan-1',
      name: session.name,
      type: session.type,
      icon: session.icon,
      duration: `${session.duration} min`,
      exercises: MOCK_SESSION_DETAILS[session.sessionId].blocks.map((b, i) => ({
        id: `ex-plan-${i}`,
        orderNumber: String(i + 1).padStart(2, '0'),
        name: b.name,
        series: String(b.sets),
        reps: String(b.reps),
        notes: b.notes || '',
        restSeconds: b.rest || 0,
        suggestedWeight: b.suggestedWeight || null,
      }))
    }];
  } else if (session.sessionId === 'session-demo') {
    finalBlocks = MOCK_SESSION.blocks;
  }

  const handleExecute = () => {
    // Transform mock detail into Session.jsx-compatible format
    const sessionData = {
      id: session.sessionId,
      name: session.name,
      dayBadge: `${dayLabel?.toUpperCase() || ''} · ${session.sport?.toUpperCase() || ''}`,
      blocks: finalBlocks,
    };
    loadSession(sessionData);
    navigate('/session');
  };

  const intCfg = INTENSITY_COLORS[session.intensity] || INTENSITY_COLORS['Media'];
  const isToday = isTodayDate(dayDate);
  const isPast = isPastDay(dayDate);

  // Build a shareable payload from session + detail data
  const exportPayload = {
    id: session.sessionId,
    name: session.name,
    type: session.type,
    icon: session.icon,
    blocks: finalBlocks
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/70 z-[80] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Sheet — 95% height */}
      <div
        className={`fixed bottom-0 left-0 w-full bg-[#14172080] rounded-t-3xl z-[80] transition-transform duration-300 ease-out flex flex-col`}
        style={{
          height: '95dvh',
          backdropFilter: 'blur(20px)',
          backgroundColor: '#14172099',
          background: 'linear-gradient(180deg, #1a1f2e 0%, #0f1117 100%)',
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* Handle + close */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2 shrink-0">
          <div className="w-10 h-1.5 bg-border rounded-full mx-auto absolute left-1/2 -translate-x-1/2" />
          <div className="flex-1" />
          <button onClick={handleClose} className="p-1.5 bg-surface/80 text-muted rounded-full border border-border">
            <X size={18} />
          </button>
        </div>

        {/* HEADER */}
        <div className="px-5 pt-2 pb-5 border-b border-white/5 shrink-0">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs font-black px-3 py-1 rounded-full bg-white/10 text-muted tracking-widest">
              {dayLabel ? dayLabel.toUpperCase() : ''} · {formatFullDate(dayDate)}
            </span>
            {isToday && (
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-accent/20 text-accent border border-accent/30 tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse inline-block" /> HOY
              </span>
            )}
            {isPast && !isToday && (
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-muted/15 text-muted tracking-widest">
                PENDIENTE
              </span>
            )}
          </div>

          {/* Session title */}
          <div className="flex items-start gap-3">
            <span className="text-4xl">{session.icon}</span>
            <div className="flex-1 min-w-0">
              <h2 className="font-condensed font-black text-3xl leading-tight">{session.name}</h2>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm text-muted">
                  <Clock size={14} />
                  <span>{session.duration} min</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted">
                  <Dumbbell size={14} />
                  <span>{session.exercises} ejercicios</span>
                </div>
                <span
                  className="text-[11px] font-black px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: intCfg.bg, color: intCfg.text }}
                >
                  {session.intensity}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* EXERCISE BLOCKS — scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {/* Info banner */}
          <div className="flex items-center gap-2 bg-blue/8 border border-blue/15 rounded-xl px-4 py-3 mb-1">
            <span className="text-lg">📋</span>
            <p className="text-blue/80 text-xs font-bold">Vista de planificación · Solo lectura</p>
          </div>

          {finalBlocks.length > 0 ? (
            finalBlocks.map((block, bi) => (
              <div key={block.id || bi} className="bg-surface rounded-2xl border border-border overflow-hidden mb-3">
                <div className="flex items-center gap-3 px-4 py-2.5 bg-card/50 border-b border-border/50">
                   <span className="text-xl w-6 text-center">{block.icon || '💪'}</span>
                   <span className="font-bold text-sm flex-1">{block.name}</span>
                </div>
                {block.exercises && block.exercises.map((ex, ei) => (
                  <div key={ex.id || ei} className="px-4 py-2.5 border-b border-border/30 last:border-0">
                     <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">{ex.name}</span>
                        <div className="flex items-center gap-1.5 text-xs text-muted">
                           <span className="font-bold text-text">{ex.series}</span>×
                           <span className="font-bold text-text">{ex.reps}</span>
                           {ex.suggestedWeight?.min && ex.suggestedWeight?.max && (
                             <>
                               <span className="text-border">·</span>
                               <span className="text-[#FF6B00] font-bold">💡 {ex.suggestedWeight.min}-{ex.suggestedWeight.max}kg</span>
                             </>
                           )}
                           {ex.restSeconds > 0 && (
                             <>
                               <span className="text-border">·</span>
                               <span>{ex.restSeconds}s desc.</span>
                             </>
                           )}
                        </div>
                     </div>
                     {ex.notes && <p className="text-xs text-muted italic mt-1 bg-black/5 p-2 rounded">💡 {ex.notes}</p>}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="bg-surface rounded-2xl border border-border p-8 text-center text-muted">
              <Dumbbell size={32} className="mx-auto opacity-30 mb-3" />
              <p className="font-bold">Detalle no disponible</p>
              <p className="text-sm opacity-60 mt-1">Se cargará al conectar el backend (Prompt 2.4)</p>
            </div>
          )}

          {/* Coach Feedback / Notes */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-4 mt-3">
            <h4 className="font-bold text-sm text-white/80 mb-3 flex items-center gap-2">
              💬 Notas del entrenador
            </h4>
            <FeedbackSection
              sessionId={session.sessionId}
              atletaId={import.meta.env.VITE_ATLETA_ID || 'v-atleta-1'}
              readOnly={!isCoach}
              darkMode={true}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div
          className="px-4 py-4 border-t border-white/5 flex gap-3 shrink-0"
          style={{ paddingBottom: 'calc(1rem + var(--safe-bottom, 0px))' }}
        >
          <button
            onClick={handleClose}
            className="flex-1 py-3.5 rounded-2xl bg-surface border border-border font-bold text-muted text-sm active:scale-[0.98] transition-transform"
          >
            Volver
          </button>
          {/* Exportar */}
          <button
            onClick={() => setShowExport(true)}
            className="flex-1 py-3.5 rounded-2xl bg-white border-2 border-[#FF6B00]/30 text-[#FF6B00] font-condensed font-bold text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform uppercase tracking-wide"
          >
            <UploadCloud size={16} /> Exportar
          </button>
          {/* Editar — solo si hay sessionId */}
          {session.sessionId && (
            <button
              onClick={() => { handleClose(); setTimeout(() => navigate(`/plan/session/${session.sessionId}/edit`), 310); }}
              className="flex-1 py-3.5 rounded-2xl bg-surface border border-blue/30 font-bold text-blue text-sm active:scale-[0.98] transition-transform"
            >
              ✏️ Editar
            </button>
          )}
          {(isToday || !isPast) && (
            <button
              onClick={handleExecute}
              className="flex-[2] py-3.5 rounded-2xl bg-accent font-condensed font-bold text-white text-lg flex items-center justify-center gap-2 shadow-lg shadow-accent/25 active:scale-[0.98] transition-transform"
            >
              <Play size={18} fill="white" />
              {isToday ? 'Ejecutar HOY' : 'Ejecutar'}
            </button>
          )}
        </div>

      </div>

      {/* EXPORT MODAL — renders on top of the sheet */}
      {showExport && (
        <ExportSessionModal
          sessionData={exportPayload}
          onClose={() => setShowExport(false)}
        />
      )}
    </>
  );
}
