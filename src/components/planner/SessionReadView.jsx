import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { usePlanner } from '../../context/PlannerContext';
import { useRole } from '../../hooks/useRole';
import { saveLog as _saveLog } from '../../services/sheets';
import { MOCK_SESSION_DETAILS } from '../../data/mockPlanner';
import { MOCK_SESSION } from '../../data/mockSession';
import { X, Play, Clock, Dumbbell, UploadCloud, ClipboardEdit, Check, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import ExportSessionModal from '../ExportSessionModal';
import FeedbackSection from '../FeedbackSection';

const LS_SESSION_LOGS = 'trainingos_session_logs';

const SUPERSET_COLOR_CYCLE = ['signal-orange', 'belt-gold', 'corner-red'];

const SUPERSET_STYLES = {
  'signal-orange': {
    border: 'border-l-signal-orange',
    bg: 'bg-signal-orange/5',
    badgeText: 'text-signal-orange',
    badgeBorder: 'border-signal-orange/25',
    badgeBg: 'bg-signal-orange/10',
  },
  'belt-gold': {
    border: 'border-l-belt-gold',
    bg: 'bg-belt-gold/5',
    badgeText: 'text-belt-gold',
    badgeBorder: 'border-belt-gold/25',
    badgeBg: 'bg-belt-gold/10',
  },
  'corner-red': {
    border: 'border-l-corner-red',
    bg: 'bg-corner-red/5',
    badgeText: 'text-corner-red',
    badgeBorder: 'border-corner-red/25',
    badgeBg: 'bg-corner-red/10',
  },
};

const INTENSITY_COLORS = {
  'Baja':   { bg: 'rgba(39,174,96,0.15)',   text: '#27ae60' },
  'Media':  { bg: 'rgba(61,125,212,0.15)',  text: '#3d7dd4' },
  'Alta':   { bg: 'rgba(245,166,35,0.15)',  text: '#f5a623' },
  'Máxima': { bg: 'rgba(232,65,42,0.15)',   text: '#e8412a' },
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

      console.log('FECHA GUARDADA:', logEntry.fecha);

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
        <div className="w-14 h-14 rounded-full bg-[#27ae60]/15 border border-[#27ae60]/30 flex items-center justify-center">
          <Check size={28} className="text-[#27ae60]" />
        </div>
        <p className="font-condensed font-black text-lg text-white uppercase tracking-wide">
          Sesión guardada
        </p>
        <p className="font-mono text-[10px] text-white/50 uppercase tracking-wider">
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
        <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">
          {ex._blockName}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExIndex(i => Math.max(0, i - 1))}
            disabled={exIndex === 0}
            className="p-1.5 rounded-lg border border-white/10 text-white/40 disabled:opacity-30 hover:border-white/30 transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="font-mono text-[9px] text-white/50">
            {exIndex + 1} / {allExercises.length}
          </span>
          <button
            onClick={() => setExIndex(i => Math.min(allExercises.length - 1, i + 1))}
            disabled={exIndex === allExercises.length - 1}
            className="p-1.5 rounded-lg border border-white/10 text-white/40 disabled:opacity-30 hover:border-white/30 transition-colors cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300"
          style={{ width: `${((exIndex + 1) / allExercises.length) * 100}%` }}
        />
      </div>

      {/* Exercise name */}
      <div>
        <p className="font-condensed font-black text-xl text-white leading-tight">{ex.name}</p>
        <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest mt-0.5">
          {ex.series || ex.sets || 3} series · {(ex.reps ?? ex.targetReps) ?? '—'} reps
        </p>
      </div>

      {/* Series rows */}
      <div className="space-y-2">
        {exLogs.map((log, idx) => (
          <div
            key={idx}
            className={`rounded-xl border transition-all duration-200 overflow-hidden ${
              log.done ? 'border-accent/60 bg-accent/5' : 'border-white/10 bg-white/3'
            }`}
          >
            <div className="flex items-center gap-3 px-3 py-2.5">
              {/* Done toggle */}
              <button
                onClick={() => toggleSet(idx)}
                className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  log.done ? 'bg-accent border-accent' : 'bg-transparent border-white/20 hover:border-accent'
                }`}
              >
                {log.done && <Check size={14} strokeWidth={3} className="text-white" />}
              </button>
              <span className="font-mono font-black text-xs text-white/40 w-6">S{idx + 1}</span>

              {/* Inputs */}
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <label className="text-[8px] text-white/30 font-mono font-bold uppercase tracking-widest mb-0.5">kg</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={log.carga}
                    onChange={e => updateLog(idx, 'carga', e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-white focus:border-accent outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[8px] text-white/30 font-mono font-bold uppercase tracking-widest mb-0.5">reps</label>
                  <input
                    type="text"
                    inputMode="text"
                    value={log.reps}
                    onChange={e => updateLog(idx, 'reps', e.target.value)}
                    placeholder={ex.reps || ex.targetReps || '0'}
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-white focus:border-accent outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* RPE */}
            <div className="px-3 pb-2 pl-[3.25rem]">
              <div className="flex items-center gap-1">
                {[6, 7, 8, 9, 10].map(val => (
                  <button
                    key={val}
                    onClick={() => updateLog(idx, 'rpe', val)}
                    className={`flex-1 py-1 rounded-md text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                      log.rpe === val
                        ? 'bg-accent border-accent text-white'
                        : 'bg-transparent border-white/10 text-white/40 hover:border-accent/50'
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
          className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 font-mono font-bold text-xs uppercase tracking-wide hover:border-white/25 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        {exIndex < allExercises.length - 1 ? (
          <button
            onClick={() => setExIndex(i => i + 1)}
            className="flex-[2] py-3 rounded-xl bg-white/10 border border-white/15 text-white font-condensed font-black text-base uppercase tracking-wide hover:bg-white/15 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            Siguiente <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-[2] py-3 rounded-xl bg-accent font-condensed font-black text-white text-base uppercase tracking-wider shadow-lg shadow-accent/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
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
        className={`fixed inset-0 bg-black/70 z-[80] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Sheet — 95% height */}
      <div
        className={`fixed bottom-0 left-0 w-full rounded-t-3xl z-[80] transition-transform duration-300 ease-out flex flex-col`}
        style={{
          height: '95dvh',
          background: 'linear-gradient(180deg, #1a1f2e 0%, #0f1117 100%)',
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* Handle + close */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2 shrink-0 relative">
          <button
            onClick={handleDeleteSession}
            title="Borrar entrenamiento"
            className="flex items-center gap-1.5 px-3 py-1 bg-corner-red/10 text-corner-red rounded-full border border-corner-red/20 hover:bg-corner-red/20 active:scale-95 transition-all text-xs font-mono font-bold uppercase tracking-wider cursor-pointer z-10"
          >
            <Trash2 size={14} /> Borrar
          </button>
          <div className="w-10 h-1.5 bg-white/20 rounded-full mx-auto absolute left-1/2 -translate-x-1/2" />
          <button onClick={handleClose} className="p-1.5 bg-white/10 text-white/60 rounded-full border border-white/10 hover:bg-white/20 transition-colors cursor-pointer z-10">
            <X size={18} />
          </button>
        </div>

        {/* HEADER */}
        <div className="px-5 pt-2 pb-5 border-b border-white/5 shrink-0">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs font-black px-3 py-1 rounded-full bg-white/10 text-white/60 tracking-widest">
              {dayLabel ? dayLabel.toUpperCase() : ''} · {formatFullDate(dayDate)}
            </span>
            {isToday && (
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-accent/20 text-accent border border-accent/30 tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse inline-block" /> HOY
              </span>
            )}
            {isPast && !isToday && (
              <span className={`text-[11px] font-black px-2.5 py-1 rounded-full tracking-widest ${
                hasLog
                  ? 'bg-[#27ae60]/15 text-[#27ae60] border border-[#27ae60]/30'
                  : 'bg-white/10 text-white/50'
              }`}>
                {hasLog ? '✓ REGISTRADO' : 'PENDIENTE'}
              </span>
            )}
          </div>

          {/* Session title — text-white for contrast on dark bg */}
          <div className="flex items-start gap-3">
            <span className="text-4xl">{currentSession.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                {isEditingName ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="font-condensed font-black text-3xl text-white leading-tight bg-transparent border-b-2 border-accent outline-none w-full"
                    autoFocus
                  />
                ) : (
                  <>
                    <h2 className="font-condensed font-black text-3xl text-white leading-tight break-words">{currentSession.name}</h2>
                    <button
                      onClick={() => {
                        setEditedName(currentSession.name);
                        setIsEditingName(true);
                      }}
                      className="text-white/40 hover:text-white mt-1.5 cursor-pointer shrink-0"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm text-white/50">
                  <Clock size={14} />
                  <span>{currentSession.duration} min</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-white/50">
                  <Dumbbell size={14} />
                  <span>{currentSession.exercises} ejercicios</span>
                </div>
                <span
                  className="text-[11px] font-black px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: intCfg.bg, color: intCfg.text }}
                >
                  {currentSession.intensity}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* EXERCISE BLOCKS — scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

          {/* ── Retroactive Logger ── */}
          {showRetroLogger ? (
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
          ) : (
            <>
              {/* Info banner */}
              <div className="flex items-center gap-2 bg-white/4 border border-white/8 rounded-xl px-4 py-3 mb-1">
                <span className="text-lg">📋</span>
                <p className="text-white/50 text-xs font-bold">Vista de planificación · Solo lectura</p>
              </div>

              {/* Exercise blocks */}
              {finalBlocks.length > 0 ? (
                finalBlocks.map((block, bi) => (
                  <div key={block.id || bi} className="bg-white/4 rounded-2xl border border-white/8 overflow-hidden mb-3">
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-white/5 border-b border-white/5">
                      <span className="text-xl w-6 text-center">{block.icon || '💪'}</span>
                      <span className="font-bold text-sm text-white/80 flex-1">{block.name}</span>
                    </div>
                    {groupExercisesForRender(block.exercises || []).map((grp, gi) => {
                      if (grp.type === 'single') {
                        const ex = grp.exercises[0];
                        return (
                          <div key={ex.id || gi} className="px-4 py-2.5 border-b border-white/5 last:border-0">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-sm text-white">{ex.name}</span>
                              <div className="flex items-center gap-1.5 text-xs text-white/50">
                                <span className="font-bold text-white/80">{ex.series}</span>×
                                <span className="font-bold text-white/80">{ex.reps}</span>
                                {ex.suggestedWeight?.min && ex.suggestedWeight?.max && (
                                  <>
                                    <span className="text-white/20">·</span>
                                    <span className="text-accent font-bold">💡 {ex.suggestedWeight.min}-{ex.suggestedWeight.max}kg</span>
                                  </>
                                )}
                                {ex.prescribedLoad && (
                                  <>
                                    <span className="text-white/20">·</span>
                                    <span className="text-white/60">{ex.prescribedLoad}kg</span>
                                  </>
                                )}
                                {ex.restSeconds > 0 && (
                                  <>
                                    <span className="text-white/20">·</span>
                                    <span>{ex.restSeconds}s desc.</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {ex.notes && <p className="text-xs text-white/40 italic mt-1 bg-white/5 p-2 rounded">💡 {ex.notes}</p>}
                          </div>
                        );
                      }

                      // grp.type === 'superset'
                      const colorKey = supersetColorMap[grp.supersetId] || 'signal-orange';
                      const styles = SUPERSET_STYLES[colorKey] || SUPERSET_STYLES['signal-orange'];

                      return (
                        <div
                          key={grp.supersetId + '-' + gi}
                          className={`border-l-[3px] ${styles.border} ${styles.bg} mb-0.5`}
                        >
                          <div className="px-4 pt-2 pb-1">
                            <span className={`font-mono text-[8px] font-bold ${styles.badgeText} border ${styles.badgeBorder} ${styles.badgeBg} px-1.5 py-0.5 rounded tracking-widest`}>
                              {grp.supersetId}
                            </span>
                          </div>
                          {grp.exercises.map((ex, ei) => (
                            <div key={ex.id || ei} className="px-4 py-2 border-t border-white/3 first:border-t-0">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-sm text-white">{ex.name}</span>
                                <div className="flex items-center gap-1.5 text-xs text-white/50">
                                  <span className="font-bold text-white/80">{ex.series}</span>×
                                  <span className="font-bold text-white/80">{ex.reps}</span>
                                  {ex.suggestedWeight?.min && ex.suggestedWeight?.max && (
                                    <>
                                      <span className="text-white/20">·</span>
                                      <span className="text-accent font-bold">💡 {ex.suggestedWeight.min}-{ex.suggestedWeight.max}kg</span>
                                    </>
                                  )}
                                  {ex.prescribedLoad && (
                                    <>
                                      <span className="text-white/20">·</span>
                                      <span className="text-white/60">{ex.prescribedLoad}kg</span>
                                    </>
                                  )}
                                  {ex.restSeconds > 0 && (
                                    <>
                                      <span className="text-white/20">·</span>
                                      <span>{ex.restSeconds}s desc.</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              {ex.notes && <p className="text-xs text-white/40 italic mt-1 bg-white/5 p-2 rounded">💡 {ex.notes}</p>}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="bg-white/4 rounded-2xl border border-white/8 p-8 text-center text-white/40">
                  <Dumbbell size={32} className="mx-auto opacity-30 mb-3" />
                  <p className="font-bold text-white/60">Sin ejercicios planificados</p>
                  <p className="text-sm opacity-60 mt-1">Asigna una plantilla a este día desde el editor</p>
                </div>
              )}

              {/* Coach Feedback / Notes */}
              <div className="bg-white/5 rounded-2xl border border-white/10 p-4 mt-3">
                <h4 className="font-bold text-sm text-white/80 mb-3 flex items-center gap-2">
                  💬 Notas del entrenador
                </h4>
                <FeedbackSection
                  sessionId={sId}
                  atletaId={import.meta.env.VITE_ATLETA_ID || 'v-atleta-1'}
                  readOnly={!isCoach}
                  darkMode={true}
                />
              </div>
            </>
          )}
        </div>

        {/* FOOTER */}
        {!showRetroLogger && (
          <div
            className="px-4 py-4 border-t border-white/5 flex gap-2 shrink-0 flex-wrap"
            style={{ paddingBottom: 'calc(1rem + var(--safe-bottom, 0px))' }}
          >
            <button
              onClick={handleClose}
              className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10 font-bold text-white/60 text-sm active:scale-[0.98] transition-transform"
            >
              Volver
            </button>

            {/* Exportar */}
            <button
              onClick={() => setShowExport(true)}
              className="flex-1 py-3.5 rounded-2xl bg-white border-2 border-accent/30 text-accent font-condensed font-bold text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform uppercase tracking-wide"
            >
              <UploadCloud size={16} /> Exportar
            </button>

            {/* Editar */}
            {currentSession.sessionId && (
              <button
                onClick={() => { handleClose(); setTimeout(() => navigate(`/plan/session/${currentSession.sessionId}/edit`), 310); }}
                className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-blue/30 font-bold text-blue text-sm active:scale-[0.98] transition-transform cursor-pointer"
              >
                ✏️ Editar
              </button>
            )}

            {/* Borrar */}
            <button
              onClick={handleDeleteSession}
              className="flex-1 py-3.5 rounded-2xl bg-corner-red/10 border border-corner-red/30 font-bold text-corner-red text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform uppercase tracking-wide cursor-pointer hover:bg-corner-red/20"
            >
              <Trash2 size={16} /> Borrar
            </button>

            {/* Registrar retroactivamente — only for past/today without log */}
            {canRegisterRetroactively && !showRetroLogger && (
              <button
                onClick={() => setShowRetroLogger(true)}
                className="w-full py-3.5 rounded-2xl bg-white/8 border border-white/15 font-condensed font-black text-white text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform uppercase tracking-wide"
              >
                <ClipboardEdit size={18} /> Registrar esta sesión
              </button>
            )}

            {/* Ejecutar — future days or today */}
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
