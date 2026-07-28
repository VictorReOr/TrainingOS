import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAthlete } from '../context/AthleteContext';
import { usePlanner } from '../context/PlannerContext';
import { usePR } from '../context/PRContext';
import { useReadiness } from '../context/ReadinessContext';
import { evaluate } from '../engine/performance/index.js';
import { PERFORMANCE_CONFIG } from '../engine/performance/performanceConfig.js';
import { buildPerformanceInput } from '../engine/performance/utils/inputBuilder.js';

const LS_SESSION_LOGS = 'trainingos_session_logs';

/**
 * usePerformanceEngine
 *
 * Bridge hook between React contexts and the pure Performance Engine.
 * Collects data from AthleteContext, PlannerContext, PRContext and
 * ReadinessContext, builds the engine DTO, runs evaluate(), and
 * exposes a stable public API to consumers.
 */
export function usePerformanceEngine() {
  const { athlete }                               = useAthlete();
  const { activeMesocycle }                       = usePlanner();
  const { prs, getPRHistory }                     = usePR();
  const { todayCheckIn, wellnessLogs, latestWeight } = useReadiness();

  // ── Gate: is the engine enabled for this athlete? ───────────────
  const isEnabled = athlete?.performanceEngine?.enabled !== false;

  // ── Read session logs dynamically with event listeners ──────────
  const [sessionLogs, setSessionLogs] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_SESSION_LOGS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const loadLogs = () => {
      try {
        const raw = localStorage.getItem(LS_SESSION_LOGS);
        setSessionLogs(raw ? JSON.parse(raw) : []);
      } catch {
        setSessionLogs([]);
      }
    };

    loadLogs();

    // Listen to localStorage changes and custom app events
    window.addEventListener('storage', loadLogs);
    window.addEventListener('session_logs_updated', loadLogs);
    window.addEventListener('new_session_saved', loadLogs);

    return () => {
      window.removeEventListener('storage', loadLogs);
      window.removeEventListener('session_logs_updated', loadLogs);
      window.removeEventListener('new_session_saved', loadLogs);
    };
  }, []);

  // ── Build engine input DTO ───────────────────────────────────────
  const input = useMemo(() => {
    if (!isEnabled || !athlete) return null;

    return buildPerformanceInput({
      athlete,
      activeMesocycle,
      prs,
      getPRHistory,
      sessionLogs,
      todayCheckIn,
      wellnessLogs,
      latestWeight
    });
  }, [
    isEnabled, athlete, activeMesocycle,
    prs, sessionLogs, todayCheckIn, wellnessLogs, latestWeight
  ]);

  // ── Run engine ───────────────────────────────────────────────────
  const output = useMemo(() => {
    if (!input) return null;
    try {
      return evaluate(input, PERFORMANCE_CONFIG);
    } catch (err) {
      console.error('[PerformanceEngine] Error durante evaluate():', err);
      return null;
    }
  }, [input]);

  // ── Per-exercise decision API ────────────────────────────────────
  const getDecisionForExercise = useCallback(
    (exerciseId) => output?.exerciseDecisions?.[exerciseId] ?? null,
    [output]
  );

  // ── Public API ───────────────────────────────────────────────────
  return {
    output,
    isEnabled,
    isLoading: false,
    isColdStart:       output?.meta?.coldStart       ?? true,
    coldStartProgress: output?.meta?.coldStartProgress ?? 0,
    coldStartTotal:    PERFORMANCE_CONFIG.coldStart.minSessionsForFullEngine,

    globalTrafficLight: output?.globalTrafficLight ?? null,
    recommendations:    output?.recommendations    ?? [],
    indices:            output?.indices            ?? null,
    exerciseDecisions:  output?.exerciseDecisions  ?? {},
    dataCompleteness:   output?.meta?.dataCompleteness ?? 0,

    getDecisionForExercise
  };
}
