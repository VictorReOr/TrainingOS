import { useMemo, useEffect, useState } from 'react';
import { usePR } from '../context/PRContext';
import { useAthlete } from '../context/AthleteContext';
import { getFullSuggestion } from '../utils/loadSuggestion';

/**
 * Hook custom para encapsular la lógica de sobrecarga progresiva en React.
 * 
 * @param {string} exerciseId - ID del ejercicio.
 * @param {string} exerciseName - Nombre del ejercicio.
 * @param {string|number} targetReps - Repeticiones prescritas.
 * @param {string} sessionType - Tipo de sesión (gym_fuerza, gym_hipertrofia, etc.).
 * @returns {object} Sugerencias y estado de progresión.
 */
export function useProgressiveOverload(exerciseId, exerciseName, targetReps, sessionType) {
  const { prs } = usePR();
  const { athlete } = useAthlete();

  // Historial de logs leído de localStorage
  const [sessionLogs, setSessionLogs] = useState([]);

  useEffect(() => {
    const loadLogs = () => {
      try {
        const raw = localStorage.getItem('trainingos_session_logs');
        setSessionLogs(raw ? JSON.parse(raw) : []);
      } catch (e) {
        console.error('Error al cargar session_logs en useProgressiveOverload:', e);
      }
    };

    loadLogs();

    // Escuchar cambios en localStorage (por si se completa sesión en otra pestaña/componente)
    window.addEventListener('storage', loadLogs);
    // Evento personalizado para cambios locales en el mismo hilo
    window.addEventListener('session_logs_updated', loadLogs);

    return () => {
      window.removeEventListener('storage', loadLogs);
      window.removeEventListener('session_logs_updated', loadLogs);
    };
  }, []);

  const athleteLevel = athlete?.level || 'intermedio';

  const suggestion = useMemo(() => {
    return getFullSuggestion({
      exerciseId,
      exerciseName,
      targetReps,
      sessionType,
      prs,
      sessionLogs,
      athleteLevel
    });
  }, [exerciseId, exerciseName, targetReps, sessionType, prs, sessionLogs, athleteLevel]);

  return {
    prescribedLoad: suggestion.prescribedLoad,
    nextSessionLoad: suggestion.nextSessionLoad,
    rpeTarget: suggestion.rpeTarget,
    pct1RM: suggestion.pct1RM,
    e1RM: suggestion.e1RM,
    confidence: suggestion.confidence,
    isDeloadSuggested: suggestion.isDeloadSuggested,
    deloadReason: suggestion.deloadReason,
    deloadLoad: suggestion.deloadLoad,
    weeklyImprovePct: suggestion.weeklyImprovePct,
    breakdown: suggestion.breakdown,
    lastSession: suggestion.lastSession,
    hasHistory: !!suggestion.lastSession
  };
}
