/**
 * Fórmulas de estimación de 1RM.
 * Solo válidas hasta ~15 reps.
 * A partir de 15 reps la fiabilidad cae significativamente.
 */

/**
 * Fórmula de Epley (más común, sobreestima a reps altas).
 *
 * @param {number} weight - Peso levantado en kg
 * @param {number} reps   - Repeticiones realizadas
 * @returns {number} 1RM estimado en kg
 */
export function epley(weight, reps) {
  if (reps === 1) return weight;
  if (reps > 15) reps = 15; // cap para mantener fiabilidad
  return weight * (1 + reps / 30);
}

/**
 * Fórmula de Brzycki (más precisa a reps medias 4–10).
 *
 * @param {number} weight - Peso levantado en kg
 * @param {number} reps   - Repeticiones realizadas
 * @returns {number} 1RM estimado en kg
 */
export function brzycki(weight, reps) {
  if (reps === 1) return weight;
  if (reps >= 37) return weight; // evitar división por cero
  return weight * (36 / (37 - reps));
}

/**
 * Promedio de Epley y Brzycki.
 * Si la discrepancia entre ambas es > 10%, promediar.
 * Más estable en rangos extremos de reps.
 *
 * @param {number} weight - Peso levantado en kg
 * @param {number} reps   - Repeticiones realizadas
 * @returns {number} 1RM estimado en kg
 */
export function averageEstimate(weight, reps) {
  const e = epley(weight, reps);
  const b = brzycki(weight, reps);
  const diff = Math.abs(e - b) / Math.max(e, b);
  if (diff > 0.10) return (e + b) / 2;
  return e;
}

/**
 * Punto de entrada principal para estimación de 1RM.
 *
 * @param {number} weight  - Peso levantado en kg
 * @param {number} reps    - Repeticiones realizadas
 * @param {string} formula - 'epley' | 'brzycki' | 'average'
 * @returns {number} 1RM estimado en kg
 */
export function estimate1RM(weight, reps, formula = 'epley') {
  switch (formula) {
    case 'brzycki': return brzycki(weight, reps);
    case 'average': return averageEstimate(weight, reps);
    default:        return epley(weight, reps);
  }
}
