import { PERFORMANCE_CONFIG } from '../performanceConfig.js';

/**
 * Progression Index (IP)
 * Semáforo de progresión por ejercicio.
 * Depende de: fatigueIndex, recoveryIndex (Wave 1)
 */
export function computeProgressionIndex(
  input, config = PERFORMANCE_CONFIG, wave1) {

  const cfg = config.progression;
  const exerciseDecisions = {};

  for (const exercise of input.exerciseHistory) {
    const decision = evaluateExercise(
      exercise, cfg, wave1, config
    );
    exerciseDecisions[exercise.exerciseId] = decision;
  }

  // Índice global: media de semáforos
  // green=3, yellow=2, red=1
  const scores = Object.values(exerciseDecisions)
    .map(d =>
      d.trafficLight.color === 'green' ? 3 :
      d.trafficLight.color === 'yellow' ? 2 : 1
    );

  const avgScore = scores.length > 0
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : 2; // default yellow

  const value = Math.round(
    ((avgScore - 1) / 2) * 100
  );

  const globalColor =
    avgScore >= 2.5 ? 'green' :
    avgScore >= 1.5 ? 'yellow' : 'red';

  return {
    value,
    normalized: value / 100,
    label: globalColor === 'green' ? 'Progresando' :
           globalColor === 'yellow' ? 'Estable' :
           'Regresando',
    trend: 'stable',
    detail: `${scores.filter(s => s === 3).length} ↑ · ` +
            `${scores.filter(s => s === 2).length} → · ` +
            `${scores.filter(s => s === 1).length} ↓`,
    exerciseDecisions,
    inputs: { scores, avgScore }
  };
}

function evaluateExercise(exercise, cfg, wave1, config) {
  // Obtener últimas N sesiones
  const sessions = [...exercise.sessions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, cfg.lookbackSessions);

  if (sessions.length === 0) {
    return {
      trafficLight: {
        color: 'yellow',
        label: 'Sin datos',
        action: cfg.trafficLight.yellow.action,
        simpleMessage: 'Sin historial suficiente'
      },
      suggestedLoadDelta: 0,
      isStagnating: false,
      reasoning: 'Sin sesiones registradas'
    };
  }

  // Contar señales negativas
  let slowSets = 0;
  let failureSets = 0;
  let lowRIRSets = 0;
  let lowQualitySets = 0;
  let totalDoneSets = 0;

  for (const session of sessions) {
    for (const set of session.sets) {
      if (!set.done) continue;
      totalDoneSets++;

      if (set.perceivedVelocity === 'slow') slowSets++;
      if (set.rir === 0) failureSets++;
      if (set.rir !== null && set.rir !== undefined && set.rir <= 1) lowRIRSets++;
      if (set.technicalQuality !== null &&
          set.technicalQuality !== undefined &&
          set.technicalQuality <= 2) lowQualitySets++;
    }
  }

  // Señales de fatiga y recuperación de Wave 1
  const fatigueHigh = wave1.fatigue.value >
    cfg.trafficLight.red.maxFatigueIndex;
  const recoveryLow = wave1.recovery.normalized <
    cfg.trafficLight.red.maxRecoveryIndex;
  const recoveryModerate =
    wave1.recovery.normalized >= cfg.trafficLight.red.maxRecoveryIndex &&
    wave1.recovery.normalized < cfg.trafficLight.green.minRecoveryIndex;

  // Determinar semáforo
  let color = 'green';
  const reasons = [];

  // ROJO
  if (failureSets >= 2) {
    color = 'red';
    reasons.push(`${failureSets} series al fallo`);
  }
  if (slowSets >= cfg.trafficLight.red.maxSlowSets) {
    color = 'red';
    reasons.push(`${slowSets} series lentas`);
  }
  if (lowQualitySets >= 2) {
    color = 'red';
    reasons.push(`${lowQualitySets} series con técnica deficiente`);
  }
  if (fatigueHigh) {
    color = 'red';
    reasons.push('Fatiga sistémica crítica');
  }
  if (recoveryLow) {
    color = 'red';
    reasons.push('Recuperación muy baja');
  }

  // AMARILLO (solo si no es rojo)
  if (color !== 'red') {
    if (lowRIRSets >= 1) {
      color = 'yellow';
      reasons.push('Series cerca del fallo');
    }
    if (slowSets >= 1) {
      color = 'yellow';
      reasons.push('Alguna serie lenta');
    }
    if (recoveryModerate) {
      color = 'yellow';
      reasons.push('Recuperación moderada');
    }
  }

  // Calcular delta de carga sugerido
  const loadDelta = color === 'green'
    ? cfg.loadIncrementKg :
    color === 'red'
    ? -cfg.loadIncrementKg : 0;

  // Detectar estancamiento
  const isStagnating = detectStagnation(
    exercise.sessions, cfg.stagnation
  );

  const trafficLight = {
    color,
    label: color === 'green' ? 'Subir carga' :
           color === 'yellow' ? 'Mantener' :
           'Reducir carga',
    action: cfg.trafficLight[color].action,
    simpleMessage: color === 'green'
      ? `+${cfg.loadIncrementKg}kg próxima sesión` :
      color === 'yellow' ? 'Mismo peso esta semana' :
      `-${cfg.loadIncrementKg}kg o menos volumen`
  };

  return {
    trafficLight,
    suggestedLoadDelta: loadDelta,
    isStagnating,
    reasoning: reasons.length > 0
      ? reasons.join('. ')
      : 'Todas las series dentro del rango óptimo'
  };
}

function detectStagnation(sessions, cfg) {
  if (sessions.length < cfg.sessionsToDetect) return false;

  const sorted = [...sessions]
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const recent = sorted.slice(-cfg.sessionsToDetect);

  // Calcular e1RM medio por sesión
  const e1RMs = recent.map(session => {
    const sets = session.sets.filter(s => s.done);
    if (sets.length === 0) return 0;
    const maxE1RM = Math.max(...sets.map(s => {
      if (!s.load || !s.reps) return 0;
      return s.load * (1 + s.reps / 30); // Epley
    }));
    return maxE1RM;
  });

  // Estancamiento si el e1RM no ha crecido
  const first = e1RMs[0];
  const last = e1RMs[e1RMs.length - 1];
  return first > 0 && last <= first * 1.01; // < 1% mejora
}
