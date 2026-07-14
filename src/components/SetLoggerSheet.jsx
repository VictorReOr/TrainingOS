import React, { useEffect, useState, useRef, useMemo } from 'react';
import { X, Check, Timer, ArrowRight, Hourglass, Repeat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import { useCircuit } from '../context/CircuitContext';
import { useProgressiveOverload } from '../hooks/useProgressiveOverload';
import { MOCK_SESSION, BLOCK_COLORS } from '../data/mockSession';

const parseDurationToSeconds = (durStr) => {
  if (!durStr) return 60;
  const match = durStr.match(/(\d+)/);
  return match ? parseInt(match[1]) * 60 : 60;
};

export default function SetLoggerSheet({ exercise, sessionType, logs, onLogChange, onToggleSet, onClose, onOpenTimerGlobal }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showMiniTimer, setShowMiniTimer] = useState(false);
  const hasPrefilled = useRef(false);

  // ── Sugerencia científica de sobrecarga ──
  const {
    prescribedLoad,
    nextSessionLoad,
    rpeTarget,
    pct1RM,
    e1RM,
    confidence,
    isDeloadSuggested,
    deloadReason,
    deloadLoad,
    weeklyImprovePct,
    lastSession,
    hasHistory
  } = useProgressiveOverload(exercise.id, exercise.name, exercise.reps || exercise.targetReps, sessionType || 'gym');

  const [readiness, setReadiness] = useState(() => {
    try {
      const raw = sessionStorage.getItem('trainingos_today_readiness');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  useEffect(() => {
    const handleReadinessUpdate = () => {
      try {
        const raw = sessionStorage.getItem('trainingos_today_readiness');
        setReadiness(raw ? JSON.parse(raw) : null);
      } catch {}
    };
    window.addEventListener('readiness_checkin_completed', handleReadinessUpdate);
    return () => window.removeEventListener('readiness_checkin_completed', handleReadinessUpdate);
  }, []);

  const loadFactor = readiness ? readiness.factor : 1.0;
  const seriesModifier = readiness ? readiness.modifier : 0;

  const suggestedVal = useMemo(() => {
    const base = isDeloadSuggested ? deloadLoad : prescribedLoad;
    if (exercise.isTest) return base > 0 ? base : (parseFloat(exercise.loadRef) || 0);
    return Math.round((base * loadFactor) / 1.25) * 1.25;
  }, [prescribedLoad, isDeloadSuggested, deloadLoad, loadFactor, exercise.isTest, exercise.loadRef]);

  useEffect(() => {
    if (isVisible && !hasPrefilled.current) {
      hasPrefilled.current = true;
      const targetReps = exercise.reps || exercise.targetReps || '';
      
      if (suggestedVal > 0) {
        logs.forEach((_, idx) => {
          if (seriesModifier === -99 && idx >= Math.ceil(logs.length / 2)) return;
          if (seriesModifier === -1 && idx === logs.length - 1) return;

          if (!logs[idx].carga) {
            onLogChange(idx, 'carga', suggestedVal);
          }
        });
      }

      logs.forEach((l, idx) => {
        if (!l.reps && targetReps) {
          onLogChange(idx, 'reps', targetReps);
        }
      });
    }
  }, [isVisible, suggestedVal, seriesModifier, logs, onLogChange, exercise.reps, exercise.targetReps]);

  const navigate = useNavigate();
  const { startRest, startCountdown, stopTimer, mode, status, setMode, setTimeMs } = useTimer();
  const { initCircuit } = useCircuit();

  const [autoTimer, setAutoTimer] = useState(true);
  const autoTimerStarted = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (exercise.duration && autoTimer && !autoTimerStarted.current) {
      autoTimerStarted.current = true;
      const secs = parseDurationToSeconds(exercise.duration);
      startCountdown(secs * 1000);
    }
  }, [exercise.duration, autoTimer]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleBackdropClick = (e) => {
    if (e.target.id === 'backdrop') handleClose();
    if (e.target.id === 'mini-backdrop') setShowMiniTimer(false);
  };

  const hasTimerContext = exercise.restSeconds || exercise.duration;

  const handleActionRest = () => {
    setShowMiniTimer(false);
    startRest(exercise.restSeconds);
  };

  const handleActionDuration = () => {
    setShowMiniTimer(false);
    handleClose();
    const secs = parseDurationToSeconds(exercise.duration);
    setMode('countdown');
    setTimeMs(secs * 1000);
    onOpenTimerGlobal?.();
  };

  const handleGenerateCircuit = () => {
    if (!window.confirm('¿Generar un circuito con los bloques de esta sesión?\nSe abrirá el Timer con los bloques precargados.')) return;
    const circuitMap = MOCK_SESSION.blocks.flatMap(blk => {
      const blocks = [];
      const workTime = blk.duration ? parseDurationToSeconds(blk.duration) : 60;
      blocks.push({
        id: blk.id, type: 'libre', name: blk.name,
        color: BLOCK_COLORS[blk.type] || '#FF5A00',
        sets: 1, timeSeconds: workTime, sound: 'beep_short',
      });
      if (blk.exercises?.[0]?.restSeconds) {
        blocks.push({
          id: blk.id + '_rest', type: 'descanso', name: 'Descanso',
          color: 'var(--color-border)', sets: 1, timeSeconds: blk.exercises[0].restSeconds, sound: 'beep_long',
        });
      }
      return blocks;
    });
    initCircuit(circuitMap, MOCK_SESSION.name);
    setShowMiniTimer(false);
    handleClose();
    navigate('/timer');
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        id="backdrop"
        onClick={handleBackdropClick}
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* BOTTOM SHEET */}
      <div
        className={`fixed bottom-0 left-0 w-full bg-card rounded-t-2xl border-t border-border shadow-lg z-[60] flex flex-col transition-transform duration-300 ease-out pb-[calc(1rem+var(--safe-bottom))] ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '88vh' }}
      >
        {/* Header Section */}
        <div className="flex-shrink-0 pt-4 pb-3 px-5 border-b border-border">
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
          <div className="flex justify-between items-start">
            <div>
              <p className="font-mono text-[8px] text-muted tracking-widest uppercase mb-0.5">
                REGISTRO DE SERIE
              </p>
              <h2 className="font-condensed font-black text-2xl text-ink uppercase tracking-wide leading-tight">
                {exercise.name}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {hasTimerContext && (
                <button
                  onClick={() => setShowMiniTimer(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-muted font-mono font-bold text-[9px] tracking-wider rounded-lg hover:border-signal-orange hover:text-signal-orange transition-colors cursor-pointer uppercase"
                >
                  <Timer size={12} /> TIMER
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-2 bg-bg/50 text-muted rounded-full hover:text-ink hover:bg-bg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Auto Timer Toggle */}
          {exercise.duration && (
            <div className="flex items-center justify-between mt-3 px-1">
              <div className="flex items-center gap-1.5 font-mono text-[9px] text-muted uppercase tracking-wider">
                <Timer size={12} />
                <span>Timer automático</span>
              </div>
              <button
                onClick={() => {
                  const next = !autoTimer;
                  setAutoTimer(next);
                  if (!next && mode === 'countdown' && status === 'running') {
                    stopTimer();
                  }
                }}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                  autoTimer ? 'bg-signal-orange' : 'bg-border'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    autoTimer ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* SERIES */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          
          {/* SUGERENCIA DE TESTS O SOBRECARGA */}
          {exercise.isTest ? (
            <div className="bg-card border border-corner-red/35 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-condensed font-black text-ink text-base leading-none uppercase tracking-wide">
                    TEST ACTIVO: {exercise.testType || 'AMRAP'}
                  </h4>
                  <p className="font-mono text-[8px] text-corner-red font-bold uppercase tracking-wider mt-1.5">
                    POTENCIAL DE FUERZA MÁXIMA
                  </p>
                </div>
                <span className="border border-corner-red/40 text-corner-red font-mono font-bold text-[8px] px-2 py-0.5 rounded uppercase tracking-wider leading-none">
                  RPE 10 (FALLO)
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-display font-black text-4xl text-ink leading-none">
                  {suggestedVal}
                </span>
                <span className="font-mono text-[9px] text-muted uppercase tracking-wider font-bold">
                  {exercise.testType === 'AMRAP' 
                    ? 'KG × MAX REPS'
                    : `KG × ${exercise.testType} REPS MAX`}
                </span>
              </div>

              <div className="font-mono text-[9px] text-muted leading-relaxed space-y-1 uppercase tracking-wider">
                <p>• Este test recalibrará tu 1RM estimado y actualizará tu techo de sobrecarga ($P_max$).</p>
                <p className="text-corner-red font-bold">• Instrucción: Entrena con total concentración hasta el fallo técnico.</p>
                {readiness && (
                  <p className="text-corner-blue font-bold">• Disposición: {Math.round(readiness.score * 100)}% ({readiness.status})</p>
                )}
              </div>

              <button
                onClick={() => {
                  logs.forEach((_, idx) => onLogChange(idx, 'carga', suggestedVal));
                }}
                className="w-full py-2 border border-corner-red text-corner-red font-mono font-bold text-[9px] uppercase tracking-wider rounded-lg hover:bg-corner-red hover:text-white transition-all cursor-pointer bg-card"
              >
                Aplicar peso de test
              </button>
            </div>
          ) : prescribedLoad > 0 ? (
            <div className="bg-card border border-signal-orange/20 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-condensed font-black text-ink text-base leading-none uppercase tracking-wide">
                    {isDeloadSuggested ? 'SEMANA DE DESCARGA' : 'SUGERENCIA DE CARGA'}
                  </h4>
                  <p className="font-mono text-[8px] text-muted font-bold uppercase tracking-wider mt-1.5">
                    Helms + Modelo Logístico ({confidence === 'high' ? 'Alta Confianza' : confidence === 'medium' ? 'Media Confianza' : 'Baja Confianza'})
                  </p>
                </div>
                {isDeloadSuggested && (
                  <span className="border border-corner-red/40 text-corner-red font-mono font-bold text-[8px] px-2 py-0.5 rounded uppercase tracking-wider">
                    DESCARGA
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-display font-black text-4xl text-ink leading-none">
                  {suggestedVal}
                </span>
                <span className="font-mono text-[9px] text-muted uppercase tracking-wider font-bold">
                  KG × {exercise.reps || exercise.targetReps || '8'} reps @RPE {rpeTarget}
                </span>
              </div>

              <div className="font-mono text-[9px] text-muted leading-relaxed space-y-1 uppercase tracking-wider">
                <p>• Equivale al <span className="font-bold text-ink">{pct1RM}%</span> de tu 1RM estimado ({e1RM}kg).</p>
                {isDeloadSuggested ? (
                  <p className="text-corner-red font-bold">• {deloadReason}</p>
                ) : (
                  <>
                    {weeklyImprovePct > 0 && <p>• Mejora semanal proyectada: <span className="text-success-green font-bold">+{weeklyImprovePct}% DELTA</span>.</p>}
                    {lastSession && <p>• Anterior ({lastSession.date.slice(5, 10)}): {lastSession.load}kg × {lastSession.reps} reps (RPE {lastSession.rpe}).</p>}
                  </>
                )}
                {readiness && (
                  <div className="bg-bg/40 border border-border rounded-lg p-2.5 mt-2 space-y-0.5 text-[9px]">
                    <p className="font-bold text-corner-blue">⚠️ AUTORREGULACIÓN ({Math.round(readiness.score * 100)}%):</p>
                    <p>{readiness.message.toUpperCase()}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  logs.forEach((_, idx) => {
                    if (seriesModifier === -99 && idx >= Math.ceil(logs.length / 2)) return;
                    if (seriesModifier === -1 && idx === logs.length - 1) return;
                    onLogChange(idx, 'carga', suggestedVal);
                  });
                }}
                className="w-full py-2 border border-signal-orange text-signal-orange font-mono font-bold text-[9px] uppercase tracking-wider rounded-lg hover:bg-signal-orange hover:text-ink transition-all cursor-pointer bg-card"
              >
                Aplicar a todas las series
              </button>
            </div>
          ) : (
            <div className="bg-bg/25 border border-border rounded-xl p-4 flex flex-col gap-1.5 shadow-none">
              <h4 className="font-condensed font-black text-sm uppercase text-ink leading-none">Sin datos históricos</h4>
              <p className="font-mono text-[9px] text-muted uppercase tracking-wider leading-normal mt-0.5">
                Registra tu primer entrenamiento para activar las sugerencias de sobrecarga.
              </p>
            </div>
          )}

          {logs.map((log, index) => (
            <div
              key={index}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                log.done
                  ? 'border-signal-orange border-l-4 bg-bg/25 shadow-none'
                  : 'border-border bg-bg/10 shadow-none'
              }`}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Serie check */}
                <button
                  onClick={() => {
                    if (window.navigator?.vibrate) window.navigator.vibrate(10);
                    onToggleSet(index);
                    if (autoTimer && exercise.duration && !log.done) {
                      const nextUndone = logs.findIndex((l, i) => i > index && !l.done);
                      if (nextUndone !== -1) {
                        setTimeout(() => {
                          const secs = parseDurationToSeconds(exercise.duration);
                          startCountdown(secs * 1000);
                        }, 300);
                      }
                    }
                  }}
                  className={`w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                    log.done
                      ? 'bg-signal-orange border-signal-orange'
                      : 'bg-card border-border hover:border-signal-orange'
                  }`}
                >
                  {log.done && <Check size={16} strokeWidth={3} className="text-ink" />}
                </button>
                <span className="font-mono font-black text-sm text-muted w-7">
                  S{index + 1}
                </span>

                {/* Inputs */}
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-[8px] text-muted font-mono font-bold uppercase tracking-widest mb-1">Carga (kg)</label>
                    <input
                      type="number" inputMode="decimal"
                      value={log.carga}
                      onChange={e => onLogChange(index, 'carga', e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm font-mono font-bold text-ink focus:border-signal-orange outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[8px] text-muted font-mono font-bold uppercase tracking-widest mb-1">Reps</label>
                    <input
                      type="text" inputMode="text"
                      value={log.reps}
                      onChange={e => onLogChange(index, 'reps', e.target.value)}
                      placeholder={exercise.reps || exercise.targetReps || "0"}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm font-mono font-bold text-ink focus:border-signal-orange outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* RPE (Casillas cuadradas) */}
              <div className="px-4 pb-3 pl-16">
                <label className="text-[8px] text-muted font-mono font-bold uppercase tracking-widest mb-2 block">Esfuerzo RPE</label>
                <div className="flex items-center gap-1.5">
                  {[6, 7, 8, 9, 10].map(val => (
                    <button
                      key={val}
                      onClick={() => onLogChange(index, 'rpe', val)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                        log.rpe === val
                          ? 'bg-signal-orange border-signal-orange text-ink font-black scale-105 shadow-none'
                          : 'bg-card border-border text-muted hover:border-signal-orange'
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

        {/* Separator Line */}
        <div className="h-px bg-border mx-5 my-1"></div>

        {/* CTA */}
        <div className="px-5 pt-2 bg-card">
          <button
            onClick={handleClose}
            className="w-full py-3.5 bg-signal-orange text-ink font-display font-black text-xl rounded-xl tracking-wider hover:bg-signal-orange/95 cursor-pointer uppercase"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>

      {/* MINI SHEET TIMER OPTIONS */}
      {showMiniTimer && (
        <div className="fixed inset-0 z-[70] flex flex-col justify-end">
          <div
            id="mini-backdrop"
            onClick={handleBackdropClick}
            className="absolute inset-0 bg-black/40 animate-fade-in"
          />
          <div className="relative bg-card border-t border-border rounded-t-2xl px-5 pt-5 pb-[calc(1rem+var(--safe-bottom))] animate-slide-up shadow-lg">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
            <p className="font-mono text-[8px] text-muted tracking-widest uppercase mb-4 font-bold">
              OPCIONES DE TIEMPO
            </p>
            <div className="flex flex-col gap-2">
              {exercise.restSeconds && (
                <button onClick={handleActionRest} className="w-full flex items-center justify-between p-4 bg-bg/25 rounded-xl border border-border hover:border-signal-orange transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="bg-signal-orange/10 text-signal-orange p-2 rounded-lg"><Hourglass size={18} /></div>
                    <span className="font-bold text-[14px] text-ink font-condensed tracking-wide uppercase">Descanso entre series</span>
                  </div>
                  <span className="font-mono font-black text-signal-orange text-base">{exercise.restSeconds}s</span>
                </button>
              )}
              {exercise.duration && (
                <button onClick={handleActionDuration} className="w-full flex items-center justify-between p-4 bg-bg/25 rounded-xl border border-border hover:border-signal-orange transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="bg-signal-orange/10 text-signal-orange p-2 rounded-lg"><Timer size={18} /></div>
                    <span className="font-bold text-[14px] text-ink font-condensed tracking-wide uppercase">Duración del ejercicio</span>
                  </div>
                  <span className="font-mono font-black text-signal-orange text-base">{exercise.duration}</span>
                </button>
              )}
              <div className="h-px bg-border my-1" />
              <button onClick={handleGenerateCircuit} className="w-full flex items-center justify-between p-4 bg-bg/25 rounded-xl border border-border hover:border-signal-orange transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="bg-signal-orange/10 text-signal-orange p-2 rounded-lg"><Repeat size={18} /></div>
                  <span className="font-bold text-[14px] text-ink font-condensed tracking-wide uppercase">Generar circuito de sesión</span>
                </div>
                <ArrowRight size={18} className="text-muted" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
