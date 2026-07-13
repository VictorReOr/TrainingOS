import { useState, useEffect } from 'react';
import { getWeekAssignments, assignSessionToDay } from '../services/sheets';

export function useAthletePlan(atletaId) {
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);

  // Simplified format for assignments: { "Lunes": { ...session }, "Martes": ... }
  // getWeekAssignments returns [{ fecha_iso, sessionData }]
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await getWeekAssignments(atletaId);
        const map = {};
        const DAYS_ES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
        (res?.rows || []).forEach(row => {
          const d = new Date(row.fecha_iso);
          // Quick day map
          const dayName = DAYS_ES[d.getDay()];
          map[dayName] = row.sessionData;
        });
        
        // Mock fallback check
        const isDemo = localStorage.getItem('trainingos_demo_mode') === 'true' || import.meta.env.VITE_USE_MOCK === 'true';
        if (Object.keys(map).length === 0 && isDemo) {
           map['Lunes'] = { name: 'Fullbody Pupil', duration: 45 };
           map['Jueves'] = { name: 'Cardio Pupil', duration: 30 };
        }
        
        setAssignments(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (atletaId) fetchData();
  }, [atletaId]);

  const assignSession = async (dayString, sessionData) => {
    // Determine an ISO date for the day string (e.g. "Lunes" -> get date of this incoming monday)
    // Simplified logic: just save in UI, mock API.
    setAssignments(prev => ({ ...prev, [dayString]: sessionData }));
    
    // Remote
    try {
      await assignSessionToDay({ 
        atletaId,
        fecha_texto: dayString,
        sessionData 
      });
    } catch (e) {
      console.error(e);
    }
  };

  const removeSession = async (dayString) => {
    setAssignments(prev => {
      const n = { ...prev };
      delete n[dayString];
      return n;
    });
    // Remove remote (assigning null)
    try {
      await assignSessionToDay({ atletaId, fecha_texto: dayString, sessionData: null });
    } catch (e) {
      console.error(e);
    }
  };

  return { assignments, assignSession, removeSession, loading };
}
