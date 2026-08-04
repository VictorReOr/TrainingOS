import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SportSelector from '../components/SportSelector';
import { Play, CalendarDays, TrendingUp, Timer, Trophy, Flame, BarChart2 } from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { usePR } from '../context/PRContext';
import { useAthlete } from '../context/AthleteContext';
import { useFeedback } from '../context/FeedbackContext';
import { useSession } from '../context/SessionContext';
import { usePerformanceEngine } from '../hooks/usePerformanceEngine';
import { useTrainingStreak } from '../hooks/useTrainingStreak';
import { useReadiness } from '../context/ReadinessContext';
const getDayOfWeek = () => {
  const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  return days[new Date().getDay()];
};

const getGreetingBase = () => {
  const h = new Date().getHours();
  if (h < 13) return '¡Buenos días';
  if (h < 20) return '¡Buenas tardes';
  return '¡Buenas noches';
};

export default function Home() {
  const navigate    = useNavigate();
  const { weekSessions, weekAssignments, assignSessionToDay } = usePlanner();
  const { prs }     = usePR();
  const { athlete } = useAthlete();
  const { unreadCount } = useFeedback();
  const { loadSession } = useSession();
  const firstName = athlete?.name?.split(' ')[0] || '';
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  const {
    isEnabled, isColdStart, coldStartProgress, coldStartTotal,
    globalTrafficLight
  } = usePerformanceEngine();

  const { todayCheckIn } = useReadiness();
  const hasCheckedInToday = todayCheckIn !== null;
  const showWellnessBanner = isEnabled && !hasCheckedInToday && new Date().getHours() >= 6;

  const { currentStreak, days: streakDays } = useTrainingStreak();
  const sessionsInWindow = streakDays.filter(d => d.type !== 'rest').length;
  const completedInWindow = streakDays.filter(d => d.type === 'completed').length;

  // Best PR this week
  const latestPR = prs.length > 0 ? prs[0] : null;

  // Today's session
  const DAYS_ES     = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
  const todayKey    = DAYS_ES[new Date().getDay()];
  const todaySession = weekSessions?.[todayKey] || null;

  const quickActions = [
    { label: 'Plan',      sub: 'Semanal', icon: <CalendarDays size={18} />, to: '/plan',      color: 'var(--color-signal-orange)' },
    { label: 'Evolución', sub: 'Historial', icon: <TrendingUp  size={18} />, to: '/evolution', color: 'var(--color-ink)' },
    { label: 'Timer',     sub: 'Circuito',  icon: <Timer       size={18} />, to: '/timer',     color: 'var(--color-ink)' },
  ];

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== todaySession?.name) {
      const pad = n => n.toString().padStart(2, '0');
      const today = new Date();
      const todayISO = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
      
      const fullSession = weekAssignments?.[todayISO];
      if (fullSession) {
        assignSessionToDay(todayISO, { ...fullSession, name: editedName.trim() });
      }
    }
    setIsEditingName(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg text-ink">

      {/* HEADER */}
      <div className="px-5 pt-6 pb-4 bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-start justify-between mb-3.5">
          <button 
            onClick={() => navigate('/profile')} 
            className="relative w-11 h-11 bg-card border border-border text-ink hover:text-signal-orange hover:border-signal-orange flex items-center justify-center rounded-lg active:scale-95 transition-all cursor-pointer font-mono font-bold text-xs uppercase tracking-wider"
          >
            <span>
              {firstName ? firstName.slice(0, 2).toUpperCase() : 'OS'}
            </span>
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-corner-red text-white text-[9px] font-mono font-black flex items-center justify-center leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <SportSelector />
        </div>
        <div>
          <h1 className="font-sans font-light text-2xl leading-tight text-ink">
            {getGreetingBase()}{firstName && <>, <span className="font-bold">{firstName}</span></>}!
          </h1>
          <p className="font-mono text-[9px] text-muted uppercase tracking-widest mt-1">
            {getDayOfWeek().toUpperCase()}, {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }).toUpperCase()}
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4" style={{ paddingBottom: 'calc(5rem + var(--safe-bottom,0px))' }}>

        {/* ── HERO DOSSIER — Sesión de hoy ── */}
        {todaySession ? (
          <div className="bg-card border border-border rounded-xl overflow-hidden stagger-1 relative border-l-4 border-l-corner-red shadow-none">
            <div className="px-5 pt-5 pb-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-mono text-[8px] font-bold text-muted tracking-widest uppercase">REGISTRO DE HOY</span>
                <span className="font-mono text-[8px] font-bold text-muted tracking-widest uppercase">
                  FICHA N.{new Date().getDate() || '84'}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                {isEditingName ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="font-display font-black text-3xl leading-tight text-ink uppercase tracking-wide bg-transparent border-b-2 border-signal-orange outline-none w-full"
                    autoFocus
                  />
                ) : (
                  <>
                    <h2 className="font-display font-black text-3xl leading-tight text-ink uppercase tracking-wide truncate">
                      {todaySession.name}
                    </h2>
                    <button
                      onClick={() => {
                        setEditedName(todaySession.name);
                        setIsEditingName(true);
                      }}
                      className="text-muted hover:text-signal-orange cursor-pointer p-1.5 shrink-0"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                  </>
                )}
              </div>
              <p className="font-mono text-[9px] font-bold text-muted tracking-widest uppercase mt-0.5">
                ⏱ {todaySession.duration} MIN · 💪 {todaySession.exercises} EJERCICIOS
              </p>
            </div>
            
            <div className="h-px bg-border mx-5"></div>

            <div className="px-5 py-4 bg-card">
              <button
                onClick={() => {
                  loadSession({
                    id: todaySession.sessionId || todaySession.id || 'session-today',
                    name: todaySession.name || 'Sesión',
                    dayBadge: getDayOfWeek(),
                    type: todaySession.type || 'gym',
                    blocks: todaySession.blocks || [{
                      id: 'block-default',
                      name: todaySession.name || 'Bloque Principal',
                      type: 'fuerza',
                      icon: '🏋️',
                      duration: `${todaySession.duration || 45}m`,
                      exercises: []
                    }],
                  });
                  navigate('/session');
                }}
                className="w-full py-3.5 bg-signal-orange text-ink font-display font-black text-xl rounded-xl active:scale-[0.98] transition-transform tracking-wider flex items-center justify-center gap-2 uppercase hover:bg-signal-orange/95 cursor-pointer"
              >
                <Play size={18} fill="#111827" stroke="none" /> INICIAR ENTRENAMIENTO
              </button>
            </div>
          </div>
        ) : (
          /* Hero vacío estilo documento oficial */
          <div className="space-y-4 stagger-1">
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-14 h-5 border border-border mx-auto mb-4 flex items-center justify-center font-mono font-bold text-[9px] text-muted tracking-wider uppercase rounded">
                DESC
              </div>
              <h2 className="font-display font-black text-2xl text-ink uppercase tracking-wide">Día de descanso</h2>
              <p className="font-sans text-xs text-muted mb-4 mt-1">Recuperación activa — mañana vuelves más fuerte</p>
              <button
                onClick={() => navigate('/plan')}
                className="border border-border bg-card text-ink font-display font-black px-6 py-2.5 rounded-xl hover:border-ink transition-all cursor-pointer uppercase tracking-wider text-sm"
              >
                VER PLAN SEMANAL
              </button>
            </div>
            
            <button
               onClick={() => navigate('/import')}
               className="w-full bg-ink rounded-xl p-5 text-left flex items-center justify-between active:scale-[0.98] transition-transform shadow-none cursor-pointer"
            >
               <div>
                  <h3 className="font-condensed font-black text-white text-base uppercase tracking-wide">¿Tienes código de sesión?</h3>
                  <p className="font-mono text-[9px] text-muted uppercase tracking-wider mt-1">Descarga el entreno de tu coach</p>
               </div>
               <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                  <Play size={14} fill="white" stroke="none" />
               </div>
            </button>
          </div>
        )}

        {/* ── RACHA SEMANAL RECTANGULAR ── */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-none stagger-2">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <p className="font-mono text-[9px] text-muted tracking-widest uppercase">Racha de Entrenamiento</p>
              <p className="font-display font-black text-2xl text-ink leading-none mt-1 uppercase">
                {completedInWindow} <span className="text-xs font-mono font-normal text-muted tracking-normal">/ {sessionsInWindow} SESIONES</span>
              </p>
            </div>
            <div className="flex items-center gap-1 text-belt-gold">
              <Flame size={18} fill="currentColor" stroke="none" />
              <span className="font-display font-black text-xl leading-none">{currentStreak}</span>
            </div>
          </div>
          
          <div className="flex gap-1.5 justify-between">
            {streakDays.map((day, i) => {
              const DAYS_KEYS = ['DO','LU','MA','MI','JU','VI','SÁ'];
              const label = DAYS_KEYS[day.date.getDay()];
              const isToday = day.date.toDateString() === new Date().toDateString();

              let cellClass = "w-full h-8 rounded-lg flex items-center justify-center transition-all ";
              let cellStyle = {};

              if (isToday) {
                cellClass += "border-[1.5px] border-signal-orange ";
                if (day.type === 'completed') {
                  cellStyle.backgroundColor = 'var(--color-success-green)';
                } else {
                  cellClass += "bg-signal-orange/10 ";
                }
              } else {
                if (day.type === 'rest') {
                  cellClass += "opacity-30 ";
                } else if (day.type === 'completed') {
                  cellStyle.backgroundColor = 'var(--color-success-green)';
                } else if (day.type === 'pending') {
                  cellClass += "border border-border bg-transparent ";
                } else if (day.type === 'broken') {
                  cellClass += "border border-corner-red bg-transparent ";
                }
              }

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className={cellClass} style={cellStyle}>
                    {day.type === 'completed' && (
                      <span className="font-mono text-xs font-black text-white">✓</span>
                    )}
                  </div>
                  <span className={`text-[10px] font-mono font-bold tracking-wider ${
                    isToday ? 'text-signal-orange' : 'text-muted'
                  }`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── WELLNESS CHECK-IN BANNER ── */}
        {showWellnessBanner && (
          <div 
            onClick={() => setShowCheckIn(true)}
            className="bg-card border border-signal-orange/30 rounded-xl p-3.5 flex items-center justify-between cursor-pointer stagger-1 hover:border-signal-orange shadow-none"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">☀️</span>
              <div>
                <h4 className="font-condensed font-black text-sm text-ink uppercase tracking-wide">¿Cómo has llegado hoy?</h4>
                <p className="font-mono text-[9px] text-muted uppercase tracking-wider">Completa tu check-in diario de bienestar</p>
              </div>
            </div>
            <span className="font-mono font-bold text-xs text-signal-orange uppercase">→</span>
          </div>
        )}

        {/* ── PERFORMANCE ENGINE ESTADO / TRAFFIC LIGHT ── */}
        <div className="bg-card border border-border rounded-xl p-4 stagger-3 shadow-none">
          {isColdStart ? (
            <ColdStartBanner current={coldStartProgress} total={coldStartTotal} />
          ) : globalTrafficLight ? (
            <div className="flex items-center justify-between">
              <TrafficLightBadge
                color={globalTrafficLight.color}
                label={globalTrafficLight.label}
                simpleMessage={globalTrafficLight.simpleMessage}
                size="md"
              />
              <button
                onClick={() => navigate('/performance')}
                className="font-mono text-[9px] font-bold text-signal-orange uppercase tracking-wider hover:underline cursor-pointer"
              >
                Análisis →
              </button>
            </div>
          ) : (
            <p className="font-mono text-[9px] text-muted uppercase">Engine no activo</p>
          )}
        </div>

        {/* ── ÚLTIMO PR ── */}
        {latestPR && (
          <button
            onClick={() => navigate('/evolution')}
            className="w-full bg-card border border-border rounded-xl p-4 text-left flex items-center gap-4 active:scale-[0.98] transition-transform stagger-4 hover:border-signal-orange cursor-pointer shadow-none"
          >
            <div className="w-10 h-10 border border-border text-corner-red flex items-center justify-center shrink-0 rounded-lg">
              <Trophy size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[8px] text-muted tracking-widest uppercase font-bold">Último Récord</p>
              <p className="font-condensed font-black text-base text-ink uppercase truncate tracking-wide">{latestPR.exerciseName}</p>
              <p className="font-mono text-[9px] text-muted mt-0.5">
                {latestPR.cargaReal}KG × {latestPR.repsReales} REPS
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="font-display font-black text-3xl text-signal-orange leading-none">
                {Math.round(latestPR.valor)}
              </div>
              <div className="font-mono text-[8px] text-muted uppercase tracking-wider font-bold">kg 1rm</div>
            </div>
          </button>
        )}

        {/* ── ACCESOS RÁPIDOS ── */}
        <div>
          <p className="font-mono text-[9px] text-muted tracking-widest uppercase mb-2 px-1">Accesos Rápidos</p>
          <div className="grid grid-cols-3 gap-2.5">
            {quickActions.map(({ label, sub, icon, to, color }, qi) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={`bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-2 active:scale-[0.96] transition-transform hover:border-muted cursor-pointer stagger-${Math.min(qi+4,7)} shadow-none`}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: color === 'var(--color-signal-orange)' ? 'var(--color-accent-soft)' : 'var(--color-bg)', color }}
                >
                  {icon}
                </div>
                <div className="text-center">
                  <p className="font-condensed font-black text-sm text-ink leading-none uppercase tracking-wide">{label}</p>
                  <p className="font-mono text-[9px] text-muted mt-1 uppercase tracking-wider">{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── BOTÓN ANÁLISIS COMPLETO PERFORMANCE ENGINE ── */}
        <button
          onClick={() => navigate('/performance')}
          className="w-full bg-card border border-border rounded-xl p-4 text-left flex items-center justify-between active:scale-[0.98] transition-transform hover:border-signal-orange cursor-pointer shadow-none stagger-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-signal-orange/10 text-signal-orange flex items-center justify-center shrink-0">
              <BarChart2 size={20} />
            </div>
            <div>
              <p className="font-mono text-[8px] text-muted tracking-widest uppercase font-bold">PERFORMANCE ENGINE</p>
              <h3 className="font-condensed font-black text-base text-ink uppercase tracking-wide">Ver Análisis Completo</h3>
              <p className="font-mono text-[9px] text-muted mt-0.5 uppercase">Índices, recomendaciones y transfer TKD</p>
            </div>
          </div>
          <span className="font-mono font-black text-signal-orange text-sm">→</span>
        </button>

        {/* ── STATS RÁPIDAS (RESUMEN) ── */}
        <div className="bg-card border border-border rounded-xl p-5 stagger-7 shadow-none">
          <p className="font-mono text-[9px] text-muted tracking-widest uppercase mb-4">Resumen Histórico</p>
          <div className="grid grid-cols-3 gap-4 divide-x divide-border">
            {[
              { label: 'Récords',     value: prs.length,   unit: 'marcas'   },
              { label: 'Esta semana', value: trainedCount,  unit: 'sesiones' },
              { label: 'Hoy',         value: todaySession ? todaySession.duration : 0, unit: 'min' },
            ].map(({ label, value, unit }) => (
              <div key={label} className="text-center">
                <div className="font-display font-black text-3.5xl text-signal-orange leading-none">{value}</div>
                <div className="font-mono text-[9px] text-muted uppercase tracking-wider mt-1.5 font-bold">{unit}</div>
                <div className="font-mono text-[8px] text-muted uppercase tracking-wider mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Wellness modal */}
      {showCheckIn && (
        <WellnessCheckIn onDismiss={() => setShowCheckIn(false)} />
      )}
    </div>
  );
}
