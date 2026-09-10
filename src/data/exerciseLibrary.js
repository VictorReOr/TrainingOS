/**
 * @typedef {'STRENGTH' | 'POWER' | 'PLYOMETRIC' | 'BALLISTIC' | 'OLYMPIC_LIFT' |
 *           'HYPERTROPHY' | 'CORE' | 'PREHAB' | 'MOBILITY' | 'CONDITIONING' |
 *           'STABILITY' | 'TECHNICAL' | 'AGILITY'} ExerciseType
 *
 * Valores derivados automáticamente desde CATEGORY_DEFAULTS (inputBuilder):
 *   STRENGTH, POWER, CORE, MOBILITY, CONDITIONING, BALLISTIC
 *
 * Valores asignables SOLO por coach override manual (ExerciseReview):
 *   STABILITY  — ejercicios de estabilidad articular/postural (→ progressionModel: QUALITY)
 *   TECHNICAL  — ejercicios de destreza técnica/habilidad (→ progressionModel: QUALITY)
 *   AGILITY    — ejercicios de agilidad/cambio de dirección (→ progressionModel: QUALITY)
 *   PLYOMETRIC — pliometría reactiva (→ progressionModel: QUALITY)
 *   OLYMPIC_LIFT — levantamientos olímpicos (→ progressionModel: VELOCITY)
 *   HYPERTROPHY — hipertrofia (→ progressionModel: VOLUME o RPE)
 *   PREHAB — prehab/movilidad terapéutica (→ progressionModel: VOLUME)
 */

// Biblioteca de ejercicios para el Constructor de Sesiones
export const EXERCISE_LIBRARY = [
  // MOVILIDAD
  { id: 'lib-mov-1', name: 'Leg swings frontales', category: 'Movilidad', sport: 'all', defaultSeries: '2', defaultReps: '10/pierna', defaultRest: 0, pattern: 'hip_dominant', systemicCost: 1, sportTransfer: 8, priority: 'mobility', exerciseType: 'MOBILITY', progressionModel: 'NONE' },
  { id: 'lib-mov-2', name: 'Leg swings laterales', category: 'Movilidad', sport: 'all', defaultSeries: '2', defaultReps: '10/pierna', defaultRest: 0, pattern: 'hip_dominant', systemicCost: 1, sportTransfer: 8, priority: 'mobility', exerciseType: 'MOBILITY', progressionModel: 'NONE' },
  { id: 'lib-mov-3', name: 'Círculos de cadera', category: 'Movilidad', sport: 'all', defaultSeries: '2', defaultReps: '10/lado', defaultRest: 0, pattern: 'rotation', systemicCost: 1, sportTransfer: 7, priority: 'mobility', exerciseType: 'MOBILITY', progressionModel: 'NONE' },
  { id: 'lib-mov-4', name: 'Rotaciones torácicas', category: 'Movilidad', sport: 'all', defaultSeries: '2', defaultReps: '8/lado', defaultRest: 0, pattern: 'rotation', systemicCost: 1, sportTransfer: 6, priority: 'mobility', exerciseType: 'MOBILITY', progressionModel: 'NONE' },
  { id: 'lib-mov-5', name: 'Sentadilla asistida profunda', category: 'Movilidad', sport: 'all', defaultSeries: '2', defaultReps: '8', defaultRest: 0, pattern: 'knee_dominant', systemicCost: 2, sportTransfer: 6, priority: 'mobility', exerciseType: 'MOBILITY', progressionModel: 'NONE' },
  { id: 'lib-mov-6', name: 'Rotaciones de tobillo', category: 'Movilidad', sport: 'all', defaultSeries: '2', defaultReps: '10/lado', defaultRest: 0, pattern: 'unilateral', systemicCost: 1, sportTransfer: 5, priority: 'mobility', exerciseType: 'MOBILITY', progressionModel: 'NONE' },

  // FUERZA
  { id: 'lib-str-1', name: 'Sentadilla Trasera', category: 'Fuerza', sport: 'gym', defaultSeries: '4', defaultReps: '6', defaultRest: 180, suggestedWeight: { min: null, max: null }, pattern: 'knee_dominant', systemicCost: 9, sportTransfer: 7, priority: 'main', exerciseType: 'STRENGTH', progressionModel: 'LOAD' },
  { id: 'lib-str-2', name: 'Peso Muerto', category: 'Fuerza', sport: 'gym', defaultSeries: '4', defaultReps: '5', defaultRest: 180, suggestedWeight: { min: null, max: null }, pattern: 'hip_dominant', systemicCost: 10, sportTransfer: 6, priority: 'main', exerciseType: 'STRENGTH', progressionModel: 'LOAD' },
  { id: 'lib-str-3', name: 'Press Banca', category: 'Fuerza', sport: 'gym', defaultSeries: '4', defaultReps: '6', defaultRest: 120, suggestedWeight: { min: null, max: null }, pattern: 'push_horizontal', systemicCost: 7, sportTransfer: 2, priority: 'main', exerciseType: 'STRENGTH', progressionModel: 'LOAD' },
  { id: 'lib-str-4', name: 'Remo Barra', category: 'Fuerza', sport: 'gym', defaultSeries: '4', defaultReps: '8', defaultRest: 120, suggestedWeight: { min: null, max: null }, pattern: 'pull_horizontal', systemicCost: 7, sportTransfer: 4, priority: 'main', exerciseType: 'STRENGTH', progressionModel: 'LOAD' },
  { id: 'lib-str-5', name: 'Press Militar', category: 'Fuerza', sport: 'gym', defaultSeries: '3', defaultReps: '8', defaultRest: 90, suggestedWeight: { min: null, max: null }, pattern: 'push_vertical', systemicCost: 6, sportTransfer: 3, priority: 'accessory', exerciseType: 'STRENGTH', progressionModel: 'LOAD' },
  { id: 'lib-str-6', name: 'Hip Thrust', category: 'Fuerza', sport: 'gym', defaultSeries: '3', defaultReps: '10', defaultRest: 90, suggestedWeight: { min: null, max: null }, pattern: 'hip_dominant', systemicCost: 6, sportTransfer: 7, priority: 'accessory', exerciseType: 'STRENGTH', progressionModel: 'LOAD' },
  { id: 'lib-str-7a', name: 'Dominadas Lastradas', category: 'Fuerza', sport: 'gym', defaultSeries: '4', defaultReps: '6', defaultRest: 120, pattern: 'pull_vertical', systemicCost: 7, sportTransfer: 5, priority: 'main', exerciseType: 'STRENGTH', progressionModel: 'LOAD' },
  { id: 'lib-str-7b', name: 'Dominadas Peso Corporal', category: 'Fuerza', sport: 'gym', defaultSeries: '3', defaultReps: '8', defaultRest: 90, pattern: 'pull_vertical', systemicCost: 6, sportTransfer: 5, priority: 'main', exerciseType: 'HYPERTROPHY', progressionModel: 'VOLUME' },
  { id: 'lib-str-8', name: 'Romanian Deadlift', category: 'Fuerza', sport: 'gym', defaultSeries: '3', defaultReps: '8', defaultRest: 120, pattern: 'hip_dominant', systemicCost: 8, sportTransfer: 7, priority: 'main', exerciseType: 'STRENGTH', progressionModel: 'LOAD' },
  { id: 'lib-str-9', name: 'Face Pull', category: 'Fuerza', sport: 'gym', defaultSeries: '3', defaultReps: '15', defaultRest: 60, pattern: 'pull_horizontal', systemicCost: 2, sportTransfer: 4, priority: 'accessory', exerciseType: 'HYPERTROPHY', progressionModel: 'RPE' },
  { id: 'lib-str-10', name: 'Push Press', category: 'Fuerza', sport: 'gym', defaultSeries: '4', defaultReps: '5', defaultRest: 120, pattern: 'push_vertical', systemicCost: 7, sportTransfer: 6, priority: 'main', exerciseType: 'POWER', progressionModel: 'VELOCITY' },

  // POTENCIA
  { id: 'lib-pow-1', name: 'Pogos', category: 'Potencia', sport: 'gym', defaultSeries: '3', defaultReps: '15', defaultRest: 60, pattern: 'unilateral', systemicCost: 4, sportTransfer: 9, priority: 'accessory', exerciseType: 'PLYOMETRIC', progressionModel: 'QUALITY' },
  { id: 'lib-pow-2', name: 'Split Jumps', category: 'Potencia', sport: 'gym', defaultSeries: '3', defaultReps: '6', defaultRest: 90, pattern: 'unilateral', systemicCost: 5, sportTransfer: 9, priority: 'main', exerciseType: 'PLYOMETRIC', progressionModel: 'QUALITY' },
  { id: 'lib-pow-3', name: 'Skater Jumps Reactivos', category: 'Potencia', sport: 'gym', defaultSeries: '3', defaultReps: '5/lado', defaultRest: 90, pattern: 'unilateral', systemicCost: 5, sportTransfer: 9, priority: 'main', exerciseType: 'PLYOMETRIC', progressionModel: 'QUALITY' },
  { id: 'lib-pow-4', name: 'Salidas Explosivas', category: 'Potencia', sport: 'gym', defaultSeries: '6', defaultReps: '5seg', defaultRest: 120, pattern: 'hip_dominant', systemicCost: 6, sportTransfer: 10, priority: 'main', exerciseType: 'POWER', progressionModel: 'QUALITY' },
  { id: 'lib-pow-5', name: 'Step-up con Peso', category: 'Potencia', sport: 'gym', defaultSeries: '3', defaultReps: '8/pierna', defaultRest: 90, pattern: 'unilateral', systemicCost: 5, sportTransfer: 9, priority: 'main', exerciseType: 'POWER', progressionModel: 'LOAD' },
  { id: 'lib-pow-6', name: 'CMJ (Salto Contramovimiento)', category: 'Potencia', sport: 'gym', defaultSeries: '3', defaultReps: '5', defaultRest: 90, pattern: 'knee_dominant', systemicCost: 3, sportTransfer: 9, priority: 'main', exerciseType: 'PLYOMETRIC', progressionModel: 'QUALITY' },
  { id: 'lib-pow-7', name: 'Broad Jump', category: 'Potencia', sport: 'gym', defaultSeries: '3', defaultReps: '4', defaultRest: 90, pattern: 'hip_dominant', systemicCost: 4, sportTransfer: 9, priority: 'main', exerciseType: 'PLYOMETRIC', progressionModel: 'QUALITY' },
  { id: 'lib-pow-8', name: 'Jump Squat', category: 'Potencia', sport: 'gym', defaultSeries: '3', defaultReps: '5', defaultRest: 90, pattern: 'knee_dominant', systemicCost: 4, sportTransfer: 8, priority: 'main', exerciseType: 'PLYOMETRIC', progressionModel: 'QUALITY' },
  { id: 'lib-pow-9', name: 'Drop Jump', category: 'Potencia', sport: 'gym', defaultSeries: '3', defaultReps: '5', defaultRest: 90, pattern: 'knee_dominant', systemicCost: 5, sportTransfer: 9, priority: 'main', exerciseType: 'PLYOMETRIC', progressionModel: 'QUALITY' },
  { id: 'lib-pow-10', name: 'Lateral Bound', category: 'Potencia', sport: 'gym', defaultSeries: '3', defaultReps: '5/lado', defaultRest: 90, pattern: 'unilateral', systemicCost: 4, sportTransfer: 9, priority: 'main', exerciseType: 'PLYOMETRIC', progressionModel: 'QUALITY' },
  { id: 'lib-pow-11', name: 'Power Clean', category: 'Potencia', sport: 'gym', defaultSeries: '4', defaultReps: '3', defaultRest: 120, pattern: 'hip_dominant', systemicCost: 8, sportTransfer: 8, priority: 'main', exerciseType: 'OLYMPIC_LIFT', progressionModel: 'VELOCITY' },
  { id: 'lib-pow-12', name: 'Kettlebell Swing', category: 'Potencia', sport: 'gym', defaultSeries: '3', defaultReps: '10', defaultRest: 60, pattern: 'hip_dominant', systemicCost: 5, sportTransfer: 7, priority: 'main', exerciseType: 'BALLISTIC', progressionModel: 'VELOCITY' },

  // CORE
  { id: 'lib-core-1', name: 'Ab Wheel', category: 'Core', sport: 'all', defaultSeries: '3', defaultReps: '10', defaultRest: 60, pattern: 'anti_rotation', systemicCost: 3, sportTransfer: 5, priority: 'core', exerciseType: 'CORE', progressionModel: 'VOLUME' },
  { id: 'lib-core-2', name: 'Landmine Rotación', category: 'Core', sport: 'gym', defaultSeries: '3', defaultReps: '8/lado', defaultRest: 60, pattern: 'rotation', systemicCost: 4, sportTransfer: 8, priority: 'core', exerciseType: 'CORE', progressionModel: 'LOAD' },
  { id: 'lib-core-3', name: 'Plancha', category: 'Core', sport: 'all', defaultSeries: '3', defaultReps: '30seg', defaultRest: 45, pattern: 'core', systemicCost: 2, sportTransfer: 4, priority: 'core', exerciseType: 'CORE', progressionModel: 'VOLUME' },
  { id: 'lib-core-4', name: 'Hollow Body', category: 'Core', sport: 'all', defaultSeries: '3', defaultReps: '20seg', defaultRest: 45, pattern: 'core', systemicCost: 2, sportTransfer: 6, priority: 'core', exerciseType: 'CORE', progressionModel: 'VOLUME' },
  { id: 'lib-core-5', name: 'Pallof Press', category: 'Core', sport: 'all', defaultSeries: '3', defaultReps: '10/lado', defaultRest: 60, pattern: 'anti_rotation', systemicCost: 2, sportTransfer: 7, priority: 'core', exerciseType: 'CORE', progressionModel: 'LOAD' },
  { id: 'lib-core-6', name: 'Medball Rotational Throw', category: 'Core', sport: 'gym', defaultSeries: '3', defaultReps: '6/lado', defaultRest: 60, pattern: 'rotation', systemicCost: 4, sportTransfer: 8, priority: 'main', exerciseType: 'BALLISTIC', progressionModel: 'QUALITY' },
  { id: 'lib-str-11', name: 'Suitcase Carry', category: 'Core', sport: 'gym', defaultSeries: '3', defaultReps: '20m/lado', defaultRest: 60, pattern: 'anti_rotation', systemicCost: 3, sportTransfer: 6, priority: 'accessory', exerciseType: 'CORE', progressionModel: 'VOLUME' },

  // PREHAB
  { id: 'lib-preh-1', name: 'Copenhagen Plank', category: 'Prehab', sport: 'all', defaultSeries: '3', defaultReps: '20seg/lado', defaultRest: 45, pattern: 'unilateral', systemicCost: 3, sportTransfer: 5, priority: 'accessory', exerciseType: 'PREHAB', progressionModel: 'VOLUME' },

  // CARDIO
  { id: 'lib-car-1', name: 'Bicicleta Estática', category: 'Cardio', sport: 'cardio', defaultSeries: '1', defaultDuration: '08:00', defaultRest: 0, pattern: 'cardio', systemicCost: 3, sportTransfer: 3, priority: 'accessory', exerciseType: 'CONDITIONING', progressionModel: 'DENSITY' },
  { id: 'lib-car-2', name: 'Elíptica', category: 'Cardio', sport: 'cardio', defaultSeries: '1', defaultDuration: '10:00', defaultRest: 0, pattern: 'cardio', systemicCost: 3, sportTransfer: 2, priority: 'accessory', exerciseType: 'CONDITIONING', progressionModel: 'DENSITY' },
  { id: 'lib-car-3', name: 'Remo Ergómetro', category: 'Cardio', sport: 'cardio', defaultSeries: '1', defaultDuration: '06:00', defaultRest: 0, pattern: 'pull_horizontal', systemicCost: 4, sportTransfer: 3, priority: 'accessory', exerciseType: 'CONDITIONING', progressionModel: 'DENSITY' },

  // TKD
  { id: 'lib-tkd-1', name: 'Dollyo Rápido', category: 'TKD', sport: 'tkd', defaultSeries: '3', defaultReps: '5/pierna', defaultRest: 60, pattern: 'rotation', systemicCost: 5, sportTransfer: 10, priority: 'main', exerciseType: 'BALLISTIC', progressionModel: 'QUALITY' },
  { id: 'lib-tkd-2', name: 'Doble Dollyo', category: 'TKD', sport: 'tkd', defaultSeries: '2', defaultReps: '4/pierna', defaultRest: 60, pattern: 'rotation', systemicCost: 6, sportTransfer: 10, priority: 'main', exerciseType: 'BALLISTIC', progressionModel: 'QUALITY' },
  { id: 'lib-tkd-3', name: 'Ap Chagi Progresivo', category: 'TKD', sport: 'tkd', defaultSeries: '2', defaultReps: '8/pierna', defaultRest: 0, pattern: 'unilateral', systemicCost: 4, sportTransfer: 10, priority: 'main', exerciseType: 'BALLISTIC', progressionModel: 'QUALITY' },
  { id: 'lib-tkd-4', name: 'Entrada + Salida', category: 'TKD', sport: 'tkd', defaultSeries: '2', defaultReps: '5', defaultRest: 45, pattern: 'hip_dominant', systemicCost: 5, sportTransfer: 10, priority: 'main', exerciseType: 'CONDITIONING', progressionModel: 'DENSITY' },
  { id: 'lib-tkd-5', name: 'Poomsae Completo', category: 'TKD', sport: 'tkd', defaultSeries: '3', defaultReps: '1', defaultRest: 90, pattern: 'core', systemicCost: 4, sportTransfer: 8, priority: 'accessory', exerciseType: 'CONDITIONING', progressionModel: 'QUALITY' },
  { id: 'lib-tkd-6', name: 'Trabajo de saco libre', category: 'TKD', sport: 'tkd', defaultSeries: '3', defaultDuration: '02:00', defaultRest: 60, pattern: 'rotation', systemicCost: 6, sportTransfer: 9, priority: 'accessory', exerciseType: 'CONDITIONING', progressionModel: 'DENSITY' },
];

export const CATEGORIES = ['Todos', 'Movilidad', 'Fuerza', 'Potencia', 'Core', 'Prehab', 'Cardio', 'TKD'];

