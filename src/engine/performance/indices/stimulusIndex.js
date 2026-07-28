import { PERFORMANCE_CONFIG } from '../performanceConfig.js';

/**
 * Computes the Muscle Stimulus Index (IEM).
 *
 * Concept: Are we generating sufficient effective training stimulus
 * per movement pattern over the last 7 days?
 * Only "effective sets" (close to failure, good technique) count.
 *
 * @param {Object} input  - Validated PerformanceInput
 * @param {Object} config - PERFORMANCE_CONFIG (injectable for testing)
 * @returns {Object} IndexResult { value, normalized, label, trend, detail, inputs }
 */
export function computeStimulusIndex(input, config = PERFORMANCE_CONFIG) {
  const cfg = config.stimulus;
  const windowMs = 7 * 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - windowMs;

  // Initialize effective set counts for all tracked patterns
  const effectiveSets = {};
  for (const pattern of config.patternBalance.patterns) {
    effectiveSets[pattern] = 0;
  }

  for (const exercise of input.exerciseHistory) {
    const pattern = exercise.pattern;
    // Skip cardio — not relevant for strength stimulus
    if (!pattern || pattern === 'cardio') continue;
    // Skip patterns not tracked for stimulus balance
    if (!(pattern in effectiveSets)) continue;

    for (const session of exercise.sessions) {
      if (new Date(session.date).getTime() < cutoff) continue;

      for (const set of session.sets) {
        if (!set.done) continue;
        if (!isEffectiveSet(set, cfg)) continue;
        effectiveSets[pattern] += 1;
      }
    }
  }

  // Coverage per pattern: actual effective sets vs weekly minimum target
  const coverages = {};
  const targets = cfg.weeklyTargets;

  for (const [pattern, count] of Object.entries(effectiveSets)) {
    const target = targets[pattern];
    if (!target) continue;
    // Cap at 1.5 to prevent one dominant pattern masking deficits elsewhere
    coverages[pattern] = Math.min(count / target.min, 1.5);
  }

  const coverageValues = Object.values(coverages);
  const avgCoverage = coverageValues.length > 0
    ? coverageValues.reduce((a, b) => a + b, 0) / coverageValues.length
    : 0;

  const value = Math.round(Math.min(avgCoverage * 100, 100));

  // Per-pattern detail string
  const detail = Object.entries(effectiveSets)
    .filter(([p]) => targets[p])
    .map(([p, count]) => {
      const target = targets[p].min;
      const pct = Math.round((count / target) * 100);
      const icon = pct >= 100 ? '✅' : pct >= 60 ? '⚠️' : '❌';
      return `${formatPattern(p)}: ${count}/${target} ${icon}`;
    })
    .join(' | ');

  return {
    value,
    normalized: value / 100,
    label:
      value >= 80 ? 'Óptimo' :
      value >= 60 ? 'Adecuado' :
      value >= 40 ? 'Bajo' : 'Insuficiente',
    trend: 'stable',
    detail: detail || 'Sin series efectivas registradas esta semana.',
    inputs: { effectiveSets, coverages }
  };
}

// ─────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────

/**
 * A set is "effective" if it is performed close to failure
 * AND meets the minimum technical quality threshold.
 * RIR is prioritized over RPE.
 */
function isEffectiveSet(set, cfg) {
  const meetsQuality =
    set.technicalQuality === null ||
    set.technicalQuality === undefined ||
    set.technicalQuality >= cfg.minTechnicalQuality;

  if (!meetsQuality) return false;

  // RIR check (priority)
  if (set.rir !== null && set.rir !== undefined) {
    return set.rir <= cfg.effectiveSetRIR;
  }

  // RPE fallback
  if (set.rpe !== null && set.rpe !== undefined) {
    return set.rpe >= cfg.effectiveSetRPE;
  }

  // No intensity data → cannot confirm effectiveness
  return false;
}

/**
 * Human-readable pattern labels for the detail string.
 */
function formatPattern(pattern) {
  const labels = {
    push_horizontal: 'Empuje H',
    push_vertical:   'Empuje V',
    pull_horizontal: 'Tracción H',
    pull_vertical:   'Tracción V',
    knee_dominant:   'Rodilla',
    hip_dominant:    'Cadera',
    rotation:        'Rotación',
    anti_rotation:   'Anti-rot',
    unilateral:      'Unilateral',
    core:            'Core'
  };
  return labels[pattern] || pattern;
}
