import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CalendarDays, TrendingUp, ClipboardList, Plus, Dumbbell, Trash2, ShieldCheck, Activity, X } from 'lucide-react';
import { useCoach } from '../../context/CoachContext';
import { useFeedback } from '../../context/FeedbackContext';
import { useAthletePlan } from '../../hooks/useAthletePlan';
import { useAthleteEvolution } from '../../hooks/useAthleteEvolution';
import { usePlanner } from '../../context/PlannerContext';
import FeedbackSection from '../../components/FeedbackSection';
import { useFatigue } from '../../hooks/useFatigue';
import { fetchWorkouts } from '../../services/sheets';
import { parseWorkouts } from '../../utils/workoutParser';
import { DownloadCloud } from 'lucide-react';

import { getFullSuggestion } from '../../utils/loadSuggestion';

const TABS = [
  { id: 'plan', label: 'Plan', icon: <CalendarDays size={18} /> },
  { id: 'overload', label: 'Sobrecarga', icon: <Dumbbell size={18} /> },
  { id: 'evolution', label: 'Evolución', icon: <TrendingUp size={18} /> },
  { id: 'history', label: 'Historial', icon: <ClipboardList size={18} /> }
];

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function AthleteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAthleteById, updateAthlete } = useCoach();
  const athlete = getAthleteById(id);

  const [activeTab, setActiveTab] = useState('plan');
  const [showAssignSheet, setShowAssignSheet] = useState(false);
  const [showImportSheet, setShowImportSheet] = useState(false);
  const [importedRoutines, setImportedRoutines] = useState([]);
  const [loadingImport, setLoadingImport] = useState(false);
  const [importError, setImportError] = useState(null);
  const [assignTargetDay, setAssignTargetDay] = useState('');

  // Coach sets
  const { sessionTemplates } = usePlanner();
  const { getFeedbackForSession } = useFeedback();
  const [selectedHistoryLog, setSelectedHistoryLog] = useState(null);

  // Pupil hooks (stateless and scoped to their ID)
  const { 
    currentWeekStart, 
    navigateWeek, 
    assignments, 
    assignSession, 
    removeSession, 
    loading: planLoading 
  } = useAthletePlan(id);
  const { sessionLogs, prs, loading: evLoading } = useAthleteEvolution(id);
  const fatigue = useFatigue(id);

  // Computaciones de sobrecarga progresiva
  const athleteExercises = React.useMemo(() => {
    const map = {};
    sessionLogs.forEach(log => {
      (log.ejercicios || []).forEach(ex => {
        if (ex.id && !map[ex.id]) {
          map[ex.id] = ex.nombre;
        }
      });
    });
    return Object.entries(map).map(([exId, name]) => ({ id: exId, name }));
  }, [sessionLogs]);

  const overloadData = React.useMemo(() => {
    if (!athlete) return [];
    const level = athlete.level || 'intermedio';
    return athleteExercises.map(ex => {
      const exercisePRs = (prs || []).filter(pr => pr.exerciseId === ex.id);
      const bestPR = exercisePRs.reduce((max, pr) => pr.valor > max.valor ? pr : max, null);
      const e1RM = bestPR ? bestPR.valor : 0;

      const sugg = getFullSuggestion({
        exerciseId: ex.id,
        exerciseName: ex.name,
        targetReps: 8,
        sessionType: 'gym',
        prs,
        sessionLogs,
        athleteLevel: level,
        pMaxOverride: athlete.pMaxOverrides?.[ex.id] || null
      });

      return {
        id: ex.id,
        name: ex.name,
        e1RM: Math.round(e1RM),
        pct: sugg.weeklyImprovePct,
        avgRPE: sugg.lastSession ? Math.round(sugg.lastSession.rpe * 10) / 10 : '-',
        isDeload: sugg.isDeloadSuggested,
        confidence: sugg.confidence,
        pMax: sugg.breakdown ? Math.round(sugg.breakdown.pMax) : 0
      };
    });
  }, [athleteExercises, prs, sessionLogs, athlete]);

  const handleLevelChange = (lvl) => {
    updateAthlete(athlete.id, { level: lvl });
  };

  const handlePMaxOverrideChange = (exId, val) => {
    const parsed = parseFloat(val);
    const overrides = athlete.pMaxOverrides || {};
    updateAthlete(athlete.id, {
      pMaxOverrides: {
        ...overrides,
        [exId]: isNaN(parsed) || parsed <= 0 ? null : parsed
      }
    });
  };

  const pupilWellness = React.useMemo(() => {
    try {
      const all = JSON.parse(localStorage.getItem('trainingos_wellness_logs') || '[]');
      return all;
    } catch { return []; }
  }, []);

  const pupilCMJ = React.useMemo(() => {
    try {
      const all = JSON.parse(localStorage.getItem('trainingos_cmj_logs') || '[]');
      return all;
    } catch { return []; }
  }, []);

  if (!athlete) return <div className="p-10 text-center">Atleta no encontrado.</div>;

  const handleOpenAssign = (day) => {
    setAssignTargetDay(day);
    setShowAssignSheet(true);
  };

  const handleSelectSession = (session) => {
    assignSession(assignTargetDay, session);
    setShowAssignSheet(false);
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
    // La rutina tiene sessions con claves como 'lunes', 'martes', etc.
    const DAYS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    Object.keys(routine.sessions).forEach(day => {
      // Find matching proper day name (capitalize properly first)
      const properDay = DAYS_FULL.find(d => d.toLowerCase() === day.toLowerCase() || d.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === day.toLowerCase());
      if (properDay) {
        const sess = routine.sessions[day];
        assignSession(properDay, { ...sess, id: sess.id + '_' + Date.now() });
      }
    });
    setShowImportSheet(false);
  };

  const handleRemove = (day, e) => {
    e.stopPropagation();
    removeSession(day);
  };

  return (
    <div className="flex-1 bg-[#F5F5F0] flex flex-col min-h-screen text-[#1C1C1E] pb-8">
      {/* HEADER */}
      <div className="px-5 pt-6 pb-4 bg-white border-b border-[#E8E8E4] sticky top-0 z-30">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/coach')} className="p-2 -ml-2 text-[#6E6E73] hover:text-[#1C1C1E] active:scale-95 transition-transform">
            <ChevronLeft size={24} />
          </button>
          <div className="w-10 h-10 rounded-full bg-[#FF6B00] text-white flex items-center justify-center font-condensed font-black text-xl">
            {athlete.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-condensed font-black text-2xl truncate leading-none">{athlete.name}</h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-[#6E6E73] tracking-widest uppercase">{athlete.sport}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Activo" />
              {fatigue.level !== 'SIN_DATOS' && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{ color: fatigue.color, borderColor: fatigue.color, backgroundColor: fatigue.color + '15' }}
                >
                  {fatigue.emoji} {fatigue.label}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex bg-[#F5F5F0] p-1 rounded-xl">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-condensed font-bold text-sm transition-all ${
                activeTab === t.id ? 'bg-white text-[#1C1C1E] shadow-sm' : 'text-[#6E6E73] hover:text-[#1C1C1E]'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-4 animate-fade-in">
        
        {/* PLAN TAB */}
        {activeTab === 'plan' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button onClick={() => navigateWeek(-1)} className="p-1 text-[#6E6E73] hover:text-[#1C1C1E]"><ChevronLeft size={20} /></button>
                <div className="text-center">
                  <h2 className="font-condensed font-black text-xl text-[#1C1C1E] tracking-wide uppercase leading-none">
                    Semana Plan
                  </h2>
                  <p className="text-[10px] text-[#6E6E73] font-bold">
                    {currentWeekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {new Date(currentWeekStart.getTime() + 6*24*60*60*1000).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <button onClick={() => navigateWeek(1)} className="p-1 text-[#6E6E73] hover:text-[#1C1C1E]"><ChevronLeft size={20} className="rotate-180" /></button>
              </div>
              <button 
                onClick={handleOpenImport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF3EC] text-[#FF6B00] rounded-lg font-condensed font-bold text-sm hover:bg-[#FF6B00] hover:text-white transition-colors border border-[#FF6B00]"
              >
                <DownloadCloud size={16} /> Importar Excel
              </button>
            </div>
            {planLoading ? <div className="text-center p-6 text-[#6E6E73]">Cargando...</div> : (
              DAYS.map((day, idx) => {
                const d = new Date(currentWeekStart);
                d.setDate(d.getDate() + idx);
                const pad = n => n.toString().padStart(2, '0');
                const isoDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
                const assigned = assignments[isoDate];

                return (
                  <div key={day} className="bg-white border border-[#E8E8E4] rounded-2xl overflow-hidden shadow-sm flex items-stretch">
                    <div className="w-8 shrink-0 flex items-center justify-center border-r border-[#E8E8E4] bg-[#F5F5F0]">
                       <span className="origin-center -rotate-90 text-[10px] font-bold tracking-widest text-[#6E6E73] uppercase w-8 text-center">{day.substring(0,3)}</span>
                    </div>
                    
                    {assigned ? (
                      <div className="flex-1 p-4 flex items-center justify-between hover:bg-[#F5F5F0] transition-colors cursor-pointer group">
                        <div>
                           <p className="font-condensed font-bold text-lg text-[#1C1C1E]">{assigned.name}</p>
                           <p className="text-xs text-[#6E6E73] flex gap-2"><span>⏱ {assigned.duration}m</span></p>
                        </div>
                        <button onClick={(e) => handleRemove(day, e)} className="p-2 text-[#E8E8E4] group-hover:text-red-500 transition-colors">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ) : (
                      <button 
                         onClick={() => handleOpenAssign(day)}
                         className="flex-1 p-4 flex items-center justify-center gap-2 text-[#A1A1AA] hover:text-[#FF6B00] hover:bg-[#FFF3EC] transition-colors border-2 border-dashed border-transparent hover:border-[#FF6B00]/30"
                      >
                         <Plus size={20} />
                         <span className="font-condensed font-bold text-sm tracking-wide uppercase">Asignar Sesión</span>
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* OVERLOAD TAB */}
        {activeTab === 'overload' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E8E8E4] rounded-2xl p-5 shadow-sm">
              <h3 className="font-condensed font-black text-lg text-[#1C1C1E] uppercase tracking-wide mb-3">Nivel del Atleta</h3>
              <div className="flex gap-2">
                {['novato', 'intermedio', 'avanzado'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => handleLevelChange(lvl)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all border ${
                      (athlete.level || 'intermedio') === lvl
                        ? 'bg-[#FF6B00] border-transparent text-white shadow-sm'
                        : 'bg-[#F5F5F0] border-[#E8E8E4] text-[#6E6E73] hover:text-[#1C1C1E]'
                    }`}
                  >
                    {lvl === 'novato' ? '🟢 Novato' : lvl === 'avanzado' ? '🔴 Avanzado' : '🟡 Intermedio'}
                  </button>
                ))}
              </div>
            </div>

            {/* WIDGET DE READINESS Y FATIGA DEL SNC */}
            <div className="bg-white border border-[#E8E8E4] rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-condensed font-black text-lg text-[#1C1C1E] uppercase tracking-wide mb-1 flex items-center gap-2">
                <Activity size={18} className="text-[#FF6B00]" />
                Estado de Readiness del Alumno
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F5F5F0] border border-[#E8E8E4] rounded-xl p-3.5">
                  <span className="text-[10px] text-[#6E6E73] font-bold block uppercase tracking-wider">Cuestionario Wellness</span>
                  <span className="font-condensed font-black text-2xl text-[#1C1C1E] block mt-1">
                    {pupilWellness.length > 0 
                      ? `${(pupilWellness.reduce((acc, curr) => acc + (curr.sleep + curr.stress + curr.doms + curr.fatigue) / 4, 0) / pupilWellness.length).toFixed(1)} / 5.0`
                      : 'Sin Datos'}
                  </span>
                  <span className="text-[9px] text-[#8E8E93] block mt-0.5">Media acumulada de disposición</span>
                </div>

                <div className="bg-[#F5F5F0] border border-[#E8E8E4] rounded-xl p-3.5">
                  <span className="text-[10px] text-[#6E6E73] font-bold block uppercase tracking-wider">Último Salto CMJ</span>
                  <span className="font-condensed font-black text-2xl text-[#FF6B00] block mt-1">
                    {pupilCMJ.length > 0 
                      ? `${pupilCMJ[0].valor} cm`
                      : 'Sin Datos'}
                  </span>
                  <span className="text-[9px] text-[#8E8E93] block mt-0.5">Neuromuscular (salto CMJ)</span>
                </div>
              </div>

              {pupilWellness.length > 0 && (
                <div className="border-t border-[#E8E8E4] pt-3">
                  <p className="text-xs text-[#6E6E73] leading-relaxed">
                    • <strong>Último check-in ({new Date(pupilWellness[0].fecha).toLocaleDateString()}):</strong> Sueño {pupilWellness[0].sleep}/5, Fatiga {pupilWellness[0].fatigue}/5.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white border border-[#E8E8E4] rounded-2xl p-5 shadow-sm overflow-hidden">
              <h3 className="font-condensed font-black text-lg text-[#1C1C1E] uppercase tracking-wide mb-4">Ejercicios y Límites</h3>
              {overloadData.length === 0 ? (
                <p className="text-sm text-[#6E6E73] text-center py-4">Sin datos de ejercicios. El atleta debe completar entrenamientos.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E8E8E4] text-[10px] text-[#6E6E73] uppercase font-bold">
                        <th className="py-2 pr-4">Ejercicio</th>
                        <th className="py-2 px-4 text-center">e1RM</th>
                        <th className="py-2 px-4 text-center">Mejora/sem</th>
                        <th className="py-2 px-4 text-center">RPE Real</th>
                        <th className="py-2 px-4 text-center">Límite P_max</th>
                        <th className="py-2 pl-4 text-right">Techo Manual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E8E4]">
                      {overloadData.map(ex => (
                        <tr key={ex.id} className="text-sm">
                          <td className="py-3 pr-4 font-semibold text-[#1C1C1E]">
                            {ex.name}
                            {ex.isDeload && (
                              <span className="ml-2 bg-red-100 text-red-600 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">DELOAD</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-condensed font-black text-[#1C1C1E] text-base">{ex.e1RM}kg</td>
                          <td className="py-3 px-4 text-center font-bold text-green-600">+{ex.pct}%</td>
                          <td className="py-3 px-4 text-center font-semibold text-[#6E6E73]">{ex.avgRPE}</td>
                          <td className="py-3 px-4 text-center font-bold text-[#1C1C1E]">{ex.pMax}kg</td>
                          <td className="py-3 pl-4 text-right">
                            <input
                              type="number"
                              placeholder="Fijar techo"
                              value={athlete.pMaxOverrides?.[ex.id] || ''}
                              onChange={(e) => handlePMaxOverrideChange(ex.id, e.target.value)}
                              className="w-20 bg-[#F5F5F0] border border-[#E8E8E4] rounded-lg px-2 py-1 text-xs font-bold text-right text-[#1C1C1E] focus:border-[#FF6B00] outline-none"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* EVOLUTION TAB */}
        {activeTab === 'evolution' && (
          <div className="space-y-6">
            <h2 className="font-condensed font-black text-xl text-[#1C1C1E] tracking-wide uppercase">Gráficas de Evolución</h2>
             {evLoading ? <div className="text-center p-6 text-[#6E6E73]">Cargando...</div> : 
              sessionLogs.length === 0 ? (
                 <div className="bg-white border-2 border-dashed border-[#E8E8E4] rounded-3xl p-8 text-center">
                   <Activity size={48} className="mx-auto text-[#D4D4D8] mb-4" />
                   <h3 className="font-condensed font-black text-xl text-[#1C1C1E] mb-2">Sin datos disponibles</h3>
                   <p className="text-sm text-[#6E6E73]">Este atleta aún no ha registrado sesiones.</p>
                 </div>
              ) : (
                <div className="space-y-4">
                  {/* Mock Evolution Box, Real graphs would be wrapped here using similar recharts implementation */}
                  <div className="bg-white border border-[#E8E8E4] rounded-2xl p-4 shadow-sm text-center">
                    <ShieldCheck size={32} className="mx-auto text-[#FF6B00] mb-2" />
                    <p className="font-bold text-[#1C1C1E]">Evolución del pupilo calculada exitosamente</p>
                    <p className="text-xs text-[#6E6E73] mt-1">{sessionLogs.length} sesiones detectadas y {prs.length} PRs.</p>
                  </div>
                </div>
              )
             }
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="font-condensed font-black text-xl text-[#1C1C1E] tracking-wide uppercase">Historial de Sesiones</h2>
            {evLoading ? <div className="text-center p-6 text-[#6E6E73]">Cargando...</div> : 
              sessionLogs.length === 0 ? (
                 <div className="bg-white border-2 border-dashed border-[#E8E8E4] rounded-3xl p-8 text-center text-[#6E6E73]">
                   El historial de este atleta está limpio.
                 </div>
              ) : (
                 <div className="space-y-3">
                   {sessionLogs.map(log => {
                     const feedbacksForLog = getFeedbackForSession(log.sessionId || log.id, id);
                     const hasUnread = feedbacksForLog.some(f => !f.leido && f.autorRole === 'athlete');
                     return (
                       <div key={log.id} className="bg-white border border-[#E8E8E4] rounded-2xl p-4 shadow-sm relative cursor-pointer active:scale-[0.98] transition-transform" onClick={() => setSelectedHistoryLog(log)}>
                         {hasUnread && (
                           <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                         )}
                         <div className="flex justify-between items-start mb-2">
                           <h3 className="font-condensed font-black text-lg text-[#1C1C1E]">{log.name || log.sessionName}</h3>
                           <span className="text-[10px] font-bold text-[#6E6E73] tracking-widest">{log.fecha}</span>
                         </div>
                         <p className="text-xs text-[#6E6E73] mb-3">⏱ {log.duration || Math.floor((log.duracion || 0) / 60)}m · {log.ejercicios?.length || 0} Ejercicios</p>
                         {feedbacksForLog.length > 0 && (
                           <div className="flex items-center gap-1 text-xs text-[#6E6E73]">
                             <span>💬</span>
                             <span className="font-bold">{feedbacksForLog.length}</span>
                           </div>
                         )}
                       </div>
                     );
                   })}
                 </div>
              )
            }
          </div>
        )}
      </div>

      {/* ASSIGN BOTTOM SHEET */}
      {showAssignSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAssignSheet(false)} />
          <div className="bg-white rounded-t-3xl w-full max-h-[85vh] flex flex-col relative animate-slide-up">
            <div className="w-12 h-1 bg-[#E8E8E4] rounded-full mx-auto my-3 shrink-0" />
            <div className="px-5 pb-4 shrink-0 flex justify-between items-center border-b border-[#E8E8E4]">
              <div>
                <h3 className="font-condensed font-black text-2xl text-[#1C1C1E]">Asignar a {athlete.name}</h3>
                <p className="text-sm font-bold text-[#FF6B00] uppercase tracking-wide">Día: {assignTargetDay}</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 pb-8 space-y-3">
              <p className="text-[10px] font-condensed font-bold text-[#6E6E73] tracking-widest uppercase mb-1">Tu Biblioteca de Entrenador</p>
              {sessionTemplates.length === 0 ? (
                <div className="p-6 text-center text-[#6E6E73] bg-[#F5F5F0] rounded-2xl border border-[#E8E8E4] border-dashed">
                  No tienes sesiones en tu biblioteca. Créalas en "Plan".
                </div>
              ) : (
                sessionTemplates.map(sess => (
                  <button 
                    key={sess.id}
                    onClick={() => handleSelectSession(sess)}
                    className="w-full bg-white border border-[#E8E8E4] rounded-2xl p-4 flex items-center justify-between text-left shadow-sm active:scale-[0.98] transition-transform hover:border-[#FF6B00]"
                  >
                    <div>
                      <h4 className="font-condensed font-bold text-lg text-[#1C1C1E]">{sess.name}</h4>
                      <p className="text-xs text-[#6E6E73]">
                         {sess.duration}m · {sess.exercises?.length || 0} ej.
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#FFF3EC] text-[#FF6B00] flex items-center justify-center">
                      <ChevronLeft size={16} className="rotate-180" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* IMPORT FROM EXCEL BOTTOM SHEET */}
      {showImportSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowImportSheet(false)} />
          <div className="bg-[#F5F5F0] rounded-t-3xl w-full max-h-[85vh] flex flex-col relative animate-slide-up">
            <div className="w-12 h-1 bg-[#D4D4D8] rounded-full mx-auto my-3 shrink-0" />
            <div className="px-5 pb-4 shrink-0 border-b border-[#E8E8E4] bg-white rounded-t-3xl">
              <h3 className="font-condensed font-black text-2xl text-[#1C1C1E]">Importar Semana</h3>
              <p className="text-sm text-[#6E6E73] mt-1">Selecciona una rutina de tu hoja de Excel.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 pb-8 space-y-4">
              {loadingImport ? (
                <div className="text-center p-6 text-[#6E6E73]">Sincronizando con Google Sheets...</div>
              ) : importError ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600">
                  <p className="font-bold mb-1">Error al conectar con Google Sheets:</p>
                  <p className="text-sm">{importError}</p>
                </div>
              ) : importedRoutines.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-[#E8E8E4] rounded-3xl p-6 text-center text-[#6E6E73]">
                  No se encontraron rutinas en la pestaña 'workouts'. Añade filas en tu Excel.
                </div>
              ) : (
                importedRoutines.map(routine => (
                  <div key={routine.id} className="bg-white border border-[#E8E8E4] rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-4 py-3 bg-[#FFF3EC] border-b border-[#E8E8E4] flex items-center justify-between">
                      <h4 className="font-condensed font-black text-xl text-[#1C1C1E]">{routine.name}</h4>
                      <button 
                        onClick={() => handleApplyRoutine(routine)}
                        className="bg-[#FF6B00] text-white px-3 py-1 rounded-lg font-condensed font-bold text-sm hover:bg-[#E85D04] transition-colors"
                      >
                        ASIGNAR
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
      {/* HISTORY DETAIL SHEET */}
      {selectedHistoryLog && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setSelectedHistoryLog(null)} />
          <div className="bg-white w-full rounded-t-[32px] pt-4 pb-8 px-5 flex flex-col shadow-2xl relative z-10 animate-slide-up max-h-[85vh] border-t border-[#E8E8E4]">
            <div className="w-10 h-1 bg-[#E8E8E4] rounded-full mx-auto mb-5" />
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-condensed font-black text-2xl text-[#1C1C1E]">{selectedHistoryLog.name || selectedHistoryLog.sessionName}</h3>
                <span className="text-[10px] font-bold text-[#6E6E73] tracking-widest">{selectedHistoryLog.fecha}</span>
              </div>
              <button onClick={() => setSelectedHistoryLog(null)} className="p-2 bg-[#F5F5F0] rounded-full text-[#6E6E73] hover:text-[#1C1C1E] transition-colors shrink-0">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto hide-scrollbar">
              <div className="border-t border-[#E8E8E4] pt-4">
                <h4 className="font-condensed font-bold text-lg text-[#1C1C1E] uppercase tracking-wide mb-3">
                  💬 Feedback
                </h4>
                <FeedbackSection
                  sessionId={selectedHistoryLog.sessionId || selectedHistoryLog.id}
                  atletaId={id}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
