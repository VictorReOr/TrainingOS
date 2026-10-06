/**
 * getLocalISO(dateLike) → "YYYY-MM-DD" en hora LOCAL del dispositivo.
 *
 * Nunca usa toISOString() — ese devuelve UTC y puede desplazar el día
 * en zonas horarias UTC+N (ej. madrugada local → día anterior en UTC).
 *
 * @param {Date|string|number} dateLike
 * @returns {string}  "YYYY-MM-DD"
 */
export function getLocalISO(dateLike) {
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * isSessionCompleted(logs, { instanceId, sessionId, dateISO })
 *
 * Determina si una sesión planificada ya tiene un log registrado.
 *
 * Prioridad de matching:
 *   a) Si instanceId Y log.instanceId existen → compara por instanceId exacto.
 *      Diferencia repeticiones de la misma plantilla en días distintos.
 *   b) Si no → compara sessionId + fecha local (YYYY-MM-DD via getLocalISO).
 *      Compatible con logs antiguos que no tienen instanceId.
 *
 * SIN fallback por sessionId solo (sin fecha): evita falsos positivos cuando
 * hay logs históricos del mismo sessionId de semanas anteriores (caso f).
 *
 * @param {Array}   logs               – array de logEntry desde localStorage
 * @param {object}  opts
 * @param {string}  [opts.instanceId]  – instanceId de la asignación/sesión actual
 * @param {string}  opts.sessionId     – sessionId (id de la plantilla)
 * @param {string}  opts.dateISO       – "YYYY-MM-DD" del día evaluado (hora local)
 * @returns {boolean}
 */
export function isSessionCompleted(logs, { instanceId, sessionId, dateISO }) {
  return logs.some((log) => {
    // Rama a: ambos lados tienen instanceId → comparación exacta
    if (instanceId && log.instanceId) {
      return log.instanceId === instanceId;
    }
    // Rama b: fallback por sessionId + fecha local (requiere dateISO)
    if (!dateISO) return false;
    return (
      log.sessionId === sessionId &&
      log.fecha != null &&
      getLocalISO(log.fecha) === dateISO
    );
  });
}
