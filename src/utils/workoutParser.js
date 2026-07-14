/**
 * Parsea un array de filas planas procedentes del Excel (workouts) 
 * y las agrupa en Rutinas -> Sesiones (días) -> Bloques (letras) -> Ejercicios.
 */
export function parseWorkouts(rows) {
  const routinesMap = {};

  const DAY_NAMES = ['lunes','martes','miércoles','miercoles','jueves','viernes','sábado','sabado','domingo'];
  const normDay = (d) => d.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  // Capitalize first letter for display
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // Memory for merged or empty cells in Excel
  let lastRId = 'Mi Rutina';
  let lastDay = 'lunes';
  let lastBlock = 'A';

  rows.forEach(row => {
    let rId = (row.rutina_id || '').toString().trim();
    let day = normDay(row.dia || '');

    // Auto-detect: if rutina_id looks like a day name and dia is empty,
    // the user put the day in the rutina_id column
    if (!day && rId && DAY_NAMES.includes(normDay(rId))) {
      day = normDay(rId);
      rId = 'Mi Rutina';
    }

    if (!rId) rId = lastRId;
    if (!day) day = lastDay;

    let blockLabel = (row.bloque || '').toString().trim();
    if (!blockLabel) blockLabel = lastBlock;

    // Update memory
    lastRId = rId;
    lastDay = day;
    lastBlock = blockLabel;
    
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
        name: capitalize(day),
        type: 'gym',
        sport: 'gym',
        icon: '🏋️',
        intensity: 'Media',
        intensityLevel: 3,
        duration: 0,
        exercises: 0,
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
    const sets = parseInt(row.series, 10) || 1;
    const reps = (row.repeticiones || '1').toString();
    const exercise = {
      id: `ex_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
      name: row.ejercicio || 'Ejercicio Desconocido',
      muscleGroup: row.grupo_muscular || '',
      orderNumber: row.grupo_muscular || '',
      type: row.tipo || 'fuerza',
      series: sets,
      reps: reps,
      targetSets: sets,
      targetReps: reps,
      targetExecutionTime: parseInt(row.tiempo_ejecucion, 10) || 0,
      targetRestTime: parseInt(row.tiempo_descanso, 10) || 0,
      restSeconds: parseInt(row.tiempo_descanso, 10) || 0,
      log: []
    };
    
    block.exercises.push(exercise);
  });

  // Calcular métricas de las sesiones (duración estimada + conteo ejercicios)
  Object.values(routinesMap).forEach(routine => {
    Object.values(routine.sessions).forEach(session => {
      // Contar ejercicios totales
      let exerciseCount = 0;
      let totalSeconds = 0;
      session.blocks.forEach(block => {
        exerciseCount += block.exercises.length;
        block.exercises.forEach(ex => {
          // Si hay tiempos, calcular duración real
          if (ex.targetExecutionTime || ex.targetRestTime) {
            totalSeconds += ex.targetSets * (ex.targetExecutionTime + ex.targetRestTime);
          } else {
            // Estimar ~90s por serie (ejecución + descanso) si no hay datos
            totalSeconds += ex.targetSets * 90;
          }
        });
      });
      session.exercises = exerciseCount;
      session.duration = Math.round(totalSeconds / 60) || 45;

      // Determinar grupo muscular principal para el nombre
      const groups = {};
      session.blocks.forEach(b => {
        b.exercises.forEach(ex => {
          if (ex.muscleGroup) {
            groups[ex.muscleGroup] = (groups[ex.muscleGroup] || 0) + 1;
          }
        });
      });
      const topGroups = Object.entries(groups)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([g]) => g);
      
      if (topGroups.length > 0) {
        session.name = topGroups.join(' + ');
      }
    });
  });

  return Object.values(routinesMap);
}
