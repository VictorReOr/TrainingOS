/**
 * Decaimiento exponencial de la fatiga.
 * La fatiga de hace 48h vale la mitad que la de ahora.
 *
 * @param {number} value      - Valor inicial a decaer
 * @param {number} hoursElapsedVal - Horas transcurridas
 * @param {number} halfLifeHours   - Vida media en horas (default 48h)
 * @returns {number} Valor decaído
 */
export function exponentialDecay(value, hoursElapsedVal, halfLifeHours = 48) {
  return value * Math.pow(0.5, hoursElapsedVal / halfLifeHours);
}

/**
 * Calcula las horas transcurridas desde una fecha ISO.
 *
 * @param {string} dateISO - Fecha en formato ISO 8601
 * @returns {number} Horas transcurridas desde esa fecha
 */
export function hoursElapsed(dateISO) {
  const then = new Date(dateISO).getTime();
  const now = Date.now();
  return (now - then) / (1000 * 60 * 60);
}
