/**
 * exerciseNaming.js
 * Utilidades para humanizar identificadores de ejercicios custom.
 */

/**
 * Convierte un ID de ejercicio custom en un nombre legible para el usuario.
 *
 * Ejemplos:
 *   humanizeExerciseSlug('custom-jalon-al-pecho-agarre-neutro')
 *     → 'Jalon Al Pecho Agarre Neutro'
 *   humanizeExerciseSlug('custom-press-banca')
 *     → 'Press Banca'
 *   humanizeExerciseSlug('press-banca')    // sin prefijo custom-
 *     → 'Ejercicio'
 *   humanizeExerciseSlug(null)
 *     → 'Ejercicio'
 *
 * @param {string|null|undefined} id - El ID del ejercicio (ej. 'custom-jalon-al-pecho')
 * @returns {string} Nombre humanizado o 'Ejercicio' como fallback
 */
export function humanizeExerciseSlug(id) {
  if (!id || typeof id !== 'string' || !id.startsWith('custom-')) {
    return 'Ejercicio';
  }

  const slug = id.slice('custom-'.length); // quitar prefijo 'custom-'

  if (!slug) return 'Ejercicio';

  // Reemplazar guiones por espacios y capitalizar cada palabra
  return slug
    .split('-')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
