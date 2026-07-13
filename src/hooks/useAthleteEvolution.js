import { useState, useEffect } from 'react';
import { getLogs, getPRs } from '../services/sheets';
export function useAthleteEvolution(atletaId) {
  const [logs, setLogs] = useState([]);
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [logsRes, prsRes] = await Promise.all([
          getLogs(atletaId),
          getPRs(atletaId)
        ]);
        
        let loadedLogs = logsRes?.rows || [];
        // If demo mode and empty, insert dummy data
        const isDemo = localStorage.getItem('trainingos_demo_mode') === 'true' || import.meta.env.VITE_USE_MOCK === 'true';
        if (loadedLogs.length === 0 && isDemo) {
          // just generate a quick dummy set
          loadedLogs = [];
          for (let i = 0; i < 5; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i * 3);
            loadedLogs.push({
              id: 'dummy-' + i,
              fecha: d.toISOString().split('T')[0],
              name: 'Sesión Pupil',
              duration: 45,
              type: 'gym',
              ejerciciosLimpios: ['Sentadilla'],
              ejercicios: [{
                exerciseName: 'Sentadilla',
                seriesLog: [{ type: 'REGULAR', cargaReal: 100, repsReales: 8, rpeReal: 8 }]
              }]
            });
          }
        }
        
        setLogs(loadedLogs);
        setPrs(prsRes?.rows || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (atletaId) fetchData();
  }, [atletaId]);

  return { sessionLogs: logs, prs, loading };
}
