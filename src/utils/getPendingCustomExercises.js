import { getCoachOverrides } from '../data/exerciseMetadata';

/**
 * Scans localStorage for custom-* exercise IDs (from session templates and
 * session logs) and returns those that have no coach override yet.
 *
 * Each returned entry contains:
 *   id              – the deterministic custom-{slug} id
 *   suggestedName   – most-frequent name seen across all occurrences
 *   occurrenceCount – total times this id appears across all sources
 *   hasNameConflict – true when more than one distinct display name was found
 *   occurrences     – array of { name, source, date } for coach inspection
 *
 * No side effects — does not write to localStorage or mutate any state.
 */
export function getPendingCustomExercises() {
  const candidates = new Map(); // id -> { id, occurrences: [{name, source, date}] }

  const extractCustoms = (storageKey, sourceLabel) => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const sessions = JSON.parse(raw);
      if (!Array.isArray(sessions)) return;
      sessions.forEach(session => {
        (session.ejercicios || []).forEach(ex => {
          if (ex.id && ex.id.startsWith('custom-')) {
            if (!candidates.has(ex.id)) {
              candidates.set(ex.id, { id: ex.id, occurrences: [] });
            }
            candidates.get(ex.id).occurrences.push({
              name: ex.name || ex.nombre || ex.id,
              source: sourceLabel,
              date: session.fecha || session.startDate || null,
            });
          }
        });
      });
    } catch (e) {
      console.error(`[getPendingCustomExercises] Error leyendo ${storageKey}`, e);
    }
  };

  extractCustoms('trainingos_session_templates', 'plantilla');
  extractCustoms('trainingos_session_logs', 'log');

  const overrides = getCoachOverrides();
  const pending = [];

  candidates.forEach((data, id) => {
    // Skip exercises that already have a coach override
    if (overrides[id]) return;

    // Count how often each display name appears
    const nameCounts = {};
    data.occurrences.forEach(o => {
      nameCounts[o.name] = (nameCounts[o.name] || 0) + 1;
    });

    const distinctNames = Object.keys(nameCounts);

    pending.push({
      id: data.id,
      // Most-frequent name wins; ties preserve insertion order
      suggestedName: distinctNames.sort((a, b) => nameCounts[b] - nameCounts[a])[0],
      occurrenceCount: data.occurrences.length,
      hasNameConflict: distinctNames.length > 1,
      occurrences: data.occurrences,
    });
  });

  return pending;
}
