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

    // Nombre de sesión manual proveniente de la hoja de cálculo
    const sessionNameFromSheet = (row.sessionName || row.nombre_sesion || '').toString().trim();

    // Captura de superserie
    const rawSuperSerie = (row.superSerie || '').toString().trim();
    const supersetCode = (rawSuperSerie && rawSuperSerie !== '-') ? rawSuperSerie : null;

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
        // Si la fila trae sessionName, usarlo directamente; si no, capitalize(day) como antes
        name: sessionNameFromSheet || capitalize(day),
        _hasManualName: !!sessionNameFromSheet, // flag interno: evita sobreescritura posterior
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

    // Si la sesión ya existía y llega otra fila con sessionName distinto y no vacío,
    // se ignora (se mantiene el primero que llegó). Opción elegida: ignorar + warning,
    // más simple que intentar resolver cuál es el "correcto".
    if (sessionNameFromSheet && session._hasManualName && session.name !== sessionNameFromSheet) {
      console.warn(
        `[workoutParser] Inconsistencia en sessionName para la sesión '${day}' de la rutina '${rId}': ` +
        `nombre actual='${session.name}', nombre ignorado='${sessionNameFromSheet}'. Se mantiene el primero.`
      );
    }

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
      _rawSuperSerie: supersetCode,
      supersetId: null,
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
      
      // Solo sobreescribir con los grupos musculares si NO hay nombre manual desde la hoja
      if (topGroups.length > 0 && !session._hasManualName) {
        session.name = topGroups.join(' + ');
      }

      // ── VALIDACIÓN DE SUPERSERIES (por sesión) ──
      const sessionSupersetMap = {};

      session.blocks.forEach(block => {
        block.exercises.forEach(ex => {
          if (!ex._rawSuperSerie) return;
          if (!sessionSupersetMap[ex._rawSuperSerie]) {
            sessionSupersetMap[ex._rawSuperSerie] = [];
          }
          sessionSupersetMap[ex._rawSuperSerie].push({
            blockId: block.id,
            exerciseRef: ex,
          });
        });
      });

      Object.entries(sessionSupersetMap).forEach(([ssCode, entries]) => {
        const blockIds = new Set(entries.map(e => e.blockId));
        if (blockIds.size > 1) {
          console.warn(`[workoutParser] Superserie '${ssCode}' inválida en sesión '${session.id}': aparece en bloques distintos [${[...blockIds]}]. Se ignora.`);
          entries.forEach(e => { e.exerciseRef.supersetId = null; });
        } else if (entries.length < 2) {
          entries[0].exerciseRef.supersetId = null;
        } else {
          entries.forEach(e => { e.exerciseRef.supersetId = ssCode; });
        }
      });

      // ── CONSTRUCCIÓN DE block.supersets ──
      session.blocks.forEach(block => {
        const ssGroups = {};
        block.exercises.forEach(ex => {
          if (!ex.supersetId) return;
          if (!ssGroups[ex.supersetId]) ssGroups[ex.supersetId] = [];
          ssGroups[ex.supersetId].push(ex.id);
        });
        block.supersets = Object.entries(ssGroups).map(([id, exerciseIds]) => ({
          id,
          exerciseIds,
        }));
      });
    });
  });

  // --- Verificación de parseo (eliminar o comentar en producción) ---
  const allSessions = Object.values(routinesMap).flatMap(r => Object.values(r.sessions));
  const conNombreManual = allSessions.find(s => s._hasManualName);
  const sinNombreManual = allSessions.find(s => !s._hasManualName);
  if (conNombreManual) {
    console.log('[workoutParser] ✅ Sesión con sessionName manual:', conNombreManual.name, '| _hasManualName:', conNombreManual._hasManualName);
  }
  if (sinNombreManual) {
    console.log('[workoutParser] ✅ Sesión sin sessionName (fallback automático):', sinNombreManual.name, '| _hasManualName:', sinNombreManual._hasManualName);
  }
  const casoMixto = Object.values(routinesMap).find(r =>
    Object.values(r.sessions).some(s => s._hasManualName) &&
    Object.values(r.sessions).some(s => !s._hasManualName)
  );
  if (casoMixto) {
    console.log('[workoutParser] ✅ Caso mixto — sessions de rutina "' + casoMixto.name + '":', JSON.stringify(Object.values(casoMixto.sessions).map(s => ({ id: s.id, name: s.name, _hasManualName: s._hasManualName })), null, 2));
  }

  const sessionConSuperset = allSessions.find(s => s.blocks.some(b => b.supersets && b.supersets.length > 0));
  if (sessionConSuperset) {
    console.log('[SUPERSET OK]', JSON.stringify(
      sessionConSuperset.blocks.find(b => b.supersets.length > 0)
    ));
  }
  // --- Fin verificación ---

  // Limpiar flag interno para no exponer propiedades privadas a la UI
  Object.values(routinesMap).forEach(routine =>
    Object.values(routine.sessions).forEach(session => {
      delete session._hasManualName;
      session.blocks.forEach(block => {
        block.exercises.forEach(ex => delete ex._rawSuperSerie);
      });
    })
  );

  return Object.values(routinesMap);
}

