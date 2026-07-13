import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, ChevronRight, X } from 'lucide-react';
import { useCoach } from '../../context/CoachContext';

export default function CoachDashboard() {
  const navigate = useNavigate();
  const { athletes, addAthlete } = useCoach();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newAthlete, setNewAthlete] = useState({ name: '', sport: 'Gimnasio', id: '' });

  const getStatus = (lastSessionDate) => {
    if (!lastSessionDate) return { label: 'INACTIVO', tw: 'bg-[#F5F5F0] text-[#6E6E73] border-[#E8E8E4]' };
    const diffDays = Math.floor((new Date() - new Date(lastSessionDate)) / (1000 * 60 * 60 * 24));
    if (diffDays < 3) return { label: 'ACTIVO', tw: 'bg-green-100 text-green-700 border-green-200' };
    if (diffDays < 7) return { label: 'EN RIESGO', tw: 'bg-[#FFF3EC] text-[#FF6B00] border-[#FF6B00]/30' };
    return { label: 'INACTIVO', tw: 'bg-[#F5F5F0] text-[#6E6E73] border-[#E8E8E4]' };
  };

  const handleSave = () => {
    if (!newAthlete.name || !newAthlete.id) return;
    addAthlete({
      ...newAthlete,
      role: 'athlete',
      avatar: newAthlete.name.charAt(0).toUpperCase(),
      activeSince: new Date().toISOString().split('T')[0],
      stats: { totalSessions: 0, lastSession: null, currentStreak: 0, topPR: null }
    });
    setShowAddSheet(false);
    setNewAthlete({ name: '', sport: 'Gimnasio', id: '' });
  };

  return (
    <div className="flex-1 bg-[#F5F5F0] flex flex-col min-h-screen text-[#1C1C1E] pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 bg-white border-b border-[#E8E8E4] sticky top-0 z-30 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-condensed font-bold text-[#FF6B00] tracking-widest uppercase mb-0.5">
            Coach
          </p>
          <h1 className="font-condensed font-black text-[32px] leading-tight text-[#1C1C1E]">
            Mis Atletas
          </h1>
        </div>
        <button 
          onClick={() => setShowAddSheet(true)}
          className="w-10 h-10 bg-[#1C1C1E] text-white rounded-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {athletes.map(a => {
          const status = getStatus(a.stats.lastSession);
          return (
            <button
              key={a.id}
              onClick={() => navigate(`/coach/${a.id}`)}
              className="w-full bg-white border border-[#E8E8E4] rounded-2xl p-4 flex items-center gap-4 text-left shadow-sm active:scale-[0.98] transition-transform hover:border-[#FF6B00]"
            >
              <div className="w-12 h-12 rounded-full bg-[#FF6B00] text-white font-condensed font-black text-2xl flex items-center justify-center shrink-0">
                {a.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-condensed font-black text-xl text-[#1C1C1E] truncate">{a.name}</span>
                  <span className={`text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full border ${status.tw}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-xs text-[#6E6E73] truncate font-medium">💪 {a.sport}</p>
                <div className="flex gap-3 text-[10px] text-[#A1A1AA] mt-2 tracking-wide font-bold uppercase">
                   <span>Última: {a.stats.lastSession || 'NUNCA'}</span>
                   <span>·</span>
                   <span>🔥 {a.stats.currentStreak} días</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-[#D4D4D8] shrink-0" />
            </button>
          )
        })}
      </div>

      {/* BOTTOM SHEET ADD ATHLETE */}
      {showAddSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddSheet(false)} />
          <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto relative animate-slide-up">
            <div className="w-12 h-1 bg-[#E8E8E4] rounded-full mx-auto my-3" />
            <div className="px-5 pb-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-condensed font-black text-2xl text-[#1C1C1E]">Nuevo Atleta</h3>
                <button onClick={() => setShowAddSheet(false)} className="p-2 bg-[#F5F5F0] rounded-full text-[#6E6E73]">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#6E6E73] tracking-widest uppercase ml-1 block mb-1">Nombre</label>
                  <input
                    type="text"
                    value={newAthlete.name}
                    onChange={e => setNewAthlete({...newAthlete, name: e.target.value})}
                    placeholder="Ej. Ana Pérez"
                    className="w-full bg-[#F5F5F0] border border-[#E8E8E4] rounded-xl px-4 py-3 font-bold outline-none focus:border-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#6E6E73] tracking-widest uppercase ml-1 block mb-1">Deporte</label>
                  <select
                    value={newAthlete.sport}
                    onChange={e => setNewAthlete({...newAthlete, sport: e.target.value})}
                    className="w-full bg-[#F5F5F0] border border-[#E8E8E4] rounded-xl px-4 py-3 font-bold outline-none focus:border-[#FF6B00]"
                  >
                    <option value="Gimnasio">Gimnasio</option>
                    <option value="Taekwondo">Taekwondo</option>
                    <option value="Crossfit">Crossfit</option>
                    <option value="Running">Running</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#6E6E73] tracking-widest uppercase ml-1 block mb-1">Atleta ID (GSheets remoto)</label>
                  <input
                    type="text"
                    value={newAthlete.id}
                    onChange={e => setNewAthlete({...newAthlete, id: e.target.value})}
                    placeholder="Ej. v-atleta-xx"
                    className="w-full bg-[#F5F5F0] border border-[#E8E8E4] rounded-xl px-4 py-3 font-mono text-sm outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={handleSave}
                  disabled={!newAthlete.name || !newAthlete.id}
                  className="w-full bg-[#FF6B00] text-white font-condensed font-black text-xl rounded-2xl py-4 shadow-[0_4px_20px_rgba(255,107,0,0.3)] disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  VINCULAR ATLETA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
