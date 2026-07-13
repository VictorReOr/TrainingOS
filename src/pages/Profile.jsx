import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAthlete } from '../context/AthleteContext';
import { usePlanner } from '../context/PlannerContext';
import { useEvolutionData } from '../hooks/useEvolutionData';
import { usePR } from '../context/PRContext';
import { useFeedback } from '../context/FeedbackContext';
import { ChevronLeft, Pencil, Star, Plus, ShieldCheck, RefreshCw, Bell, Users, DownloadCloud, MessageCircle } from 'lucide-react';
import { getSeasons, getSessions } from '../services/sheets';

export default function Profile() {
  const navigate = useNavigate();
  const { athlete, toggleSport, addSport, setPrimarySport, updateProfile } = useAthlete();
  const { sessionLogs } = useEvolutionData();
  const { prs } = usePR();
  const { unreadCount, sessionsWithUnread } = useFeedback();

  // Edit Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(athlete.name);

  // Custom Sport State
  const [showCustomSport, setShowCustomSport] = useState(false);
  const [customSportInput, setCustomSportInput] = useState('');

  // Settings State
  const [demoMode, setDemoMode] = useState(() => localStorage.getItem('trainingos_demo_mode') === 'true');
  const [notifications, setNotifications] = useState(true);
  const [athleteIdSync, setAthleteIdSync] = useState(localStorage.getItem('trainingos_athlete_id_sync') || 'v-atleta-1');
  const [syncing, setSyncing] = useState(false);

  // Derived Identity
  const initial = athlete.name ? athlete.name.charAt(0).toUpperCase() : 'A';
  const roleLabels = { 'athlete': 'ATLETA', 'coach': 'ENTRENADOR', 'both': 'ENTRENADOR' };
  const roleLabel = roleLabels[athlete.role] || 'ATLETA';

  // Derived Stats
  const totalSessions = sessionLogs.length;
  // Streak logic (basic implementation)
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
  const latestPR = sortedPrs.length > 0 ? sortedPrs[0].exerciseName : 'Ninguno';

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
    // Force reload evolution data is triggered automatically on navigation mostly, 
    // but to be safe we can reload the window or let the context refresh.
    window.location.reload(); // Hard reload to ensure all states pick up the new localstorage flag
  };

  const handleSync = async () => {
    setSyncing(true);
    localStorage.setItem('trainingos_athlete_id_sync', athleteIdSync);
    try {
      // Usaremos un hack basic aquí llamando directo a getSeasons()
      console.log("Sincronizando con ID:", athleteIdSync);
      const res1 = await getSeasons(athleteIdSync);
      const res2 = await getSessions(athleteIdSync);
      console.log("Sync completo:", { res1, res2 });
      // To properly inject them requires dispatching them to PlannerContext
      // This is a placeholder visual sync loop as requested.
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setSyncing(false), 800);
    }
  };

  return (
    <div className="flex-1 bg-[#F5F5F0] flex flex-col min-h-screen text-[#1C1C1E] pb-24">
      
      {/* Header */}
      <div className="px-5 pt-6 pb-4 bg-white border-b border-[#E8E8E4] sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[#6E6E73] hover:text-[#1C1C1E]">
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-condensed font-black text-2xl uppercase tracking-wide">Mi Perfil</h1>
        </div>
        <button className="text-[#FF6B00] font-bold p-2 active:scale-95" onClick={() => navigate('/onboarding')}>
          <Pencil size={20} />
        </button>
      </div>

      <div className="p-4 space-y-6">
        
        {/* IDENTIDAD */}
        <div className="bg-white border border-[#E8E8E4] rounded-3xl p-6 shadow-sm flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 w-full h-16 bg-[#FFF3EC] border-b border-[#FF6B00]/20" />
          
          <div className="w-24 h-24 rounded-full border-4 border-white bg-[#FF6B00] text-white flex items-center justify-center font-condensed font-black text-5xl shadow-md z-10 relative">
            {initial}
          </div>
          
          <div className="mt-4 text-center w-full z-10">
            {isEditingName ? (
              <div className="flex items-center justify-center gap-2">
                <input 
                  type="text"
                  value={editNameValue}
                  onChange={e => setEditNameValue(e.target.value)}
                  className="text-center font-condensed font-black text-3xl border-b-2 border-[#FF6B00] outline-none w-48 bg-transparent"
                  autoFocus
                  onBlur={handleSaveName}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                />
              </div>
            ) : (
              <h2 
                onClick={() => setIsEditingName(true)}
                className="font-condensed font-black text-3xl text-[#1C1C1E] cursor-text"
              >
                {athlete.name || 'Atleta'}
              </h2>
            )}
            
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5F5F0] border border-[#E8E8E4] rounded-full">
              <ShieldCheck size={14} className="text-[#E85D04]" />
              <span className="text-[10px] font-bold text-[#6E6E73] tracking-widest uppercase">{roleLabel}</span>
            </div>
          </div>
        </div>

        {/* ESTADÍSTICAS RÁPIDAS */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-[#E8E8E4] rounded-2xl p-4 text-center shadow-sm">
            <div className="font-condensed font-black text-2xl text-[#1C1C1E]">{totalSessions}</div>
            <div className="text-[9px] font-bold text-[#6E6E73] uppercase tracking-wider mt-1">Sesiones Completadas</div>
          </div>
          <div className="bg-white border border-[#E8E8E4] rounded-2xl p-4 text-center shadow-sm">
            <div className="font-condensed font-black text-2xl text-[#FF6B00]">{currentStreak} 🔥</div>
            <div className="text-[9px] font-bold text-[#6E6E73] uppercase tracking-wider mt-1">Racha Actual</div>
          </div>
          <div className="bg-white border border-[#E8E8E4] rounded-2xl p-4 text-center shadow-sm flex flex-col justify-center">
            <div className="font-condensed font-bold text-sm text-[#1C1C1E] truncate" title={latestPR}>{latestPR}</div>
            <div className="text-[9px] font-bold text-[#6E6E73] uppercase tracking-wider mt-1">PR Reciente</div>
          </div>
        </div>

        {/* FEEDBACK PENDIENTE */}
        {unreadCount > 0 && (
          <div className="bg-white border border-[#E8E8E4] rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-condensed font-black text-xl tracking-wide uppercase text-[#1C1C1E] flex items-center gap-2">
                <MessageCircle size={20} className="text-[#FF6B00]" />
                Feedback Pendiente
              </h3>
              <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center">
                {unreadCount}
              </span>
            </div>
            <div className="space-y-2">
              {sessionsWithUnread.slice(0, 5).map(item => (
                <button
                  key={item.sessionId}
                  onClick={() => navigate('/evolution')}
                  className="w-full bg-[#F5F5F0] border border-[#E8E8E4] rounded-xl p-3 text-left flex items-center gap-3 active:scale-[0.98] transition-transform hover:border-[#FF6B00]"
                >
                  <div className="w-8 h-8 rounded-full bg-[#FFF3EC] text-[#FF6B00] flex items-center justify-center shrink-0">
                    💬
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#1C1C1E] truncate">Sesión: {item.sessionId.substring(0, 20)}</p>
                    <p className="text-xs text-[#6E6E73] truncate">{item.lastText || 'Nuevo comentario'}</p>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">
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
          className="w-full bg-[#1C1C1E] rounded-3xl p-5 text-left flex items-center justify-between active:scale-[0.98] transition-transform shadow-sm"
        >
          <div>
            <h3 className="font-condensed font-black text-white text-xl">Recibir sesión</h3>
            <p className="text-sm text-[#A1A1AA] mt-0.5">Importa un entreno mediante código</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#3F3F46] flex items-center justify-center text-white shrink-0">
            <DownloadCloud size={18} />
          </div>
        </button>

        {/* DEPORTES ACTIVOS */}
        <div className="bg-white border border-[#E8E8E4] rounded-3xl p-5 shadow-sm">
          <h3 className="font-condensed font-black text-xl mb-4 tracking-wide uppercase text-[#1C1C1E]">Deportes Activos</h3>
          <div className="space-y-3">
            {athlete.sports.map(sport => {
              const isPrimary = sport.id === athlete.primarySport;
              return (
                <div key={sport.id} className="flex justify-between items-center p-3 rounded-2xl border border-[#E8E8E4] bg-[#F5F5F0]">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{sport.icon}</div>
                    <span className="font-bold text-sm">{sport.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setPrimarySport(sport.id)}
                      className={`p-1.5 rounded-full transition-colors ${isPrimary ? 'text-[#FF6B00]' : 'text-[#D4D4D8] hover:text-[#FF6B00]'}`}
                    >
                      <Star fill={isPrimary ? '#FF6B00' : 'none'} size={18} />
                    </button>
                    <button
                      onClick={() => toggleSport(sport.id)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${sport.active ? 'bg-[#FF6B00]' : 'bg-[#E8E8E4]'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${sport.active ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              );
            })}

            {showCustomSport ? (
              <div className="flex gap-2 items-center p-2 bg-[#FFF3EC] border border-[#FF6B00]/30 rounded-2xl animate-fade-in">
                <input
                  type="text"
                  value={customSportInput}
                  onChange={e => setCustomSportInput(e.target.value)}
                  placeholder="Ej. Tenis"
                  className="flex-1 bg-white border border-[#E8E8E4] rounded-xl px-3 py-2 font-bold text-sm outline-none"
                  autoFocus
                />
                <button onClick={handleAddCustomSport} className="bg-[#FF6B00] text-white p-2 rounded-xl">
                  <Plus size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowCustomSport(true)}
                className="w-full flex justify-center items-center gap-2 p-3 rounded-2xl border-2 border-dashed border-[#E8E8E4] text-[#6E6E73] font-bold text-sm transition-colors hover:border-[#1C1C1E]"
              >
                <Plus size={18} /> Añadir Deporte
              </button>
            )}
          </div>
        </div>

        {/* ATLETAS (SOLO COACH) */}
        {athlete.role !== 'athlete' && (
          <div className="bg-[#1C1C1E] text-white rounded-3xl p-5 shadow-sm">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-condensed font-black text-xl uppercase tracking-wide">Mis Atletas</h3>
               <Users size={20} className="text-[#FF6B00]" />
             </div>
             <p className="text-sm text-[#A1A1AA] mb-4">Aún no gestionas atletas o se implementará en el módulo 4.2.</p>
             <button onClick={() => navigate('/coach')} className="w-full bg-[#3F3F46] hover:bg-[#52525B] text-white font-condensed font-bold py-3 rounded-xl transition-colors">
               GESTIONAR ATLETAS
             </button>
          </div>
        )}

        {/* CONFIGURACIÓN */}
        <div className="bg-white border border-[#E8E8E4] rounded-3xl p-5 shadow-sm">
          <h3 className="font-condensed font-black text-xl mb-4 tracking-wide uppercase text-[#1C1C1E]">Configuración</h3>
          
          <div className="space-y-4">
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-[#6E6E73]" />
                <div>
                  <div className="font-bold text-sm">Notificaciones</div>
                  <div className="text-xs text-[#6E6E73]">Alertas de entrenamiento</div>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${notifications ? 'bg-[#FF6B00]' : 'bg-[#E8E8E4]'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#F5F5F0]">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-[#6E6E73]" />
                <div>
                  <div className="font-bold text-sm">Modo Demo (MOCK)</div>
                  <div className="text-xs text-[#6E6E73]">Ver datos falsos en gráficas</div>
                </div>
              </div>
              <button
                onClick={handleToggleDemoMode}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${demoMode ? 'bg-[#FF6B00]' : 'bg-[#E8E8E4]'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${demoMode ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="pt-4 border-t border-[#F5F5F0]">
               <label className="text-xs font-bold text-[#6E6E73] tracking-widest uppercase mb-2 block">
                Atleta ID (GSheets)
               </label>
               <input 
                 type="text" 
                 value={athleteIdSync}
                 onChange={(e) => setAthleteIdSync(e.target.value)}
                 className="w-full bg-[#F5F5F0] border border-[#E8E8E4] rounded-xl px-4 py-3 font-mono text-sm outline-none focus:border-[#FF6B00] mb-3"
               />
               <button 
                 onClick={handleSync}
                 disabled={syncing}
                 className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#1C1C1E] text-[#1C1C1E] font-condensed font-bold py-3 rounded-xl disabled:opacity-50 active:scale-[0.98] transition-transform"
               >
                 <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                 {syncing ? 'SINCRONIZANDO...' : 'SINCRONIZAR CON SHEETS'}
               </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
