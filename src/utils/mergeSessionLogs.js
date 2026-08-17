/**
 * mergeSessionLogs.js — Utilidad pura para fusionar y desduplicar logs de sesión.
 *
 * Combina logs locales (trainingos_session_logs) con registros remotos de Sheets (getLogs).
 * Deduplica por 'id' o combinación determinista 'fecha + exerciseId', priorizando la entrada más reciente.
 *
 * @param {Array<Object>} localLogs - Lista de logs guardados en localStorage
 * @param {Array<Object>} remoteRows - Lista de registros recuperados de Sheets API
 * @returns {Array<Object>} Array fusionado y ordenado por fecha descendente
 */
export function mergeSessionLogs(localLogs = [], remoteRows = []) {
  const safeLocal = Array.isArray(localLogs) ? localLogs : [];
  const safeRemote = Array.isArray(remoteRows) ? remoteRows : [];

  const mergedMap = new Map();

  // 1. Agregar logs locales al mapa
  safeLocal.forEach(log => {
    if (!log) return;
    const key = log.id || `${log.fecha}-${log.sessionId || 'session'}`;
    mergedMap.set(key, log);
  });

  // 2. Si los registros remotos son filas planas de la tabla 'logs' de Sheets:
  // { id, exercise_id, atleta_id, fecha, carga_real, rpe_real, completado }
  // Agruparlos por fecha en objetos de sesión compatibles
  const remoteGrouped = new Map();

  safeRemote.forEach(row => {
    if (!row) return;

    // Si ya es un objeto de sesión completo
    if (row.ejercicios && Array.isArray(row.ejercicios)) {
      const key = row.id || `${row.fecha}-${row.sessionId || 'session'}`;
      if (!mergedMap.has(key)) {
        mergedMap.set(key, row);
      }
      return;
    }

    // Si es una fila plana de la tabla 'logs' de Sheets
    const dateKey = row.fecha ? new Date(row.fecha).toISOString().substring(0, 10) : 'sin-fecha';
    if (!remoteGrouped.has(dateKey)) {
      remoteGrouped.set(dateKey, {
        id: `remote-log-${dateKey}`,
        fecha: row.fecha || new Date().toISOString(),
        sessionId: 'remote-session',
        sessionName: 'Sesión Remota (Sheets)',
        durationMinutes: 45,
        rpe: row.rpe_real || 7,
        volumenTotal: 0,
        ejerciciosMap: new Map(),
      });
    }

    const sess = remoteGrouped.get(dateKey);
    const exId = row.exercise_id || row.exerciseId || 'ejercicio-desconocido';

    if (!sess.ejerciciosMap.has(exId)) {
      sess.ejerciciosMap.set(exId, {
        id: exId,
        nombre: exId,
        seriesLog: [],
      });
    }

    const ex = sess.ejerciciosMap.get(exId);
    ex.seriesLog.push({
      carga: parseFloat(row.carga_real) || 0,
      reps: parseInt(row.reps) || 5,
      rpe: row.rpe_real || null,
      done: row.completado === 1 || row.completado === '1' || row.completado === true,
    });
  });

  // Convertir sesiones agrupadas remotas y añadirlas si no están duplicadas
  remoteGrouped.forEach((sess, dateKey) => {
    const ejercicios = Array.from(sess.ejerciciosMap.values());
    const sessionObj = {
      id: sess.id,
      fecha: sess.fecha,
      sessionId: sess.sessionId,
      sessionName: sess.sessionName,
      durationMinutes: sess.durationMinutes,
      rpe: sess.rpe,
      volumenTotal: 0,
      ejercicios: ejercicios,
    };

    // Verificar si ya existe un log local en la misma fecha con los mismos ejercicios
    const existsInLocal = Array.from(mergedMap.values()).some(local => {
      if (!local.fecha) return false;
      const localDateKey = new Date(local.fecha).toISOString().substring(0, 10);
      return localDateKey === dateKey;
    });

    if (!existsInLocal) {
      mergedMap.set(sess.id, sessionObj);
    }
  });

  const result = Array.from(mergedMap.values());
  result.sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
  return result;
}
