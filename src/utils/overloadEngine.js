/**
 * TrainingOS — Motor de Sobrecarga Progresiva
 * 
 * Implementa la lógica matemática y científica del modelo Logístico + Ajuste por RPE.
 */

// ─── Tabla de Helms et al. (2016) — RPE × Reps → %1RM ───────────────────────
export const HELMS_TABLE = {
  1: { 10: 1.0, 9.5: 0.978, 9: 0.955, 8.5: 0.939, 8: 0.922, 7.5: 0.907, 7: 0.892, 6.5: 0.876, 6: 0.863 },
  2: { 10: 0.978, 9.5: 0.955, 9: 0.939, 8.5: 0.922, 8: 0.907, 7.5: 0.892, 7: 0.876, 6.5: 0.863, 6: 0.847 },
  3: { 10: 0.955, 9.5: 0.939, 9: 0.922, 8.5: 0.907, 8: 0.892, 7.5: 0.876, 7: 0.863, 6.5: 0.847, 6: 0.832 },
  4: { 10: 0.939, 9.5: 0.922, 9: 0.907, 8.5: 0.892, 8: 0.876, 7.5: 0.863, 7: 0.847, 6.5: 0.832, 6: 0.818 },
  5: { 10: 0.922, 9.5: 0.907, 9: 0.892, 8.5: 0.876, 8: 0.863, 7.5: 0.847, 7: 0.832, 6.5: 0.818, 6: 0.804 },
  6: { 10: 0.907, 9.5: 0.892, 9: 0.876, 8.5: 0.863, 8: 0.847, 7.5: 0.832, 7: 0.818, 6.5: 0.804, 6: 0.790 },
  7: { 10: 0.892, 9.5: 0.876, 9: 0.863, 8.5: 0.847, 8: 0.832, 7.5: 0.818, 7: 0.804, 6.5: 0.790, 6: 0.776 },
  8: { 10: 0.876, 9.5: 0.863, 9: 0.847, 8.5: 0.832, 8: 0.818, 7.5: 0.804, 7: 0.790, 6.5: 0.776, 6: 0.762 },
  9: { 10: 0.863, 9.5: 0.847, 9: 0.832, 8.5: 0.818, 8: 0.804, 7.5: 0.790, 7: 0.776, 6.5: 0.762, 6: 0.749 },
  10: { 10: 0.847, 9.5: 0.832, 9: 0.818, 8.5: 0.804, 8: 0.790, 7.5: 0.776, 7: 0.762, 6.5: 0.749, 6: 0.735 },
  12: { 10: 0.818, 9.5: 0.804, 9: 0.790, 8.5: 0.776, 8: 0.762, 7.5: 0.749, 7: 0.735, 6.5: 0.722, 6: 0.709 },
  15: { 10: 0.779, 9.5: 0.766, 9: 0.753, 8.5: 0.740, 8: 0.727, 7.5: 0.714, 7: 0.701, 6.5: 0.688, 6: 0.675 }
};

// ─── RPE Target por defecto según el Goal de la sesión ──────────────────────
export const GOAL_DEFAULTS = {
  fuerza_maxima:   { rpeTarget: 9.0, repsRange: [1, 5],  label: 'Fuerza Máxima' },
  gym_fuerza:      { rpeTarget: 9.0, repsRange: [1, 5],  label: 'Fuerza' },
  hipertrofia:     { rpeTarget: 8.0, repsRange: [6, 12], label: 'Hipertrofia' },
  gym_hipertrofia: { rpeTarget: 8.0, repsRange: [6, 12], label: 'Hipertrofia' },
  gym_potencia:    { rpeTarget: 7.0, repsRange: [1, 5],  label: 'Potencia' },
  resistencia:     { rpeTarget: 7.0, repsRange: [12, 20],label: 'Resistencia' },
  cardio:          { rpeTarget: 6.0, repsRange: [15, 30],label: 'Cardio' },
  gym:             { rpeTarget: 8.0, repsRange: [6, 12], label: 'General' },
};

// ─── Parámetros según Nivel de Experiencia del Atleta ───────────────────────
export const LEVEL_PARAMS = {
  novato:     { baseRate: 0.04,  pMaxFactor: 2.5, deloadAfter: 4 },
  intermedio: { baseRate: 0.025, pMaxFactor: 1.5, deloadAfter: 3 },
  avanzado:   { baseRate: 0.015, pMaxFactor: 1.2, deloadAfter: 2 },
};

/**
 * Busca el porcentaje de 1RM correspondiente a unas reps y RPE en la tabla de Helms.
 * Aplica interpolación bilineal si no hay coincidencia exacta.
 */
export function lookupHelmsTable(reps, rpe) {
  const clampedReps = Math.max(1, Math.min(15, reps));
  const clampedRPE = Math.max(6, Math.min(10, rpe));

  // Si hay coincidencia exacta
  if (HELMS_TABLE[clampedReps] && HELMS_TABLE[clampedReps][clampedRPE] !== undefined) {
    return HELMS_TABLE[clampedReps][clampedRPE];
  }

  // Obtener claves numéricas
  const availableReps = Object.keys(HELMS_TABLE).map(Number).sort((a, b) => a - b);
  let repLow = availableReps[0];
  let repHigh = availableReps[availableReps.length - 1];
  for (const r of availableReps) {
    if (r <= clampedReps) repLow = r;
    if (r >= clampedReps) {
      repHigh = r;
      break;
    }
  }

  const availableRpes = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];
  let rpeLow = availableRpes[0];
  let rpeHigh = availableRpes[availableRpes.length - 1];
  for (const r of availableRpes) {
    if (r <= clampedRPE) rpeLow = r;
    if (r >= clampedRPE) {
      rpeHigh = r;
      break;
    }
  }

  const q11 = HELMS_TABLE[repLow][rpeLow];
  const q12 = HELMS_TABLE[repLow][rpeHigh];
  const q21 = HELMS_TABLE[repHigh][rpeLow];
  const q22 = HELMS_TABLE[repHigh][rpeHigh];

  if (repLow === repHigh && rpeLow === rpeHigh) return q11;

  if (repLow === repHigh) {
    return q11 + (clampedRPE - rpeLow) * (q12 - q11) / (rpeHigh - rpeLow || 1);
  }
  if (rpeLow === rpeHigh) {
    return q11 + (clampedReps - repLow) * (q21 - q11) / (repHigh - repLow || 1);
  }

  const r1 = ((repHigh - clampedReps) / (repHigh - repLow)) * q11 + ((clampedReps - repLow) / (repHigh - repLow)) * q21;
  const r2 = ((repHigh - clampedReps) / (repHigh - repLow)) * q12 + ((clampedReps - repLow) / (repHigh - repLow)) * q22;
  return ((rpeHigh - clampedRPE) / (rpeHigh - rpeLow)) * r1 + ((clampedRPE - rpeLow) / (rpeHigh - rpeLow)) * r2;
}

/**
 * Redondea un peso al múltiplo de placa más cercano (por defecto 1.25kg).
 */
export function roundToPlate(kg, plateIncrement = 1.25) {
  if (isNaN(kg) || kg <= 0) return 0;
  return Math.max(0, Math.round(kg / plateIncrement) * plateIncrement);
}

/**
 * Estima el 1RM usando la fórmula de Epley.
 */
export function estimateOneRM(weight, reps) {
  if (!weight || !reps || weight <= 0 || reps <= 0) return 0;
  // Epley formula: w * (1 + r/30)
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Estima P_max (máximo potencial asintótico del atleta).
 */
export function estimatePMax(currentOneRM, level, override = null) {
  if (override && override > 0) return override;
  const factor = LEVEL_PARAMS[level]?.pMaxFactor || 1.5;
  return currentOneRM * factor;
}

/**
 * Calcula la tasa logística de mejora.
 */
export function computeLogisticRate(e1RM, pMax, baseRate) {
  if (pMax <= 0) return 0.005;
  const effect = 1 - (e1RM / pMax);
  return Math.max(baseRate * effect, 0.005); // Mínimo 0.5% para asegurar algún progreso
}

/**
 * Prescribe la carga para un ejercicio basándose en la tabla de Helms.
 */
export function prescribeLoad({ e1RM, targetReps, rpeTarget }) {
  if (!e1RM || e1RM <= 0) {
    return { prescribedLoad: 0, pct1RM: 0, e1RM: 0, rpeTarget, confidence: 'low' };
  }

  const pct = lookupHelmsTable(targetReps, rpeTarget);
  const load = roundToPlate(e1RM * pct);

  return {
    prescribedLoad: load,
    pct1RM: Math.round(pct * 100),
    e1RM,
    rpeTarget,
    confidence: 'high'
  };
}

/**
 * Detecta si el atleta está estancado en base al historial del ejercicio.
 * Estancado = no hay mejora de e1RM en las últimas N sesiones.
 */
export function detectStagnation(exerciseHistory, threshold) {
  if (!exerciseHistory || exerciseHistory.length < threshold) {
    return { stagnant: false, sessionsFlat: 0 };
  }

  // Coger las últimas N sesiones
  const recent = exerciseHistory.slice(-threshold);
  
  // Comprobar si el e1RM ha crecido respecto al primero del bloque reciente
  const firstVal = recent[0].e1RM;
  let flatCount = 0;
  for (let i = 1; i < recent.length; i++) {
    if (recent[i].e1RM <= firstVal) {
      flatCount++;
    }
  }

  return {
    stagnant: flatCount >= (threshold - 1),
    sessionsFlat: flatCount
  };
}

/**
 * Calcula la carga recomendada para la siguiente sesión según la discrepancia RPE.
 */
export function computeNextSession({
  lastLoad,
  lastAvgRPE,
  rpeTarget,
  targetReps,
  e1RM,
  athleteLevel,
  exerciseHistory = [],
  pMaxOverride = null
}) {
  const level = athleteLevel || 'intermedio';
  const params = LEVEL_PARAMS[level];

  // 1. Calcular discrepancia
  const discrepancy = rpeTarget - lastAvgRPE;

  // 2. Potencial máximo y tasa logística
  const pMax = estimatePMax(e1RM, level, pMaxOverride);
  const α_w = computeLogisticRate(e1RM, pMax, params.baseRate);

  // 3. Determinar factor de ajuste basado en discrepancia RPE
  let factor = 1.0;
  let action = 'maintain';

  if (discrepancy >= 1.0) {
    // Muy fácil -> subir tasa logística completa
    factor = 1 + α_w;
    action = 'increase';
  } else if (discrepancy >= 0.5) {
    // Fácil -> subir la mitad de la tasa logística
    factor = 1 + (α_w * 0.5);
    action = 'increase_light';
  } else if (discrepancy >= 0.0) {
    // Perfecto -> subir un cuarto de la tasa logística
    factor = 1 + (α_w * 0.25);
    action = 'increase_min';
  } else if (discrepancy >= -0.5) {
    // Ajustado -> mantener
    factor = 1.0;
    action = 'maintain';
  } else {
    // Muy duro -> bajar 2.5% por cada punto de discrepancia
    factor = Math.max(0.5, 1 - 0.025 * Math.abs(discrepancy));
    action = 'decrease';
  }

  // 4. Comprobar estancamiento y sugerir deload
  const stagnationResult = detectStagnation(exerciseHistory, params.deloadAfter);
  const isDeloadSuggested = stagnationResult.stagnant;
  const deloadReason = isDeloadSuggested 
    ? `Llevas ${stagnationResult.sessionsFlat + 1} sesiones sin progresar en e1RM`
    : null;
  const deloadLoad = isDeloadSuggested ? roundToPlate(lastLoad * 0.60) : null;

  const nextLoad = isDeloadSuggested ? deloadLoad : roundToPlate(lastLoad * factor);

  // Nivel de confianza basado en la cantidad de datos históricos del ejercicio
  let confidence = 'low';
  if (exerciseHistory.length >= 4) confidence = 'high';
  else if (exerciseHistory.length >= 2) confidence = 'medium';

  return {
    nextLoad,
    improvePct: Math.round((factor - 1) * 1000) / 10,
    discrepancy,
    action,
    isDeloadSuggested,
    deloadReason,
    deloadLoad,
    confidence,
    breakdown: {
      baseRate: params.baseRate,
      ceilingEffect: Math.round((1 - e1RM / pMax) * 100) / 100,
      logisticRate: α_w,
      discrepancy,
      factor,
      pMax
    }
  };
}

/**
 * Parsea un string o número que representa repeticiones a un entero válido.
 */
export function parseReps(repsVal) {
  if (typeof repsVal === 'number') return repsVal > 0 ? repsVal : null;
  if (!repsVal || typeof repsVal !== 'string') return null;

  let clean = repsVal.trim().toLowerCase();

  if (clean.includes('fallo')) return null;

  if (clean.includes('-')) {
    clean = clean.split('-')[0].trim();
  }

  if (clean.includes('/')) {
    clean = clean.split('/')[0].trim();
  }

  const num = parseInt(clean, 10);
  return isNaN(num) || num <= 0 ? null : num;
}

/**
 * Obtiene el RPE objetivo por defecto y rango de reps según el goal del bloque.
 */
export function getRPETargetForGoal(sessionType) {
  return GOAL_DEFAULTS[sessionType] || { rpeTarget: 8.0, repsRange: [6, 12], label: 'General' };
}

/**
 * Calcula el VO2Max a partir de la distancia recorrida en el test de Cooper (12 min).
 * Fórmula: (distancia en metros - 504.9) / 44.73
 */
export function calculateCooperVO2Max(meters) {
  if (isNaN(meters) || meters <= 504.9) return 0;
  return Math.round(((meters - 504.9) / 44.73) * 10) / 10;
}

/**
 * Calcula el VO2Max a partir de la velocidad final en el test Course-Navette (Beep Test).
 * Fórmula para adultos: 31.025 + 3.238 * velocidadFinal - 3.248 * edad + 0.1536 * velocidadFinal * edad
 */
export function calculateBeepVO2Max(speedFinal, age) {
  if (isNaN(speedFinal) || isNaN(age) || speedFinal <= 0 || age <= 0) return 0;
  const vo2 = 31.025 + (3.238 * speedFinal) - (3.248 * age) + (0.1536 * speedFinal * age);
  return Math.round(vo2 * 10) / 10;
}

/**
 * Calcula la puntuación de disposición diaria (Readiness Score) y determina los ajustes de carga/volumen.
 * @param {object} wellness - { sleep, stress, doms, fatigue } valorados de 1 a 5
 * @param {number|null} cmjToday - altura del salto vertical hoy
 * @param {number|null} cmjAvg - media del salto vertical de los últimos 30 días
 */
export function calculateReadinessAdjuster(wellness, cmjToday = null, cmjAvg = null) {
  const { sleep = 5, stress = 5, doms = 5, fatigue = 5 } = wellness || {};
  
  // Normalizar WellnessScore de 0.0 a 1.0 (5 es excelente, 1 es pésimo)
  const wellnessScore = (sleep + stress + doms + fatigue) / 20;

  let jumpScore = 1.0;
  let hasJump = false;
  
  if (cmjToday && cmjAvg && cmjAvg > 0) {
    jumpScore = cmjToday / cmjAvg;
    hasJump = true;
  }

  // Ponderación: 60% wellness, 40% salto CMJ (si existe), si no 100% wellness
  const readinessScore = hasJump 
    ? (wellnessScore * 0.6) + (Math.min(1.2, jumpScore) * 0.4)
    : wellnessScore;

  let loadFactor = 1.0;
  let seriesModifier = 0; // 0 = sin cambio, -1 = quitar 1 serie, -99 = descarga (50%)
  let status = 'normal';
  let message = 'Tus niveles de fatiga y disposición son normales. Buen entreno.';

  if (readinessScore >= 0.85) {
    loadFactor = 1.05; // +5% empuje
    seriesModifier = 0;
    status = 'excelente';
    message = '¡Estado óptimo detectado! Cargas aumentadas un 5% para la sesión de hoy.';
  } else if (readinessScore >= 0.70) {
    loadFactor = 1.0;
    seriesModifier = 0;
    status = 'normal';
  } else if (readinessScore >= 0.55) {
    loadFactor = 0.95; // Conservar / Ajustar ligeramente a la baja
    seriesModifier = -1; // Reducir 1 serie
    status = 'fatiga_leve';
    message = 'Fatiga leve detectada. Carga disminuida un 5% y volumen reducido en 1 serie.';
  } else {
    loadFactor = 0.85; // Descarga reactiva (-15% carga)
    seriesModifier = -99; // Mitad de series
    status = 'fatiga_alta';
    message = '¡Fatiga alta detectada! Se recomienda descarga reactiva (-15% de carga y -50% de series) por seguridad.';
  }

  return {
    readinessScore: Math.round(readinessScore * 100) / 100,
    loadFactor,
    seriesModifier,
    status,
    message
  };
}
