// Biblioteca de ejercicios MOCK para el Constructor de Sesiones (Prompt 2.3)
export const EXERCISE_LIBRARY = [
  // MOVILIDAD
  { id: 'lib-mov-1', name: 'Leg swings frontales', category: 'Movilidad', sport: 'all', defaultSeries: '2', defaultReps: '10/pierna', defaultRest: 0 },
  { id: 'lib-mov-2', name: 'Leg swings laterales', category: 'Movilidad', sport: 'all', defaultSeries: '2', defaultReps: '10/pierna', defaultRest: 0 },
  { id: 'lib-mov-3', name: 'Círculos de cadera', category: 'Movilidad', sport: 'all', defaultSeries: '2', defaultReps: '10/lado', defaultRest: 0 },
  { id: 'lib-mov-4', name: 'Rotaciones torácicas', category: 'Movilidad', sport: 'all', defaultSeries: '2', defaultReps: '8/lado', defaultRest: 0 },
  { id: 'lib-mov-5', name: 'Sentadilla asistida profunda', category: 'Movilidad', sport: 'all', defaultSeries: '2', defaultReps: '8', defaultRest: 0 },
  { id: 'lib-mov-6', name: 'Rotaciones de tobillo', category: 'Movilidad', sport: 'all', defaultSeries: '2', defaultReps: '10/lado', defaultRest: 0 },

  // FUERZA
  { id: 'lib-str-1', name: 'Sentadilla Trasera', category: 'Fuerza', sport: 'gym', defaultSeries: '4', defaultReps: '6', defaultRest: 180, suggestedWeight: { min: null, max: null } },
  { id: 'lib-str-2', name: 'Peso Muerto', category: 'Fuerza', sport: 'gym', defaultSeries: '4', defaultReps: '5', defaultRest: 180, suggestedWeight: { min: null, max: null } },
  { id: 'lib-str-3', name: 'Press Banca', category: 'Fuerza', sport: 'gym', defaultSeries: '4', defaultReps: '6', defaultRest: 120, suggestedWeight: { min: null, max: null } },
  { id: 'lib-str-4', name: 'Remo Barra', category: 'Fuerza', sport: 'gym', defaultSeries: '4', defaultReps: '8', defaultRest: 120, suggestedWeight: { min: null, max: null } },
  { id: 'lib-str-5', name: 'Press Militar', category: 'Fuerza', sport: 'gym', defaultSeries: '3', defaultReps: '8', defaultRest: 90, suggestedWeight: { min: null, max: null } },
  { id: 'lib-str-6', name: 'Hip Thrust', category: 'Fuerza', sport: 'gym', defaultSeries: '3', defaultReps: '10', defaultRest: 90, suggestedWeight: { min: null, max: null } },

  // POTENCIA
  { id: 'lib-pow-1', name: 'Pogos', category: 'Potencia', sport: 'gym', defaultSeries: '3', defaultReps: '15', defaultRest: 60 },
  { id: 'lib-pow-2', name: 'Split Jumps', category: 'Potencia', sport: 'gym', defaultSeries: '3', defaultReps: '6', defaultRest: 90 },
  { id: 'lib-pow-3', name: 'Skater Jumps Reactivos', category: 'Potencia', sport: 'gym', defaultSeries: '3', defaultReps: '5/lado', defaultRest: 90 },
  { id: 'lib-pow-4', name: 'Salidas Explosivas', category: 'Potencia', sport: 'gym', defaultSeries: '6', defaultReps: '5seg', defaultRest: 120 },

  // CORE
  { id: 'lib-core-1', name: 'Ab Wheel', category: 'Core', sport: 'all', defaultSeries: '3', defaultReps: '10', defaultRest: 60 },
  { id: 'lib-core-2', name: 'Landmine Rotación', category: 'Core', sport: 'gym', defaultSeries: '3', defaultReps: '8/lado', defaultRest: 60 },
  { id: 'lib-core-3', name: 'Plancha', category: 'Core', sport: 'all', defaultSeries: '3', defaultReps: '30seg', defaultRest: 45 },
  { id: 'lib-core-4', name: 'Hollow Body', category: 'Core', sport: 'all', defaultSeries: '3', defaultReps: '20seg', defaultRest: 45 },

  // CARDIO
  { id: 'lib-car-1', name: 'Bicicleta Estática', category: 'Cardio', sport: 'cardio', defaultSeries: '1', defaultDuration: '08:00', defaultRest: 0 },
  { id: 'lib-car-2', name: 'Elíptica', category: 'Cardio', sport: 'cardio', defaultSeries: '1', defaultDuration: '10:00', defaultRest: 0 },
  { id: 'lib-car-3', name: 'Remo Ergómetro', category: 'Cardio', sport: 'cardio', defaultSeries: '1', defaultDuration: '06:00', defaultRest: 0 },

  // TKD
  { id: 'lib-tkd-1', name: 'Dollyo Rápido', category: 'TKD', sport: 'tkd', defaultSeries: '3', defaultReps: '5/pierna', defaultRest: 60 },
  { id: 'lib-tkd-2', name: 'Doble Dollyo', category: 'TKD', sport: 'tkd', defaultSeries: '2', defaultReps: '4/pierna', defaultRest: 60 },
  { id: 'lib-tkd-3', name: 'Ap Chagi Progresivo', category: 'TKD', sport: 'tkd', defaultSeries: '2', defaultReps: '8/pierna', defaultRest: 0 },
  { id: 'lib-tkd-4', name: 'Entrada + Salida', category: 'TKD', sport: 'tkd', defaultSeries: '2', defaultReps: '5', defaultRest: 45 },
  { id: 'lib-tkd-5', name: 'Poomsae Completo', category: 'TKD', sport: 'tkd', defaultSeries: '3', defaultReps: '1', defaultRest: 90 },
  { id: 'lib-tkd-6', name: 'Trabajo de saco libre', category: 'TKD', sport: 'tkd', defaultSeries: '3', defaultDuration: '02:00', defaultRest: 60 },
];

export const CATEGORIES = ['Todos', 'Movilidad', 'Fuerza', 'Potencia', 'Core', 'Cardio', 'TKD'];
