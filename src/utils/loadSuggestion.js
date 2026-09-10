import { estimate1RM } from '../engine/performance/utils/oneRMEstimators.js';
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary.js';

// ═══════════════════════════════════
// TABLA RPE OBJETIVO POR MESOCICLO
// ═══════════════════════════════════
export const MESO_RPE_TARGETS = {
  fuerza: {
    default: { min: 7, max: 8 },
    byWeek: {
      1: { min: 7,   max: 8,   label: 'Acumulación' },
      2: { min: 7,   max: 8,   label: 'Acumulación' },
      3: { min: 8,   max: 9,   label: 'Intensificación' },
      4: { min: 5,   max: 6,   label: 'Descarga' },
    },
    progressSignal: 7,
    excessSignal: 9,
    incrementKg: 2.5,
    pctRange: [0.83, 0.95]
  },
  hipertrofia: {
    default: { min: 7, max: 8 },
    byWeek: {
      1: { min: 7,   max: 7.5, label: 'Base volumétrica' },
      2: { min: 7,   max: 7.5, label: 'Progresión' },
      3: { min: 7,   max: 8,   label: 'Acumulación' },
      4: { min: 7.5, max: 8,   label: 'Acumulación+' },
      5: { min: 8,   max: 9,   label: 'Intensificación' },
      6: { min: 5,   max: 6,   label: 'Descarga' },
    },
    progressSignal: 7,
    excessSignal: 8.5,
    incrementKg: 2.5,
    pctRange: [0.67, 0.80]
  },
  potencia: {
    default: { min: 7, max: 8 },
    byWeek: {
      1: { min: 7,   max: 8,   label: 'Potencia base' },
      2: { min: 7,   max: 8,   label: 'Potencia máxima' },
      3: { min: 7,   max: 8,   label: 'Peaking' },
    },
    progressSignal: 6.5,
    excessSignal: 8.5,
    incrementKg: 2.5,
    pctRange: [0.70, 0.85]
  },
  peaking: {
    default: { min: 7, max: 8 },
    byWeek: {
      1: { min: 8,   max: 9,   label: 'Estimulación' },
      2: { min: 6,   max: 7,   label: 'Reducción' },
    },
    progressSignal: 999,
    excessSignal: 9,
    incrementKg: 0,
    pctRange: [0.75, 0.90]
  },
  competicion: {
    default: { min: 7, max: 8 },
    byWeek: {
      1: { min: 7,   max: 8,   label: 'Base física' },
      2: { min: 7,   max: 8,   label: 'Potencia específica' },
      3: { min: 8,   max: 9,   label: 'Simulación' },
      4: { min: 6,   max: 7,   label: 'Peaking' },
    },
    progressSignal: 7,
    excessSignal: 9,
    incrementKg: 2.5,
    pctRange: [0.75, 0.87]
  },
  recuperacion: {
    default: { min: 4, max: 5 },
    byWeek: {
      1: { min: 4,   max: 5,   label: 'Recuperación activa' },
    },
    progressSignal: 999,
    excessSignal: 6,
    incrementKg: 0,
    pctRange: [0.50, 0.65]
  }
}

// ═══════════════════════════════════
// TABLA PRILEPIN — % 1RM POR REPS
// ═══════════════════════════════════
const REP_TO_PCT = {
  1:  0.95,
  2:  0.90,
  3:  0.87,
  4:  0.85,
  5:  0.83,
  6:  0.80,
  7:  0.77,
  8:  0.75,
  10: 0.70,
  12: 0.67,
  15: 0.62,
  20: 0.55
}

function getPctForReps(reps) {
  const keys = Object.keys(REP_TO_PCT)
    .map(Number).sort((a,b) => a-b);
  for (const key of keys) {
    if (reps <= key) return REP_TO_PCT[key];
  }
  return 0.55;
}

function parseReps(repsVal) {
  if (typeof repsVal === 'number') return repsVal;
  if (!repsVal) return null;
  let clean = repsVal.toString().trim();
  if (clean.toLowerCase().includes('fallo')) 
    return 10;
  if (clean.includes('-')) 
    clean = clean.split('-')[0];
  const num = parseInt(clean, 10);
  return isNaN(num) ? null : num;
}

// Helper de normalización para matching consistente con getPreviousWeekReference.js
const normalize = (name) => {
  if (!name) return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
};

// ═══════════════════════════════════
// MAPEO: progressionModel → tipo de acción sugerida
// ═══════════════════════════════════
const ACTION_TYPE_MAP = {
  VELOCITY: 'velocity',
  QUALITY:  'quality',
  VOLUME:   'volume',
  DENSITY:  'density',
  RPE:      'effort',
  RIR:      'effort',
  NONE:     'none',
};

// ─── Función auxiliar: genera respuesta para modelos no-LOAD ─────────────────
function _suggestNonLoad({ progressionModel, exerciseId, exerciseName, sessionLogs }) {
  const actionType = ACTION_TYPE_MAP[progressionModel] ?? 'none';

  // Si es NONE (movilidad, etc.), no hay sugerencia numérica ni cualitativa
  if (actionType === 'none') {
    return {
      progressionModel,
      actionType: 'none',
      direction: null,
      message: 'Sin progresión numérica (ejecución técnica)',
      confidence: 'n/a',
      hasHistory: false,
    };
  }

  // Recoger historial reciente (misma lógica que en suggestLoad LOAD)
  const targetNorm = exerciseName ? normalize(exerciseName) : '';
  const safeLogs = Array.isArray(sessionLogs) ? sessionLogs : [];
  const recentLogs = [];
  for (const log of safeLogs) {
    if (recentLogs.length >= 3) break;
    const ex = log.ejercicios?.find(
      e => e && (e.id === exerciseId || (targetNorm && normalize(e.nombre || e.name || '') === targetNorm))
    );
    if (ex?.seriesLog?.length > 0) recentLogs.push(ex);
  }

  const hasHistory = recentLogs.length > 0;

  // ── Lógica por actionType ────────────────────────────────────────────────
  if (actionType === 'velocity') {
    // Leer velocidadPercibida de series recientes
    const scores = recentLogs.flatMap(ex =>
      ex.seriesLog
        .filter(s => s.velocidad != null)
        .map(s =>
          s.velocidad === 'rapida' ? 3 :
          s.velocidad === 'media'  ? 2 : 1
        )
    );
    const avgVel = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : null;

    let direction = 'maintain';
    let message   = 'Mantener carga/altura actual';
    if (avgVel !== null) {
      if (avgVel >= 2.5)      { direction = 'progress'; message = '↑ Aumentar exigencia (velocidad alta)'; }
      else if (avgVel < 1.5)  { direction = 'reduce';   message = '↓ Reducir exigencia (movimiento lento)'; }
    }

    return { progressionModel, actionType, direction, message,
             confidence: hasHistory ? 'media' : 'baja', hasHistory };
  }

  if (actionType === 'quality') {
    // Leer calidadTecnica
    const quals = recentLogs.flatMap(ex =>
      ex.seriesLog
        .filter(s => s.calidadTecnica != null)
        .map(s => Number(s.calidadTecnica))
    );
    const avgQual = quals.length > 0
      ? quals.reduce((a, b) => a + b, 0) / quals.length
      : null;

    let direction = 'maintain';
    let message   = 'Consolidar técnica actual';
    if (avgQual !== null) {
      if (avgQual >= 4)      { direction = 'progress'; message = '↑ Aumentar dificultad técnica (calidad alta)'; }
      else if (avgQual < 3)  { direction = 'reduce';   message = '↓ Simplificar movimiento (calidad baja)'; }
    }

    return { progressionModel, actionType, direction, message,
             confidence: hasHistory ? 'media' : 'baja', hasHistory };
  }

  if (actionType === 'volume') {
    // Contar series completadas recientes
    const doneSets = recentLogs.flatMap(ex =>
      ex.seriesLog.filter(s => s.done)
    ).length;
    const avgSets = hasHistory
      ? doneSets / recentLogs.length
      : null;

    let direction = 'maintain';
    let message   = 'Mantener volumen actual';
    if (avgSets !== null && avgSets >= 3) {
      direction = 'progress';
      message   = `↑ Añadir 1 serie (media: ${avgSets.toFixed(1)} series/sesión)`;
    }

    return { progressionModel, actionType, direction, message,
             confidence: hasHistory ? 'media' : 'baja', hasHistory };
  }

  if (actionType === 'density') {
    // Sin datos de densidad aún: señal cualitativa basada en RPE
    const rpes = recentLogs.flatMap(ex =>
      ex.seriesLog
        .filter(s => s.rpe != null)
        .map(s => parseFloat(s.rpe))
    );
    const avgRpe = rpes.length > 0
      ? rpes.reduce((a, b) => a + b, 0) / rpes.length
      : null;

    let direction = 'maintain';
    let message   = 'Mantener densidad actual';
    if (avgRpe !== null) {
      if (avgRpe < 7)      { direction = 'progress'; message = '↑ Reducir descanso entre series'; }
      else if (avgRpe > 9) { direction = 'reduce';   message = '↓ Aumentar descanso entre series'; }
    }

    return { progressionModel, actionType, direction, message,
             confidence: hasHistory ? 'media' : 'baja', hasHistory };
  }

  if (actionType === 'effort') {
    // RPE/RIR: comparar esfuerzo reciente con objetivo
    const rpes = recentLogs.flatMap(ex =>
      ex.seriesLog
        .filter(s => s.rpe != null)
        .map(s => parseFloat(s.rpe))
    );
    const avgRpe = rpes.length > 0
      ? rpes.reduce((a, b) => a + b, 0) / rpes.length
      : null;

    let direction = 'maintain';
    let message   = 'Mantener esfuerzo objetivo';
    if (avgRpe !== null) {
      if (avgRpe < 7)      { direction = 'progress'; message = '↑ Aumentar esfuerzo percibido (RPE bajo)'; }
      else if (avgRpe > 9) { direction = 'reduce';   message = '↓ Reducir esfuerzo (RPE muy alto)'; }
    }

    return { progressionModel, actionType, direction, message,
             confidence: hasHistory ? 'media' : 'baja', hasHistory };
  }

  // Fallback genérico
  return { progressionModel, actionType, direction: 'maintain',
           message: 'Sin lógica específica para este modelo', confidence: 'baja', hasHistory };
}

// ═══════════════════════════════════
// FUNCIÓN PRINCIPAL
// ═══════════════════════════════════
export function suggestLoad({
  exerciseId,
  exerciseName = null,
  targetReps,
  prs,
  sessionLogs,
  mesoType = null,
  mesoWeek = null,
  progressionModel: _progressionModelArg = null,
}) {
  // ─── Resolver progressionModel ────────────────────────────────────────────
  // Si el caller lo pasa explícitamente, úsalo.
  // Si no, buscarlo en EXERCISE_LIBRARY por exerciseId.
  // Default final: 'LOAD' (preserva 100% el comportamiento existente).
  let progressionModel = _progressionModelArg;
  if (!progressionModel && exerciseId) {
    const libEx = EXERCISE_LIBRARY.find(e => e.id === exerciseId);
    progressionModel = libEx?.progressionModel ?? null;
  }
  if (!progressionModel) progressionModel = 'LOAD';

  // ─── Rama no-LOAD: retorno anticipado con estructura paralela ─────────────
  // No toca ningún cálculo de kg ni los campos del objeto LOAD.
  if (progressionModel !== 'LOAD') {
    return _suggestNonLoad({
      progressionModel,
      exerciseId,
      exerciseName,
      sessionLogs: Array.isArray(sessionLogs) ? sessionLogs : [],
    });
  }

  // PASO 1 — 1RM actual
  const safePRs = Array.isArray(prs) ? prs : [];
  let exercisePRs = safePRs.filter(
    pr => pr && pr.exerciseId === exerciseId
  );

  // Fallback por nombre normalizado si no hay coincidencia por ID exacto
  if (exercisePRs.length === 0 && exerciseName) {
    const targetNorm = normalize(exerciseName);
    if (targetNorm) {
      exercisePRs = safePRs.filter(
        pr => pr && normalize(pr.exerciseName || pr.nombre || '') === targetNorm
      );
    }
  }

  let oneRM = 0;
  if (exercisePRs.length > 0) {
    const bestPR = exercisePRs.reduce(
      (max, pr) => pr.valor > max.valor ? pr : max
    );
    oneRM = bestPR.valor;
  } else if (Array.isArray(sessionLogs) && sessionLogs.length > 0) {
    // Fallback dinámico: calcular mejor 1RM desde sessionLogs si prs aún no tiene entrada para este ejercicio
    let maxEst = 0;
    const targetNorm = exerciseName ? normalize(exerciseName) : '';

    sessionLogs.forEach(log => {
      if (!log || !Array.isArray(log.ejercicios)) return;
      log.ejercicios.forEach(ex => {
        if (!ex || !Array.isArray(ex.seriesLog)) return;
        const isMatch = ex.id === exerciseId || (targetNorm && normalize(ex.nombre || ex.name || '') === targetNorm);
        if (!isMatch) return;

        // 1. Criterio de validez: s && parseFloat(s.carga) > 0 && parseFloat(s.reps) > 0
        const validSets = ex.seriesLog.filter(
          s => s && parseFloat(s.carga) > 0 && parseFloat(s.reps) > 0
        );
        validSets.forEach(s => {
          const c = parseFloat(s.carga);
          const r = parseFloat(s.reps);
          const est = estimate1RM(c, r, 'epley');
          if (est > maxEst) maxEst = est;
        });
      });
    });
    if (maxEst > 0) {
      oneRM = Math.round(maxEst * 10) / 10;
    }
  }

  if (oneRM <= 0) return null;

  // PASO 2 — Parsear reps
  const reps = parseReps(targetReps);
  if (!reps || reps <= 0) return null;

  // PASO 3 — % base según Prilepin
  let pct = getPctForReps(reps);

  // PASO 4 — Ajuste por mesociclo y semana
  let rpeTarget = { min: 7, max: 8 };
  let mesoConfig = null;
  
  if (mesoType && MESO_RPE_TARGETS[mesoType]) {
    mesoConfig = MESO_RPE_TARGETS[mesoType];
    rpeTarget = mesoConfig.default;
    
    if (mesoWeek && mesoConfig.byWeek[mesoWeek]) {
      rpeTarget = mesoConfig.byWeek[mesoWeek];
    }
    
    if (mesoConfig.pctRange) {
      const [pctMin, pctMax] = mesoConfig.pctRange;
      const rpeNorm = (rpeTarget.min - 5) / 5;
      pct = pctMin + (pctMax - pctMin) * rpeNorm;
    }
  }

  let suggested = oneRM * pct;

  // PASO 5 — Recoger historial RPE y velocidad
  const recentLogs = [];
  const targetNorm = exerciseName ? normalize(exerciseName) : '';
  for (const log of sessionLogs) {
    if (recentLogs.length >= 3) break;
    const ex = log.ejercicios?.find(
      e => e && (e.id === exerciseId || (targetNorm && normalize(e.nombre || e.name || '') === targetNorm))
    );
    if (ex?.seriesLog?.length > 0) {
      recentLogs.push(ex);
    }
  }

  let rpeHistorico = null;
  let velScore = null;
  let adjustMsg = 'Sin historial previo';

  if (recentLogs.length > 0) {
    // RPE histórico
    const rpes = recentLogs.flatMap(ex =>
      ex.seriesLog
        .filter(s => s.rpe != null)
        .map(s => parseFloat(s.rpe))
    );
    if (rpes.length > 0) {
      rpeHistorico = rpes.reduce(
        (a,b) => a+b, 0
      ) / rpes.length;
    }

    // Velocidad percibida histórica
    // lenta=1, media=2, rapida=3
    const velocidades = recentLogs.flatMap(ex =>
      ex.seriesLog
        .filter(s => s.velocidad != null)
        .map(s => 
          s.velocidad === 'rapida' ? 3 :
          s.velocidad === 'media'  ? 2 : 1
        )
    );
    if (velocidades.length > 0) {
      velScore = velocidades.reduce(
        (a,b) => a+b, 0
      ) / velocidades.length;
    }
  }

  // PASO 6 — Los 4 casos de ajuste
  // RPE + Velocidad combinados
  const progressSignal = 
    mesoConfig?.progressSignal || 7;
  const excessSignal = 
    mesoConfig?.excessSignal || 9;
  const incrementKg = 
    mesoConfig?.incrementKg || 2.5;

  if (rpeHistorico !== null) {
    
    // CASO 1: RPE bajo + velocidad rápida
    // → Progresión acelerada
    if (rpeHistorico < progressSignal && 
        velScore !== null && velScore >= 2.5) {
      suggested += incrementKg * 1.5;
      adjustMsg = '↑↑ Progresión acelerada ' +
        '(RPE bajo + movimiento rápido)';
    }
    
    // CASO 2: RPE bajo + velocidad lenta
    // → Progresar con cautela
    else if (rpeHistorico < progressSignal && 
             velScore !== null && velScore < 2) {
      suggested += incrementKg;
      adjustMsg = '↑ Progresión cautelosa ' +
        '(RPE bajo pero movimiento lento)';
    }
    
    // CASO 3: RPE bajo sin dato de velocidad
    // → Progresión normal
    else if (rpeHistorico < progressSignal && 
             velScore === null) {
      suggested += incrementKg;
      adjustMsg = '↑ Progresión ' +
        '(RPE por debajo del objetivo)';
    }

    // CASO 4: RPE alto + velocidad lenta
    // → Reducir significativamente
    else if (rpeHistorico > excessSignal && 
             velScore !== null && velScore < 1.5) {
      suggested *= 0.85;
      adjustMsg = '↓↓ Reducción importante ' +
        '(RPE alto + movimiento lento)';
    }

    // CASO 5: RPE alto + velocidad rápida
    // → Fatiga metabólica, no muscular
    // Mantener carga
    else if (rpeHistorico > 7.5 && 
             velScore !== null && velScore >= 2.5) {
      adjustMsg = '→ Mantener carga ' +
        '(fatiga metabólica, fuerza conservada)';
    }

    // CASO 6: RPE alto sin velocidad
    // → Reducir moderadamente
    else if (rpeHistorico > excessSignal && 
             velScore === null) {
      suggested *= 0.90;
      adjustMsg = '↓ Reducción moderada ' +
        '(RPE por encima del límite)';
    }

    // CASO 7: RPE en rango óptimo
    // → Mantener
    else {
      adjustMsg = '→ Mantenimiento ' +
        '(RPE en rango objetivo)';
    }
  }

  // PASO 7 — Redondear a múltiplo de 2.5kg
  suggested = Math.round(suggested / 2.5) * 2.5;
  const min = Math.round(
    (suggested * 0.95) / 2.5
  ) * 2.5;
  const max = Math.round(
    (suggested * 1.05) / 2.5
  ) * 2.5;

  // PASO 8 — Confianza
  const confidence =
    exercisePRs.length >= 5 ? 'alta' :
    exercisePRs.length >= 2 ? 'media' : 'baja';

  // PASO 9 — Mensaje explicativo completo
  const basedOn = [
    `1RM: ${Math.round(oneRM)}kg`,
    mesoType 
      ? `Meso: ${mesoType} S${mesoWeek || '?'}` 
      : null,
    rpeHistorico 
      ? `RPE hist: ${rpeHistorico.toFixed(1)}` 
      : null,
    velScore !== null
      ? `Vel: ${
          velScore >= 2.5 ? '🚀 Alta' :
          velScore >= 1.5 ? '⚡ Media' : '🐢 Baja'
        }`
      : null,
    adjustMsg
  ].filter(Boolean).join(' · ');

  return {
    min,
    suggested,
    max,
    confidence,
    basedOn,
    rpeTarget,
    progression: adjustMsg,
    oneRM: Math.round(oneRM),
    velScore,
    velocidadLabel:
      velScore >= 2.5 ? 'Alta' :
      velScore >= 1.5 ? 'Media' :
      velScore ? 'Baja' : 'Sin datos'
  }
}
