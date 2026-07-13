import React, { createContext, useContext, useState, useEffect } from 'react';
import { savePR as _savePR } from '../services/sheets';

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
