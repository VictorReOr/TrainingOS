/**
 * TrainingOS — Sugerencia dinámica de cargas
 *
 * Calcula el peso recomendado para un ejercicio basándose en:
 *   1. El mejor 1RM histórico del atleta para ese ejercicio (PRContext)
 *   2. El porcentaje del 1RM según las repeticiones objetivo prescritas
 *   3. Un ajuste por fatiga reciente (RPE medio de las últimas 3 sesiones)
 *
 * @module utils/loadSuggestion
 */

// ─── Tabla de porcentajes 1RM según repeticiones objetivo ─────────────────────
const REP_PERCENTAGE_TABLE = [
  { maxReps: 1,  pct: 0.95 },
  { maxReps: 2,  pct: 0.90 },
  { maxReps: 3,  pct: 0.87 },
  { maxReps: 5,  pct: 0.83 },
  { maxReps: 6,  pct: 0.80 },
  { maxReps: 8,  pct: 0.75 },
  { maxReps: 10, pct: 0.70 },
  { maxReps: 12, pct: 0.67 },
  { maxReps: 15, pct: 0.62 },
];

const DEFAULT_PCT = 0.55; // reps > 15

// ─── Tabla de ajuste por fatiga (RPE medio) ──────────────────────────────────
const FATIGUE_ADJUSTMENTS = [
  { minRPE: 8.5, factor: 0.85 }, // Reducir 15%
  { minRPE: 8.0, factor: 0.90 }, // Reducir 10%
  { minRPE: 7.0, factor: 0.95 }, // Reducir 5%
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Parsea un valor de repeticiones que puede venir como número, string,
 * rango ("8-12"), o con texto ("Al fallo-1", "10/lado").
 * Devuelve el número entero inferior o null si no aplica.
 */
function parseReps(repsVal) {
  if (typeof repsVal === 'number') return repsVal > 0 ? repsVal : null;
  if (!repsVal || typeof repsVal !== 'string') return null;

  let clean = repsVal.trim().toLowerCase();

  // Descartar ejercicios sin repeticiones numéricas
  if (clean.includes('fallo')) return null;

  // Rangos: tomar el límite inferior (ej. "8" de "8-12")
  if (clean.includes('-')) {
    clean = clean.split('-')[0].trim();
  }

  // Lateralizados: "10/lado" → 10
  if (clean.includes('/')) {
    clean = clean.split('/')[0].trim();
  }

  const num = parseInt(clean, 10);
  return isNaN(num) || num <= 0 ? null : num;
}

/**
 * Devuelve el porcentaje del 1RM correspondiente a las repeticiones objetivo.
 */
function getPercentageForReps(reps) {
  for (const entry of REP_PERCENTAGE_TABLE) {
    if (reps <= entry.maxReps) return entry.pct;
  }
  return DEFAULT_PCT;
}

/**
 * Devuelve el factor de ajuste por fatiga según el RPE medio.
 * Si el RPE es inferior a 7 → sin ajuste (factor 1.0).
 */
function getFatigueFactor(avgRPE) {
  for (const entry of FATIGUE_ADJUSTMENTS) {
    if (avgRPE > entry.minRPE) return entry.factor;
  }
  // La tabla de ajustes tiene minRPE 7.0 como mínimo.
  // Si avgRPE es exactamente 7.0, entra en la condición avgRPE > 7.0 → false,
  // así que verificamos el rango 7-8 explícitamente.
  if (avgRPE >= 7.0) return 0.95;
  return 1.0;
}

// ─── Función principal ───────────────────────────────────────────────────────

/**
 * Sugiere la carga recomendada para un ejercicio.
 *
 * @param {string}       exerciseId  — ID del ejercicio
 * @param {number|string} targetReps — Repeticiones objetivo prescritas
 * @param {Array}         prs        — Array de PRs del atleta (de PRContext)
 * @param {Array}         sessionLogs — Array de logs de sesión completados (de localStorage)
 * @returns {{ load: number, oneRM: number, pct: number, fatigueFactor: number, avgRPE: number|null } | null}
 */
export function suggestLoad(exerciseId, targetReps, prs, sessionLogs) {
  // ── PASO 1: Obtener 1RM actual ─────────────────────────────────────────────
  const exercisePRs = (prs || []).filter(pr => pr.exerciseId === exerciseId);
  if (exercisePRs.length === 0) return null;

  const bestPR = exercisePRs.reduce((max, pr) =>
    pr.valor > max.valor ? pr : max
  );
  const oneRM = bestPR.valor;
  if (!oneRM || oneRM <= 0) return null;

  // ── PASO 2: Calcular % del 1RM según reps objetivo ─────────────────────────
  const reps = parseReps(targetReps);
  if (reps === null) return null; // Ejercicio sin reps (solo duración) → sin sugerencia

  const pct = getPercentageForReps(reps);
  let suggested = oneRM * pct;

  // ── PASO 3: Ajuste por fatiga reciente ─────────────────────────────────────
  // Buscar las últimas 3 sesiones que contengan este ejercicio
  const recentExerciseLogs = [];
  const logs = sessionLogs || [];

  for (let i = 0; i < logs.length && recentExerciseLogs.length < 3; i++) {
    const log = logs[i];
    const exInLog = (log.ejercicios || []).find(e => e.id === exerciseId);
    if (exInLog && exInLog.seriesLog && exInLog.seriesLog.length > 0) {
      recentExerciseLogs.push(exInLog);
    }
  }

  let avgRPE = null;
  let fatigueFactor = 1.0;

  if (recentExerciseLogs.length > 0) {
    const rpes = recentExerciseLogs.flatMap(ex =>
      (ex.seriesLog || [])
        .map(set => parseFloat(set.rpe))
        .filter(v => !isNaN(v) && v > 0)
    );

    if (rpes.length > 0) {
      avgRPE = rpes.reduce((a, b) => a + b, 0) / rpes.length;
      fatigueFactor = getFatigueFactor(avgRPE);
      suggested *= fatigueFactor;
    }
  }

  // Redondear al entero más cercano (mínimo 0)
  const load = Math.max(0, Math.round(suggested));

  return {
    load,
    oneRM: Math.round(oneRM),
    pct: Math.round(pct * 100),
    fatigueFactor,
    avgRPE: avgRPE !== null ? Math.round(avgRPE * 10) / 10 : null,
  };
}

/**
 * Sobrecarga Progresiva Automática
 * Sugiere la carga para una serie específica basándose en el historial real del atleta.
 * Regla: +5% si el RPE fue < 10. Si el RPE fue 10, se mantiene el peso.
 * Redondeo al múltiplo de 1.25kg más cercano.
 * 
 * @param {string} exerciseName - Nombre del ejercicio para buscar en el historial
 * @param {number} setIndex - Índice de la serie (0 para la primera serie)
 * @param {Array} sessionLogs - Array de logs de sesión completados
 * @returns {{ suggestedLoad: number, reason: string, previousLoad: number, previousRpe: number } | null}
 */
export function suggestProgressiveOverload(exerciseName, setIndex, sessionLogs) {
  if (!sessionLogs || sessionLogs.length === 0) return null;

  // 1. Buscar la última vez que hizo este ejercicio
  let lastLog = null;
  let lastSetLog = null;

  // sessionLogs suelen venir ordenados del más reciente al más antiguo, o al revés.
  // Asumiremos que están ordenados cronológicamente (más antiguo al principio),
  // por lo que iteramos hacia atrás para encontrar la más reciente.
  for (let i = sessionLogs.length - 1; i >= 0; i--) {
    const session = sessionLogs[i];
    // Buscar si el ejercicio está en esta sesión (comparando por nombre en minúsculas)
    const exInLog = (session.ejercicios || []).find(e => 
      e.name?.toLowerCase().trim() === exerciseName?.toLowerCase().trim()
    );

    if (exInLog && exInLog.seriesLog && exInLog.seriesLog[setIndex]) {
      lastLog = session;
      lastSetLog = exInLog.seriesLog[setIndex];
      break;
    }
  }

  if (!lastSetLog) return null; // No hay historial para esta serie

  const prevLoad = parseFloat(lastSetLog.carga);
  const prevRpe = parseFloat(lastSetLog.rpe);

  if (isNaN(prevLoad) || prevLoad <= 0) return null; // Sin carga anterior válida

  let suggestedLoad = prevLoad;
  let reason = '';

  if (isNaN(prevRpe) || prevRpe < 10) {
    // Sobrecarga del 5%
    suggestedLoad = prevLoad * 1.05;
    reason = '+5%';
  } else {
    // RPE 10 (Fallo) - Mantenemos peso
    suggestedLoad = prevLoad;
    reason = 'Mantenido (RPE 10)';
  }

  // Redondear al múltiplo de 1.25 más cercano
  suggestedLoad = Math.round(suggestedLoad / 1.25) * 1.25;

  return {
    suggestedLoad,
    reason,
    previousLoad: prevLoad,
    previousRpe: prevRpe
  };
}
