import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlanner } from '../context/PlannerContext';
import { useAthlete } from '../context/AthleteContext';
import { MESO_LABELS, SESSION_TYPES } from '../data/mockPlanner';
import SportSelector from '../components/SportSelector';
import SessionReadView from '../components/planner/SessionReadView';
import { ChevronLeft, ChevronRight, Plus, X, DownloadCloud } from 'lucide-react';
import { fetchWorkouts } from '../services/sheets';
import { parseWorkouts } from '../utils/workoutParser';
import { useSession } from '../context/SessionContext';

// ─── Constantes ──────────────────────────────────────────
const DAYS_ES    = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
const DAYS_SHORT = ['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'];
const DAYS_FULL  = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

const INTENSITY_CONFIG = {
  'Baja':   { border: 'var(--color-border)', text: 'var(--color-success-green)', label: 'BAJA'   },
  'Media':  { border: 'var(--color-border)', text: 'var(--color-muted)', label: 'MEDIA'  },
  'Alta':   { border: 'var(--color-border)', text: 'var(--color-signal-orange)', label: 'ALTA'   },
  'Máxima': { border: 'var(--color-border)', text: 'var(--color-corner-red)', label: 'MÁXIMA' },
};

const LOAD_CONFIG = [
  { max: 1, label: 'SUAVE',    color: 'var(--color-signal-orange)' },
  { max: 3, label: 'MODERADA', color: 'var(--color-belt-gold)' },
  { max: 5, label: 'INTENSA',  color: 'var(--color-signal-orange)' },
  { max: 7, label: 'MÁXIMA',   color: 'var(--color-corner-red)' },
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
const formatISO   = (d)             => { const pad = n => n.toString().padStart(2, '0'); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
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
  const months = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
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
  return { count, totalMin, loadLabel: loadCfg.label, loadColor: loadCfg.color };
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
      const dateISO = formatISO(d);
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
    const dateISO = formatISO(addSheetDay.dayDate);
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
      const dayIndex = DAYS_ES.indexOf(dayKey);
      if (dayIndex !== -1) {
        const dayDate = getDayDate(currentWeekStart, dayIndex);
        const dateISO = formatISO(dayDate);
        const sess = routine.sessions[dayKey];
        assignSessionToDay(dateISO, { ...sess, id: sess.id + '_' + Date.now() });
      }
    });
    setShowImportSheet(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg text-ink">

      {/* ── HEADER ─────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-3 bg-card border-b border-border sticky top-0 z-10">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-muted tracking-wider uppercase min-w-0 flex-1 pr-2">
            <button onClick={() => navigate('/plan/seasons')} className="hover:text-signal-orange transition-colors font-bold truncate">
              {activeSeason?.name || 'Temporadas'}
            </button>
            {activeMesocycle && (
              <>
                <span className="shrink-0 text-muted/50">/</span>
                <button onClick={() => navigate(`/plan/seasons/${activeSeason?.id}`)} className="hover:text-signal-orange transition-colors font-bold truncate">
                  {activeMesocycle.name}
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={handleOpenImport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-signal-orange text-ink rounded-lg font-display font-black text-xs hover:bg-signal-orange/95 transition-colors border border-border cursor-pointer uppercase tracking-wider"
            >
              <DownloadCloud size={13} strokeWidth={2.5} /> Importar
            </button>
            <button
              onClick={() => navigate('/plan/session/new')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-card text-ink text-xs font-display font-black hover:border-muted active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
            >
              <Plus size={13} strokeWidth={2.5} /> Sesión
            </button>
            <SportSelector />
          </div>
        </div>

        {/* Week nav */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigateWeek(-1)}
            className="w-9 h-9 stamp-circle border-border hover:border-signal-orange text-muted hover:text-signal-orange active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex-1 flex items-center justify-center gap-2.5 min-w-0">
            <h1 className="font-display font-black text-3xl leading-none uppercase tracking-wide">{weekLabel}</h1>
            {activeMesocycle && (
              <span
                className="font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-border shrink-0 text-muted uppercase tracking-wider"
              >
                {MESO_LABELS[activeMesocycle.type] || activeMesocycle.type}
              </span>
            )}
            {!isCurrWeek && (
              <button onClick={goToCurrentWeek} className="font-mono text-xs text-signal-orange font-bold shrink-0 hover:underline cursor-pointer uppercase tracking-wider">
                Hoy
              </button>
            )}
          </div>

          <button
            onClick={() => navigateWeek(+1)}
            className="w-9 h-9 stamp-circle border-border hover:border-signal-orange text-muted hover:text-signal-orange active:scale-95 transition-all cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <p className="font-mono text-[9px] text-muted uppercase tracking-widest mt-2 text-center">{formatWeekRange(currentWeekStart)}</p>
      </div>

      {/* ── GRID SEMANAL ───────────────────────────────── */}
      <div className="flex-1 px-4 pt-3 space-y-3.5" style={{ paddingBottom: 'calc(8rem + var(--safe-bottom,0px))' }}>
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
                className={`${stagger} w-full flex items-stretch rounded-xl border transition-all text-left overflow-hidden active:scale-[0.98] cursor-pointer ${
                  today
                    ? 'bg-card border-l-4 border-l-signal-orange border-border shadow-sm'
                    : past
                    ? 'bg-card/70 border-border opacity-60'
                    : 'bg-card border-border hover:border-muted shadow-sm'
                }`}
              >
                {/* Columna día */}
                <div className={`flex flex-col items-center justify-center px-3 py-3 min-w-[58px] border-r border-border ${today ? 'bg-signal-orange/5' : 'bg-bg/10'}`}>
                  {today && <span className="font-mono text-[8px] font-black text-signal-orange tracking-widest mb-0.5 uppercase">HOY</span>}
                  <span className={`font-mono text-[9px] font-bold tracking-wider uppercase ${today ? 'text-signal-orange' : 'text-muted'}`}>
                    {DAYS_SHORT[i]}
                  </span>
                  <span className="font-display font-black text-2xl leading-none text-ink mt-0.5">
                    {dateNum}
                  </span>
                  {today && <div className="w-1.5 h-1.5 rounded-full bg-signal-orange mt-1.5 animate-pulse" />}
                  {past && !today && <div className="w-1 h-1 rounded-full bg-border mt-1" />}
                </div>

                {/* Columna central */}
                <div className="flex-1 px-4 py-3 flex flex-col justify-center gap-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {session.icon && (
                      <div className="w-5 h-5 stamp-circle border-border text-[9px] flex items-center justify-center shrink-0">
                        {session.icon}
                      </div>
                    )}
                    <span className="font-condensed font-black text-base leading-tight truncate text-ink uppercase tracking-wide">{session.name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 font-mono text-[9px] text-muted uppercase tracking-wider font-semibold">
                    <span>⏱ {session.duration} MIN</span>
                    <span className="text-border">·</span>
                    <span>💪 {session.exercises} EJERC.</span>
                    {today && <span className="text-signal-orange font-bold ml-auto font-mono text-[9px] tracking-wider uppercase">INICIAR →</span>}
                  </div>
                </div>

                {/* Badge intensidad — solo borde */}
                <div className="flex items-center px-3 shrink-0">
                  <span
                    className="font-mono text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-wider"
                    style={{ borderColor: intCfg.border, color: intCfg.text }}
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
              className={`${stagger} w-full flex items-stretch rounded-xl border border-dashed transition-all text-left overflow-hidden active:scale-[0.98] cursor-pointer ${
                today ? 'border-signal-orange bg-signal-orange/5' : 'border-border bg-card/45 hover:bg-card hover:border-muted'
              }`}
            >
              <div className={`flex flex-col items-center justify-center px-3 py-3 min-w-[58px] border-r border-dashed ${today ? 'border-signal-orange/30 bg-signal-orange/5' : 'border-border'}`}>
                {today && <span className="font-mono text-[8px] font-black text-signal-orange tracking-widest mb-0.5">HOY</span>}
                <span className="font-mono text-[9px] font-bold tracking-wider uppercase text-muted/50">{DAYS_SHORT[i]}</span>
                <span className={`font-display font-black text-2xl leading-none ${today ? 'text-signal-orange/60' : 'text-muted/40'}`}>
                  {dateNum}
                </span>
              </div>
              <div className="flex-1 px-4 py-3 flex items-center justify-between">
                <div>
                  <span className="font-condensed font-black text-sm uppercase text-muted/70 tracking-wider">Descanso activo</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-[8px] text-muted/40 uppercase tracking-widest">recuperación</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 border border-border rounded-lg px-2.5 py-1 text-muted/60 hover:border-signal-orange hover:text-signal-orange transition-colors font-mono text-[9px] tracking-wider uppercase font-bold bg-card">
                  <Plus size={11} />
                  <span>Añadir</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── FOOTER MÉTRICAS ── */}
      <div
        className="fixed left-0 right-0 bg-card border-t border-border px-5 py-3.5 flex items-center justify-between z-10"
        style={{ bottom: 64 }}
      >
        <div className="flex items-center gap-2">
          <span className="font-display font-black text-2xl text-ink leading-none">{metrics.count}</span>
          <span className="font-mono text-[10px] text-muted uppercase tracking-wider font-bold">
            SESIONES {metrics.totalMin > 0 ? `· ~${metrics.totalMin} MIN` : ''}
          </span>
        </div>
        <span
          className="font-mono text-[9px] font-black px-2.5 py-1 rounded border border-border text-ink uppercase tracking-wider"
        >
          {metrics.loadLabel}
        </span>
      </div>

      {/* ── SESSION READ VIEW ── */}
      {selectedSession && (
        <SessionReadView
          session={selectedSession.session}
          dayDate={selectedSession.dayDate}
          dayLabel={selectedSession.dayLabel}
          onClose={() => setSelectedSession(null)}
        />
      )}

      {/* ── ADD SESSION SHEET ── */}
      {addSheetDay && (
        <>
          <div
            onClick={closeAddSheet}
            className={`fixed inset-0 bg-black/50 z-[70] transition-opacity duration-300 ${addSheetVisible ? 'opacity-100' : 'opacity-0'}`}
          />
          <div
            className="fixed bottom-0 left-0 w-full bg-card border-t border-border rounded-t-2xl z-[70] transition-transform duration-300 ease-out"
            style={{
              transform: addSheetVisible ? 'translateY(0)' : 'translateY(100%)',
              paddingBottom: 'calc(1.5rem + var(--safe-bottom,0px))',
            }}
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1" />
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div>
                <h3 className="font-condensed font-black text-xl text-ink uppercase tracking-wide">
                  ¿Qué haces el {addSheetDay.dayLabel}?
                </h3>
                <p className="font-mono text-[9px] text-muted uppercase tracking-wider mt-0.5">Selecciona una plantilla para asignar</p>
              </div>
              <button onClick={closeAddSheet} className="p-2 bg-bg/50 text-muted rounded-full hover:bg-bg transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="px-4 pt-3 flex flex-col gap-2 max-h-[60vh] overflow-y-auto pb-4">
              {sessionTemplates.length > 0 && (
                <>
                  <p className="font-mono text-[9px] text-muted tracking-widest px-1 pb-0.5 uppercase font-bold">MIS PLANTILLAS</p>
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
                        className="flex items-center gap-3 px-4 py-3 bg-bg/25 rounded-xl border border-border hover:border-signal-orange text-left active:scale-[0.98] transition-all cursor-pointer"
                      >
                        {SESSION_TYPES?.[template.type]?.icon && (
                          <span className="text-xl shrink-0">{SESSION_TYPES?.[template.type]?.icon}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-condensed font-black text-base text-ink uppercase tracking-wide truncate">{template.name}</p>
                          {template.duration > 0 && (
                            <p className="font-mono text-[9px] text-muted uppercase tracking-wider mt-0.5">⏱ {template.duration} min · 💪 {template.exercises || 0} ejerc.</p>
                          )}
                        </div>
                        <span className="font-mono text-[8px] font-black text-signal-orange border border-signal-orange/30 px-2 py-0.5 rounded uppercase tracking-wider">CUSTOM</span>
                      </button>
                    ))
                  }
                  <div className="h-px bg-border my-1" />
                </>
              )}

              <p className="font-mono text-[9px] text-muted tracking-widest px-1 pb-0.5 uppercase font-bold">PLANTILLAS BASE</p>
              {SESSION_TEMPLATES
                .filter(t => activeSport === 'all' || t.sport === activeSport || t.sport === 'all')
                .map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleAssignSession(template)}
                    className="flex items-center gap-3 px-4 py-3 bg-bg/25 rounded-xl border border-border hover:border-muted text-left active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {template.icon && <span className="text-xl shrink-0">{template.icon}</span>}
                    <div className="flex-1 min-w-0">
                      <p className="font-condensed font-black text-base text-ink uppercase tracking-wide truncate">{template.name}</p>
                      {template.duration > 0 && (
                        <p className="font-mono text-[9px] text-muted uppercase tracking-wider mt-0.5">⏱ {template.duration} min · 💪 {template.exercises} ejerc.</p>
                      )}
                    </div>
                  </button>
                ))
              }

              <div className="h-px bg-border my-1" />
              <button
                onClick={() => { closeAddSheet(); navigate('/plan/session/new'); }}
                className="flex items-center gap-3 px-4 py-4 rounded-xl border-2 border-dashed border-border text-muted hover:border-signal-orange hover:text-signal-orange active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg border-2 border-current flex items-center justify-center shrink-0">
                  <Plus size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-condensed font-black text-sm uppercase tracking-wide text-ink">Crear sesión nueva</p>
                  <p className="font-mono text-[9px] text-muted uppercase tracking-wider mt-0.5">Abre el constructor de sesiones</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── IMPORT FROM EXCEL BOTTOM SHEET ── */}
      {showImportSheet && (
        <div className="fixed inset-0 z-[80] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowImportSheet(false)} />
          <div className="bg-bg rounded-t-2xl w-full max-h-[85vh] flex flex-col relative animate-slide-up border-t border-border">
            <div className="w-12 h-1 bg-border rounded-full mx-auto my-3 shrink-0" />
            <div className="px-5 pb-4 shrink-0 border-b border-border bg-card rounded-t-2xl flex justify-between items-center">
              <div>
                <h3 className="font-condensed font-black text-xl text-ink uppercase tracking-wide">Importar Semana</h3>
                <p className="font-mono text-[9px] text-muted uppercase tracking-wider mt-0.5">Selecciona una rutina de tu hoja de Excel.</p>
              </div>
              <button onClick={() => setShowImportSheet(false)} className="p-2 bg-bg/50 text-muted rounded-full hover:bg-bg transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 pb-8 space-y-4">
              {loadingImport ? (
                <div className="text-center p-6 text-muted font-mono text-xs uppercase tracking-wider font-bold animate-pulse">Sincronizando con Google Sheets...</div>
              ) : importError ? (
                <div className="bg-card border border-corner-red/20 rounded-xl p-6 text-center text-corner-red">
                  <p className="font-bold font-condensed text-base uppercase mb-1">Error al conectar con Google Sheets:</p>
                  <p className="text-sm font-mono text-[11px]">{importError}</p>
                </div>
              ) : importedRoutines.length === 0 ? (
                <div className="bg-card border-2 border-dashed border-border rounded-xl p-6 text-center text-muted font-mono text-xs uppercase tracking-wider">
                  No se encontraron rutinas en la pestaña 'workouts'.
                </div>
              ) : (
                importedRoutines.map(routine => (
                  <div key={routine.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-none">
                    <div className="px-4 py-3 bg-signal-orange/5 border-b border-border flex items-center justify-between">
                      <h4 className="font-condensed font-black text-lg text-ink uppercase tracking-wide truncate pr-2">{routine.name}</h4>
                      <button 
                        onClick={() => handleApplyRoutine(routine)}
                        className="bg-signal-orange text-ink px-3 py-1 rounded-lg font-display font-black text-xs hover:bg-signal-orange/95 cursor-pointer border border-border tracking-wider uppercase"
                      >
                        CARGAR
                      </button>
                    </div>
                    <div className="p-3 bg-bg/15">
                      <p className="font-mono text-[8px] font-bold text-muted uppercase tracking-widest mb-2 px-1">Días incluidos:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(routine.sessions).map(day => (
                          <div key={day} className="bg-card border border-border px-2 py-1 rounded-md font-mono text-[9px] text-ink uppercase tracking-wider font-bold capitalize">
                            {day} <span className="text-muted font-normal">· {routine.sessions[day].duration}M</span>
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
