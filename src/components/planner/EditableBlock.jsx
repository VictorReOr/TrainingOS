import React, { useState } from 'react';
import { MoreVertical, Copy, Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import BlockTypeSelector, { PREDEFINED_TYPES } from '../timer/BlockTypeSelector';
import EditableExercise from './EditableExercise';

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

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
      {/* ── HEADER DEL BLOQUE ── */}
      <div className="px-3 py-3 border-b border-border/50 bg-black/10 flex items-center justify-between gap-2 relative">
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
              <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
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
        {block.exercises.map((ex, i) => (
          <EditableExercise
            key={ex.id || `ex-${i}`}
            exercise={ex}
            onChange={(updatedEx) => handleExerciseChange(i, updatedEx)}
            onDelete={() => handleDeleteExercise(i)}
          />
        ))}

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
    </div>
  );
}
