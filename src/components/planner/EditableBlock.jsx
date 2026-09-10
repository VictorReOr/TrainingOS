import React, { useState, useEffect } from 'react';
import { MoreVertical, Copy, Trash2, ArrowUp, ArrowDown, Plus, Zap } from 'lucide-react';
import BlockTypeSelector, { PREDEFINED_TYPES } from '../timer/BlockTypeSelector';
import EditableExercise from './EditableExercise';
import ExecutionTypeSelector from './ExecutionTypeSelector';
import { EXECUTION_PRESET_DEFAULTS, BLOCK_ROLE_CONFIG } from '../../data/executionPresets.js';

// Buscamos color para header basado en Custom Blocks
// No podemos acceder al hook de custom tipos directamente en render sin un Provider general,
// pero pasaremos el color desde el padre, o usaremos PREDEFINED como fallback.
const getColorForType = (typeId) => {
  const t = PREDEFINED_TYPES.find(p => p.id === typeId);
  return t ? t.color : '#e8412a'; 
};

export default function EditableBlock({
  block,
  blockIndex,
  isFirst,
  isLast,
  onChange,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onAddExerciseClick
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [execSelectorOpen, setExecSelectorOpen] = useState(false);
  const color = block.color || getColorForType(block.type);

  const updateField = (field, value) => {
    onChange({ ...block, [field]: value });
  };

  const handleExerciseChange = (exIndex, updatedExercise) => {
    const newExercises = [...block.exercises];
    newExercises[exIndex] = updatedExercise;
    onChange({ ...block, exercises: newExercises });
  };

  const handleDeleteExercise = (exIndex) => {
    const newExercises = block.exercises.filter((_, i) => i !== exIndex);
    onChange({ ...block, exercises: newExercises });
  };

  // ── Execution helpers ────────────────────────────────────────────────────────
  const handleExecutionChange = (executionObject) => {
    if (!executionObject) {
      onChange({ ...block, execution: undefined });
      return;
    }
    // Pobla exerciseRoles con asignación posicional por defecto usando los
    // ejercicios actuales del bloque, eliminando la discrepancia entre lo
    // que muestra la UI y lo que se persiste.
    const roles = BLOCK_ROLE_CONFIG[executionObject.type] || [];
    const defaultExerciseRoles = {};
    block.exercises.forEach((ex, i) => {
      if (ex.id) defaultExerciseRoles[ex.id] = roles[i] ?? roles[0];
    });
    onChange({
      ...block,
      execution: { ...executionObject, exerciseRoles: defaultExerciseRoles },
    });
  };

  // Cicla al siguiente rol válido para un ejercicio dado
  const cycleRole = (exerciseId) => {
    const execType = block.execution?.type;
    if (!execType) return;
    const validRoles = BLOCK_ROLE_CONFIG[execType] || [];
    if (validRoles.length <= 1) return;

    const currentRole = block.execution?.exerciseRoles?.[exerciseId];
    const currentIndex = validRoles.indexOf(currentRole);
    const nextRole = validRoles[(currentIndex + 1) % validRoles.length];

    onChange({
      ...block,
      execution: {
        ...block.execution,
        exerciseRoles: {
          ...(block.execution?.exerciseRoles || {}),
          [exerciseId]: nextRole,
        },
      },
    });
  };

  // ── Derived execution state ──────────────────────────────────────────────────
  const execType = block.execution?.type;
  const execLabel = execType
    ? (EXECUTION_PRESET_DEFAULTS[execType]?.label ?? execType)
    : null;

  // Mostrar chips de rol: sólo si execution existe, el tipo tiene >1 rol y hay >=2 ejercicios
  const validRoles = execType ? (BLOCK_ROLE_CONFIG[execType] || []) : [];
  const showRoleChips = execType && validRoles.length > 1 && block.exercises.length >= 2;

  // Rellena ÚNICAMENTE los roles que falten cuando se añaden ejercicios DESPUÉS de
  // haber elegido el tipo de ejecución. Nunca sobreescribe roles asignados manualmente.
  useEffect(() => {
    const currentExecType = block.execution?.type;
    if (!currentExecType) return;
    const roles = BLOCK_ROLE_CONFIG[currentExecType] || [];
    if (roles.length === 0) return;

    const currentRoles = block.execution?.exerciseRoles || {};
    const hasMissing = block.exercises.some(ex => ex.id && !(ex.id in currentRoles));
    if (!hasMissing) return;

    const updatedRoles = { ...currentRoles };
    block.exercises.forEach((ex, globalIndex) => {
      if (ex.id && !(ex.id in updatedRoles)) {
        updatedRoles[ex.id] = roles[globalIndex % roles.length];
      }
    });

    onChange({
      ...block,
      execution: { ...block.execution, exerciseRoles: updatedRoles },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.exercises.length, block.execution?.type]);

  return (
    <div className="bg-surface border border-border rounded-2xl mb-6">
      {/* ── HEADER DEL BLOQUE ── */}
      <div className="px-3 py-3 border-b border-border/50 bg-black/10 flex items-center justify-between gap-2 relative z-20 rounded-t-2xl">
        <BlockTypeSelector
          value={block.type}
          color={color}
          onChange={(newType) => {
            onChange({ ...block, type: newType.id, color: newType.color });
          }}
        />

        <input
          type="text"
          value={block.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Nombre del bloque"
          className="flex-1 min-w-0 bg-transparent outline-none font-bold text-sm px-2 text-text placeholder:text-muted/40"
        />

        <div className="flex items-center gap-1 shrink-0 bg-bg px-2 py-1 rounded-lg border border-border">
          <input
            type="text"
            value={block.duration || ''}
            onChange={(e) => updateField('duration', e.target.value)}
            placeholder="0"
            className="w-6 text-center bg-transparent outline-none text-xs font-bold text-text"
          />
          <span className="text-[10px] font-black text-muted">min</span>
        </div>

        {/* ── MENÚ CONTEXTUAL ── */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 text-muted hover:text-text rounded-md active:bg-white/5 transition-colors"
          >
            <MoreVertical size={18} />
          </button>
          
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={() => { setMenuOpen(false); onDuplicate(); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-text hover:bg-white/5 transition-colors"
                >
                  <Copy size={16} className="text-muted" /> Duplicar Bloque
                </button>
                <button
                  disabled={isFirst}
                  onClick={() => { setMenuOpen(false); onMoveUp(); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-text hover:bg-white/5 transition-colors disabled:opacity-30"
                >
                  <ArrowUp size={16} className="text-muted" /> Mover Arriba
                </button>
                <button
                  disabled={isLast}
                  onClick={() => { setMenuOpen(false); onMoveDown(); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-text hover:bg-white/5 transition-colors disabled:opacity-30"
                >
                  <ArrowDown size={16} className="text-muted" /> Mover Abajo
                </button>
                <div className="h-px bg-border/50 my-1" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    if (window.confirm('¿Borrar bloque entero?')) onDelete();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-accent hover:bg-accent/10 transition-colors"
                >
                  <Trash2 size={16} /> Eliminar Bloque
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── ESTRUCTURA DE EJECUCIÓN ── */}
      <div className="px-3 py-2 bg-black/[0.03] border-b border-border/20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Zap size={12} className="text-muted shrink-0" />
          <span className="text-[10px] font-black text-muted uppercase tracking-wider">Ejecución:</span>
        </div>
        <button
          onClick={() => setExecSelectorOpen(true)}
          className={
            execLabel
              ? 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border transition-all bg-accent/10 border-accent/40 text-accent'
              : 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border transition-all border-border text-muted hover:text-text hover:border-muted'
          }
        >
          {execLabel ?? 'Serie Recta (por defecto)'}
          <span className="text-muted/60 normal-case font-normal">▾</span>
        </button>
      </div>

      {/* ── OBJETIVO DEL BLOQUE ── */}
      <div className="px-3 py-2 bg-black/5 border-b border-border/30 flex items-center justify-between gap-2">
        <span className="text-[10px] font-black text-muted uppercase tracking-wider">Objetivo del bloque:</span>
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
          {[
            { id: 'gym_fuerza', label: 'Fuerza' },
            { id: 'gym_hipertrofia', label: 'Hipertrofia' },
            { id: 'gym_potencia', label: 'Potencia' },
            { id: 'resistencia', label: 'Resistencia' }
          ].map(g => {
            const active = (block.goal || 'gym_hipertrofia') === g.id;
            return (
              <button
                key={g.id}
                onClick={() => updateField('goal', g.id)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                  active 
                    ? 'bg-[#FF6B00] text-white shadow-sm border border-transparent'
                    : 'bg-surface border border-border text-muted hover:text-text'
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── EJERCICIOS DEL BLOQUE ── */}
      <div className="p-3 flex flex-col gap-2">
        {block.exercises.map((ex, i) => {
          // Determinar el rol actual de este ejercicio (solo si showRoleChips).
          // exerciseRoles ya viene poblado desde handleExecutionChange;
          // el ?? validRoles[0] cubre ejercicios añadidos DESPUÉS de elegir el tipo.
          const roleLabel = showRoleChips
            ? (block.execution?.exerciseRoles?.[ex.id] ?? validRoles[0])
            : null;

          return (
            <div key={ex.id || `ex-${i}`} className="flex flex-col gap-1">
              {/* Chip de rol — solo cuando aplica (execution con múltiples roles y >=2 ejercicios) */}
              {showRoleChips && (
                <button
                  onClick={() => cycleRole(ex.id)}
                  className="self-start flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-border bg-bg text-muted hover:border-accent hover:text-accent transition-colors active:scale-95"
                  title="Toca para cambiar el rol"
                >
                  {roleLabel}
                  <span className="opacity-50">↻</span>
                </button>
              )}
              <EditableExercise
                exercise={ex}
                onChange={(updatedEx) => handleExerciseChange(i, updatedEx)}
                onDelete={() => handleDeleteExercise(i)}
              />
            </div>
          );
        })}

        <button
          onClick={() => onAddExerciseClick(blockIndex)}
          className="flex items-center justify-center gap-2 w-full py-3 mt-1 rounded-xl border border-dashed border-border text-muted text-sm font-bold hover:text-blue hover:border-blue/50 transition-colors active:scale-[0.98]"
        >
          <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center">
            <Plus size={12} strokeWidth={3} />
          </div>
          Añadir Ejercicio
        </button>
      </div>

      {/* ── EXECUTION TYPE SELECTOR (bottom-sheet) ── */}
      <ExecutionTypeSelector
        open={execSelectorOpen}
        value={execType ?? null}
        onClose={() => setExecSelectorOpen(false)}
        onChange={handleExecutionChange}
      />
    </div>
  );
}
