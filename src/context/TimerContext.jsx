import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { playShortBeep, playLongBeep, playWorkBeep, playRestBeep, playSound, SOUND_PRESETS, vibrateShort, vibrateLong, unlockAudio } from '../utils/audio';
import { scheduleTimerAlert, cancelTimerAlert } from '../utils/notifications';

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

  const [completionSound, setCompletionSoundState] = useState(() => {
    return localStorage.getItem('trainingos_completion_sound') || 'beep_long';
  });
  const completionSoundRef = useRef(completionSound);
  const setCompletionSound = (soundId) => {
    completionSoundRef.current = soundId;
    setCompletionSoundState(soundId);
    localStorage.setItem('trainingos_completion_sound', soundId);
  };

  /**
   * Envía notificación del sistema si el temporizador finaliza con la app en segundo plano
   * y el permiso ya ha sido otorgado por el usuario.
   */
  const triggerBackgroundNotification = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(reg => {
            reg.showNotification('TrainingOS — ¡Tiempo de descanso completado!', {
              body: 'Tu descanso ha finalizado. ¡A por la siguiente serie!',
              icon: '/icon-192.png',
              badge: '/icon-48.png',
              vibrate: [300, 150, 300],
              tag: 'trainingos-timer-alert',
              renotify: true,
            });
          }).catch(() => {
            new Notification('TrainingOS — ¡Tiempo de descanso completado!', {
              body: 'Tu descanso ha finalizado. ¡A por la siguiente serie!',
              icon: '/icon-180.png',
              vibrate: [300, 150, 300]
            });
          });
        } else {
          new Notification('TrainingOS — ¡Tiempo de descanso completado!', {
            body: 'Tu descanso ha finalizado. ¡A por la siguiente serie!',
            icon: '/icon-180.png',
            vibrate: [300, 150, 300]
          });
        }
      } catch (e) {
        console.warn('[TimerContext] Error enviando Notification:', e);
      }
    }
  };

  // Core Engine mutable para evitar re-renderizados colosales
  const engineRef = useRef({
    targetTime: 0,
    elapsedMs: 0,
    lastTick: 0,
    targetTimestamp: 0,
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

    // Modalidades regresivas: cálculo contra ancla de reloj real
    const currentT = engineRef.current.targetTimestamp - Date.now();
    engineRef.current.targetTime = currentT;
    
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
        playSound(completionSoundRef.current);
        vibrateLong();
        cancelTimerAlert();
        
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
          triggerBackgroundNotification();
        }
        
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
               playSound(completionSoundRef.current);
               vibrateLong();
               if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
                 triggerBackgroundNotification();
               }
               return { ...cfg, currentPhase: 'finished' };
            }

            let nextPhase = cfg.currentPhase === 'work' ? 'rest' : 'work';
            let nextRound = cfg.currentPhase === 'rest' ? cfg.currentRound + 1 : cfg.currentRound;
            
            if (nextPhase === 'work') {
               playWorkBeep(); vibrateShort();
               engineRef.current.targetTime = cfg.work;
               engineRef.current.targetTimestamp = Date.now() + cfg.work;
            } else {
               playRestBeep(); vibrateShort();
               engineRef.current.targetTime = cfg.rest;
               engineRef.current.targetTimestamp = Date.now() + cfg.rest;
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

  // Sincronización al volver de segundo plano / reactivar pantalla
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && statusRef.current === 'running') {
        if (mode === 'countdown' || mode === 'rest') {
          const remaining = engineRef.current.targetTimestamp - Date.now();
          if (remaining <= 0) {
            setStatus('completed');
            playSound(completionSoundRef.current);
            vibrateLong();
            setTimeMs(0);
            if (mode === 'rest') {
              setTimeout(() => {
                setShowRestModal(false);
                setMode(null);
              }, 3000);
            }
          } else {
            setTimeMs(remaining);
            engineRef.current.lastTick = performance.now();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [mode]);

  // --- ACCIONES MAESTRAS ---

  const startStopwatch = () => {
    unlockAudio();
    engineRef.current.elapsedMs = 0;
    setMode('stopwatch'); setTimeMs(0); setStatus('running');
  };

  const startCountdown = (totalMs) => {
    unlockAudio();
    engineRef.current.targetTime = totalMs;
    engineRef.current.targetTimestamp = Date.now() + totalMs;
    lastBeepSecRef.current = null;
    setInitialTimeMs(totalMs);
    setMode('countdown'); setTimeMs(totalMs); setStatus('running');
    scheduleTimerAlert(engineRef.current.targetTimestamp, 'TrainingOS — ¡Tiempo completado!', 'El temporizador ha finalizado.');
  };

  const startRest = (seconds) => {
    // 1. Desbloqueo de audio como primera línea en el gesto directo del usuario
    unlockAudio();
    const ms = seconds * 1000;
    engineRef.current.targetTime = ms;
    engineRef.current.targetTimestamp = Date.now() + ms;
    lastBeepSecRef.current = null;
    setInitialTimeMs(ms);
    setMode('rest'); setTimeMs(ms); setStatus('running'); setShowRestModal(true);
    scheduleTimerAlert(engineRef.current.targetTimestamp, 'TrainingOS — ¡Descanso completado!', 'Tu descanso ha finalizado. ¡A por la siguiente serie!');
  };

  const startHiit = (workS, restS, rounds) => {
    unlockAudio();
    const wMs = workS * 1000;
    engineRef.current.targetTime = wMs;
    engineRef.current.targetTimestamp = Date.now() + wMs;
    lastBeepSecRef.current = null;
    setIntervalConfig({ work: wMs, rest: restS * 1000, rounds, currentPhase: 'work', currentRound: 1 });
    setMode('hiit'); setTimeMs(wMs); setStatus('running');
    playWorkBeep(); vibrateShort();
    scheduleTimerAlert(engineRef.current.targetTimestamp, 'TrainingOS — ¡Fin de intervalo!', 'Cambio de fase en el circuito.');
  };

  const startTabata = () => {
    unlockAudio();
    startHiit(20, 10, 8);
    setMode('tabata');
  };

  const pauseTimer = () => {
    cancelTimerAlert();
    setStatus('paused');
  };
  
  const resumeTimer = () => {
     unlockAudio();
     engineRef.current.lastTick = performance.now();
     engineRef.current.targetTimestamp = Date.now() + engineRef.current.targetTime;
     setStatus('running');
     scheduleTimerAlert(
       engineRef.current.targetTimestamp,
       mode === 'rest' ? 'TrainingOS — ¡Descanso completado!' : 'TrainingOS — ¡Tiempo completado!',
       mode === 'rest' ? 'Tu descanso ha finalizado. ¡A por la siguiente serie!' : 'El temporizador ha finalizado.'
     );
  };
  
  const stopTimer = () => {
    cancelTimerAlert();
    setStatus('idle');
    setMode(null);
    setTimeMs(0);
    setShowRestModal(false);
  };

  return (
    <TimerContext.Provider value={{
      mode, status, timeMs, initialTimeMs, intervalConfig,
      showRestModal, setShowRestModal,
      completionSound, setCompletionSound, SOUND_PRESETS, playSound,
      startStopwatch, startCountdown, startRest, startHiit, startTabata,
      pauseTimer, resumeTimer, stopTimer
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export const useTimer = () => useContext(TimerContext);

