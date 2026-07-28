import { PERFORMANCE_CONFIG } from '../performanceConfig.js';

/**
 * Computes the Recovery Index (IR).
 *
 * Concept: How recovered is the athlete TODAY to train?
 * Combines subjective wellbeing signals (sleep, stress, energy,
 * soreness) with rest days since last session.
 *
 * @param {Object} input  - Validated PerformanceInput
 * @param {Object} config - PERFORMANCE_CONFIG (injectable for testing)
 * @returns {Object} IndexResult { value, normalized, label, trend, detail, inputs }
 */
export function computeRecoveryIndex(input, config = PERFORMANCE_CONFIG) {
  const cfg = config.recovery;
  const wb = input.wellbeing;

  if (!wb) {
    // No check-in today: return a moderate default
    return {
      value: 60,
      normalized: 0.6,
      label: 'Sin datos',
      trend: 'stable',
      detail: 'No hay check-in de bienestar hoy. ' +
        'Registra tu estado para mejorar las sugerencias.',
      inputs: { wellbeing: null }
    };
  }

  // Normalize 1-5 → 0-1
  const norm = x => (x - 1) / 4;

  // Stress and soreness are inverted (5 = worst)
  const sleepScore    = norm(wb.sleep);
  const stressScore   = norm(6 - wb.stress);
  const energyScore   = norm(wb.energy);
  const sorenessScore = norm(6 - wb.muscleSoreness);

  // Days since last session
  const restScore = computeRestScore(input.exerciseHistory, cfg);

  const IR =
    cfg.weights.sleep              * sleepScore +
    cfg.weights.stress             * stressScore +
    cfg.weights.energy             * energyScore +
    cfg.weights.muscleSoreness     * sorenessScore +
    cfg.weights.daysSinceLastSession * restScore;

  // Clamp to [0, 1]
  const normalized = Math.max(0, Math.min(1, IR));
  const value = Math.round(normalized * 100);

  const label =
    normalized >= cfg.thresholds.excellent ? 'Excelente' :
    normalized >= cfg.thresholds.good      ? 'Bueno' :
    normalized >= cfg.thresholds.moderate  ? 'Moderado' : 'Bajo';

  // Weight loss alert
  const weightAlert = checkWeightAlert(wb, cfg);

  const detail = weightAlert
    ? weightAlert
    : `Recuperación ${label.toLowerCase()}. ` +
      `Sueño: ${wb.sleep}/5 · ` +
      `Estrés: ${wb.stress}/5 · ` +
      `Energía: ${wb.energy}/5`;

  return {
    value,
    normalized,
    label,
    trend: 'stable',
    detail,
    inputs: {
      sleepScore: Math.round(sleepScore * 100) / 100,
      stressScore: Math.round(stressScore * 100) / 100,
      energyScore: Math.round(energyScore * 100) / 100,
      sorenessScore: Math.round(sorenessScore * 100) / 100,
      restScore: Math.round(restScore * 100) / 100,
      weightAlert
    }
  };
}

// ─────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────

/**
 * Score based on days since last training session.
 * 0 days = trained today (bad)
 * 1 day  = optimal rest
 * 4+ days = slight detraining penalty
 */
function computeRestScore(history, cfg) {
  let lastSessionDate = null;

  for (const ex of history) {
    for (const session of ex.sessions) {
      const d = new Date(session.date);
      if (!lastSessionDate || d > lastSessionDate) {
        lastSessionDate = d;
      }
    }
  }

  if (!lastSessionDate) return 0.8; // no history → assume well rested

  const daysSince = Math.floor(
    (Date.now() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince === 0) return 0.5; // trained today, not fully recovered
  if (daysSince === 1) return 1.0; // optimal
  if (daysSince === 2) return 0.9;
  if (daysSince === 3) return 0.8;
  if (daysSince >= cfg.maxRestDaysPenalty) return 0.6; // detraining risk
  return 0.7;
}

/**
 * Detects rapid weight loss that may indicate nutritional deficit.
 * Currently checks for a direct body weight flag; full 7-day delta
 * comparison will require wellbeing history (Phase 2).
 */
function checkWeightAlert(wb, cfg) {
  // Full implementation requires wellbeing history (Phase 2).
  // Placeholder: return null until history tracking is available.
  return null;
}
