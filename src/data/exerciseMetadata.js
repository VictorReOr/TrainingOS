export const VALID_PATTERNS = [
  'push_horizontal',
  'push_vertical', 
  'pull_horizontal',
  'pull_vertical',
  'knee_dominant',
  'hip_dominant',
  'rotation',
  'anti_rotation',
  'unilateral',
  'core',
  'cardio',
  'unspecified'
];

export const VALID_PRIORITIES = [
  'main', 'accessory', 'core', 'mobility'
];

export const CATEGORY_DEFAULTS = {
  Movilidad: {
    pattern: 'hip_dominant',
    systemicCost: 1,
    sportTransfer: 5,
    priority: 'mobility',
    exerciseType: 'MOBILITY',
    progressionModel: 'NONE',
  },
  Fuerza: {
    pattern: 'knee_dominant',
    systemicCost: 7,
    sportTransfer: 5,
    priority: 'main',
    exerciseType: 'STRENGTH',
    progressionModel: 'LOAD',
  },
  Potencia: {
    pattern: 'hip_dominant',
    systemicCost: 5,
    sportTransfer: 7,
    priority: 'main',
    exerciseType: 'POWER',
    progressionModel: 'QUALITY',
  },
  Core: {
    pattern: 'core',
    systemicCost: 3,
    sportTransfer: 5,
    priority: 'core',
    exerciseType: 'CORE',
    progressionModel: 'VOLUME',
  },
  Cardio: {
    pattern: 'cardio',
    systemicCost: 3,
    sportTransfer: 2,
    priority: 'accessory',
    exerciseType: 'CONDITIONING',
    progressionModel: 'DENSITY',
  },
  TKD: {
    pattern: 'rotation',
    systemicCost: 5,
    sportTransfer: 9,
    priority: 'main',
    exerciseType: 'BALLISTIC',
    progressionModel: 'QUALITY',
  },
  'Pliometría': {
    pattern: 'unspecified',
    systemicCost: 4,
    sportTransfer: 8,
    priority: 'main',
    exerciseType: 'PLYOMETRIC',
    progressionModel: 'QUALITY',
  },
  'Estabilidad': {
    pattern: 'core',
    systemicCost: 2,
    sportTransfer: 6,
    priority: 'accessory',
    exerciseType: 'STABILITY',
    progressionModel: 'QUALITY',
  },
  'Técnica': {
    pattern: 'unspecified',
    systemicCost: 2,
    sportTransfer: 8,
    priority: 'main',
    exerciseType: 'TECHNICAL',
    progressionModel: 'QUALITY',
  },
  'Agilidad': {
    pattern: 'unspecified',
    systemicCost: 4,
    sportTransfer: 9,
    priority: 'main',
    exerciseType: 'AGILITY',
    progressionModel: 'QUALITY',
  },
  'Velocidad': {
    pattern: 'unspecified',
    systemicCost: 5,
    sportTransfer: 9,
    priority: 'main',
    exerciseType: 'POWER',
    progressionModel: 'VELOCITY',
  },
  'Resistencia muscular': {
    pattern: 'unspecified',
    systemicCost: 4,
    sportTransfer: 4,
    priority: 'accessory',
    exerciseType: 'CONDITIONING',
    progressionModel: 'VOLUME',
  },
  'Activación': {
    pattern: 'unspecified',
    systemicCost: 1,
    sportTransfer: 4,
    priority: 'mobility',
    exerciseType: 'PREHAB',
    progressionModel: 'NONE',
  },
  'Recuperación': {
    pattern: 'unspecified',
    systemicCost: 1,
    sportTransfer: 3,
    priority: 'mobility',
    exerciseType: 'MOBILITY',
    progressionModel: 'NONE',
  },
  'Reacción (TKD)': {
    pattern: 'unspecified',
    systemicCost: 3,
    sportTransfer: 9,
    priority: 'main',
    exerciseType: 'TECHNICAL',
    progressionModel: 'QUALITY',
  },
  'Coordinación (TKD)': {
    pattern: 'unspecified',
    systemicCost: 2,
    sportTransfer: 8,
    priority: 'main',
    exerciseType: 'TECHNICAL',
    progressionModel: 'QUALITY',
  },
  'Equilibrio (TKD)': {
    pattern: 'unspecified',
    systemicCost: 2,
    sportTransfer: 7,
    priority: 'accessory',
    exerciseType: 'STABILITY',
    progressionModel: 'QUALITY',
  },
  'Propiocepción (TKD)': {
    pattern: 'unspecified',
    systemicCost: 2,
    sportTransfer: 6,
    priority: 'accessory',
    exerciseType: 'STABILITY',
    progressionModel: 'QUALITY',
  },
  'Flexibilidad (TKD)': {
    pattern: 'unspecified',
    systemicCost: 1,
    sportTransfer: 5,
    priority: 'mobility',
    exerciseType: 'MOBILITY',
    progressionModel: 'NONE',
  },
};

/**
 * Normaliza nombres de categorías provenientes de Sheets/Excel a las canónicas de CATEGORY_DEFAULTS.
 */
export function normalizeCategory(cat) {
  if (!cat || typeof cat !== 'string') return 'Fuerza';
  const clean = cat
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  if (clean.includes('pliometr') || clean.includes('plyo')) return 'Pliometría';
  if (clean.includes('estabilidad') || clean.includes('stability')) return 'Estabilidad';
  if (clean.includes('agilidad') || clean.includes('agility')) return 'Agilidad';
  if (clean.includes('velocidad') || clean.includes('speed')) return 'Velocidad';
  if (clean.includes('resistencia')) return 'Resistencia muscular';
  if (clean.includes('activacion')) return 'Activación';
  if (clean.includes('recuperacion')) return 'Recuperación';
  if (clean.includes('reaccion')) return 'Reacción (TKD)';
  if (clean.includes('coordinacion')) return 'Coordinación (TKD)';
  if (clean.includes('equilibrio')) return 'Equilibrio (TKD)';
  if (clean.includes('propiocepcion')) return 'Propiocepción (TKD)';
  if (clean.includes('flexibilidad')) return 'Flexibilidad (TKD)';
  if (clean.includes('tecnica') || clean.includes('technic')) return 'Técnica';
  if (clean.includes('movilidad') || clean.includes('mobility')) return 'Movilidad';
  if (clean.includes('potencia') || clean.includes('power')) return 'Potencia';
  if (clean.includes('core')) return 'Core';
  if (clean.includes('cardio') || clean.includes('condicionamiento')) return 'Cardio';
  if (clean === 'tkd' || clean.includes('taekwondo')) return 'TKD';
  if (clean.includes('fuerza') || clean.includes('strength')) return 'Fuerza';

  const match = Object.keys(CATEGORY_DEFAULTS).find(
    k => k.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === clean
  );
  return match || 'Fuerza';
}

const LS_OVERRIDES_KEY = 
  'trainingos_exercise_metadata_overrides';

export function getCoachOverrides() {
  try {
    return JSON.parse(
      localStorage.getItem(LS_OVERRIDES_KEY) 
      || '{}'
    );
  } catch { return {}; }
}

export function saveCoachOverride(
  exerciseId, metadata) {
  const overrides = getCoachOverrides();
  overrides[exerciseId] = {
    ...metadata,
    overriddenAt: new Date().toISOString()
  };
  localStorage.setItem(
    LS_OVERRIDES_KEY, 
    JSON.stringify(overrides)
  );
}

export function clearCoachOverride(exerciseId) {
  const overrides = getCoachOverrides();
  delete overrides[exerciseId];
  localStorage.setItem(
    LS_OVERRIDES_KEY, 
    JSON.stringify(overrides)
  );
}

export function getExerciseMetadata(exercise) {
  // 1. Coach override
  const overrides = getCoachOverrides();
  if (exercise?.id && overrides[exercise.id]) {
    return { 
      ...overrides[exercise.id], 
      _source: 'coach_override' 
    };
  }
  // 2. Predefined in library
  if (exercise?.pattern !== undefined && 
      exercise?.systemicCost !== undefined) {
    return {
      pattern: exercise.pattern,
      systemicCost: exercise.systemicCost,
      sportTransfer: exercise.sportTransfer ?? 5,
      priority: exercise.priority ?? 'accessory',
      exerciseType: exercise.exerciseType ?? 'STRENGTH',
      progressionModel: exercise.progressionModel ?? 'LOAD',
      _source: 'predefined'
    };
  }
  // 3. Category defaults
  const catKey = normalizeCategory(exercise?.category || exercise?.type);
  const defaults = 
    CATEGORY_DEFAULTS[catKey] 
    || CATEGORY_DEFAULTS.Fuerza;
  return { ...defaults, _source: 'category_default' };
}

export function createCustomExercise(
  name, category, sport) {
  const defaults = 
    CATEGORY_DEFAULTS[category] 
    || CATEGORY_DEFAULTS.Fuerza;
  return {
    id: `custom-${Date.now()}`,
    name,
    category,
    sport,
    defaultSeries: '3',
    defaultReps: '10',
    defaultRest: 60,
    pattern: defaults.pattern,
    systemicCost: defaults.systemicCost,
    sportTransfer: defaults.sportTransfer,
    priority: defaults.priority,
    _metadataSource: 'category_default'
  };
}
