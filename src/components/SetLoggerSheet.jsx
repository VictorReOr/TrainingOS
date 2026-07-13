import React, { useEffect, useState, useRef, useMemo } from 'react';
import { X, Check, Timer, ArrowRight, Hourglass, Repeat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import { useCircuit } from '../context/CircuitContext';
import { usePR } from '../context/PRContext';
import { suggestLoad, suggestProgressiveOverload } from '../utils/loadSuggestion';
import { MOCK_SESSION, BLOCK_COLORS } from '../data/mockSession';

const RPE_COLORS = {
  6:  '#E85D04',
  7:  '#84CC16',
  8:  '#EAB308',
  9:  '#F97316',
  10: '#EF4444',
};

const parseDurationToSeconds = (durStr) => {
  if (!durStr) return 60;
  const match = durStr.match(/(\d+)/);
  return match ? parseInt(match[1]) * 60 : 60;
};

export default function SetLoggerSheet({ exercise, logs, onLogChange, onToggleSet, onClose, onOpenTimerGlobal }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showMiniTimer, setShowMiniTimer] = useState(false);

  // ── Sugerencia dinámica de carga ──
  const { prs } = usePR();
  const sessionLogs = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('trainingos_session_logs') || '[]');
    } catch { return []; }
  }, []);
  const dynamicSuggestion = useMemo(
    () => suggestLoad(exercise.id, exercise.reps, prs, sessionLogs),
    [exercise.id, exercise.reps, prs, sessionLogs]
  );

  const progressiveSuggestions = useMemo(() => {
    return logs.map((_, i) => suggestProgressiveOverload(exercise.name, i, sessionLogs));
  }, [exercise.name, logs.length, sessionLogs]);

  const hasPrefilled = useRef(false);
  useEffect(() => {
    if (isVisible && !hasPrefilled.current && progressiveSuggestions.some(s => s !== null)) {
      hasPrefilled.current = true;
      progressiveSuggestions.forEach((sug, idx) => {
        if (sug && !logs[idx].carga) {
          onLogChange(idx, 'carga', sug.suggestedLoad);
        }
      });
    }
  }, [isVisible, progressiveSuggestions, logs, onLogChange]);

  const navigate = useNavigate();
  const { startRest, startCountdown, stopTimer, mode, status, timeMs, setMode, setTimeMs } = useTimer();
  const { initCircuit } = useCircuit();

  const [autoTimer, setAutoTimer] = useState(true);
  const autoTimerStarted = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Auto-start countdown for duration exercises
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
        color: BLOCK_COLORS[blk.type] || '#FF6B00',
        sets: 1, timeSeconds: workTime, sound: 'beep_short',
      });
      if (blk.exercises?.[0]?.restSeconds) {
        blocks.push({
          id: blk.id + '_rest', type: 'descanso', name: 'Descanso',
          color: '#E8E8E4', sets: 1, timeSeconds: blk.exercises[0].restSeconds, sound: 'beep_long',
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
        className={`fixed bottom-0 left-0 w-full bg-white rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.12)] z-[60] flex flex-col transition-transform duration-300 ease-out pb-[calc(1rem+var(--safe-bottom))] ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '88vh' }}
      >
        {/* Drag Handle */}
        <div className="flex-shrink-0 pt-4 pb-3 px-5 border-b border-[#E8E8E4]">
          <div className="w-10 h-1 bg-[#E8E8E4] rounded-full mx-auto mb-4" />
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-condensed font-bold text-[#6E6E73] tracking-widest uppercase mb-0.5">
                Registrar serie
              </p>
              <h2 className="font-condensed font-black text-2xl text-[#1C1C1E] leading-tight">
                {exercise.name}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {hasTimerContext && (
                <button
                  onClick={() => setShowMiniTimer(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E8E8E4] text-[#6E6E73] font-bold text-xs font-condensed tracking-wider rounded-xl hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors"
                >
                  <Timer size={13} /> TIMER
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-2 bg-[#F5F5F0] text-[#6E6E73] rounded-full hover:text-[#1C1C1E] hover:bg-[#E8E8E4] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <p className="text-xs text-[#6E6E73] font-medium mt-2">
            Registra tus series reales para marcarlo completado.
          </p>

          {/* Auto Timer Toggle */}
          {exercise.duration && (
            <div className="flex items-center justify-between mt-3 px-1">
              <div className="flex items-center gap-1.5">
                <Timer size={13} className="text-[#6E6E73]" />
                <span className="text-xs text-[#6E6E73] font-bold">Timer automático</span>
              </div>
              <button
                onClick={() => {
                  const next = !autoTimer;
                  setAutoTimer(next);
                  if (!next && mode === 'countdown' && status === 'running') {
                    stopTimer();
                  }
                }}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  autoTimer ? 'bg-[#FF6B00]' : 'bg-[#E8E8E4]'
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
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                log.done
                  ? 'border-[#FF6B00] border-l-4 bg-[#F5F5F0]'
                  : 'border-[#E8E8E4] bg-[#F5F5F0]'
              }`}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Serie check */}
                <button
                  onClick={() => {
                    if (window.navigator?.vibrate) window.navigator.vibrate(10);
                    onToggleSet(index);
                    // Auto-restart countdown for next series if autoTimer
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
                  className={`w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl border-2 transition-all duration-200 ${
                    log.done
                      ? 'bg-[#FF6B00] border-[#FF6B00]'
                      : 'bg-white border-[#E8E8E4] hover:border-[#FF6B00]'
                  }`}
                >
                  {log.done && <Check size={16} strokeWidth={3} color="#1C1C1E" />}
                </button>
                <span className="font-condensed font-black text-xl text-[#6E6E73] w-7">
                  S{index + 1}
                </span>

                {/* Inputs */}
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-[10px] text-[#6E6E73] font-bold uppercase tracking-wider mb-1">Carga (kg)</label>
                    <input
                      type="number" inputMode="decimal"
                      value={log.carga}
                      onChange={e => onLogChange(index, 'carga', e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-white border border-[#E8E8E4] rounded-xl px-3 py-2.5 text-base font-bold text-[#1C1C1E] placeholder:text-[#D4D4D8] focus:border-[#FF6B00] outline-none transition-colors"
                    />
                    {progressiveSuggestions[index] !== null ? (
                      <div className="flex flex-col gap-1 mt-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-[#FF6B00] font-black flex items-center gap-1 tracking-wide uppercase">
                            📈 Sugerido: {progressiveSuggestions[index].suggestedLoad}kg
                          </span>
                        </div>
                        <span className="text-[10px] text-[#6E6E73] font-bold">
                          Basado en: {progressiveSuggestions[index].previousLoad}kg (RPE {progressiveSuggestions[index].previousRpe}) · {progressiveSuggestions[index].reason}
                        </span>
                      </div>
                    ) : dynamicSuggestion !== null ? (
                      <div className="flex flex-col gap-1 mt-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-[#FF6B00] font-semibold">
                            💡 Sugerido: {dynamicSuggestion.load}kg
                          </span>
                          <button
                            onClick={() => {
                              if (!log.carga) {
                                onLogChange(index, 'carga', dynamicSuggestion.load);
                              }
                            }}
                            className="text-[10px] bg-[#FFF3EC] text-[#FF6B00] px-2 py-0.5 rounded font-bold hover:bg-[#FF6B00] hover:text-white transition-colors"
                          >
                            Usar
                          </button>
                        </div>
                        <span className="text-[10px] text-[#6E6E73]">
                          {dynamicSuggestion.pct}% de 1RM ({dynamicSuggestion.oneRM}kg)
                          {dynamicSuggestion.avgRPE !== null && dynamicSuggestion.fatigueFactor < 1
                            ? ` · Fatiga RPE ${dynamicSuggestion.avgRPE} → −${Math.round((1 - dynamicSuggestion.fatigueFactor) * 100)}%`
                            : ''}
                        </span>
                      </div>
                    ) : exercise.suggestedWeight?.min && exercise.suggestedWeight?.max ? (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-xs text-[#FF6B00]">💡 Sugerido: {exercise.suggestedWeight.min}-{exercise.suggestedWeight.max}kg</span>
                        <button
                          onClick={() => {
                            if (!log.carga) {
                              const avg = (exercise.suggestedWeight.min + exercise.suggestedWeight.max) / 2;
                              onLogChange(index, 'carga', avg);
                            }
                          }}
                          className="text-[10px] bg-[#FFF3EC] text-[#FF6B00] px-2 py-0.5 rounded font-bold hover:bg-[#FF6B00] hover:text-white transition-colors"
                        >
                          Usar
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] text-[#6E6E73] font-bold uppercase tracking-wider mb-1">Reps</label>
                    <input
                      type="number" inputMode="numeric"
                      value={log.reps}
                      onChange={e => onLogChange(index, 'reps', e.target.value)}
                      placeholder="0"
                      className="w-full bg-white border border-[#E8E8E4] rounded-xl px-3 py-2.5 text-base font-bold text-[#1C1C1E] placeholder:text-[#D4D4D8] focus:border-[#FF6B00] outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* RPE */}
              <div className="px-4 pb-3 pl-16">
                <label className="text-[10px] text-[#6E6E73] font-bold uppercase tracking-wider mb-2 block">RPE Esfuerzo</label>
                <div className="flex items-center gap-1.5">
                  {[6, 7, 8, 9, 10].map(val => (
                    <button
                      key={val}
                      onClick={() => onLogChange(index, 'rpe', val)}
                      className={`flex-1 py-2 rounded-lg text-sm font-condensed font-black transition-all border-2 ${
                        log.rpe === val
                          ? 'text-white scale-[1.05] shadow-sm border-transparent'
                          : 'bg-white border-[#E8E8E4] text-[#6E6E73] hover:border-current'
                      }`}
                      style={
                        log.rpe === val
                          ? { backgroundColor: RPE_COLORS[val], borderColor: RPE_COLORS[val] }
                          : { color: RPE_COLORS[val] }
                      }
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-5 pt-2">
          <button
            onClick={handleClose}
            className="w-full py-4 bg-[#FF6B00] text-white font-condensed font-black text-lg rounded-2xl shadow-[0_4px_16px_rgba(255,107,0,0.3)] active:scale-[0.98] transition-transform tracking-wide"
          >
            GUARDAR Y CERRAR
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
          <div className="relative bg-white border-t border-[#E8E8E4] rounded-t-3xl px-5 pt-5 pb-[calc(1rem+var(--safe-bottom))] animate-slide-up shadow-[0_-8px_40px_rgba(0,0,0,0.1)]">
            <div className="w-10 h-1 bg-[#E8E8E4] rounded-full mx-auto mb-5" />
            <p className="font-condensed font-bold text-xs text-[#6E6E73] tracking-widest uppercase mb-4">
              OPCIONES DE TIEMPO
            </p>
            <div className="flex flex-col gap-2">
              {exercise.restSeconds && (
                <button onClick={handleActionRest} className="w-full flex items-center justify-between p-4 bg-[#F5F5F0] rounded-2xl border border-[#E8E8E4] hover:border-[#FF6B00] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#FFF3EC] text-[#E85D04] p-2 rounded-xl"><Hourglass size={20} /></div>
                    <span className="font-bold text-[15px] text-[#1C1C1E]">Descanso entre series</span>
                  </div>
                  <span className="font-condensed font-black text-[#FF6B00] text-lg">{exercise.restSeconds}s</span>
                </button>
              )}
              {exercise.duration && (
                <button onClick={handleActionDuration} className="w-full flex items-center justify-between p-4 bg-[#F5F5F0] rounded-2xl border border-[#E8E8E4] hover:border-[#FF6B00] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#FFF3EC] text-[#E85D04] p-2 rounded-xl"><Timer size={20} /></div>
                    <span className="font-bold text-[15px] text-[#1C1C1E]">Duración del ejercicio</span>
                  </div>
                  <span className="font-condensed font-black text-[#FF6B00] text-lg">{exercise.duration}</span>
                </button>
              )}
              <div className="h-px bg-[#E8E8E4] my-1" />
              <button onClick={handleGenerateCircuit} className="w-full flex items-center justify-between p-4 bg-[#F5F5F0] rounded-2xl border border-[#E8E8E4] hover:border-[#FF6B00] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-[#FFF3EC] text-[#FF6B00] p-2 rounded-xl"><Repeat size={20} /></div>
                  <span className="font-bold text-[15px] text-[#1C1C1E]">Generar circuito de sesión</span>
                </div>
                <ArrowRight size={18} className="text-[#6E6E73]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
