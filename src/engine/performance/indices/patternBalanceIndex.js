import { PERFORMANCE_CONFIG } from '../performanceConfig.js';

/**
 * Pattern Balance Index (IPB)
 * Equilibrio entre patrones de movimiento.
 * Depende de: stimulusIndex (reutiliza series efectivas)
 */
export function computePatternBalanceIndex(
  input, config = PERFORMANCE_CONFIG, wave1) {

  const cfg = config.patternBalance;
  const windowMs = cfg.windowWeeks * 7 * 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - windowMs;

  // Contar series por patrón (últimas N semanas)
  const seriesByPattern = {};
  for (const pattern of cfg.patterns) {
    seriesByPattern[pattern] = 0;
  }

  for (const exercise of input.exerciseHistory) {
    const pattern = exercise.pattern;
    if (!pattern || pattern === 'cardio') continue;

    for (const session of exercise.sessions) {
      if (new Date(session.date).getTime() < cutoff) continue;

      const doneSets = session.sets.filter(s => s.done).length;
      seriesByPattern[pattern] = (seriesByPattern[pattern] ?? 0) + doneSets;
    }
  }

  // Calcular ratios y desviaciones
  const alerts = [];
  const ratioResults = {};

  for (const [ratioName, ratioCfg] of Object.entries(cfg.ratios)) {
    const [patternA, patternB] = ratioName.split('_to_');

    // Mapear nombres de ratio a patrones reales
    const volumeA = getPatternVolume(patternA, seriesByPattern);
    const volumeB = getPatternVolume(patternB, seriesByPattern);

    if (volumeB === 0) {
      ratioResults[ratioName] = null;
      continue;
    }

    const actual = volumeA / volumeB;

    ratioResults[ratioName] = {
      actual: Math.round(actual * 10) / 10,
      ideal: ratioCfg.ideal,
      alert: actual > ratioCfg.alertThreshold
    };

    if (actual > ratioCfg.alertThreshold) {
      alerts.push(generateAlert(ratioName, actual, ratioCfg, seriesByPattern));
    }
  }

  // Score: 100 si todo equilibrado,
  // baja por cada desequilibrio
  const alertPenalty = alerts.length * 20;
  const value = Math.max(0, 100 - alertPenalty);

  // Detalle por patrón
  const detail = Object.entries(seriesByPattern)
    .filter(([, v]) => v > 0)
    .map(([p, v]) => `${formatPattern(p)}: ${v}`)
    .join(' | ') || 'Sin datos suficientes';

  return {
    value,
    normalized: value / 100,
    label: value >= 80 ? 'Equilibrado' :
           value >= 60 ? 'Leve desequilibrio' :
           'Desequilibrio importante',
    trend: 'stable',
    detail,
    alerts,
    ratios: ratioResults,
    inputs: { seriesByPattern }
  };
}

function getPatternVolume(ratioKey, seriesByPattern) {
  const mapping = {
    push: (seriesByPattern.push_horizontal ?? 0) +
          (seriesByPattern.push_vertical ?? 0),
    pull: (seriesByPattern.pull_horizontal ?? 0) +
          (seriesByPattern.pull_vertical ?? 0),
    knee: seriesByPattern.knee_dominant ?? 0,
    hip:  seriesByPattern.hip_dominant ?? 0,
    bilateral: (seriesByPattern.knee_dominant ?? 0) +
               (seriesByPattern.hip_dominant ?? 0),
    unilateral: seriesByPattern.unilateral ?? 0
  };
  return mapping[ratioKey] ?? seriesByPattern[ratioKey] ?? 0;
}

function generateAlert(ratioName, actual, ratioCfg, series) {
  const alerts = {
    push_to_pull: {
      action: 'Añadir trabajo de tracción (dominadas, remo, face pull)',
      reason: `Ratio empuje:tracción ${actual.toFixed(1)}:1. ` +
        `Límite recomendado: ${ratioCfg.alertThreshold}:1`
    },
    knee_to_hip: {
      action: 'Añadir trabajo de cadera (peso muerto, hip thrust, RDL)',
      reason: `Ratio rodilla:cadera ${actual.toFixed(1)}:1. ` +
        `Más trabajo de cadera necesario`
    },
    bilateral_to_unilateral: {
      action: 'Añadir trabajo unilateral (split squat, step-up, skater jumps)',
      reason: `Ratio bilateral:unilateral ${actual.toFixed(1)}:1. ` +
        `Crítico para TKD`
    }
  };

  return {
    type: 'pattern_imbalance',
    ratio: ratioName,
    priority: actual > ratioCfg.alertThreshold * 1.5 ? 'critical' : 'high',
    ...(alerts[ratioName] ?? {
      action: `Revisar balance de ${ratioName}`,
      reason: `Ratio fuera de rango óptimo`
    })
  };
}

function formatPattern(pattern) {
  const labels = {
    push_horizontal: 'Empuje H',
    push_vertical: 'Empuje V',
    pull_horizontal: 'Tracción H',
    pull_vertical: 'Tracción V',
    knee_dominant: 'Rodilla',
    hip_dominant: 'Cadera',
    rotation: 'Rotación',
    anti_rotation: 'Anti-rot',
    unilateral: 'Unilateral',
    core: 'Core'
  };
  return labels[pattern] || pattern;
}
