import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlanner } from '../../context/PlannerContext';
import { Plus, X, ChevronRight, Calendar, Layers } from 'lucide-react';

const formatDate = (str) => {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${d} ${months[parseInt(m) - 1]} ${y}`;
};

const getProgressPercent = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  if (today < start) return 0;
  if (today > end) return 100;
  const total = end - start;
  const elapsed = today - start;
  return Math.round((elapsed / total) * 100);
};

const STATUS_CONFIG = {
  active:    { label: 'ACTIVA',    bg: 'bg-green/15',   text: 'text-green',   border: 'border-green/40' },
  finished:  { label: 'FINALIZADA', bg: 'bg-muted/10',   text: 'text-muted',   border: 'border-muted/30' },
  upcoming:  { label: 'PRÓXIMA',   bg: 'bg-blue/15',    text: 'text-blue',    border: 'border-blue/40'  },
};

export default function SeasonList() {
  const navigate = useNavigate();
  const { seasons, addSeason } = usePlanner();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', sport: '', startDate: '', endDate: '' });
  const [isVisible, setIsVisible] = useState(false);

  const openSheet = () => {
    setShowCreate(true);
    setTimeout(() => setIsVisible(true), 10);
  };

  const closeSheet = () => {
    setIsVisible(false);
    setTimeout(() => setShowCreate(false), 300);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.startDate || !form.endDate) return;
    addSeason(form);
    setForm({ name: '', sport: '', startDate: '', endDate: '' });
    closeSheet();
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text">
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4 bg-surface border-b border-border/50 sticky top-0 z-10">
        <div>
          <button onClick={() => navigate('/plan')} className="text-xs text-muted font-bold tracking-widest mb-1 flex items-center gap-1 hover:text-accent transition-colors">
            ← PLANIFICADOR
          </button>
          <h1 className="font-condensed font-black text-3xl">Mis Temporadas</h1>
        </div>
        <button
          onClick={openSheet}
          className="w-11 h-11 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/30 active:scale-95 transition-transform"
        >
          <Plus size={22} />
        </button>
      </div>

      {/* SEASON LIST */}
      <div className="flex-1 px-4 py-5 space-y-4 pb-24">
        {seasons.map(season => {
          const cfg = STATUS_CONFIG[season.status] || STATUS_CONFIG.upcoming;
          const progress = season.status === 'active' ? getProgressPercent(season.startDate, season.endDate) : null;

          return (
            <button
              key={season.id}
              onClick={() => navigate(`/plan/seasons/${season.id}`)}
              className="w-full bg-surface rounded-2xl border border-border p-5 flex flex-col gap-4 text-left active:scale-[0.98] transition-transform shadow-sm"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Status badge */}
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} mb-2`}>
                    {season.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse inline-block" />}
                    {cfg.label}
                  </span>
                  <h2 className="font-condensed font-black text-2xl leading-tight truncate">{season.name}</h2>
                  <p className="text-muted text-sm mt-0.5">{season.sport}</p>
                </div>
                <ChevronRight size={20} className="text-muted shrink-0 mt-1" />
              </div>

              {/* Meta info */}
              <div className="flex items-center gap-5 text-sm text-muted">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>{formatDate(season.startDate)} → {formatDate(season.endDate)}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Layers size={14} />
                  <span>{season.mesocycles.length} mesociclos</span>
                </div>
              </div>

              {/* Progress bar (only for active) */}
              {progress !== null && (
                <div>
                  <div className="flex justify-between text-xs text-muted mb-1.5">
                    <span>Progreso de temporada</span>
                    <span className="font-bold text-green">{progress}%</span>
                  </div>
                  <div className="h-2 bg-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green rounded-full transition-all duration-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Meso preview dots */}
              {season.mesocycles.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {season.mesocycles.slice(0, 6).map(m => (
                    <div key={m.id} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  ))}
                  {season.mesocycles.length > 6 && (
                    <span className="text-muted text-xs">+{season.mesocycles.length - 6}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}

        {seasons.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted">
            <Calendar size={48} className="opacity-30 mb-4" />
            <p className="font-bold text-lg">Sin temporadas</p>
            <p className="text-sm opacity-60 mt-1">Crea tu primera temporada con el + de arriba</p>
          </div>
        )}
      </div>

      {/* CREATE BOTTOM SHEET */}
      {showCreate && (
        <>
          <div
            onClick={closeSheet}
            className={`fixed inset-0 bg-black/60 z-[70] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          />
          <div className={`fixed bottom-0 left-0 w-full bg-[#1a1f2e] border-t border-white/10 rounded-t-3xl z-[70] transition-transform duration-300 ease-out pb-[calc(1.5rem+var(--safe-bottom,0px))] ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="w-10 h-1.5 bg-border rounded-full mx-auto mt-3 mb-4" />
            <div className="flex items-center justify-between px-5 mb-5">
              <h3 className="font-condensed font-black text-2xl">Nueva Temporada</h3>
              <button onClick={closeSheet} className="p-1.5 bg-surface text-muted rounded-full"><X size={18} /></button>
            </div>
            <div className="px-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Nombre</label>
                <input
                  type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Temporada 2026-27"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-bold text-text placeholder:text-muted/50 outline-none focus:border-blue"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Deporte / Modalidad</label>
                <input
                  type="text" value={form.sport} onChange={e => setForm(p => ({ ...p, sport: e.target.value }))}
                  placeholder="Taekwondo + Gym"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-bold text-text placeholder:text-muted/50 outline-none focus:border-blue"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Inicio</label>
                  <input
                    type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-3 font-bold text-text outline-none focus:border-blue text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Fin</label>
                  <input
                    type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-3 font-bold text-text outline-none focus:border-blue text-sm"
                  />
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={!form.name.trim() || !form.startDate || !form.endDate}
                className="w-full py-4 bg-accent text-white font-condensed font-bold text-lg rounded-xl mt-2 disabled:opacity-40 active:scale-[0.98] transition-transform"
              >
                Guardar Temporada
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
