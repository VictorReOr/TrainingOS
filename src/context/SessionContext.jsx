import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { saveLog as _saveLog } from '../services/sheets';

const LS_SESSION_LOGS = 'trainingos_session_logs';
const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [activeSession, setActiveSession] = useState(null);
  const [exerciseLogs, setExerciseLogs] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Timer tick for active session
  useEffect(() => {
    if (!activeSession || !startTime) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession, startTime]);

  /**
   * Carga una sesión planificada para ejecutarla.
   */
  const loadSession = (sessionData) => {
    setActiveSession(sessionData);
    setStartTime(Date.now());
    setElapsedSeconds(0);

    // Inicializar estructuras de logs por ejercicio
    const initialLogs = {};
    if (sessionData && sessionData.blocks) {
      sessionData.blocks.forEach(block => {
        if (block.exercises) {
          block.exercises.forEach(ex => {
            const numSets = parseInt(ex.series || ex.sets || '3') || 3;
            initialLogs[ex.id] = Array.from({ length: numSets }, () => ({
              carga: ex.loadRef ? parseFloat(ex.loadRef) : '',
              reps: ex.reps || ex.targetReps || '',
              rpe: null,
              velocidad: null,
              calidadTecnica: null,
              done: false
            }));
          });
        }
      });
    }
    setExerciseLogs(initialLogs);
  };

  /**
   * Actualiza el valor de una serie en un ejercicio.
   */
  const updateLogSet = (exerciseId, setIndex, field, value) => {
    setExerciseLogs(prev => {
      const exLogs = prev[exerciseId] ? [...prev[exerciseId]] : [];
      if (!exLogs[setIndex]) return prev;
      exLogs[setIndex] = { ...exLogs[setIndex], [field]: value };
      return { ...prev, [exerciseId]: exLogs };
    });
  };

  /**
   * Cambia el estado completado de una serie.
   */
  const toggleLogSet = (exerciseId, setIndex) => {
    setExerciseLogs(prev => {
      const exLogs = prev[exerciseId] ? [...prev[exerciseId]] : [];
      if (!exLogs[setIndex]) return prev;
      const isDone = !exLogs[setIndex].done;
      exLogs[setIndex] = { ...exLogs[setIndex], done: isDone };
      return { ...prev, [exerciseId]: exLogs };
    });
  };

  /**
   * Reinicia las series registradas en la sesión actual.
   */
  const resetSession = () => {
    if (activeSession) {
      loadSession(activeSession);
    }
  };

  /**
   * Limpia la sesión activa.
   */
  const clearSession = () => {
    setActiveSession(null);
    setExerciseLogs({});
    setStartTime(null);
    setElapsedSeconds(0);
  };

  // ── Cálculo de Métricas ───────────────────────────────────────
  const { completedCount, totalCount, volTotal, rpeMedio } = useMemo(() => {
    let completed = 0;
    let total = 0;
    let vol = 0;
    let rpeSum = 0;
    let rpeCount = 0;

    Object.values(exerciseLogs).forEach(logs => {
      logs.forEach(s => {
        total++;
        if (s.done) {
          completed++;
          const load = parseFloat(s.carga) || 0;
          const reps = parseInt(s.reps) || 0;
          vol += load * reps;
          if (s.rpe) {
            rpeSum += parseFloat(s.rpe);
            rpeCount++;
          }
        }
      });
    });

    return {
      completedCount: completed,
      totalCount: total,
      volTotal: Math.round(vol),
      rpeMedio: rpeCount > 0 ? (rpeSum / rpeCount).toFixed(1) : '0.0'
    };
  }, [exerciseLogs]);

  const isFinished = totalCount > 0 && completedCount === totalCount;

  const tiempoFormateado = useMemo(() => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [elapsedSeconds]);

  /**
   * Guardar la sesión finalizada en localStorage y Sheets.
   */
  const saveSession = async () => {
    if (!activeSession) return;
    setIsSaving(true);
    try {
      const now = new Date().toISOString();

      // Mapear ejercicios con logs completados
      const ejerciciosArray = [];
      if (activeSession.blocks) {
        activeSession.blocks.forEach(block => {
          if (block.exercises) {
            block.exercises.forEach(ex => {
              const logs = exerciseLogs[ex.id] || [];
              ejerciciosArray.push({
                id: ex.id,
                nombre: ex.name,
                seriesLog: logs
              });
            });
          }
        });
      }

      const logEntry = {
        id: `session-log-${Date.now()}`,
        fecha: now,
        sessionId: activeSession.id,
        sessionName: activeSession.name || 'Sesión',
        durationMinutes: Math.ceil(elapsedSeconds / 60) || 45,
        rpe: rpeMedio,
        volumenTotal: volTotal,
        ejercicios: ejerciciosArray
      };

      // Guardar en localStorage
      const existingRaw = localStorage.getItem(LS_SESSION_LOGS);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [logEntry, ...existing];
      localStorage.setItem(LS_SESSION_LOGS, JSON.stringify(updated));

      // Notificar evento global de actualización de logs
      window.dispatchEvent(new Event('session_logs_updated'));
      window.dispatchEvent(new CustomEvent('new_session_saved', { detail: logEntry }));

      // Fondo a Sheets
      try {
        await _saveLog(logEntry);
      } catch (e) {
        console.warn('[SessionContext] Sheets saveLog failed (offline/demo):', e);
      }

      return logEntry;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SessionContext.Provider value={{
      sessionData: activeSession,
      activeSession,
      exerciseLogs,
      completedCount,
      totalCount,
      volTotal,
      rpeMedio,
      tiempoFormateado,
      isFinished,
      isSaving,
      loadSession,
      clearSession,
      resetSession,
      updateLogSet,
      toggleLogSet,
      saveSession
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
