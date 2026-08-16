import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAthlete } from '../context/AthleteContext';
import { usePlanner } from '../context/PlannerContext';
import { useEvolutionData } from '../hooks/useEvolutionData';
import { usePR } from '../context/PRContext';
import { useFeedback } from '../context/FeedbackContext';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../hooks/useRole';
import { useTimer } from '../context/TimerContext';
import { ChevronLeft, Pencil, Star, Plus, ShieldCheck, RefreshCw, Bell, Users, DownloadCloud, MessageCircle, LogOut, CheckCircle2, PlayCircle, Volume2 } from 'lucide-react';
import { getSeasons, getSessions, getRoutineAssignments, activateRoutine, fetchWorkouts } from '../services/sheets';
import { parseWorkouts } from '../utils/workoutParser';

export default function Profile() {
  const navigate = useNavigate();
  const { athlete, toggleSport, addSport, setPrimarySport, updateProfile, viewMode, setViewMode } = useAthlete();
  const { currentWeekStart, assignSessionToDay, removeSessionFromDay } = usePlanner();
  const { sessionLogs } = useEvolutionData();
  const { prs } = usePR();
  const { unreadCount, sessionsWithUnread } = useFeedback();
  const { logout, currentUser } = useAuth();
  const { isBoth } = useRole();
  const { completionSound, setCompletionSound, SOUND_PRESETS, playSound } = useTimer();

  const [assignedRoutines, setAssignedRoutines] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [activatingId, setActivatingId] = useState(null);

  // Edit Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(athlete.name);

  // Custom Sport State
  const [showCustomSport, setShowCustomSport] = useState(false);
  const [customSportInput, setCustomSportInput] = useState('');

  // Settings State
  const [demoMode, setDemoMode] = useState(() => localStorage.getItem('trainingos_demo_mode') === 'true');
  const [notifications, setNotifications] = useState(true);

  // Derived Identity
  const initial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : athlete.name ? athlete.name.charAt(0).toUpperCase() : 'A';
  const roleLabels = { 'athlete': 'ATLETA', 'coach': 'ENTRENADOR', 'both': 'AMBOS' };
  const roleLabel = roleLabels[currentUser?.role || athlete.role] || 'ATLETA';

  // Derived Stats
  const totalSessions = sessionLogs.length;
  const calcStreak = () => {
    let s = 0;
    const sorted = [...sessionLogs].sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
    const uniqueDays = [...new Set(sorted.map(x => new Date(x.fecha).toDateString()))];
    const now = new Date();
    let current = new Date(now);
    let checkDay = current.toDateString();
    
    if (!uniqueDays.includes(checkDay)) {
       current.setDate(current.getDate() - 1);
       checkDay = current.toDateString();
    }
    while(uniqueDays.includes(checkDay)) {
      s++;
      current.setDate(current.getDate() - 1);
      checkDay = current.toDateString();
    }
    return s;
  };
  const currentStreak = calcStreak();
  const sortedPrs = [...prs].sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
  const latestPR = sortedPrs.length > 0 ? sortedPrs[0].exerciseName : 'NINGUNO';

  // Handlers
  const handleSaveName = () => {
    if (editNameValue.trim()) {
      updateProfile({ name: editNameValue.trim() });
    }
    setIsEditingName(false);
  };

  const handleAddCustomSport = () => {
    if (!customSportInput.trim()) return;
    addSport({
      id: `custom-${Date.now()}`,
      label: customSportInput.trim(),
      icon: '🎯',
      active: true
    });
    setCustomSportInput('');
    setShowCustomSport(false);
  };

  const handleToggleDemoMode = () => {
    const newVal = !demoMode;
    setDemoMode(newVal);
    localStorage.setItem('trainingos_demo_mode', newVal ? 'true' : 'false');
    window.location.reload();
  };

  React.useEffect(() => {
    loadAssignedRoutines();
  }, []);

  const loadAssignedRoutines = async () => {
    setLoadingAssignments(true);
    try {
      const resAssignments = await getRoutineAssignments();
      const rows = resAssignments.rows || [];
      if (rows.length > 0) {
        const resWorkouts = await fetchWorkouts();
        const allRoutines = parseWorkouts(resWorkouts.rows || []);
        const mapped = rows.map(asgn => {
          const found = allRoutines.find(r => r.id === asgn.rutina_id);
          return {
            assignment: asgn,
            routine: found || { id: asgn.rutina_id, name: `Rutina ${asgn.rutina_id}`, sessions: {} }
          };
        });
        setAssignedRoutines(mapped);
      } else {
        setAssignedRoutines([]);
      }
    } catch (err) {
      console.warn('[Profile] Error cargando asignaciones de rutina:', err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleActivateAssignment = async (assignmentId) => {
    setActivatingId(assignmentId);
    try {
      await activateRoutine(assignmentId);
      await loadAssignedRoutines();
    } catch (err) {
      alert(`Error al activar la rutina: ${err.message || 'Error de red'}`);
    } finally {
      setActivatingId(null);
    }
  };

  const handleApplyAssignedRoutineToCalendar = (routine) => {
    const DAYS_ES = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
    const getDayDate = (monday, i) => { const d = new Date(monday); d.setDate(d.getDate() + i); return d; };
    const formatISO = (d) => { const pad = n => n.toString().padStart(2, '0'); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };

    // 1. Limpiar semana actual
    DAYS_ES.forEach((_, i) => {
      const dayDate = getDayDate(currentWeekStart, i);
      removeSessionFromDay(formatISO(dayDate));
    });

    // 2. Asignar días de la rutina activa
    Object.keys(routine.sessions || {}).forEach(dayKey => {
      const dayIndex = DAYS_ES.indexOf(dayKey);
      if (dayIndex !== -1) {
        const dayDate = getDayDate(currentWeekStart, dayIndex);
        const sess = routine.sessions[dayKey];
        assignSessionToDay(formatISO(dayDate), { ...sess, id: sess.id + '_' + Date.now() });
      }
    });

    navigate('/plan');
  };

  return (
    <div className="flex-1 bg-bg flex flex-col min-h-screen text-ink pb-24">
      
      {/* Header */}
      <div className="px-5 pt-6 pb-4 bg-card border-b border-border sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-muted hover:text-ink cursor-pointer">
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-condensed font-black text-2.5xl uppercase tracking-wide">Mi Perfil</h1>
        </div>
        <button className="text-signal-orange font-bold p-2 active:scale-95 cursor-pointer" onClick={() => navigate('/onboarding')}>
          <Pencil size={20} />
        </button>
      </div>

      <div className="p-4 space-y-6">
        
        {/* IDENTIDAD REGISTRO */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center relative overflow-hidden shadow-none">
          <div className="absolute top-0 w-full h-16 bg-bg/50 border-b border-border" />
          
          <div className="w-20 h-20 bg-card border border-border text-corner-blue font-display font-black text-5xl z-10 relative flex items-center justify-center rounded-xl">
            {initial}
          </div>
          
          <div className="mt-4 text-center w-full z-10">
            {isEditingName ? (
              <div className="flex items-center justify-center gap-2">
                <input 
                  type="text"
                  value={editNameValue}
                  onChange={e => setEditNameValue(e.target.value)}
                  className="text-center font-condensed font-black text-3xl border-b-2 border-signal-orange outline-none w-48 bg-transparent"
                  autoFocus
                  onBlur={handleSaveName}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                />
              </div>
            ) : (
              <h2 
                onClick={() => setIsEditingName(true)}
                className="font-condensed font-black text-3xl text-ink cursor-text uppercase tracking-wide"
              >
                {currentUser?.name || athlete.name || 'Atleta'}
              </h2>
            )}
            
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-bg border border-border rounded-lg">
              <ShieldCheck size={14} className="text-corner-red" />
              <span className="font-mono text-[9px] font-bold text-muted tracking-widest uppercase">{roleLabel}</span>
            </div>
          </div>
        </div>

        {/* MODO VISTA (Si es Ambos) */}
        {isBoth && (
          <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between shadow-none">
            <div>
              <h3 className="font-condensed font-black text-lg text-ink tracking-wider uppercase">Vista Actual</h3>
              <p className="font-mono text-[10px] text-muted uppercase tracking-wider mt-0.5">Cambia de rol</p>
            </div>
            <div className="flex bg-bg/40 border border-border p-1 rounded-xl">
              <button
                onClick={() => setViewMode('athlete')}
                className={`px-4 py-1.5 rounded-lg font-condensed font-bold text-xs uppercase transition-all cursor-pointer ${
                  viewMode === 'athlete' ? 'bg-signal-orange text-ink font-black shadow-none' : 'text-muted hover:text-ink'
                }`}
              >
                Atleta
              </button>
              <button
                onClick={() => setViewMode('coach')}
                className={`px-4 py-1.5 rounded-lg font-condensed font-bold text-xs uppercase transition-all cursor-pointer ${
                  viewMode === 'coach' ? 'bg-ink text-white shadow-none' : 'text-muted hover:text-ink'
                }`}
              >
                Coach
              </button>
            </div>
          </div>
        )}

        {/* ESTADÍSTICAS RÁPIDAS */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-xl p-4 text-center shadow-none">
            <div className="font-display font-black text-3xl text-ink">{totalSessions}</div>
            <div className="font-mono text-[8px] font-bold text-muted uppercase tracking-wider mt-1.5 leading-none">SESIONES</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center shadow-none">
            <div className="font-display font-black text-3xl text-signal-orange">{currentStreak}</div>
            <div className="font-mono text-[8px] font-bold text-muted uppercase tracking-wider mt-1.5 leading-none">RACHA DÍAS</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center flex flex-col justify-center items-center shadow-none">
            <div className="font-condensed font-bold text-sm text-ink truncate w-full uppercase" title={latestPR}>{latestPR}</div>
            <div className="font-mono text-[8px] font-bold text-muted uppercase tracking-wider mt-1.5 leading-none">ÚLTIMO PR</div>
          </div>
        </div>

        {/* FEEDBACK PENDIENTE */}
        {unreadCount > 0 && (
          <div className="bg-card border border-border rounded-xl p-5 shadow-none">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-condensed font-black text-lg tracking-wide uppercase text-ink flex items-center gap-2">
                <MessageCircle size={18} className="text-signal-orange" />
                Feedback Pendiente
              </h3>
              <span className="w-5 h-5 rounded-full bg-corner-red text-white text-[10px] font-black flex items-center justify-center font-mono">
                {unreadCount}
              </span>
            </div>
            <div className="space-y-2">
              {sessionsWithUnread.slice(0, 5).map(item => (
                <button
                  key={item.sessionId}
                  onClick={() => navigate('/evolution')}
                  className="w-full bg-bg/25 border border-border rounded-xl p-3 text-left flex items-center gap-3 active:scale-[0.98] transition-transform hover:border-signal-orange cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-signal-orange/10 text-signal-orange flex items-center justify-center shrink-0">
                    <MessageCircle size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-ink truncate uppercase">Sesión: {item.sessionId.substring(0, 10)}</p>
                    <p className="font-sans text-xs text-muted truncate mt-0.5">{item.lastText || 'Nuevo comentario'}</p>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-corner-red text-white text-[10px] font-black flex items-center justify-center shrink-0 font-mono">
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CÓDIGO SESIÓN */}
        <button 
          onClick={() => navigate('/import')}
          className="w-full bg-ink text-white rounded-xl p-5 text-left flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer shadow-none"
        >
          <div>
            <h3 className="font-condensed font-black text-lg uppercase tracking-wide">Recibir sesión</h3>
            <p className="font-mono text-[9px] text-muted uppercase tracking-wider mt-1">Importa un entreno mediante código</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
            <DownloadCloud size={16} />
          </div>
        </button>

        {/* DEPORTES ACTIVOS */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-none">
          <h3 className="font-condensed font-black text-lg mb-4 tracking-wider uppercase text-ink">Deportes Activos</h3>
          <div className="space-y-3">
            {athlete.sports.map(sport => {
              const isPrimary = sport.id === athlete.primarySport;
              return (
                <div key={sport.id} className="flex justify-between items-center p-3 rounded-xl border border-border bg-bg/15">
                  <div className="flex items-center gap-3">
                    {sport.icon && (
                      <div className="w-6 h-6 border border-border rounded flex items-center justify-center text-sm bg-card shrink-0">
                        {sport.icon}
                      </div>
                    )}
                    <span className="font-bold text-sm uppercase font-condensed tracking-wide text-ink">{sport.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setPrimarySport(sport.id)}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${isPrimary ? 'text-signal-orange' : 'text-muted hover:text-signal-orange'}`}
                    >
                      <Star fill={isPrimary ? 'var(--color-signal-orange)' : 'none'} size={18} />
                    </button>
                    <button
                      onClick={() => toggleSport(sport.id)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${sport.active ? 'bg-signal-orange' : 'bg-border'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${sport.active ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              );
            })}

            {showCustomSport ? (
              <div className="flex gap-2 items-center p-2 bg-signal-orange/10 border border-signal-orange/30 rounded-xl animate-fade-in">
                <input
                  type="text"
                  value={customSportInput}
                  onChange={e => setCustomSportInput(e.target.value)}
                  placeholder="Ej. Tenis"
                  className="flex-1 bg-card border border-border rounded-lg px-3 py-2 font-mono text-sm outline-none focus:border-signal-orange"
                  autoFocus
                />
                <button onClick={handleAddCustomSport} className="bg-signal-orange text-ink p-2 rounded-lg cursor-pointer">
                  <Plus size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowCustomSport(true)}
                className="w-full flex justify-center items-center gap-2 p-3 rounded-xl border-2 border-dashed border-border text-muted font-bold text-xs uppercase tracking-wider transition-colors hover:border-ink cursor-pointer bg-card"
              >
                <Plus size={14} /> Añadir Deporte
              </button>
            )}
          </div>
        </div>

        {/* NIVEL DE EXPERIENCIA (Dossier Chips) */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-none">
          <h3 className="font-condensed font-black text-lg mb-4 tracking-wider uppercase text-ink">Nivel de Experiencia</h3>
          <div className="flex gap-2">
            {[
              { id: 'novato', label: 'Novato' },
              { id: 'intermedio', label: 'Intermedio' },
              { id: 'avanzado', label: 'Avanzado' }
            ].map(lvl => {
              const isActive = (athlete.level || 'intermedio') === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => updateProfile({ level: lvl.id })}
                  className={`flex-1 py-3.5 rounded-lg font-mono font-bold text-xs tracking-wider uppercase border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-signal-orange border-signal-orange text-ink font-black shadow-none'
                      : 'bg-bg/25 border-border text-muted hover:border-ink'
                  }`}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ATLETAS (SOLO COACH O AMBOS) */}
        {(currentUser?.role === 'coach' || currentUser?.role === 'both') && (
          <div className="bg-ink text-white rounded-xl p-5 shadow-none">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-condensed font-black text-lg uppercase tracking-wide">Mis Atletas</h3>
               <Users size={18} className="text-signal-orange" />
             </div>
             <p className="font-sans text-xs text-muted mb-4">Gestiona y asigna rutinas a tus atletas supervisados.</p>
             <button onClick={() => navigate('/coach')} className="w-full bg-white/10 hover:bg-white/20 text-white font-condensed font-black py-3 rounded-xl transition-all cursor-pointer tracking-wider text-sm">
               GESTIONAR ATLETAS
             </button>
          </div>
        )}

        {/* RUTINAS ASIGNADAS (VISTA DE ATLETA) */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-none space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-condensed font-black text-lg uppercase tracking-wide text-ink">Rutinas Asignadas</h3>
              <p className="font-mono text-[9px] text-muted uppercase tracking-wider mt-0.5">Rutinas de entrenamiento enviadas por tu coach</p>
            </div>
            <CheckCircle2 size={20} className="text-signal-orange" />
          </div>

          {loadingAssignments ? (
            <div className="text-center p-4 font-mono text-xs text-muted uppercase tracking-wider animate-pulse">Cargando rutinas asignadas...</div>
          ) : assignedRoutines.length === 0 ? (
            <div className="bg-bg/25 border border-dashed border-border rounded-xl p-4 text-center text-muted font-mono text-xs uppercase tracking-wider">
              No tienes rutinas asignadas actualmente.
            </div>
          ) : (
            assignedRoutines.map(({ assignment, routine }) => {
              const isActive = assignment.active === true || assignment.active === 'true' || assignment.active === 1;
              return (
                <div key={assignment.id} className={`border rounded-xl p-4 transition-all ${isActive ? 'bg-signal-orange/5 border-signal-orange' : 'bg-bg/25 border-border'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-condensed font-black text-lg text-ink uppercase tracking-wide truncate">{routine.name}</h4>
                    {isActive ? (
                      <span className="font-mono text-[9px] font-black px-2 py-0.5 rounded bg-signal-orange text-ink uppercase tracking-wider border border-signal-orange flex items-center gap-1">
                        <CheckCircle2 size={12} /> ACTIVA
                      </span>
                    ) : (
                      <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-bg text-muted uppercase tracking-wider border border-border">
                        INACTIVA
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    {isActive ? (
                      <button
                        onClick={() => handleApplyAssignedRoutineToCalendar(routine)}
                        className="w-full bg-signal-orange text-ink px-4 py-2.5 rounded-lg font-condensed font-black text-xs uppercase tracking-wider hover:bg-signal-orange/95 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <PlayCircle size={16} /> Cargar en mi Calendario
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivateAssignment(assignment.id)}
                        disabled={activatingId === assignment.id}
                        className="w-full bg-card border border-border hover:border-signal-orange text-ink px-4 py-2.5 rounded-lg font-condensed font-black text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {activatingId === assignment.id ? 'Activando...' : 'Activar esta Rutina'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* CONFIGURACIÓN */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-none">
          <h3 className="font-condensed font-black text-lg mb-4 tracking-wider uppercase text-ink">Configuración</h3>
          
          <div className="space-y-4">
            
            {/* Sonido de Alarma Global */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 size={18} className="text-signal-orange" />
                  <div>
                    <div className="font-bold text-sm uppercase font-condensed tracking-wide">Sonido de Alarma</div>
                    <div className="font-mono text-[9px] text-muted uppercase tracking-wider mt-0.5">Al finalizar cualquier temporizador</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => playSound(completionSound)}
                  className="font-mono text-xs font-bold text-signal-orange hover:underline cursor-pointer bg-signal-orange/10 px-2.5 py-1 rounded-lg border border-signal-orange/20"
                >
                  Probar 🔊
                </button>
              </div>
              <select
                value={completionSound}
                onChange={(e) => {
                  const newSound = e.target.value;
                  setCompletionSound(newSound);
                  playSound(newSound);
                }}
                className="w-full py-2.5 px-3 bg-bg/50 border border-border rounded-xl font-mono text-xs font-semibold text-ink outline-none focus:border-signal-orange cursor-pointer"
              >
                {SOUND_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-muted" />
                <div>
                  <div className="font-bold text-sm uppercase font-condensed tracking-wide">Notificaciones</div>
                  <div className="font-mono text-[9px] text-muted uppercase tracking-wider mt-0.5">Alertas de entrenamiento</div>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${notifications ? 'bg-signal-orange' : 'bg-border'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-muted" />
                <div>
                  <div className="font-bold text-sm uppercase font-condensed tracking-wide">Modo Demo (MOCK)</div>
                  <div className="font-mono text-[9px] text-muted uppercase tracking-wider mt-0.5">Ver datos falsos en gráficas</div>
                </div>
              </div>
              <button
                onClick={handleToggleDemoMode}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${demoMode ? 'bg-signal-orange' : 'bg-border'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${demoMode ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

          </div>
        </div>

        {/* LOGOUT */}
        <button 
          onClick={logout}
          className="w-full flex justify-center items-center gap-2 p-4 rounded-xl bg-corner-red/10 text-corner-red font-condensed font-black text-sm uppercase tracking-wider transition-all active:scale-[0.98] border border-corner-red/20 mt-4 cursor-pointer hover:bg-corner-red/20"
        >
          <LogOut size={16} /> Cerrar Sesión
        </button>

      </div>
    </div>
  );
}
