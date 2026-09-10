// ══════════════════════════════════════════════════════════════════════════════
// BLOCK EXECUTION RESOLVER — Funciones puras de resolución
// TrainingOS · src/utils/blockExecutionResolver.js
// ══════════════════════════════════════════════════════════════════════════════

import { REST_PRESETS } from '../data/restProfiles.js';

/**
 * Obtiene el tipo de ejecución de un bloque.
 * Si el bloque no tiene el campo opcional `execution`, asume 'STRAIGHT_SET' (legacy).
 *
 * @param {Object} [block] - Objeto de bloque de entrenamiento
 * @returns {import('../models/trainingBlock.js').BlockExecutionType}
 */
export function getBlockExecutionType(block) {
  return block?.execution?.type || 'STRAIGHT_SET';
}

/**
 * Resuelve los segundos de descanso correspondientes a una fase específica ('exercise' o 'block').
 *
 * - Si el bloque tiene un `restProfile` configurado, resuelve según el modo ('PRESET' o 'CUSTOM').
 * - Si el bloque NO tiene `execution` o `restProfile` (bloque legacy o sin perfil explícito),
 *   devuelve `null` para indicar que se debe utilizar el comportamiento existente (ex.restSeconds).
 *
 * @param {Object} [block] - Objeto de bloque de entrenamiento
 * @param {'exercise' | 'block'} phase - Fase de descanso a consultar
 * @returns {number | null} Segundos de descanso resueltos, o null si es legacy / sin perfil
 */
export function resolveRestSeconds(block, phase) {
  const restProfile = block?.execution?.restProfile;
  if (!restProfile) {
    return null;
  }

  const key = phase === 'exercise' ? 'restAfterExercise' : 'restAfterBlock';

  if (restProfile.mode === 'PRESET' && restProfile.presetId) {
    const preset = REST_PRESETS[restProfile.presetId];
    if (preset && typeof preset[key] === 'number') {
      return preset[key];
    }
  }

  if (restProfile.mode === 'CUSTOM' && restProfile.custom) {
    if (typeof restProfile.custom[key] === 'number') {
      return restProfile.custom[key];
    }
  }

  return null;
}
