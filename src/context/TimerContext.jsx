import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { playShortBeep, playLongBeep, playWorkBeep, playRestBeep, vibrateShort, vibrateLong } from '../utils/audio';

// Estado global de entrenamiento interactivo
const TimerContext = createContext();

export function TimerProvider({ children }) {
  const [mode, setMode] = useState(null); // 'stopwatch' | 'countdown' | 'hiit' | 'tabata' | 'rest'
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'paused' | 'completed'
  
  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);

  // Tiempo en pantalla
  const [timeMs, setTimeMs] = useState(0);
  const [initialTimeMs, setInitialTimeMs] = useState(0);

  const [intervalConfig, setIntervalConfig] = useState({
    work: 0,
    rest: 0,
    rounds: 0,
    currentPhase: 'setup', 
    currentRound: 0
  });

  const [showRestModal, setShowRestModal] = useState(false);

  // Core Engine mutable para evitar re-renderizados colosales
  const engineRef = useRef({
    targetTime: 0,
    elapsedMs: 0,
    lastTick: 0,
  });

  const rafRef = useRef(null);
  const lastBeepSecRef = useRef(null);

  const tick = (now) => {
    if (engineRef.current.lastTick === 0) engineRef.current.lastTick = now;
    const delta = now - engineRef.current.lastTick;
    engineRef.current.lastTick = now;

    if (mode === 'stopwatch') {
      engineRef.current.elapsedMs += delta;
      setTimeMs(engineRef.current.elapsedMs);
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // Modalidades regresivas
    engineRef.current.targetTime -= delta;
    const currentT = engineRef.current.targetTime;
    
    // Sincroniza al UI frame
    setTimeMs(currentT > 0 ? currentT : 0);

    // Countdown beeps 3-2-1
    if (currentT > 0) {
      const secsRemaining = Math.ceil(currentT / 1000);
      if (secsRemaining <= 3 && secsRemaining > 0) {
        if (lastBeepSecRef.current !== secsRemaining) {
          lastBeepSecRef.current = secsRemaining;
          playShortBeep();
          vibrateShort();
        }
      }
    }

    // Eventos (Llegada a 0)
    if (currentT <= 0) {
      if (mode === 'countdown' || mode === 'rest') {
        setStatus('completed');
        playLongBeep();
        vibrateLong();
        
        if (mode === 'rest') {
            setTimeout(() => {
               setShowRestModal(false);
               setMode(null);
            }, 3000);
        }
        return; // Detiene el tick
      }

      if (mode === 'hiit' || mode === 'tabata') {
         setIntervalConfig(cfg => {
            // Si acabamos de terminar el ultimo work de la ultima ronda, fin de sesion.
            if (cfg.currentRound === cfg.rounds && cfg.currentPhase === 'work') {
               setStatus('completed');
               playLongBeep();
               vibrateLong();
               return { ...cfg, currentPhase: 'finished' };
            }

            let nextPhase = cfg.currentPhase === 'work' ? 'rest' : 'work';
            let nextRound = cfg.currentPhase === 'rest' ? cfg.currentRound + 1 : cfg.currentRound;
            
            if (nextPhase === 'work') {
               playWorkBeep(); vibrateShort();
               engineRef.current.targetTime = cfg.work;
            } else {
               playRestBeep(); vibrateShort();
               engineRef.current.targetTime = cfg.rest;
            }
            return { ...cfg, currentPhase: nextPhase, currentRound: nextRound };
         });
         
         // Sigue rotando si no fue 'finished'
         // El setState no detiene este block de JS así que llamamos requestAnimationFrame
      }
    }

    // Repite ciclo
    if (statusRef.current === 'running') {
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  useEffect(() => {
    if (status === 'running') {
      engineRef.current.lastTick = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [status, mode]);

  // --- ACCIONES MAESTRAS ---

  const startStopwatch = () => {
    engineRef.current.elapsedMs = 0;
    setMode('stopwatch'); setTimeMs(0); setStatus('running');
  };

  const startCountdown = (totalMs) => {
    engineRef.current.targetTime = totalMs;
    lastBeepSecRef.current = null;
    setInitialTimeMs(totalMs);
    setMode('countdown'); setTimeMs(totalMs); setStatus('running');
  };

  const startRest = (seconds) => {
    const ms = seconds * 1000;
    engineRef.current.targetTime = ms;
    lastBeepSecRef.current = null;
    setInitialTimeMs(ms);
    setMode('rest'); setTimeMs(ms); setStatus('running'); setShowRestModal(true);
  };

  const startHiit = (workS, restS, rounds) => {
    const wMs = workS * 1000;
    engineRef.current.targetTime = wMs;
    lastBeepSecRef.current = null;
    setIntervalConfig({ work: wMs, rest: restS * 1000, rounds, currentPhase: 'work', currentRound: 1 });
    setMode('hiit'); setTimeMs(wMs); setStatus('running');
    playWorkBeep(); vibrateShort();
  };

  const startTabata = () => {
    startHiit(20, 10, 8);
    setMode('tabata');
  };

  const pauseTimer = () => setStatus('paused');
  const resumeTimer = () => {
     engineRef.current.lastTick = performance.now();
     setStatus('running');
  };
  const stopTimer = () => {
    setStatus('idle');
    setMode(null);
    setTimeMs(0);
    setShowRestModal(false);
  };

  return (
    <TimerContext.Provider value={{
      mode, status, timeMs, initialTimeMs, intervalConfig,
      showRestModal, setShowRestModal,
      startStopwatch, startCountdown, startRest, startHiit, startTabata,
      pauseTimer, resumeTimer, stopTimer
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export const useTimer = () => useContext(TimerContext);
