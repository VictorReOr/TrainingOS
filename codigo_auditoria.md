# Auditoría de Código - TrainingOS

## Archivo: `src/main.jsx`

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { TimerProvider } from './context/TimerContext'
import { CircuitProvider } from './context/CircuitContext'
import { AthleteProvider } from './context/AthleteContext'
import { PlannerProvider } from './context/PlannerContext'
import { SessionProvider } from './context/SessionContext'
import { PRProvider } from './context/PRContext'
import { CoachProvider } from './context/CoachContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PRProvider>
        <CoachProvider>
          <PlannerProvider>
            <SessionProvider>
              <AthleteProvider>
                <TimerProvider>
                  <CircuitProvider>
                    <App />
                  </CircuitProvider>
                </TimerProvider>
              </AthleteProvider>
            </SessionProvider>
          </PlannerProvider>
        </CoachProvider>
      </PRProvider>
    </BrowserRouter>
  </StrictMode>,
)

```

## Archivo: `src/App.jsx`

```javascript
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAthlete } from './context/AthleteContext';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Plan from './pages/Plan';
import Session from './pages/Session';
import Evolution from './pages/Evolution';
import TimerPage from './pages/TimerPage';
import GlobalRestModal from './components/GlobalRestModal';

// Planner pages
import SeasonList from './pages/planner/SeasonList';
import MesocycleList from './pages/planner/MesocycleList';
import SessionDetailView from './pages/planner/SessionDetailView';
import SessionEditor from './pages/planner/SessionEditor';

// Phase 4
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';

import { useRole } from './hooks/useRole';
import CoachDashboard from './pages/coach/CoachDashboard';
import AthleteDetail from './pages/coach/AthleteDetail';
import ImportSession from './pages/ImportSession';

const CoachRoute = ({ children }) => {
  const { isCoach } = useRole();
  return isCoach ? children : <Navigate to="/" replace />;
};

export default function App() {
  const { athlete } = useAthlete();
  const location = useLocation();

  const showBottomNav = location.pathname !== '/onboarding';

  return (
    <>
      <GlobalRestModal />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 flex flex-col pb-16">
          <Routes>
            {!athlete.onboardingCompleted ? (
              <>
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="*" element={<Navigate to="/onboarding" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Home />} />
                <Route path="/plan" element={<Plan />} />
                <Route path="/plan/seasons" element={<SeasonList />} />
                <Route path="/plan/seasons/:seasonId" element={<MesocycleList />} />
                <Route path="/plan/session-detail" element={<SessionDetailView />} />
                <Route path="/plan/session/new" element={<SessionEditor />} />
                <Route path="/plan/session/:sessionId/edit" element={<SessionEditor />} />
                <Route path="/session" element={<Session />} />
                <Route path="/evolution" element={<Evolution />} />
                <Route path="/timer" element={<TimerPage />} />
                <Route path="/profile" element={<Profile />} />
                
                <Route path="/coach" element={<CoachRoute><CoachDashboard /></CoachRoute>} />
                <Route path="/coach/:id" element={<CoachRoute><AthleteDetail /></CoachRoute>} />
                
                <Route path="/import/:code?" element={<ImportSession />} />
                
                <Route path="/onboarding" element={<Navigate to="/plan" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </main>
        {showBottomNav && athlete.onboardingCompleted && <BottomNav />}
      </div>
    </>
  );
}

```

## Archivo: `src/context/SessionContext.jsx`

```javascript
﻿import React, { createContext, useContext, useState } from 'react';

// ══════════════════════════════════════════════════════
// SessionContext — TrainingOS
// Conecta el Planificador con Session.jsx.
// Arquitectura futura (Prompt 2.4):
//   loadSession() hará fetch a Sheets para hidratar
//   el detalle completo por sessionId antes de ejecutar.
//   Endpoint: Code.gs → /getSession?id={sessionId}
// ══════════════════════════════════════════════════════

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [activeSession, setActiveSession] = useState(null);

  /**
   * Carga una sesión planificada para ejecutarla.
   * sessionData debe tener la misma forma que MOCK_SESSION:
   *   { id, name, dayBadge, blocks: [{ id, name, type, icon, exercises: [...] }] }
   */
  const loadSession = (sessionData) => {
    setActiveSession(sessionData);
  };

  /**
   * Limpia la sesión activa (al terminar o navegar fuera).
   */
  const clearSession = () => {
    setActiveSession(null);
  };

  return (
    <SessionContext.Provider value={{ activeSession, loadSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);

```

## Archivo: `src/context/PRContext.jsx`

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { savePR as _savePR } from '../services/sheets';

// ══════════════════════════════════════════════════════
// PRContext — TrainingOS (Prompt 3.1)
// Sistema de Récords Personales. Persistencia en localStorage + Sheets
// ══════════════════════════════════════════════════════

const LS_KEY = 'trainingos_prs';

// Helper sync (igual que PlannerContext)
const USE_SHEETS = !!import.meta.env.VITE_SHEETS_API_URL && import.meta.env.VITE_USE_MOCK !== 'true';

function _bgSync(fn) {
  if (!USE_SHEETS) return;
  Promise.resolve()
    .then(() => fn())
    .then(res => console.log('[Sheets] savePR → ok', res?.id || ''))
    .catch(err => console.warn('[Sheets] savePR falló:', err.message));
}

const PRContext = createContext();

export function PRProvider({ children }) {
  const [prs, setPrs] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Persistir en local ante cualquier cambio
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(prs));
  }, [prs]);

  /**
   * Devuelve el último récord máximo para un ejercicio
   */
  const getPRForExercise = (exerciseId) => {
    const history = prs.filter(pr => pr.exerciseId === exerciseId);
    if (history.length === 0) return null;
    return history.reduce((best, pr) => pr.valor > best.valor ? pr : best);
  };

  /**
   * Devuelve todo el historial ordenado por fecha ascendente para las gráficas
   */
  const getPRHistory = (exerciseId) => {
    return prs
      .filter(pr => pr.exerciseId === exerciseId)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  };

  /**
   * Guarda un nuevo PR. Si ya existe un valor mayor en el historial,
   * se guarda en el historial igualmente (te permite "trackear" marcas)
   * pero no superará al Record actual en getPRForExercise().
   * El servicio sheets también se notifica.
   */
  const savePRRecord = (prData) => {
    const record = {
      id: prData.id || `pr-${Date.now()}`,
      exerciseId: prData.exerciseId,
      exerciseName: prData.exerciseName,
      atletaId: prData.atletaId || 'v-atleta-1',
      fecha: prData.fecha || new Date().toISOString(),
      valor: prData.valor, // 1RM est
      cargaReal: prData.cargaReal,
      repsReales: prData.repsReales,
      unidad: prData.unidad || 'kg'
    };

    setPrs(prev => [record, ...prev]);

    // Background sync a Google Sheets
    _bgSync(() => _savePR({
      exerciseId: record.exerciseId,
      exerciseName: record.exerciseName,
      atletaId: record.atletaId,
      fecha: record.fecha,
      valor: record.valor,
      unidad: record.unidad
    }));
  };

  return (
    <PRContext.Provider value={{
      prs,
      getPRForExercise,
      getPRHistory,
      savePRRecord
    }}>
      {children}
    </PRContext.Provider>
  );
}

export const usePR = () => useContext(PRContext);

```

## Archivo: `src/context/PlannerContext.jsx`

```javascript
﻿import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  if (!USE_SHEETS) return;
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
      return raw ? JSON.parse(raw) : MOCK_SEASONS;
    } catch {
      return MOCK_SEASONS;
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

  // Week sessions for current week (mock — in future: filtered by date)
  const weekSessions = MOCK_WEEK_SESSIONS;

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

```

## Archivo: `src/context/TimerContext.jsx`

```javascript
﻿import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { playShortBeep, playLongBeep, playWorkBeep, playRestBeep, vibrateShort, vibrateLong } from '../utils/audio';

// Estado global de entrenamiento interactivo
const TimerContext = createContext();

export function TimerProvider({ children }) {
  const [mode, setMode] = useState(null); // 'stopwatch' | 'countdown' | 'hiit' | 'tabata' | 'rest'
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'paused' | 'completed'
  
  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);

  // Tiempo en pantalla
  const [timeMs, setTimeMs] = useState(0); 

  const [intervalConfig, setIntervalConfig] = useState({
    work: 0,
    rest: 0,
    rounds: 0,
    currentPhase: 'setup', 
    currentRound: 0
  });

  const [showRestModal, setShowRestModal] = useState(false);

  // Core Engine mutable para evitar re-renderizados colosales
  const engineRef = useRef({
    targetTime: 0,
    elapsedMs: 0,
    lastTick: 0,
  });

  const rafRef = useRef(null);

  const tick = (now) => {
    if (engineRef.current.lastTick === 0) engineRef.current.lastTick = now;
    const delta = now - engineRef.current.lastTick;
    engineRef.current.lastTick = now;

    if (mode === 'stopwatch') {
      engineRef.current.elapsedMs += delta;
      setTimeMs(engineRef.current.elapsedMs);
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // Modalidades regresivas
    engineRef.current.targetTime -= delta;
    const currentT = engineRef.current.targetTime;
    
    // Sincroniza al UI frame
    setTimeMs(currentT > 0 ? currentT : 0);

    // Eventos (Llegada a 0)
    if (currentT <= 0) {
      if (mode === 'countdown' || mode === 'rest') {
        setStatus('completed');
        playLongBeep();
        vibrateLong();
        
        if (mode === 'rest') {
            setTimeout(() => {
               setShowRestModal(false);
               setMode(null);
            }, 3000);
        }
        return; // Detiene el tick
      }

      if (mode === 'hiit' || mode === 'tabata') {
         setIntervalConfig(cfg => {
            // Si acabamos de terminar el ultimo work de la ultima ronda, fin de sesion.
            if (cfg.currentRound === cfg.rounds && cfg.currentPhase === 'work') {
               setStatus('completed');
               playLongBeep();
               vibrateLong();
               return { ...cfg, currentPhase: 'finished' };
            }

            let nextPhase = cfg.currentPhase === 'work' ? 'rest' : 'work';
            let nextRound = cfg.currentPhase === 'rest' ? cfg.currentRound + 1 : cfg.currentRound;
            
            if (nextPhase === 'work') {
               playWorkBeep(); vibrateShort();
               engineRef.current.targetTime = cfg.work;
            } else {
               playRestBeep(); vibrateShort();
               engineRef.current.targetTime = cfg.rest;
            }
            return { ...cfg, currentPhase: nextPhase, currentRound: nextRound };
         });
         
         // Sigue rotando si no fue 'finished'
         // El setState no detiene este block de JS así que llamamos requestAnimationFrame
      }
    }

    // Repite ciclo
    if (statusRef.current === 'running') {
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  useEffect(() => {
    if (status === 'running') {
      engineRef.current.lastTick = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [status, mode]);

  // --- ACCIONES MAESTRAS ---

  const startStopwatch = () => {
    engineRef.current.elapsedMs = 0;
    setMode('stopwatch'); setTimeMs(0); setStatus('running');
  };

  const startCountdown = (totalMs) => {
    engineRef.current.targetTime = totalMs;
    setMode('countdown'); setTimeMs(totalMs); setStatus('running');
  };

  const startRest = (seconds) => {
    const ms = seconds * 1000;
    engineRef.current.targetTime = ms;
    setMode('rest'); setTimeMs(ms); setStatus('running'); setShowRestModal(true);
  };

  const startHiit = (workS, restS, rounds) => {
    const wMs = workS * 1000;
    engineRef.current.targetTime = wMs;
    setIntervalConfig({ work: wMs, rest: restS * 1000, rounds, currentPhase: 'work', currentRound: 1 });
    setMode('hiit'); setTimeMs(wMs); setStatus('running');
    playWorkBeep(); vibrateShort();
  };

  const startTabata = () => {
    startHiit(20, 10, 8);
    setMode('tabata');
  };

  const pauseTimer = () => setStatus('paused');
  const resumeTimer = () => {
     engineRef.current.lastTick = performance.now();
     setStatus('running');
  };
  const stopTimer = () => {
    setStatus('idle');
    setMode(null);
    setTimeMs(0);
    setShowRestModal(false);
  };

  return (
    <TimerContext.Provider value={{
      mode, status, timeMs, intervalConfig,
      showRestModal, setShowRestModal,
      startStopwatch, startCountdown, startRest, startHiit, startTabata,
      pauseTimer, resumeTimer, stopTimer
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export const useTimer = () => useContext(TimerContext);

```

## Archivo: `src/context/CircuitContext.jsx`

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveTimerTemplate } from '../services/sheets';

const CircuitContext = createContext();

export function CircuitProvider({ children }) {
  const [circuitBlocks, setCircuitBlocks] = useState([]);
  const [circuitName, setCircuitName] = useState('Nuevo Circuito');
  
  const [executionStatus, setExecutionStatus] = useState('idle'); // 'idle' | 'running' | 'paused' | 'finished'
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);

  const [savedTemplates, setSavedTemplates] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem('trainingos_timer_templates');
    if (raw) {
      try {
        setSavedTemplates(JSON.parse(raw));
      } catch (e) {
        console.error("Error parsing templates", e);
      }
    }
  }, []);

  const saveTemplate = (name) => {
    const newTemplate = {
      id: 'tpl_' + Date.now(),
      name: name || circuitName,
      blocks: [...circuitBlocks],
      createdAt: new Date().toISOString()
    };
    
    const updated = [newTemplate, ...savedTemplates].slice(0, 20); // max 20
    setSavedTemplates(updated);
    localStorage.setItem('trainingos_timer_templates', JSON.stringify(updated));

    // Opcional Sync
    Promise.resolve()
      .then(() => saveTimerTemplate(newTemplate))
      .then(() => console.log('[Sheets] saveTimerTemplate → ok'))
      .catch(err => console.warn('[Sheets] saveTimerTemplate falló:', err.message));
  };

  const loadTemplate = (template) => {
    setCircuitName(template.name);
    setCircuitBlocks(template.blocks);
    setExecutionStatus('idle');
  };

  const deleteTemplate = (id) => {
    const updated = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updated);
    localStorage.setItem('trainingos_timer_templates', JSON.stringify(updated));
  };

  const initCircuit = (blocks, name = 'Circuito Custom') => {
    setCircuitBlocks(blocks);
    setCircuitName(name);
    setCurrentBlockIndex(0);
    setCurrentSet(1);
    setExecutionStatus('idle');
  };

  return (
    <CircuitContext.Provider value={{
      circuitBlocks, setCircuitBlocks,
      circuitName, setCircuitName,
      executionStatus, setExecutionStatus,
      currentBlockIndex, setCurrentBlockIndex,
      currentSet, setCurrentSet,
      savedTemplates,
      saveTemplate, loadTemplate, deleteTemplate,
      initCircuit
    }}>
      {children}
    </CircuitContext.Provider>
  );
}

export const useCircuit = () => useContext(CircuitContext);

```

## Archivo: `src/context/AthleteContext.jsx`

```javascript
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const LS_KEY = 'trainingos_athlete_profile';

const DEFAULT_ATHLETE = {
  id: 'atleta-' + Date.now(),
  name: '',
  role: 'both', // 'athlete' | 'coach' | 'both'
  sports: [
    { id: 'gym',    label: 'Gimnasio',   icon: '🏋️', active: true  },
    { id: 'tkd',    label: 'Taekwondo',  icon: '🥋', active: true  },
    { id: 'cardio', label: 'Cardio',     icon: '🚴', active: false },
  ],
  activeSport: 'all', // 'all' | 'gym' | 'tkd' | 'cardio'
  primarySport: 'gym',
  onboardingCompleted: false
};

const AthleteContext = createContext();

export function AthleteProvider({ children }) {
  const [athlete, setAthlete] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return DEFAULT_ATHLETE;
      const parsed = JSON.parse(raw);
      // Fallback estricto para forzar onboarding a usuarios legacy
      if (parsed.onboardingCompleted !== true) {
        return { ...parsed, onboardingCompleted: false };
      }
      return parsed;
    } catch {
      return DEFAULT_ATHLETE;
    }
  });

  // Persist on change
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(athlete));
  }, [athlete]);

  const setActiveSport = (id) => {
    setAthlete(prev => {
      const updated = { ...prev, activeSport: id };
      localStorage.setItem(LS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const updateProfile = (data) => {
    setAthlete(prev => ({
      ...prev,
      ...data,
      onboardingCompleted: true
    }));
  };

  const addSport = (sport) => {
    setAthlete(prev => ({
      ...prev,
      sports: [...prev.sports, sport]
    }));
  };

  const toggleSport = (sportId) => {
    setAthlete(prev => ({
      ...prev,
      sports: prev.sports.map(s => s.id === sportId ? { ...s, active: !s.active } : s)
    }));
  };

  const setPrimarySport = (sportId) => {
    setAthlete(prev => ({ ...prev, primarySport: sportId }));
  };

  // Computed label for the pill button
  const activeLabel = useMemo(() => {
    if (athlete.activeSport === 'all') {
      const activeSports = athlete.sports.filter(s => s.active);
      return activeSports.map(s => s.icon).join(' ') + ' Todos';
    }
    const sport = athlete.sports.find(s => s.id === athlete.activeSport);
    return sport ? `${sport.icon} ${sport.label}` : 'Todos';
  }, [athlete]);

  // Sports available (active ones + 'all' option)
  const availableSports = useMemo(() => {
    return athlete.sports.filter(s => s.active);
  }, [athlete.sports]);

  return (
    <AthleteContext.Provider value={{
      athlete,
      setActiveSport,
      activeLabel,
      availableSports,
      activeSport: athlete.activeSport,
      updateProfile,
      addSport,
      toggleSport,
      setPrimarySport
    }}>
      {children}
    </AthleteContext.Provider>
  );
}

export const useAthlete = () => useContext(AthleteContext);

```

## Archivo: `src/context/CoachContext.jsx`

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_ATHLETES } from '../data/mockAthletes';

const CoachContext = createContext();
const LS_KEY = 'trainingos_athletes';

export function CoachProvider({ children }) {
  const [athletes, setAthletes] = useState(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      return stored ? JSON.parse(stored) : MOCK_ATHLETES;
    } catch {
      return MOCK_ATHLETES;
    }
  });
  const [selectedAthleteId, setSelectedAthleteId] = useState(null);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(athletes));
  }, [athletes]);

  const addAthlete = (data) => {
    setAthletes(prev => [...prev, data]);
  };

  const removeAthlete = (id) => {
    setAthletes(prev => prev.filter(a => a.id !== id));
  };

  const selectAthlete = (id) => {
    setSelectedAthleteId(id);
  };

  const getAthleteById = (id) => {
    return athletes.find(a => a.id === id) || null;
  };

  const selectedAthlete = getAthleteById(selectedAthleteId);

  return (
    <CoachContext.Provider value={{
      athletes,
      selectedAthlete,
      selectedAthleteId,
      addAthlete,
      removeAthlete,
      selectAthlete,
      getAthleteById
    }}>
      {children}
    </CoachContext.Provider>
  );
}

export const useCoach = () => useContext(CoachContext);

```

## Archivo: `src/hooks/useRole.js`

```javascript
import { useAthlete } from '../context/AthleteContext';

export function useRole() {
  const { athlete } = useAthlete();
  return {
    isCoach: athlete.role === 'coach' || athlete.role === 'both',
    isAthlete: athlete.role === 'athlete' || athlete.role === 'both',
    isBoth: athlete.role === 'both',
    role: athlete.role
  };
}

```

## Archivo: `src/hooks/useEvolutionData.js`

```javascript
import { useMemo, useState, useEffect } from 'react';
import { usePR } from '../context/PRContext';
import { usePlanner } from '../context/PlannerContext';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const LS_SESSION_LOGS = 'trainingos_session_logs';

function generateMockSessionLogs() {
  const logs = [];
  const start = new Date();
  start.setDate(start.getDate() - 21); // 3 weeks ago
  
  const EXAMPLES = [
    { type: 'gym_fuerza', name: 'Pierna Pesada' },
    { type: 'gym_hipertrofia', name: 'Torso Volumen' },
    { type: 'tkd', name: 'Técnico Táctico' },
    { type: 'cardio', name: 'Circuito Metabólico' }
  ];

  for (let i = 0; i < 8; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i * 2 + Math.floor(Math.random() * 2));
    const dateStr = d.toISOString();
    
    // Volumen aleatorio entre 3000 y 8000
    const vol = Math.floor(Math.random() * 5000 + 3000);
    // RPE aleatorio entre 6.5 y 9.0
    const rpe = (Math.random() * 2.5 + 6.5).toFixed(1);
    const time = Math.floor(Math.random() * 2000 + 2000); // 30-60 min
    const exCount = Math.floor(Math.random() * 3 + 4);

    const ej = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];

    logs.push({
      id: `mock-log-${i}`,
      sessionId: `mock-session-${i}`,
      sessionName: ej.name,
      sessionType: ej.type,
      atletaId: 'v-atleta-1',
      fecha: dateStr,
      duracion: time,
      volumenTotal: vol,
      rpeMedio: parseFloat(rpe),
      ejerciciosCompletados: exCount,
      ejerciciosTotal: exCount,
      ejercicios: Array.from({length: exCount}, (_, exIdx) => ({
        id: `mock-ex-${exIdx}`,
        nombre: `Ejercicio Demo ${exIdx + 1}`,
        seriesLog: [
          { carga: 80, reps: 10, rpe: 8, done: true },
          { carga: 85, reps: 8, rpe: 8.5, done: true },
        ]
      }))
    });
  }
  return logs.reverse(); // Descending order (newest first)
}

function generateMockPRHistory(exerciseId, count) {
  const history = [];
  const start = new Date();
  start.setDate(start.getDate() - count * 7); // A record every week
  
  let current1RM = 70 + Math.random() * 20; // 70-90 kg start
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i * 7);
    
    // 60% chance to improve, otherwise stagnate or slight drop
    if (Math.random() > 0.4) {
      current1RM += Math.random() * 5;
    } else {
      current1RM -= Math.random() * 2;
    }
    
    history.push({
      id: `mock-pr-${exerciseId}-${i}`,
      exerciseId,
      fecha: d.toISOString(),
      valor: current1RM,
      cargaReal: current1RM * 0.85,
      repsReales: Math.floor(Math.random() * 3) + 3 // 3-5 reps
    });
  }
  // history is ordered old to new here
  // getPRHistory in PRContext returns new to old (descending)
  return history.reverse(); 
}

export function useEvolutionData() {
  const { prs, getPRHistory } = usePR();
  const { seasons } = usePlanner();

  const [sessionLogs, setSessionLogs] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    let raw = [];
    try {
      const stored = localStorage.getItem(LS_SESSION_LOGS);
      if (stored) {
        raw = JSON.parse(stored);
      }
    } catch {}

    const hasNoLogs = raw.length === 0;
    const hasNoPRs = prs.length === 0;

    // Entramos en Demo Mode solo si no hay data real y MOCK está activo
    const isMock = localStorage.getItem('trainingos_demo_mode') !== null 
      ? localStorage.getItem('trainingos_demo_mode') === 'true' 
      : USE_MOCK;

    if (isMock && hasNoLogs && hasNoPRs) {
      setIsDemoMode(true);
      setSessionLogs(generateMockSessionLogs());
    } else {
      setIsDemoMode(false);
      setSessionLogs(raw);
    }
  }, [prs.length, sessionLogs.length]);

  // Ejercicios con PRs registrados
  const exercisesWithPRs = useMemo(() => {
    if (isDemoMode && prs.length === 0) {
      return [
        { exerciseId: 'ex-sq', exerciseName: 'Sentadilla Trasera', latestPR: 125, count: 5 },
        { exerciseId: 'ex-dl', exerciseName: 'Peso Muerto', latestPR: 160, count: 4 },
        { exerciseId: 'ex-bp', exerciseName: 'Press Banca', latestPR: 95, count: 6 },
      ];
    }

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
    if (isDemoMode && prs.length === 0) {
      const match = exercisesWithPRs.find(e => e.exerciseId === exerciseId);
      if (!match) return [];
      const history = generateMockPRHistory(match.exerciseId, match.count);
      return history.map(h => ({
        fecha: h.fecha,
        valor: Math.round(h.valor),
        cargaReal: Math.round(h.cargaReal),
        repsReales: h.repsReales
      })).reverse(); // Recharts necesita chronological temporal (izq a derecha)
    }

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
    // Si estamos en demo pura, escupir algo falso
    if (isDemoMode && prs.length === 0) {
      return [
        { mesoName: 'Hipertrofia I', mesoColor: '#3b82f6', maxPR: 110 },
        { mesoName: 'Fuerza Base', mesoColor: '#8b5cf6', maxPR: 120 },
        { mesoName: 'Peaking', mesoColor: '#ef4444', maxPR: 125 }
      ];
    }

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

```

## Archivo: `src/services/sheets.js`

```javascript
/**
 * TrainingOS — Capa de red Google Sheets
 * Configura VITE_SHEETS_API_URL en .env.local para activar el backend real.
 * Con VITE_USE_MOCK=true todos los métodos devuelven datos simulados con
 * latencia artificial de 300 ms, sin tocar la red.
 */

const API_URL   = import.meta.env.VITE_SHEETS_API_URL;
const ATLETA_ID = import.meta.env.VITE_ATLETA_ID || 'v-atleta-1';

// ─── Base request ─────────────────────────────────────────────────────────────
async function _delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Función base de red.
 * @param {'GET'|'POST'} method
 * @param {string} action  — nombre de la acción del enrutador backend
 * @param {object} [data]  — payload para POST o params adicionales para GET
 * @param {object} [mockFn] — función que devuelve datos mock (sólo se llama si USE_MOCK)
 */
async function _request(method, action, data = {}, mockFn = null) {
  const isDemo = localStorage.getItem('trainingos_demo_mode') !== null 
    ? localStorage.getItem('trainingos_demo_mode') === 'true' 
    : import.meta.env.VITE_USE_MOCK === 'true';

  if (isDemo) {
    await _delay(300);
    const result = mockFn ? await mockFn() : { rows: [] };
    console.log(`[Sheets MOCK] ${method} ${action}`, result);
    return result;
  }

  if (!API_URL) {
    console.warn('[Sheets] VITE_SHEETS_API_URL no configurada. Usando modo offline.');
    return mockFn ? await mockFn() : { rows: [] };
  }

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 8000);

  try {
    let res;
    if (method === 'GET') {
      const params = new URLSearchParams({ action, atleta_id: ATLETA_ID, ...data });
      res = await fetch(`${API_URL}?${params.toString()}`, { signal: controller.signal });
    } else {
      res = await fetch(API_URL, {
        method:  'POST',
        body:    JSON.stringify({ action, atletaId: ATLETA_ID, ...data }),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        signal:  controller.signal,
      });
    }

    const json = await res.json();
    if (json.status === 'error') throw new Error(json.message || 'Error del servidor');
    console.log(`[Sheets] ${method} ${action} → ok`, json);
    return json;

  } catch (err) {
    if (err.name === 'AbortError') throw new Error(`[Sheets] Timeout en ${action} (8s)`);
    throw new Error(`[Sheets] ${action}: ${err.message}`);
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Mock data helpers ────────────────────────────────────────────────────────
function _mockFromLocalStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

// ─── Escritura (POST) ─────────────────────────────────────────────────────────

/**
 * Guarda el log de una sesión completa (series por ejercicio).
 * @param {{ atletaId, fecha, ejercicios: [{id, seriesLog}] }} payload
 */
export async function saveLog(payload) {
  return _request('POST', 'savelog', payload, async () => ({
    status: 'success',
    saved:  (payload.ejercicios || []).reduce((acc, ex) => acc + (ex.seriesLog || []).length, 0),
  }));
}

/**
 * Guarda una temporada nueva.
 */
export async function saveSeason(seasonData) {
  return _request('POST', 'saveSeason', seasonData, async () => ({
    status: 'success', id: seasonData.id || `mock-${Date.now()}`,
  }));
}

/**
 * Guarda un mesociclo dentro de una temporada.
 */
export async function saveMesocycle(mesoData) {
  return _request('POST', 'saveMesocycle', mesoData, async () => ({
    status: 'success', id: mesoData.id || `mock-${Date.now()}`,
  }));
}

/**
 * Guarda o actualiza una plantilla de sesión.
 */
export async function saveSession(sessionData) {
  return _request('POST', 'saveSession', sessionData, async () => ({
    status: 'success', id: sessionData.id || `mock-${Date.now()}`,
  }));
}

/**
 * Asigna una sesión a una fecha específica del calendario.
 */
export async function assignSessionToDay(assignData) {
  return _request('POST', 'assignSession', assignData, async () => ({
    status: 'success', id: `mock-${Date.now()}`,
  }));
}

/**
 * Guarda un récord personal.
 */
export async function savePR(prData) {
  return _request('POST', 'savePR', prData, async () => ({
    status: 'success', id: `mock-${Date.now()}`,
  }));
}

/**
 * Guarda una plantilla del timer/circuito.
 */
export async function saveTimerTemplate(template) {
  return _request('POST', 'saveTimerTemplate', template, async () => ({
    status: 'success', id: template.id || `mock-${Date.now()}`,
  }));
}

/**
 * Exporta y comparte una sesión.
 */
export async function shareSession(payload) {
  return _request('POST', 'shareSession', payload, async () => {
    try {
      const local = JSON.parse(localStorage.getItem('trainingos_shared_sessions') || '{}');
      local[payload.code] = payload.sessionData;
      localStorage.setItem('trainingos_shared_sessions', JSON.stringify(local));
    } catch (e) {}
    return { status: 'success', code: payload.code };
  });
}

// ─── Lectura (GET) ────────────────────────────────────────────────────────────

/**
 * Recupera los logs de entrenamiento.
 * @param {string} [atletaId]
 * @param {{ fechaDesde: string, fechaHasta: string }} [dateRange]
 */
export async function getLogs(atletaId = ATLETA_ID, dateRange = {}) {
  return _request('GET', 'getLogs', { atleta_id: atletaId, ...dateRange }, async () => ({
    status: 'success', rows: [],
  }));
}

/**
 * Recupera temporadas con mesociclos anidados.
 */
export async function getSeasons(atletaId = ATLETA_ID) {
  return _request('GET', 'getSeasons', { atleta_id: atletaId }, async () => {
    const { MOCK_SEASONS } = await import('../data/mockPlanner.js');
    return { status: 'success', rows: MOCK_SEASONS };
  });
}

/**
 * Recupera todas las plantillas de sesión del atleta.
 */
export async function getSessions(atletaId = ATLETA_ID) {
  return _request('GET', 'getSessions', { atleta_id: atletaId }, async () => ({
    status: 'success',
    rows: _mockFromLocalStorage('trainingos_session_templates'),
  }));
}

/**
 * Recupera las sesiones asignadas a la semana indicada.
 * @param {string} weekStart — fecha ISO del lunes (YYYY-MM-DD)
 * @param {string} weekEnd   — fecha ISO del domingo (YYYY-MM-DD)
 */
export async function getWeekAssignments(atletaId = ATLETA_ID, weekStart = '', weekEnd = '') {
  return _request('GET', 'getWeekAssignments', { atleta_id: atletaId, weekStart, weekEnd }, async () => {
    const raw = _mockFromLocalStorage('trainingos_week_assignments');
    // raw es { [dateISO]: sessionData } — lo convierte a array de rows
    const rows = Object.entries(raw)
      .filter(([iso]) => (!weekStart || iso >= weekStart) && (!weekEnd || iso <= weekEnd))
      .map(([iso, sessionData]) => ({ fecha_iso: iso, sessionData }));
    return { status: 'success', rows };
  });
}

/**
 * Recupera récords personales, con filtro opcional por ejercicio.
 */
export async function getPRs(atletaId = ATLETA_ID, exerciseId = '') {
  return _request('GET', 'getPRs', { atleta_id: atletaId, exercise_id: exerciseId }, async () => ({
    status: 'success', rows: [],
  }));
}

/**
 * Importa una sesión remota o cruzada compartida
 */
export async function getSharedSession(code) {
  return _request('GET', 'getSharedSession', { code }, async () => {
    const local = JSON.parse(localStorage.getItem('trainingos_shared_sessions') || '{}');
    if (local[code]) {
      return { status: 'success', data: local[code] };
    }
    throw new Error('Código no encontrado en el servidor (Mock Mode). Asegúrate de escribirlo tal cual.');
  });
}

```

## Archivo: `package.json`

```json
{
  "name": "training-os",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@capacitor/android": "^7.0.1",
    "@capacitor/core": "^7.0.1",
    "lucide-react": "^0.474.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.1.5",
    "recharts": "^3.8.1"
  },
  "devDependencies": {
    "@capacitor/cli": "^7.0.1",
    "@eslint/js": "^9.19.0",
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.19.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.18",
    "globals": "^15.14.0",
    "postcss": "^8.5.1",
    "tailwindcss": "^4.0.0",
    "vite": "^6.0.1"
  }
}

```

