import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { useAthlete } from '../context/AthleteContext';
import ProgressBar from '../components/ProgressBar';
import ExerciseRow from '../components/ExerciseRow';
import SetLoggerSheet from '../components/SetLoggerSheet';
import TimerSheet from '../components/TimerSheet';
import ReadinessModal from '../components/ReadinessModal';
import FeedbackSection from '../components/FeedbackSection';
import { CheckCircle2, Share2, CloudUpload, Zap, BarChart3, Clock } from 'lucide-react';


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
    isFinished,
    isSaving,
    completedCount,
    totalCount,
    percentage,
    volTotal,
    rpeMedio,
    tiempoFormateado,
    loadSession,
    updateSet,
    toggleSet,
    saveSessionToSheets,
    resetSession,
  } = useSession();

  const { athlete } = useAthlete();

  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [showReadiness, setShowReadiness] = useState(false);
  const [prBanner, setPrBanner] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Daily check-in indicator status
  const [todayCheckIn, setTodayCheckIn] = useState(() => {
    try {
      return sessionStorage.getItem('trainingos_today_readiness') !== null;
    } catch { return false; }
  });

  useEffect(() => {
    const handleReadinessCompleted = () => {
      setTodayCheckIn(true);
    };
    window.addEventListener('readiness_checkin_completed', handleReadinessCompleted);
    return () => window.removeEventListener('readiness_checkin_completed', handleReadinessCompleted);
  }, []);

  // Listen to new PR event inside session logging
  useEffect(() => {
    const handleNewPR = (e) => {
      const { name, kg, reps, val } = e.detail;
      setPrBanner({ name, kg, rep: reps, val });
      setTimeout(() => setPrBanner(null), 3500);
    };
    window.addEventListener('trainingos_new_pr', handleNewPR);
    return () => window.removeEventListener('trainingos_new_pr', handleNewPR);
  }, []);

  if (!sessionData) {
    return (
      <div className="flex-1 bg-bg flex flex-col justify-center items-center p-6 min-h-screen text-center">
        <div className="w-14 h-14 stamp-circle border-corner-red text-corner-red flex items-center justify-center -rotate-6 mb-4">
          <span className="text-xs font-mono font-black">ENTR</span>
        </div>
        <h2 className="font-display font-black text-2xl text-ink uppercase">Sin Sesión Activa</h2>
        <p className="font-sans text-sm text-muted max-w-xs mt-1 mb-6">
          Ve a tu plan o selecciona un entrenamiento en la pantalla de inicio para comenzar.
        </p>
      </div>
    );
  }

  const isExerciseDone = (exerciseId) => {
    const logs = exerciseLogs[exerciseId];
    if (!logs || logs.length === 0) return false;
    return logs.every(log => log.done);
  };

  const handleOpenExercise = (ex, type) => {
    setSelectedExercise({ ...ex, sessionType: type });
  };

  const handleLogChange = (index, field, value) => {
    if (!selectedExercise) return;
    updateSet(selectedExercise.id, index, field, value);
  };

  const handleToggleSet = (index) => {
    if (!selectedExercise) return;
    toggleSet(selectedExercise.id, index);
  };

  const handleResetSession = () => {
    if (window.confirm('¿Seguro que quieres reiniciar todo el progreso de la sesión actual? Esta acción no se puede deshacer.')) {
      resetSession();
      setToastMsg('Sesión reiniciada');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleSaveSession = async () => {
    try {
      await saveSessionToSheets();
      setToastMsg('¡Entrenamiento guardado con éxito!');
      setTimeout(() => setToastMsg(''), 3000);
    } catch (e) {
      setToastMsg('Error al sincronizar con Sheets');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleShare = () => {
    const text = `💪 ¡Entrenamiento superado! Volumen total: ${volTotal}kg. RPE Medio: ${rpeMedio}. Sesión: ${sessionData.name}.`;
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
            className={`bg-card border border-border rounded-2xl overflow-hidden stagger-${Math.min(bi + 1, 7)}`}
          >
            {/* Block header */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 border-b border-border"
              style={{
                borderLeft: `4px solid ${BLOCK_COLORS[block.type] || '#FF5A00'}`,
                backgroundColor: `${BLOCK_COLORS[block.type] || '#FF5A00'}05`,
              }}
            >
              {block.icon && (
                <div className="w-6 h-6 stamp-circle border-border flex items-center justify-center text-[10px] shrink-0 font-black">
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
          <div className="bg-card border border-border rounded-2xl overflow-hidden animate-fade-in-up border-l-4 border-l-success-green">
            {/* Top header */}
            <div className="px-6 py-5 text-center">
              <div className="w-14 h-14 stamp-circle border-success-green text-success-green flex items-center justify-center mx-auto mb-3 -rotate-6">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="font-display font-black text-3xl leading-none text-ink uppercase tracking-wide">
                ¡Entrenamiento<br/>Superado!
              </h2>
            </div>

            {/* Ticket perforation line */}
            <div className="ticket-punch"></div>

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

            {/* Ticket perforation line 2 */}
            <div className="ticket-punch"></div>

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
               <span className="font-mono text-[9px] text-muted tracking-widest uppercase mb-3 block">
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
