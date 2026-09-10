/**
 * exerciseAliases.js — Tabla de aliases: mapea nombres raw normalizados al ID canónico de la librería.
 *
 * Patrón idéntico a getCoachOverrides()/saveCoachOverride() en exerciseMetadata.js.
 *
 * Forma del valor en localStorage:
 *   { [normalizedRawName]: { targetId: string | null, reviewed?: boolean, createdAt: string } }
 *
 * targetId === null  → el coach ya revisó esta sugerencia y la rechazó (es un custom propio).
 * targetId !== null  → mapeo confirmado: este nombre raw es equivalente a la entrada de librería con ese ID.
 */

const LS_ALIASES_KEY = 'trainingos_exercise_aliases';

/**
 * Devuelve el mapa completo de aliases guardados en localStorage.
 * @returns {{ [normalizedRawName: string]: { targetId: string | null, reviewed?: boolean, createdAt: string } }}
 */
export function getExerciseAliases() {
  try {
    return JSON.parse(localStorage.getItem(LS_ALIASES_KEY) || '{}');
  } catch { return {}; }
}

/**
 * Guarda un alias confirmado: el nombre raw normalizado es equivalente al ID canónico.
 * @param {string} normalizedRawName
 * @param {string} targetId - ID canónico en EXERCISE_LIBRARY
 */
export function saveExerciseAlias(normalizedRawName, targetId) {
  const aliases = getExerciseAliases();
  aliases[normalizedRawName] = {
    targetId,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(LS_ALIASES_KEY, JSON.stringify(aliases));
}

/**
 * Devuelve el ID canónico mapeado a este nombre normalizado, o null si no existe alias.
 * @param {string} normalizedRawName
 * @returns {string | null}
 */
export function getAliasTarget(normalizedRawName) {
  const aliases = getExerciseAliases();
  return aliases[normalizedRawName]?.targetId ?? null;
}

/**
 * Marca un nombre raw como "ya revisado por el coach y rechazado como alias".
 * No generará más sugerencias automáticas, pero el ejercicio sigue siendo custom-* propio.
 * @param {string} normalizedRawName
 */
export function markNameAsReviewed(normalizedRawName) {
  const aliases = getExerciseAliases();
  aliases[normalizedRawName] = {
    targetId: null,
    reviewed: true,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(LS_ALIASES_KEY, JSON.stringify(aliases));
}

/**
 * Devuelve true si el coach ya revisó (y rechazó) la sugerencia para este nombre.
 * @param {string} normalizedRawName
 * @returns {boolean}
 */
export function wasNameReviewed(normalizedRawName) {
  const aliases = getExerciseAliases();
  return aliases[normalizedRawName]?.reviewed === true;
}
