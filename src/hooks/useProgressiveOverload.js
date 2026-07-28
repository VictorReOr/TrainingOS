import { useMemo, useEffect, useState } from 'react';
import { usePR } from '../context/PRContext';
import { usePlanner } from '../context/PlannerContext';
import { suggestLoad } from '../utils/loadSuggestion';

/**
 * Hook custom para encapsular la lógica de sobrecarga progresiva en React.
 * Usa el nuevo motor con mesociclos, RPE objetivo y velocidad percibida.
 * 
 * @param {string} exerciseId - ID del ejercicio.
 * @param {string} exerciseName - Nombre del ejercicio (unused, kept for compat).
 * @param {string|number} targetReps - Repeticiones prescritas.
 * @param {string} sessionType - Tipo de sesión (unused, kept for compat).
 * @returns {object} Sugerencias y estado de progresión.
 */
export function useProgressiveOverload(exerciseId, exerciseName, targetReps, sessionType) {
  const { prs } = usePR();
  const { activeMesocycle } = usePlanner();

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

  // Calcular semana dentro del mesociclo
  const mesoWeek = useMemo(() => {
    if (!activeMesocycle) return null;
    const start = new Date(activeMesocycle.startDate);
    const now = new Date();
    const weeks = Math.floor(
      (now - start) / (1000*60*60*24*7)
    ) + 1;
    return Math.min(weeks, activeMesocycle.weeks);
  }, [activeMesocycle]);

  const suggestion = useMemo(() => {
    return suggestLoad({
      exerciseId,
      targetReps,
      prs,
      sessionLogs,
      mesoType: activeMesocycle?.type || null,
      mesoWeek
    });
  }, [exerciseId, targetReps, prs, sessionLogs, activeMesocycle, mesoWeek]);

  // Map to a compatible return shape for ExerciseRow and other consumers
  const hasHistory = suggestion !== null;
  const weeklyImprovePct = suggestion?.progression?.includes('↑↑') ? 3
    : suggestion?.progression?.includes('↑') ? 1.5
    : 0;
  const isDeloadSuggested = suggestion?.progression?.includes('↓') || false;
  const trendDirection = weeklyImprovePct > 0 ? 'up'
    : isDeloadSuggested ? 'down'
    : 'stable';

  return {
    prescribedLoad: suggestion?.suggested || 0,
    nextSessionLoad: suggestion?.suggested || 0,
    rpeTarget: suggestion?.rpeTarget || { min: 7, max: 8 },
    pct1RM: suggestion ? Math.round((suggestion.suggested / suggestion.oneRM) * 100) : 0,
    e1RM: suggestion?.oneRM || 0,
    confidence: suggestion?.confidence || 'baja',
    isDeloadSuggested,
    deloadReason: isDeloadSuggested ? suggestion?.progression : null,
    deloadLoad: isDeloadSuggested ? suggestion?.suggested : null,
    weeklyImprovePct,
    breakdown: null,
    lastSession: null,
    hasHistory,
    trendDirection,
    suggestion
  };
}
