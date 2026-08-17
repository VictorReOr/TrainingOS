import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { saveLog as _saveLog } from '../services/sheets';
import { usePR } from './PRContext';
import { useAuth } from './AuthContext';
import { estimate1RM } from '../engine/performance/utils/oneRMEstimators';

const LS_SESSION_LOGS = 'trainingos_session_logs';
const LS_DRAFT = 'trainingos_active_session_draft';
const SessionContext = createContext();

export function SessionProvider({ children }) {
  const { savePRRecord } = usePR();
  const { currentUser } = useAuth();

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
   * Guarda un draft incremental en localStorage.
   * Usa merge preservativo: hereda campos de otros writers (ej. ssRoundState de Session.jsx).
   */
  const _saveDraft = (logsSnapshot) => {
    if (!activeSession) return;
    try {
      let existing = {};
      try {
        const raw = localStorage.getItem(LS_DRAFT);
        if (raw) existing = JSON.parse(raw);
      } catch (_) {}
      localStorage.setItem(LS_DRAFT, JSON.stringify({
        ...existing,
        activeSession,
        exerciseLogs: logsSnapshot,
        startTime,
        savedAt: Date.now(),
      }));
    } catch (_) { /* localStorage lleno — fallo silencioso */ }
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
   * Cambia el estado completado de una serie. Dispara autoguardado del draft.
   */
  const toggleLogSet = (exerciseId, setIndex) => {
    const prev = exerciseLogs;
    const exLogs = prev[exerciseId] ? [...prev[exerciseId]] : [];
    if (!exLogs[setIndex]) return;
    exLogs[setIndex] = { ...exLogs[setIndex], done: !exLogs[setIndex].done };
    const next = { ...prev, [exerciseId]: exLogs };
    setExerciseLogs(next);
    _saveDraft(next);
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
    localStorage.removeItem(LS_DRAFT);
  };

  // ── Draft recovery ────────────────────────────────────────────
  const getDraft = () => {
    try {
      const raw = localStorage.getItem(LS_DRAFT);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  };

  const discardDraft = () => {
    localStorage.removeItem(LS_DRAFT);
  };

  const restoreFromDraft = (draft) => {
    if (!draft) return;
    setActiveSession(draft.activeSession);
    setExerciseLogs(draft.exerciseLogs || {});
    setStartTime(draft.startTime || Date.now());
    setElapsedSeconds(
      draft.startTime ? Math.floor((Date.now() - draft.startTime) / 1000) : 0
    );
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
        instanceId: activeSession.instanceId || null,
        sessionName: activeSession.name || 'Sesión',
        durationMinutes: Math.ceil(elapsedSeconds / 60) || 45,
        rpe: rpeMedio,
        volumenTotal: volTotal,
        ejercicios: ejerciciosArray
      };

      // Generar y guardar PRs para ejercicios con series completadas con carga > 0 (A.1)
      ejerciciosArray.forEach(ex => {
        if (!ex || !ex.id || !Array.isArray(ex.seriesLog)) return;
        const validSets = ex.seriesLog.filter(s => s && s.done && parseFloat(s.carga) > 0 && parseInt(s.reps) > 0);
        if (validSets.length === 0) return;

        let max1RM = 0;
        let bestCarga = 0;
        let bestReps = 0;

        validSets.forEach(s => {
          const c = parseFloat(s.carga);
          const r = parseInt(s.reps);
          const est = estimate1RM(c, r, 'epley');
          if (est > max1RM) {
            max1RM = est;
            bestCarga = c;
            bestReps = r;
          }
        });

        if (max1RM > 0) {
          let storedAthleteId = null;
          try {
            const rawAth = localStorage.getItem('trainingos_athlete');
            if (rawAth) storedAthleteId = JSON.parse(rawAth)?.id;
          } catch (_) {}

          const targetAtletaId = currentUser?.id || storedAthleteId;
          if (!targetAtletaId) {
            console.warn('[SessionContext] No se guardó el PR: falta un atletaId (currentUser/athlete) válido.');
          } else {
            savePRRecord({
              exerciseId: ex.id,
              exerciseName: ex.nombre || ex.name || 'Ejercicio',
              atletaId: targetAtletaId,
              fecha: now,
              valor: Math.round(max1RM * 10) / 10,
              cargaReal: bestCarga,
              repsReales: bestReps,
              unidad: 'kg'
            });
          }
        }
      });

      // Guardar en localStorage
      const existingRaw = localStorage.getItem(LS_SESSION_LOGS);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [logEntry, ...existing];
      localStorage.setItem(LS_SESSION_LOGS, JSON.stringify(updated));
      localStorage.removeItem(LS_DRAFT);

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
      saveSession,
      getDraft,
      discardDraft,
      restoreFromDraft
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
