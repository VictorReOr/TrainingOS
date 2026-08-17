/**
 * TrainingOS — Capa de red Google Sheets
 * Configura VITE_SHEETS_API_URL en .env.local para activar el backend real.
 * Con VITE_USE_MOCK=true todos los métodos devuelven datos simulados con
 * latencia artificial de 300 ms, sin tocar la red.
 */

import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_SHEETS_API_URL;
console.log('[DEBUG] API_URL activa:', API_URL);

export const USE_SHEETS = !!import.meta.env.VITE_SHEETS_API_URL && import.meta.env.VITE_USE_MOCK !== 'true';

export function getAtletaId() {
  return auth.currentUser?.uid || null;
}

// ─── Base request ─────────────────────────────────────────────────────────────
async function _delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Cola de concurrencia GET ────────────────────────────────────────────────
// Apps Script serializa ejecuciones del mismo usuario/script. Múltiples GET
// simultáneos (getLogs, getPRs, getWeekAssignments, getRoutineAssignments)
// al montar /profile provocan que las últimas queden encoladas del lado de
// Google y superen el timeout del cliente. Limitamos a 2 GET en vuelo.
const MAX_CONCURRENT_GET = 2;
let _activeGets = 0;
const _getQueue = [];

function _acquireGetSlot(action) {
  if (_activeGets < MAX_CONCURRENT_GET) {
    _activeGets++;
    return Promise.resolve();
  }
  return new Promise(resolve => _getQueue.push({ resolve, action }));
}

function _releaseGetSlot(action) {
  if (_getQueue.length > 0) {
    const next = _getQueue.shift();
    // Slot se transfiere al siguiente — no decrementamos _activeGets
    next.resolve();
  } else {
    _activeGets--;
  }
}

// ─── Fetch unitario (sin modificaciones) ─────────────────────────────────────
async function _singleFetch(method, action, data) {
  const timeoutMs = method === 'GET' ? 15000 : 8000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let res;
    const currentId = getAtletaId();

    // Obtener ID Token de Firebase para verificación server-side
    const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;

    if (method === 'GET') {
      const params = new URLSearchParams({ action, atleta_id: currentId, ...data });
      // Inyectar token como query param para verificación server-side
      if (idToken) params.set('id_token', idToken);
      res = await fetch(`${API_URL}?${params.toString()}`, { signal: controller.signal });
    } else {
      res = await fetch(API_URL, {
        method:  'POST',
        body:    JSON.stringify({ action, atletaId: currentId, idToken, ...data }),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        signal:  controller.signal,
      });
    }

    const json = await res.json();
    if (json.status === 'error') throw new Error(json.message || 'Error del servidor');
    console.log(`[Sheets] ${method} ${action} → ok`, json);
    return json;
  } catch (err) {
    if (err.name === 'AbortError') {
      const sec = timeoutMs / 1000;
      const abortErr = new Error(`[Sheets] Timeout en ${action} (${sec}s)`);
      abortErr.name = 'AbortError';
      throw abortErr;
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Función base de red.
 * @param {'GET'|'POST'} method
 * @param {string} action  — nombre de la acción del enrutador backend
 * @param {object} [data]  — payload para POST o params adicionales para GET
 * @param {object} [mockFn] — función que devuelve datos mock (sólo se llama si USE_MOCK)
 */
async function _request(method, action, data = {}, mockFn = null) {
  const isDemo = localStorage.getItem('trainingos_demo_mode') !== null 
    ? localStorage.getItem('trainingos_demo_mode') === 'true' 
    : import.meta.env.VITE_USE_MOCK === 'true';

  if (isDemo) {
    await _delay(300);
    const result = mockFn ? await mockFn() : { rows: [] };
    console.log(`[Sheets MOCK] ${method} ${action}`, result);
    return result;
  }

  if (!API_URL) {
    console.warn('[Sheets] VITE_SHEETS_API_URL no configurada. Usando modo offline.');
    return mockFn ? await mockFn() : { rows: [] };
  }

  // ── GET: cola de concurrencia (máx MAX_CONCURRENT_GET en vuelo) ──
  if (method === 'GET') {
    await _acquireGetSlot(action);
    try {
      // Intento 1
      try {
        return await _singleFetch(method, action, data);
      } catch (err) {
        if (err.name === 'AbortError') {
          console.warn(`[Sheets] Timeout en primer intento para ${action}, reintentando...`);
          // Intento 2 (reintento) — mismo slot, mismo finally
          try {
            return await _singleFetch(method, action, data);
          } catch (retryErr) {
            if (retryErr.name === 'AbortError') {
              throw new Error(`[Sheets] Timeout en ${action} tras 2 intentos (15s c/u)`);
            }
            throw retryErr;
          }
        }
        throw new Error(`[Sheets] ${action}: ${err.message}`);
      }
    } finally {
      // SIEMPRE se libera: éxito, error, abort, retry fallido — sin excepción.
      _releaseGetSlot(action);
    }
  }

  // ── POST: ejecución directa, sin cola, con reintento único ──
  try {
    return await _singleFetch(method, action, data);
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn(`[Sheets] Timeout en primer intento POST para ${action}, reintentando...`);
      try {
        return await _singleFetch(method, action, data);
      } catch (retryErr) {
        if (retryErr.name === 'AbortError') {
          throw new Error(`[Sheets] Timeout en ${action} tras 2 intentos (8s c/u)`);
        }
        throw retryErr;
      }
    }
    throw new Error(`[Sheets] ${action}: ${err.message}`);
  }
}

// ─── Mock data helpers ────────────────────────────────────────────────────────
function _mockFromLocalStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

// ─── Autenticación con Firebase ───────────────────────────────────────────────

export async function registerUser(uid, email, name, role) {
  return _request('POST', 'register', { uid, email, name, role }, async () => {
    // Mock register
    return { status: 'success', user: { id: uid, email, name, role } };
  });
}

// ─── Escritura (POST) ─────────────────────────────────────────────────────────

/**
 * Guarda el log de una sesión completa (series por ejercicio).
 * @param {{ atletaId, fecha, ejercicios: [{id, seriesLog}] }} payload
 */
export async function saveLog(payload) {
  return _request('POST', 'savelog', payload, async () => ({
    status: 'success',
    saved:  (payload.ejercicios || []).reduce((acc, ex) => acc + (ex.seriesLog || []).length, 0),
  }));
}

/**
 * Guarda una temporada nueva.
 */
export async function saveSeason(seasonData) {
  return _request('POST', 'saveSeason', seasonData, async () => ({
    status: 'success', id: seasonData.id || `mock-${Date.now()}`,
  }));
}

/**
 * Guarda un mesociclo dentro de una temporada.
 */
export async function saveMesocycle(mesoData) {
  return _request('POST', 'saveMesocycle', mesoData, async () => ({
    status: 'success', id: mesoData.id || `mock-${Date.now()}`,
  }));
}

/**
 * Guarda o actualiza una plantilla de sesión.
 */
export async function saveSession(sessionData) {
  return _request('POST', 'saveSession', sessionData, async () => ({
    status: 'success', id: sessionData.id || `mock-${Date.now()}`,
  }));
}

/**
 * Asigna una sesión a una fecha específica del calendario.
 */
export async function assignSessionToDay(assignData) {
  return _request('POST', 'assignSession', assignData, async () => ({
    status: 'success', id: `mock-${Date.now()}`,
  }));
}

/**
 * Guarda un récord personal.
 */
export async function savePR(prData) {
  return _request('POST', 'savePR', prData, async () => ({
    status: 'success', id: `mock-${Date.now()}`,
  }));
}

/**
 * Guarda una plantilla del timer/circuito.
 */
export async function saveTimerTemplate(template) {
  return _request('POST', 'saveTimerTemplate', template, async () => ({
    status: 'success', id: template.id || `mock-${Date.now()}`,
  }));
}

/**
 * Exporta y comparte una sesión.
 */
export async function shareSession(payload) {
  return _request('POST', 'shareSession', payload, async () => {
    try {
      const local = JSON.parse(localStorage.getItem('trainingos_shared_sessions') || '{}');
      local[payload.code] = payload.sessionData;
      localStorage.setItem('trainingos_shared_sessions', JSON.stringify(local));
    } catch (e) {}
    return { status: 'success', code: payload.code };
  });
}

// ─── Lectura (GET) ────────────────────────────────────────────────────────────

/**
 * Recupera los logs de entrenamiento.
 * @param {string} [atletaId]
 * @param {{ fechaDesde: string, fechaHasta: string }} [dateRange]
 */
export async function getLogs(atletaId, dateRange = {}) {
  const currentId = atletaId || getAtletaId();
  return _request('GET', 'getLogs', { atleta_id: currentId, ...dateRange }, async () => ({
    status: 'success', rows: [],
  }));
}

/**
 * Recupera temporadas con mesociclos anidados.
 */
export async function getSeasons(atletaId) {
  const currentId = atletaId || getAtletaId();
  return _request('GET', 'getSeasons', { atleta_id: currentId }, async () => {
    const { MOCK_SEASONS } = await import('../data/mockPlanner.js');
    return { status: 'success', rows: MOCK_SEASONS };
  });
}

// ==========================================
// Workouts / Rutinas de Excel
// ==========================================

/**
 * Red de seguridad defensiva contra la autoconversión de fecha de Google Sheets.
 *
 * Google Sheets puede interpretar rangos de reps como "8-10" como fechas
 * (ej: 8 oct) y devolver un ISO string en vez del texto original.
 * getDisplayValues() en el backend (Capa 1) es el fix principal;
 * esta función es la segunda línea de defensa en el frontend.
 *
 * Si detecta una fecha ISO en un campo de texto libre:
 *  - Loguea un warning claro para facilitar el diagnóstico.
 *  - Devuelve null en vez de mostrar la fecha absurda en la UI.
 *
 * @param {*} value  — valor crudo del campo
 * @param {string} fieldName — nombre del campo (para el log)
 * @param {string} [ejercicio] — nombre del ejercicio (para el log)
 * @returns {*} valor saneado
 */
function sanitizeRepsField(value, fieldName, ejercicio) {
  if (typeof value !== 'string') return value;

  // Detecta si el valor parece una fecha ISO (señal de corrupción por Sheets)
  const looksLikeISODate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);

  if (looksLikeISODate) {
    console.warn(
      `[sheets] Campo "${fieldName}" corrompido detectado` +
      (ejercicio ? ` en ejercicio "${ejercicio}"` : '') +
      ` (posible autoconversión de fecha en Sheets): "${value}".` +
      ` Revisar y corregir la celda de origen en la hoja de cálculo` +
      ` (Formato → Número → Texto sin formato, o anteponer apóstrofe: '${fieldName}).`
    );
    return null; // Fallar de forma visible, no mostrar la fecha cruda al usuario
  }

  return value;
}

/**
 * Sanitiza una fila cruda de la hoja 'workouts' aplicando
 * sanitizeRepsField() a todas las columnas de texto libre vulnerables.
 *
 * @param {object} row — fila cruda devuelta por getWorkouts
 * @returns {object} fila saneada
 */
function sanitizeWorkoutRow(row) {
  const TEXT_FREE_FIELDS = ['series', 'repeticiones', 'tiempo_ejecucion', 'tiempo_descanso'];
  const ejercicio = row.ejercicio || '';

  const sanitized = { ...row };
  TEXT_FREE_FIELDS.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = sanitizeRepsField(sanitized[field], field, ejercicio);
    }
  });
  return sanitized;
}

/**
 * Guarda (reemplazando duplicados por rutinaId+coachId) las filas de una rutina.
 * @param {string} rutinaId
 * @param {Array<object>} rows — filas planas (mismo formato que consume parseWorkouts)
 */
export async function saveWorkouts(rutinaId, rows) {
  const coachId = getAtletaId();
  return _request('POST', 'saveWorkouts', { rutinaId, coachId, rows }, async () => {
    // Mock: persistir en localStorage bajo una clave propia para no chocar con trainingos_session_templates
    try {
      const key = 'trainingos_local_workouts';
      const all = JSON.parse(localStorage.getItem(key) || '{}');
      all[`${coachId}_${rutinaId}`] = rows;
      localStorage.setItem(key, JSON.stringify(all));
    } catch (e) {}
    return { status: 'success', saved: rows.length };
  });
}

/**
 * Asigna una rutina a uno o varios atletas.
 * @param {string} rutinaId
 * @param {string[]} atletaIds
 */
export async function assignRoutine(rutinaId, atletaIds) {
  const coachId = getAtletaId();
  return _request('POST', 'assignRoutine', { rutinaId, coachId, atletaIds }, async () => {
    try {
      const key = 'trainingos_routine_assignments';
      const all = JSON.parse(localStorage.getItem(key) || '[]');
      const newIds = [];
      atletaIds.forEach(aid => {
        const id = `mock-assign-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        all.push({
          id,
          rutina_id: rutinaId,
          coach_id: coachId,
          atleta_id: aid,
          active: false,
          assigned_at: new Date().toISOString()
        });
        newIds.push(id);
      });
      localStorage.setItem(key, JSON.stringify(all));
      return { status: 'success', ids: newIds };
    } catch (e) {
      return { status: 'success', ids: atletaIds.map(() => `mock-assign-${Date.now()}`) };
    }
  });
}

/**
 * Activa una rutina asignada (desactiva cualquier otra activa del mismo atleta).
 * @param {string} assignmentId
 * @param {string} [atletaId]
 */
export async function activateRoutine(assignmentId, atletaId) {
  const currentId = atletaId || getAtletaId();
  return _request('POST', 'activateRoutine', { assignmentId, atletaId: currentId }, async () => {
    try {
      const key = 'trainingos_routine_assignments';
      const all = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = all.map(item => {
        if (item.atleta_id === currentId) {
          return { ...item, active: item.id === assignmentId };
        }
        return item;
      });
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {}
    return { status: 'success', activated: assignmentId };
  });
}

/**
 * Recupera todas las rutinas asignadas al atleta actual (activas e inactivas).
 */
export async function getRoutineAssignments(atletaId) {
  const currentId = atletaId || getAtletaId();
  return _request('GET', 'getRoutineAssignments', { atleta_id: currentId }, async () => {
    try {
      const key = 'trainingos_routine_assignments';
      const all = JSON.parse(localStorage.getItem(key) || '[]');
      const rows = all.filter(item => item.atleta_id === currentId);
      return { status: 'success', rows };
    } catch (e) {
      return { status: 'success', rows: [] };
    }
  });
}

export async function fetchWorkouts(rutinaId = '') {
  const coachId = getAtletaId();
  const result = await _request('GET', 'getWorkouts', { rutina_id: rutinaId, coach_id: coachId }, async () => {
    try {
      const key = 'trainingos_local_workouts';
      const all = JSON.parse(localStorage.getItem(key) || '{}');
      let rows = [];
      Object.entries(all).forEach(([k, workoutRows]) => {
        // k es formato `${coachId}_${rutinaId}`
        if (Array.isArray(workoutRows)) {
          if (!rutinaId || k.endsWith(`_${rutinaId}`)) {
            rows = rows.concat(workoutRows);
          }
        }
      });
      return { status: 'success', rows };
    } catch (e) {
      return { status: 'success', rows: [] };
    }
  });

  // Aplicar sanitización defensiva a cada fila antes de devolver los datos.
  // Esto captura cualquier corrupción de fecha que el backend no haya podido
  // evitar (p.ej. si la celda en Sheets ya estaba en tipo Date antes del fix).
  if (Array.isArray(result.rows)) {
    result.rows = result.rows.map(sanitizeWorkoutRow);
  }

  return result;
}

/**
 * Recupera todas las plantillas de sesión del atleta.
 */
export async function getSessions(atletaId) {
  const currentId = atletaId || getAtletaId();
  return _request('GET', 'getSessions', { atleta_id: currentId }, async () => ({
    status: 'success',
    rows: _mockFromLocalStorage('trainingos_session_templates'),
  }));
}

/**
 * Recupera las sesiones asignadas a la semana indicada.
 * @param {string} weekStart — fecha ISO del lunes (YYYY-MM-DD)
 * @param {string} weekEnd   — fecha ISO del domingo (YYYY-MM-DD)
 */
export async function getWeekAssignments(atletaId, weekStart = '', weekEnd = '') {
  const currentId = atletaId || getAtletaId();
  return _request('GET', 'getWeekAssignments', { atleta_id: currentId, weekStart, weekEnd }, async () => {
    const raw = _mockFromLocalStorage('trainingos_week_assignments');
    // raw es { [dateISO]: sessionData } — lo convierte a array de rows
    const rows = Object.entries(raw)
      .filter(([iso]) => (!weekStart || iso >= weekStart) && (!weekEnd || iso <= weekEnd))
      .map(([iso, sessionData]) => ({ fecha_iso: iso, sessionData }));
    return { status: 'success', rows };
  });
}

/**
 * Recupera récords personales, con filtro opcional por ejercicio.
 */
export async function getPRs(atletaId, exerciseId = '') {
  const currentId = atletaId || getAtletaId();
  return _request('GET', 'getPRs', { atleta_id: currentId, exercise_id: exerciseId }, async () => ({
    status: 'success', rows: [],
  }));
}

/**
 * Importa una sesión remota o cruzada compartida
 */
export async function getSharedSession(code) {
  return _request('GET', 'getSharedSession', { code }, async () => {
    const local = JSON.parse(localStorage.getItem('trainingos_shared_sessions') || '{}');
    if (local[code]) {
      return { status: 'success', data: local[code] };
    }
    throw new Error('Código no encontrado en el servidor (Mock Mode). Asegúrate de escribirlo tal cual.');
  });
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

/**
 * Guarda un comentario de feedback de sesión.
 */
export async function saveFeedback(data) {
  return _request('POST', 'saveFeedback', data, async () => ({
    status: 'success', id: data.id || `mock-${Date.now()}`,
  }));
}

/**
 * Marca un feedback como leído.
 */
export async function markFeedbackRead(id) {
  return _request('POST', 'markFeedbackRead', { id }, async () => ({
    status: 'success',
  }));
}

/**
 * Recupera feedbacks de una sesión para un atleta.
 */
export async function getFeedback(sessionId, atletaId) {
  return _request('GET', 'getFeedback', { session_id: sessionId, atleta_id: atletaId }, async () => ({
    status: 'success',
    rows: JSON.parse(localStorage.getItem('trainingos_feedback') || '[]')
      .filter(f => f.sessionId === sessionId && f.atletaId === atletaId),
  }));
}

/**
 * Guarda un registro de test de rendimiento.
 */
export async function saveTestRecord(testData) {
  return _request('POST', 'saveTestRecord', testData, async () => ({
    status: 'success', id: `mock-test-${Date.now()}`
  }));
}

/**
 * Guarda el check-in diario de Wellness y disposición.
 */
export async function saveDailyWellness(wellnessData) {
  return _request('POST', 'saveDailyWellness', wellnessData, async () => ({
    status: 'success', id: `mock-well-${Date.now()}`
  }));
}

/**
 * Guarda el registro de antropometría / composición corporal.
 */
export async function saveBodyMetrics(metricsData) {
  return _request('POST', 'saveBodyMetrics', metricsData, async () => ({
    status: 'success', id: `mock-metrics-${Date.now()}`
  }));
}
