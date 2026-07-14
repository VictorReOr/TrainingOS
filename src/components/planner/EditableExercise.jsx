import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Minus, Plus } from 'lucide-react';

const REST_PRESETS = [30, 60, 90, 120, 180];

export default function EditableExercise({ exercise, onChange, onDelete }) {
  const [expanded, setExpanded] = useState(!exercise.name);

  // Helper para generar el string de resumen
  const getSummary = () => {
    let parts = [];
    if (exercise.series) {
      if (exercise.duration) parts.push(`${exercise.series} × ${exercise.duration}`);
      else parts.push(`${exercise.series} × ${exercise.reps || '?'}`);
    }
    if (exercise.loadRef) parts.push(`${exercise.loadRef}kg`);
    if (exercise.restSeconds) parts.push(`${exercise.restSeconds}s`);
    return parts.join(' · ') || 'Sin configurar';
  };

  const handleChange = (field, value) => {
    onChange({ ...exercise, [field]: value });
  };

  return (
    <div className="bg-bg border border-border rounded-xl overflow-hidden transition-all">
      {/* ── HEADER COLAPSADO / TOCABLE ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none bg-surface/30 hover:bg-surface/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{exercise.name || 'Nuevo Ejercicio'}</p>
          {!expanded && (
            <p className="text-xs text-muted mt-0.5 truncate">{getSummary()}</p>
          )}
        </div>
        <button className="p-1 text-muted hover:text-text transition-colors">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* ── CUERPO EXPANDIDO (MODO EDICIÓN) ── */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-border/50">
          {/* Nombre */}
          <div>
            <label className="block text-[10px] font-black text-muted tracking-widest mb-1">NOMBRE</label>
            <input
              type="text"
              value={exercise.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm font-bold placeholder:text-muted/50 focus:border-blue outline-none"
              placeholder="Ej: Sentadilla Trasera"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Series (Stepper) */}
            <div>
              <label className="block text-[10px] font-black text-muted tracking-widest mb-1">SERIES</label>
              <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden h-[38px]">
                <button
                  onClick={() => handleChange('series', Math.max(1, (parseInt(exercise.series) || 1) - 1).toString())}
                  className="w-10 flex items-center justify-center text-muted hover:text-text active:bg-white/5"
                >
                  <Minus size={14} />
                </button>
                <div className="flex-1 text-center font-bold text-sm select-none">
                  {exercise.series || 1}
                </div>
                <button
                  onClick={() => handleChange('series', ((parseInt(exercise.series) || 1) + 1).toString())}
                  className="w-10 flex items-center justify-center text-muted hover:text-text active:bg-white/5"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Reps */}
            <div>
              <label className="block text-[10px] font-black text-muted tracking-widest mb-1">REPS</label>
              <input
                type="text"
                value={exercise.reps}
                onChange={(e) => handleChange('reps', e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm font-bold text-center placeholder:text-muted/50 focus:border-blue outline-none h-[38px]"
                placeholder="Ej: 8-12, al fallo"
              />
            </div>

            {/* Duración (Opcional, para tiempo) */}
            <div>
              <label className="block text-[10px] font-black text-muted tracking-widest mb-1">DURACIÓN</label>
              <input
                type="text"
                value={exercise.duration || ''}
                onChange={(e) => handleChange('duration', e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm font-bold text-center placeholder:text-muted/50 focus:border-blue outline-none h-[38px]"
                placeholder="MM:SS"
              />
            </div>

            {/* Carga Ref (Kg) */}
            <div>
              <label className="block text-[10px] font-black text-muted tracking-widest mb-1">CARGA REF.</label>
              <div className="relative">
                <input
                  type="number"
                  value={exercise.loadRef || ''}
                  onChange={(e) => handleChange('loadRef', e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg pl-3 pr-8 py-2 text-sm font-bold text-center placeholder:text-muted/50 focus:border-blue outline-none h-[38px]"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted font-bold pointer-events-none">kg</span>
              </div>
            </div>

            {/* Tempo */}
            <div>
              <label className="block text-[10px] font-black text-muted tracking-widest mb-1">TEMPO</label>
              <input
                type="text"
                value={exercise.tempo || ''}
                onChange={(e) => handleChange('tempo', e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm font-bold text-center placeholder:text-muted/50 focus:border-blue outline-none h-[38px]"
                placeholder="3-0-1-0"
              />
            </div>
            
            {/* Peso Sugerido */}
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-muted tracking-widest mb-1">PESO SUGERIDO</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={exercise.suggestedWeight?.min || ''}
                    onChange={(e) => handleChange('suggestedWeight', { ...exercise.suggestedWeight, min: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full bg-surface border border-border rounded-lg pl-3 pr-8 py-2 text-sm font-bold text-center placeholder:text-muted/50 focus:border-blue outline-none h-[38px]"
                    placeholder="70"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted font-bold pointer-events-none">kg</span>
                </div>
                <span className="text-muted font-bold">→</span>
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={exercise.suggestedWeight?.max || ''}
                    onChange={(e) => handleChange('suggestedWeight', { ...exercise.suggestedWeight, max: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full bg-surface border border-border rounded-lg pl-3 pr-8 py-2 text-sm font-bold text-center placeholder:text-muted/50 focus:border-blue outline-none h-[38px]"
                    placeholder="80"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted font-bold pointer-events-none">kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Descanso */}
          <div>
            <label className="block text-[10px] font-black text-muted tracking-widest mb-1">DESCANSO (segundos)</label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {REST_PRESETS.map(secs => (
                <button
                  key={secs}
                  onClick={() => handleChange('restSeconds', secs)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border shrink-0 transition-colors ${
                    exercise.restSeconds === secs 
                      ? 'bg-blue/20 border-blue/40 text-blue' 
                      : 'bg-surface border-border text-muted hover:text-text'
                  }`}
                >
                  {secs}s
                </button>
              ))}
              <div className="flex items-center ml-2 border-l border-border pl-2 shrink-0">
                 <input
                   type="number"
                   value={exercise.restSeconds || ''}
                   onChange={(e) => handleChange('restSeconds', parseInt(e.target.value) || 0)}
                   className="w-16 bg-surface border border-border rounded-lg px-2 py-1.5 text-xs font-bold text-center focus:border-blue outline-none"
                   placeholder="Custom"
                 />
              </div>
            </div>
          </div>

          {/* Test de Rendimiento */}
          <div className="bg-surface/30 border border-border/50 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text">¿Es un Test de Rendimiento?</span>
              <button
                type="button"
                onClick={() => handleChange('isTest', !exercise.isTest)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                  exercise.isTest ? 'bg-[#FF6B00]' : 'bg-border'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-surface rounded-full shadow transition-transform duration-200 ${
                    exercise.isTest ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {exercise.isTest && (
              <div className="flex flex-col gap-2 animate-fade-in">
                <label className="block text-[10px] font-black text-muted tracking-widest">TIPO DE TEST</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'AMRAP', label: 'AMRAP' },
                    { id: '1RM', label: '1RM Real' },
                    { id: '3RM', label: '3RM' },
                    { id: '5RM', label: '5RM' },
                    { id: 'Cooper', label: 'Cooper' },
                    { id: 'Beep', label: 'Beep Test' }
                  ].map(t => {
                    const active = (exercise.testType || 'AMRAP') === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleChange('testType', t.id)}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                          active 
                            ? 'bg-[#FF6B00]/10 border-[#FF6B00]/50 text-[#FF6B00]'
                            : 'bg-surface border-border text-muted hover:text-text'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="block text-[10px] font-black text-muted tracking-widest mb-1">NOTAS (Opcional)</label>
            <input
              type="text"
              value={exercise.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted/50 focus:border-[#FF6B00] outline-none"
              placeholder="Instrucciones especiales..."
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                if (window.confirm('¿Eliminar este ejercicio?')) {
                  onDelete();
                }
              }}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-accent hover:bg-accent/10 rounded-lg transition-colors"
            >
              <Trash2 size={14} /> Eliminar Ejercicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
