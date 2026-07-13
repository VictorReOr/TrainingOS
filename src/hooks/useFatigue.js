import { useMemo } from 'react';

const LS_KEY = 'trainingos_session_logs';

/**
 * Reads session logs from localStorage.
 * Each log should have: { fecha: 'YYYY-MM-DD' | 'DD/MM/YYYY', rpe?: number, atletaId?: string }
 */
function getSessionLogs(atletaId) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw);
    if (!Array.isArray(all)) return [];
    // Filter by athlete if provided
    if (atletaId) {
      return all.filter(l => l.atletaId === atletaId);
    }
    return all;
  } catch {
    return [];
  }
}

/**
 * Parse a date string in either YYYY-MM-DD or DD/MM/YYYY format.
 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  // Try YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return new Date(dateStr);
  }
  // Try DD/MM/YYYY
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
  return new Date(dateStr);
}

/**
 * Weight factor based on how many days ago the session was.
 */
function getWeight(daysAgo) {
  if (daysAgo <= 0) return 1.0;
  if (daysAgo <= 1) return 0.85;
  if (daysAgo <= 2) return 0.7;
  if (daysAgo <= 4) return 0.5;
  return 0.3;
}

const LEVELS = {
  DESCANSADO: {
    level: 'DESCANSADO',
    color: '#27ae60',
    emoji: '🟢',
    label: 'Descansado',
    mensaje: 'Listo para entrenar fuerte',
  },
  CARGADO: {
    level: 'CARGADO',
    color: '#FF6B00',
    emoji: '🟡',
    label: 'Cargado',
    mensaje: 'Carga moderada acumulada',
  },
  SOBREENTRENADO: {
    level: 'SOBREENTRENADO',
    color: '#e8412a',
    emoji: '🔴',
    label: 'Sobreentrenado',
    mensaje: 'Considera un día de descanso',
  },
  SIN_DATOS: {
    level: 'SIN_DATOS',
    color: '#E8E8E4',
    emoji: '⚪',
    label: 'Sin datos',
    mensaje: 'Completa sesiones para ver tu nivel de fatiga',
  },
};

/**
 * useFatigue — calculates accumulated fatigue from recent RPE data.
 * @param {string} [atletaId] — optional athlete ID to scope logs
 */
export function useFatigue(atletaId) {
  return useMemo(() => {
    const logs = getSessionLogs(atletaId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Filter last 7 days
    const recentLogs = logs.filter(log => {
      const logDate = parseDate(log.fecha);
      if (!logDate) return false;
      const diffMs = today - logDate;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays < 7;
    });

    // Count sessions in last 5 days
    const last5Days = logs.filter(log => {
      const logDate = parseDate(log.fecha);
      if (!logDate) return false;
      const diffMs = today - logDate;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays < 5;
    });
    const sesionesRecientes = last5Days.length;

    // Not enough data
    if (recentLogs.length < 2) {
      return {
        ...LEVELS.SIN_DATOS,
        rpePonderado: 0,
        sesionesRecientes,
      };
    }

    // Weighted RPE calculation
    let weightedSum = 0;
    let weightTotal = 0;

    recentLogs.forEach(log => {
      const rpe = parseFloat(log.rpe);
      if (isNaN(rpe)) return;
      const logDate = parseDate(log.fecha);
      const diffDays = Math.floor((today - logDate) / (1000 * 60 * 60 * 24));
      const weight = getWeight(diffDays);
      weightedSum += rpe * weight;
      weightTotal += weight;
    });

    const rpePonderado = weightTotal > 0 ? Math.round((weightedSum / weightTotal) * 10) / 10 : 0;

    // If we have logs but none with RPE values, return SIN_DATOS
    if (weightTotal === 0) {
      return {
        ...LEVELS.SIN_DATOS,
        rpePonderado: 0,
        sesionesRecientes,
      };
    }

    // Determine level
    let result;

    if (rpePonderado > 8.0 || sesionesRecientes > 4) {
      result = LEVELS.SOBREENTRENADO;
    } else if (rpePonderado < 6.5 || sesionesRecientes < 2) {
      result = LEVELS.DESCANSADO;
    } else {
      result = LEVELS.CARGADO;
    }

    return {
      ...result,
      rpePonderado,
      sesionesRecientes,
    };
  }, [atletaId]);
}
