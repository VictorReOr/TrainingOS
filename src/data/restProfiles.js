// ══════════════════════════════════════════════════════════════════════════════
// REST PROFILES — Perfiles de descanso predefinidos
// TrainingOS · src/data/restProfiles.js
//
// Valores en segundos.
// Consumidos por blockExecutionResolver.js para resolver el descanso
// cuando block.execution.restProfile.mode === 'preset'.
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Perfiles de descanso predefinidos para los tipos de bloque más comunes.
 *
 * @typedef {Object} RestPreset
 * @property {number} restAfterExercise  — segundos entre ejercicios dentro del bloque
 * @property {number} restAfterBlock     — segundos al finalizar el bloque completo
 *
 * @type {Record<string, RestPreset>}
 */
export const REST_PRESETS = {
  // ── Contraste ───────────────────────────────────────────────────────────────
  // Descanso corto entre prime y potentiator; descanso largo al completar el par.
  CONTRAST_STANDARD: { restAfterExercise: 20,  restAfterBlock: 150 },
  CONTRAST_HEAVY:    { restAfterExercise: 30,  restAfterBlock: 180 },

  // ── Superseries ─────────────────────────────────────────────────────────────
  // Descanso mínimo entre A y B; descanso moderado al completar la ronda.
  SUPERSET_STRENGTH:  { restAfterExercise: 15, restAfterBlock: 90 },
  SUPERSET_ACCESSORY: { restAfterExercise: 10, restAfterBlock: 45 },

  // ── Pliometría ──────────────────────────────────────────────────────────────
  // Descanso completo entre series para mantener calidad de potencia.
  PLYOMETRIC: { restAfterExercise: 30, restAfterBlock: 120 },

  // ── Serie recta (legacy-compatible) ─────────────────────────────────────────
  // restAfterExercise: 0 → se usa ex.restSeconds del ejercicio individual.
  // restAfterBlock aplica el descanso global al terminar el bloque.
  STRAIGHT_SET_DEFAULT: { restAfterExercise: 0, restAfterBlock: 120 },
};
