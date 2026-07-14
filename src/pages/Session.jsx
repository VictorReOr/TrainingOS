import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { useAthlete } from '../context/AthleteContext';
import ProgressBar from '../components/ProgressBar';
import ExerciseRow from '../components/ExerciseRow';
import SetLoggerSheet from '../components/SetLoggerSheet';
import TimerSheet from '../components/TimerSheet';
import ReadinessModal from '../components/ReadinessModal';
import FeedbackSection from '../components/FeedbackSection';
import { CheckCircle2, Share2, CloudUpload } from 'lucide-react';

const BLOCK_COLORS = {
  calentamiento: 'var(--color-corner-blue)',
  principal: 'var(--color-corner-red)',
  fuerza: 'var(--color-corner-red)',
  tkd: 'var(--color-corner-blue)',
  cardio: 'var(--color-success-green)',
  core: 'var(--color-corner-blue)',
};

export default function Session() {
  const {
    sessionData,
    exerciseLogs,
    completedCount,
    totalCount,
    volTotal,
    rpeMedio,
    tiempoFormateado,
    isFinished,
    isSaving,
    saveSession,
    resetSession,
  } = useSession();

  const { todayCheckIn } = useAthlete();

  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [showReadiness, setShowReadiness] = useState(false);
  const [prBanner, setPrBanner] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Auto-open readiness on mount if not checked today
  useEffect(() => {
    if (!todayCheckIn && sessionData) {
      const timer = setTimeout(() => setShowReadiness(true), 500);
      return () => clearTimeout(timer);
    }
  }, [todayCheckIn, sessionData]);

  // Listener for new PR events
  useEffect(() => {
    const handlePR = (e) => {
      setPrBanner(e.detail);
      setTimeout(() => setPrBanner(null), 2500);
    };
    window.addEventListener('new-pr', handlePR);
    return () => window.removeEventListener('new-pr', handlePR);
  }, []);

  if (!sessionData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-bg text-ink min-h-screen">
        <p className="font-mono text-xs text-muted uppercase tracking-wider mb-4">No hay ninguna sesión activa</p>
        <button
          onClick={() => window.location.href = '/plan'}
          className="px-6 py-2.5 bg-signal-orange text-ink font-display font-black rounded-xl cursor-pointer uppercase tracking-wider text-sm"
        >
          Ir al Plan Semanal
        </button>
      </div>
    );
  }

  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const isExerciseDone = (exerciseId) => {
    const logs = exerciseLogs[exerciseId] || [];
    if (logs.length === 0) return false;
    return logs.every(log => log.done);
  };

  const handleOpenExercise = (exercise, blockGoal) => {
    setSelectedExercise({ ...exercise, sessionType: blockGoal });
  };

  const handleLogChange = () => {
    // SessionContext handles this internally, trigger re-render
  };

  const handleToggleSet = () => {
    // SessionContext handles this internally, trigger re-render
  };

  const handleResetSession = () => {
    if (window.confirm('¿Seguro que quieres reiniciar la sesión actual? Perderás las series registradas.')) {
      resetSession();
    }
  };

  const handleSaveSession = async () => {
    try {
      await saveSession();
      setToastMsg('Sesión guardada en Excel');
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setToastMsg('Error al guardar sesión');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleShare = () => {
    const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const text = `🏆 ¡Entrenamiento Superado! (${dateStr})\n💪 ${sessionData.name}\n🏋️ Volumen Total: ${volTotal}kg\n⚡ RPE Medio: ${rpeMedio}/10\n⏱ Tiempo: ${tiempoFormateado}\nRegistrado en TrainingOS.`;
    
    if (navigator.share) {
      navigator.share({ title: 'TrainingOS', text }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      setToastMsg('Copiado al portapapeles');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-bg relative">

      {/* BANNER PR */}
      {prBanner && (
        <div className="fixed top-4 left-4 right-4 z-[200] animate-slide-down-fade bg-signal-orange text-ink rounded-xl border-2 border-ink p-4 flex flex-col items-center shadow-lg">
          <div className="font-display font-black text-2.5xl tracking-wide uppercase">
            🏆 ¡NUEVO PR!
          </div>
          <div className="font-mono text-xs font-bold mt-0.5 text-center uppercase tracking-wider">
            {prBanner.name} — {prBanner.kg}KG × {prBanner.rep} REPS
          </div>
        </div>
      )}

      {/* HEADER TICKET */}
      <div className="bg-card px-5 pt-6 pb-5 border-b border-border">
        {sessionData.dayBadge && (
          <span className="inline-block border border-border text-muted px-3 py-1 font-mono font-bold text-[9px] rounded-lg tracking-widest uppercase mb-3">
            {sessionData.dayBadge.toUpperCase()}
          </span>
        )}
        <h1 className="font-display font-black leading-none text-ink mb-3 uppercase tracking-wide"
          style={{ fontSize: 'clamp(2rem, 7vw, 3rem)' }}>
          {sessionData.name || 'Sesión Libre'}
        </h1>
        <p className="font-mono text-[9px] text-muted uppercase tracking-widest">
          Toca cada ejercicio para registrar tus series reales
        </p>

        {/* Check-in status bar */}
        <div className="mt-4 flex justify-between items-center bg-bg/25 border border-border rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 font-mono text-[9px] text-muted tracking-wider uppercase">
            <span>DISPOSICIÓN:</span>
            <span className={`font-black tracking-widest ${todayCheckIn ? 'text-corner-blue' : 'text-signal-orange animate-pulse'}`}>
              {todayCheckIn ? 'COMPLETADO' : 'PENDIENTE'}
            </span>
          </div>
          <button 
            onClick={() => setShowReadiness(true)}
            className="text-signal-orange font-mono font-black uppercase text-[10px] tracking-wider hover:underline cursor-pointer"
          >
            {todayCheckIn ? 'AJUSTAR' : 'INICIAR'}
          </button>
        </div>
      </div>

      {/* PROGRESS */}
      <div className="bg-card px-5 py-4 border-b border-border">
        <ProgressBar percentage={percentage} onReset={handleResetSession} />
      </div>

      {/* BLOQUES DE EJERCICIOS */}
      <div className="flex flex-col gap-4 px-4 py-4" style={{ paddingBottom: 'calc(6rem + var(--safe-bottom,0px))' }}>
        {sessionData.blocks.map((block, bi) => (
          <div
            key={block.id}
            className={`bg-card border border-border rounded-xl overflow-hidden stagger-${Math.min(bi + 1, 7)}`}
          >
            {/* Block header */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 border-b border-border"
              style={{
                borderLeft: `4px solid ${BLOCK_COLORS[block.type] || '#FF5A00'}`,
                backgroundColor: `${BLOCK_COLORS[block.type] || '#FF5A00'}03`,
              }}
            >
              {block.icon && (
                <div className="w-6 h-6 border border-border flex items-center justify-center text-xs shrink-0 rounded">
                  {block.icon}
                </div>
              )}
              <h3 className="flex-1 font-condensed font-black text-sm tracking-widest uppercase text-ink truncate">
                {block.name}
              </h3>
              <span className="border border-border text-muted px-2.5 py-0.5 rounded-lg font-mono text-[9px] tracking-wider uppercase shrink-0 font-bold">
                {block.duration}
              </span>
            </div>

            <div className="flex flex-col divide-y divide-border">
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

        {/* COMPLETADO TICKET */}
        {isFinished && (
          <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in-up border-l-4 border-l-success-green shadow-none">
            {/* Top header */}
            <div className="px-6 py-5 text-center">
              <div className="w-20 h-6 border border-success-green text-success-green flex items-center justify-center mx-auto mb-3 font-mono font-bold text-[9px] uppercase tracking-wider rounded">
                SUPERADO
              </div>
              <h2 className="font-display font-black text-3xl leading-none text-ink uppercase tracking-wide">
                ¡Entrenamiento<br/>Superado!
              </h2>
            </div>

            <div className="h-px bg-border mx-6"></div>

            {/* Métricas */}
            <div className="grid grid-cols-2 gap-px bg-border">
              {[
                { label: 'Volumen',    value: volTotal,        unit: 'kg',   orange: true },
                { label: 'RPE Medio',  value: rpeMedio,        unit: '/ 10', orange: false },
                { label: 'Ejercicios', value: `${completedCount}/${totalCount}`, unit: '',   orange: false },
                { label: 'Tiempo',     value: tiempoFormateado, unit: '',   orange: false },
              ].map(({ label, value, unit, orange }) => (
                <div key={label} className="bg-card px-4 py-4 flex flex-col items-center gap-0.5">
                  <span className="font-mono text-[9px] font-bold text-muted tracking-widest uppercase">
                    {label}
                  </span>
                  <span className={`font-display font-black text-3xl leading-none ${orange ? 'text-signal-orange' : 'text-ink'}`}>
                    {value}
                    {unit && <span className="text-xs font-mono font-normal text-muted tracking-normal ml-0.5 uppercase">{unit}</span>}
                  </span>
                </div>
              ))}
            </div>

            <div className="h-px bg-border mx-6"></div>

            {/* Acciones */}
            <div className="p-4 grid grid-cols-2 gap-3 bg-card">
              <button
                onClick={handleShare}
                className="py-3.5 px-4 border-2 border-border rounded-xl font-display font-black text-base text-ink tracking-wider flex items-center justify-center gap-2 hover:border-ink transition-colors cursor-pointer uppercase"
              >
                <Share2 size={16} /> COMPARTIR
              </button>
              <button
                onClick={handleSaveSession}
                disabled={isSaving}
                className="py-3.5 px-4 bg-signal-orange rounded-xl font-display font-black text-base text-ink tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform cursor-pointer uppercase"
              >
                {isSaving
                  ? <span className="w-5 h-5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
                  : <><CloudUpload size={16} /> GUARDAR</>
                }
              </button>
            </div>

            {/* Feedback Section */}
            <div className="px-4 pb-4 bg-card">
               <span className="font-mono text-[9px] text-muted tracking-widest uppercase mb-3 block font-bold">
                 COMENTARIOS Y FEEDBACK
               </span>
              <FeedbackSection
                sessionId={sessionData.id || sessionData.sessionId || 'unknown'}
                atletaId={import.meta.env.VITE_ATLETA_ID || 'v-atleta-1'}
                forceRole="athlete"
              />
            </div>
          </div>
        )}
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
        className="fixed bottom-[80px] right-5 w-14 h-14 bg-signal-orange rounded-full flex items-center justify-center text-ink z-[45] hover:scale-105 active:scale-95 transition-transform pulse-green shadow-lg cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      </button>

      {/* TOAST */}
      {toastMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-ink text-white px-5 py-2.5 rounded-xl shadow-lg z-50 animate-fade-in-up font-mono text-xs font-bold tracking-wider uppercase whitespace-nowrap">
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
