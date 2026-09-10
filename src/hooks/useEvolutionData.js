import { useMemo, useState, useEffect } from 'react';
import { usePR } from '../context/PRContext';
import { usePlanner } from '../context/PlannerContext';
import { useReadiness } from '../context/ReadinessContext';
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary';
import { getExerciseMetadata } from '../data/exerciseMetadata';

const LS_SESSION_LOGS = 'trainingos_session_logs';

export function useEvolutionData() {
  const { prs, getPRHistory } = usePR();
  const { seasons } = usePlanner();
  const { cmjLogs } = useReadiness();

  const [sessionLogs, setSessionLogs] = useState([]);
  const isDemoMode = false;

  useEffect(() => {
    let raw = [];
    try {
      const stored = localStorage.getItem(LS_SESSION_LOGS);
      if (stored) {
        raw = JSON.parse(stored);
      }
    } catch {}

    setSessionLogs(raw);
  }, [prs.length]);

  // Ejercicios con PRs registrados
  const exercisesWithPRs = useMemo(() => {
    const uniqueIds = [...new Set(prs.map(pr => pr.exerciseId))];
    const computed = uniqueIds.map(id => {
      const history = getPRHistory(id);
      if (history.length === 0) return null;
      
      const latest = history[0]; 
      return {
        exerciseId: id,
        exerciseName: latest.exerciseName,
        latestPR: Math.round(latest.valor),
        count: history.length
      };
    }).filter(Boolean);
    
    return computed.sort((a,b) => b.count - a.count);
  }, [prs, isDemoMode, getPRHistory]);

  const hasData = exercisesWithPRs.length > 0 || sessionLogs.length > 0;

  // Función para obtener datos evolutivos de 1RM de un ejercicio
  const getExerciseChartData = (exerciseId) => {
    const history = getPRHistory(exerciseId);
    if (!history) return [];
    
    return [...history].sort((a,b) => new Date(a.fecha) - new Date(b.fecha)).map(h => ({
      fecha: h.fecha,
      valor: Math.round(h.valor),
      cargaReal: Math.round(h.cargaReal),
      repsReales: h.repsReales
    }));
  };

  // Comparativa mesociclos legacy (PR máx)
  const getMesocycleComparison = (exerciseId) => {
    const history = getPRHistory(exerciseId);
    if (!history || history.length === 0) return [];

    const allMesoList = [];
    seasons.forEach(s => {
      if (s.mesocycles) {
        s.mesocycles.forEach(m => allMesoList.push(m));
      }
    });

    const results = [];
    allMesoList.forEach(meso => {
      const startDate = new Date(meso.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (meso.weeks * 7));

      const prsInMeso = history.filter(h => {
        const d = new Date(h.fecha);
        return d >= startDate && d <= endDate;
      });

      if (prsInMeso.length > 0) {
        const maxPR = Math.max(...prsInMeso.map(h => h.valor));
        results.push({
          mesoName: meso.name || 'Sin Nombre',
          mesoColor: meso.color || '#3d7dd4',
          maxPR: Math.round(maxPR)
        });
      }
    });

    return results;
  };

  // ══════════════════════════════════════════════════════
  // FASE 7: ANÁLISIS AVANZADO DE RENDIMIENTO
  // ══════════════════════════════════════════════════════

  // 1. EQUILIBRIO DE PATRONES BIOMECÁNICOS (últimas 4 semanas)
  const patternBalanceData = useMemo(() => {
    const fourWeeksAgo = Date.now() - 28 * 24 * 60 * 60 * 1000;
    const recentLogs = sessionLogs.filter(s => new Date(s.fecha).getTime() >= fourWeeksAgo);

    const counts = {
      push_horizontal: 0,
      push_vertical: 0,
      pull_horizontal: 0,
      pull_vertical: 0,
      knee_dominant: 0,
      hip_dominant: 0,
      unilateral: 0,
      core: 0,
      rotation: 0,
      anti_rotation: 0,
    };

    recentLogs.forEach(session => {
      (session.ejercicios || []).forEach(ex => {
        const doneSets = (ex.seriesLog || []).filter(s => s.done).length;
        if (doneSets === 0) return;

        const libEx = EXERCISE_LIBRARY.find(e => e.id === ex.id || e.name === ex.nombre);
        const meta = libEx ? getExerciseMetadata(libEx) : getExerciseMetadata({ id: ex.id, category: ex.category || ex.type });

        if (meta.pattern && meta.pattern !== 'unspecified' && counts[meta.pattern] !== undefined) {
          counts[meta.pattern] += doneSets;
        }
      });
    });

    const totalPush = counts.push_horizontal + counts.push_vertical;
    const totalPull = counts.pull_horizontal + counts.pull_vertical;
    const pushToPull = totalPull > 0 ? Number((totalPush / totalPull).toFixed(2)) : (totalPush > 0 ? 1.5 : 1.0);

    const kneeCount = counts.knee_dominant;
    const hipCount = counts.hip_dominant;
    const kneeToHip = hipCount > 0 ? Number((kneeCount / hipCount).toFixed(2)) : (kneeCount > 0 ? 1.5 : 1.0);

    const unilateralCount = counts.unilateral;
    const bilateralCount = totalPush + totalPull + kneeCount + hipCount;
    const bilateralToUnilateral = unilateralCount > 0
      ? Number((bilateralCount / unilateralCount).toFixed(2))
      : (bilateralCount > 0 ? 5.0 : 3.0);

    const patternsBreakdown = [
      { name: 'Push Horiz', series: counts.push_horizontal, grupo: 'Empuje' },
      { name: 'Push Vert', series: counts.push_vertical, grupo: 'Empuje' },
      { name: 'Pull Horiz', series: counts.pull_horizontal, grupo: 'Tracción' },
      { name: 'Pull Vert', series: counts.pull_vertical, grupo: 'Tracción' },
      { name: 'Rodilla', series: counts.knee_dominant, grupo: 'Pierna' },
      { name: 'Cadera', series: counts.hip_dominant, grupo: 'Pierna' },
      { name: 'Unilateral', series: counts.unilateral, grupo: 'Pierna' },
      { name: 'Core/Rot.', series: counts.core + counts.rotation + counts.anti_rotation, grupo: 'Core' },
    ];

    const isPushPullBalanced = pushToPull >= 0.8 && pushToPull <= 1.25;
    const isKneeHipBalanced = kneeToHip >= 0.75 && kneeToHip <= 1.35;
    const isUniBilateralBalanced = bilateralToUnilateral <= 4.0;

    return {
      counts,
      totalPush,
      totalPull,
      pushToPull,
      kneeToHip,
      bilateralToUnilateral,
      patternsBreakdown,
      isPushPullBalanced,
      isKneeHipBalanced,
      isUniBilateralBalanced,
      hasSets: Object.values(counts).some(v => v > 0)
    };
  }, [sessionLogs]);

  // 2. TRANSFERENCIA TKD (4 Pilares y progresión hacia targets semanales)
  const tkdTransferData = useMemo(() => {
    const fourWeeksAgo = Date.now() - 28 * 24 * 60 * 60 * 1000;
    const recentLogs = sessionLogs.filter(s => new Date(s.fecha).getTime() >= fourWeeksAgo);
    const weeksCount = Math.max(1, Math.min(4, Math.ceil((Date.now() - Math.min(...recentLogs.map(s => new Date(s.fecha).getTime()), Date.now())) / (7 * 24 * 60 * 60 * 1000))));

    let explosivenessSets = 0;
    let unilateralSets = 0;
    let mobilitySets = 0;
    let coreRotationSets = 0;

    recentLogs.forEach(session => {
      (session.ejercicios || []).forEach(ex => {
        const doneSets = (ex.seriesLog || []).filter(s => s.done).length;
        if (doneSets === 0) return;

        const libEx = EXERCISE_LIBRARY.find(e => e.id === ex.id || e.name === ex.nombre);
        const meta = libEx ? getExerciseMetadata(libEx) : getExerciseMetadata({ id: ex.id, category: ex.category || ex.type });

        // Explosividad
        if (['POWER', 'PLYOMETRIC', 'BALLISTIC'].includes(meta.exerciseType) || (meta.sportTransfer ?? 5) >= 8) {
          explosivenessSets += doneSets;
        }
        // Unilateral
        if (meta.pattern === 'unilateral') {
          unilateralSets += doneSets;
        }
        // Movilidad
        if (['MOBILITY', 'PREHAB'].includes(meta.exerciseType) || meta.priority === 'mobility') {
          mobilitySets += doneSets;
        }
        // Core & Rotación
        if (['rotation', 'anti_rotation', 'core'].includes(meta.pattern)) {
          coreRotationSets += doneSets;
        }
      });
    });

    // Semanales promedio
    const expWeekly = Math.round((explosivenessSets / weeksCount) * 10) / 10;
    const uniWeekly = Math.round((unilateralSets / weeksCount) * 10) / 10;
    const mobWeekly = Math.round((mobilitySets / weeksCount) * 10) / 10;
    const rotWeekly = Math.round((coreRotationSets / weeksCount) * 10) / 10;

    const targets = { explosiveness: 12, unilateral: 8, mobility: 6, coreRotation: 6 };

    const pillars = [
      { pilar: 'Explosividad', actual: expWeekly, target: targets.explosiveness, pct: Math.min(100, Math.round((expWeekly / targets.explosiveness) * 100)), icon: '⚡' },
      { pilar: 'Unilateral', actual: uniWeekly, target: targets.unilateral, pct: Math.min(100, Math.round((uniWeekly / targets.unilateral) * 100)), icon: '🦵' },
      { pilar: 'Movilidad', actual: mobWeekly, target: targets.mobility, pct: Math.min(100, Math.round((mobWeekly / targets.mobility) * 100)), icon: '🧘' },
      { pilar: 'Core Rot.', actual: rotWeekly, target: targets.coreRotation, pct: Math.min(100, Math.round((rotWeekly / targets.coreRotation) * 100)), icon: '🔄' },
    ];

    const itdScore = Math.round(
      (pillars[0].pct * 0.35) +
      (pillars[1].pct * 0.25) +
      (pillars[2].pct * 0.20) +
      (pillars[3].pct * 0.20)
    );

    return {
      pillars,
      itdScore,
      totalEffectiveSets: explosivenessSets + unilateralSets + mobilitySets + coreRotationSets
    };
  }, [sessionLogs]);

  // 3. POTENCIA Y VELOCIDAD
  const powerEvolutionData = useMemo(() => {
    let fastSets = 0;
    let mediumSets = 0;
    let slowSets = 0;
    let totalDoneSets = 0;

    const powerSessions = [];

    sessionLogs.slice(-15).forEach(session => {
      let sessionPowerVolume = 0;
      let sessionPowerSets = 0;

      (session.ejercicios || []).forEach(ex => {
        const libEx = EXERCISE_LIBRARY.find(e => e.id === ex.id || e.name === ex.nombre);
        const meta = libEx ? getExerciseMetadata(libEx) : getExerciseMetadata({ id: ex.id, category: ex.category || ex.type });
        const isPower = ['POWER', 'PLYOMETRIC', 'BALLISTIC'].includes(meta.exerciseType);

        (ex.seriesLog || []).forEach(set => {
          if (!set.done) return;
          totalDoneSets++;
          if (set.velocidad === 'rapida') fastSets++;
          else if (set.velocidad === 'media') mediumSets++;
          else if (set.velocidad === 'lenta') slowSets++;

          if (isPower) {
            sessionPowerSets++;
            sessionPowerVolume += (parseFloat(set.carga) || 0) * (parseInt(set.reps, 10) || 1);
          }
        });
      });

      if (sessionPowerSets > 0) {
        powerSessions.push({
          fecha: session.fecha,
          series: sessionPowerSets,
          volumen: sessionPowerVolume,
          sessionName: session.sessionName
        });
      }
    });

    const cmjHistory = [...(cmjLogs || [])]
      .sort((a,b) => new Date(a.fecha) - new Date(b.fecha))
      .map(c => ({
        fecha: c.fecha,
        altura: parseFloat(c.valor) || 0
      }));

    return {
      fastSets,
      mediumSets,
      slowSets,
      totalDoneSets,
      fastPct: totalDoneSets > 0 ? Math.round((fastSets / totalDoneSets) * 100) : 0,
      powerSessions,
      cmjHistory
    };
  }, [sessionLogs, cmjLogs]);

  // 4. EVOLUCIÓN POR MESOCICLO EXTENDIDA
  const mesocycleComparisonExtended = useMemo(() => {
    const allMesoList = [];
    seasons.forEach(s => {
      if (s.mesocycles) {
        s.mesocycles.forEach(m => allMesoList.push(m));
      }
    });

    return allMesoList.map(meso => {
      const startDate = new Date(meso.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + ((meso.weeks || 4) * 7));

      const inMeso = sessionLogs.filter(s => {
        const d = new Date(s.fecha);
        return d >= startDate && d <= endDate;
      });

      const totalVol = inMeso.reduce((acc, s) => acc + (s.volumenTotal || 0), 0);
      const avgRPE = inMeso.length > 0
        ? Number((inMeso.reduce((acc, s) => acc + (s.rpeMedio || s.rpe || 0), 0) / inMeso.length).toFixed(1))
        : 0;

      const prsInMeso = prs.filter(p => {
        const d = new Date(p.fecha);
        return d >= startDate && d <= endDate;
      });

      return {
        id: meso.id,
        name: meso.name || 'Mesociclo',
        color: meso.color || '#FF6B00',
        type: meso.type || 'fuerza',
        weeks: meso.weeks || 4,
        totalVol,
        avgRPE,
        sessionCount: inMeso.length,
        prsCount: prsInMeso.length
      };
    });
  }, [seasons, sessionLogs, prs]);

  return {
    exercisesWithPRs,
    sessionLogs,
    getMesocycleComparison,
    getExerciseChartData,
    hasData,
    isDemoMode,
    // Nuevas colecciones Fase 7
    patternBalanceData,
    tkdTransferData,
    powerEvolutionData,
    mesocycleComparisonExtended
  };
}

