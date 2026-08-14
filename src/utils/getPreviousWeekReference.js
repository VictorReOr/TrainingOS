/**
 * Busca la serie de referencia de la última vez que se ejecutó
 * la misma plantilla de sesión, serie por índice.
 *
 * @param {Array} allSessionLogs - array completo de trainingos_session_logs
 * @param {string} currentSessionId - sessionId (plantilla) de la sesión activa
 * @param {string} currentInstanceId - instanceId de la sesión activa (para excluirla si ya tiene logs parciales)
 * @param {string} exerciseId - id determinista del ejercicio
 * @param {string} currentLogDateISO - fecha de la sesión activa, para buscar solo logs anteriores
 * @returns {Array<{ carga: number|string, reps: number|string, rpe: number|string|null, rir: number|string|null } | null>}
 *          array alineado por índice de serie; null en la posición si no hay referencia para esa serie
 */
export function getPreviousWeekReference(
  allSessionLogs,
  currentSessionId,
  currentInstanceId,
  exerciseId,
  currentLogDateISO
) {
  // CASO BORDE 1: Inputs inválidos o sin logs -> devolver []
  if (!Array.isArray(allSessionLogs) || allSessionLogs.length === 0 || !currentSessionId || !exerciseId) {
    return [];
  }

  const currentDate = currentLogDateISO ? new Date(currentLogDateISO) : new Date();

  // 1. Filtrar logs con el mismo sessionId (misma plantilla), excluyendo la instancia actual, con fecha < currentLogDateISO
  // MANEJO DE INSTANCEID LEGACY:
  // - Si currentInstanceId es null/undefined (sesión activa legacy), la condición `currentInstanceId && ...` es falsa,
  //   evitando comparar `null === null`. La exclusión de sesiones no deseadas recae de forma segura en `logDate < currentDate`.
  // - Si un log histórico no tiene `instanceId` (null/undefined), `log.instanceId === currentInstanceId` devolverá false,
  //   por lo que el log histórico NO es excluido erróneamente y se mantiene como candidato.
  const previousLogs = allSessionLogs.filter((log) => {
    if (!log || !log.sessionId) return false;
    if (log.sessionId !== currentSessionId) return false;

    if (currentInstanceId && (log.instanceId === currentInstanceId || log.id === currentInstanceId)) {
      return false;
    }

    if (log.fecha) {
      const logDate = new Date(log.fecha);
      if (logDate >= currentDate) return false;
    }
    return true;
  });

  // CASO BORDE 1: No hay sesión previa con ese sessionId -> devolver []
  if (previousLogs.length === 0) {
    return [];
  }

  // 2. Ordenar descendente por fecha, tomar el más reciente
  previousLogs.sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
  const lastLog = previousLogs[0];

  // 4. Buscar dentro de ese log el ejercicio cuyo id === exerciseId
  // CASO BORDE 4: Funciona igual para ejercicios con _needsReview: true (custom sin promocionar)
  // ya que el matching se hace strictly por e.id (exercise_id determinista).
  const targetExercise = lastLog.ejercicios?.find((e) => e.id === exerciseId);

  // CASO BORDE 2: El ejercicio es nuevo (no estaba en la sesión anterior) -> devolver []
  if (!targetExercise || !Array.isArray(targetExercise.seriesLog) || targetExercise.seriesLog.length === 0) {
    return [];
  }

  // 6. Devolver su seriesLog mapeado a { carga, reps, rpe, rir } por índice
  // CASO BORDE 3: Si la sesión actual tiene más series que la anterior,
  // los índices que excedan la longitud del seriesLog anterior devolverán undefined/null al acceder por índice.
  const result = targetExercise.seriesLog.map((s) => {
    if (!s) return null;
    return {
      carga: s.carga ?? null,
      reps: s.reps ?? null,
      rpe: s.rpe ?? null,
      rir: s.rir ?? null,
    };
  });

  return result;
}
