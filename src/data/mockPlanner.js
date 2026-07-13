// ══════════════════════════════════════════════════════
// MOCK PLANNER DATA — TrainingOS
// Arquitectura futura: estos datos se cargarán desde
// Google Sheets via Code.gs en el Prompt 2.4.
// Sheets target: 'Seasons', 'Mesocycles', 'WeekSessions'
// ══════════════════════════════════════════════════════

export const MOCK_SEASONS = [
  {
    id: 'season-1',
    name: 'Temporada 2025-26',
    startDate: '2025-09-01',
    endDate: '2026-06-30',
    status: 'active', // 'active' | 'finished' | 'upcoming'
    sport: 'Taekwondo + Gym',
    mesocycles: [
      {
        id: 'meso-1',
        name: 'Bloque Base',
        type: 'fuerza',
        startDate: '2025-09-01',
        weeks: 4,
        objective: 'Construir base de fuerza general',
        color: '#3d7dd4',
      },
      {
        id: 'meso-2',
        name: 'Bloque Potencia',
        type: 'potencia',
        startDate: '2025-10-01',
        weeks: 3,
        objective: 'Transferencia a gestos específicos TKD',
        color: '#e8412a',
      },
      {
        id: 'meso-3',
        name: 'Peaking Competición',
        type: 'peaking',
        startDate: '2025-10-22',
        weeks: 2,
        objective: 'Puesta a punto para examen 1er Dan',
        color: '#f5a623',
      },
      {
        id: 'meso-4',
        name: 'Bloque Hipertrofia',
        type: 'hipertrofia',
        startDate: '2025-11-05',
        weeks: 6,
        objective: 'Ganancia muscular en tren superior',
        color: '#8e44ad',
      },
      {
        id: 'meso-5',
        name: 'Recuperación Activa',
        type: 'recuperacion',
        startDate: '2025-12-17',
        weeks: 2,
        objective: 'Descanso activo y movilidad navideña',
        color: '#16a085',
      },
      {
        id: 'meso-6',
        name: 'Prep Competición',
        type: 'competicion',
        startDate: '2026-01-01',
        weeks: 8,
        objective: 'Preparación para competición regional marzo 2026',
        color: '#e67e22',
      },
    ],
  },
];

// Color map por tipo de mesociclo
export const MESO_COLORS = {
  fuerza:       '#3d7dd4',
  hipertrofia:  '#8e44ad',
  potencia:     '#e8412a',
  peaking:      '#f5a623',
  competicion:  '#e67e22',
  recuperacion: '#16a085',
};

export const MESO_LABELS = {
  fuerza:       'Fuerza',
  hipertrofia:  'Hipertrofia',
  potencia:     'Potencia',
  peaking:      'Peaking',
  competicion:  'Competición',
  recuperacion: 'Recuperación',
};

// Mock de sesiones de la semana actual
// En el backend: query sobre la hoja 'WeekSessions' filtrado por weekStart
export const MOCK_WEEK_SESSIONS = {
  lunes: {
    sessionId: 'session-gym-1',
    type: 'gym_potencia',
    sport: 'gym',
    name: 'Potencia - Tren Superior',
    icon: '🏋️',
    duration: 75, // minutos
    exercises: 6,
    intensity: 'Alta',    // 'Baja' | 'Media' | 'Alta' | 'Máxima'
    intensityLevel: 4,    // 1-5 para el badge de color
  },
  martes: {
    sessionId: 'session-tkd-1',
    type: 'tkd',
    sport: 'tkd',
    name: 'Técnica + Poomsae',
    icon: '🥋',
    duration: 90,
    exercises: 5,
    intensity: 'Media',
    intensityLevel: 3,
  },
  miercoles: {
    sessionId: 'session-gym-2',
    type: 'gym_fuerza',
    sport: 'gym',
    name: 'Fuerza - Tren Inferior',
    icon: '🏋️',
    duration: 60,
    exercises: 5,
    intensity: 'Alta',
    intensityLevel: 4,
  },
  jueves: {
    sessionId: 'session-tkd-2',
    type: 'tkd_sparring',
    sport: 'tkd',
    name: 'Sparring + Competición',
    icon: '🥋',
    duration: 90,
    exercises: 4,
    intensity: 'Máxima',
    intensityLevel: 5,
  },
  viernes: {
    sessionId: 'session-gym-3',
    type: 'gym_hipertrofia',
    sport: 'gym',
    name: 'Hipertrofia - Full Body',
    icon: '🏋️',
    duration: 70,
    exercises: 8,
    intensity: 'Media',
    intensityLevel: 3,
  },
  sabado: null,
  domingo: null,
};

// Mock para vista de detalle de sesión (read-only desde Planificador)
// Arquitectura futura: fetch a Sheets por sessionId
export const MOCK_SESSION_DETAILS = {
  'session-gym-1': {
    name: 'Potencia - Tren Superior',
    blocks: [
      {
        name: 'Press Banca',
        sets: 4, reps: '6', rest: 120,
        notes: 'Foco en velocidad concéntrica',
      },
      {
        name: 'Press Militar',
        sets: 4, reps: '6', rest: 120,
        notes: null,
      },
      {
        name: 'Remo con Barra',
        sets: 3, reps: '8', rest: 90,
        notes: 'Agarre prono',
      },
      {
        name: 'Dominadas',
        sets: 3, reps: 'Max', rest: 90,
        notes: null,
      },
      {
        name: 'Push Press',
        sets: 3, reps: '5', rest: 120,
        notes: '85% RM',
      },
      {
        name: 'Face Pull',
        sets: 3, reps: '15', rest: 60,
        notes: 'Calentamiento manguito',
      },
    ],
  },
  'session-tkd-1': {
    name: 'Técnica + Poomsae',
    blocks: [
      { name: 'Calentamiento dinámico', sets: 1, reps: '10 min', rest: 0, notes: null },
      { name: 'Patadas básicas en saco', sets: 3, reps: '2 min', rest: 60, notes: 'Dollyo, Yop, Naerio' },
      { name: 'Combinaciones', sets: 4, reps: '90s', rest: 60, notes: null },
      { name: 'Poomsae Taegeuk 6', sets: 5, reps: '1', rest: 30, notes: 'Corrección de detalles' },
      { name: 'Vuelta calma + estiramientos', sets: 1, reps: '10 min', rest: 0, notes: null },
    ],
  },
  'session-gym-2': {
    name: 'Fuerza - Tren Inferior',
    blocks: [
      { name: 'Sentadilla Trasera',  sets: 4, reps: '5',   rest: 150, notes: 'RIR 2 · 85% RM' },
      { name: 'Peso Muerto Rumano',  sets: 3, reps: '8',   rest: 120, notes: 'Control excéntrico' },
      { name: 'Prensa de Piernas',   sets: 3, reps: '10',  rest: 90,  notes: null },
      { name: 'Curl Femoral',        sets: 3, reps: '12',  rest: 60,  notes: null },
      { name: 'Elevaciones de Talón',sets: 4, reps: '15',  rest: 60,  notes: 'Unilateral' },
    ],
  },
  'session-gym-3': {
    name: 'Hipertrofia - Full Body',
    blocks: [
      { name: 'Sentadilla Frontal',  sets: 3, reps: '8',  rest: 90, notes: 'Técnica limpia' },
      { name: 'Press Inclinado',     sets: 3, reps: '10', rest: 90, notes: null },
      { name: 'Jalón al Pecho',      sets: 3, reps: '10', rest: 75, notes: 'Agarre neutro' },
      { name: 'Hip Thrust',          sets: 3, reps: '12', rest: 75, notes: 'Pausa arriba 2s' },
      { name: 'Press Arnold',        sets: 3, reps: '12', rest: 60, notes: null },
      { name: 'Curl Alterno',        sets: 2, reps: '12', rest: 60, notes: null },
      { name: 'Tríceps en Polea',    sets: 2, reps: '15', rest: 45, notes: null },
      { name: 'Core — Plancha',      sets: 3, reps: '45s', rest: 30, notes: null },
    ],
  },
};

// Tipos de sesión con colores, iconos y deporte asociado
export const SESSION_TYPES = {
  gym_potencia:    { color: '#e8412a', icon: '⚡',  label: 'Potencia',    sport: 'gym'    },
  gym_fuerza:      { color: '#3d7dd4', icon: '🏋️', label: 'Fuerza',      sport: 'gym'    },
  gym_hipertrofia: { color: '#8e44ad', icon: '💪',  label: 'Hipertrofia', sport: 'gym'    },
  tkd:             { color: '#f5a623', icon: '🥋',  label: 'TKD',         sport: 'tkd'    },
  tkd_sparring:    { color: '#e8412a', icon: '🥊',  label: 'Sparring',    sport: 'tkd'    },
  cardio:          { color: '#16a085', icon: '🚴',  label: 'Cardio',      sport: 'cardio' },
  descanso:        { color: '#2a3050', icon: '😴',  label: 'Descanso',    sport: 'all'    },
  libre:           { color: '#7a8099', icon: '🎯',  label: 'Libre',       sport: 'all'    },
};
