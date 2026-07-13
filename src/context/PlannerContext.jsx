import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { MOCK_SEASONS, MOCK_WEEK_SESSIONS } from '../data/mockPlanner';
import {
  saveSeason   as _saveSeason,
  saveMesocycle as _saveMesocycle,
  saveSession  as _saveSession,
  assignSessionToDay as _assignSessionToDay,
} from '../services/sheets';

// ══════════════════════════════════════════════════════
// PlannerContext — TrainingOS  (Prompt 2.4)
// USE_SHEETS=true → fire-and-forget sync con Sheets
// USE_SHEETS=false → solo localStorage (modo offline/mock)
// ══════════════════════════════════════════════════════

const LS_KEY = 'trainingos_planner_data';
const LS_TEMPLATES_KEY = 'trainingos_session_templates';
const LS_ASSIGNMENTS_KEY = 'trainingos_week_assignments';

// Activa sync real cuando la URL esté configurada Y mock esté desactivado
const USE_SHEETS = !!import.meta.env.VITE_SHEETS_API_URL
  && import.meta.env.VITE_USE_MOCK !== 'true';

/** Lanza sync en background sin bloquear la UI */
function _bgSync(label, fn) {
  const demoMode = localStorage.getItem('trainingos_demo_mode') === 'true';
  if (!USE_SHEETS || demoMode) return;
  Promise.resolve()
    .then(() => fn())
    .then(res => console.log(`[Sheets] ${label} → ok`, res?.id || ''))
    .catch(err => console.warn(`[Sheets] ${label} falló (sin bloquear UI):`, err.message));
}

const PlannerContext = createContext();

// Helpers de fecha
const getMondayOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay(); // 0=dom, 1=lun ...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const parseDate = (str) => {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const isDateInMesocycle = (date, meso) => {
  const start = parseDate(meso.startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + meso.weeks * 7);
  return date >= start && date <= end;
};

export function PlannerProvider({ children }) {
  const [seasons, setSeasons] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMondayOfWeek());

  // Persist on change
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(seasons));
  }, [seasons]);

  // Computed: active season
  const activeSeason = useMemo(() => {
    return seasons.find(s => s.status === 'active') || seasons[0] || null;
  }, [seasons]);

  // Computed: active mesocycle based on today's date
  const activeMesocycle = useMemo(() => {
    if (!activeSeason) return null;
    const today = new Date();
    return activeSeason.mesocycles.find(m => isDateInMesocycle(today, m)) || null;
  }, [activeSeason]);

  // Session Templates
  const [sessionTemplates, setSessionTemplates] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_TEMPLATES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(LS_TEMPLATES_KEY, JSON.stringify(sessionTemplates));
  }, [sessionTemplates]);

  const saveSessionTemplate = (template) => {
    setSessionTemplates(prev => {
      const idx = prev.findIndex(t => t.id === template.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = template;
        return next;
      }
      return [...prev, template];
    });
    // Prompt 2.4: sync a Sheets en background
    _bgSync('saveSession', () => _saveSession({
      id: template.id,
      nombre: template.name,
      tipo: template.type,
      duration: template.duration,
      exercises: template.exercises,
      blocks: template.blocks,
      updatedAt: template.updatedAt,
    }));
  };

  const deleteSessionTemplate = (id) => {
    setSessionTemplates(prev => prev.filter(t => t.id !== id));
  };

  // Week Assignments — { [dateISO: string]: sessionData }
  const [weekAssignments, setWeekAssignments] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_ASSIGNMENTS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem(LS_ASSIGNMENTS_KEY, JSON.stringify(weekAssignments));
  }, [weekAssignments]);

  const assignSessionToDay = (dateISO, sessionData) => {
    setWeekAssignments(prev => ({ ...prev, [dateISO]: sessionData }));
    // Prompt 2.4: sync a Sheets en background
    _bgSync('assignSession', () => _assignSessionToDay({
      dateISO,
      sessionId: sessionData.id || sessionData.sessionId || '',
      sessionData,
    }));
  };

  const removeSessionFromDay = (dateISO) => {
    setWeekAssignments(prev => {
      const next = { ...prev };
      delete next[dateISO];
      return next;
    });
  };

  // Week sessions for current week (dinámico basado en dateISO)
  const weekSessions = useMemo(() => {
    const formatISO = (d) => {
      const pad = n => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const result = {};

    days.forEach((dayName, idx) => {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + idx);
      const iso = formatISO(d);
      
      const assigned = weekAssignments[iso];
      if (assigned) {
        result[dayName] = {
          sessionId: assigned.id || assigned.sessionId,
          type: assigned.type || 'libre',
          sport: assigned.sport || assigned.deporte || 'gym',
          name: assigned.name || assigned.nombre || 'Sesión Programada',
          icon: assigned.icon || '🎯', 
          duration: assigned.duration || assigned.duracion || 60,
          exercises: assigned.exercises || assigned.ejercicios_count || (assigned.blocks ? assigned.blocks.reduce((acc, b) => acc + (b.exercises ? b.exercises.length : 0), 0) : 0),
          intensity: assigned.intensity || 'Media',
          intensityLevel: assigned.intensityLevel || 3,
          blocks: assigned.blocks || [],
        };
      } else {
        result[dayName] = null;
      }
    });

    return result;
  }, [weekAssignments, currentWeekStart]);

  const addSeason = (data) => {
    const newSeason = {
      id: 'season-' + Date.now(),
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      sport: data.sport,
      status: 'upcoming',
      mesocycles: [],
    };
    setSeasons(prev => [newSeason, ...prev]);
    // Prompt 2.4: sync a Sheets en background
    _bgSync('saveSeason', () => _saveSeason({
      id: newSeason.id,
      nombre: newSeason.name,
      deporte: newSeason.sport,
      fechaInicio: newSeason.startDate,
      fechaFin: newSeason.endDate,
      status: newSeason.status,
    }));
  };

  const addMesocycle = (seasonId, data) => {
    const newMeso = {
      id: 'meso-' + Date.now(),
      name: data.name,
      type: data.type,
      startDate: data.startDate,
      weeks: data.weeks,
      objective: data.objective || '',
      color: data.color,
    };
    setSeasons(prev => prev.map(season => {
      if (season.id !== seasonId) return season;
      return { ...season, mesocycles: [...season.mesocycles, newMeso] };
    }));
    // Prompt 2.4: sync a Sheets en background
    _bgSync('saveMesocycle', () => _saveMesocycle({
      id: newMeso.id,
      seasonId,
      nombre: newMeso.name,
      tipo: newMeso.type,
      fechaInicio: newMeso.startDate,
      semanas: newMeso.weeks,
      objetivo: newMeso.objective,
      color: newMeso.color,
    }));
  };

  const navigateWeek = (direction) => {
    setCurrentWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + direction * 7);
      return d;
    });
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getMondayOfWeek());
  };

  return (
    <PlannerContext.Provider value={{
      seasons,
      activeSeason,
      activeMesocycle,
      currentWeekStart,
      weekSessions,
      addSeason,
      addMesocycle,
      navigateWeek,
      goToCurrentWeek,
      sessionTemplates,
      saveSessionTemplate,
      deleteSessionTemplate,
      weekAssignments,
      assignSessionToDay,
      removeSessionFromDay,
    }}>
      {children}
    </PlannerContext.Provider>
  );
}

export const usePlanner = () => useContext(PlannerContext);
