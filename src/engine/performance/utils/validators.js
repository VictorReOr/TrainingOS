import { PERFORMANCE_CONFIG } from '../performanceConfig.js';

/**
 * Normaliza y valida el PerformanceInput.
 * Rellena valores por defecto donde faltan datos.
 * NUNCA lanza errores — siempre devuelve un input válido
 * con un score de completitud de datos.
 *
 * @param {Object} input - PerformanceInput DTO (puede ser parcial o null)
 * @returns {Object} Input validado y normalizado con _dataCompleteness
 */
export function validateAndNormalize(input) {
  const signals = { total: 0, present: 0 };

  const track = (value, weight = 1) => {
    signals.total += weight;
    if (value !== null && value !== undefined) signals.present += weight;
    return value;
  };

  const hasHistory = track(
    input?.exerciseHistory?.length > 0 ? true : null,
    0.20
  );
  const hasRPE = trackRPEPresence(input?.exerciseHistory, signals);
  const hasRIR = trackRIRPresence(input?.exerciseHistory, signals);
  const hasVelocity = trackVelocityPresence(input?.exerciseHistory, signals);
  const hasQuality = trackQualityPresence(input?.exerciseHistory, signals);
  const hasWellbeing = track(input?.wellbeing ?? null, 0.15);
  const hasMesocycle = track(input?.currentMesocycle ?? null, 0.10);
  const hasSessionPlan = track(input?.sessionPlan ?? null, 0.05);

  return {
    athlete: normalizeAthlete(input?.athlete),
    currentMesocycle: input?.currentMesocycle ?? null,
    exerciseHistory: normalizeHistory(input?.exerciseHistory ?? []),
    wellbeing: normalizeWellbeing(input?.wellbeing),
    sessionPlan: input?.sessionPlan ?? null,
    _signals: signals,
    _dataCompleteness: signals.total > 0
      ? Math.min(signals.present / signals.total, 1)
      : 0
  };
}

// ─────────────────────────────────────────
// Tracking helpers
// ─────────────────────────────────────────

function trackRPEPresence(history, signals) {
  signals.total += 0.15;
  if (!Array.isArray(history) || history.length === 0) return null;
  const allSets = history.flatMap(ex =>
    ex.sessions?.flatMap(s => s.sets ?? []) ?? []
  );
  if (allSets.length === 0) return null;
  const withRPE = allSets.filter(s => s.rpe !== null && s.rpe !== undefined);
  const ratio = withRPE.length / allSets.length;
  if (ratio > 0.5) { signals.present += 0.15; return true; }
  return null;
}

function trackRIRPresence(history, signals) {
  signals.total += 0.15;
  if (!Array.isArray(history) || history.length === 0) return null;
  const allSets = history.flatMap(ex =>
    ex.sessions?.flatMap(s => s.sets ?? []) ?? []
  );
  if (allSets.length === 0) return null;
  const withRIR = allSets.filter(s => s.rir !== null && s.rir !== undefined);
  const ratio = withRIR.length / allSets.length;
  if (ratio > 0.5) { signals.present += 0.15; return true; }
  return null;
}

function trackVelocityPresence(history, signals) {
  signals.total += 0.10;
  if (!Array.isArray(history) || history.length === 0) return null;
  const allSets = history.flatMap(ex =>
    ex.sessions?.flatMap(s => s.sets ?? []) ?? []
  );
  if (allSets.length === 0) return null;
  const withVel = allSets.filter(s => s.perceivedVelocity != null);
  const ratio = withVel.length / allSets.length;
  if (ratio > 0.30) { signals.present += 0.10; return true; }
  return null;
}

function trackQualityPresence(history, signals) {
  signals.total += 0.10;
  if (!Array.isArray(history) || history.length === 0) return null;
  const allSets = history.flatMap(ex =>
    ex.sessions?.flatMap(s => s.sets ?? []) ?? []
  );
  if (allSets.length === 0) return null;
  const withQual = allSets.filter(s => s.technicalQuality != null);
  const ratio = withQual.length / allSets.length;
  if (ratio > 0.30) { signals.present += 0.10; return true; }
  return null;
}

// ─────────────────────────────────────────
// Normalization helpers
// ─────────────────────────────────────────

function normalizeAthlete(athlete) {
  return {
    id: athlete?.id ?? 'unknown',
    age: athlete?.age ?? null,
    weight: athlete?.weight ?? null,
    height: athlete?.height ?? null,
    experience: athlete?.experience ?? 'intermediate',
    objective: athlete?.objective ?? 'hypertrophy',
    sport: athlete?.sport ?? 'gym',
    weeklyAvailability: athlete?.weeklyAvailability ?? 4,
    maxSessionDuration: athlete?.maxSessionDuration ?? 90
  };
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.map(ex => ({
    exerciseId: ex.exerciseId ?? ex.id ?? '',
    exerciseName: ex.exerciseName ?? ex.name ?? '',
    pattern: ex.pattern ?? 'knee_dominant',
    systemicCost: ex.systemicCost ??
      PERFORMANCE_CONFIG.fatigue.defaultExerciseCost,
    sportTransfer: ex.sportTransfer ?? 5,
    sessions: Array.isArray(ex.sessions)
      ? ex.sessions.map(s => ({
          date: s.date ?? new Date().toISOString(),
          sets: Array.isArray(s.sets) ? s.sets.map(normalizeSet) : []
        }))
      : []
  }));
}

function normalizeSet(set) {
  // RIR prioritario sobre RPE
  let rir = set.rir ?? null;
  if (rir === null && set.rpe != null) {
    // Conversión RPE → RIR usando tabla de config
    const rpeMap = PERFORMANCE_CONFIG.rpeToRir;
    const rpeRounded = Math.round(set.rpe);
    rir = rpeMap[rpeRounded] ?? null;
  }

  return {
    load: set.load ?? set.carga ?? 0,
    reps: parseInt(set.reps) || 0,
    rir,
    rpe: set.rpe ?? null,
    perceivedVelocity: set.perceivedVelocity ?? set.velocidad ?? null,
    technicalQuality: set.technicalQuality ?? set.calidadTecnica ?? null,
    done: set.done ?? false
  };
}

function normalizeWellbeing(wellbeing) {
  if (!wellbeing) return null;
  return {
    sleep: clampScore(wellbeing.sleep ?? 3),
    stress: clampScore(wellbeing.stress ?? 3),
    energy: clampScore(wellbeing.energy ?? 3),
    muscleSoreness: clampScore(wellbeing.muscleSoreness ?? 3),
    bodyWeight: wellbeing.bodyWeight ?? null
  };
}

function clampScore(value) {
  return Math.max(1, Math.min(5, Number(value) || 3));
}
