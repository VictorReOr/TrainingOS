import { EXERCISE_LIBRARY } from '../data/exerciseLibrary.js';
import { getCoachOverrides } from '../data/exerciseMetadata.js';
import { humanizeExerciseSlug } from './exerciseNaming.js';

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

/**
 * Resuelve el nombre legible de un ejercicio a partir de su ID.
 * Cadena de prioridad: EXERCISE_LIBRARY → coach overrides (displayName) → humanizeExerciseSlug.
 *
 * @param {string} exId
 * @returns {string}
 */
function resolveExerciseName(exId) {
  if (!exId) return 'Ejercicio desconocido';

  // 1. Buscar en la librería estática
  const libEntry = EXERCISE_LIBRARY.find(e => e.id === exId);
  if (libEntry?.name) return libEntry.name;

  // 2. Buscar en overrides del coach (displayName)
  const overrides = getCoachOverrides();
  if (overrides[exId]?.displayName) return overrides[exId].displayName;

  // 3. Fallback: humanizar el slug (custom-press-banca → "Press Banca")
  return humanizeExerciseSlug(exId);
}

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
        nombre: resolveExerciseName(exId), // FIX: era `nombre: exId` — causaba nombres corruptos en sesiones remotas
        seriesLog: [],
      });
    }

    const ex = sess.ejerciciosMap.get(exId);
    const cargaNum = parseFloat(row.carga_real ?? row.carga);
    const repsNum = parseFloat(row.reps);
    ex.seriesLog.push({
      carga: parseFloat(row.carga_real) || 0,
      reps: parseInt(row.reps) || 5,
      rpe: row.rpe_real || null,
      done: (cargaNum > 0 && repsNum > 0) || row.completado === 1 || row.completado === '1' || row.completado === true || String(row.completado).toLowerCase() === 'true',
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

// ---------------------------------------------------------------------------
// window.repairCorruptExerciseNames — Utilidad DevTools (NO se auto-ejecuta)
//
// Repara nombres corruptos (nombre === id) ya contaminados en localStorage:
//   trainingos_session_logs  → ejercicios[].nombre
//   trainingos_prs           → entries[].nombre (si existe el campo)
//
// Uso:
//   window.repairCorruptExerciseNames()
// ---------------------------------------------------------------------------
if (typeof window !== 'undefined') {
  window.repairCorruptExerciseNames = function () {
    let sessionsFixed = 0;
    let prsFixed = 0;

    // --- 1. Reparar trainingos_session_logs ---
    try {
      const raw = localStorage.getItem('trainingos_session_logs');
      if (raw) {
        const logs = JSON.parse(raw);
        let dirty = false;
        logs.forEach(session => {
          if (!Array.isArray(session.ejercicios)) return;
          session.ejercicios.forEach(ex => {
            if (ex.nombre === ex.id) {
              const resolved = resolveExerciseName(ex.id);
              if (resolved !== ex.id) {
                ex.nombre = resolved;
                dirty = true;
                sessionsFixed++;
              }
            }
          });
        });
        if (dirty) {
          localStorage.setItem('trainingos_session_logs', JSON.stringify(logs));
        }
      }
    } catch (e) {
      console.error('[repairCorruptExerciseNames] Error en session_logs:', e);
    }

    // --- 2. Reparar trainingos_prs ---
    try {
      const raw = localStorage.getItem('trainingos_prs');
      if (raw) {
        const prs = JSON.parse(raw);
        let dirty = false;
        // prs puede ser { [exId]: { exerciseName, ... } } o Array — manejar ambos
        const entries = Array.isArray(prs) ? prs : Object.values(prs);
        entries.forEach(entry => {
          if (entry.exerciseName && entry.exerciseId && entry.exerciseName === entry.exerciseId) {
            const resolved = resolveExerciseName(entry.exerciseId);
            if (resolved !== entry.exerciseId) {
              entry.exerciseName = resolved;
              dirty = true;
              prsFixed++;
            }
          }
        });
        if (dirty) {
          localStorage.setItem('trainingos_prs', JSON.stringify(prs));
        }
      }
    } catch (e) {
      console.error('[repairCorruptExerciseNames] Error en prs:', e);
    }

    // --- 3. Notificar a los listeners de sesión ---
    window.dispatchEvent(new Event('session_logs_updated'));

    console.log(
      `[repairCorruptExerciseNames] ✅ Completado — ` +
      `${sessionsFixed} ejercicios en session_logs reparados, ` +
      `${prsFixed} entradas en prs reparadas.`
    );

    return { sessionsFixed, prsFixed };
  };
}
