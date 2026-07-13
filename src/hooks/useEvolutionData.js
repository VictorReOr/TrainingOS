import { useMemo, useState, useEffect } from 'react';
import { usePR } from '../context/PRContext';
import { usePlanner } from '../context/PlannerContext';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const LS_SESSION_LOGS = 'trainingos_session_logs';

export function useEvolutionData() {
  const { prs, getPRHistory } = usePR();
  const { seasons } = usePlanner();

  const [sessionLogs, setSessionLogs] = useState([]);
  const isDemoMode = false; // Mantenemos la variable en false para no romper firmas de componentes

  useEffect(() => {
    let raw = [];
    try {
      const stored = localStorage.getItem(LS_SESSION_LOGS);
      if (stored) {
        raw = JSON.parse(stored);
      }
    } catch {}

    setSessionLogs(raw);
  }, [prs.length]);

  // Ejercicios con PRs registrados
  const exercisesWithPRs = useMemo(() => {

    const uniqueIds = [...new Set(prs.map(pr => pr.exerciseId))];
    const computed = uniqueIds.map(id => {
      const history = getPRHistory(id);
      if (history.length === 0) return null;
      
      const latest = history[0]; 
      return {
        exerciseId: id,
        exerciseName: latest.exerciseName,
        latestPR: Math.round(latest.valor),
        count: history.length
      };
    }).filter(Boolean);
    
    // Order by count desc (los más entrenados primero)
    return computed.sort((a,b) => b.count - a.count);
  }, [prs, isDemoMode, getPRHistory]);

  const hasData = exercisesWithPRs.length > 0 || sessionLogs.length > 0;

  // Función para obtener datos evolutivos de un ejercicio
  const getExerciseChartData = (exerciseId) => {

    const history = getPRHistory(exerciseId);
    if (!history) return [];
    
    // Invertir para orden cronológico (asegurar por fecha en vez de por valor)
    return [...history].sort((a,b) => new Date(a.fecha) - new Date(b.fecha)).map(h => ({
      fecha: h.fecha,
      valor: Math.round(h.valor),
      cargaReal: Math.round(h.cargaReal),
      repsReales: h.repsReales
    }));
  };

  // Comparativa mesociclos: 
  // Buscar el PR máximo en las fechas de cada mesociclo
  const getMesocycleComparison = (exerciseId) => {

    const history = getPRHistory(exerciseId);
    if (!history || history.length === 0) return [];

    // Recopilar todos los mesociclos activos y pasados
    const allMesoList = [];
    seasons.forEach(s => {
      if (s.mesocycles) {
        s.mesocycles.forEach(m => allMesoList.push(m));
      }
    });

    const results = [];

    // Asociación retroactiva
    // Para cada mesociclo calculamos las fechas límite y extraemos los prs comprendidos
    allMesoList.forEach(meso => {
      const startDate = new Date(meso.startDate);
      // El mesociclo acaba startDate + weeks*7 días
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (meso.weeks * 7));

      // Buscar PRs dentro del bloque
      const prsInMeso = history.filter(h => {
        const d = new Date(h.fecha);
        return d >= startDate && d <= endDate;
      });

      if (prsInMeso.length > 0) {
        const maxPR = Math.max(...prsInMeso.map(h => h.valor));
        results.push({
          mesoName: meso.name || 'Sin Nombre',
          mesoColor: meso.color || '#3d7dd4',
          maxPR: Math.round(maxPR)
        });
      }
    });

    return results;
  };

  return {
    exercisesWithPRs,
    sessionLogs,
    getMesocycleComparison,
    getExerciseChartData,
    hasData,
    isDemoMode
  };
}
