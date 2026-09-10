/**
 * resolveSessionIntent
 *
 * Resuelve el SessionIntent del engine (enum en src/models/trainingBlock.js)
 * a partir de la sesión planificada para hoy (todaySession del PlannerContext).
 *
 * Jerarquía de resolución:
 *   1. sessionData.type → TYPE_TO_INTENT (mapping directo de tipo de sesión)
 *   2. Fallback: goal dominante entre los bloques → GOAL_TO_INTENT
 *   3. Sin datos suficientes → null (engine opera sin intent, sin cambio de comportamiento)
 *
 * Esta función es pura — sin efectos secundarios, sin imports de contextos React.
 */

// Mapeo: SESSION_TYPES (mockPlanner.js) → SessionIntent (trainingBlock.js)
const TYPE_TO_INTENT = {
  gym_potencia:  'POWER',
  gym_fuerza:    'MAX_STRENGTH',
  gym_hipertrofia: 'HYPERTROPHY',
  tkd:           'REACTIVE',
  tkd_sparring:  'CONDITIONING',
  cardio:        'CONDITIONING',
  descanso:      'RECOVERY',
};

// Mapeo: block.goal (EditableBlock.jsx / GOAL_DEFAULTS en overloadEngine.js) → SessionIntent
const GOAL_TO_INTENT = {
  gym_fuerza:      'MAX_STRENGTH',
  fuerza_maxima:   'MAX_STRENGTH',
  gym_hipertrofia: 'HYPERTROPHY',
  hipertrofia:     'HYPERTROPHY',
  gym_potencia:    'POWER',
  resistencia:     'CONDITIONING',
};

/**
 * Resuelve el SessionIntent para la sesión de hoy.
 *
 * @param {Object|null} todaySession - Objeto sessionData del PlannerContext.weekSessions[todayKey],
 *                                     o null si no hay sesión planificada.
 * @returns {string|null} SessionIntent enum value, or null if not determinable.
 */
export function resolveSessionIntent(todaySession) {
  if (!todaySession) return null;

  // 1. Resolución directa desde el tipo de sesión
  const fromType = TYPE_TO_INTENT[todaySession.type];
  if (fromType) return fromType;

  // 2. Fallback: goal dominante entre los bloques de la sesión
  const goals = (todaySession.blocks || [])
    .map(b => b.goal)
    .filter(Boolean);

  if (goals.length === 0) return null;

  const counts = {};
  goals.forEach(g => { counts[g] = (counts[g] || 0) + 1; });

  const dominant = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  return GOAL_TO_INTENT[dominant] ?? null;
}
