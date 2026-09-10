import { PERFORMANCE_CONFIG } from '../performanceConfig.js';

/**
 * Sport Transfer Index (ITD)
 *
 * Calcula la transferencia deportiva en función del historial de ejercicios
 * y el perfil del deporte activo del atleta.
 *
 * @param {Object}      input        - PerformanceInput validado
 * @param {Object}      config       - PERFORMANCE_CONFIG
 * @param {Object}      wave1        - { fatigue, recovery, stimulus }
 * @param {Object|null} sportProfile - Perfil del deporte (de getSportProfile()).
 *                                     Si es null, devuelve null (sin índice ITD).
 */
export function computeSportTransferIndex(
  input, config = PERFORMANCE_CONFIG, wave1, sportProfile) {

  // Sin perfil deportivo definido (ej. 'gym' puro) → no hay índice ITD
  if (!sportProfile) return null;

  const cfg = config.sportTransfer;
  const windowMs = cfg.windowWeeks * 7 * 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - windowMs;

  // Inicializar scores por pilar desde el perfil (dinámico, no hardcodeado)
  const pillarScores = {};
  for (const pilar of Object.keys(sportProfile.pillarWeights)) {
    pillarScores[pilar] = 0;
  }

  for (const exercise of input.exerciseHistory) {
    if ((exercise.sportTransfer ?? 0) < cfg.minTransferScore) continue;

    const pillarContrib = derivePillarContribution(
      exercise.pattern, exercise.sportTransfer
    );

    for (const session of exercise.sessions) {
      if (new Date(session.date).getTime() < cutoff) continue;

      const effectiveSets = session.sets.filter(
        s => s.done && isRelevantSet(s)
      ).length;

      if (effectiveSets === 0) continue;

      const qualityFactor = getQualityFactor(session.sets);
      const transferNorm = exercise.sportTransfer / 10;

      for (const pilar of Object.keys(pillarScores)) {
        const contrib = pillarContrib[pilar] ?? 0;
        pillarScores[pilar] +=
          contrib * effectiveSets * qualityFactor * transferNorm;
      }
    }
  }

  // Calcular cobertura por pilar usando targets del perfil
  const pillarCoverage = {};
  for (const [pilar, score] of Object.entries(pillarScores)) {
    const target = sportProfile.pillarTargets[pilar] ?? 8;
    pillarCoverage[pilar] = Math.min(score / target, 1.5);
  }

  // ITD final ponderado usando pesos del perfil (no hardcodeados)
  let ITD = 0;
  for (const [pilar, weight] of Object.entries(sportProfile.pillarWeights)) {
    ITD += weight * (pillarCoverage[pilar] ?? 0);
  }
  ITD *= 100;

  const value = Math.round(Math.min(ITD, 100));

  // Detectar pilares débiles
  const weakPillars = Object.entries(pillarCoverage)
    .filter(([, v]) => v < 0.5)
    .map(([p]) => p);

  // Recomendaciones: delegadas al perfil (sin lógica TKD-específica aquí)
  const recommendations = sportProfile.generateRecommendations(
    weakPillars, pillarCoverage
  );

  const detail = Object.entries(pillarCoverage)
    .map(([p, v]) => {
      const pct = Math.round(v * 100);
      const icon = pct >= 100 ? '✅' : pct >= 50 ? '⚠️' : '❌';
      return `${formatPilar(p)}: ${pct}% ${icon}`;
    })
    .join(' | ');

  const label =
    value >= cfg.thresholds.optimal   ? 'Óptimo' :
    value >= cfg.thresholds.high      ? 'Alto' :
    value >= cfg.thresholds.moderate  ? 'Moderado' : 'Bajo';

  return {
    value,
    normalized: value / 100,
    label,
    trend: 'stable',
    detail,
    weakPillars,
    recommendations,
    inputs: {
      pillarScores,
      pillarCoverage,
      windowWeeks: cfg.windowWeeks
    }
  };
}

function derivePillarContribution(pattern, sportTransfer) {
  const norm = sportTransfer / 10;

  const contributions = {
    unilateral:      { explosiveness: 0.7 * norm, unilateral: 1.0,       mobility: 0.2, coreRotation: 0.1 },
    rotation:        { explosiveness: 0.3,         unilateral: 0.2,       mobility: 0.3, coreRotation: 0.9 * norm },
    hip_dominant:    { explosiveness: 0.7 * norm, unilateral: 0.1,       mobility: 0.4, coreRotation: 0.2 },
    knee_dominant:   { explosiveness: 0.5 * norm, unilateral: 0.1,       mobility: 0.3, coreRotation: 0.1 },
    push_horizontal: { explosiveness: 0.2,         unilateral: 0.0,       mobility: 0.0, coreRotation: 0.0 },
    push_vertical:   { explosiveness: 0.4,         unilateral: 0.0,       mobility: 0.1, coreRotation: 0.1 },
    pull_horizontal: { explosiveness: 0.2,         unilateral: 0.0,       mobility: 0.1, coreRotation: 0.1 },
    pull_vertical:   { explosiveness: 0.3,         unilateral: 0.0,       mobility: 0.2, coreRotation: 0.1 },
    anti_rotation:   { explosiveness: 0.1,         unilateral: 0.1,       mobility: 0.1, coreRotation: 0.7 * norm },
    core:            { explosiveness: 0.1,         unilateral: 0.1,       mobility: 0.2, coreRotation: 0.5 },
    cardio:          { explosiveness: 0.1,         unilateral: 0.0,       mobility: 0.0, coreRotation: 0.0 }
  };

  return contributions[pattern] ?? {
    explosiveness: 0.2, unilateral: 0.1, mobility: 0.1, coreRotation: 0.1
  };
}

function isRelevantSet(set) {
  return set.done && (
    set.technicalQuality === null ||
    set.technicalQuality === undefined ||
    set.technicalQuality >= 3
  );
}

function getQualityFactor(sets) {
  const qualities = sets
    .filter(s => s.done && s.technicalQuality !== null && s.technicalQuality !== undefined)
    .map(s => s.technicalQuality);
  if (qualities.length === 0) return 0.7;
  const avg = qualities.reduce((a, b) => a + b, 0) / qualities.length;
  return avg / 5;
}

function formatPilar(pilar) {
  const labels = {
    explosiveness: 'Explosividad',
    unilateral:    'Unilateral',
    mobility:      'Movilidad',
    coreRotation:  'Core rot.'
  };
  return labels[pilar] || pilar;
}
