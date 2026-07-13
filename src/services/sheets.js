/**
 * TrainingOS — Capa de red Google Sheets
 * Configura VITE_SHEETS_API_URL en .env.local para activar el backend real.
 * Con VITE_USE_MOCK=true todos los métodos devuelven datos simulados con
 * latencia artificial de 300 ms, sin tocar la red.
 */

import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_SHEETS_API_URL;

function getAtletaId() {
  if (auth.currentUser) return auth.currentUser.uid;
  try {
    const raw = localStorage.getItem('trainingos_user_meta');
    if (raw) return JSON.parse(raw).uid;
  } catch (e) {}
  return import.meta.env.VITE_ATLETA_ID || 'v-atleta-1';
}

// ─── Base request ─────────────────────────────────────────────────────────────
async function _delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 8000);

  try {
    let res;
    const currentId = getAtletaId();

    if (method === 'GET') {
      const params = new URLSearchParams({ action, atleta_id: currentId, ...data });
      res = await fetch(`${API_URL}?${params.toString()}`, { signal: controller.signal });
    } else {
      res = await fetch(API_URL, {
        method:  'POST',
        body:    JSON.stringify({ action, atletaId: currentId, ...data }),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        signal:  controller.signal,
      });
    }

    const json = await res.json();
    if (json.status === 'error') throw new Error(json.message || 'Error del servidor');
    console.log(`[Sheets] ${method} ${action} → ok`, json);
    return json;

  } catch (err) {
    if (err.name === 'AbortError') throw new Error(`[Sheets] Timeout en ${action} (8s)`);
    throw new Error(`[Sheets] ${action}: ${err.message}`);
  } finally {
    clearTimeout(timeout);
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
export async function fetchWorkouts(rutinaId = '') {
  return _request('GET', 'getWorkouts', { rutina_id: rutinaId }, async () => ({
    status: 'success', rows: [],
  }));
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
