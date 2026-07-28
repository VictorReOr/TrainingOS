import { PERFORMANCE_CONFIG } from '../performanceConfig.js';
import { exponentialDecay, hoursElapsed } from '../utils/decay.js';

/**
 * Computes the Systemic Fatigue Index (IFS).
 *
 * Concept: How much systemic fatigue has the athlete accumulated
 * over the last N days, weighted by exercise cost, volume,
 * intensity, and temporal decay.
 *
 * @param {Object} input  - Validated PerformanceInput
 * @param {Object} config - PERFORMANCE_CONFIG (injectable for testing)
 * @returns {Object} IndexResult { value, normalized, label, trend, detail, inputs }
 */
export function computeFatigueIndex(input, config = PERFORMANCE_CONFIG) {
  const cfg = config.fatigue;
  const windowMs = cfg.window * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const cutoff = now - windowMs;

  let totalFatigue = 0;
  let sessionCount = 0;

  for (const exercise of input.exerciseHistory) {
    const cost = exercise.systemicCost ?? cfg.defaultExerciseCost;

    for (const session of exercise.sessions) {
      const sessionTime = new Date(session.date).getTime();
      if (sessionTime < cutoff) continue;

      const hours = hoursElapsed(session.date);
      const decay = exponentialDecay(1, hours, cfg.decayHalfLifeHours);

      const doneSets = session.sets.filter(s => s.done);
      if (doneSets.length === 0) continue;

      // Intensity factor weighted average for the session
      const intensityFactor = computeIntensityFactor(doneSets);

      const sessionFatigue = cost * doneSets.length * intensityFactor;
      totalFatigue += sessionFatigue * decay;
      sessionCount++;
    }
  }

  // maxTheoretical: max possible fatigue in the window
  // weeklyAvailability × maxCost(10) × maxSets(5) × maxIntensityFactor(1.3)
  const weeklyAvail = input.athlete.weeklyAvailability ?? 4;
  const maxTheoretical = weeklyAvail * 10 * 5 * 1.3;

  const value = Math.min(100, (totalFatigue / maxTheoretical) * 100);

  const label =
    value >= cfg.thresholds.critical ? 'Crítico' :
    value >= cfg.thresholds.high     ? 'Alto' :
    value >= cfg.thresholds.moderate ? 'Moderado' : 'Bajo';

  return {
    value: Math.round(value),
    normalized: value / 100,
    label,
    trend: 'stable', // Wave 2 will compute trend vs previous week
    detail: `Fatiga acumulada ${label.toLowerCase()} ` +
      `(${sessionCount} sesiones en ${cfg.window} días)`,
    inputs: {
      totalFatigue: Math.round(totalFatigue * 10) / 10,
      sessionCount,
      maxTheoretical: Math.round(maxTheoretical * 10) / 10
    }
  };
}

// ─────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────

/**
 * Computes the average intensity factor for a set of completed sets.
 * RIR is prioritized over RPE.
 * Returns a multiplier: 0.7 (easy) | 1.0 (moderate) | 1.3 (hard)
 */
function computeIntensityFactor(sets) {
  const factors = sets.map(set => {
    if (set.rir !== null && set.rir !== undefined) {
      return set.rir <= 1 ? 1.3 :
             set.rir <= 2 ? 1.0 : 0.7;
    }
    if (set.rpe !== null && set.rpe !== undefined) {
      return set.rpe > 8 ? 1.3 :
             set.rpe > 7 ? 1.0 : 0.7;
    }
    return 1.0; // conservative default when no intensity data
  });

  return factors.reduce((a, b) => a + b, 0) / factors.length;
}
