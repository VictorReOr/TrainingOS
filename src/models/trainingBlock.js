// ══════════════════════════════════════════════════════════════════════════════
// TRAINING BLOCK — Domain Model
// TrainingOS · src/models/trainingBlock.js
//
// Este archivo define los tipos y constantes para el campo `block.execution`,
// que es un campo OPCIONAL añadido a los bloques existentes.
//
// La forma completa de un bloque con execution es:
//   {
//     id,          // string   — ya existía
//     type,        // string   — ya existía ('fuerza', 'movilidad', etc.)
//     color,       // string   — ya existía (hex)
//     name,        // string   — ya existía
//     duration,    // string   — ya existía ('25 min')
//     exercises,   // array    — ya existía
//     execution?,  // TrainingBlockExecution — NUEVO, completamente opcional
//   }
//
// Los campos existentes (type, color, duration) NO se renombran ni eliminan.
// Las 6 UIs que dependen de ellos (CircuitPlayer, BlockTypeSelector, etc.)
// siguen funcionando sin cambios.
// ══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// TYPEDEFS (JSDoc)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tipo de ejecución del bloque — determina cómo se secuencian los ejercicios
 * y cómo se calcula el descanso durante la sesión activa.
 *
 * @typedef {'STRAIGHT_SET' | 'SUPERSET' | 'CONTRAST' | 'COMPLEX' | 'INTERVAL'} BlockExecutionType
 *
 * - STRAIGHT_SET : Ejercicios en serie independiente (comportamiento legacy).
 * - SUPERSET     : Dos ejercicios alternados sin descanso entre ellos.
 * - CONTRAST     : Ejercicio primario + potenciador post-activación (PAP).
 * - COMPLEX      : Movimientos encadenados del mismo patrón (ej. haltera→salto).
 * - INTERVAL     : Trabajo y descanso definidos por tiempo (HIIT, Tabata).
 */

/**
 * Intención de la sesión — contexto macro que puede influir en cómo
 * el resolver selecciona perfiles de descanso por defecto.
 *
 * @typedef {'MAX_STRENGTH' | 'STRENGTH_POWER' | 'POWER' | 'REACTIVE' | 'HYPERTROPHY' | 'CONDITIONING' | 'RECOVERY'} SessionIntent
 */

/**
 * Referencia a un perfil de descanso predefinido o custom.
 *
 * @typedef {Object} RestProfileRef
 * @property {'PRESET' | 'CUSTOM'} mode
 *   - 'PRESET': usa un id de REST_PRESETS (src/data/restProfiles.js)
 *   - 'CUSTOM': usa los valores de `custom` directamente
 * @property {string} [presetId]        — requerido si mode === 'PRESET'
 * @property {CustomRest} [custom]      — requerido si mode === 'CUSTOM'
 */

/**
 * Valores de descanso custom definidos por el entrenador.
 *
 * @typedef {Object} CustomRest
 * @property {number} restAfterExercise  — segundos de descanso entre ejercicios del bloque
 * @property {number} restAfterBlock     — segundos de descanso al finalizar el bloque completo
 */

/**
 * Datos de ejecución de un bloque de entrenamiento.
 * Campo completamente opcional en el objeto bloque.
 *
 * @typedef {Object} TrainingBlockExecution
 * @property {BlockExecutionType} type          — tipo de ejecución
 * @property {Object.<string, string>} [exerciseRoles] — mapa exerciseId → rol
 *   (ej. { 'lib-squat-01': 'PRIME', 'lib-jump-01': 'POTENTIATOR' }).
 *   Se usa exerciseId como clave, NUNCA posición/índice, para que reordenar o
 *   insertar ejercicios en el bloque no desplace los roles silenciosamente.
 * @property {RestProfileRef} [restProfile]     — perfil de descanso.
 *   Si no existe, resolveRestSeconds() devuelve null → se usa ex.restSeconds legacy.
 * @property {SessionIntent} [sessionIntent]    — intención macro de la sesión.
 *   Informativo; puede usarse en fases futuras para sugerir perfiles de descanso.
 */

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES DE ROLES POR TIPO DE EJECUCIÓN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Roles esperados para los ejercicios de cada tipo de bloque.
 *
 * @type {Record<BlockExecutionType, string[]>}
 *
 * @example
 * // Bloque CONTRAST con 2 ejercicios:
 * //   exerciseRoles['ex-1'] → 'PRIME'       (ej. Sentadilla pesada)
 * //   exerciseRoles['ex-2'] → 'POTENTIATOR' (ej. Salto en cajón)
 * BLOCK_ROLE_CONFIG.CONTRAST // ['PRIME', 'POTENTIATOR']
 */
export const BLOCK_ROLE_CONFIG = {
  CONTRAST:     ['PRIME', 'POTENTIATOR'],
  SUPERSET:     ['A', 'B'],
  STRAIGHT_SET: ['WORK'],
  COMPLEX:      ['PRIME', 'POTENTIATOR'],
  INTERVAL:     ['WORK', 'REST'],
};
