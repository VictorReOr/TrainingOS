import React, { createContext, useContext, useState, useEffect } from 'react';
import { savePR as _savePR, getPRs, USE_SHEETS } from '../services/sheets';
import { estimate1RM } from '../engine/performance/utils/oneRMEstimators';

// ══════════════════════════════════════════════════════
// PRContext — TrainingOS (Prompt 3.1)
// Sistema de Récords Personales. Persistencia en localStorage + Sheets
// ══════════════════════════════════════════════════════

const LS_KEY = 'trainingos_prs';

/** Lanza sync en background sin bloquear la UI */
function _bgSync(label, fn) {
  const demoMode = localStorage.getItem('trainingos_demo_mode') === 'true';
  if (!USE_SHEETS || demoMode) return;
  Promise.resolve()
    .then(() => fn())
    .then(res => console.log(`[Sheets] ${label} → ok`, res?.id || ''))
    .catch(err => console.warn(`[Sheets] ${label} falló (sin bloquear UI):`, err.message));
}

const PRContext = createContext();

export function PRProvider({ children }) {
  const [prs, setPrs] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Persistir en local ante cualquier cambio
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(prs));
  }, [prs]);

  // Función pura para extraer y actualizar PRs a partir de los logs de sesión locales
  const syncPRsFromLocalLogs = (logList = null) => {
    try {
      const rawLocalLogs = logList || localStorage.getItem('trainingos_session_logs');
      const sessionLogs = typeof rawLocalLogs === 'string' ? JSON.parse(rawLocalLogs || '[]') : (rawLocalLogs || []);
      if (!Array.isArray(sessionLogs) || sessionLogs.length === 0) return { processedLogs: 0, newPRs: 0 };

      const rawPRs = localStorage.getItem(LS_KEY);
      let currentPRs = rawPRs ? JSON.parse(rawPRs) : [];
      let newCount = 0;

      sessionLogs.forEach(log => {
        if (!log || !Array.isArray(log.ejercicios)) return;
        const logDate = log.fecha || new Date().toISOString();

        log.ejercicios.forEach(ex => {
          if (!ex || !ex.id || !Array.isArray(ex.seriesLog)) return;
          const validSets = ex.seriesLog.filter(s => s && s.done && parseFloat(s.carga) > 0 && parseInt(s.reps) > 0);
          if (validSets.length === 0) return;

          let max1RM = 0;
          let bestCarga = 0;
          let bestReps = 0;

          validSets.forEach(s => {
            const c = parseFloat(s.carga);
            const r = parseInt(s.reps);
            const est = estimate1RM(c, r, 'epley');
            if (est > max1RM) {
              max1RM = est;
              bestCarga = c;
              bestReps = r;
            }
          });

          if (max1RM > 0) {
            const recordId = `pr-backfill-${ex.id}-${new Date(logDate).getTime()}`;
            const exists = currentPRs.some(p => p.id === recordId || (p.exerciseId === ex.id && p.fecha === logDate));
            if (!exists) {
              currentPRs.push({
                id: recordId,
                exerciseId: ex.id,
                exerciseName: ex.nombre || ex.name || 'Ejercicio',
                atletaId: log.atletaId || log.atleta_id || 'atleta-local',
                fecha: logDate,
                valor: Math.round(max1RM * 10) / 10,
                cargaReal: bestCarga,
                repsReales: bestReps,
                unidad: 'kg'
              });
              newCount++;
            }
          }
        });
      });

      if (newCount > 0) {
        currentPRs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        localStorage.setItem(LS_KEY, JSON.stringify(currentPRs));
        setPrs(currentPRs);
        console.log(`[PRContext] Auto-sincronizados ${newCount} nuevos PRs desde el historial.`);
      }

      return { processedLogs: sessionLogs.length, newPRs: newCount };
    } catch (err) {
      console.warn('[PRContext] Error procesando PRs locales:', err);
      return { error: err.message };
    }
  };

  // Auto-ejecutar al montar y escuchar eventos de actualización de logs
  useEffect(() => {
    syncPRsFromLocalLogs();

    const handleLogsUpdated = () => {
      syncPRsFromLocalLogs();
    };

    window.addEventListener('session_logs_updated', handleLogsUpdated);
    window.addEventListener('new_session_saved', handleLogsUpdated);
    window.addEventListener('storage', handleLogsUpdated);

    window.runPRBackfill = async () => {
      console.log('[PRBackfill] Iniciando backfill manual de PRs desde logs locales...');
      const res = syncPRsFromLocalLogs();
      console.log('[PRBackfill] Resultado:', res);
      return res;
    };

    return () => {
      window.removeEventListener('session_logs_updated', handleLogsUpdated);
      window.removeEventListener('new_session_saved', handleLogsUpdated);
      window.removeEventListener('storage', handleLogsUpdated);
    };
  }, []);

  // Sincronizar PRs desde Google Sheets al iniciar
  useEffect(() => {
    const syncPRsFromSheets = async () => {
      const demoMode = localStorage.getItem('trainingos_demo_mode') === 'true';
      if (!USE_SHEETS || demoMode) return;
      try {
        const storedAuth = localStorage.getItem('trainingos_auth_user');
        const atletaId = storedAuth ? JSON.parse(storedAuth).id : null;
        if (!atletaId) return;
        const res = await getPRs(atletaId);
        if (res && res.rows) {
          const mapped = res.rows.map(r => ({
            id: r.id || `pr-${Date.now()}-${Math.random()}`,
            exerciseId: r.exercise_id,
            exerciseName: r.exercise_name,
            atletaId: r.atleta_id || atletaId,
            fecha: r.fecha || new Date().toISOString(),
            valor: parseFloat(r.valor) || 0,
            cargaReal: parseFloat(r.carga_real) || parseFloat(r.valor) * 0.8,
            repsReales: parseInt(r.reps_reales) || 5,
            unidad: r.unidad || 'kg'
          }));
          // Combinar local y remoto sin duplicados
          setPrs(prev => {
            const merged = [...prev];
            mapped.forEach(m => {
              const exists = merged.some(p => p.id === m.id || (p.exerciseId === m.exerciseId && p.fecha === m.fecha));
              if (!exists) merged.push(m);
            });
            return merged.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
          });
        }
      } catch (err) {
        console.warn('[PRContext] Error fetching PRs from Sheets:', err);
      }
    };
    syncPRsFromSheets();
  }, []);

  /**
   * Devuelve el último récord máximo para un ejercicio
   */
  const getPRForExercise = (exerciseId) => {
    const history = prs.filter(pr => pr.exerciseId === exerciseId);
    if (history.length === 0) return null;
    return history.reduce((best, pr) => pr.valor > best.valor ? pr : best);
  };

  /**
   * Devuelve todo el historial ordenado por fecha ascendente para las gráficas
   */
  const getPRHistory = (exerciseId) => {
    return prs
      .filter(pr => pr.exerciseId === exerciseId)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  };

  /**
   * Guarda un nuevo PR. Si ya existe un valor mayor en el historial,
   * se guarda en el historial igualmente (te permite "trackear" marcas)
   * pero no superará al Record actual en getPRForExercise().
   * El servicio sheets también se notifica.
   */
  const savePRRecord = (prData) => {
    const record = {
      id: prData.id || `pr-${Date.now()}`,
      exerciseId: prData.exerciseId,
      exerciseName: prData.exerciseName,
      atletaId: prData.atletaId || 'atleta-local',
      fecha: prData.fecha || new Date().toISOString(),
      valor: prData.valor, // 1RM est
      cargaReal: prData.cargaReal,
      repsReales: prData.repsReales,
      unidad: prData.unidad || 'kg'
    };

    setPrs(prev => [record, ...prev]);

    // Background sync a Google Sheets
    _bgSync('savePR', () => _savePR({
      exerciseId: record.exerciseId,
      exerciseName: record.exerciseName,
      atletaId: record.atletaId,
      fecha: record.fecha,
      valor: record.valor,
      cargaReal: record.cargaReal,
      repsReales: record.repsReales,
      unidad: record.unidad
    }));
  };

  return (
    <PRContext.Provider value={{
      prs,
      getPRForExercise,
      getPRHistory,
      savePRRecord
    }}>
      {children}
    </PRContext.Provider>
  );
}

export const usePR = () => useContext(PRContext);

