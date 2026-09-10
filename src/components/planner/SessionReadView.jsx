import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { usePlanner } from '../../context/PlannerContext';
import { useAthlete } from '../../context/AthleteContext';
import { useRole } from '../../hooks/useRole';
import { saveLog as _saveLog, getAtletaId } from '../../services/sheets';
import { MOCK_SESSION_DETAILS } from '../../data/mockPlanner';
import { MOCK_SESSION } from '../../data/mockSession';
import {
  X,
  Play,
  Clock,
  Dumbbell,
  UploadCloud,
  ClipboardEdit,
  Check,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
  ClipboardList,
  MessageSquare
} from 'lucide-react';
import ExportSessionModal from '../ExportSessionModal';
import FeedbackSection from '../FeedbackSection';

const LS_SESSION_LOGS = 'trainingos_session_logs';

const SUPERSET_COLOR_CYCLE = ['signal-orange', 'belt-gold', 'corner-red'];

const SUPERSET_STYLES = {
  'signal-orange': {
    border: 'border-l-signal-orange',
    bg: 'bg-signal-orange/[0.03]',
    badgeText: 'text-signal-orange',
    badgeBorder: 'border-signal-orange/25',
    badgeBg: 'bg-signal-orange/10',
  },
  'belt-gold': {
    border: 'border-l-belt-gold',
    bg: 'bg-belt-gold/[0.03]',
    badgeText: 'text-belt-gold',
    badgeBorder: 'border-belt-gold/25',
    badgeBg: 'bg-belt-gold/10',
  },
  'corner-red': {
    border: 'border-l-corner-red',
    bg: 'bg-corner-red/[0.03]',
    badgeText: 'text-corner-red',
    badgeBorder: 'border-corner-red/25',
    badgeBg: 'bg-corner-red/10',
  },
};

const INTENSITY_COLORS = {
  'Baja':   { bg: 'bg-success-green/10', text: 'text-success-green', border: 'border-success-green/25' },
  'Media':  { bg: 'bg-corner-blue/10',   text: 'text-corner-blue',   border: 'border-corner-blue/25' },
  'Alta':   { bg: 'bg-signal-orange/10', text: 'text-signal-orange', border: 'border-signal-orange/25' },
  'Máxima': { bg: 'bg-corner-red/10',    text: 'text-corner-red',    border: 'border-corner-red/25' },
};

const isPastOrToday = (dayDate) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const d = new Date(dayDate);
  d.setHours(0, 0, 0, 0);
  return d <= today;
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

/** Check if a session already has a log for a given date (YYYY-MM-DD prefix) */
function hasLogForDate(sessionId, dayDate) {
  try {
    const logs = JSON.parse(localStorage.getItem(LS_SESSION_LOGS) || '[]');
    const datePrefix = new Date(dayDate).toISOString().slice(0, 10);
    return logs.some(l => l.sessionId === sessionId && l.fecha?.startsWith(datePrefix));
  } catch {
    return false;
  }
}

/** Build initial per-exercise log state from blocks */
function buildInitialLogs(blocks) {
  const result = {};
  (blocks || []).forEach(block => {
    (block.exercises || []).forEach(ex => {
      const numSets = parseInt(ex.series || ex.sets || '3') || 3;
      result[ex.id] = Array.from({ length: numSets }, () => ({
        carga: ex.prescribedLoad ? String(ex.prescribedLoad) : (ex.loadRef ? String(ex.loadRef) : ''),
        reps: ex.reps || ex.targetReps || '',
        rpe: null,
        rir: null,
        velocidad: null,
        calidadTecnica: null,
        done: false,
      }));
    });
  });
  return result;
}

// ─── Retroactive Logger ─────────────────────────────────────────────────────
function RetroactiveLogger({ blocks, sessionId, sessionName, dayDate, onSaved, onCancel }) {
  // Flatten all exercises across blocks for wizard navigation
  const allExercises = (blocks || []).flatMap(block =>
    (block.exercises || []).map(ex => ({ ...ex, _blockName: block.name || block.type || '' }))
  );

  const [exIndex, setExIndex] = useState(0);
  const [logs, setLogs] = useState(() => buildInitialLogs(blocks));
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const ex = allExercises[exIndex];
  const exLogs = ex ? (logs[ex.id] || []) : [];

  const updateLog = useCallback((setIdx, field, value) => {
    if (!ex) return;
    setLogs(prev => {
      const copy = [...(prev[ex.id] || [])];
      copy[setIdx] = { ...copy[setIdx], [field]: value };
      return { ...prev, [ex.id]: copy };
    });
  }, [ex]);

  const toggleSet = useCallback((setIdx) => {
    if (!ex) return;
    setLogs(prev => {
      const copy = [...(prev[ex.id] || [])];
      copy[setIdx] = { ...copy[setIdx], done: !copy[setIdx].done };
      return { ...prev, [ex.id]: copy };
    });
  }, [ex]);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      // Use the real session date, not today
      const sessionDate = new Date(dayDate);
      sessionDate.setHours(12, 0, 0, 0); // noon to avoid timezone midnight issues
      const fecha = sessionDate.toISOString();

      // Collect exercises matching SessionContext.saveSession format
      const ejerciciosArray = (blocks || []).flatMap(block =>
        (block.exercises || []).map(ex => ({
          id: ex.id,
          nombre: ex.name,
          seriesLog: (logs[ex.id] || []).map(s => ({
            carga: s.carga,
            reps: s.reps,
            rpe: s.rpe ?? null,
            rir: s.rir ?? null,
            velocidad: s.velocidad ?? null,
            calidadTecnica: s.calidadTecnica ?? null,
            done: !!s.done,
          })),
        }))
      );

      // Calculate basic metrics
      let volTotal = 0;
      let rpeSum = 0;
      let rpeCount = 0;
      ejerciciosArray.forEach(({ seriesLog }) => {
        seriesLog.forEach(s => {
          if (s.done) {
            volTotal += (parseFloat(s.carga) || 0) * (parseInt(s.reps) || 0);
            if (s.rpe) { rpeSum += parseFloat(s.rpe); rpeCount++; }
          }
        });
      });
      const rpeMedio = rpeCount > 0 ? (rpeSum / rpeCount).toFixed(1) : '0.0';

      const logEntry = {
        id: `session-log-retro-${Date.now()}`,
        fecha,                          // ← real session date (critical for PE)
        sessionId,
        sessionName: sessionName || 'Sesión',
        durationMinutes: 45,            // retroactive: no timer, use default
        rpe: rpeMedio,
        volumenTotal: Math.round(volTotal),
        ejercicios: ejerciciosArray,
        retroactive: true,              // audit flag
      };

      // Persist to localStorage — same pattern as SessionContext.saveSession
      const existing = JSON.parse(localStorage.getItem(LS_SESSION_LOGS) || '[]');
      localStorage.setItem(LS_SESSION_LOGS, JSON.stringify([logEntry, ...existing]));

      // Fire same events as SessionContext so PE / hooks react
      window.dispatchEvent(new Event('session_logs_updated'));
      window.dispatchEvent(new CustomEvent('new_session_saved', { detail: logEntry }));

      // Background sync to Sheets (non-blocking)
      _saveLog(logEntry).catch(e =>
        console.warn('[RetroactiveLogger] Sheets sync failed (offline/demo):', e)
      );

      setSaved(true);
      setTimeout(() => onSaved(), 1000);
    } finally {
      setIsSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10">
        <div className="w-14 h-14 rounded-full bg-success-green/10 border border-success-green/30 flex items-center justify-center">
          <Check size={28} className="text-success-green" />
        </div>
        <p className="font-condensed font-black text-xl text-ink uppercase tracking-wide">
          Sesión guardada
        </p>
        <p className="font-mono text-[10px] text-muted uppercase tracking-wider">
          {formatFullDate(dayDate)}
        </p>
      </div>
    );
  }

  if (!ex) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Wizard progress */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-muted uppercase tracking-widest font-bold">
          {ex._blockName}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExIndex(i => Math.max(0, i - 1))}
            disabled={exIndex === 0}
            className="p-1.5 rounded-lg border border-border text-muted disabled:opacity-30 hover:border-signal-orange hover:text-signal-orange transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="font-mono text-[10px] font-bold text-ink">
            {exIndex + 1} / {allExercises.length}
          </span>
          <button
            onClick={() => setExIndex(i => Math.min(allExercises.length - 1, i + 1))}
            disabled={exIndex === allExercises.length - 1}
            className="p-1.5 rounded-lg border border-border text-muted disabled:opacity-30 hover:border-signal-orange hover:text-signal-orange transition-colors cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-bg border border-border rounded-full overflow-hidden">
        <div
          className="h-full bg-signal-orange rounded-full transition-all duration-300"
          style={{ width: `${((exIndex + 1) / allExercises.length) * 100}%` }}
        />
      </div>

      {/* Exercise name */}
      <div className="bg-bg/40 p-3 rounded-xl border border-border">
        <p className="font-condensed font-black text-xl text-ink leading-tight uppercase">{ex.name}</p>
        <p className="font-mono text-[10px] text-muted uppercase tracking-widest mt-0.5 font-bold">
          {ex.series || ex.sets || 3} series · {(ex.reps ?? ex.targetReps) ?? '—'} reps
        </p>
      </div>

      {/* Series rows */}
      <div className="space-y-2.5">
        {exLogs.map((log, idx) => (
          <div
            key={idx}
            className={`rounded-xl border transition-all duration-200 overflow-hidden ${
              log.done ? 'border-signal-orange/60 bg-signal-orange/[0.04]' : 'border-border bg-card'
            }`}
          >
            <div className="flex items-center gap-3 px-3 py-2.5">
              {/* Done toggle */}
              <button
                onClick={() => toggleSet(idx)}
                className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  log.done ? 'bg-signal-orange border-signal-orange text-white' : 'bg-bg border-border hover:border-signal-orange'
                }`}
              >
                {log.done && <Check size={14} strokeWidth={3} className="text-white" />}
              </button>
              <span className="font-mono font-black text-xs text-muted w-6">S{idx + 1}</span>

              {/* Inputs */}
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <label className="text-[8px] text-muted font-mono font-bold uppercase tracking-widest mb-0.5">kg</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={log.carga}
                    onChange={e => updateLog(idx, 'carga', e.target.value)}
                    placeholder="0.0"
                    min="0"
                    max="500"
                    className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-ink focus:border-signal-orange outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[8px] text-muted font-mono font-bold uppercase tracking-widest mb-0.5">reps</label>
                  <input
                    type="text"
                    inputMode="text"
                    value={log.reps}
                    onChange={e => updateLog(idx, 'reps', e.target.value)}
                    placeholder={ex.reps || ex.targetReps || '0'}
                    className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-ink focus:border-signal-orange outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* RPE */}
            <div className="px-3 pb-2.5 pl-[3.25rem]">
              <div className="flex items-center gap-1">
                {[6, 7, 8, 9, 10].map(val => (
                  <button
                    key={val}
                    onClick={() => updateLog(idx, 'rpe', val)}
                    className={`flex-1 py-1 rounded-md text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                      log.rpe === val
                        ? 'bg-signal-orange border-signal-orange text-white'
                        : 'bg-bg border-border text-muted hover:border-signal-orange/50'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-border text-muted font-condensed font-black text-xs uppercase tracking-wide hover:bg-bg transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        {exIndex < allExercises.length - 1 ? (
          <button
            onClick={() => setExIndex(i => i + 1)}
            className="flex-[2] py-3 rounded-xl bg-bg border border-border text-ink font-condensed font-black text-base uppercase tracking-wide hover:bg-border/30 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            Siguiente <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-[2] py-3 rounded-xl bg-signal-orange font-condensed font-black text-white text-base uppercase tracking-wider shadow-md shadow-signal-orange/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSaving ? 'Guardando…' : <><Check size={16} /> Guardar sesión</>}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function SessionReadView({ session, dayDate, dayLabel, onClose }) {
  const navigate = useNavigate();
  const { loadSession } = useSession();
  const { athlete } = useAthlete();
  const { sessionTemplates, weekAssignments, assignSessionToDay, removeSessionFromDay } = usePlanner();
  const { isCoach } = useRole();
  const [isVisible, setIsVisible] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showRetroLogger, setShowRetroLogger] = useState(false);
  const [hasLog, setHasLog] = useState(() => hasLogForDate(session?.sessionId || session?.id, dayDate));
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  const formatISO = (d) => { const pad = n => n.toString().padStart(2, '0'); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
  const dateISO = formatISO(new Date(dayDate));
  const currentSession = weekAssignments[dateISO] || session;

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== currentSession.name) {
      assignSessionToDay(dateISO, { ...currentSession, name: editedName.trim() });
    }
    setIsEditingName(false);
  };

  const handleDeleteSession = () => {
    if (window.confirm(`¿Seguro que quieres borrar el entrenamiento "${currentSession?.name || 'Sesión'}" del ${dayLabel || 'día'}?`)) {
      removeSessionFromDay(dateISO);
      handleClose();
    }
  };

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const sId = session?.sessionId || session?.id;
  const template = sessionTemplates.find(t => t.id === sId);
  let finalBlocks = [];

  if (Array.isArray(session?.blocks) && session.blocks.length > 0) {
    finalBlocks = session.blocks;
  } else if (template && template.blocks) {
    finalBlocks = template.blocks;
  } else if (MOCK_SESSION_DETAILS[sId]?.blocks) {
    finalBlocks = [{
      id: 'blk-plan-1',
      name: currentSession.name,
      type: currentSession.type,
      icon: currentSession.icon,
      duration: `${currentSession.duration} min`,
      exercises: MOCK_SESSION_DETAILS[sId].blocks.map((b, i) => ({
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
  } else if (sId === 'session-demo') {
    finalBlocks = MOCK_SESSION.blocks;
  }

  const supersetColorMap = useMemo(() => {
    const map = {};
    let colorIndex = 0;
    finalBlocks.forEach(block => {
      (block.supersets || []).forEach(group => {
        if (!map[group.id]) {
          map[group.id] = SUPERSET_COLOR_CYCLE[colorIndex % SUPERSET_COLOR_CYCLE.length];
          colorIndex++;
        }
      });
    });
    return map;
  }, [finalBlocks]);

  const groupExercisesForRender = (exercises) => {
    const groups = [];
    let i = 0;
    while (i < exercises.length) {
      const ex = exercises[i];
      if (ex.supersetId) {
        const group = [ex];
        let j = i + 1;
        while (j < exercises.length && exercises[j].supersetId === ex.supersetId) {
          group.push(exercises[j]);
          j++;
        }
        groups.push({ type: 'superset', supersetId: ex.supersetId, exercises: group });
        i = j;
      } else {
        groups.push({ type: 'single', exercises: [ex] });
        i++;
      }
    }
    return groups;
  };

  const handleExecute = () => {
    const sessionData = {
      id: sId,
      instanceId: currentSession?.instanceId || (dateISO ? `${sId}_${dateISO}` : null),
      name: currentSession.name,
      dayBadge: `${dayLabel?.toUpperCase() || ''} · ${currentSession.sport?.toUpperCase() || ''}`,
      blocks: finalBlocks,
    };
    loadSession(sessionData);
    navigate('/session');
  };

  const intCfg = INTENSITY_COLORS[currentSession.intensity] || INTENSITY_COLORS['Media'];
  const isToday = isTodayDate(dayDate);
  const isPast = isPastDay(dayDate);
  // Button only appears when: date is today or past, and no log already recorded
  const canRegisterRetroactively = isPastOrToday(dayDate) && !hasLog;

  const exportPayload = {
    id: currentSession.sessionId,
    name: currentSession.name,
    type: currentSession.type,
    icon: currentSession.icon,
    blocks: finalBlocks
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-ink/50 backdrop-blur-xs z-[80] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Sheet — 94% height max, modern TrainingOS theme */}
      <div
        className={`fixed bottom-0 left-0 w-full rounded-t-3xl z-[80] transition-transform duration-300 ease-out flex flex-col bg-card border-t border-border shadow-2xl`}
        style={{
          maxHeight: '94dvh',
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* Drag handle */}
        <div className="w-12 h-1 bg-border rounded-full mx-auto my-3 shrink-0" />

        {/* HEADER */}
        <div className="px-5 pb-4 border-b border-border shrink-0">
          {/* Top row: Badges + Action Buttons (Delete & Close) */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-condensed font-black px-3 py-1 rounded-full bg-bg text-muted border border-border tracking-wider uppercase">
                {dayLabel ? dayLabel.toUpperCase() : ''} · {formatFullDate(dayDate)}
              </span>
              {isToday && (
                <span className="text-[10px] font-condensed font-black px-2.5 py-1 rounded-full bg-signal-orange/10 text-signal-orange border border-signal-orange/30 tracking-wider flex items-center gap-1.5 uppercase">
                  <span className="w-1.5 h-1.5 bg-signal-orange rounded-full animate-pulse inline-block" /> HOY
                </span>
              )}
              {isPast && !isToday && (
                <span className={`text-[10px] font-condensed font-black px-2.5 py-1 rounded-full border tracking-wider uppercase ${
                  hasLog
                    ? 'bg-success-green/10 text-success-green border-success-green/30'
                    : 'bg-bg text-muted border-border'
                }`}>
                  {hasLog ? '✓ REGISTRADO' : 'PENDIENTE'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleDeleteSession}
                title="Borrar entrenamiento"
                className="p-2 text-muted hover:text-corner-red hover:bg-corner-red/10 rounded-full transition-colors cursor-pointer"
              >
                <Trash2 size={17} />
              </button>
              <button
                onClick={handleClose}
                title="Cerrar"
                className="p-2 text-muted hover:text-ink hover:bg-bg rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Session title + Icon */}
          <div className="flex items-start gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-bg border border-border flex items-center justify-center text-3xl shrink-0 shadow-xs">
              {currentSession.icon || '🏋️'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="font-condensed font-black text-2xl text-ink leading-tight bg-transparent border-b-2 border-signal-orange outline-none w-full uppercase"
                    autoFocus
                  />
                ) : (
                  <>
                    <h2 className="font-condensed font-black text-2xl md:text-3xl text-ink leading-tight uppercase tracking-tight break-words">
                      {currentSession.name}
                    </h2>
                    <button
                      onClick={() => {
                        setEditedName(currentSession.name);
                        setIsEditingName(true);
                      }}
                      className="text-muted hover:text-signal-orange transition-colors cursor-pointer shrink-0 p-1"
                      title="Editar nombre"
                    >
                      <Pencil size={16} />
                    </button>
                  </>
                )}
              </div>

              {/* Metrics pills */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-muted">
                  <Clock size={13} className="text-muted" />
                  <span>{currentSession.duration} min</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-muted">
                  <Dumbbell size={13} className="text-muted" />
                  <span>{currentSession.exercises} ejercicios</span>
                </div>
                <span
                  className={`text-[10px] font-condensed font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${intCfg.bg} ${intCfg.text} ${intCfg.border}`}
                >
                  {currentSession.intensity}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* EXERCISE BLOCKS — scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-bg/30">
          {showRetroLogger ? (
            <div className="bg-card rounded-2xl border border-border p-4 shadow-xs">
              <RetroactiveLogger
                blocks={finalBlocks}
                sessionId={sId}
                sessionName={currentSession.name}
                dayDate={dayDate}
                onSaved={() => {
                  setHasLog(true);
                  setShowRetroLogger(false);
                }}
                onCancel={() => setShowRetroLogger(false)}
              />
            </div>
          ) : (
            <>
              {/* Info banner */}
              <div className="flex items-center gap-2.5 bg-card border border-border rounded-xl px-3.5 py-2.5 shadow-xs">
                <ClipboardList size={16} className="text-signal-orange shrink-0" />
                <p className="text-muted text-[11px] font-mono font-bold uppercase tracking-wider">
                  Vista de planificación · Solo lectura
                </p>
              </div>

              {/* Exercise blocks */}
              {finalBlocks.length > 0 ? (
                finalBlocks.map((block, bi) => (
                  <div key={block.id || bi} className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs mb-3">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-bg/60 border-b border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{block.icon || '💪'}</span>
                        <span className="font-condensed font-black text-sm text-ink uppercase tracking-wider">
                          {block.name}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-muted uppercase tracking-widest font-bold">
                        {(block.exercises || []).length} EJ.
                      </span>
                    </div>

                    {groupExercisesForRender(block.exercises || []).map((grp, gi) => {
                      if (grp.type === 'single') {
                        const ex = grp.exercises[0];
                        return (
                          <div key={ex.id || gi} className="px-4 py-3 border-b border-border/50 last:border-0">
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-bold text-sm text-ink leading-snug">{ex.name}</span>
                              <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                                <span className="font-mono font-bold text-xs text-ink bg-bg px-2 py-0.5 rounded border border-border">
                                  {ex.series} × {ex.reps}
                                </span>
                                {ex.suggestedWeight?.min && ex.suggestedWeight?.max && (
                                  <span className="font-mono text-xs font-bold text-signal-orange bg-signal-orange/10 px-2 py-0.5 rounded border border-signal-orange/20">
                                    💡 {ex.suggestedWeight.min}-{ex.suggestedWeight.max}kg
                                  </span>
                                )}
                                {ex.prescribedLoad != null && ex.prescribedLoad !== '' && (
                                  <span className="font-mono text-xs font-bold text-signal-orange bg-signal-orange/10 px-2 py-0.5 rounded border border-signal-orange/20">
                                    {ex.prescribedLoad}kg
                                  </span>
                                )}
                                {ex.restSeconds > 0 && (
                                  <span className="font-mono text-[11px] text-muted">
                                    {ex.restSeconds}s desc.
                                  </span>
                                )}
                              </div>
                            </div>
                            {ex.notes && (
                              <p className="text-xs text-muted italic mt-2 bg-bg border border-border/60 p-2.5 rounded-lg flex items-start gap-1.5">
                                <span>💡</span>
                                <span>{ex.notes}</span>
                              </p>
                            )}
                          </div>
                        );
                      }

                      // grp.type === 'superset'
                      const colorKey = supersetColorMap[grp.supersetId] || 'signal-orange';
                      const styles = SUPERSET_STYLES[colorKey] || SUPERSET_STYLES['signal-orange'];

                      return (
                        <div
                          key={grp.supersetId + '-' + gi}
                          className={`border-l-4 ${styles.border} ${styles.bg} border-b border-border/50 last:border-b-0`}
                        >
                          <div className="px-4 pt-2.5 pb-1 flex items-center justify-between">
                            <span className={`font-mono text-[9px] font-black uppercase tracking-widest ${styles.badgeText} bg-card border ${styles.badgeBorder} px-2 py-0.5 rounded-full`}>
                              {grp.supersetId}
                            </span>
                            <span className="font-mono text-[9px] text-muted uppercase tracking-wider">
                              SUPERSET · {grp.exercises.length} EJERCICIOS
                            </span>
                          </div>
                          {grp.exercises.map((ex, ei) => (
                            <div key={ex.id || ei} className="px-4 py-2.5 border-t border-border/30 first:border-t-0">
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-bold text-sm text-ink leading-snug">{ex.name}</span>
                                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                                  <span className="font-mono font-bold text-xs text-ink bg-card px-2 py-0.5 rounded border border-border">
                                    {ex.series} × {ex.reps}
                                  </span>
                                  {ex.suggestedWeight?.min && ex.suggestedWeight?.max && (
                                    <span className="font-mono text-xs font-bold text-signal-orange bg-signal-orange/10 px-2 py-0.5 rounded border border-signal-orange/20">
                                      💡 {ex.suggestedWeight.min}-{ex.suggestedWeight.max}kg
                                    </span>
                                  )}
                                  {ex.prescribedLoad != null && ex.prescribedLoad !== '' && (
                                    <span className="font-mono text-xs font-bold text-signal-orange bg-signal-orange/10 px-2 py-0.5 rounded border border-signal-orange/20">
                                      {ex.prescribedLoad}kg
                                    </span>
                                  )}
                                  {ex.restSeconds > 0 && (
                                    <span className="font-mono text-[11px] text-muted">
                                      {ex.restSeconds}s desc.
                                    </span>
                                  )}
                                </div>
                              </div>
                              {ex.notes && (
                                <p className="text-xs text-muted italic mt-2 bg-card border border-border/60 p-2.5 rounded-lg flex items-start gap-1.5">
                                  <span>💡</span>
                                  <span>{ex.notes}</span>
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="bg-card rounded-2xl border border-border p-8 text-center text-muted shadow-xs">
                  <Dumbbell size={32} className="mx-auto opacity-30 mb-3" />
                  <p className="font-condensed font-black text-base text-ink uppercase">Sin ejercicios planificados</p>
                  <p className="text-xs text-muted mt-1">Asigna una plantilla a este día desde el editor</p>
                </div>
              )}

              {/* Coach Feedback / Notes */}
              <div className="bg-card rounded-2xl border border-border p-4 mt-3 shadow-xs">
                <h4 className="font-condensed font-black text-sm uppercase tracking-wider text-ink mb-3 flex items-center gap-2">
                  <MessageSquare size={16} className="text-signal-orange" />
                  Notas del entrenador
                </h4>
                <FeedbackSection
                  sessionId={sId}
                  atletaId={athlete?.id || getAtletaId() || import.meta.env.VITE_ATLETA_ID || 'atleta-local'}
                  readOnly={!isCoach}
                  darkMode={false}
                />
              </div>
            </>
          )}
        </div>

        {/* FOOTER */}
        {!showRetroLogger && (
          <div
            className="px-4 py-3.5 border-t border-border bg-card flex gap-2 shrink-0 flex-wrap"
            style={{ paddingBottom: 'calc(0.875rem + var(--safe-bottom, 0px))' }}
          >
            <button
              onClick={handleClose}
              className="py-3 px-4 rounded-xl bg-bg border border-border hover:bg-border/30 font-condensed font-black text-muted hover:text-ink text-sm uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer"
            >
              Volver
            </button>

            {/* Exportar */}
            <button
              onClick={() => setShowExport(true)}
              className="py-3 px-3.5 rounded-xl bg-bg border border-border hover:border-signal-orange/40 text-ink font-condensed font-black text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
            >
              <UploadCloud size={15} />
              <span>Exportar</span>
            </button>

            {/* Editar */}
            {currentSession.sessionId && (
              <button
                onClick={() => { handleClose(); setTimeout(() => navigate(`/plan/session/${currentSession.sessionId}/edit`), 310); }}
                className="py-3 px-3.5 rounded-xl bg-corner-blue/10 border border-corner-blue/30 text-corner-blue hover:bg-corner-blue/20 font-condensed font-black text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Pencil size={14} />
                <span>Editar</span>
              </button>
            )}

            {/* Registrar retroactivamente — only for past/today without log */}
            {canRegisterRetroactively && !showRetroLogger && (
              <button
                onClick={() => setShowRetroLogger(true)}
                className="w-full py-3 px-4 rounded-xl bg-bg border border-border hover:border-signal-orange/50 text-ink font-condensed font-black text-sm flex items-center justify-center gap-2 uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer"
              >
                <ClipboardEdit size={16} /> Registrar esta sesión
              </button>
            )}

            {/* Ejecutar — future days or today */}
            {(isToday || !isPast) && (
              <button
                onClick={handleExecute}
                className="flex-1 py-3 px-5 rounded-xl bg-signal-orange hover:bg-signal-orange/95 text-white font-condensed font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-signal-orange/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Play size={16} fill="white" />
                <span>{isToday ? 'Ejecutar HOY' : 'Ejecutar'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* EXPORT MODAL */}
      {showExport && (
        <ExportSessionModal
          sessionData={exportPayload}
          onClose={() => setShowExport(false)}
        />
      )}
    </>
  );
}
