import { PERFORMANCE_CONFIG } from '../performanceConfig.js';

/**
 * Sport Transfer Index (ITD)
 * Solo activo si athlete.sport === 'tkd' | 'both'
 * Depende de: stimulusIndex (series efectivas)
 */
export function computeSportTransferIndex(
  input, config = PERFORMANCE_CONFIG, wave1) {

  if (input.athlete.sport === 'gym') return null;

  const cfg = config.sportTransfer;
  const windowMs = cfg.windowWeeks * 7 * 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - windowMs;

  // Calcular contribución por pilar
  const pillarScores = {
    explosiveness: 0,
    unilateral: 0,
    mobility: 0,
    coreRotation: 0
  };

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

      for (const [pilar, contrib] of Object.entries(pillarContrib)) {
        pillarScores[pilar] +=
          contrib * effectiveSets * qualityFactor * transferNorm;
      }
    }
  }

  // Calcular cobertura por pilar
  const targets = cfg.pillarTargets;
  const pillarCoverage = {};

  for (const [pilar, score] of Object.entries(pillarScores)) {
    const target = targets[pilar] ?? 8;
    pillarCoverage[pilar] = Math.min(score / target, 1.5);
  }

  // ITD final ponderado
  const ITD = (
    cfg.weights.explosiveness * pillarCoverage.explosiveness +
    cfg.weights.unilateral    * pillarCoverage.unilateral +
    cfg.weights.mobility      * pillarCoverage.mobility +
    cfg.weights.coreRotation  * pillarCoverage.coreRotation
  ) * 100;

  const value = Math.round(Math.min(ITD, 100));

  // Detectar pilares débiles
  const weakPillars = Object.entries(pillarCoverage)
    .filter(([, v]) => v < 0.5)
    .map(([p]) => p);

  // Generar recomendaciones
  const recommendations = generateTKDRecommendations(
    weakPillars, pillarCoverage, cfg
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

function generateTKDRecommendations(weakPillars, coverage, cfg) {
  const recs = [];

  if (weakPillars.includes('unilateral')) {
    recs.push({
      type: 'pattern',
      priority: 'high',
      action: 'Añadir Split Jumps, Step-ups o Skater Jumps (trabajo unilateral)',
      reason: `El TKD requiere potencia y estabilidad sobre una pierna. ` +
        `Cobertura actual: ${Math.round(coverage.unilateral * 100)}%`
    });
  }

  if (weakPillars.includes('coreRotation')) {
    recs.push({
      type: 'pattern',
      priority: 'high',
      action: 'Añadir Landmine Rotación o Pallof Press (core rotacional)',
      reason: `La transferencia de fuerza en patadas rotacionales requiere core ` +
        `rotacional fuerte. Cobertura: ${Math.round(coverage.coreRotation * 100)}%`
    });
  }

  if (weakPillars.includes('explosiveness')) {
    recs.push({
      type: 'pattern',
      priority: 'medium',
      action: 'Añadir Pogos, Salidas Explosivas o Split Jumps (explosividad)',
      reason: `Cobertura explosividad: ${Math.round(coverage.explosiveness * 100)}%`
    });
  }

  if (weakPillars.includes('mobility')) {
    recs.push({
      type: 'pattern',
      priority: 'medium',
      action: 'Añadir Leg Swings, Círculos de Cadera o Sentadilla Profunda (movilidad)',
      reason: `Cobertura movilidad: ${Math.round(coverage.mobility * 100)}%`
    });
  }

  return recs;
}

function formatPilar(pilar) {
  const labels = {
    explosiveness: 'Explosividad',
    unilateral: 'Unilateral',
    mobility: 'Movilidad',
    coreRotation: 'Core rot.'
  };
  return labels[pilar] || pilar;
}
