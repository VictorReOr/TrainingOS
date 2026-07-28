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

// ═══════════════════════════════════
// FUNCIÓN PRINCIPAL
// ═══════════════════════════════════
export function suggestLoad({
  exerciseId,
  targetReps,
  prs,
  sessionLogs,
  mesoType = null,
  mesoWeek = null,
}) {

  // PASO 1 — 1RM actual
  const exercisePRs = prs.filter(
    pr => pr.exerciseId === exerciseId
  );
  if (exercisePRs.length === 0) return null;
  
  const bestPR = exercisePRs.reduce(
    (max, pr) => pr.valor > max.valor ? pr : max
  );
  const oneRM = bestPR.valor;

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
  for (const log of sessionLogs) {
    if (recentLogs.length >= 3) break;
    const ex = log.ejercicios?.find(
      e => e.id === exerciseId
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
