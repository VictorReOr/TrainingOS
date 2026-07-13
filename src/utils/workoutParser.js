/**
 * Parsea un array de filas planas procedentes del Excel (workouts) 
 * y las agrupa en Rutinas -> Sesiones (días) -> Bloques (letras) -> Ejercicios.
 */
export function parseWorkouts(rows) {
  const routinesMap = {};

  const DAY_NAMES = ['lunes','martes','miércoles','miercoles','jueves','viernes','sábado','sabado','domingo'];
  const normDay = (d) => d.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  rows.forEach(row => {
    let rId = (row.rutina_id || '').toString().trim();
    let day = (row.dia || '').toString().toLowerCase().trim();

    // Auto-detect: if rutina_id looks like a day name and dia is empty,
    // the user put the day in the rutina_id column
    if (!day && rId && DAY_NAMES.includes(normDay(rId))) {
      day = normDay(rId);
      rId = 'Mi Rutina';
    }

    if (!rId) rId = 'Mi Rutina';
    if (!day) day = 'lunes';

    const blockLabel = row.bloque || 'A';
    
    // 1. Inicializar rutina si no existe
    if (!routinesMap[rId]) {
      routinesMap[rId] = {
        id: rId,
        name: rId,
        sessions: {}
      };
    }

    const routine = routinesMap[rId];

    // 2. Inicializar sesión del día si no existe
    if (!routine.sessions[day]) {
      routine.sessions[day] = {
        id: rId + '_' + day,
        name: 'Sesión de ' + row.dia,
        type: 'gym',
        sport: 'gym',
        duration: 0,
        blocks: []
      };
    }
    const session = routine.sessions[day];

    // 3. Inicializar bloque si no existe
    let block = session.blocks.find(b => b.name === `Bloque ${blockLabel}`);
    if (!block) {
      block = {
        id: `block_${rId}_${day}_${blockLabel}`,
        name: `Bloque ${blockLabel}`,
        type: 'fuerza',
        exercises: []
      };
      session.blocks.push(block);
    }

    // 4. Crear y añadir ejercicio
    const exercise = {
      id: `ex_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
      name: row.ejercicio || 'Ejercicio Desconocido',
      muscleGroup: row.grupo_muscular || '',
      type: row.tipo || 'fuerza',
      targetSets: parseInt(row.series, 10) || 1,
      targetReps: row.repeticiones || '1',
      targetExecutionTime: parseInt(row.tiempo_ejecucion, 10) || 0,
      targetRestTime: parseInt(row.tiempo_descanso, 10) || 0,
      log: []
    };
    
    block.exercises.push(exercise);
  });

  // Calcular métricas de las sesiones (duración estimada)
  Object.values(routinesMap).forEach(routine => {
    Object.values(routine.sessions).forEach(session => {
      let totalSeconds = 0;
      session.blocks.forEach(block => {
        block.exercises.forEach(ex => {
          totalSeconds += ex.targetSets * (ex.targetExecutionTime + ex.targetRestTime);
        });
      });
      session.duration = Math.round(totalSeconds / 60) || 45; // Default 45m si no hay datos
    });
  });

  return Object.values(routinesMap);
}
