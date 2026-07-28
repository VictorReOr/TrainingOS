import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, AlertTriangle, Repeat, Layers, Check } from 'lucide-react';
import TrafficLightBadge from '../performance/TrafficLightBadge';
import { useWeekRepetition } from '../../hooks/useWeekRepetition';

// ══════════════════════════════════════════════════════════
// WeekRepetitionModal
//
// Bottom-sheet for repeating a planned week (single or
// full mesocycle) with load progression from the
// Performance Engine. Coach reviews and approves before save.
// ══════════════════════════════════════════════════════════

const TRAFFIC_LABELS = {
  green:  'Subir',
  yellow: 'Mantener',
  red:    'Reducir',
};

export default function WeekRepetitionModal({
  isOpen,
  onClose,
  sourceMondayDate,
  activeMesocycle,
}) {
  // ── Mode toggle ────────────────────────────────────────
  const [mode, setMode] = useState('week'); // 'week' | 'mesocycle'
  const [mesoWeeks, setMesoWeeks] = useState(4);
  const [currentWizardWeek, setCurrentWizardWeek] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    generateWeekProposal,
    generateMesocycleProposal,
    updateMesocycleWeekProposal,
    confirmProposal,
    confirmMesocycleProposals,
    mesocycleProposals,
    remainingMesocycleWeeks,
  } = useWeekRepetition();

  // ── Single-week proposal state ─────────────────────────
  const [weekProposal, setWeekProposal] = useState([]);

  // Generate proposal on open
  useEffect(() => {
    if (!isOpen) {
      setSaved(false);
      setIsSaving(false);
      return;
    }
    if (mode === 'week') {
      const proposal = generateWeekProposal(sourceMondayDate);
      setWeekProposal(proposal);
    }
  }, [isOpen, mode, sourceMondayDate, generateWeekProposal]);

  // Generate mesocycle proposal when switching to mesocycle mode
  useEffect(() => {
    if (isOpen && mode === 'mesocycle') {
      generateMesocycleProposal(sourceMondayDate, mesoWeeks);
      setCurrentWizardWeek(0);
    }
  }, [isOpen, mode, mesoWeeks, sourceMondayDate, generateMesocycleProposal]);

  // Default mesoWeeks to remaining weeks in active mesocycle
  useEffect(() => {
    if (remainingMesocycleWeeks > 0) {
      setMesoWeeks(remainingMesocycleWeeks);
    }
  }, [remainingMesocycleWeeks]);

  // ── Active proposal (single week or current wizard week) ──
  const activeProposal = useMemo(() => {
    if (mode === 'week') return weekProposal;
    if (mesocycleProposals?.proposals) {
      return mesocycleProposals.proposals[currentWizardWeek] || [];
    }
    return [];
  }, [mode, weekProposal, mesocycleProposals, currentWizardWeek]);

  // ── Group proposal items by session ────────────────────
  const groupedBySession = useMemo(() => {
    const groups = new Map();
    for (const item of activeProposal) {
      if (!groups.has(item.sessionId)) {
        groups.set(item.sessionId, { sessionName: item.sessionName, items: [] });
      }
      groups.get(item.sessionId).items.push(item);
    }
    return Array.from(groups.values());
  }, [activeProposal]);

  // ── Handle coach editing an approved load ──────────────
  const handleLoadChange = useCallback((exerciseId, newValue) => {
    const parsed = newValue === '' ? null : parseFloat(newValue);
    if (newValue !== '' && isNaN(parsed)) return;

    const updateProposal = (proposal) =>
      proposal.map(item =>
        item.exerciseId === exerciseId
          ? { ...item, approvedLoad: parsed }
          : item
      );

    if (mode === 'week') {
      setWeekProposal(prev => updateProposal(prev));
    } else if (mesocycleProposals) {
      const updated = updateProposal(activeProposal);
      updateMesocycleWeekProposal(currentWizardWeek, updated);
    }
  }, [mode, activeProposal, mesocycleProposals, currentWizardWeek, updateMesocycleWeekProposal]);

  // ── Confirm (save) ─────────────────────────────────────
  const handleConfirm = useCallback(() => {
    setIsSaving(true);

    if (mode === 'week') {
      // Target = next week from source
      const target = new Date(sourceMondayDate);
      target.setDate(target.getDate() + 7);
      confirmProposal(weekProposal, target);
    } else {
      // Target = week after source
      const target = new Date(sourceMondayDate);
      target.setDate(target.getDate() + 7);
      confirmMesocycleProposals(target);
    }

    setIsSaving(false);
    setSaved(true);
    setTimeout(() => onClose(), 1200);
  }, [mode, sourceMondayDate, weekProposal, confirmProposal, confirmMesocycleProposals, onClose]);

  // ── Has exercises with load data ───────────────────────
  const hasLoadExercises = activeProposal.some(p => p.oldLoad != null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="bg-card rounded-t-2xl w-full max-h-[90vh] flex flex-col relative animate-slide-up border-t border-border">
        {/* Drag handle */}
        <div className="w-12 h-1 bg-border rounded-full mx-auto my-3 shrink-0" />

        {/* ─── HEADER ───────────────────────────────────────── */}
        <div className="px-5 pb-4 shrink-0 border-b border-border flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-condensed font-black text-xl text-ink uppercase tracking-wide">
              Repetir Semana
            </h3>
            <p className="font-mono text-[9px] text-muted uppercase tracking-wider mt-0.5">
              {mode === 'mesocycle'
                ? 'Proyección basada en datos actuales — ajusta semana a semana'
                : 'Progresión automática basada en el motor de rendimiento'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-bg/50 text-muted rounded-full hover:bg-bg transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* ─── MODE TOGGLE ──────────────────────────────────── */}
        <div className="px-5 pt-4 pb-3 flex gap-2 shrink-0">
          <button
            onClick={() => setMode('week')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border font-condensed font-black text-sm uppercase tracking-wide transition-all cursor-pointer ${
              mode === 'week'
                ? 'bg-signal-orange/10 border-signal-orange text-signal-orange'
                : 'bg-card border-border text-muted hover:border-muted'
            }`}
          >
            <Repeat size={14} strokeWidth={2.5} />
            Repetir semana
          </button>
          <button
            onClick={() => setMode('mesocycle')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border font-condensed font-black text-sm uppercase tracking-wide transition-all cursor-pointer ${
              mode === 'mesocycle'
                ? 'bg-signal-orange/10 border-signal-orange text-signal-orange'
                : 'bg-card border-border text-muted hover:border-muted'
            }`}
          >
            <Layers size={14} strokeWidth={2.5} />
            Mesociclo
          </button>
        </div>

        {/* ─── MESOCYCLE CONTROLS ────────────────────────────── */}
        {mode === 'mesocycle' && (
          <div className="px-5 pb-3 flex items-center gap-3 shrink-0">
            <span className="font-mono text-[9px] text-muted uppercase tracking-widest font-bold">Semanas:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMesoWeeks(w => Math.max(1, w - 1))}
                className="w-7 h-7 flex items-center justify-center bg-bg border border-border rounded-lg text-ink font-bold text-sm cursor-pointer hover:border-signal-orange transition-colors"
              >
                −
              </button>
              <span className="font-condensed font-black text-xl text-ink w-8 text-center">
                {mesoWeeks}
              </span>
              <button
                onClick={() => setMesoWeeks(w => Math.min(12, w + 1))}
                className="w-7 h-7 flex items-center justify-center bg-bg border border-border rounded-lg text-ink font-bold text-sm cursor-pointer hover:border-signal-orange transition-colors"
              >
                +
              </button>
            </div>
            {activeMesocycle && (
              <span className="font-mono text-[8px] text-muted tracking-wider uppercase">
                ({activeMesocycle.name})
              </span>
            )}
          </div>
        )}

        {/* ─── WIZARD NAV (mesocycle mode) ───────────────────── */}
        {mode === 'mesocycle' && mesocycleProposals && (
          <div className="px-5 pb-3 flex items-center justify-between shrink-0">
            <button
              onClick={() => setCurrentWizardWeek(w => Math.max(0, w - 1))}
              disabled={currentWizardWeek === 0}
              className="p-2 rounded-lg border border-border text-muted hover:text-signal-orange hover:border-signal-orange transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="text-center">
              <span className="font-condensed font-black text-lg text-ink uppercase">
                Semana {currentWizardWeek + 1}
              </span>
              <span className="font-mono text-[9px] text-muted uppercase tracking-wider ml-2">
                / {mesoWeeks}
              </span>
            </div>
            <button
              onClick={() => setCurrentWizardWeek(w => Math.min(mesoWeeks - 1, w + 1))}
              disabled={currentWizardWeek >= mesoWeeks - 1}
              className="p-2 rounded-lg border border-border text-muted hover:text-signal-orange hover:border-signal-orange transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ─── PROPOSAL TABLE ───────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">

          {/* Projection disclaimer — visible in mesocycle mode for weeks 2+ */}
          {mode === 'mesocycle' && currentWizardWeek > 0 && (
            <div className="mb-3 flex items-start gap-2 px-3 py-2.5 bg-[#f5a623]/8 border border-[#f5a623]/20 rounded-xl">
              <span className="text-[#f5a623] shrink-0 mt-px text-sm">📋</span>
              <p className="font-sans text-[10px] text-muted leading-snug">
                <span className="font-bold text-[#f5a623]">
                  Semana {currentWizardWeek + 1} — proyección.
                </span>{' '}
                Las cargas se calculan a partir de los datos actuales del atleta, no del historial futuro.
                Podrás volver a repetir y ajustar cuando tengas más sesiones reales registradas.
              </p>
            </div>
          )}

          {activeProposal.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-condensed font-black text-lg text-muted uppercase tracking-wide">
                Sin sesiones planificadas
              </p>
              <p className="font-mono text-[10px] text-muted uppercase tracking-wider mt-1">
                Asigna sesiones a esta semana primero
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedBySession.map((group, gIdx) => (
                <div key={gIdx} className="bg-bg/30 rounded-xl border border-border overflow-hidden">
                  {/* Session header */}
                  <div className="px-4 py-2.5 bg-card border-b border-border">
                    <span className="font-condensed font-black text-sm text-ink uppercase tracking-wide">
                      {group.sessionName}
                    </span>
                  </div>

                  {/* Exercise rows */}
                  <div className="divide-y divide-border">
                    {group.items.map((item) => (
                      <div key={item.exerciseId} className="px-4 py-3">
                        {/* Row 1: Name + Traffic Light */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-condensed font-bold text-sm text-ink uppercase tracking-wide flex-1 truncate">
                            {item.exerciseName}
                          </span>
                          <TrafficLightBadge
                            color={item.trafficLight}
                            label={TRAFFIC_LABELS[item.trafficLight] || 'Mantener'}
                            size="sm"
                          />
                        </div>

                        {/* Row 2: Load progression */}
                        {item.oldLoad != null ? (
                          <div className="flex items-center gap-2">
                            {/* Current load */}
                            <div className="flex flex-col items-center">
                              <span className="font-mono text-[8px] text-muted uppercase tracking-widest">Actual</span>
                              <span className="font-condensed font-black text-lg text-ink leading-none">
                                {item.oldLoad}<span className="text-muted text-xs ml-0.5">kg</span>
                              </span>
                            </div>

                            {/* Arrow with delta */}
                            <div className="flex flex-col items-center flex-1">
                              <span
                                className="font-mono font-bold text-[10px] uppercase tracking-wider"
                                style={{
                                  color: item.suggestedDelta > 0 ? '#27ae60'
                                       : item.suggestedDelta < 0 ? '#e8412a'
                                       : '#6B7280'
                                }}
                              >
                                {item.suggestedDelta > 0 ? '+' : ''}{item.suggestedDelta}kg
                              </span>
                              <div className="w-full h-px bg-border my-1 relative">
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-border border-y-2 border-y-transparent" />
                              </div>
                              {item.series && item.reps && (
                                <span className="font-mono text-[8px] text-muted tracking-wider">
                                  {item.series}×{item.reps}
                                </span>
                              )}
                            </div>

                            {/* Approved load (editable) */}
                            <div className="flex flex-col items-center">
                              <span className="font-mono text-[8px] text-muted uppercase tracking-widest">Nueva</span>
                              <div className="relative">
                                <input
                                  type="number"
                                  step="1.25"
                                  min="0"
                                  value={item.approvedLoad ?? ''}
                                  onChange={(e) => handleLoadChange(item.exerciseId, e.target.value)}
                                  className="w-16 h-8 text-center font-condensed font-black text-lg text-ink bg-card border border-border rounded-lg focus:border-signal-orange focus:outline-none transition-colors"
                                />
                                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 font-mono text-[8px] text-muted">kg</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="font-mono text-[9px] text-muted uppercase tracking-wider">
                            Sin carga prescrita — {item.series && item.reps ? `${item.series}×${item.reps}` : 'ejercicio técnico'}
                          </p>
                        )}

                        {/* Stagnation warning */}
                        {item.isStagnating && (
                          <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 bg-[#f5a623]/10 border border-[#f5a623]/20 rounded-lg">
                            <AlertTriangle size={12} className="text-[#f5a623] shrink-0" />
                            <span className="font-mono text-[9px] text-[#f5a623] font-bold uppercase tracking-wider">
                              Estancado — considera cambiar de variante
                            </span>
                          </div>
                        )}

                        {/* Reasoning */}
                        <p className="font-sans text-[10px] text-muted mt-1.5 leading-snug">
                          {item.reasoning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── FOOTER: Confirm button ───────────────────────── */}
        <div
          className="px-5 py-4 border-t border-border bg-card shrink-0"
          style={{ paddingBottom: 'calc(1rem + var(--safe-bottom, 0px))' }}
        >
          {saved ? (
            <div className="flex items-center justify-center gap-2 py-3 bg-[#27ae60]/10 border border-[#27ae60]/20 rounded-xl">
              <Check size={18} className="text-[#27ae60]" />
              <span className="font-condensed font-black text-base text-[#27ae60] uppercase tracking-wide">
                Guardado correctamente
              </span>
            </div>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={activeProposal.length === 0 || isSaving}
              className="w-full py-3.5 bg-signal-orange text-ink font-condensed font-black text-base uppercase tracking-wider rounded-xl border border-border hover:bg-signal-orange/90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isSaving ? 'Guardando...' : (
                mode === 'week'
                  ? `Aprobar y guardar (${hasLoadExercises ? activeProposal.filter(p => p.oldLoad != null).length + ' ejercicios' : 'sin cargas'})`
                  : `Aprobar ${mesoWeeks} semanas`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
