/**
 * @typedef {Object} DayStreakInfo
 * @property {Date} date
 * @property {'rest'|'completed'|'pending'|'broken'} type
 * @property {string} [sessionId]
 */

/**
 * Computes the training streak based on scheduled sessions and session logs.
 * 
 * @param {Object} scheduledSessions - Map of dateISO to session data
 * @param {Array} sessionLogs - Array of session log objects
 * @param {Date} [referenceDate=new Date()] - The date to compute the streak from
 * @returns {{ currentStreak: number, days: DayStreakInfo[] }}
 */
export function computeTrainingStreak(scheduledSessions, sessionLogs, referenceDate = new Date()) {
  const pad = n => n.toString().padStart(2, '0');
  const formatISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  
  const refDate = new Date(referenceDate);
  refDate.setHours(0, 0, 0, 0);
  const refISO = formatISO(refDate);

  const getDayStatus = (d) => {
    const dateISO = formatISO(d);
    const session = scheduledSessions[dateISO];
    
    if (!session) {
      return { date: new Date(d), type: 'rest' };
    }
    
    const sId = session.id || session.sessionId;
    
    // TODO: Gap encontrado en matching de sesiones reprogramadas vs plantillas repetidas.
    // Si el usuario asigna la MISMA plantilla (ej. 'session-gym-1') a dos días distintos, 
    // comparten el mismo ID base. Al completar una, ambas darán match aquí porque `log.sessionId`
    // referenciará el ID de la plantilla, no una instancia única (instanceId).
    // Para que el reprogramado (reschedule) funcione 100% robusto sin depender de la fecha, necesitamos que 
    // `assignSessionToDay` genere un `instanceId` único y que `SessionLog` guarde ese `instanceId`.
    const hasLog = sessionLogs.some(log => log.sessionId === sId);
    
    if (hasLog) {
      return { date: new Date(d), type: 'completed', sessionId: sId };
    }
    
    if (dateISO < refISO) {
      return { date: new Date(d), type: 'broken', sessionId: sId };
    } else {
      return { date: new Date(d), type: 'pending', sessionId: sId };
    }
  };

  // 1. Array visual de los últimos 7 días (terminando en referenceDate)
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(refDate.getDate() - i);
    days.push(getDayStatus(d));
  }

  // 2. Cálculo puro de currentStreak
  let currentStreak = 0;
  let d = new Date(refDate);
  
  const allScheduledDates = Object.keys(scheduledSessions).sort();
  const earliestScheduledISO = allScheduledDates.length > 0 ? allScheduledDates[0] : null;
  
  const MAX_LOOKBACK = 3650; // Límite de seguridad (~10 años)
  let lookback = 0;
  
  while (lookback < MAX_LOOKBACK) {
    const dateISO = formatISO(d);
    // Optimización: si ya no hay más sesiones programadas hacia atrás, paramos
    if (earliestScheduledISO && dateISO < earliestScheduledISO) {
      break; 
    }

    const status = getDayStatus(d);
    
    if (status.type === 'broken') {
      break; // La racha se rompe en el primer 'broken' encontrado hacia atrás
    }
    
    if (status.type === 'completed') {
      currentStreak++;
    }
    
    // 'rest' y 'pending' no rompen la racha, continuamos mirando hacia atrás
    d.setDate(d.getDate() - 1);
    lookback++;
  }
  
  return { currentStreak, days };
}
