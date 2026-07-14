/**
 * TrainingOS — Wrapper de sugerencias de cargas compatible con la versión anterior.
 * Reenvía internamente los cálculos al nuevo motor overloadEngine.js.
 */
import {
  prescribeLoad,
  computeNextSession,
  estimateOneRM,
  roundToPlate,
  parseReps,
  getRPETargetForGoal,
  estimatePMax
} from './overloadEngine';

/**
 * Wrapper de suggestLoad para compatibilidad con la versión anterior.
 * Calcula el peso recomendado usando el nuevo motor de prescripción por Helms.
 */
export function suggestLoad(exerciseId, targetReps, prs, sessionLogs) {
  // Obtener mejor 1RM de los PRs
  const exercisePRs = (prs || []).filter(pr => pr.exerciseId === exerciseId);
  if (exercisePRs.length === 0) return null;

  const bestPR = exercisePRs.reduce((max, pr) => pr.valor > max.valor ? pr : max);
  const oneRM = bestPR.valor;
  if (!oneRM || oneRM <= 0) return null;

  const reps = parseReps(targetReps);
  if (reps === null) return null;

  // Derivar RPE target por defecto (8.0 por defecto para hipertrofia/gym)
  const rpeTarget = 8.0;

  // Prescribir usando Helms
  const prescription = prescribeLoad({ e1RM: oneRM, targetReps: reps, rpeTarget });

  // Calcular fatiga de las últimas 3 sesiones para mantener compatibilidad con factor de fatiga
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
      if (avgRPE > 8.5) fatigueFactor = 0.85;
      else if (avgRPE > 8.0) fatigueFactor = 0.90;
      else if (avgRPE >= 7.0) fatigueFactor = 0.95;
    }
  }

  // Carga final ajustada por fatiga en este fallback
  const finalLoad = roundToPlate(prescription.prescribedLoad * fatigueFactor);

  return {
    load: finalLoad,
    oneRM: Math.round(oneRM),
    pct: prescription.pct1RM,
    fatigueFactor,
    avgRPE: avgRPE !== null ? Math.round(avgRPE * 10) / 10 : null
  };
}

/**
 * Wrapper de suggestProgressiveOverload para compatibilidad.
 * Busca el historial del ejercicio por nombre y llama a computeNextSession.
 */
export function suggestProgressiveOverload(exerciseName, setIndex, sessionLogs) {
  if (!sessionLogs || sessionLogs.length === 0) return null;

  // 1. Extraer historial del ejercicio por nombre
  const exerciseHistory = [];
  let lastSessionExercise = null;

  // Iterar de más recientes a más antiguos
  for (let i = 0; i < sessionLogs.length; i++) {
    const session = sessionLogs[i];
    const ex = (session.ejercicios || []).find(e =>
      e.nombre?.toLowerCase().trim() === exerciseName?.toLowerCase().trim()
    );

    if (ex && ex.seriesLog && ex.seriesLog.length > 0) {
      // Calcular promedio de RPE y carga de la sesión
      const rpes = ex.seriesLog.map(s => parseFloat(s.rpe)).filter(v => !isNaN(v) && v > 0);
      const loads = ex.seriesLog.map(s => parseFloat(s.carga)).filter(v => !isNaN(v) && v > 0);
      const repsList = ex.seriesLog.map(s => parseReps(s.reps)).filter(v => v !== null);

      if (loads.length > 0) {
        const avgLoad = loads.reduce((a, b) => a + b, 0) / loads.length;
        const avgRPE = rpes.length > 0 ? rpes.reduce((a, b) => a + b, 0) / rpes.length : 8.0;
        const avgReps = repsList.length > 0 ? Math.round(repsList.reduce((a, b) => a + b, 0) / repsList.length) : 8;
        const e1RM = estimateOneRM(avgLoad, avgReps);

        const histEntry = {
          date: session.fecha,
          load: avgLoad,
          avgRPE,
          e1RM,
          reps: avgReps
        };
        exerciseHistory.push(histEntry);

        if (!lastSessionExercise) {
          lastSessionExercise = { ex, session, avgLoad, avgRPE, avgReps, e1RM };
        }
      }
    }
  }

  if (!lastSessionExercise) return null;

  // Revertir para que esté en orden cronológico ascendente para el motor
  exerciseHistory.reverse();

  // Obtener RPE target según tipo de sesión
  const goalConfig = getRPETargetForGoal(lastSessionExercise.session.sessionType || 'gym');
  const rpeTarget = goalConfig.rpeTarget;

  // Calcular usando el nuevo motor
  const result = computeNextSession({
    lastLoad: lastSessionExercise.avgLoad,
    lastAvgRPE: lastSessionExercise.avgRPE,
    rpeTarget,
    targetReps: lastSessionExercise.avgReps,
    e1RM: lastSessionExercise.e1RM,
    athleteLevel: 'intermedio', // default para compatibilidad
    exerciseHistory
  });

  return {
    suggestedLoad: result.nextLoad,
    reason: result.isDeloadSuggested ? 'Descarga (Estancamiento)' : `${result.improvePct >= 0 ? '+' : ''}${result.improvePct}%`,
    previousLoad: lastSessionExercise.avgLoad,
    previousRpe: lastSessionExercise.avgRPE
  };
}

/**
 * Obtiene la sugerencia unificada y desglosada para la UI moderna de sobrecarga.
 */
export function getFullSuggestion({
  exerciseId,
  exerciseName,
  targetReps,
  sessionType,
  prs,
  sessionLogs,
  athleteLevel,
  pMaxOverride = null
}) {
  const reps = parseReps(targetReps) || 8;
  const level = athleteLevel || 'intermedio';

  // 1. Obtener e1RM actual
  const exercisePRs = (prs || []).filter(pr => pr.exerciseId === exerciseId);
  const bestPR = exercisePRs.reduce((max, pr) => pr.valor > max.valor ? pr : max, null);
  const e1RM = bestPR ? bestPR.valor : 0;

  // 2. RPE Target
  const goalConfig = getRPETargetForGoal(sessionType);
  const rpeTarget = goalConfig.rpeTarget;

  // 3. Si no hay e1RM, no se puede hacer mucho, se devuelve low confidence
  if (!e1RM || e1RM <= 0) {
    return {
      prescribedLoad: 0,
      nextSessionLoad: 0,
      rpeTarget,
      pct1RM: 0,
      confidence: 'low',
      reason: 'Sin datos previos'
    };
  }

  // 4. Construir historial de las últimas sesiones para este ejercicio
  const exerciseHistory = [];
  let lastSessionExercise = null;

  const logs = sessionLogs || [];
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    const ex = (log.ejercicios || []).find(e =>
      e.id === exerciseId || e.nombre?.toLowerCase().trim() === exerciseName?.toLowerCase().trim()
    );

    if (ex && ex.seriesLog && ex.seriesLog.length > 0) {
      const rpes = ex.seriesLog.map(s => parseFloat(s.rpe)).filter(v => !isNaN(v) && v > 0);
      const loads = ex.seriesLog.map(s => parseFloat(s.carga)).filter(v => !isNaN(v) && v > 0);
      const repsList = ex.seriesLog.map(s => parseReps(s.reps)).filter(v => v !== null);

      if (loads.length > 0) {
        const avgLoad = loads.reduce((a, b) => a + b, 0) / loads.length;
        const avgRPE = rpes.length > 0 ? rpes.reduce((a, b) => a + b, 0) / rpes.length : 8.0;
        const avgReps = repsList.length > 0 ? Math.round(repsList.reduce((a, b) => a + b, 0) / repsList.length) : reps;
        const sessionE1RM = estimateOneRM(avgLoad, avgReps);

        exerciseHistory.push({
          date: log.fecha,
          load: avgLoad,
          avgRPE,
          e1RM: sessionE1RM,
          reps: avgReps
        });

        if (!lastSessionExercise) {
          lastSessionExercise = { ex, log, avgLoad, avgRPE, avgReps, sessionE1RM };
        }
      }
    }
  }

  exerciseHistory.reverse();

  // 5. Prescribir carga para la sesión de hoy
  const prescription = prescribeLoad({ e1RM, targetReps: reps, rpeTarget });

  // 6. Proyección para la próxima sesión si tuviéramos RPE real
  let nextSessionLoad = prescription.prescribedLoad;
  let overloadResult = null;

  if (lastSessionExercise) {
    overloadResult = computeNextSession({
      lastLoad: lastSessionExercise.avgLoad,
      lastAvgRPE: lastSessionExercise.avgRPE,
      rpeTarget,
      targetReps: reps,
      e1RM,
      athleteLevel: level,
      exerciseHistory,
      pMaxOverride
    });
    nextSessionLoad = overloadResult.nextLoad;
  }

  return {
    prescribedLoad: prescription.prescribedLoad,
    nextSessionLoad,
    rpeTarget,
    pct1RM: prescription.pct1RM,
    e1RM,
    confidence: overloadResult ? overloadResult.confidence : 'low',
    isDeloadSuggested: overloadResult ? overloadResult.isDeloadSuggested : false,
    deloadReason: overloadResult ? overloadResult.deloadReason : null,
    deloadLoad: overloadResult ? overloadResult.deloadLoad : null,
    weeklyImprovePct: overloadResult ? overloadResult.improvePct : 0,
    breakdown: overloadResult ? overloadResult.breakdown : null,
    lastSession: lastSessionExercise ? {
      date: lastSessionExercise.log.fecha,
      load: lastSessionExercise.avgLoad,
      rpe: lastSessionExercise.avgRPE,
      reps: lastSessionExercise.avgReps
    } : null
  };
}
