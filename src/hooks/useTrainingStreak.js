import { useState, useEffect, useMemo } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { computeTrainingStreak } from '../utils/streak';

const LS_SESSION_LOGS = 'trainingos_session_logs';

export function useTrainingStreak() {
  const { weekAssignments } = usePlanner();
  
  const [sessionLogs, setSessionLogs] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_SESSION_LOGS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const loadLogs = () => {
      try {
        const raw = localStorage.getItem(LS_SESSION_LOGS);
        setSessionLogs(raw ? JSON.parse(raw) : []);
      } catch {
        setSessionLogs([]);
      }
    };

    // Subscripción a cambios de logs para recalcular racha
    window.addEventListener('storage', loadLogs);
    window.addEventListener('session_logs_updated', loadLogs);
    window.addEventListener('new_session_saved', loadLogs);

    return () => {
      window.removeEventListener('storage', loadLogs);
      window.removeEventListener('session_logs_updated', loadLogs);
      window.removeEventListener('new_session_saved', loadLogs);
    };
  }, []);

  const { currentStreak, days } = useMemo(() => {
    return computeTrainingStreak(weekAssignments, sessionLogs);
  }, [weekAssignments, sessionLogs]);

  return { currentStreak, days };
}
