/**
 * mergeSessionLogs.js — Utilidad pura para fusionar y desduplicar logs de sesión.
 *
 * Combina logs locales (trainingos_session_logs) con registros remotos de Sheets (getLogs).
 * Deduplica por clave compuesta `${sessionId || 'remote'}_${fecha_YYYY_MM_DD}`,
 * priorizando la versión local en caso de conflicto.
 *
 * @param {Array<Object>} localLogs - Lista de logs guardados en localStorage
 * @param {Array<Object>} remoteRows - Lista de registros recuperados de Sheets API
 * @returns {Array<Object>} Array fusionado y ordenado por fecha descendente
 */
export function mergeSessionLogs(localLogs = [], remoteRows = []) {
  const safeLocal = Array.isArray(localLogs) ? localLogs : [];
  const safeRemote = Array.isArray(remoteRows) ? remoteRows : [];

  const mergedMap = new Map();
  const localKeys = new Set();

  const getDateKey = (dateStr) => {
    if (!dateStr) return 'sin-fecha';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'sin-fecha';
      return d.toISOString().substring(0, 10);
    } catch {
      return 'sin-fecha';
    }
  };

  // 1. Agregar logs locales al mapa y registrar sus claves únicas
  safeLocal.forEach(log => {
    if (!log) return;
    const dateKey = getDateKey(log.fecha);
    const sessionKey = `${log.sessionId || 'custom'}_${dateKey}`;
    
    localKeys.add(sessionKey);
    if (log.id) localKeys.add(log.id);

    const mapKey = log.id || sessionKey;
    mergedMap.set(mapKey, log);
  });

  // 2. Procesar registros remotos de Sheets
  const remoteGrouped = new Map();

  safeRemote.forEach(row => {
    if (!row) return;

    // Si ya es un objeto de sesión completo
    if (row.ejercicios && Array.isArray(row.ejercicios)) {
      const dateKey = getDateKey(row.fecha);
      const sessionKey = `${row.sessionId || 'remote'}_${dateKey}`;
      
      // Si no existe localmente, añadirlo
      if (!localKeys.has(sessionKey) && !localKeys.has(row.id)) {
        mergedMap.set(row.id || sessionKey, row);
      }
      return;
    }

    // Si es una fila plana de la tabla 'logs' de Sheets
    const dateKey = getDateKey(row.fecha);
    const sId = row.session_id || row.sessionId || 'remote-session';
    const groupKey = `${sId}_${dateKey}`;

    // Si la sesión ya existe en local, gana la local (no procesar fila remota)
    if (localKeys.has(groupKey) || (row.id && localKeys.has(row.id))) {
      return;
    }

    if (!remoteGrouped.has(groupKey)) {
      remoteGrouped.set(groupKey, {
        id: `remote-log-${dateKey}-${sId}`,
        fecha: row.fecha || new Date().toISOString(),
        sessionId: sId,
        sessionName: 'Sesión Registrada',
        durationMinutes: 45,
        rpe: parseFloat(row.rpe_real) || 7,
        volumenTotal: 0,
        ejerciciosMap: new Map(),
      });
    }

    const sess = remoteGrouped.get(groupKey);
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
      reps: parseInt(row.reps) || 0,
      rpe: row.rpe_real != null ? parseFloat(row.rpe_real) : null,
      done: row.completado === 1 || row.completado === '1' || row.completado === true,
    });
  });

  // Convertir sesiones agrupadas remotas y añadirlas al mapa
  remoteGrouped.forEach((sess, groupKey) => {
    if (localKeys.has(groupKey)) return;

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

    mergedMap.set(sess.id, sessionObj);
  });

  const result = Array.from(mergedMap.values());
  result.sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
  return result;
}

