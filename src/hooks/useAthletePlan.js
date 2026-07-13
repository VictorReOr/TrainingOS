import { useState, useEffect, useMemo } from 'react';
import { getWeekAssignments, assignSessionToDay as apiAssignSession } from '../services/sheets';

// Helper: Get Monday of a given date
const getMondayOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

// Helper: format Date to YYYY-MM-DD
const formatISO = (d) => {
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function useAthletePlan(atletaId) {
  const [currentWeekStart, setCurrentWeekStart] = useState(getMondayOfWeek());
  const [assignments, setAssignments] = useState({}); // { [dateISO]: sessionData }
  const [loading, setLoading] = useState(true);

  // Navigate weeks
  const navigateWeek = (direction) => {
    setCurrentWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + direction * 7);
      return d;
    });
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const weekStartStr = formatISO(currentWeekStart);
        
        // Calculate Sunday
        const dEnd = new Date(currentWeekStart);
        dEnd.setDate(dEnd.getDate() + 6);
        const weekEndStr = formatISO(dEnd);

        const res = await getWeekAssignments(atletaId, weekStartStr, weekEndStr);
        const map = {};
        
        (res?.rows || []).forEach(row => {
          map[row.fecha_iso] = row.sessionData;
        });
        
        // Mock fallback check
        const isDemo = localStorage.getItem('trainingos_demo_mode') === 'true' || import.meta.env.VITE_USE_MOCK === 'true';
        if (Object.keys(map).length === 0 && isDemo) {
           const mon = new Date(currentWeekStart);
           const thu = new Date(currentWeekStart);
           thu.setDate(thu.getDate() + 3);
           map[formatISO(mon)] = { name: 'Fullbody Pupil', duration: 45, type: 'gym' };
           map[formatISO(thu)] = { name: 'Cardio Pupil', duration: 30, type: 'cardio' };
        }
        
        setAssignments(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (atletaId) fetchData();
  }, [atletaId, currentWeekStart]);

  // Transform ISO map to a day name map for the UI ('Lunes', 'Martes', etc.)
  const weekSessions = useMemo(() => {
    const DAYS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const result = {};
    
    DAYS_FULL.forEach((dayName, idx) => {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + idx);
      const iso = formatISO(d);
      
      const assigned = assignments[iso];
      result[dayName] = assigned || null;
    });
    return result;
  }, [assignments, currentWeekStart]);

  // Assign a session using the day name (e.g. "Lunes") within the current week
  const assignSession = async (dayName, sessionData) => {
    const DAYS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const idx = DAYS_FULL.indexOf(dayName);
    if (idx === -1) return;

    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + idx);
    const dateISO = formatISO(d);

    setAssignments(prev => ({ ...prev, [dateISO]: sessionData }));
    
    // Remote
    try {
      await apiAssignSession({ 
        atletaId,
        dateISO,
        sessionId: sessionData.id || sessionData.sessionId || '',
        sessionData 
      });
    } catch (e) {
      console.error(e);
    }
  };

  const removeSession = async (dayName) => {
    const DAYS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const idx = DAYS_FULL.indexOf(dayName);
    if (idx === -1) return;

    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + idx);
    const dateISO = formatISO(d);

    setAssignments(prev => {
      const n = { ...prev };
      delete n[dateISO];
      return n;
    });

    // Remove remote (assigning null/empty)
    try {
      await apiAssignSession({ 
        atletaId, 
        dateISO,
        sessionId: '',
        sessionData: null 
      });
    } catch (e) {
      console.error(e);
    }
  };

  return { 
    currentWeekStart, 
    navigateWeek, 
    assignments: weekSessions, 
    assignSession, 
    removeSession, 
    loading 
  };
}
