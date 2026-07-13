import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlanner } from '../context/PlannerContext';
import { useAthlete } from '../context/AthleteContext';
import { MESO_LABELS, MOCK_SESSION_DETAILS, SESSION_TYPES } from '../data/mockPlanner';
import SportSelector from '../components/SportSelector';
import SessionReadView from '../components/planner/SessionReadView';
import { ChevronLeft, ChevronRight, Plus, X, Dumbbell, Moon, Flame, DownloadCloud } from 'lucide-react';
import { fetchWorkouts } from '../services/sheets';
import { parseWorkouts } from '../utils/workoutParser';
import { useSession } from '../context/SessionContext';

// ─── Constantes ──────────────────────────────────────────
const DAYS_ES    = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
const DAYS_SHORT = ['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'];
const DAYS_FULL  = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

const INTENSITY_CONFIG = {
  'Baja':   { border: '#FDDCB5', text: '#059669', label: 'BAJA'   },
  'Media':  { border: '#E8E8E4', text: '#6E6E73', label: 'MEDIA'  },
  'Alta':   { border: '#FEF3C7', text: '#D97706', label: 'ALTA'   },
  'Máxima': { border: '#FEE2E2', text: '#DC2626', label: 'MÁXIMA' },
};

const LOAD_CONFIG = [
  { max: 1, label: 'SUAVE',    color: '#E85D04', bg: '#FFF3EC' },
  { max: 3, label: 'MODERADA', color: '#D97706', bg: '#FFFBEB' },
  { max: 5, label: 'INTENSA',  color: '#F97316', bg: '#FFF7ED' },
  { max: 7, label: 'MÁXIMA',   color: '#DC2626', bg: '#FEF2F2' },
];

const SESSION_TEMPLATES = [
  { id: 'session-gym-1', name: 'Potencia - Tren Superior', sport: 'gym',  icon: '🏋️', duration: 75, exercises: 6, intensity: 'Alta',   intensityLevel: 4, type: 'gym_potencia' },
  { id: 'session-gym-2', name: 'Fuerza - Tren Inferior',   sport: 'gym',  icon: '🏋️', duration: 60, exercises: 5, intensity: 'Alta',   intensityLevel: 4, type: 'gym_fuerza'   },
  { id: 'session-tkd-1', name: 'Técnica + Poomsae',        sport: 'tkd',  icon: '🥋', duration: 90, exercises: 5, intensity: 'Media',  intensityLevel: 3, type: 'tkd'          },
  { id: 'session-tkd-2', name: 'Sparring + Competición',   sport: 'tkd',  icon: '🥋', duration: 90, exercises: 4, intensity: 'Máxima', intensityLevel: 5, type: 'tkd_sparring'  },
  { id: 'descanso',      name: 'Descanso',                  sport: 'all',  icon: '😴', duration: 0,  exercises: 0, intensity: 'Baja',   intensityLevel: 1, type: 'descanso'      },
];

// ─── Helpers ─────────────────────────────────────────────
const parseDate   = (str)           => { const [y,m,d] = str.split('-').map(Number); return new Date(y,m-1,d); };
const getDayDate  = (monday, i)     => { const d = new Date(monday); d.setDate(d.getDate() + i); return d; };
const isToday     = (date)          => { const t = new Date(); return date.toDateString() === t.toDateString(); };
const isPast      = (date)          => { const today = new Date(); today.setHours(0,0,0,0); const d = new Date(date); d.setHours(0,0,0,0); return d < today; };
const isCurrentWeek = (monday)     => {
  const today = new Date(), d = today.getDay(), diff = d === 0 ? -6 : 1 - d;
  const currMonday = new Date(today); currMonday.setDate(today.getDate() + diff); currMonday.setHours(0,0,0,0);
  const m = new Date(monday); m.setHours(0,0,0,0);
  return m.getTime() === currMonday.getTime();
};
const formatWeekRange = (monday) => {
  const sunday = new Date(monday); sunday.setDate(sunday.getDate() + 6);
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  if (monday.getMonth() === sunday.getMonth())
    return `${monday.getDate()}–${sunday.getDate()} ${months[monday.getMonth()]} ${sunday.getFullYear()}`;
  return `${monday.getDate()} ${months[monday.getMonth()]} – ${sunday.getDate()} ${months[sunday.getMonth()]}`;
};
const getWeekNumber = (monday, mesoStartDate) => {
  if (!mesoStartDate) return null;
  const start = parseDate(mesoStartDate); start.setHours(0,0,0,0);
  const m = new Date(monday); m.setHours(0,0,0,0);
  return Math.floor((m - start) / (7 * 86400000)) + 1;
};
const getDisplayWeekLabel = (monday, mesocycle) => {
  if (!mesocycle) {
    const start = new Date(monday.getFullYear(), 0, 1);
    return `Semana ${Math.ceil(((monday - start) / 86400000 + start.getDay() + 1) / 7)}`;
  }
  const n = getWeekNumber(monday, mesocycle.startDate);
  if (n < 1) return 'Pre-temporada';
  if (n > mesocycle.weeks) return 'Post-bloque';
  return `Semana ${n} / ${mesocycle.weeks}`;
};
const getWeekMetrics = (sessions) => {
  const sessionList = Object.values(sessions).filter(Boolean);
  const count       = sessionList.length;
  const totalMin    = sessionList.reduce((a, s) => a + (s.duration || 0), 0);
  const loadCfg     = LOAD_CONFIG.find(c => count <= c.max) || LOAD_CONFIG[LOAD_CONFIG.length - 1];
  return { count, totalMin, loadLabel: loadCfg.label, loadColor: loadCfg.color, loadBg: loadCfg.bg };
};

// ═══════════════════════════════════════════════════════
export default function Plan() {
  const navigate = useNavigate();
  const { currentWeekStart, navigateWeek, goToCurrentWeek, weekSessions, activeSeason, activeMesocycle, sessionTemplates, weekAssignments, assignSessionToDay } = usePlanner();
  const { activeSport } = useAthlete();
  const { loadSession } = useSession();

  const isCurrWeek = isCurrentWeek(currentWeekStart);
  const weekLabel  = getDisplayWeekLabel(currentWeekStart, activeMesocycle);

  const [selectedSession, setSelectedSession] = useState(null);
  const [addSheetDay, setAddSheetDay]         = useState(null);
  const [addSheetVisible, setAddSheetVisible] = useState(false);

  const [showImportSheet, setShowImportSheet] = useState(false);
  const [importedRoutines, setImportedRoutines] = useState([]);
  const [loadingImport, setLoadingImport] = useState(false);
  const [importError, setImportError] = useState(null);

  const filteredSessions = useMemo(() => {
    const base = {};
    DAYS_ES.forEach((dayKey, i) => {
      const d = new Date(currentWeekStart); d.setDate(d.getDate() + i);
      const dateISO = d.toISOString().slice(0, 10);
      base[dayKey] = weekAssignments[dateISO] || weekSessions[dayKey] || null;
    });
    
    if (activeSport === 'all') return base;
    const out = {};
    Object.entries(base).forEach(([day, s]) => {
      out[day] = s && (s.sport === activeSport || s.sport === 'all') ? s : null;
    });
    return out;
  }, [weekAssignments, weekSessions, currentWeekStart, activeSport]);

  const metrics = useMemo(() => getWeekMetrics(filteredSessions), [filteredSessions]);

  const handleDayTap = (dayIndex, session) => {
    if (!session) return;
    const dayDate = getDayDate(currentWeekStart, dayIndex);
    if (isToday(dayDate)) {
      // Load session into SessionContext with full blocks data
      loadSession({
        id: session.id || session.sessionId || `session-${dayIndex}`,
        name: session.name || 'Sesión',
        dayBadge: DAYS_FULL[dayIndex],
        type: session.type || 'gym',
        blocks: session.blocks || [{
          id: 'block-default',
          name: session.name || 'Bloque Principal',
          type: 'fuerza',
          icon: '🏋️',
          duration: `${session.duration || 45}m`,
          exercises: []
        }],
      });
      navigate('/session');
    } else {
      setSelectedSession({ session, dayDate, dayLabel: DAYS_FULL[dayIndex] });
    }
  };

  const handleEmptyDayTap = (dayIndex) => {
    const dayDate = getDayDate(currentWeekStart, dayIndex);
    setAddSheetDay({ dayIndex, dayDate, dayLabel: DAYS_FULL[dayIndex] });
    setTimeout(() => setAddSheetVisible(true), 10);
  };

  const closeAddSheet = () => {
    setAddSheetVisible(false);
    setTimeout(() => setAddSheetDay(null), 300);
  };

  const handleAssignSession = (template) => {
    if (!addSheetDay) return;
    const dateISO = addSheetDay.dayDate.toISOString().slice(0, 10);
    assignSessionToDay(dateISO, template);
    closeAddSheet();
  };

  const handleOpenImport = async () => {
    setShowImportSheet(true);
    setLoadingImport(true);
    setImportError(null);
    try {
      const res = await fetchWorkouts();
      const parsed = parseWorkouts(res.rows || []);
      setImportedRoutines(parsed);
    } catch (err) {
      console.error('Error cargando rutinas:', err);
      setImportError(err.message);
    } finally {
      setLoadingImport(false);
    }
  };

  const handleApplyRoutine = (routine) => {
    Object.keys(routine.sessions).forEach(dayKey => {
      // Find the index of the day (e.g. 'lunes' -> 0)
      const dayIndex = DAYS_ES.indexOf(dayKey);
      if (dayIndex !== -1) {
        const dayDate = getDayDate(currentWeekStart, dayIndex);
        const dateISO = dayDate.toISOString().slice(0, 10);
        const sess = routine.sessions[dayKey];
        assignSessionToDay(dateISO, { ...sess, id: sess.id + '_' + Date.now() });
      }
    });
    setShowImportSheet(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0] text-[#1C1C1E]">

      {/* ── HEADER ─────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-3 bg-white border-b border-[#E8E8E4] sticky top-0 z-10">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs text-[#6E6E73] min-w-0 flex-1 pr-2">
            <button onClick={() => navigate('/plan/seasons')} className="hover:text-[#FF6B00] transition-colors font-bold truncate">
              {activeSeason?.name || 'Temporadas'}
            </button>
            {activeMesocycle && (
              <>
                <span className="shrink-0">›</span>
                <button onClick={() => navigate(`/plan/seasons/${activeSeason?.id}`)} className="hover:text-[#FF6B00] transition-colors font-bold truncate">
                  {activeMesocycle.name}
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={handleOpenImport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF3EC] text-[#FF6B00] rounded-xl font-condensed font-bold text-xs hover:bg-[#FF6B00] hover:text-white transition-colors border border-[#FF6B00] active:scale-95"
            >
              <DownloadCloud size={13} strokeWidth={2.5} /> Importar
            </button>
            <button
              onClick={() => navigate('/plan/session/new')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E8E8E4] text-[#6E6E73] text-xs font-bold hover:border-[#FF6B00] hover:text-[#FF6B00] active:scale-95 transition-all"
            >
              <Plus size={13} strokeWidth={2.5} /> Sesión
            </button>
            <SportSelector />
          </div>
        </div>

        {/* Week nav */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek(-1)}
            className="w-9 h-9 flex items-center justify-center bg-[#F5F5F0] border border-[#E8E8E4] rounded-xl shrink-0 active:scale-95 transition-transform"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex-1 flex items-center gap-2 min-w-0">
            <h1 className="font-condensed font-black text-4xl leading-none">{weekLabel}</h1>
            {activeMesocycle && (
              <span
                className="text-[11px] font-black px-2.5 py-1 rounded-full border shrink-0"
                style={{ borderColor: activeMesocycle.color + '50', color: activeMesocycle.color }}
              >
                {MESO_LABELS[activeMesocycle.type] || activeMesocycle.type}
              </span>
            )}
            {!isCurrWeek && (
              <button onClick={goToCurrentWeek} className="text-xs text-[#FF6B00] font-bold shrink-0 hover:underline">
                Hoy
              </button>
            )}
          </div>

          <button
            onClick={() => navigateWeek(+1)}
            className="w-9 h-9 flex items-center justify-center bg-[#F5F5F0] border border-[#E8E8E4] rounded-xl shrink-0 active:scale-95 transition-transform"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <p className="text-xs text-[#6E6E73] font-normal tracking-[0.02em] mt-1 pl-11">{formatWeekRange(currentWeekStart)}</p>
      </div>

      {/* ── GRID SEMANAL ───────────────────────────────── */}
      <div className="flex-1 px-4 pt-3 space-y-2" style={{ paddingBottom: 'calc(8rem + var(--safe-bottom,0px))' }}>
        {DAYS_ES.map((dayKey, i) => {
          const session = filteredSessions[dayKey];
          const dayDate = getDayDate(currentWeekStart, i);
          const today   = isToday(dayDate);
          const past    = isPast(dayDate) && !today;
          const intCfg  = session ? INTENSITY_CONFIG[session.intensity] : null;
          const dateNum = dayDate.getDate();
          const stagger = `stagger-${Math.min(i + 1, 7)}`;

          if (session) {
            return (
              <button
                key={dayKey}
                onClick={() => handleDayTap(i, session)}
                className={`${stagger} w-full flex items-stretch rounded-2xl border transition-all text-left overflow-hidden active:scale-[0.98] ${
                  today
                    ? 'bg-white shadow-sm border-[#E8E8E4]'
                    : past
                    ? 'bg-white border-[#E8E8E4] opacity-60'
                    : 'bg-white border-[#E8E8E4] hover:border-[#6E6E73] shadow-sm'
                }`}
              >
                {/* Left accent bar — hoy = verde eléctrico */}
                {today && <div className="w-1 bg-[#FF6B00] shrink-0" />}

                {/* Columna día */}
                <div className={`flex flex-col items-center justify-center px-3 py-3 min-w-[54px] border-r border-[#E8E8E4] ${today ? 'bg-[#FFF3EC]' : ''}`}>
                  {today && <span className="text-[9px] font-black text-[#FF6B00] tracking-widest mb-0.5 uppercase">HOY</span>}
                  <span className={`text-[11px] font-black tracking-wider uppercase ${today ? 'text-[#E85D04]' : 'text-[#6E6E73]'}`}>
                    {DAYS_SHORT[i]}
                  </span>
                  <span className={`font-condensed font-black text-2xl leading-none ${today ? 'text-[#1C1C1E]' : 'text-[#1C1C1E]'}`}>
                    {dateNum}
                  </span>
                  {today && <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mt-1 animate-pulse" />}
                  {past && !today && <div className="w-1.5 h-1.5 rounded-full bg-[#D4D4D8] mt-1" />}
                </div>

                {/* Columna central */}
                <div className="flex-1 px-4 py-3 flex flex-col justify-center gap-1.5 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[18px] shrink-0">{session.icon}</span>
                    <span className="font-semibold text-[15px] leading-tight truncate text-[#1C1C1E]">{session.name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#6E6E73] font-normal">
                    <span>⏱ {session.duration} min</span>
                    <span className="text-[#E8E8E4]">·</span>
                    <span>💪 {session.exercises} ejerc.</span>
                    {today && <span className="text-[#FF6B00] font-black ml-auto tracking-wide text-xs">INICIAR →</span>}
                  </div>
                </div>

                {/* Badge intensidad — solo borde */}
                <div className="flex items-center px-3 shrink-0">
                  <span
                    className="text-[10px] font-black px-2.5 py-1 rounded-full border"
                    style={{ borderColor: intCfg.border, color: intCfg.text, backgroundColor: intCfg.border + '40' }}
                  >
                    {intCfg.label}
                  </span>
                </div>
              </button>
            );
          }

          // ── DÍA VACÍO ──
          return (
            <button
              key={dayKey}
              onClick={() => handleEmptyDayTap(i)}
              className={`${stagger} w-full flex items-stretch rounded-2xl border border-dashed transition-all text-left overflow-hidden active:scale-[0.98] ${
                today ? 'border-[#FF6B00]/40 bg-[#FFF3EC]/50' : 'border-[#E8E8E4] bg-white/60 hover:bg-white hover:border-[#D4D4D8]'
              }`}
            >
              <div className={`flex flex-col items-center justify-center px-3 py-3 min-w-[54px] border-r border-dashed ${today ? 'border-[#FF6B00]/30' : 'border-[#E8E8E4]'}`}>
                {today && <span className="text-[9px] font-black text-[#FF6B00] tracking-widest mb-0.5">HOY</span>}
                <span className="text-[11px] font-black tracking-wider uppercase text-[#D4D4D8]">{DAYS_SHORT[i]}</span>
                <span className={`font-condensed font-black text-2xl leading-none ${today ? 'text-[#E85D04]/60' : 'text-[#D4D4D8]'}`}>
                  {dateNum}
                </span>
              </div>
              <div className="flex-1 px-4 py-3 flex items-center justify-between">
                <div>
                  <span className="text-[#6E6E73]/70 text-sm font-medium">Descanso activo</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Moon size={11} className="text-[#D4D4D8]" />
                    <span className="text-[10px] text-[#D4D4D8]">recuperación</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 border border-[#E8E8E4] rounded-xl px-2.5 py-1.5 text-[#6E6E73]/60 hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors">
                  <Plus size={13} />
                  <span className="text-xs font-bold">Añadir</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── FOOTER MÉTRICAS ─────────────────────────────── */}
      <div
        className="fixed left-0 right-0 bg-white border-t border-[#E8E8E4] px-5 py-3 flex items-center justify-between z-10 shadow-[0_-1px_8px_rgba(0,0,0,0.04)]"
        style={{ bottom: 64 }}
      >
        <div className="flex items-center gap-3">
          <span className="font-condensed font-black text-lg text-[#1C1C1E]">{metrics.count}</span>
          <span className="text-sm text-[#6E6E73] font-medium">
            sesiones {metrics.totalMin > 0 ? `· ~${metrics.totalMin} min` : ''}
          </span>
        </div>
        <span
          className="text-[11px] font-black px-3 py-1.5 rounded-full tracking-widest border"
          style={{ borderColor: metrics.loadColor + '60', color: metrics.loadColor, backgroundColor: metrics.loadBg }}
        >
          {metrics.loadLabel}
        </span>
      </div>

      {/* ── SESSION READ VIEW ────────────────────────────── */}
      {selectedSession && (
        <SessionReadView
          session={selectedSession.session}
          dayDate={selectedSession.dayDate}
          dayLabel={selectedSession.dayLabel}
          onClose={() => setSelectedSession(null)}
        />
      )}

      {/* ── ADD SESSION SHEET ─────────────────────────────── */}
      {addSheetDay && (
        <>
          <div
            onClick={closeAddSheet}
            className={`fixed inset-0 bg-black/40 z-[70] transition-opacity duration-300 ${addSheetVisible ? 'opacity-100' : 'opacity-0'}`}
          />
          <div
            className="fixed bottom-0 left-0 w-full bg-white border-t border-[#E8E8E4] rounded-t-3xl z-[70] transition-transform duration-300 ease-out"
            style={{
              transform: addSheetVisible ? 'translateY(0)' : 'translateY(100%)',
              paddingBottom: 'calc(1.5rem + var(--safe-bottom,0px))',
            }}
          >
            <div className="w-10 h-1 bg-[#E8E8E4] rounded-full mx-auto mt-3 mb-1" />
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#E8E8E4]">
              <div>
                <h3 className="font-condensed font-black text-2xl text-[#1C1C1E]">
                  ¿Qué haces el {addSheetDay.dayLabel}?
                </h3>
                <p className="text-xs text-[#6E6E73] mt-0.5">Selecciona una plantilla para asignar</p>
              </div>
              <button onClick={closeAddSheet} className="p-2 bg-[#F5F5F0] text-[#6E6E73] rounded-full hover:bg-[#E8E8E4] transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-4 pt-3 flex flex-col gap-2 max-h-[60vh] overflow-y-auto pb-4">
              {sessionTemplates.length > 0 && (
                <>
                  <p className="text-[10px] font-black text-[#6E6E73] tracking-widest px-1 pb-0.5 uppercase">MIS PLANTILLAS</p>
                  {sessionTemplates
                    .filter(t => activeSport === 'all' || t.sport === activeSport || t.sport === 'all')
                    .map(template => (
                      <button
                        key={template.id}
                        onClick={() => handleAssignSession({
                          id: template.id, name: template.name,
                          sport: template.sport || 'all', icon: SESSION_TYPES?.[template.type]?.icon || '🏋️',
                          duration: template.duration || 0, exercises: template.exercises || 0,
                          intensity: 'Media', intensityLevel: 3, type: template.type,
                        })}
                        className="flex items-center gap-3 px-4 py-3.5 bg-[#F5F5F0] rounded-2xl border border-[#E8E8E4] hover:border-[#FF6B00] text-left active:scale-[0.98] transition-all"
                      >
                        <span className="text-2xl shrink-0">{SESSION_TYPES?.[template.type]?.icon || '🏋️'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[15px] text-[#1C1C1E] truncate">{template.name}</p>
                          {template.duration > 0 && (
                            <p className="text-xs text-[#6E6E73] mt-0.5">⏱ {template.duration} min · 💪 {template.exercises || 0} ejerc.</p>
                          )}
                        </div>
                        <span className="text-[10px] font-black text-[#FF6B00] border border-[#FF6B00]/30 px-2 py-0.5 rounded-lg tracking-widest">CUSTOM</span>
                      </button>
                    ))
                  }
                  <div className="h-px bg-[#E8E8E4] my-1" />
                </>
              )}

              <p className="text-[10px] font-black text-[#6E6E73] tracking-widest px-1 pb-0.5 uppercase">PLANTILLAS BASE</p>
              {SESSION_TEMPLATES
                .filter(t => activeSport === 'all' || t.sport === activeSport || t.sport === 'all')
                .map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleAssignSession(template)}
                    className="flex items-center gap-3 px-4 py-3.5 bg-[#F5F5F0] rounded-2xl border border-[#E8E8E4] hover:border-[#6E6E73] text-left active:scale-[0.98] transition-all"
                  >
                    <span className="text-2xl shrink-0">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[15px] text-[#1C1C1E] truncate">{template.name}</p>
                      {template.duration > 0 && (
                        <p className="text-xs text-[#6E6E73] mt-0.5">⏱ {template.duration} min · 💪 {template.exercises} ejerc.</p>
                      )}
                    </div>
                  </button>
                ))
              }

              <div className="h-px bg-[#E8E8E4] my-1" />
              <button
                onClick={() => { closeAddSheet(); navigate('/plan/session/new'); }}
                className="flex items-center gap-3 px-4 py-4 rounded-2xl border-2 border-dashed border-[#E8E8E4] text-[#6E6E73] hover:border-[#FF6B00] hover:text-[#FF6B00] active:scale-[0.98] transition-all"
              >
                <div className="w-9 h-9 rounded-full border-2 border-current flex items-center justify-center shrink-0">
                  <Plus size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-semibold text-[15px]">Crear sesión nueva</p>
                  <p className="text-xs opacity-70 mt-0.5">Abre el constructor de sesiones</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── IMPORT FROM EXCEL BOTTOM SHEET ───────────────── */}
      {showImportSheet && (
        <div className="fixed inset-0 z-[80] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowImportSheet(false)} />
          <div className="bg-[#F5F5F0] rounded-t-3xl w-full max-h-[85vh] flex flex-col relative animate-slide-up">
            <div className="w-12 h-1 bg-[#D4D4D8] rounded-full mx-auto my-3 shrink-0" />
            <div className="px-5 pb-4 shrink-0 border-b border-[#E8E8E4] bg-white rounded-t-3xl flex justify-between items-center">
              <div>
                <h3 className="font-condensed font-black text-2xl text-[#1C1C1E]">Importar Semana</h3>
                <p className="text-sm text-[#6E6E73] mt-1">Selecciona una rutina de tu hoja de Excel.</p>
              </div>
              <button onClick={() => setShowImportSheet(false)} className="p-2 bg-[#F5F5F0] text-[#6E6E73] rounded-full hover:bg-[#E8E8E4] transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 pb-8 space-y-4">
              {loadingImport ? (
                <div className="text-center p-6 text-[#6E6E73] font-bold animate-pulse">Sincronizando con Google Sheets...</div>
              ) : importError ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600">
                  <p className="font-bold mb-1">Error al conectar con Google Sheets:</p>
                  <p className="text-sm">{importError}</p>
                  <p className="text-xs mt-3 opacity-80">Revisa la consola del navegador para más detalles.</p>
                </div>
              ) : importedRoutines.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-[#E8E8E4] rounded-3xl p-6 text-center text-[#6E6E73]">
                  No se encontraron rutinas en la pestaña 'workouts'. Añade filas en tu Excel.
                </div>
              ) : (
                importedRoutines.map(routine => (
                  <div key={routine.id} className="bg-white border border-[#E8E8E4] rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-4 py-3 bg-[#FFF3EC] border-b border-[#E8E8E4] flex items-center justify-between">
                      <h4 className="font-condensed font-black text-xl text-[#1C1C1E] truncate pr-2">{routine.name}</h4>
                      <button 
                        onClick={() => handleApplyRoutine(routine)}
                        className="bg-[#FF6B00] text-white px-3 py-1 rounded-lg font-condensed font-bold text-sm hover:bg-[#E85D04] transition-colors shrink-0"
                      >
                        CARGAR
                      </button>
                    </div>
                    <div className="p-3 bg-[#F5F5F0]">
                      <p className="text-[10px] font-bold text-[#6E6E73] uppercase tracking-widest mb-2 px-1">Días incluidos:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(routine.sessions).map(day => (
                          <div key={day} className="bg-white border border-[#E8E8E4] px-2 py-1 rounded-md text-xs font-condensed font-bold text-[#1C1C1E] capitalize">
                            {day} <span className="text-[#A1A1AA]">· {routine.sessions[day].duration}m</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
