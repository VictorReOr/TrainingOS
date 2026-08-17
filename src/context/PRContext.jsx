import React, { createContext, useContext, useState, useEffect } from 'react';
import { savePR as _savePR, getPRs } from '../services/sheets';
import { estimate1RM } from '../engine/performance/utils/oneRMEstimators';

// ══════════════════════════════════════════════════════
// PRContext — TrainingOS (Prompt 3.1)
// Sistema de Récords Personales. Persistencia en localStorage + Sheets
// ══════════════════════════════════════════════════════

const LS_KEY = 'trainingos_prs';

// Helper sync (igual que PlannerContext)
const USE_SHEETS = !!import.meta.env.VITE_SHEETS_API_URL && import.meta.env.VITE_USE_MOCK !== 'true';

function _bgSync(fn) {
  const demoMode = localStorage.getItem('trainingos_demo_mode') === 'true';
  if (!USE_SHEETS || demoMode) return;
  Promise.resolve()
    .then(() => fn())
    .then(res => console.log('[Sheets] savePR → ok', res?.id || ''))
    .catch(err => console.warn('[Sheets] savePR falló:', err.message));
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

  // Exponer ÚNICAMENTE en window para invocación manual desde consola (A.2 - Sin autoejecutar)
  useEffect(() => {
    window.runPRBackfill = () => {
      console.log('[PRBackfill] Iniciando backfill manual de PRs desde consola...');
      try {
        const rawLogs = localStorage.getItem('trainingos_session_logs');
        const logs = rawLogs ? JSON.parse(rawLogs) : [];
        if (!Array.isArray(logs) || logs.length === 0) {
          console.warn('[PRBackfill] No hay trainingos_session_logs para procesar.');
          return { processed: 0, newPRs: 0 };
        }

        const rawPRs = localStorage.getItem('trainingos_prs');
        let currentPRs = rawPRs ? JSON.parse(rawPRs) : [];
        let newCount = 0;

        logs.forEach(log => {
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
          localStorage.setItem('trainingos_prs', JSON.stringify(currentPRs));
          setPrs(currentPRs);
          console.log(`[PRBackfill] ¡Éxito! Se generaron ${newCount} registros de PRs retroactivos en localStorage.`);
        } else {
          console.log('[PRBackfill] Se escanearon los logs pero no había PRs nuevos que añadir.');
        }

        return { processedLogs: logs.length, newPRs: newCount };
      } catch (err) {
        console.error('[PRBackfill] Error ejecutando backfill:', err);
        return { error: err.message };
      }
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
    _bgSync(() => _savePR({
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
