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
  'cardio'
];

export const VALID_PRIORITIES = [
  'main', 'accessory', 'core', 'mobility'
];

export const CATEGORY_DEFAULTS = {
  Movilidad: {
    pattern: 'hip_dominant',
    systemicCost: 1,
    sportTransfer: 5,
    priority: 'mobility'
  },
  Fuerza: {
    pattern: 'knee_dominant',
    systemicCost: 7,
    sportTransfer: 5,
    priority: 'main'
  },
  Potencia: {
    pattern: 'hip_dominant',
    systemicCost: 5,
    sportTransfer: 7,
    priority: 'main'
  },
  Core: {
    pattern: 'core',
    systemicCost: 3,
    sportTransfer: 5,
    priority: 'core'
  },
  Cardio: {
    pattern: 'cardio',
    systemicCost: 3,
    sportTransfer: 2,
    priority: 'accessory'
  },
  TKD: {
    pattern: 'rotation',
    systemicCost: 5,
    sportTransfer: 9,
    priority: 'main'
  }
};

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
  if (overrides[exercise.id]) {
    return { 
      ...overrides[exercise.id], 
      _source: 'coach_override' 
    };
  }
  // 2. Predefined in library
  if (exercise.pattern !== undefined && 
      exercise.systemicCost !== undefined) {
    return {
      pattern: exercise.pattern,
      systemicCost: exercise.systemicCost,
      sportTransfer: exercise.sportTransfer ?? 5,
      priority: exercise.priority ?? 'accessory',
      _source: 'predefined'
    };
  }
  // 3. Category defaults
  const defaults = 
    CATEGORY_DEFAULTS[exercise.category] 
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
