import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlanner } from '../../context/PlannerContext';
import { MESO_COLORS, MESO_LABELS } from '../../data/mockPlanner';
import { Plus, X, ChevronRight, Target } from 'lucide-react';

const formatDate = (str) => {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${d} ${months[parseInt(m) - 1]}`;
};

const getMesoEndDate = (startDate, weeks) => {
  const d = new Date(startDate);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().split('T')[0];
};

const isCurrentMeso = (meso) => {
  const today = new Date();
  const start = new Date(meso.startDate);
  const end = new Date(getMesoEndDate(meso.startDate, meso.weeks));
  return today >= start && today <= end;
};

const MESO_TYPE_OPTIONS = [
  { id: 'fuerza',       label: 'Fuerza',       color: MESO_COLORS.fuerza },
  { id: 'hipertrofia',  label: 'Hipertrofia',  color: MESO_COLORS.hipertrofia },
  { id: 'potencia',     label: 'Potencia',     color: MESO_COLORS.potencia },
  { id: 'peaking',      label: 'Peaking',      color: MESO_COLORS.peaking },
  { id: 'competicion',  label: 'Competición',  color: MESO_COLORS.competicion },
  { id: 'recuperacion', label: 'Recuperación', color: MESO_COLORS.recuperacion },
];

export default function MesocycleList() {
  const { seasonId } = useParams();
  const navigate = useNavigate();
  const { seasons, addMesocycle } = usePlanner();

  const season = seasons.find(s => s.id === seasonId);

  const [showCreate, setShowCreate] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'fuerza', startDate: '', weeks: 4, objective: '',
  });

  if (!season) return (
    <div className="flex items-center justify-center h-screen text-muted">
      <p>Temporada no encontrada</p>
    </div>
  );

  const openSheet = () => { setShowCreate(true); setTimeout(() => setIsVisible(true), 10); };
  const closeSheet = () => { setIsVisible(false); setTimeout(() => setShowCreate(false), 300); };

  const handleSave = () => {
    if (!form.name.trim() || !form.startDate || form.weeks < 1) return;
    const color = MESO_COLORS[form.type] || '#3d7dd4';
    addMesocycle(seasonId, { ...form, color });
    setForm({ name: '', type: 'fuerza', startDate: '', weeks: 4, objective: '' });
    closeSheet();
  };

  // Total weeks for timeline proportions
  const totalWeeks = season.mesocycles.reduce((a, m) => a + m.weeks, 0) || 1;

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text">
      {/* HEADER */}
      <div className="px-5 pt-6 pb-4 bg-surface border-b border-border/50 sticky top-0 z-10">
        <button
          onClick={() => navigate('/plan/seasons')}
          className="text-xs text-muted font-bold tracking-widest mb-1 flex items-center gap-1 hover:text-accent transition-colors"
        >
          ← TEMPORADAS
        </button>
        <div className="flex items-center justify-between">
          <h1 className="font-condensed font-black text-2xl truncate pr-3">{season.name}</h1>
          <button
            onClick={openSheet}
            className="w-11 h-11 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/30 active:scale-95 transition-transform shrink-0"
          >
            <Plus size={22} />
          </button>
        </div>
        <p className="text-muted text-sm mt-0.5">{season.sport}</p>
      </div>

      <div className="flex-1 pb-24">
        {/* TIMELINE HORIZONTAL */}
        {season.mesocycles.length > 0 && (
          <div className="px-5 py-5 border-b border-border/30">
            <p className="text-xs font-bold text-muted tracking-widest mb-3">LÍNEA DE TIEMPO</p>
            <div className="flex rounded-xl overflow-hidden h-12 gap-px">
              {season.mesocycles.map(meso => {
                const pct = Math.round((meso.weeks / totalWeeks) * 100);
                const isCurrent = isCurrentMeso(meso);
                return (
                  <div
                    key={meso.id}
                    className={`flex items-center justify-center transition-all ${isCurrent ? 'ring-2 ring-white ring-inset' : ''}`}
                    style={{ width: `${pct}%`, backgroundColor: meso.color + 'CC', minWidth: 24 }}
                    title={`${meso.name} · ${meso.weeks}sem`}
                  >
                    <span className="text-white text-[10px] font-black truncate px-1 drop-shadow">
                      {meso.weeks}s
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
              {season.mesocycles.map(meso => (
                <div key={meso.id} className="flex items-center gap-1.5 text-xs text-muted">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: meso.color }} />
                  <span className="truncate max-w-[80px]">{meso.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MESOCYCLE CARDS */}
        <div className="px-4 py-4 space-y-3">
          {season.mesocycles.map((meso) => {
            const isCurrent = isCurrentMeso(meso);
            const endDate = getMesoEndDate(meso.startDate, meso.weeks);
            const typeLabel = MESO_LABELS[meso.type] || meso.type;

            return (
              <div
                key={meso.id}
                className={`bg-surface rounded-2xl border overflow-hidden shadow-sm ${
                  isCurrent ? 'border-white/30' : 'border-border'
                }`}
                style={{ borderLeftWidth: 5, borderLeftColor: meso.color }}
              >
                <div className="p-4">
                  {/* Top */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                          style={{ backgroundColor: meso.color + '25', color: meso.color }}
                        >
                          {typeLabel}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-black text-white bg-white/15 px-2 py-0.5 rounded-full tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                            ACTUAL
                          </span>
                        )}
                      </div>
                      <h3 className="font-condensed font-black text-xl leading-tight">{meso.name}</h3>
                      <p className="text-muted text-sm mt-0.5">
                        {formatDate(meso.startDate)} → {formatDate(endDate)} · <span className="font-bold">{meso.weeks} semanas</span>
                      </p>
                    </div>
                  </div>

                  {/* Objective */}
                  {meso.objective && (
                    <div className="flex items-start gap-2 bg-bg rounded-xl p-3 mb-3">
                      <Target size={14} className="text-muted shrink-0 mt-0.5" />
                      <p className="text-sm text-muted line-clamp-2">{meso.objective}</p>
                    </div>
                  )}

                  {/* Action */}
                  <button
                    onClick={() => navigate('/plan')}
                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-border bg-bg hover:border-accent hover:text-accent transition-colors"
                  >
                    <span className="font-bold text-sm">Ver semanas</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          {season.mesocycles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted">
              <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
                <Plus size={28} className="opacity-40" />
              </div>
              <p className="font-bold">Sin mesociclos</p>
              <p className="text-sm opacity-60 mt-1">Añade el primero con el botón +</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE BOTTOM SHEET */}
      {showCreate && (
        <>
          <div onClick={closeSheet} className={`fixed inset-0 bg-black/60 z-[70] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`fixed bottom-0 left-0 w-full bg-[#1a1f2e] border-t border-white/10 rounded-t-3xl z-[70] transition-transform duration-300 ease-out pb-[calc(1.5rem+var(--safe-bottom,0px))] max-h-[90vh] overflow-y-auto ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="w-10 h-1.5 bg-border rounded-full mx-auto mt-3 mb-4" />
            <div className="flex items-center justify-between px-5 mb-5">
              <h3 className="font-condensed font-black text-2xl">Nuevo Mesociclo</h3>
              <button onClick={closeSheet} className="p-1.5 bg-surface text-muted rounded-full"><X size={18} /></button>
            </div>

            <div className="px-5 flex flex-col gap-4 pb-4">
              {/* Nombre */}
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Nombre</label>
                <input
                  type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Bloque Fuerza 1"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-bold text-text placeholder:text-muted/50 outline-none focus:border-blue"
                />
              </div>

              {/* Tipo — grid visual */}
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Tipo</label>
                <div className="grid grid-cols-3 gap-2">
                  {MESO_TYPE_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setForm(p => ({ ...p, type: opt.id }))}
                      className={`py-2.5 px-3 rounded-xl border font-bold text-sm transition-all ${
                        form.type === opt.id
                          ? 'border-transparent text-white scale-[1.02]'
                          : 'bg-surface border-border text-muted'
                      }`}
                      style={form.type === opt.id ? { backgroundColor: opt.color } : {}}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fecha y semanas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Inicio</label>
                  <input
                    type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-3 font-bold text-text outline-none focus:border-blue text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Semanas</label>
                  <div className="flex items-center justify-between bg-surface border border-border rounded-xl px-3 py-2">
                    <button onClick={() => setForm(p => ({ ...p, weeks: Math.max(1, p.weeks - 1) }))} className="w-8 h-8 flex items-center justify-center bg-bg rounded-full font-bold text-lg">−</button>
                    <span className="font-condensed font-black text-2xl">{form.weeks}</span>
                    <button onClick={() => setForm(p => ({ ...p, weeks: Math.min(24, p.weeks + 1) }))} className="w-8 h-8 flex items-center justify-center bg-bg rounded-full font-bold text-lg">+</button>
                  </div>
                </div>
              </div>

              {/* Objetivo */}
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Objetivo</label>
                <textarea
                  value={form.objective} onChange={e => setForm(p => ({ ...p, objective: e.target.value }))}
                  placeholder="¿Qué queremos conseguir en este bloque?"
                  rows={3}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-medium text-text placeholder:text-muted/50 outline-none focus:border-blue resize-none text-sm"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={!form.name.trim() || !form.startDate}
                className="w-full py-4 bg-accent text-white font-condensed font-bold text-lg rounded-xl disabled:opacity-40 active:scale-[0.98] transition-transform"
              >
                Guardar Mesociclo
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
