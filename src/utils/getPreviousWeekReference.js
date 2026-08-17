// Helper de normalización para matching de ejercicio en Etapa 2
const normalize = (name) => {
  if (!name) return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
};

/**
 * Busca la serie de referencia de la última vez que se ejecutó
 * la misma plantilla de sesión o ejercicio, serie por índice.
 *
 * @param {Array} allSessionLogs - array completo de trainingos_session_logs
 * @param {string} currentSessionId - sessionId (plantilla) de la sesión activa
 * @param {string} currentInstanceId - instanceId de la sesión activa
 * @param {string} exerciseId - id determinista del ejercicio
 * @param {string} currentLogDateISO - fecha de la sesión activa
 * @param {string} [exerciseName=null] - nombre del ejercicio para matching por fallback normalizado
 * @returns {Array<{ carga: number|string, reps: number|string, rpe: number|string|null, rir: number|string|null } | null>}
 */
export function getPreviousWeekReference(
  allSessionLogs,
  currentSessionId,
  currentInstanceId,
  exerciseId,
  currentLogDateISO,
  exerciseName = null
) {
  if (!Array.isArray(allSessionLogs) || allSessionLogs.length === 0 || !exerciseId) {
    return [];
  }

  const currentDate = currentLogDateISO ? new Date(currentLogDateISO) : new Date();

  // Helper para buscar un ejercicio en una sesión dada (Etapa 1: ID, Etapa 2: Nombre normalizado)
  const findExerciseInLog = (log) => {
    if (!log || !Array.isArray(log.ejercicios)) return null;

    // Etapa 1: Match por ID exacto
    let found = log.ejercicios.find(e => e && e.id === exerciseId);
    if (found) return found;

    // Etapa 2: Match por nombre normalizado (si se proporcionó exerciseName)
    if (exerciseName) {
      const targetNorm = normalize(exerciseName);
      if (targetNorm) {
        found = log.ejercicios.find(e => e && normalize(e.nombre || e.name || '') === targetNorm);
        if (found) return found;
      }
    }

    return null;
  };

  // Filtrar candidatos válidos (anteriores a la fecha activa y excluyendo la instancia activa)
  const validCandidateLogs = allSessionLogs.filter((log) => {
    if (!log) return false;
    if (currentInstanceId && (log.instanceId === currentInstanceId || log.id === currentInstanceId)) {
      return false;
    }
    if (log.fecha) {
      const logDate = new Date(log.fecha);
      if (logDate >= currentDate) return false;
    }
    return true;
  });

  if (validCandidateLogs.length === 0) return [];

  // Ordenar candidatos por fecha descendente (más reciente primero)
  validCandidateLogs.sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));

  // Paso 1: Intentar buscar en las sesiones con la MISMA sessionId (misma plantilla)
  let targetExercise = null;
  if (currentSessionId) {
    const sameTemplateLogs = validCandidateLogs.filter(log => log.sessionId === currentSessionId);
    for (const log of sameTemplateLogs) {
      const ex = findExerciseInLog(log);
      if (ex && Array.isArray(ex.seriesLog) && ex.seriesLog.length > 0) {
        targetExercise = ex;
        break;
      }
    }
  }

  // Paso 2: Fallback — Si no se encontró en la misma plantilla, escanear la sesión anterior MÁS RECIENTE que contenga el ejercicio
  if (!targetExercise) {
    for (const log of validCandidateLogs) {
      const ex = findExerciseInLog(log);
      if (ex && Array.isArray(ex.seriesLog) && ex.seriesLog.length > 0) {
        targetExercise = ex;
        break;
      }
    }
  }

  if (!targetExercise || !Array.isArray(targetExercise.seriesLog) || targetExercise.seriesLog.length === 0) {
    return [];
  }

  return targetExercise.seriesLog.map((s) => {
    if (!s) return null;
    return {
      carga: s.carga ?? null,
      reps: s.reps ?? null,
      rpe: s.rpe ?? null,
      rir: s.rir ?? null,
    };
  });
}
