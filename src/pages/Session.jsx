import React, { useState, useMemo, useEffect } from 'react';
import ProgressBar from '../components/ProgressBar';
import ExerciseRow from '../components/ExerciseRow';
import SetLoggerSheet from '../components/SetLoggerSheet';
import TimerSheet from '../components/TimerSheet';
import { getRPETargetForGoal } from '../utils/overloadEngine';
import FeedbackSection from '../components/FeedbackSection';
import { CheckCircle2, CloudUpload, Share2, Clock, Zap, BarChart3 } from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { useSession } from '../context/SessionContext';
import { usePR } from '../context/PRContext';
import { saveLog } from '../services/sheets';
import { useReadiness } from '../context/ReadinessContext';
import ReadinessModal from '../components/ReadinessModal';

const BLOCK_COLORS = {
  calentamiento: '#FFCC00',
  fuerza:        '#FF3B30',
  hipertrofia:   '#007AFF',
  cardio:        '#34C759',
  core:          '#AF52DE',
  movilidad:     '#5856D6'
};

const getInitialLogs = (exercise) => {
  const seriesCount = parseInt(exercise.series || exercise.targetSets, 10) || 1;
  const defaultReps = exercise.reps || exercise.targetReps || '';
  return Array.from({ length: seriesCount }, () => ({
    carga: '', reps: defaultReps, rpe: null, done: false,
  }));
};

export default function Session() {
  const { activeSession, clearSession } = useSession();
  const { getPRForExercise, savePRRecord } = usePR();
  const sessionData = activeSession;

  const [exerciseLogs, setExerciseLogs]     = useState({});
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isTimerOpen, setIsTimerOpen]       = useState(false);
  const [prBanner, setPrBanner]             = useState(null);
  const [sessionPRs, setSessionPRs]         = useState([]);
  const [sessionStartTime]                  = useState(Date.now());
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isSaving, setIsSaving]             = useState(false);
  const [toastMsg, setToastMsg]             = useState('');

  const { todayCheckIn } = useReadiness();
  const [showReadiness, setShowReadiness] = useState(false);

  useEffect(() => {
    if (!todayCheckIn && sessionData) {
      setShowReadiness(true);
    }
  }, [todayCheckIn, sessionData]);

  // Se elimina la limpieza en unmount para evitar bug de React 18 StrictMode
  // useEffect(() => { return () => clearSession(); }, []);

  const allExercises = useMemo(() => sessionData ? sessionData.blocks.flatMap(b => b.exercises) : [], [sessionData]);

  if (!sessionData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F0] text-center p-6">
        <div className="w-16 h-16 bg-[#FFF3EC] rounded-full flex items-center justify-center text-[#FF6B00] mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="font-condensed font-black text-2xl text-[#1C1C1E] uppercase tracking-wide">Sin Sesión Activa</h2>
        <p className="text-[#6E6E73] mt-2 mb-6">
          Ve a tu Planificador y pulsa "Empezar" en la sesión que te toque hoy.
        </p>

        {!todayCheckIn ? (
          <button
            onClick={() => setShowReadiness(true)}
            className="px-6 py-3 bg-[#FF6B00] text-white font-condensed font-black rounded-2xl shadow-[0_4px_12px_rgba(255,107,0,0.2)] hover:bg-[#E85D04] active:scale-95 transition-transform tracking-wide"
          >
            REALIZAR CHECK-IN DIARIO
          </button>
        ) : (
          <div className="bg-[#EFFFEC] border border-green-500/20 text-green-700 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5">
            <span>✓</span> Check-in de hoy completado
          </div>
        )}

        {showReadiness && <ReadinessModal onClose={() => setShowReadiness(false)} />}
      </div>
    );
  }

  const isExerciseDone = (exerciseId) => {
    const logs = exerciseLogs[exerciseId];
    if (!logs || logs.length === 0) return false;
    return logs.every(log => log.done === true);
  };

  const totalCount     = allExercises.length;
  const completedCount = allExercises.filter(ex => isExerciseDone(ex.id)).length;
  const percentage     = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isFinished     = percentage === 100;

  const handleOpenExercise = (exercise, blockGoal) => {
    if (!exerciseLogs[exercise.id]) {
      setExerciseLogs(prev => ({ ...prev, [exercise.id]: getInitialLogs(exercise) }));
    }
    if (window.navigator?.vibrate) window.navigator.vibrate(10);
    setSelectedExercise({ ...exercise, sessionType: blockGoal });
  };

  const handleResetSession = () => {
    setExerciseLogs({});
    if (window.navigator?.vibrate) window.navigator.vibrate(20);
  };

  const handleLogChange = (setIndex, field, value) => {
    setExerciseLogs(prev => {
      const updatedLogs = [...prev[selectedExercise.id]];
      updatedLogs[setIndex] = { ...updatedLogs[setIndex], [field]: value };
      return { ...prev, [selectedExercise.id]: updatedLogs };
    });
  };

  const { startRest } = useTimer();

  const handleToggleSet = (setIndex) => {
    const currentLogs = [...exerciseLogs[selectedExercise.id]];
    const isNowDone   = !currentLogs[setIndex].done;
    let detectedPR    = null;

    if (isNowDone) {
      const set = currentLogs[setIndex];
      const kgStr = (set.carga || set.cargaReal || '').toString().replace(',', '.');
      const kg  = parseFloat(kgStr);
      
      let repStr = (set.reps || selectedExercise?.reps || '0').toString().replace(',', '.');
      if (repStr.includes('-')) repStr = repStr.split('-')[0];
      const rep = parseInt(repStr);

      if (!isNaN(kg) && !isNaN(rep) && kg > 0 && rep > 0) {
        const oneRM   = Math.round(kg * (1 + rep / 30));
        const current = getPRForExercise(selectedExercise.id);
        if (!current || oneRM > current.valor) detectedPR = { oneRM, kg, rep };
      }
      if (selectedExercise.restSeconds) startRest(selectedExercise.restSeconds);
    }

    setExerciseLogs(prev => {
      const updatedLogs = [...prev[selectedExercise.id]];
      updatedLogs[setIndex].done = isNowDone;
      return { ...prev, [selectedExercise.id]: updatedLogs };
    });

    if (detectedPR) {
      savePRRecord({
        exerciseId:   selectedExercise.id,
        exerciseName: selectedExercise.name,
        valor:        detectedPR.oneRM,
        cargaReal:    detectedPR.kg,
        repsReales:   detectedPR.rep,
      });
      setPrBanner({ name: selectedExercise.name, kg: detectedPR.kg, rep: detectedPR.rep });
      setSessionPRs(prev => [...prev, { name: selectedExercise.name, kg: detectedPR.kg, rep: detectedPR.rep, oneRM: detectedPR.oneRM }]);
      if (window.navigator?.vibrate) window.navigator.vibrate([100, 50, 100, 50, 200]);
      setTimeout(() => setPrBanner(null), 2500);
    }
  };

  useEffect(() => {
    if (isFinished && sessionDuration === 0) {
      setSessionDuration(Math.floor((Date.now() - sessionStartTime) / 1000));
      if (window.navigator?.vibrate) window.navigator.vibrate([80, 40, 80, 40, 200]);
    }
  }, [isFinished]);

  const computeMetrics = () => {
    let volTotal = 0, rpeTotal = 0, rpeCount = 0;
    const ejerciciosLimpios = [];
    Object.entries(exerciseLogs).forEach(([exId, sets]) => {
      let exVol = 0;
      let rpeSum = 0, rpeSets = 0;
      const exObj = allExercises.find(e => e.id === exId);
      
      sets.forEach(set => {
        if (set.done) {
          const kg   = parseFloat(set.carga) || parseFloat(set.cargaReal) || 0;
          // Fallback to prescribed reps if log.reps is empty
          let repStr = set.reps || exObj?.reps || '0';
          // if reps has a range like "8-12", just use the first number
          if (typeof repStr === 'string' && repStr.includes('-')) repStr = repStr.split('-')[0];
          const rep = parseInt(repStr) || 0;

          const rpe  = set.rpe || null;
          volTotal  += kg * rep;
          exVol     += kg * rep;
          if (rpe !== null) { 
            rpeTotal += rpe; 
            rpeCount++; 
            rpeSum += rpe;
            rpeSets++;
          }
        }
      });

      const goalConfig = getRPETargetForGoal(sessionData.type || 'gym');
      const rpeTarget = goalConfig.rpeTarget;
      const avgRPE = rpeSets > 0 ? parseFloat((rpeSum / rpeSets).toFixed(1)) : null;

      ejerciciosLimpios.push({ 
        id: exId, 
        nombre: exObj ? exObj.name : 'Desconocido',
        seriesLog: sets.filter(s => s.done),
        rpeTarget,
        avgRPE
      });
    });
    const rpeMedio       = rpeCount > 0 ? (rpeTotal / rpeCount).toFixed(1) : '-';
    const m              = Math.floor(sessionDuration / 60).toString().padStart(2, '0');
    const s              = (sessionDuration % 60).toString().padStart(2, '0');
    const tiempoFormateado = `${m}:${s}`;
    return { volTotal, rpeMedio, tiempoFormateado, ejerciciosLimpios };
  };

  const { volTotal, rpeMedio, tiempoFormateado, ejerciciosLimpios } = useMemo(
    () => computeMetrics(),
    [exerciseLogs, isFinished, sessionDuration, allExercises]
  );

  const handleSaveSession = async () => {
    setIsSaving(true);
    setToastMsg('Guardando sesión...');
    const atletaId = import.meta.env.VITE_ATLETA_ID || 'v-atleta-1';
    const fechaIso = new Date().toISOString();

    const payload = {
      sessionId:  sessionData.id || sessionData.sessionId || 'unknown',
      atletaId,
      fecha:      fechaIso,
      ejercicios: ejerciciosLimpios,
    };

    const sessionLog = {
      id: `log-${Date.now()}`,
      sessionId: sessionData.id || sessionData.sessionId || 'unknown',
      sessionName: sessionData.name || 'Sesión Libre',
      sessionType: sessionData.type || 'gym_fuerza',
      atletaId,
      fecha: fechaIso,
      duracion: sessionDuration,
      volumenTotal: volTotal,
      rpeMedio: parseFloat(rpeMedio) || 0,
      ejerciciosCompletados: completedCount,
      ejerciciosTotal: totalCount,
      ejercicios: ejerciciosLimpios
    };

    try {
      const existing = JSON.parse(localStorage.getItem('trainingos_session_logs') || '[]');
      localStorage.setItem('trainingos_session_logs', JSON.stringify([sessionLog, ...existing]));
    } catch (e) {
      console.warn('Error saving to localStorage', e);
    }

    try {
      await saveLog(payload);
      setToastMsg('¡Sesión sincronizada con éxito! ✓');
    } catch {
      setToastMsg('¡Guardado local OK! (Fallo Sheets)');
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const handleShare = async () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('es-ES', options);
    const df = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    
    let prText = '';
    if (sessionPRs.length > 0) {
      prText = `\n🏆 PRs conseguidos:\n${sessionPRs.map(pr => `  • ${pr.name}: *${pr.kg}kg × ${pr.rep} reps* → 1RM ~${pr.oneRM}kg`).join('\n')}\n──────────────────────`;
    }

    const msj = `🏋️ *TrainingOS — Resumen de Entreno*\n📅 ${df}\n💪 ${sessionData.name}\n──────────────────────\n📦 Volumen total: *${volTotal}kg*\n⚡ RPE medio: *${rpeMedio}*\n⏱ Tiempo: *${tiempoFormateado}*\n✅ Ejercicios: *${completedCount}/${totalCount} completados*\n──────────────────────${prText}\n_Registrado con TrainingOS_`;

    if (navigator.share) {
      try { await navigator.share({ title: 'Resumen Entreno', text: msj }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(msj);
        setToastMsg('Copiado al portapapeles');
      } catch (e) {
        setToastMsg('Error al copiar');
      }
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-[#F5F5F0] relative">

      {/* BANNER PR */}
      {prBanner && (
        <div className="fixed top-4 left-4 right-4 z-[200] animate-slide-down-fade bg-[#FF6B00] rounded-2xl shadow-[0_8px_30px_rgba(255,107,0,0.4)] p-4 flex flex-col items-center border-2 border-[#E85D04]">
          <div className="text-[#1C1C1E] font-condensed font-black text-3xl tracking-wide">
            🏆 ¡NUEVO PR!
          </div>
          <div className="text-[#1C1C1E]/70 font-sans font-bold mt-1 text-center text-sm">
            {prBanner.name} — {prBanner.kg}kg × {prBanner.rep} reps
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white px-5 pt-6 pb-5 border-b border-[#E8E8E4]">
        {/* Badge día */}
        {sessionData.dayBadge && (
          <span className="inline-block border border-[#E8E8E4] text-[#6E6E73] px-3 py-1 font-condensed font-bold text-[10px] rounded-lg tracking-widest uppercase mb-3">
            {sessionData.dayBadge}
          </span>
        )}
        <h1 className="font-condensed font-black leading-[0.9] text-[#1C1C1E] mb-3 tracking-[-0.02em]"
          style={{ fontSize: 'clamp(2rem, 7vw, 3rem)' }}>
          {sessionData.name || 'Sesión Libre'}
        </h1>
        <p className="text-[#6E6E73] text-sm font-medium">
          Toca cada ejercicio para registrar tus series
        </p>

        {/* Check-in status bar */}
        <div className="mt-4 flex justify-between items-center bg-[#F5F5F0] border border-[#E8E8E4] rounded-2xl px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2 text-[#6E6E73] font-semibold">
            <span>📋</span>
            <span>Check-in de disposición:</span>
            <span className={`font-black uppercase ${todayCheckIn ? 'text-green-600' : 'text-amber-500 animate-pulse'}`}>
              {todayCheckIn ? '✓ Completado' : '⚠️ Pendiente'}
            </span>
          </div>
          <button 
            onClick={() => setShowReadiness(true)}
            className="text-[#FF6B00] font-black uppercase hover:underline text-[11px] tracking-wider"
          >
            {todayCheckIn ? 'Ajustar' : 'Iniciar'}
          </button>
        </div>
      </div>

      {/* PROGRESS */}
      <div className="bg-white px-5 py-4 border-b border-[#E8E8E4]">
        <ProgressBar percentage={percentage} onReset={handleResetSession} />
      </div>

      {/* BANNER COMPLETADO */}
      {isFinished && (
        <div className="mx-4 mt-4 bg-white border border-[#E8E8E4] rounded-3xl overflow-hidden shadow-sm animate-fade-in-up">
          {/* Top hero */}
          <div className="bg-[#FFF3EC] px-6 py-5 text-center border-b border-[#E8E8E4]">
            <div className="inline-flex text-[#E85D04] mb-3">
              <CheckCircle2 size={44} strokeWidth={2} />
            </div>
            <h2 className="font-condensed font-black text-[28px] leading-none text-[#1C1C1E] tracking-wide">
              ¡ENTRENAMIENTO<br/>SUPERADO!
            </h2>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-px bg-[#E8E8E4]">
            {[
              { icon: <Zap size={14}/>,      label: 'Volumen',    value: volTotal,        unit: 'kg',   green: true },
              { icon: <BarChart3 size={14}/>, label: 'RPE Medio',  value: rpeMedio,        unit: '/ 10', green: false },
              { icon: <CheckCircle2 size={14}/>, label: 'Ejercicios', value: `${completedCount}/${totalCount}`, unit: '',   green: false },
              { icon: <Clock size={14}/>,    label: 'Tiempo',     value: tiempoFormateado, unit: '',   green: false },
            ].map(({ icon, label, value, unit, green }) => (
              <div key={label} className="bg-white px-4 py-5 flex flex-col items-center gap-1">
                <span className="flex items-center gap-1 text-[10px] font-condensed font-bold text-[#6E6E73] tracking-widest uppercase">
                  {icon} {label}
                </span>
                <span className={`font-condensed font-black text-3xl leading-none ${green ? 'text-[#FF6B00]' : 'text-[#1C1C1E]'}`}>
                  {value}
                  {unit && <span className="text-sm font-sans font-normal text-[#6E6E73] ml-1">{unit}</span>}
                </span>
              </div>
            ))}
          </div>

          {/* Acciones */}
          <div className="p-4 grid grid-cols-2 gap-3">
            <button
              onClick={handleShare}
              className="py-3.5 px-4 border-2 border-[#E8E8E4] rounded-2xl font-condensed font-bold text-[#1C1C1E] flex items-center justify-center gap-2 hover:border-[#1C1C1E] transition-colors"
            >
              <Share2 size={16} /> COMPARTIR
            </button>
            <button
              onClick={handleSaveSession}
              disabled={isSaving}
              className="py-3.5 px-4 bg-[#FF6B00] rounded-2xl font-condensed font-black text-white flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(255,107,0,0.3)] disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {isSaving
                ? <span className="w-5 h-5 border-2 border-[#1C1C1E] border-t-transparent rounded-full animate-spin" />
                : <><CloudUpload size={16} /> GUARDAR</>
              }
            </button>
          </div>

          {/* Feedback Section */}
          <div className="px-4 pb-4">
            <h3 className="font-condensed font-black text-lg text-[#1C1C1E] mb-3 flex items-center gap-2">
              💬 ¿Cómo te fue?
            </h3>
            <FeedbackSection
              sessionId={sessionData.id || sessionData.sessionId || 'unknown'}
              atletaId={import.meta.env.VITE_ATLETA_ID || 'v-atleta-1'}
              forceRole="athlete"
            />
          </div>
        </div>
      )}

      {/* BLOQUES DE EJERCICIOS */}
      <div className="flex flex-col gap-4 px-4 py-4" style={{ paddingBottom: 'calc(6rem + var(--safe-bottom,0px))' }}>
        {sessionData.blocks.map((block, bi) => (
          <div
            key={block.id}
            className={`bg-white border border-[#E8E8E4] rounded-2xl overflow-hidden shadow-sm stagger-${Math.min(bi + 1, 7)}`}
          >
            {/* Block header */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E8E8E4]"
              style={{
                borderLeft: `4px solid ${BLOCK_COLORS[block.type] || '#FF6B00'}`,
                backgroundColor: `${BLOCK_COLORS[block.type] || '#FF6B00'}08`,
              }}
            >
              <span className="text-xl w-7 text-center">{block.icon}</span>
              <h3 className="flex-1 font-condensed font-black text-sm tracking-widest uppercase text-[#1C1C1E] truncate">
                {block.name}
              </h3>
              <span className="border border-[#E8E8E4] text-[#6E6E73] px-2.5 py-1 rounded-lg font-condensed font-semibold text-xs shrink-0">
                {block.duration}
              </span>
            </div>

            <div className="flex flex-col divide-y divide-[#E8E8E4]">
              {block.exercises.map(exercise => (
                <ExerciseRow
                  key={exercise.id}
                  exercise={exercise}
                  sessionType={block.goal || sessionData.type || 'gym'}
                  isDone={isExerciseDone(exercise.id)}
                  isActive={selectedExercise?.id === exercise.id}
                  onToggle={() => handleOpenExercise(exercise, block.goal || sessionData.type || 'gym')}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM SHEET LOGGER */}
      {selectedExercise && (
        <SetLoggerSheet
          exercise={selectedExercise}
          sessionType={selectedExercise.sessionType || sessionData.type || 'gym'}
          logs={exerciseLogs[selectedExercise.id]}
          onLogChange={handleLogChange}
          onToggleSet={handleToggleSet}
          onClose={() => setSelectedExercise(null)}
        />
      )}

      {/* FAB TIMER */}
      <button
        onClick={() => setIsTimerOpen(true)}
        className="fixed bottom-[80px] right-5 w-14 h-14 bg-[#FF6B00] rounded-full flex items-center justify-center text-white z-[45] hover:scale-105 active:scale-95 transition-transform pulse-green"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      </button>

      {/* TOAST */}
      {toastMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#1C1C1E] text-white px-5 py-2.5 rounded-full shadow-xl z-50 animate-fade-in-up font-condensed font-bold tracking-wide whitespace-nowrap text-sm">
          {toastMsg}
        </div>
      )}

      {/* TIMER SHEET */}
      {isTimerOpen && <TimerSheet onClose={() => setIsTimerOpen(false)} />}

      {/* READINESS DAILY CHECK-IN */}
      {showReadiness && <ReadinessModal onClose={() => setShowReadiness(false)} />}
    </div>
  );
}
