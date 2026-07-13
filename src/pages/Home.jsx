import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SportSelector from '../components/SportSelector';
import { Play, CalendarDays, TrendingUp, Timer, Zap, Trophy, Flame, User } from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { usePR } from '../context/PRContext';
import { useAthlete } from '../context/AthleteContext';
import { useFeedback } from '../context/FeedbackContext';
import { useFatigue } from '../hooks/useFatigue';

// Day of week helper
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
  const { weekSessions } = usePlanner();
  const { prs }     = usePR();
  const { athlete } = useAthlete();
  const { unreadCount } = useFeedback();
  const fatigue = useFatigue();
  const firstName = athlete?.name?.split(' ')[0] || '';

  const streak = useMemo(() => {
    const today = new Date();
    const DAYS_KEYS = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
    const SESSION_TYPE_COLORS = {
      gym_fuerza:      '#FF6B00',
      gym_hipertrofia: '#3d7dd4',
      gym:             '#FF6B00',
      tkd:             '#3d7dd4',
      cardio:          '#27ae60',
      descanso:        '#E8E8E4',
    };
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const key = DAYS_KEYS[d.getDay()];
      const sessions = weekSessions?.[key] || [];
      const trained = sessions.length > 0;
      const sessionType = sessions[0]?.type || null;
      const isPast = d < new Date(today.toDateString());
      return {
        date: d,
        label: ['LU','MA','MI','JU','VI','SÁ','DO'][d.getDay() === 0 ? 6 : d.getDay() - 1],
        isToday: d.toDateString() === today.toDateString(),
        trained,
        isPast,
        color: SESSION_TYPE_COLORS[sessionType] || '#FF6B00',
      };
    });
  }, [weekSessions]);
  const trainedCount = streak.filter(d => d.trained).length;

  // Best PR this week (mock — first PR)
  const latestPR = prs.length > 0 ? prs[prs.length - 1] : null;

  // Today's session (mock from planner)
  const DAYS_ES     = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
  const todayKey    = DAYS_ES[new Date().getDay()];
  const todaySession = weekSessions?.[todayKey] || null;

  const quickActions = [
    { label: 'Plan',      sub: 'Semana actual', icon: <CalendarDays size={22} />, to: '/plan',      color: '#FF6B00' },
    { label: 'Evolución', sub: 'PRs & gráficas', icon: <TrendingUp  size={22} />, to: '/evolution', color: '#1C1C1E' },
    { label: 'Timer',     sub: 'Circuito',       icon: <Timer       size={22} />, to: '/timer',     color: '#1C1C1E' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0] text-[#1C1C1E]">

      {/* HEADER */}
      <div className="px-5 pt-6 pb-4 bg-white border-b border-[#E8E8E4] sticky top-0 z-10">
        <div className="flex items-start justify-between mb-2">
          <button 
            onClick={() => navigate('/profile')} 
            className="relative w-10 h-10 bg-[#FF6B00] rounded-full border border-[#E85D04] shadow-sm flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            <User size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <SportSelector />
        </div>
        <div>
          <h1 className="font-sans font-light text-2xl leading-tight text-[#1C1C1E]">
            {getGreetingBase()}{firstName && <>, <span className="font-semibold">{firstName}</span></>}!
          </h1>
          <p className="text-sm text-[#6E6E73] font-normal tracking-[0.02em]">{getDayOfWeek()}, {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4" style={{ paddingBottom: 'calc(5rem + var(--safe-bottom,0px))' }}>

        {/* ── HERO CARD — Sesión de hoy ── */}
        {(todaySession && todaySession.length > 0) ? (
          <div className="bg-white border border-[#E8E8E4] rounded-3xl overflow-hidden shadow-sm stagger-1">
            <div className="bg-[#FFF3EC] px-5 pt-5 pb-4 border-b border-[#E8E8E4]">
              <p className="text-[10px] font-condensed font-bold text-[#E85D04] tracking-widest uppercase mb-1">
                SESIÓN DE HOY
              </p>
              <h2 className="font-condensed font-black text-[32px] leading-tight text-[#1C1C1E]">
                {todaySession[0].name}
              </h2>
              <p className="text-sm text-[#6E6E73] mt-1">
                ⏱ {todaySession[0].duration} min · 💪 {todaySession[0].exercises} ejercicios
              </p>
            </div>
            <div className="px-5 py-4">
              <button
                onClick={() => navigate('/session')}
                className="w-full py-4 bg-[#FF6B00] text-white font-condensed font-black text-xl rounded-2xl shadow-[0_4px_20px_rgba(255,107,0,0.35)] active:scale-[0.98] transition-transform tracking-wide flex items-center justify-center gap-2"
              >
                <Play size={20} fill="#1C1C1E" /> INICIAR SESIÓN
              </button>
            </div>
          </div>
        ) : (
          /* Hero vacío + CTA Importar */
          <div className="space-y-4 stagger-1">
            <div className="bg-white border-2 border-dashed border-[#E8E8E4] rounded-3xl p-6 text-center">
              <div className="text-5xl mb-3">😴</div>
              <h2 className="font-condensed font-black text-2xl text-[#1C1C1E] mb-1">Día de descanso</h2>
              <p className="text-sm text-[#6E6E73] mb-4">Recuperación activa — mañana vuelves más fuerte</p>
              <button
                onClick={() => navigate('/plan')}
                className="border-2 border-[#FF6B00] text-[#E85D04] font-condensed font-black px-6 py-2.5 rounded-2xl hover:bg-[#FFF3EC] transition-colors"
              >
                VER PLAN SEMANAL
              </button>
            </div>
            
            <button
               onClick={() => navigate('/import')}
               className="w-full bg-[#1C1C1E] rounded-3xl p-5 text-left flex items-center justify-between active:scale-[0.98] transition-transform shadow-md"
            >
               <div>
                  <h3 className="font-condensed font-black text-white text-xl">¿Tienes código de sesión?</h3>
                  <p className="text-sm text-[#A1A1AA] mt-1">Descarga el entreno de tu coach</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                  <Play size={18} fill="white" />
               </div>
            </button>
          </div>
        )}

        {/* ── RACHA SEMANAL ── */}
        <div className="bg-white border border-[#E8E8E4] rounded-2xl p-4 shadow-sm stagger-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-condensed font-bold text-[#6E6E73] tracking-widest uppercase">RACHA SEMANAL</p>
              <p className="font-condensed font-black text-xl text-[#1C1C1E] leading-none mt-0.5">
                {trainedCount}
                <span className="text-sm font-sans font-normal text-[#6E6E73] ml-1">/ 7 días</span>
              </p>
            </div>
            <div className="flex items-center gap-1 text-[#FF6B00]">
              <Flame size={18} />
              <span className="font-condensed font-black text-lg">{trainedCount}</span>
            </div>
          </div>
          <div className="flex gap-1.5 justify-between">
            {streak.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    day.isToday
                      ? 'border-2 border-[#FF6B00]'
                      : !day.trained
                      ? 'bg-[#F5F5F0] border border-[#E8E8E4]'
                      : ''
                  }`}
                  style={
                    day.isToday
                      ? { backgroundColor: '#FFF3EC' }
                      : day.trained
                      ? { backgroundColor: day.color, opacity: day.isPast ? 0.5 : 1 }
                      : {}
                  }
                >
                  {day.trained && !day.isToday && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  )}
                  {day.isToday && day.trained && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: day.color }} />
                  )}
                  {day.isToday && !day.trained && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E8E8E4]" />
                  )}
                </div>
                <span className={`text-[9px] font-condensed font-bold tracking-wider ${
                  day.isToday ? 'text-[#FF6B00]' : day.trained ? 'text-[#6E6E73]' : 'text-[#D4D4D8]'
                }`}>
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── NIVEL DE FATIGA ── */}
        <div
          className="bg-white border border-[#E8E8E4] rounded-2xl p-4 shadow-sm stagger-3 flex items-start gap-4"
          style={{ borderLeftWidth: '4px', borderLeftColor: fatigue.color }}
        >
          <div className="text-2xl leading-none mt-0.5">{fatigue.emoji}</div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-condensed font-bold text-[#6E6E73] tracking-widest uppercase">NIVEL DE FATIGA</p>
            <p className="font-condensed font-black text-xl leading-none mt-1" style={{ color: fatigue.color }}>
              {fatigue.label}
            </p>
            <p className="text-sm text-[#6E6E73] mt-1">{fatigue.mensaje}</p>
            {fatigue.level !== 'SIN_DATOS' && (
              <p className="text-xs text-[#A1A1AA] mt-1">RPE medio últimos 7 días: {fatigue.rpePonderado}</p>
            )}
          </div>
        </div>

        {/* ── ÚLTIMO PR ── */}
        {latestPR && (
          <button
            onClick={() => navigate('/evolution')}
            className="w-full bg-white border border-[#E8E8E4] rounded-2xl p-4 shadow-sm text-left flex items-center gap-4 active:scale-[0.98] transition-transform stagger-4 hover:border-[#FF6B00]"
          >
            <div className="w-12 h-12 bg-[#FFF3EC] border border-[#FDDCB5] rounded-2xl flex items-center justify-center shrink-0">
              <Trophy size={22} className="text-[#E85D04]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-condensed font-bold text-[#6E6E73] tracking-widest uppercase mb-0.5">ÚLTIMO PR</p>
              <p className="font-condensed font-bold text-[17px] text-[#1C1C1E] truncate">{latestPR.exerciseName}</p>
              <p className="text-xs text-[#6E6E73] mt-0.5">
                {latestPR.cargaReal}kg × {latestPR.repsReales} reps
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="font-condensed font-black text-3xl text-[#FF6B00] leading-none">
                {Math.round(latestPR.valor)}
              </div>
              <div className="text-[10px] text-[#6E6E73] font-bold">kg 1RM</div>
            </div>
          </button>
        )}

        {/* ── ACCESOS RÁPIDOS ── */}
        <div>
          <p className="text-[10px] font-condensed font-bold text-[#6E6E73] tracking-widest uppercase mb-2 px-1">ACCESOS RÁPIDOS</p>
          <div className="grid grid-cols-3 gap-2.5">
            {quickActions.map(({ label, sub, icon, to, color }, qi) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={`bg-white border border-[#E8E8E4] rounded-2xl p-3.5 flex flex-col items-center gap-2 shadow-sm active:scale-[0.96] transition-transform hover:border-[#6E6E73] stagger-${Math.min(qi+4,7)}`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: color === '#FF6B00' ? '#FFF3EC' : '#F5F5F0', color }}
                >
                  {icon}
                </div>
                <div className="text-center">
                  <p className="font-condensed font-black text-sm text-[#1C1C1E] leading-none">{label}</p>
                  <p className="text-[10px] text-[#6E6E73] mt-0.5">{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── STATS RÁPIDAS ── */}
        <div className="bg-white border border-[#E8E8E4] rounded-2xl p-5 shadow-sm stagger-7">
          <p className="text-[10px] font-condensed font-bold text-[#6E6E73] tracking-widest uppercase mb-4">RESUMEN</p>
          <div className="grid grid-cols-3 gap-4 divide-x divide-[#E8E8E4]">
            {[
              { label: 'PRs',         value: prs.length,   unit: 'marcas'   },
              { label: 'Esta semana', value: trainedCount,  unit: 'sesiones' },
              { label: 'Hoy',         value: todaySession ? todaySession.duration : 0, unit: 'min' },
            ].map(({ label, value, unit }) => (
              <div key={label} className="text-center">
                <div className="font-condensed font-black text-4xl text-[#FF6B00] leading-none">{value}</div>
                <div className="text-xs text-[#6E6E73] font-normal uppercase tracking-[0.1em] mt-1">{unit}</div>
                <div className="text-[9px] text-[#A1A1AA] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
