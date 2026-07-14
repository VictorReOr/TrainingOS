import React, { createContext, useContext, useState, useEffect } from 'react';
import { savePR as _savePR, getPRs } from '../services/sheets';

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

  // Sincronizar PRs desde Google Sheets al iniciar
  useEffect(() => {
    const syncPRsFromSheets = async () => {
      const demoMode = localStorage.getItem('trainingos_demo_mode') === 'true';
      if (!USE_SHEETS || demoMode) return;
      try {
        const atletaId = import.meta.env.VITE_ATLETA_ID || 'v-atleta-1';
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
      atletaId: prData.atletaId || 'v-atleta-1',
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
