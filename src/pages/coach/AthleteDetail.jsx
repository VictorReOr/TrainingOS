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

const TABS = [
  { id: 'plan', label: 'Plan', icon: <CalendarDays size={18} /> },
  { id: 'evolution', label: 'Evolución', icon: <TrendingUp size={18} /> },
  { id: 'history', label: 'Historial', icon: <ClipboardList size={18} /> }
];

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function AthleteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAthleteById } = useCoach();
  const athlete = getAthleteById(id);

  const [activeTab, setActiveTab] = useState('plan');
  const [showAssignSheet, setShowAssignSheet] = useState(false);
  const [showImportSheet, setShowImportSheet] = useState(false);
  const [importedRoutines, setImportedRoutines] = useState([]);
  const [loadingImport, setLoadingImport] = useState(false);
  const [assignTargetDay, setAssignTargetDay] = useState('');

  // Coach sets
  const { sessionTemplates } = usePlanner();
  const { getFeedbackForSession } = useFeedback();
  const [selectedHistoryLog, setSelectedHistoryLog] = useState(null);

  // Pupil hooks (stateless and scoped to their ID)
  const { assignments, assignSession, removeSession, loading: planLoading } = useAthletePlan(id);
  const { sessionLogs, prs, loading: evLoading } = useAthleteEvolution(id);
  const fatigue = useFatigue(id);

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
    try {
      const res = await fetchWorkouts();
      const parsed = parseWorkouts(res.rows || []);
      setImportedRoutines(parsed);
    } catch (err) {
      console.error('Error cargando rutinas:', err);
    } finally {
      setLoadingImport(false);
    }
  };

  const handleApplyRoutine = (routine) => {
    // La rutina tiene sessions con claves como 'lunes', 'martes', etc.
    Object.keys(routine.sessions).forEach(day => {
      const sess = routine.sessions[day];
      // Simulamos que sess.id es único para que assignSession funcione bien
      assignSession(day, { ...sess, id: sess.id + '_' + Date.now() });
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
              <h2 className="font-condensed font-black text-xl text-[#1C1C1E] tracking-wide uppercase">Plan Semanal</h2>
              <button 
                onClick={handleOpenImport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF3EC] text-[#FF6B00] rounded-lg font-condensed font-bold text-sm hover:bg-[#FF6B00] hover:text-white transition-colors border border-[#FF6B00]"
              >
                <DownloadCloud size={16} /> Importar Excel
              </button>
            </div>
            {planLoading ? <div className="text-center p-6 text-[#6E6E73]">Cargando...</div> : (
              DAYS.map(day => {
                const assigned = assignments[day];
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
