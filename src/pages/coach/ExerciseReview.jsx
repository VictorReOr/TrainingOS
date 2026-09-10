import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, ClipboardList, Sparkles } from 'lucide-react';
import { getPendingCustomExercises } from '../../utils/getPendingCustomExercises';
import {
  saveCoachOverride,
  getCoachOverrides,
  VALID_PATTERNS,
  VALID_PRIORITIES,
} from '../../data/exerciseMetadata';
import { EXERCISE_LIBRARY } from '../../data/exerciseLibrary';
import { findBestMatch } from '../../utils/exerciseSimilarity';
import {
  saveExerciseAlias,
  markNameAsReviewed,
  wasNameReviewed,
} from '../../utils/exerciseAliases';


// ─── helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

const SOURCE_LABEL = { plantilla: 'Plantilla', log: 'Log' };

// ─── PatternLabel — readable display for pattern keys ───────────────────────
const PATTERN_LABELS = {
  push_horizontal:  'Push horizontal',
  push_vertical:    'Push vertical',
  pull_horizontal:  'Pull horizontal',
  pull_vertical:    'Pull vertical',
  knee_dominant:    'Knee dominant',
  hip_dominant:     'Hip dominant',
  rotation:         'Rotación',
  anti_rotation:    'Anti-rotación',
  unilateral:       'Unilateral',
  core:             'Core',
  cardio:           'Cardio',
  unspecified:      'Sin especificar',
};

/** ExerciseType options for the coach override form */
const EXERCISE_TYPE_OPTIONS = [
  { value: 'STRENGTH',     label: 'Fuerza' },
  { value: 'HYPERTROPHY',  label: 'Hipertrofia' },
  { value: 'POWER',        label: 'Potencia' },
  { value: 'PLYOMETRIC',   label: 'Pliometría' },
  { value: 'BALLISTIC',    label: 'Balístico' },
  { value: 'OLYMPIC_LIFT', label: 'Olímpico' },
  { value: 'CORE',         label: 'Core' },
  { value: 'PREHAB',       label: 'Prehab' },
  { value: 'MOBILITY',     label: 'Movilidad' },
  { value: 'CONDITIONING', label: 'Acondicionamiento' },
  { value: 'STABILITY',    label: 'Estabilidad' },
  { value: 'TECHNICAL',    label: 'Técnica' },
  { value: 'AGILITY',      label: 'Agilidad' },
];

/**
 * Auto-derives progressionModel from exerciseType.
 * STABILITY, TECHNICAL, AGILITY → QUALITY (progress via execution quality, not load).
 */
const PROGRESSION_MODEL_FOR_TYPE = {
  STRENGTH:     'LOAD',
  HYPERTROPHY:  'VOLUME',
  POWER:        'QUALITY',
  PLYOMETRIC:   'QUALITY',
  BALLISTIC:    'VELOCITY',
  OLYMPIC_LIFT: 'VELOCITY',
  CORE:         'VOLUME',
  PREHAB:       'VOLUME',
  MOBILITY:     'NONE',
  CONDITIONING: 'DENSITY',
  STABILITY:    'QUALITY',
  TECHNICAL:    'QUALITY',
  AGILITY:      'QUALITY',
};


const PRIORITY_LABELS = {
  main:      'Principal',
  accessory: 'Accesorio',
  core:      'Core',
  mobility:  'Movilidad',
};

// ─── NameConflictBadge ───────────────────────────────────────────────────────
function NameConflictBadge({ occurrences, expanded, onToggle }) {
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-start gap-2 w-full text-left group"
      >
        {/* Terracota accent bar — mirrors TrafficLightBadge approach */}
        <span className="flex-shrink-0 flex gap-0.5 mt-0.5">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              style={{ width: 20, height: 6, borderRadius: 2, backgroundColor: i < 2 ? '#E8510A' : '#E5E5E5' }}
            />
          ))}
        </span>
        <span className="text-eyebrow" style={{ color: '#E8510A', fontSize: 10, lineHeight: '1.4' }}>
          POSIBLES NOMBRES DISTINTOS AGRUPADOS AQUÍ — REVISA ANTES DE ASIGNAR
        </span>
        <span className="ml-auto flex-shrink-0 text-[#E8510A]">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {expanded && (
        <div className="mt-2 ml-1 border-l-2 border-[#E8510A]/30 pl-3 space-y-1.5 animate-in">
          {occurrences.map((occ, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-meta mt-0.5 flex-shrink-0" style={{ color: '#E8510A', opacity: 0.6 }}>›</span>
              <div>
                <span className="text-body-bold text-[13px] text-[#1C1C1E]">{occ.name}</span>
                <span className="text-meta ml-2">
                  {SOURCE_LABEL[occ.source] ?? occ.source}
                  {occ.date ? ` · ${formatDate(occ.date)}` : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ReviewForm — inline expandable form ─────────────────────────────────────
function ReviewForm({ exercise, onSaved }) {
  const [form, setForm] = useState({
    displayName:      exercise.suggestedName,
    pattern:          'unspecified',               // default: coach selects explicitly
    exerciseType:     EXERCISE_TYPE_OPTIONS[0].value, // 'STRENGTH'
    systemicCost:     5,
    sportTransfer:    5,
    priority:         VALID_PRIORITIES[1],         // 'accessory'
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  // Auto-derive progressionModel from exerciseType
  const derivedProgressionModel = PROGRESSION_MODEL_FOR_TYPE[form.exerciseType] ?? null;

  const isValid = form.displayName.trim() && form.pattern && form.priority && form.exerciseType;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;

    setSaving(true);
    saveCoachOverride(exercise.id, {
      displayName:      form.displayName.trim(),
      pattern:          form.pattern,
      exerciseType:     form.exerciseType,
      progressionModel: derivedProgressionModel,
      systemicCost:     Number(form.systemicCost),
      sportTransfer:    Number(form.sportTransfer),
      priority:         form.priority,
    });
    setSaved(true);

    // Brief success flash before the item disappears from the list
    setTimeout(() => {
      setSaving(false);
      onSaved(exercise.id);
    }, 600);
  };

  const fieldClass =
    'w-full bg-[#F5F5F0] border border-[#E8E8E4] rounded-xl px-3 py-2.5 text-[#1C1C1E] font-sans text-sm outline-none focus:border-[#E8510A] transition-colors';
  const labelClass =
    'text-eyebrow block mb-1.5 text-[#6E6E73]';

  return (
    <form onSubmit={handleSubmit} className="pt-4 mt-4 border-t border-[#E8E8E4] space-y-4">

      {/* displayName */}
      <div>
        <label className={labelClass}>Nombre de visualización</label>
        <input
          type="text"
          value={form.displayName}
          onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
          required
          className={fieldClass}
          placeholder="Nombre del ejercicio"
        />
      </div>

      {/* exerciseType + progressionModel (auto-derived) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Tipo de ejercicio</label>
          <select
            value={form.exerciseType}
            onChange={e => setForm(f => ({ ...f, exerciseType: e.target.value }))}
            required
            className={fieldClass}
          >
            {EXERCISE_TYPE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Modelo de progresión</label>
          <div
            className={fieldClass + ' flex items-center opacity-60 cursor-default select-none'}
            title="Se deriva automáticamente del tipo de ejercicio"
          >
            {derivedProgressionModel ?? '—'}
          </div>
        </div>
      </div>

      {/* pattern + priority — side by side on wider viewports */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Patrón de movimiento</label>
          <select
            value={form.pattern}
            onChange={e => setForm(f => ({ ...f, pattern: e.target.value }))}
            required
            className={fieldClass}
          >
            {/* 'unspecified' first so it's visually prominent as the default */}
            <option value="unspecified">{PATTERN_LABELS.unspecified}</option>
            {VALID_PATTERNS.filter(p => p !== 'unspecified').map(p => (
              <option key={p} value={p}>{PATTERN_LABELS[p] ?? p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Prioridad</label>
          <select
            value={form.priority}
            onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
            required
            className={fieldClass}
          >
            {VALID_PRIORITIES.map(p => (
              <option key={p} value={p}>{PRIORITY_LABELS[p] ?? p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* systemicCost + sportTransfer */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Coste sistémico (1-10)</label>
          <input
            type="number"
            min={1}
            max={10}
            value={form.systemicCost}
            onChange={e => setForm(f => ({ ...f, systemicCost: e.target.value }))}
            required
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Transferencia deporte (1-10)</label>
          <input
            type="number"
            min={1}
            max={10}
            value={form.sportTransfer}
            onChange={e => setForm(f => ({ ...f, sportTransfer: e.target.value }))}
            required
            className={fieldClass}
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid || saving}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-condensed font-black text-lg tracking-wide transition-all active:scale-[0.98] disabled:opacity-40"
        style={{
          backgroundColor: saved ? '#10B981' : '#E8510A',
          color: '#fff',
          boxShadow: saved ? '0 4px 16px rgba(16,185,129,0.3)' : '0 4px 16px rgba(232,81,10,0.3)',
        }}
      >
        {saved ? (
          <><CheckCircle2 size={18} /> GUARDADO</>
        ) : (
          'GUARDAR OVERRIDE'
        )}
      </button>
    </form>
  );
}

// ─── normalize helper (same logic as exerciseMatcher / exerciseSimilarity) ────
function normalizeStr(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

// ─── SimilaritySuggestionCard ─────────────────────────────────────────────────
function SimilaritySuggestionCard({ exercise, candidate, score, onConfirm, onReject }) {
  const pct = Math.round(score * 100);
  return (
    <div
      className="mx-4 mt-3 mb-1 rounded-xl border p-4"
      style={{ backgroundColor: '#FFF8F0', borderColor: '#F5A623' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={14} style={{ color: '#F5A623', flexShrink: 0 }} />
        <span className="text-eyebrow" style={{ color: '#B87008', fontSize: 10 }}>
          SUGERENCIA AUTOMÁTICA · {pct}% similar
        </span>
      </div>
      <p className="text-sm text-[#1C1C1E] mb-3">
        ¿Es lo mismo que{' '}
        <span className="font-bold">'{candidate.name}'</span>?
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 py-2 rounded-lg text-sm font-bold text-white transition-all active:scale-[0.97]"
          style={{ backgroundColor: '#10B981' }}
        >
          Sí, es el mismo
        </button>
        <button
          type="button"
          onClick={onReject}
          className="flex-1 py-2 rounded-lg text-sm font-bold transition-all active:scale-[0.97]"
          style={{ backgroundColor: '#F5F5F0', color: '#6E6E73' }}
        >
          No, es distinto
        </button>
      </div>
    </div>
  );
}

// ─── ExerciseCard — single pending item ──────────────────────────────────────
function ExerciseCard({ exercise, onSaved }) {
  const [formOpen, setFormOpen]         = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);

  // ── Compute similarity suggestion once on mount ───────────────────────────
  const suggestion = (() => {
    const normalizedName = normalizeStr(exercise.suggestedName);

    // If already reviewed, skip suggestion
    if (wasNameReviewed(normalizedName)) return null;

    // Candidates: all EXERCISE_LIBRARY entries + custom-* that already have a coach override
    const overrides = getCoachOverrides();
    const libCandidates = EXERCISE_LIBRARY.map(e => ({ id: e.id, name: e.name }));
    const overrideCandidates = Object.entries(overrides)
      .filter(([id]) => id.startsWith('custom-') && id !== exercise.id)
      .map(([id, meta]) => ({ id, name: meta.displayName }))
      .filter(c => c.name);

    const candidates = [...libCandidates, ...overrideCandidates];
    const result = findBestMatch(exercise.suggestedName, candidates);
    if (!result || result.score < 0.65) return null;
    return result; // { candidate: { id, name }, score }
  })();

  const showSuggestion = suggestion !== null && !suggestionDismissed;

  const handleConfirmAlias = () => {
    saveExerciseAlias(normalizeStr(exercise.suggestedName), suggestion.candidate.id);
    onSaved(exercise.id); // treat as resolved — no manual override needed
  };

  const handleRejectAlias = () => {
    markNameAsReviewed(normalizeStr(exercise.suggestedName));
    setSuggestionDismissed(true);
  };

  const toggleForm = () => {
    setFormOpen(v => !v);
    if (!formOpen) setConflictOpen(false);
  };

  return (
    <div className="bg-white border border-[#E8E8E4] rounded-2xl overflow-hidden shadow-sm transition-all">
      {/* Card header — always visible */}
      <button
        type="button"
        onClick={toggleForm}
        className="w-full flex items-start gap-4 p-4 text-left group hover:border-[#E8510A] transition-colors active:scale-[0.99]"
      >
        {/* Left accent stripe */}
        <span
          className="flex-shrink-0 self-stretch w-1 rounded-full"
          style={{ backgroundColor: formOpen ? '#E8510A' : '#E8E8E4' }}
        />

        <div className="flex-1 min-w-0">
          <p className="font-condensed font-black text-xl text-[#1C1C1E] truncate group-hover:text-[#E8510A] transition-colors">
            {exercise.suggestedName}
          </p>
          <p className="text-meta mt-0.5">
            {exercise.id}
          </p>
        </div>

        {/* Occurrence badge + chevron */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
          <span
            className="text-meta px-2 py-1 rounded-lg"
            style={{ backgroundColor: '#F5F5F0', color: '#6E6E73' }}
          >
            {exercise.occurrenceCount} {exercise.occurrenceCount === 1 ? 'aparición' : 'apariciones'}
          </span>
          <ChevronDown
            size={18}
            className="text-[#D4D4D8] transition-transform duration-200"
            style={{ transform: formOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>
      </button>

      {/* Similarity suggestion card — shown before the form when score >= 0.65 */}
      {showSuggestion && (
        <SimilaritySuggestionCard
          exercise={exercise}
          candidate={suggestion.candidate}
          score={suggestion.score}
          onConfirm={handleConfirmAlias}
          onReject={handleRejectAlias}
        />
      )}

      {/* Conflict badge (always rendered when hasNameConflict, outside the form toggle area) */}
      {exercise.hasNameConflict && (
        <div className="px-4 pb-3 -mt-1">
          <NameConflictBadge
            occurrences={exercise.occurrences}
            expanded={conflictOpen}
            onToggle={() => setConflictOpen(v => !v)}
          />
        </div>
      )}

      {/* Inline expandable form */}
      {formOpen && (
        <div className="px-4 pb-5 animate-in">
          <ReviewForm exercise={exercise} onSaved={onSaved} />
        </div>
      )}
    </div>

  );
}

// ─── ExerciseReview — page root ───────────────────────────────────────────────
export default function ExerciseReview() {
  const navigate = useNavigate();

  // Derive pending list on first render; re-derive after each save via key trick
  const [pending, setPending] = useState(() => getPendingCustomExercises());

  const handleSaved = useCallback((savedId) => {
    // Immutable removal: filter out the saved exercise
    setPending(prev => prev.filter(ex => ex.id !== savedId));
  }, []);

  return (
    <div className="flex-1 bg-[#F5F5F0] flex flex-col min-h-screen text-[#1C1C1E] pb-24">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4 bg-white border-b border-[#E8E8E4] sticky top-0 z-30">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-[#F5F5F0] flex items-center justify-center text-[#1C1C1E] active:scale-90 transition-transform cursor-pointer"
            aria-label="Volver"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <p className="text-eyebrow text-[#E8510A] leading-none">COACH · EJERCICIOS</p>
            <h1 className="font-condensed font-black text-[28px] leading-tight text-[#1C1C1E]">
              Revisar Ejercicios Custom
            </h1>
          </div>
        </div>

        {pending.length > 0 && (
          <div className="flex items-center gap-2 mt-2 ml-12">
            <span
              className="text-meta px-2 py-0.5 rounded-md font-bold"
              style={{ backgroundColor: '#FFF3EC', color: '#E8510A' }}
            >
              {pending.length} pendiente{pending.length !== 1 ? 's' : ''}
            </span>
            <span className="text-meta text-[#6E6E73]">sin override</span>
          </div>
        )}
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="p-4">
        {pending.length === 0 ? (
          // ── Empty state ────────────────────────────────────
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ClipboardList size={40} className="text-[#D4D4D8] mb-4" />
            <p className="font-condensed font-bold text-xl text-[#1C1C1E]">
              No hay ejercicios pendientes de revisión
            </p>
            <p className="text-meta mt-2 max-w-xs">
              Todos los ejercicios custom tienen un override de coach asignado.
            </p>
          </div>
        ) : (
          // ── Pending list ───────────────────────────────────
          <div className="space-y-3">
            {/* Instruction row */}
            <div className="flex items-center gap-2 px-1 pb-1">
              <AlertTriangle size={13} style={{ color: '#E8510A' }} />
              <p className="text-meta" style={{ color: '#6E6E73' }}>
                Pulsa un ejercicio para asignarle metadata correcta.
              </p>
            </div>

            {pending.map(ex => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                onSaved={handleSaved}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
