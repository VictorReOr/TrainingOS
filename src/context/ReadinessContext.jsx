import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { saveDailyWellness, saveTestRecord, saveBodyMetrics } from '../services/sheets';

const ReadinessContext = createContext();

export function ReadinessProvider({ children }) {
  // Cargar estados desde localStorage
  const [wellnessLogs, setWellnessLogs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('trainingos_wellness_logs') || '[]');
    } catch { return []; }
  });

  const [cmjLogs, setCmjLogs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('trainingos_cmj_logs') || '[]');
    } catch { return []; }
  });

  const [cardioTests, setCardioTests] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('trainingos_cardio_tests') || '[]');
    } catch { return []; }
  });

  const [bodyMetrics, setBodyMetrics] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('trainingos_body_metrics') || '[]');
    } catch { return []; }
  });

  // Guardar en localStorage ante cambios
  useEffect(() => {
    localStorage.setItem('trainingos_wellness_logs', JSON.stringify(wellnessLogs));
  }, [wellnessLogs]);

  useEffect(() => {
    localStorage.setItem('trainingos_cmj_logs', JSON.stringify(cmjLogs));
  }, [cmjLogs]);

  useEffect(() => {
    localStorage.setItem('trainingos_cardio_tests', JSON.stringify(cardioTests));
  }, [cardioTests]);

  useEffect(() => {
    localStorage.setItem('trainingos_body_metrics', JSON.stringify(bodyMetrics));
  }, [bodyMetrics]);

  // Verificar si ya hizo check-in hoy (local date YYYY-MM-DD)
  const todayCheckIn = useMemo(() => {
    if (wellnessLogs.length === 0) return null;
    const todayStr = new Date().toLocaleDateString('sv');
    return wellnessLogs.find(log => {
      try {
        const logDateStr = new Date(log.fecha).toLocaleDateString('sv');
        return logDateStr === todayStr;
      } catch {
        return false;
      }
    }) || null;
  }, [wellnessLogs]);

  // Métodos de guardado
  const saveWellness = async (wellness) => {
    const record = {
      id: `well-${Date.now()}`,
      fecha: new Date().toISOString(),
      sleep: parseInt(wellness.sleep) || 5,
      stress: parseInt(wellness.stress) || 5,
      doms: parseInt(wellness.doms) || 5,
      fatigue: parseInt(wellness.fatigue) || 5
    };
    
    setWellnessLogs(prev => [record, ...prev]);
    try {
      await saveDailyWellness(record);
    } catch (e) {
      console.warn('Sync failed for saveDailyWellness', e);
    }
    return record;
  };

  const saveCMJ = async (height) => {
    const record = {
      id: `cmj-${Date.now()}`,
      fecha: new Date().toISOString(),
      tipo: 'cmj',
      valor: parseFloat(height) || 0,
      unidad: 'cm'
    };

    setCmjLogs(prev => [record, ...prev]);
    try {
      await saveTestRecord(record);
    } catch (e) {
      console.warn('Sync failed for CMJ test', e);
    }
    return record;
  };

  const saveCardio = async (type, rawValue, vo2Max) => {
    const record = {
      id: `cardio-${Date.now()}`,
      fecha: new Date().toISOString(),
      tipo: type, // 'cooper' | 'beep'
      valorOriginal: rawValue, // metros (Cooper) o velocidad (Beep)
      valor: vo2Max, // VO2Max calculado
      unidad: 'ml/kg/min'
    };

    setCardioTests(prev => [record, ...prev]);
    try {
      await saveTestRecord(record);
    } catch (e) {
      console.warn('Sync failed for Cardio test', e);
    }
    return record;
  };

  const saveMetrics = async (metrics) => {
    const record = {
      id: `metrics-${Date.now()}`,
      fecha: new Date().toISOString(),
      peso: parseFloat(metrics.peso) || 0,
      grasa: parseFloat(metrics.grasa) || null,
      medidaCintura: parseFloat(metrics.medidaCintura) || null,
      medidaBrazo: parseFloat(metrics.medidaBrazo) || null,
      medidaMuslo: parseFloat(metrics.medidaMuslo) || null
    };

    setBodyMetrics(prev => [record, ...prev]);
    try {
      await saveBodyMetrics(record);
    } catch (e) {
      console.warn('Sync failed for BodyMetrics', e);
    }
    return record;
  };

  // Media de salto CMJ de los últimos 30 días
  const cmjStats = useMemo(() => {
    if (cmjLogs.length === 0) return { avg30d: 0, lastJump: 0 };
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    
    const recentJumps = cmjLogs.filter(j => new Date(j.fecha).getTime() >= thirtyDaysAgo);
    const sum = recentJumps.reduce((acc, curr) => acc + curr.valor, 0);
    const avg = recentJumps.length > 0 ? sum / recentJumps.length : cmjLogs[0].valor;

    return {
      avg30d: Math.round(avg * 10) / 10,
      lastJump: cmjLogs[0].valor
    };
  }, [cmjLogs]);

  const latestWeight = useMemo(() => {
    if (bodyMetrics.length === 0) return null;
    return bodyMetrics[0].peso;
  }, [bodyMetrics]);

  return (
    <ReadinessContext.Provider value={{
      wellnessLogs,
      cmjLogs,
      cardioTests,
      bodyMetrics,
      todayCheckIn,
      saveWellness,
      saveCMJ,
      saveCardio,
      saveMetrics,
      cmjStats,
      latestWeight
    }}>
      {children}
    </ReadinessContext.Provider>
  );
}

export const useReadiness = () => useContext(ReadinessContext);
